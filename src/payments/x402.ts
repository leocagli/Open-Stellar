/**
 * x402 - HTTP 402 Payment Required Handler
 * 
 * Implements HTTP 402 status code for resources requiring payment.
 * Integrates with Stellar blockchain for payment verification.
 */

import { Context } from 'hono';
import type {
  PaymentRequest,
  PaymentAmount,
  PaymentVerification,
  StellarNetwork,
} from './types';
import { PaymentStatus } from './types';
import {
  HTTP_402_PAYMENT_REQUIRED,
  PAYMENT_REQUEST_TIMEOUT_MS,
  PAYMENT_ERROR_CODES,
} from './config';
import { verifyPayment } from './stellar';

/**
 * Storage interface for payment requests
 */
export interface PaymentStorage {
  get(id: string): Promise<PaymentRequest | null>;
  set(id: string, request: PaymentRequest): Promise<void>;
  delete(id: string): Promise<void>;
}

/**
 * In-memory payment storage (for development)
 * In production, use R2 or Durable Objects
 */
class InMemoryPaymentStorage implements PaymentStorage {
  private storage = new Map<string, PaymentRequest>();

  async get(id: string): Promise<PaymentRequest | null> {
    return this.storage.get(id) || null;
  }

  async set(id: string, request: PaymentRequest): Promise<void> {
    this.storage.set(id, request);
  }

  async delete(id: string): Promise<void> {
    this.storage.delete(id);
  }
}

// Default storage instance
let defaultStorage: PaymentStorage = new InMemoryPaymentStorage();

/**
 * Set custom payment storage
 */
export function setPaymentStorage(storage: PaymentStorage): void {
  defaultStorage = storage;
}

/**
 * Generate unique payment request ID
 */
export function generatePaymentRequestId(): string {
  return `pay_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
}

/**
 * Create a payment request for a resource
 */
export async function createPaymentRequest(
  resource: string,
  amount: PaymentAmount,
  payee: string,
  options?: {
    description?: string;
    expiresInMs?: number;
    baseUrl?: string;
  }
): Promise<PaymentRequest> {
  const id = generatePaymentRequestId();
  const now = Date.now();
  const expiresAt = now + (options?.expiresInMs || PAYMENT_REQUEST_TIMEOUT_MS);
  const baseUrl = options?.baseUrl || '';

  const request: PaymentRequest = {
    id,
    resource,
    amount,
    payee,
    description: options?.description,
    createdAt: now,
    expiresAt,
    paymentUrl: `${baseUrl}/api/payments/verify`,
    status: PaymentStatus.PENDING,
  };

  await defaultStorage.set(id, request);
  return request;
}

/**
 * Get payment request by ID
 */
export async function getPaymentRequest(id: string): Promise<PaymentRequest | null> {
  const request = await defaultStorage.get(id);
  
  if (request && Date.now() > request.expiresAt && request.status === PaymentStatus.PENDING) {
    request.status = PaymentStatus.FAILED;
    await defaultStorage.set(id, request);
  }

  return request;
}

/**
 * Verify payment for a request
 */
export async function verifyPaymentRequest(
  requestId: string,
  transactionHash: string,
  fromAddress: string,
  network: StellarNetwork = 'testnet'
): Promise<PaymentVerification> {
  const request = await getPaymentRequest(requestId);

  if (!request) {
    return {
      verified: false,
      error: 'Payment request not found',
    };
  }

  if (request.status !== PaymentStatus.PENDING) {
    return {
      verified: false,
      error: `Payment request is ${request.status}`,
    };
  }

  if (Date.now() > request.expiresAt) {
    request.status = PaymentStatus.FAILED;
    await defaultStorage.set(requestId, request);
    return {
      verified: false,
      error: 'Payment request has expired',
    };
  }

  // Verify the payment on Stellar network
  const isValid = await verifyPayment(
    transactionHash,
    fromAddress,
    request.payee,
    request.amount,
    network
  );

  if (isValid) {
    request.status = PaymentStatus.COMPLETED;
    await defaultStorage.set(requestId, request);

    return {
      verified: true,
      transactionHash,
      timestamp: Date.now(),
      amount: request.amount,
      from: fromAddress,
      to: request.payee,
    };
  } else {
    return {
      verified: false,
      error: 'Payment verification failed',
    };
  }
}

/**
 * x402 Middleware - Require payment for protected resources
 * 
 * Usage:
 * ```ts
 * app.get('/premium-content', 
 *   requirePayment({ amount: '10', asset: 'XLM' }, payeeAddress),
 *   (c) => c.json({ content: 'Premium content here' })
 * );
 * ```
 */
export function requirePayment(
  amount: PaymentAmount,
  payee: string,
  options?: {
    description?: string;
    expiresInMs?: number;
  }
) {
  return async (c: Context, next: () => Promise<void>) => {
    const paymentToken = c.req.header('X-Payment-Token') || c.req.query('paymentToken');

    // If payment token provided, verify it
    if (paymentToken) {
      const request = await getPaymentRequest(paymentToken);
      
      if (request && request.status === PaymentStatus.COMPLETED) {
        // Payment verified, allow access
        await next();
        return;
      }
    }

    // No valid payment, return 402
    const baseUrl = `${c.req.url.split('?')[0]}`;
    const resource = new URL(c.req.url).pathname;

    const paymentRequest = await createPaymentRequest(resource, amount, payee, {
      ...options,
      baseUrl,
    });

    return c.json(
      {
        error: 'Payment Required',
        code: HTTP_402_PAYMENT_REQUIRED,
        message: 'This resource requires payment to access',
        payment: {
          id: paymentRequest.id,
          amount: paymentRequest.amount,
          payee: paymentRequest.payee,
          description: paymentRequest.description,
          expiresAt: paymentRequest.expiresAt,
          paymentUrl: paymentRequest.paymentUrl,
        },
        instructions: {
          step1: `Send ${amount.amount} ${amount.asset.code} to ${payee}`,
          step2: `Submit payment proof to ${paymentRequest.paymentUrl}`,
          step3: `Include payment ID: ${paymentRequest.id}`,
          step4: 'Access resource with X-Payment-Token header or paymentToken query param',
        },
      },
      HTTP_402_PAYMENT_REQUIRED
    );
  };
}

/**
 * Create HTTP 402 response for manual handling
 */
export async function create402Response(
  c: Context,
  amount: PaymentAmount,
  payee: string,
  options?: {
    description?: string;
    expiresInMs?: number;
  }
) {
  const baseUrl = `${c.req.url.split('?')[0]}`;
  const resource = new URL(c.req.url).pathname;

  const paymentRequest = await createPaymentRequest(resource, amount, payee, {
    ...options,
    baseUrl,
  });

  return c.json(
    {
      error: 'Payment Required',
      code: HTTP_402_PAYMENT_REQUIRED,
      message: options?.description || 'This resource requires payment to access',
      payment: {
        id: paymentRequest.id,
        amount: paymentRequest.amount,
        payee: paymentRequest.payee,
        description: paymentRequest.description,
        expiresAt: paymentRequest.expiresAt,
        paymentUrl: paymentRequest.paymentUrl,
      },
      instructions: {
        step1: `Send ${amount.amount} ${amount.asset.code} to ${payee}`,
        step2: `Submit payment proof to ${paymentRequest.paymentUrl}`,
        step3: `Include payment ID: ${paymentRequest.id}`,
        step4: 'Access resource with X-Payment-Token header or paymentToken query param',
      },
    },
    HTTP_402_PAYMENT_REQUIRED
  );
}
