export interface StellarConfig {
  network: 'testnet' | 'mainnet';
  horizonUrl?: string;
}

export interface BotRegistration {
  publicKey: string;
  name: string;
  description?: string;
  timestamp: number;
}

export interface Escrow {
  id: string;
  buyer: string;
  seller: string;
  arbiter: string;
  amount: string;
  asset: any;
  contractAddress: string;
  escrowId: number;
  status: 'pending' | 'released' | 'refunded';
  createdAt: number;
}

export interface Order {
  id: string;
  creator: string;
  beneficiary: string;
  amount: string;
  asset: any;
  unlockTime: number;
  balanceId?: string;
  status: 'pending' | 'claimed' | 'cancelled';
  createdAt: number;
}
