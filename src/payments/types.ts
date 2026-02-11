/**
 * Payment system types for Stellar integration and escrow management
 */

import type { Asset, Transaction } from '@stellar/stellar-sdk';

/**
 * Stellar network configuration
 */
export type StellarNetwork = 'testnet' | 'mainnet';

/**
 * Payment status
 */
export enum PaymentStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed',
  REFUNDED = 'refunded',
}

/**
 * Escrow state
 */
export enum EscrowState {
  CREATED = 'created',
  FUNDED = 'funded',
  RELEASED = 'released',
  REFUNDED = 'refunded',
  EXPIRED = 'expired',
}

/**
 * Payment amount with asset information
 */
export interface PaymentAmount {
  amount: string;
  asset: {
    code: string;
    issuer?: string; // Optional for native XLM
  };
}

/**
 * Stellar account information
 */
export interface StellarAccount {
  publicKey: string;
  secretKey?: string; // Only for server-controlled accounts
}

/**
 * Escrow participants
 */
export interface EscrowParticipants {
  payer: string; // Stellar public key
  payee: string; // Stellar public key
  arbiter?: string; // Optional third party for dispute resolution
}

/**
 * Escrow configuration
 */
export interface EscrowConfig {
  id: string;
  participants: EscrowParticipants;
  amount: PaymentAmount;
  state: EscrowState;
  createdAt: number;
  fundedAt?: number;
  releasedAt?: number;
  refundedAt?: number;
  expiresAt: number;
  conditions?: {
    requireArbiterApproval?: boolean;
    autoReleaseAfter?: number; // Timestamp for auto-release
  };
  transactionHashes: {
    creation?: string;
    funding?: string;
    release?: string;
    refund?: string;
  };
}

/**
 * Payment request (HTTP 402)
 */
export interface PaymentRequest {
  id: string;
  resource: string; // Resource being accessed
  amount: PaymentAmount;
  payee: string; // Stellar public key to receive payment
  description?: string;
  createdAt: number;
  expiresAt: number;
  paymentUrl: string; // URL to submit payment proof
  status: PaymentStatus;
}

/**
 * Payment verification result
 */
export interface PaymentVerification {
  verified: boolean;
  transactionHash?: string;
  timestamp?: number;
  amount?: PaymentAmount;
  from?: string;
  to?: string;
  error?: string;
}

/**
 * 8004 Payment processing result
 */
export interface PaymentProcessingResult {
  code: number; // 8004 success, other for errors
  message: string;
  paymentId?: string;
  transactionHash?: string;
  escrowId?: string;
  timestamp: number;
}

/**
 * Stellar transaction result
 */
export interface StellarTransactionResult {
  success: boolean;
  transactionHash?: string;
  ledger?: number;
  error?: string;
}

/**
 * Escrow operation request
 */
export interface EscrowOperationRequest {
  escrowId: string;
  signature?: string; // Transaction signature for verification
  reason?: string; // Optional reason for refund/dispute
}
