/**
 * Stellar Network Utilities
 * 
 * Provides utilities for interacting with Stellar blockchain
 */

import * as StellarSdk from '@stellar/stellar-sdk';

// Use testnet by default, can be configured via environment
// WARNING: process.env doesn't work in Cloudflare Workers
// This is a fallback for local development only
// In production, pass network config through function parameters
const STELLAR_NETWORK = process.env.STELLAR_NETWORK || 'testnet';
const STELLAR_HORIZON_URL = 
  STELLAR_NETWORK === 'mainnet' 
    ? 'https://horizon.stellar.org'
    : 'https://horizon-testnet.stellar.org';

const server = new StellarSdk.Horizon.Server(STELLAR_HORIZON_URL);

/**
 * Get the Stellar server instance
 */
export function getStellarServer(): StellarSdk.Horizon.Server {
  return server;
}

/**
 * Get the network passphrase
 */
export function getNetworkPassphrase(): string {
  return STELLAR_NETWORK === 'mainnet'
    ? StellarSdk.Networks.PUBLIC
    : StellarSdk.Networks.TESTNET;
}

/**
 * Create a new Stellar keypair
 */
export function createKeypair(): StellarSdk.Keypair {
  return StellarSdk.Keypair.random();
}

/**
 * Load a keypair from a secret key
 */
export function loadKeypair(secretKey: string): StellarSdk.Keypair {
  return StellarSdk.Keypair.fromSecret(secretKey);
}

/**
 * Validate a Stellar address
 */
export function isValidAddress(address: string): boolean {
  try {
    StellarSdk.StrKey.decodeEd25519PublicKey(address);
    return true;
  } catch {
    return false;
  }
}

/**
 * Get account balance
 */
export async function getAccountBalance(
  publicKey: string
): Promise<Array<{ asset: string; balance: string }>> {
  try {
    const account = await server.loadAccount(publicKey);
    return account.balances.map((balance) => ({
      asset: balance.asset_type === 'native' ? 'XLM' : (balance as any).asset_code,
      balance: balance.balance,
    }));
  } catch (error) {
    throw new Error(`Failed to load account: ${error}`);
  }
}

/**
 * Send a payment transaction
 */
export async function sendPayment(
  sourceKeypair: StellarSdk.Keypair,
  destination: string,
  amount: string,
  asset: string = 'XLM',
  memo?: string
): Promise<string> {
  try {
    const sourceAccount = await server.loadAccount(sourceKeypair.publicKey());
    
    let assetObj: StellarSdk.Asset;
    if (asset === 'XLM') {
      assetObj = StellarSdk.Asset.native();
    } else {
      // For custom assets, would need issuer address
      throw new Error('Custom assets not yet supported');
    }
    
    const transaction = new StellarSdk.TransactionBuilder(sourceAccount, {
      fee: StellarSdk.BASE_FEE,
      networkPassphrase: getNetworkPassphrase(),
    })
      .addOperation(
        StellarSdk.Operation.payment({
          destination,
          asset: assetObj,
          amount,
        })
      )
      .setTimeout(180);
    
    if (memo) {
      transaction.addMemo(StellarSdk.Memo.text(memo));
    }
    
    const builtTx = transaction.build();
    builtTx.sign(sourceKeypair);
    
    const result = await server.submitTransaction(builtTx);
    return result.hash;
  } catch (error) {
    throw new Error(`Failed to send payment: ${error}`);
  }
}

/**
 * Get transaction details
 */
export async function getTransaction(
  transactionHash: string
): Promise<StellarSdk.Horizon.ServerApi.TransactionRecord | null> {
  try {
    const transaction = await server.transactions().transaction(transactionHash).call();
    return transaction;
  } catch {
    return null;
  }
}

/**
 * Verify a payment transaction
 */
export async function verifyPayment(
  transactionHash: string,
  expectedDestination: string,
  expectedAmount: string,
  expectedAsset: string = 'XLM'
): Promise<boolean> {
  try {
    const tx = await getTransaction(transactionHash);
    if (!tx) return false;
    
    // Parse operations to find payment
    const operations = await server
      .operations()
      .forTransaction(transactionHash)
      .call();
    
    for (const op of operations.records) {
      if (op.type === 'payment') {
        const payment = op as any;
        const assetMatch = expectedAsset === 'XLM' 
          ? payment.asset_type === 'native'
          : payment.asset_code === expectedAsset;
        
        if (
          payment.to === expectedDestination &&
          payment.amount === expectedAmount &&
          assetMatch
        ) {
          return true;
        }
      }
    }
    
    return false;
  } catch {
    return false;
  }
}
