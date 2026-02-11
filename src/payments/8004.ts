/**
 * 8004 - Custom Payment Processing System
 * 
 * Handles payment processing workflow with custom error codes.
 * Integrates with Stellar blockchain and escrow system.
 */

import type {
  PaymentAmount,
  PaymentProcessingResult,
  StellarNetwork,
  StellarAccount,
  EscrowConfig,
} from './types';
import {
  PAYMENT_CODE_8004_SUCCESS,
  PAYMENT_ERROR_CODES,
} from './config';
import {
  buildPaymentTransaction,
  submitTransaction,
  verifyPayment,
  getAccountBalance,
} from './stellar';
import {
  createEscrow,
  fundEscrow,
  releaseEscrow,
  refundEscrow,
  getEscrowStatus,
} from './escrow';

/**
 * Process a direct payment (without escrow)
 */
export async function process8004Payment(
  from: StellarAccount,
  to: string,
  amount: PaymentAmount,
  network: StellarNetwork = 'testnet',
  options?: {
    memo?: string;
    verifyBalance?: boolean;
  }
): Promise<PaymentProcessingResult> {
  try {
    // Verify sender has secret key
    if (!from.secretKey) {
      return {
        code: PAYMENT_ERROR_CODES.UNAUTHORIZED,
        message: 'Sender account requires secret key for signing',
        timestamp: Date.now(),
      };
    }

    // Optional: Verify sufficient balance
    if (options?.verifyBalance) {
      const balance = await getAccountBalance(from.publicKey, amount.asset.code, network);
      const requiredAmount = parseFloat(amount.amount);
      const currentBalance = parseFloat(balance);

      if (currentBalance < requiredAmount) {
        return {
          code: PAYMENT_ERROR_CODES.INSUFFICIENT_FUNDS,
          message: `Insufficient balance. Required: ${amount.amount} ${amount.asset.code}, Available: ${balance}`,
          timestamp: Date.now(),
        };
      }
    }

    // Build payment transaction
    const transaction = await buildPaymentTransaction(
      from,
      to,
      amount,
      network,
      options?.memo
    );

    // Submit transaction
    const result = await submitTransaction(transaction, [from], network);

    if (result.success) {
      return {
        code: PAYMENT_CODE_8004_SUCCESS,
        message: 'Payment processed successfully',
        paymentId: result.transactionHash,
        transactionHash: result.transactionHash,
        timestamp: Date.now(),
      };
    } else {
      return {
        code: PAYMENT_ERROR_CODES.NETWORK_ERROR,
        message: result.error || 'Payment transaction failed',
        timestamp: Date.now(),
      };
    }
  } catch (error) {
    return {
      code: PAYMENT_ERROR_CODES.NETWORK_ERROR,
      message: error instanceof Error ? error.message : 'Unknown payment error',
      timestamp: Date.now(),
    };
  }
}

/**
 * Process an escrow payment (create and fund)
 */
export async function process8004EscrowPayment(
  payerAccount: StellarAccount,
  payeePublicKey: string,
  amount: PaymentAmount,
  network: StellarNetwork = 'testnet',
  options?: {
    arbiter?: string;
    expiresInMs?: number;
    requireArbiterApproval?: boolean;
    autoReleaseAfter?: number;
  }
): Promise<PaymentProcessingResult> {
  try {
    // Create escrow
    const { escrow, account: escrowAccount } = await createEscrow(
      {
        payer: payerAccount.publicKey,
        payee: payeePublicKey,
        arbiter: options?.arbiter,
      },
      amount,
      network,
      {
        expiresInMs: options?.expiresInMs,
        requireArbiterApproval: options?.requireArbiterApproval,
        autoReleaseAfter: options?.autoReleaseAfter,
      }
    );

    // Fund the escrow
    const { escrow: fundedEscrow, result } = await fundEscrow(
      escrow,
      escrowAccount,
      payerAccount,
      network
    );

    if (result.success) {
      return {
        code: PAYMENT_CODE_8004_SUCCESS,
        message: 'Escrow payment created and funded successfully',
        paymentId: fundedEscrow.id,
        transactionHash: result.transactionHash,
        escrowId: fundedEscrow.id,
        timestamp: Date.now(),
      };
    } else {
      return {
        code: PAYMENT_ERROR_CODES.NETWORK_ERROR,
        message: result.error || 'Failed to fund escrow',
        escrowId: escrow.id,
        timestamp: Date.now(),
      };
    }
  } catch (error) {
    return {
      code: PAYMENT_ERROR_CODES.NETWORK_ERROR,
      message: error instanceof Error ? error.message : 'Escrow payment failed',
      timestamp: Date.now(),
    };
  }
}

/**
 * Verify a payment transaction
 */
export async function verify8004Payment(
  transactionHash: string,
  expectedFrom: string,
  expectedTo: string,
  expectedAmount: PaymentAmount,
  network: StellarNetwork = 'testnet'
): Promise<PaymentProcessingResult> {
  try {
    const isValid = await verifyPayment(
      transactionHash,
      expectedFrom,
      expectedTo,
      expectedAmount,
      network
    );

    if (isValid) {
      return {
        code: PAYMENT_CODE_8004_SUCCESS,
        message: 'Payment verified successfully',
        transactionHash,
        timestamp: Date.now(),
      };
    } else {
      return {
        code: PAYMENT_ERROR_CODES.INVALID_PAYMENT,
        message: 'Payment verification failed - transaction does not match expected parameters',
        transactionHash,
        timestamp: Date.now(),
      };
    }
  } catch (error) {
    return {
      code: PAYMENT_ERROR_CODES.NETWORK_ERROR,
      message: error instanceof Error ? error.message : 'Payment verification error',
      timestamp: Date.now(),
    };
  }
}

