import { StellarSdk, StellarNetwork } from './network';

export interface ClaimableBalanceParams {
  asset: StellarSdk.Asset;
  amount: string;
  claimants: StellarSdk.Claimant[];
  source: string;
}

export class ClaimableBalanceManager {
  private network: StellarNetwork;

  constructor(network: StellarNetwork) {
    this.network = network;
  }

  /**
   * Create a claimable balance for escrow or time-locked orders
   */
  async createClaimableBalance(params: ClaimableBalanceParams): Promise<StellarSdk.Transaction> {
    const account = await this.network.getAccount(params.source);

    const transaction = new StellarSdk.TransactionBuilder(account, {
      fee: StellarSdk.BASE_FEE,
      networkPassphrase: this.network.networkPassphrase,
    })
      .addOperation(
        StellarSdk.Operation.createClaimableBalance({
          asset: params.asset,
          amount: params.amount,
          claimants: params.claimants,
        })
      )
      .setTimeout(300)
      .build();

    return transaction;
  }

  /**
   * Claim a claimable balance
   */
  async claimBalance(balanceId: string, claimant: string): Promise<StellarSdk.Transaction> {
    const account = await this.network.getAccount(claimant);

    const transaction = new StellarSdk.TransactionBuilder(account, {
      fee: StellarSdk.BASE_FEE,
      networkPassphrase: this.network.networkPassphrase,
    })
      .addOperation(
        StellarSdk.Operation.claimClaimableBalance({
          balanceId,
        })
      )
      .setTimeout(300)
      .build();

    return transaction;
  }

  /**
   * Create time-locked claimant (unlock after specific time)
   */
  createTimeLockedClaimant(publicKey: string, unlockTime: Date): StellarSdk.Claimant {
    return new StellarSdk.Claimant(
      publicKey,
      StellarSdk.Claimant.predicateNot(
        StellarSdk.Claimant.predicateBeforeAbsoluteTime(
          Math.floor(unlockTime.getTime() / 1000).toString()
        )
      )
    );
  }

  /**
   * Create unconditional claimant
   */
  createUnconditionalClaimant(publicKey: string): StellarSdk.Claimant {
    return new StellarSdk.Claimant(
      publicKey,
      StellarSdk.Claimant.predicateUnconditional()
    );
  }

  /**
   * Get claimable balances for account
   */
  async getClaimableBalances(claimant: string) {
    return await this.network.server
      .claimableBalances()
      .claimant(claimant)
      .call();
  }
}
