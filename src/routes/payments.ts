/**
 * Payment API routes
 */

import { Hono } from 'hono';
import type { AppEnv } from '../types';
import {
  // x402 functions
  verifyPaymentRequest,
  getPaymentRequest,
  // 8004 functions
  process8004Payment,
  process8004EscrowPayment,
  complete8004EscrowPayment,
  cancel8004EscrowPayment,
  verify8004Payment,
  get8004ResultMessage,
  // Stellar functions
  generateKeypair,
  loadAccount,
  accountExists,
  getAccountBalance,
  createTestnetAccount,
  // Escrow functions
  createEscrow,
  getEscrowStatus,
  // Types
  type PaymentAmount,
  type StellarNetwork,
  type EscrowConfig,
  type StellarAccount,
  PAYMENT_CODE_8004_SUCCESS,
} from '../payments';

/**
 * Payment routes - handles Stellar payments, escrow, and HTTP 402
 */
const payments = new Hono<AppEnv>();

// =============================================================================
// Payment Verification Routes (x402)
// =============================================================================

/**
 * POST /api/payments/verify
 * Verify a payment for a payment request
 */
payments.post('/verify', async (c) => {
  try {
    const body = await c.req.json();
    const { requestId, transactionHash, fromAddress, network = 'testnet' } = body;

    if (!requestId || !transactionHash || !fromAddress) {
      return c.json(
        {
          error: 'Missing required fields: requestId, transactionHash, fromAddress',
        },
        400
      );
    }

    const result = await verifyPaymentRequest(
      requestId,
      transactionHash,
      fromAddress,
      network as StellarNetwork
    );

    if (result.verified) {
      return c.json({
        success: true,
        paymentToken: requestId,
        verification: result,
        message: 'Payment verified successfully',
      });
    } else {
      return c.json(
        {
          success: false,
          error: result.error,
        },
        400
      );
    }
  } catch (error) {
    return c.json(
      {
        error: error instanceof Error ? error.message : 'Payment verification failed',
      },
      500
    );
  }
});

/**
 * GET /api/payments/request/:id
 * Get payment request details
 */
payments.get('/request/:id', async (c) => {
  try {
    const id = c.req.param('id');
    const request = await getPaymentRequest(id);

    if (!request) {
      return c.json({ error: 'Payment request not found' }, 404);
    }

    return c.json(request);
  } catch (error) {
    return c.json(
      {
        error: error instanceof Error ? error.message : 'Failed to get payment request',
      },
      500
    );
  }
});

// =============================================================================
// Direct Payment Routes (8004)
// =============================================================================

/**
 * POST /api/payments/process
 * Process a direct payment (8004)
 */
payments.post('/process', async (c) => {
  try {
    const body = await c.req.json();
    const {
      fromSecretKey,
      to,
      amount,
      assetCode = 'XLM',
      assetIssuer,
      network = 'testnet',
      memo,
    } = body;

    if (!fromSecretKey || !to || !amount) {
      return c.json(
        {
          error: 'Missing required fields: fromSecretKey, to, amount',
        },
        400
      );
    }

    const fromAccount = loadAccount(fromSecretKey);
    const paymentAmount: PaymentAmount = {
      amount: amount.toString(),
      asset: {
        code: assetCode,
        issuer: assetIssuer,
      },
    };

    const result = await process8004Payment(fromAccount, to, paymentAmount, network, {
      memo,
      verifyBalance: true,
    });

    if (result.code === PAYMENT_CODE_8004_SUCCESS) {
      return c.json({
        success: true,
        result,
      });
    } else {
      return c.json(
        {
          success: false,
          result,
          message: get8004ResultMessage(result.code),
        },
        400
      );
    }
  } catch (error) {
    return c.json(
      {
        error: error instanceof Error ? error.message : 'Payment processing failed',
      },
      500
    );
  }
});

/**
 * POST /api/payments/verify-transaction
 * Verify a Stellar transaction (8004)
 */
