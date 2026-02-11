/**
 * Stellar SDK Client Wrapper
 * Provides a unified interface for interacting with Stellar network
 */

import * as StellarSdk from '@stellar/stellar-sdk';
import { STELLAR_CONFIG } from './config';

export class StellarClient {
  private server: StellarSdk.Horizon.Server;
  private networkPassphrase: string;

  constructor() {
    this.server = new StellarSdk.Horizon.Server(STELLAR_CONFIG.HORIZON_URL);
    this.networkPassphrase = STELLAR_CONFIG.NETWORK_PASSPHRASE;
  }

  /**
   * Get Horizon server instance
   */
  getServer(): StellarSdk.Horizon.Server {
    return this.server;
  }

  /**
   * Get network passphrase
   */
  getNetworkPassphrase(): string {
    return this.networkPassphrase;
  }

  /**
   * Load account from the network
   */
  async loadAccount(publicKey: string): Promise<StellarSdk.Horizon.AccountResponse> {
    try {
      return await this.server.loadAccount(publicKey);
    } catch (error) {
      throw new Error(`Failed to load account ${publicKey}: ${error}`);
    }
  }

  /**
   * Submit a transaction to the network
   */
  async submitTransaction(transaction: StellarSdk.Transaction): Promise<any> {
    try {
      return await this.server.submitTransaction(transaction);
    } catch (error) {
      throw new Error(`Failed to submit transaction: ${error}`);
    }
  }

  /**
   * Get account balance
   */
  async getBalance(publicKey: string): Promise<{ asset: string; balance: string }[]> {
    const account = await this.loadAccount(publicKey);
    return account.balances.map(balance => ({
      asset: balance.asset_type === 'native' ? 'XLM' : 
        (balance.asset_type === 'credit_alphanum4' || balance.asset_type === 'credit_alphanum12') 
          ? `${balance.asset_code}:${balance.asset_issuer}` 
          : 'unknown',
      balance: balance.balance,
    }));
  }

  /**
   * Stream account transactions
   */
  streamTransactions(
    publicKey: string,
    onTransaction: (transaction: StellarSdk.Horizon.ServerApi.TransactionRecord) => void,
    onError?: (error: any) => void
  ): () => void {
    const closeStream = this.server
      .transactions()
      .forAccount(publicKey)
      .cursor('now')
      .stream({
        onmessage: onTransaction,
        onerror: onError || ((error: any) => console.error('Transaction stream error:', error)),
      });

    return closeStream;
  }

  /**
   * Create a keypair from secret
   */
  static createKeypair(secret: string): StellarSdk.Keypair {
    return StellarSdk.Keypair.fromSecret(secret);
  }

  /**
   * Generate a new random keypair
   */
  static generateKeypair(): StellarSdk.Keypair {
    return StellarSdk.Keypair.random();
  }

  /**
   * Validate public key
   */
  static isValidPublicKey(publicKey: string): boolean {
    return StellarSdk.StrKey.isValidEd25519PublicKey(publicKey);
  }

  /**
   * Validate secret key
   */
  static isValidSecretKey(secret: string): boolean {
    return StellarSdk.StrKey.isValidEd25519SecretSeed(secret);
  }
}

// Export singleton instance
export const stellarClient = new StellarClient();
