/**
 * Freighter Wallet Integration
 * Handles wallet connection, authentication, and transaction signing
 */

import freighterApi from '@stellar/freighter-api';
import * as StellarSdk from '@stellar/stellar-sdk';
import { STELLAR_CONFIG } from '../config';

const { isConnected, getAddress, signTransaction, requestAccess, setAllowed } = freighterApi;

export interface FreighterWalletState {
  isConnected: boolean;
  publicKey: string | null;
  isAllowed: boolean;
}

export class FreighterService {
  private state: FreighterWalletState = {
    isConnected: false,
    publicKey: null,
    isAllowed: false,
  };

  /**
   * Check if Freighter extension is installed
   */
  async isFreighterInstalled(): Promise<boolean> {
    try {
      const result = await isConnected();
      return result && !result.error;
    } catch {
      return false;
    }
  }

  /**
   * Request access to user's Freighter wallet
   */
  async connect(): Promise<string> {
    try {
      // Request access
      const accessResult = await requestAccess();
      
      if (accessResult.error || !accessResult) {
        throw new Error('User denied wallet access');
      }

      // Get public key (address)
      const addressResult = await getAddress();
      
      if (addressResult.error || !addressResult.address) {
        throw new Error('Failed to retrieve public key');
      }

      this.state = {
        isConnected: true,
        publicKey: addressResult.address,
        isAllowed: true,
      };

      return addressResult.address;
    } catch (error) {
      throw new Error(`Failed to connect to Freighter: ${error}`);
    }
  }

  /**
   * Disconnect wallet
   */
  async disconnect(): Promise<void> {
    await setAllowed();
    this.state = {
      isConnected: false,
      publicKey: null,
      isAllowed: false,
    };
  }

  /**
   * Get current wallet state
   */
  getState(): FreighterWalletState {
    return { ...this.state };
  }

  /**
   * Get connected public key
   */
  getPublicKey(): string | null {
    return this.state.publicKey;
  }

  /**
   * Sign a transaction with Freighter
   */
  async signTransaction(transaction: StellarSdk.Transaction): Promise<StellarSdk.Transaction> {
    if (!this.state.isConnected || !this.state.publicKey) {
      throw new Error('Wallet not connected');
    }

    try {
      const xdr = transaction.toXDR();
      const result = await signTransaction(xdr, {
        networkPassphrase: STELLAR_CONFIG.NETWORK_PASSPHRASE,
        address: this.state.publicKey,
      });

      if (result.error) {
        throw new Error(result.error);
      }

      return StellarSdk.TransactionBuilder.fromXDR(
        result.signedTxXdr,
        STELLAR_CONFIG.NETWORK_PASSPHRASE
      ) as StellarSdk.Transaction;
    } catch (error) {
      throw new Error(`Failed to sign transaction: ${error}`);
    }
  }

  /**
   * Sign a message with Freighter (for authentication)
   */
  async signMessage(message: string): Promise<string> {
    if (!this.state.publicKey) {
      throw new Error('Wallet not connected');
    }

    try {
      // Create a simple transaction as a message signature
      const account = new StellarSdk.Account(this.state.publicKey, '0');
      const transaction = new StellarSdk.TransactionBuilder(account, {
        fee: STELLAR_CONFIG.BASE_FEE,
        networkPassphrase: STELLAR_CONFIG.NETWORK_PASSPHRASE,
      })
        .addOperation(
          StellarSdk.Operation.manageData({
            name: 'auth',
            value: Buffer.from(message),
          })
        )
        .setTimeout(STELLAR_CONFIG.TIMEOUT)
        .build();

      const signedTx = await this.signTransaction(transaction);
      return signedTx.toXDR();
    } catch (error) {
      throw new Error(`Failed to sign message: ${error}`);
    }
  }

  /**
   * Verify a signed message
   */
  static verifySignature(
    publicKey: string,
    message: string,
    signatureXdr: string
  ): boolean {
    try {
      const transaction = StellarSdk.TransactionBuilder.fromXDR(
        signatureXdr,
        STELLAR_CONFIG.NETWORK_PASSPHRASE
      ) as StellarSdk.Transaction;

      // Verify the transaction is signed by the claimed public key
      const hasValidSignature = transaction.signatures.some(sig => {
        const keypair = StellarSdk.Keypair.fromPublicKey(publicKey);
        const txHash = transaction.hash();
        return keypair.verify(txHash, sig.signature());
      });

      return hasValidSignature;
    } catch {
      return false;
    }
  }
}

// Export singleton instance
export const freighterService = new FreighterService();
