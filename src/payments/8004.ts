/**
 * Payment Validation and Processing (Function 8004)
 * 
 * Implements payment verification and transaction validation for Stellar payments
 */

import type { Payment8004Request, Payment8004Response } from './types';

interface PaymentRecord {
  paymentId: string;
  transactionHash: string;
  status: 'pending' | 'confirmed' | 'failed';
  confirmations: number;
  timestamp: number;
}

// In-memory payment tracking (should be replaced with persistent storage in production)
const paymentRecords = new Map<string, PaymentRecord>();

/**
 * Function 8004 - Payment Validation and Processing
 * 
 * Validates a Stellar transaction and tracks payment status.
 * Works in conjunction with x402 to enable payment-gated services.
 * 
 * @param request - Payment validation request
 * @returns Payment8004Response with validation status
 */
export async function process8004(
  request: Payment8004Request
): Promise<Payment8004Response> {
  const { paymentId, transactionHash } = request;
  
  // Check if payment already exists
  const existing = paymentRecords.get(paymentId);
  if (existing) {
    return {
      validated: existing.status === 'confirmed',
      status: existing.status,
      confirmations: existing.confirmations,
    };
  }
  
  // Validate the transaction on Stellar network
  const validationResult = await validateStellarTransaction(transactionHash);
  
  if (!validationResult.valid) {
    return {
      validated: false,
      status: 'failed',
    };
  }
  
  // Store payment record
  const record: PaymentRecord = {
    paymentId,
    transactionHash,
    status: validationResult.confirmations >= 1 ? 'confirmed' : 'pending',
    confirmations: validationResult.confirmations,
    timestamp: Date.now(),
  };
  
  paymentRecords.set(paymentId, record);
  
  return {
    validated: record.status === 'confirmed',
    status: record.status,
    confirmations: record.confirmations,
  };
}

/**
 * Validate a Stellar transaction
 * 
 * @param transactionHash - Hash of the Stellar transaction
 * @returns Validation result with confirmation count
 */
async function validateStellarTransaction(
  transactionHash: string
): Promise<{ valid: boolean; confirmations: number }> {
  try {
    // Import verifyPayment from stellar module
    const { getTransaction } = await import('./stellar');
    
    // Verify transaction exists on Stellar network
    const tx = await getTransaction(transactionHash);
    
    if (!tx) {
      return { valid: false, confirmations: 0 };
    }
    
    // Calculate confirmations based on ledger age
    // For simplicity, if transaction is confirmed it has at least 1 confirmation
    // In production, you would calculate actual confirmations based on current ledger
    const confirmations = tx.successful ? 1 : 0;
    
    return {
      valid: tx.successful,
      confirmations,
    };
  } catch (error) {
    console.error('Error validating Stellar transaction:', error);
    return { valid: false, confirmations: 0 };
  }
}

/**
 * Get payment status
 * 
 * @param paymentId - Payment ID to check
 * @returns Payment record or null if not found
 */
export function getPaymentStatus(paymentId: string): PaymentRecord | null {
  return paymentRecords.get(paymentId) || null;
}

/**
 * Mark a payment as verified
 * This is called after successful validation
 * 
 * @param paymentId - Payment ID to mark as verified
 */
export function markPaymentVerified(paymentId: string): void {
  const record = paymentRecords.get(paymentId);
  if (record) {
    record.status = 'confirmed';
    record.confirmations = 1;
    paymentRecords.set(paymentId, record);
  }
}

/**
 * Clean up old payment records (older than 24 hours)
 */
export function cleanupOldPayments(): void {
  const dayAgo = Date.now() - 24 * 60 * 60 * 1000;
  
  for (const [paymentId, record] of paymentRecords.entries()) {
    if (record.timestamp < dayAgo) {
      paymentRecords.delete(paymentId);
    }
  }
}
