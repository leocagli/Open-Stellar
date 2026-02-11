/**
 * Stellar blockchain integration utilities
 */

import * as StellarSdk from '@stellar/stellar-sdk';
import type {
  StellarNetwork,
  StellarAccount,
  PaymentAmount,
  StellarTransactionResult,
} from './types';
import { getStellarConfig, STELLAR_MIN_BALANCE } from './config';

/**
 * Get Stellar Server instance for network operations
 */
export function getStellarServer(network: StellarNetwork = 'testnet'): StellarSdk.Horizon.Server {
  const config = getStellarConfig(network);
  return new StellarSdk.Horizon.Server(config.horizonUrl);
}

/**
 * Generate a new Stellar keypair
 */
export function generateKeypair(): StellarAccount {
  const keypair = StellarSdk.Keypair.random();
  return {
    publicKey: keypair.publicKey(),
    secretKey: keypair.secret(),
  };
}

/**
 * Load account from secret key
 */
export function loadAccount(secretKey: string): StellarAccount {
  const keypair = StellarSdk.Keypair.fromSecret(secretKey);
  return {
    publicKey: keypair.publicKey(),
    secretKey: keypair.secret(),
  };
}

/**
 * Check if an account exists on the network
 */
export async function accountExists(
  publicKey: string,
  network: StellarNetwork = 'testnet'
): Promise<boolean> {
  const server = getStellarServer(network);
  try {
    await server.loadAccount(publicKey);
    return true;
  } catch (error) {
    if (error instanceof Error && error.message.includes('not found')) {
      return false;
    }
    throw error;
  }
}

/**
 * Get account balance for a specific asset
 */
export async function getAccountBalance(
  publicKey: string,
  assetCode: string = 'native',
  network: StellarNetwork = 'testnet'
): Promise<string> {
  const server = getStellarServer(network);
  const account = await server.loadAccount(publicKey);
  
  const balance = account.balances.find((b) => {
    if (assetCode === 'native' && b.asset_type === 'native') {
      return true;
    }
    if (b.asset_type !== 'native' && 'asset_code' in b) {
      return b.asset_code === assetCode;
    }
    return false;
  });

  return balance?.balance || '0';
}

/**
 * Create and fund a new Stellar account (testnet only)
 */
export async function createTestnetAccount(
  publicKey: string
): Promise<StellarTransactionResult> {
  try {
    const response = await fetch(
      `https://friendbot.stellar.org?addr=${encodeURIComponent(publicKey)}`
    );
    const result = (await response.json()) as { hash?: string; ledger?: number; detail?: string };
    
    if (response.ok) {
      return {
        success: true,
        transactionHash: result.hash,
        ledger: result.ledger,
      };
    } else {
      return {
        success: false,
        error: result.detail || 'Failed to create account',
      };
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Build payment transaction
 */
export async function buildPaymentTransaction(
  from: StellarAccount,
  to: string,
  amount: PaymentAmount,
  network: StellarNetwork = 'testnet',
  memo?: string
): Promise<StellarSdk.Transaction> {
  const server = getStellarServer(network);
  const config = getStellarConfig(network);
  const sourceAccount = await server.loadAccount(from.publicKey);

  // Create asset
  const asset =
    amount.asset.code === 'XLM' || !amount.asset.issuer
      ? StellarSdk.Asset.native()
      : new StellarSdk.Asset(amount.asset.code, amount.asset.issuer);

  // Build transaction
  const transactionBuilder = new StellarSdk.TransactionBuilder(sourceAccount, {
    fee: StellarSdk.BASE_FEE,
    networkPassphrase: config.networkPassphrase,
  });

  transactionBuilder.addOperation(
    StellarSdk.Operation.payment({
      destination: to,
      asset,
      amount: amount.amount,
    })
  );

  if (memo) {
    transactionBuilder.addMemo(StellarSdk.Memo.text(memo));
  }

  transactionBuilder.setTimeout(180); // 3 minute timeout

  return transactionBuilder.build();
}

/**
 * Sign and submit transaction
 */
export async function submitTransaction(
  transaction: StellarSdk.Transaction,
  signers: StellarAccount[],
  network: StellarNetwork = 'testnet'
): Promise<StellarTransactionResult> {
  const server = getStellarServer(network);

  try {
    // Sign with all provided signers
    for (const signer of signers) {
      if (!signer.secretKey) {
        throw new Error(`Signer ${signer.publicKey} has no secret key`);
      }
      const keypair = StellarSdk.Keypair.fromSecret(signer.secretKey);
      transaction.sign(keypair);
    }

    // Submit to network
    const result = await server.submitTransaction(transaction);

    return {
      success: true,
      transactionHash: result.hash,
      ledger: result.ledger,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Transaction failed',
    };
  }
}

/**
 * Verify a payment transaction
 */
export async function verifyPayment(
  transactionHash: string,
  expectedFrom: string,
  expectedTo: string,
  expectedAmount: PaymentAmount,
  network: StellarNetwork = 'testnet'
): Promise<boolean> {
  const server = getStellarServer(network);

  try {
    const transaction = await server.transactions().transaction(transactionHash).call();
    
    // Check if transaction was successful
    if (!transaction.successful) {
      return false;
    }

    // Get operations for this transaction
    const operations = await server
      .operations()
      .forTransaction(transactionHash)
      .call();

    // Find payment operation
    const paymentOp = operations.records.find(
      (op) => op.type === 'payment'
    ) as StellarSdk.Horizon.ServerApi.PaymentOperationRecord | undefined;

    if (!paymentOp) {
      return false;
    }

    // Verify sender, receiver, and amount
    const fromMatch = paymentOp.from === expectedFrom;
    const toMatch = paymentOp.to === expectedTo;
    const amountMatch = paymentOp.amount === expectedAmount.amount;

    // Verify asset
    let assetMatch = false;
    if (expectedAmount.asset.code === 'XLM') {
      assetMatch = paymentOp.asset_type === 'native';
    } else if (paymentOp.asset_type !== 'native') {
      assetMatch =
        paymentOp.asset_code === expectedAmount.asset.code &&
        paymentOp.asset_issuer === expectedAmount.asset.issuer;
    }

    return fromMatch && toMatch && amountMatch && assetMatch;
  } catch (error) {
    console.error('Payment verification error:', error);
    return false;
  }
}

/**
 * Get transaction details
 */
export async function getTransaction(
  transactionHash: string,
  network: StellarNetwork = 'testnet'
): Promise<StellarSdk.Horizon.ServerApi.TransactionRecord | null> {
  const server = getStellarServer(network);
  
  try {
    return await server.transactions().transaction(transactionHash).call();
  } catch (error) {
    console.error('Error fetching transaction:', error);
    return null;
  }
}
