/**
 * Payment Types for Open-Stellar
 * 
 * Defines types for HTTP 402 Payment Required and Stellar escrow integration
 */

export interface PaymentRequest {
  amount: string;
  asset: string;
  destination: string;
  memo?: string;
  source?: string;
}

export interface PaymentResponse {
  success: boolean;
  transactionHash?: string;
  error?: string;
  paymentId?: string;
}

export interface EscrowContract {
  id: string;
  buyer: string;
  seller: string;
  arbiter: string;
  amount: string;
  asset: string;
  state: EscrowState;
  createdAt: number;
  expiresAt: number;
}

export enum EscrowState {
  CREATED = 'created',
  FUNDED = 'funded',
  RELEASED = 'released',
  REFUNDED = 'refunded',
  DISPUTED = 'disputed',
}

export interface X402Response {
  statusCode: 402;
  message: string;
  paymentRequired: {
    amount: string;
    asset: string;
    destination: string;
    paymentId: string;
  };
}

export interface Payment8004Request {
  paymentId: string;
  transactionHash: string;
}

export interface Payment8004Response {
  validated: boolean;
  status: 'pending' | 'confirmed' | 'failed';
  confirmations?: number;
}
