import { StellarSdk, StellarNetwork } from './network';

export interface SwapParams {
  sourceAsset: StellarSdk.Asset;
  destAsset: StellarSdk.Asset;
  sourceAmount: string;
  minDestAmount: string;
  sourceAccount: string;
}

export class StellarDEX {
  private network: StellarNetwork;

  constructor(network: StellarNetwork) {
    this.network = network;
  }

  /**
   * Create a path payment transaction for DEX swap
   */
  async createSwapTransaction(params: SwapParams): Promise<StellarSdk.Transaction> {
    const account = await this.network.getAccount(params.sourceAccount);

    // Find path for swap
    const paths = await this.network.server
      .strictSendPaths(params.sourceAsset, params.sourceAmount, [params.destAsset])
      .call();

    if (!paths.records || paths.records.length === 0) {
      throw new Error('No path found for swap');
    }

    const path = paths.records[0];

    // Build transaction
    const transaction = new StellarSdk.TransactionBuilder(account, {
      fee: StellarSdk.BASE_FEE,
      networkPassphrase: this.network.networkPassphrase,
    })
      .addOperation(
        StellarSdk.Operation.pathPaymentStrictSend({
          sendAsset: params.sourceAsset,
          sendAmount: params.sourceAmount,
          destination: params.sourceAccount,
          destAsset: params.destAsset,
          destMin: params.minDestAmount,
          path: path.path,
        })
      )
      .setTimeout(300)
      .build();

    return transaction;
  }

  /**
   * Get orderbook for asset pair
   */
  async getOrderbook(selling: StellarSdk.Asset, buying: StellarSdk.Asset) {
    return await this.network.server
      .orderbook(selling, buying)
      .call();
  }

  /**
   * Create a manage buy offer operation
   */
  createBuyOfferOperation(
    selling: StellarSdk.Asset,
    buying: StellarSdk.Asset,
    buyAmount: string,
    price: string
  ): StellarSdk.xdr.Operation {
    return StellarSdk.Operation.manageBuyOffer({
      selling,
      buying,
      buyAmount,
      price,
    });
  }

  /**
   * Create a manage sell offer operation
   */
  createSellOfferOperation(
    selling: StellarSdk.Asset,
    buying: StellarSdk.Asset,
    amount: string,
    price: string
  ): StellarSdk.xdr.Operation {
    return StellarSdk.Operation.manageSellOffer({
      selling,
      buying,
      amount,
      price,
    });
  }
}
