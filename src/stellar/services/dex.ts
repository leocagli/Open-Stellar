/**
 * Stellar DEX Service for P2P Order Matching
 * Replaces Uniswap v4 functionality with Stellar's native DEX
 */

import * as StellarSdk from '@stellar/stellar-sdk';
import { stellarClient } from '../client';
import { STELLAR_CONFIG } from '../config';

export interface OrderDetails {
  id: string;
  seller: string;
  selling: {
    asset: string;
    amount: string;
  };
  buying: {
    asset: string;
    amount: string;
  };
  price: string;
  timestamp: Date;
}

export interface CreateOrderOptions {
  selling: {
    code: string;
    issuer?: string;
    amount: string;
  };
  buying: {
    code: string;
    issuer?: string;
  };
  price: string; // Price of buying asset in terms of selling asset
}

export class DexService {
  /**
   * Create a new order on Stellar DEX
   */
  async createOrder(
    sourceKeypair: StellarSdk.Keypair,
    options: CreateOrderOptions
  ): Promise<{ offerId: string; transaction: StellarSdk.Transaction }> {
    const { selling, buying, price } = options;

    // Create asset objects
    const sellingAsset = this.createAsset(selling.code, selling.issuer);
    const buyingAsset = this.createAsset(buying.code, buying.issuer);

    // Load source account
    const sourceAccount = await stellarClient.loadAccount(sourceKeypair.publicKey());

    // Build transaction with manage offer operation
    const transaction = new StellarSdk.TransactionBuilder(sourceAccount, {
      fee: STELLAR_CONFIG.BASE_FEE,
      networkPassphrase: STELLAR_CONFIG.NETWORK_PASSPHRASE,
    })
      .addOperation(
        StellarSdk.Operation.manageSellOffer({
          selling: sellingAsset,
          buying: buyingAsset,
          amount: selling.amount,
          price: price,
        })
      )
      .setTimeout(STELLAR_CONFIG.TIMEOUT)
      .build();

    // Sign transaction
    transaction.sign(sourceKeypair);

    // Submit transaction
    const result = await stellarClient.submitTransaction(transaction);

    // Extract offer ID from result
    const offerId = this.extractOfferId(result);

    return { offerId, transaction };
  }

  /**
   * Cancel an existing order
   */
  async cancelOrder(
    sourceKeypair: StellarSdk.Keypair,
    offerId: string,
    selling: { code: string; issuer?: string },
    buying: { code: string; issuer?: string }
  ): Promise<StellarSdk.Transaction> {
    // Create asset objects
    const sellingAsset = this.createAsset(selling.code, selling.issuer);
    const buyingAsset = this.createAsset(buying.code, buying.issuer);

    // Load source account
    const sourceAccount = await stellarClient.loadAccount(sourceKeypair.publicKey());

    // Build transaction to delete offer (set amount to 0)
    const transaction = new StellarSdk.TransactionBuilder(sourceAccount, {
      fee: STELLAR_CONFIG.BASE_FEE,
      networkPassphrase: STELLAR_CONFIG.NETWORK_PASSPHRASE,
    })
      .addOperation(
        StellarSdk.Operation.manageSellOffer({
          selling: sellingAsset,
          buying: buyingAsset,
          amount: '0',
          price: '1',
          offerId: offerId,
        })
      )
      .setTimeout(STELLAR_CONFIG.TIMEOUT)
      .build();

    // Sign transaction
    transaction.sign(sourceKeypair);

    // Submit transaction
    await stellarClient.submitTransaction(transaction);

    return transaction;
  }

  /**
   * Get active orders for an account
   */
  async getOrdersForAccount(publicKey: string): Promise<OrderDetails[]> {
    try {
      const server = stellarClient.getServer();
      const offers = await server.offers().forAccount(publicKey).call();

      return offers.records.map(offer => ({
        id: String(offer.id),
        seller: offer.seller,
        selling: {
          asset: this.formatAsset(offer.selling),
          amount: offer.amount,
        },
        buying: {
          asset: this.formatAsset(offer.buying),
          amount: (parseFloat(offer.amount) * parseFloat(offer.price)).toFixed(7),
        },
        price: offer.price,
        timestamp: new Date(offer.last_modified_time),
      }));
    } catch (error) {
      console.error('Error fetching orders:', error);
      return [];
    }
  }

