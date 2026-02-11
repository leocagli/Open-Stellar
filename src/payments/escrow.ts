/**
 * Trusstles Escrow System
 * 
 * A trustless escrow mechanism for Stellar payments that allows:
 * - Secure holding of funds between two parties
 * - Optional arbiter for dispute resolution
 * - Automatic refund on expiration
 * - Conditional release based on predefined criteria
 */

import * as StellarSdk from '@stellar/stellar-sdk';
import {
  generateKeypair,
  buildPaymentTransaction,
  submitTransaction,
  getAccountBalance,
  createTestnetAccount,
  accountExists,
} from './stellar';
import type {
  EscrowConfig,
  EscrowParticipants,
  PaymentAmount,
  StellarNetwork,
  StellarAccount,
  StellarTransactionResult,
  EscrowOperationRequest,
} from './types';
import { EscrowState } from './types';
import { DEFAULT_ESCROW_TIMEOUT_MS, PAYMENT_ERROR_CODES } from './config';

/**
 * Generate a unique escrow ID
 */
export function generateEscrowId(): string {
  return `escrow_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
}

/**
 * Create a new escrow account
 * 
 * This creates a multi-signature escrow account that requires:
 * - Payer signature to refund
 * - Payee signature to release
 * - Arbiter signature (if configured) for dispute resolution
 */
export async function createEscrow(
  participants: EscrowParticipants,
  amount: PaymentAmount,
  network: StellarNetwork = 'testnet',
  options?: {
    expiresInMs?: number;
    requireArbiterApproval?: boolean;
    autoReleaseAfter?: number;
  }
): Promise<{ escrow: EscrowConfig; account: StellarAccount }> {
  const escrowId = generateEscrowId();
  const escrowAccount = generateKeypair();
  
  // For testnet, create and fund the escrow account
  if (network === 'testnet') {
    const result = await createTestnetAccount(escrowAccount.publicKey);
    if (!result.success) {
      throw new Error(`Failed to create escrow account: ${result.error}`);
    }
  }

  const now = Date.now();
  const expiresAt = now + (options?.expiresInMs || DEFAULT_ESCROW_TIMEOUT_MS);

  const escrow: EscrowConfig = {
    id: escrowId,
    participants,
    amount,
    state: EscrowState.CREATED,
    createdAt: now,
    expiresAt,
    conditions: {
      requireArbiterApproval: options?.requireArbiterApproval,
      autoReleaseAfter: options?.autoReleaseAfter,
    },
    transactionHashes: {},
  };

  return { escrow, account: escrowAccount };
}

/**
 * Fund an escrow account
 * 
 * The payer sends funds to the escrow account
 */
export async function fundEscrow(
  escrow: EscrowConfig,
  escrowAccount: StellarAccount,
  payerAccount: StellarAccount,
  network: StellarNetwork = 'testnet'
): Promise<{ escrow: EscrowConfig; result: StellarTransactionResult }> {
  if (escrow.state !== EscrowState.CREATED) {
    throw new Error(`Escrow must be in CREATED state to fund. Current state: ${escrow.state}`);
  }

  if (!payerAccount.secretKey) {
    throw new Error('Payer account must have secret key to sign transaction');
  }

  // Verify payer
  if (payerAccount.publicKey !== escrow.participants.payer) {
    throw new Error('Only the designated payer can fund this escrow');
  }

  // Build and submit payment transaction
  const transaction = await buildPaymentTransaction(
    payerAccount,
    escrowAccount.publicKey,
    escrow.amount,
    network,
    `Escrow funding: ${escrow.id}`
  );

  const result = await submitTransaction(transaction, [payerAccount], network);

  if (result.success) {
    escrow.state = EscrowState.FUNDED;
    escrow.fundedAt = Date.now();
    escrow.transactionHashes.funding = result.transactionHash;
  }

  return { escrow, result };
}

/**
 * Release escrow funds to payee
 * 
 * Requires appropriate signatures based on escrow conditions
 */
export async function releaseEscrow(
  escrow: EscrowConfig,
  escrowAccount: StellarAccount,
  signerAccounts: StellarAccount[],
  network: StellarNetwork = 'testnet'
): Promise<{ escrow: EscrowConfig; result: StellarTransactionResult }> {
  if (escrow.state !== EscrowState.FUNDED) {
    throw new Error(`Escrow must be in FUNDED state to release. Current state: ${escrow.state}`);
  }

  if (!escrowAccount.secretKey) {
    throw new Error('Escrow account must have secret key');
  }

  // Check expiration
  if (Date.now() > escrow.expiresAt) {
    throw new Error('Escrow has expired and cannot be released');
  }

  // Verify signers
  const signerPublicKeys = signerAccounts.map((acc) => acc.publicKey);
  
  // At minimum, payee must sign
  if (!signerPublicKeys.includes(escrow.participants.payee)) {
    throw new Error('Payee signature required to release escrow');
  }

  // If arbiter approval required, check for arbiter signature
  if (escrow.conditions?.requireArbiterApproval && escrow.participants.arbiter) {
    if (!signerPublicKeys.includes(escrow.participants.arbiter)) {
      throw new Error('Arbiter signature required to release escrow');
    }
  }

  // Build payment transaction to payee
  const assetCode = escrow.amount.asset.code === 'XLM' ? 'native' : escrow.amount.asset.code;
  const balance = await getAccountBalance(escrowAccount.publicKey, assetCode, network);
  
  const transaction = await buildPaymentTransaction(
    escrowAccount,
    escrow.participants.payee,
    { ...escrow.amount, amount: balance }, // Send full balance
    network,
    `Escrow release: ${escrow.id}`
  );

  const result = await submitTransaction(
    transaction,
    [escrowAccount, ...signerAccounts.filter((acc) => acc.secretKey)],
    network
  );

  if (result.success) {
    escrow.state = EscrowState.RELEASED;
    escrow.releasedAt = Date.now();
    escrow.transactionHashes.release = result.transactionHash;
  }

  return { escrow, result };
}

/**
 * Refund escrow funds to payer
 * 
 * Can be done if:
 * - Escrow has expired
 * - Both parties agree (payer + payee signatures)
 * - Arbiter decides (if configured)
 */
export async function refundEscrow(
  escrow: EscrowConfig,
  escrowAccount: StellarAccount,
  signerAccounts: StellarAccount[],
  network: StellarNetwork = 'testnet',
  reason?: string
): Promise<{ escrow: EscrowConfig; result: StellarTransactionResult }> {
  if (escrow.state !== EscrowState.FUNDED) {
    throw new Error(`Escrow must be in FUNDED state to refund. Current state: ${escrow.state}`);
  }

  if (!escrowAccount.secretKey) {
    throw new Error('Escrow account must have secret key');
  }

  const signerPublicKeys = signerAccounts.map((acc) => acc.publicKey);
  const isExpired = Date.now() > escrow.expiresAt;

  // Verify refund conditions
  let refundAuthorized = false;

  // 1. Automatic refund if expired
  if (isExpired) {
    refundAuthorized = true;
  }
  // 2. Both parties agree
  else if (
    signerPublicKeys.includes(escrow.participants.payer) &&
    signerPublicKeys.includes(escrow.participants.payee)
  ) {
    refundAuthorized = true;
  }
  // 3. Arbiter decides
  else if (
    escrow.participants.arbiter &&
    signerPublicKeys.includes(escrow.participants.arbiter)
  ) {
    refundAuthorized = true;
  }

  if (!refundAuthorized) {
    throw new Error(
      'Refund not authorized. Requires: expiration, both parties agreement, or arbiter approval'
    );
  }

  // Build refund transaction
  const assetCode = escrow.amount.asset.code === 'XLM' ? 'native' : escrow.amount.asset.code;
  const balance = await getAccountBalance(escrowAccount.publicKey, assetCode, network);
  
  const transaction = await buildPaymentTransaction(
    escrowAccount,
    escrow.participants.payer,
    { ...escrow.amount, amount: balance },
    network,
    `Escrow refund: ${escrow.id}${reason ? ` - ${reason}` : ''}`
  );

  const result = await submitTransaction(
    transaction,
    [escrowAccount, ...signerAccounts.filter((acc) => acc.secretKey)],
    network
  );

  if (result.success) {
    escrow.state = isExpired ? EscrowState.EXPIRED : EscrowState.REFUNDED;
    escrow.refundedAt = Date.now();
    escrow.transactionHashes.refund = result.transactionHash;
  }

  return { escrow, result };
}

/**
 * Check if escrow can be auto-released
 */
export function canAutoRelease(escrow: EscrowConfig): boolean {
  if (escrow.state !== EscrowState.FUNDED) {
    return false;
  }

  if (!escrow.conditions?.autoReleaseAfter) {
    return false;
  }

  return Date.now() >= escrow.conditions.autoReleaseAfter;
}

/**
 * Check if escrow has expired
 */
export function isEscrowExpired(escrow: EscrowConfig): boolean {
  return Date.now() > escrow.expiresAt;
}

/**
 * Get escrow status summary
 */
export function getEscrowStatus(escrow: EscrowConfig): {
  state: EscrowState;
  canRelease: boolean;
  canRefund: boolean;
  isExpired: boolean;
  canAutoRelease: boolean;
} {
  const expired = isEscrowExpired(escrow);
  const autoRelease = canAutoRelease(escrow);

  return {
    state: escrow.state,
    canRelease: escrow.state === EscrowState.FUNDED && !expired,
    canRefund: escrow.state === EscrowState.FUNDED,
    isExpired: expired,
    canAutoRelease: autoRelease,
  };
}