payments.post('/verify-transaction', async (c) => {
  try {
    const body = await c.req.json();
    const { transactionHash, from, to, amount, assetCode = 'XLM', assetIssuer, network = 'testnet' } =
      body;

    if (!transactionHash || !from || !to || !amount) {
      return c.json(
        {
          error: 'Missing required fields: transactionHash, from, to, amount',
        },
        400
      );
    }

    const paymentAmount: PaymentAmount = {
      amount: amount.toString(),
      asset: {
        code: assetCode,
        issuer: assetIssuer,
      },
    };

    const result = await verify8004Payment(transactionHash, from, to, paymentAmount, network);

    return c.json({
      success: result.code === PAYMENT_CODE_8004_SUCCESS,
      result,
      message: get8004ResultMessage(result.code),
    });
  } catch (error) {
    return c.json(
      {
        error: error instanceof Error ? error.message : 'Transaction verification failed',
      },
      500
    );
  }
});

// =============================================================================
// Escrow Routes (Trusstles)
// =============================================================================

/**
 * POST /api/payments/escrow/create
 * Create and fund a new escrow
 */
payments.post('/escrow/create', async (c) => {
  try {
    const body = await c.req.json();
    const {
      payerSecretKey,
      payee,
      amount,
      assetCode = 'XLM',
      assetIssuer,
      network = 'testnet',
      arbiter,
      expiresInMs,
      requireArbiterApproval,
      autoReleaseAfter,
    } = body;

    if (!payerSecretKey || !payee || !amount) {
      return c.json(
        {
          error: 'Missing required fields: payerSecretKey, payee, amount',
        },
        400
      );
    }

    const payerAccount = loadAccount(payerSecretKey);
    const paymentAmount: PaymentAmount = {
      amount: amount.toString(),
      asset: {
        code: assetCode,
        issuer: assetIssuer,
      },
    };

    const result = await process8004EscrowPayment(payerAccount, payee, paymentAmount, network, {
      arbiter,
      expiresInMs,
      requireArbiterApproval,
      autoReleaseAfter,
    });

    if (result.code === PAYMENT_CODE_8004_SUCCESS) {
      return c.json({
        success: true,
        result,
        message: 'Escrow created and funded successfully',
      });
    } else {
      return c.json(
        {
          success: false,
          result,
          message: get8004ResultMessage(result.code),
        },
        400
      );
    }
  } catch (error) {
    return c.json(
      {
        error: error instanceof Error ? error.message : 'Escrow creation failed',
      },
      500
    );
  }
});

// Note: For complete escrow workflow, use the 8004 escrow functions:
// - complete8004EscrowPayment() to release funds
// - cancel8004EscrowPayment() to refund
// These require escrow state to be persisted (e.g., in R2 or Durable Objects)

// =============================================================================
// Utility Routes
// =============================================================================

/**
 * POST /api/payments/generate-keypair
 * Generate a new Stellar keypair (testnet only)
 */
payments.post('/generate-keypair', async (c) => {
  try {
    const body = await c.req.json();
    const { network = 'testnet', fundAccount = false } = body;

    if (network !== 'testnet' && fundAccount) {
      return c.json(
        {
          error: 'Can only auto-fund accounts on testnet',
        },
        400
      );
    }

    const keypair = generateKeypair();

    if (fundAccount && network === 'testnet') {
      const result = await createTestnetAccount(keypair.publicKey);
      return c.json({
        keypair,
        funded: result.success,
        transactionHash: result.transactionHash,
      });
    }

    return c.json({
      keypair: {
        publicKey: keypair.publicKey,
        secretKey: keypair.secretKey,
      },
      warning: 'Keep your secret key safe! Never share it.',
    });
  } catch (error) {
    return c.json(
      {
        error: error instanceof Error ? error.message : 'Keypair generation failed',
      },
      500
    );
  }
});

/**
 * GET /api/payments/balance/:publicKey
 * Get account balance
 */
payments.get('/balance/:publicKey', async (c) => {
  try {
    const publicKey = c.req.param('publicKey');
    const network = (c.req.query('network') as StellarNetwork) || 'testnet';
    const assetCode = c.req.query('assetCode') || 'native';

    const exists = await accountExists(publicKey, network);
    if (!exists) {
      return c.json({ error: 'Account not found' }, 404);
    }

    const balance = await getAccountBalance(publicKey, assetCode, network);

    return c.json({
      publicKey,
      assetCode,
      balance,
      network,
    });
  } catch (error) {
    return c.json(
      {
        error: error instanceof Error ? error.message : 'Failed to get balance',
      },
      500
    );
  }
});

export { payments };