  /**
   * Get order book for a trading pair
   */
  async getOrderBook(
    selling: { code: string; issuer?: string },
    buying: { code: string; issuer?: string },
    limit: number = 20
  ): Promise<{
    bids: Array<{ price: string; amount: string }>;
    asks: Array<{ price: string; amount: string }>;
  }> {
    try {
      const server = stellarClient.getServer();
      const sellingAsset = this.createAsset(selling.code, selling.issuer);
      const buyingAsset = this.createAsset(buying.code, buying.issuer);

      const orderbook = await server
        .orderbook(sellingAsset, buyingAsset)
        .limit(limit)
        .call();

      return {
        bids: orderbook.bids.map(bid => ({
          price: bid.price,
          amount: bid.amount,
        })),
        asks: orderbook.asks.map(ask => ({
          price: ask.price,
          amount: ask.amount,
        })),
      };
    } catch (error) {
      console.error('Error fetching order book:', error);
      return { bids: [], asks: [] };
    }
  }

  /**
   * Execute a path payment (for complex swaps)
   */
  async executePathPayment(
    sourceKeypair: StellarSdk.Keypair,
    destination: string,
    sendAsset: { code: string; issuer?: string; amount: string },
    destAsset: { code: string; issuer?: string; minAmount: string },
    path?: Array<{ code: string; issuer?: string }>
  ): Promise<StellarSdk.Transaction> {
    // Create asset objects
    const sendAssetObj = this.createAsset(sendAsset.code, sendAsset.issuer);
    const destAssetObj = this.createAsset(destAsset.code, destAsset.issuer);
    const pathAssets = path?.map(p => this.createAsset(p.code, p.issuer)) || [];

    // Load source account
    const sourceAccount = await stellarClient.loadAccount(sourceKeypair.publicKey());

    // Build transaction
    const transaction = new StellarSdk.TransactionBuilder(sourceAccount, {
      fee: STELLAR_CONFIG.BASE_FEE,
      networkPassphrase: STELLAR_CONFIG.NETWORK_PASSPHRASE,
    })
      .addOperation(
        StellarSdk.Operation.pathPaymentStrictSend({
          sendAsset: sendAssetObj,
          sendAmount: sendAsset.amount,
          destination,
          destAsset: destAssetObj,
          destMin: destAsset.minAmount,
          path: pathAssets,
        })
      )
      .setTimeout(STELLAR_CONFIG.TIMEOUT)
      .build();

    // Sign transaction
    transaction.sign(sourceKeypair);

    // Submit transaction
    await stellarClient.submitTransaction(transaction);

    return transaction;
  }

  /**
   * Find payment paths between assets
   */
  async findPaymentPaths(
    source: string,
    destination: string,
    destAsset: { code: string; issuer?: string },
    destAmount: string
  ): Promise<Array<{ path: string[]; sourceAmount: string }>> {
    try {
      const server = stellarClient.getServer();
      const asset = this.createAsset(destAsset.code, destAsset.issuer);

      const paths = await server
        .strictReceivePaths(source, asset, destAmount)
        .call();

      return paths.records.map(record => ({
        path: record.path.map(p => this.formatAsset(p)),
        sourceAmount: record.source_amount,
      }));
    } catch (error) {
      console.error('Error finding payment paths:', error);
      return [];
    }
  }

  /**
   * Create a Stellar asset object
   */
  private createAsset(code: string, issuer?: string): StellarSdk.Asset {
    if (code === 'XLM' || code === 'native') {
      return StellarSdk.Asset.native();
    }
    if (!issuer) {
      throw new Error(`Issuer required for asset ${code}`);
    }
    return new StellarSdk.Asset(code, issuer);
  }

  /**
   * Format asset for display
   */
  private formatAsset(asset: any): string {
    if (asset.asset_type === 'native') {
      return 'XLM';
    }
    return `${asset.asset_code}:${asset.asset_issuer}`;
  }

  /**
   * Extract offer ID from transaction result
   */
  private extractOfferId(result: any): string {
    // Parse offer ID from transaction result
    // This is simplified - in production you'd parse the XDR properly
    return String(result.id) || 'unknown';
  }
}

// Export singleton instance
export const dexService = new DexService();
