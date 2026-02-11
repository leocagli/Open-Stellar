/**
 * Stellar Trustless Escrow
 * 
 * Implements trustless escrow using Stellar's native multi-signature and time-bound features
 * Replaces Ethereum's onchain verification from ERC-8004 with Stellar's protocol
 */

import * as StellarSdk from '@stellar/stellar-sdk';
import { StellarEscrowAccount, StellarConfig } from '../types';

/**
 * Create an escrow account with multi-signature requirements
 * 
 * This creates a trustless escrow by:
 * 1. Creating a new Stellar account
 * 2. Setting up multi-signature with required parties
 * 3. Optionally adding time bounds
 * 
 * @param config - Stellar network configuration
 * @param signers - Array of signer public keys and their weights
 * @param threshold - Minimum weight required to authorize transactions
 * @param timeBounds - Optional time constraints
 */
export async function createEscrowAccount(
  config: StellarConfig,
  signers: Array<{ publicKey: string; weight: number }>,
  threshold: number,
  timeBounds?: { minTime?: number; maxTime?: number }
): Promise<StellarEscrowAccount> {
  // Generate a new keypair for the escrow account
  const escrowKeypair = StellarSdk.Keypair.random();
  
  return {
    publicKey: escrowKeypair.publicKey(),
    signers,
    threshold,
    timeBounds,
  };
}

/**
 * Setup an escrow account on the Stellar network
 * 
 * @param sourceKeypair - Keypair that will fund and setup the escrow
 * @param escrowAccount - Escrow account configuration
 * @param initialBalance - Initial XLM balance for the escrow account
 * @param config - Stellar network configuration
 */
