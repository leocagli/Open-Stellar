import * as StellarSdk from '@stellar/stellar-sdk';

export interface StellarConfig {
  network: 'testnet' | 'mainnet';
  horizonUrl?: string;
}

export class StellarNetwork {
  public server: StellarSdk.Horizon.Server;
  public networkPassphrase: string;

  constructor(config: StellarConfig) {
    const horizonUrl = config.horizonUrl || 
      (config.network === 'testnet' 
        ? 'https://horizon-testnet.stellar.org'
        : 'https://horizon.stellar.org');

    this.server = new StellarSdk.Horizon.Server(horizonUrl);
    this.networkPassphrase = config.network === 'testnet'
      ? StellarSdk.Networks.TESTNET
      : StellarSdk.Networks.PUBLIC;
  }

  async getAccount(publicKey: string): Promise<StellarSdk.Horizon.AccountResponse> {
    return await this.server.loadAccount(publicKey);
  }

  async submitTransaction(transaction: StellarSdk.Transaction): Promise<StellarSdk.Horizon.SubmitTransactionResponse> {
    return await this.server.submitTransaction(transaction);
  }
}

export { StellarSdk };
