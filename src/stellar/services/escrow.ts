/**
 * Escrow Service using Stellar Claimable Balances
 * Implements time-locked escrow functionality for P2P bot transactions
 */

import * as StellarSdk from '@stellar/stellar-sdk';
import { stellarClient } from '../client';
import { STELLAR_CONFIG } from '../config';

export interface EscrowOptions {
  amount: string;
  asset?: StellarSdk.Asset;
  claimant: string; // Public key of the claimant
  timeLock?: number; // Time in seconds until funds can be claimed
  refundTo?: string; // Optional refund address
}

export interface EscrowDetails {
  id: string;
  amount: string;
  asset: string;
  sponsor: string;
  claimant: string;
  unlockTime?: Date;
  refundAddress?: string;
  claimed: boolean;
}

export class EscrowService {
  /**
   * Create an escrow using claimable balance
   */
  async createEscrow(
    sourceKeypair: StellarSdk.Keypair,
    options: EscrowOptions
  ): Promise<{ balanceId: string; transaction: StellarSdk.Transaction }> {
    const { amount, asset, claimant, timeLock, refundTo } = options;

    // Validate inputs
    if (!StellarSdk.StrKey.isValidEd25519PublicKey(claimant)) {
      throw new Error('Invalid claimant public key');
    }

    if (parseFloat(amount) < parseFloat(STELLAR_CONFIG.ESCROW_MIN_AMOUNT)) {
      throw new Error(`Amount must be at least ${STELLAR_CONFIG.ESCROW_MIN_AMOUNT} XLM`);
    }

    // Default to native XLM if no asset specified
    const escrowAsset = asset || StellarSdk.Asset.native();

    // Load source account
    const sourceAccount = await stellarClient.loadAccount(sourceKeypair.publicKey());

    // Build claimants array
    const claimants: StellarSdk.Claimant[] = [];

    // Primary claimant with optional time lock
    if (timeLock) {
      const unlockTime = Math.floor(Date.now() / 1000) + timeLock;
      claimants.push(
        new StellarSdk.Claimant(
          claimant,
          StellarSdk.Claimant.predicateNot(
            StellarSdk.Claimant.predicateBeforeAbsoluteTime(unlockTime.toString())
          )
        )
      );
    } else {
      claimants.push(
        new StellarSdk.Claimant(
          claimant,
          StellarSdk.Claimant.predicateUnconditional()
        )
      );
    }

    // Add refund claimant if specified
    if (refundTo) {
      if (!StellarSdk.StrKey.isValidEd25519PublicKey(refundTo)) {
        throw new Error('Invalid refund public key');
      }
      // Refund can be claimed after double the time lock
      const refundTime = Math.floor(Date.now() / 1000) + (timeLock ? timeLock * 2 : STELLAR_CONFIG.TIME_LOCK_DEFAULT * 2);
      claimants.push(
        new StellarSdk.Claimant(
          refundTo,
          StellarSdk.Claimant.predicateNot(
            StellarSdk.Claimant.predicateBeforeAbsoluteTime(refundTime.toString())
          )
        )
      );
    }

    // Build transaction
    const transaction = new StellarSdk.TransactionBuilder(sourceAccount, {
      fee: STELLAR_CONFIG.BASE_FEE,
      networkPassphrase: STELLAR_CONFIG.NETWORK_PASSPHRASE,
    })
      .addOperation(
        StellarSdk.Operation.createClaimableBalance({
          asset: escrowAsset,
          amount,
          claimants,
        })
      )
      .setTimeout(STELLAR_CONFIG.TIMEOUT)
      .build();

    // Sign transaction
    transaction.sign(sourceKeypair);

    // Submit transaction
    const result = await stellarClient.submitTransaction(transaction);

    // Extract balance ID from result
    const balanceId = this.extractBalanceId(result);

    return { balanceId, transaction };
  }

  /**
   * Claim an escrow balance
   */
  async claimEscrow(
    claimantKeypair: StellarSdk.Keypair,
    balanceId: string
  ): Promise<StellarSdk.Transaction> {
    // Load claimant account
    const claimantAccount = await stellarClient.loadAccount(claimantKeypair.publicKey());

    // Build transaction
    const transaction = new StellarSdk.TransactionBuilder(claimantAccount, {
      fee: STELLAR_CONFIG.BASE_FEE,
      networkPassphrase: STELLAR_CONFIG.NETWORK_PASSPHRASE,
    })
      .addOperation(
        StellarSdk.Operation.claimClaimableBalance({
          balanceId,
        })
      )
      .setTimeout(STELLAR_CONFIG.TIMEOUT)
      .build();

    // Sign transaction
    transaction.sign(claimantKeypair);

    // Submit transaction
    await stellarClient.submitTransaction(transaction);

    return transaction;
  }

  /**
   * Get escrow details
   */
  async getEscrowDetails(balanceId: string): Promise<EscrowDetails | null> {
    try {
      const server = stellarClient.getServer();
      const balance = await server.claimableBalances().claimableBalance(balanceId).call();

      // Parse claimants
      const primaryClaimant = balance.claimants[0];
      const refundClaimant = balance.claimants.length > 1 ? balance.claimants[1] : null;

      // Extract unlock time if present
      let unlockTime: Date | undefined;
      if (primaryClaimant.predicate && 'not' in primaryClaimant.predicate) {
        const notPredicate = primaryClaimant.predicate.not;
        if (notPredicate && 'abs_before' in notPredicate) {
          const timestamp = parseInt(notPredicate.abs_before || '0');
          unlockTime = new Date(timestamp * 1000);
        }
      }

      return {
        id: balance.id,
        amount: balance.amount,
        asset: balance.asset === 'native' ? 'XLM' : balance.asset || 'unknown',
        sponsor: balance.sponsor || '',
        claimant: primaryClaimant.destination,
        unlockTime,
        refundAddress: refundClaimant?.destination,
        claimed: false,
      };
    } catch (error) {
      console.error('Error fetching escrow details:', error);
      return null;
    }
  }

  /**
   * List all claimable balances for an account
   */
  async listEscrowsForAccount(publicKey: string): Promise<EscrowDetails[]> {
    try {
      const server = stellarClient.getServer();
      const balances = await server.claimableBalances().claimant(publicKey).call();

      const escrows: EscrowDetails[] = [];
      for (const balance of balances.records) {
        const details = await this.getEscrowDetails(balance.id);
        if (details) {
          escrows.push(details);
        }
      }

      return escrows;
    } catch (error) {
      console.error('Error listing escrows:', error);
      return [];
    }
  }

  /**
   * Extract balance ID from transaction result
   */
  private extractBalanceId(result: any): string {
    // The balance ID is in the transaction result meta
    // For now, return a placeholder - would need proper XDR parsing
    // In production, this would parse the result_meta_xdr properly
    return result.id || 'unknown';
  }
}

// Export singleton instance
export const escrowService = new EscrowService();