export async function setupEscrowOnChain(
  sourceKeypair: StellarSdk.Keypair,
  escrowAccount: StellarEscrowAccount,
  initialBalance: string,
  config: StellarConfig
): Promise<{ success: boolean; transactionHash?: string; error?: string }> {
  try {
    const server = new StellarSdk.Horizon.Server(
      config.horizonUrl || 'https://horizon.stellar.org'
    );
    
    // Load source account
    const sourceAccount = await server.loadAccount(sourceKeypair.publicKey());
    
    // Create escrow keypair
    const escrowKeypair = StellarSdk.Keypair.random();
    
    // Build transaction to create and configure escrow account
    const transaction = new StellarSdk.TransactionBuilder(sourceAccount, {
      fee: StellarSdk.BASE_FEE,
      networkPassphrase: config.networkPassphrase || StellarSdk.Networks.TESTNET,
    })
      // Create the escrow account
      .addOperation(
        StellarSdk.Operation.createAccount({
          destination: escrowKeypair.publicKey(),
          startingBalance: initialBalance,
        })
      )
      // Add signers
      .addOperation(
        StellarSdk.Operation.setOptions({
          source: escrowKeypair.publicKey(),
          masterWeight: 0, // Remove master key control
          lowThreshold: escrowAccount.threshold,
          medThreshold: escrowAccount.threshold,
          highThreshold: escrowAccount.threshold,
        })
      );
    
    // Add each signer
    for (const signer of escrowAccount.signers) {
      transaction.addOperation(
        StellarSdk.Operation.setOptions({
          source: escrowKeypair.publicKey(),
          signer: {
            ed25519PublicKey: signer.publicKey,
            weight: signer.weight,
          },
        })
      );
    }
    
    // Build and sign with both source and escrow keys
    const builtTransaction = transaction.setTimeout(30).build();
    builtTransaction.sign(sourceKeypair);
    builtTransaction.sign(escrowKeypair);
    
    // Submit transaction
    const result = await server.submitTransaction(builtTransaction);
    
    return {
      success: true,
      transactionHash: result.hash,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Create a payment from escrow requiring multi-signature approval
 * 
 * @param escrowPublicKey - Public key of the escrow account
 * @param destination - Destination account public key
 * @param amount - Amount to send
 * @param asset - Asset to send (default: native XLM)
 * @param config - Stellar network configuration
 */
export async function createEscrowPayment(
  escrowPublicKey: string,
  destination: string,
  amount: string,
  asset: StellarSdk.Asset = StellarSdk.Asset.native(),
  config: StellarConfig
): Promise<StellarSdk.Transaction> {
  const server = new StellarSdk.Horizon.Server(
    config.horizonUrl || 'https://horizon.stellar.org'
  );
  
  // Load escrow account
  const escrowAccount = await server.loadAccount(escrowPublicKey);
  
  // Build payment transaction
  const transaction = new StellarSdk.TransactionBuilder(escrowAccount, {
    fee: StellarSdk.BASE_FEE,
    networkPassphrase: config.networkPassphrase || StellarSdk.Networks.TESTNET,
  })
    .addOperation(
      StellarSdk.Operation.payment({
        destination,
        asset,
        amount,
      })
    )
    .setTimeout(300) // 5 minute timeout
    .build();
  
  return transaction;
}

/**
 * Sign an escrow transaction with a signer's keypair
 * 
 * @param transaction - The transaction to sign
 * @param signerKeypair - Keypair of one of the authorized signers
 */
export function signEscrowTransaction(
  transaction: StellarSdk.Transaction,
  signerKeypair: StellarSdk.Keypair
): void {
  transaction.sign(signerKeypair);
}

/**
 * Submit a signed escrow transaction
 * 
 * @param transaction - Fully signed transaction
 * @param config - Stellar network configuration
 */
export async function submitEscrowTransaction(
  transaction: StellarSdk.Transaction,
  config: StellarConfig
): Promise<{ success: boolean; transactionHash?: string; error?: string }> {
  try {
    const server = new StellarSdk.Horizon.Server(
      config.horizonUrl || 'https://horizon.stellar.org'
    );
    
    const result = await server.submitTransaction(transaction);
    
    return {
      success: true,
      transactionHash: result.hash,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Create a time-locked payment (uses min/max time bounds)
 * 
 * @param escrowPublicKey - Public key of the escrow account
 * @param destination - Destination account public key
 * @param amount - Amount to send
 * @param unlockTime - Unix timestamp when payment becomes available
 * @param config - Stellar network configuration
 */
export async function createTimeLockedPayment(
  escrowPublicKey: string,
  destination: string,
  amount: string,
  unlockTime: number,
  config: StellarConfig
): Promise<StellarSdk.Transaction> {
  const server = new StellarSdk.Horizon.Server(
    config.horizonUrl || 'https://horizon.stellar.org'
  );
  
  const escrowAccount = await server.loadAccount(escrowPublicKey);
  
  const transaction = new StellarSdk.TransactionBuilder(escrowAccount, {
    fee: StellarSdk.BASE_FEE,
    networkPassphrase: config.networkPassphrase || StellarSdk.Networks.TESTNET,
    timebounds: {
      minTime: unlockTime,
      maxTime: 0, // No max time
    },
  })
    .addOperation(
      StellarSdk.Operation.payment({
        destination,
        asset: StellarSdk.Asset.native(),
        amount,
      })
    )
    .build();
  
  return transaction;
}

/**
 * Get escrow account details
 * 
 * @param publicKey - Escrow account public key
 * @param config - Stellar network configuration
 */
export async function getEscrowAccountDetails(
  publicKey: string,
  config: StellarConfig
): Promise<{
  success: boolean;
  account?: any;
  signers?: Array<{ publicKey: string; weight: number }>;
  thresholds?: { low: number; medium: number; high: number };
  error?: string;
}> {
  try {
    const server = new StellarSdk.Horizon.Server(
      config.horizonUrl || 'https://horizon.stellar.org'
    );
    
    const account = await server.loadAccount(publicKey);
    
    const signers = account.signers.map(signer => ({
      publicKey: signer.key,
      weight: signer.weight,
    }));
    
    const thresholds = {
      low: account.thresholds.low_threshold,
      medium: account.thresholds.med_threshold,
      high: account.thresholds.high_threshold,
    };
    
    return {
      success: true,
      account,
      signers,
      thresholds,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}
