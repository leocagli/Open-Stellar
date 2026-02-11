import { setAllowed, requestAccess, isConnected, getPublicKey, signTransaction } from '@stellar/freighter-api';
import { StellarSdk } from './network';

export class FreighterWallet {
  private publicKey: string | null = null;

  async connect(): Promise<string> {
    const allowed = await setAllowed();
    if (!allowed) {
      throw new Error('Freighter wallet permission denied');
    }

    const publicKey = await getPublicKey();
    this.publicKey = publicKey;
    return publicKey;
  }

  async isConnected(): Promise<boolean> {
    return await isConnected();
  }

  getPublicKey(): string {
    if (!this.publicKey) {
      throw new Error('Wallet not connected');
    }
    return this.publicKey;
  }

  async signTransaction(xdr: string, networkPassphrase: string): Promise<string> {
    if (!this.publicKey) {
      throw new Error('Wallet not connected');
    }

    const signedXdr = await signTransaction(xdr, {
      network: networkPassphrase,
      accountToSign: this.publicKey,
    });

    return signedXdr;
  }

  async signAndSubmitTransaction(
    transaction: StellarSdk.Transaction,
    networkPassphrase: string,
    server: StellarSdk.Horizon.Server
  ): Promise<StellarSdk.Horizon.SubmitTransactionResponse> {
    const xdr = transaction.toXDR();
    const signedXdr = await this.signTransaction(xdr, networkPassphrase);
    const signedTransaction = StellarSdk.TransactionBuilder.fromXDR(signedXdr, networkPassphrase);
    return await server.submitTransaction(signedTransaction as StellarSdk.Transaction);
  }
}