/**
 * Complete an escrow payment (release funds)
 */
export async function complete8004EscrowPayment(
  escrow: EscrowConfig,
  escrowAccount: StellarAccount,
  signerAccounts: StellarAccount[],
  network: StellarNetwork = 'testnet'
): Promise<PaymentProcessingResult> {
  try {
    const status = getEscrowStatus(escrow);

    if (!status.canRelease) {
      return {
        code: PAYMENT_ERROR_CODES.ESCROW_INVALID_STATE,
        message: `Cannot release escrow in ${escrow.state} state`,
        escrowId: escrow.id,
        timestamp: Date.now(),
      };
    }

    const { escrow: releasedEscrow, result } = await releaseEscrow(
      escrow,
      escrowAccount,
      signerAccounts,
      network
    );

    if (result.success) {
      return {
        code: PAYMENT_CODE_8004_SUCCESS,
        message: 'Escrow payment completed successfully',
        escrowId: releasedEscrow.id,
        transactionHash: result.transactionHash,
        timestamp: Date.now(),
      };
    } else {
      return {
        code: PAYMENT_ERROR_CODES.NETWORK_ERROR,
        message: result.error || 'Failed to release escrow',
        escrowId: escrow.id,
        timestamp: Date.now(),
      };
    }
  } catch (error) {
    return {
      code: PAYMENT_ERROR_CODES.NETWORK_ERROR,
      message: error instanceof Error ? error.message : 'Escrow release failed',
      escrowId: escrow.id,
      timestamp: Date.now(),
    };
  }
}

/**
 * Cancel an escrow payment (refund funds)
 */
export async function cancel8004EscrowPayment(
  escrow: EscrowConfig,
  escrowAccount: StellarAccount,
  signerAccounts: StellarAccount[],
  network: StellarNetwork = 'testnet',
  reason?: string
): Promise<PaymentProcessingResult> {
  try {
    const status = getEscrowStatus(escrow);

    if (!status.canRefund) {
      return {
        code: PAYMENT_ERROR_CODES.ESCROW_INVALID_STATE,
        message: `Cannot refund escrow in ${escrow.state} state`,
        escrowId: escrow.id,
        timestamp: Date.now(),
      };
    }

    const { escrow: refundedEscrow, result } = await refundEscrow(
      escrow,
      escrowAccount,
      signerAccounts,
      network,
      reason
    );

    if (result.success) {
      return {
        code: PAYMENT_CODE_8004_SUCCESS,
        message: 'Escrow payment refunded successfully',
        escrowId: refundedEscrow.id,
        transactionHash: result.transactionHash,
        timestamp: Date.now(),
      };
    } else {
      return {
        code: PAYMENT_ERROR_CODES.NETWORK_ERROR,
        message: result.error || 'Failed to refund escrow',
        escrowId: escrow.id,
        timestamp: Date.now(),
      };
    }
  } catch (error) {
    return {
      code: PAYMENT_ERROR_CODES.NETWORK_ERROR,
      message: error instanceof Error ? error.message : 'Escrow refund failed',
      escrowId: escrow.id,
      timestamp: Date.now(),
    };
  }
}

/**
 * Batch process multiple payments
 */
export async function process8004BatchPayments(
  payments: Array<{
    from: StellarAccount;
    to: string;
    amount: PaymentAmount;
    memo?: string;
  }>,
  network: StellarNetwork = 'testnet'
): Promise<PaymentProcessingResult[]> {
  const results: PaymentProcessingResult[] = [];

  for (const payment of payments) {
    const result = await process8004Payment(
      payment.from,
      payment.to,
      payment.amount,
      network,
      { memo: payment.memo, verifyBalance: true }
    );
    results.push(result);

    // Stop on first failure
    if (result.code !== PAYMENT_CODE_8004_SUCCESS) {
      break;
    }
  }

  return results;
}

/**
 * Get human-readable message for payment result code
 */
export function get8004ResultMessage(code: number): string {
  switch (code) {
    case PAYMENT_CODE_8004_SUCCESS:
      return 'Payment processed successfully';
    case PAYMENT_ERROR_CODES.INVALID_PAYMENT:
      return 'Invalid payment transaction';
    case PAYMENT_ERROR_CODES.INSUFFICIENT_FUNDS:
      return 'Insufficient funds for payment';
    case PAYMENT_ERROR_CODES.PAYMENT_EXPIRED:
      return 'Payment request has expired';
    case PAYMENT_ERROR_CODES.ESCROW_NOT_FOUND:
      return 'Escrow not found';
    case PAYMENT_ERROR_CODES.ESCROW_INVALID_STATE:
      return 'Escrow in invalid state for this operation';
    case PAYMENT_ERROR_CODES.UNAUTHORIZED:
      return 'Unauthorized to perform this operation';
    case PAYMENT_ERROR_CODES.NETWORK_ERROR:
      return 'Network error during payment processing';
    default:
      return 'Unknown payment error';
  }
}
