/**
 * Tests for x402 Payment Handler
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  generatePaymentRequestId,
  createPaymentRequest,
  setPaymentStorage,
} from './x402';
import { PaymentStatus, type PaymentAmount, type PaymentRequest } from './types';

// Mock storage
class MockPaymentStorage {
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

  clear() {
    this.storage.clear();
  }
}

describe('x402 Payment Handler', () => {
  let mockStorage: MockPaymentStorage;
  const mockAmount: PaymentAmount = {
    amount: '50',
    asset: { code: 'XLM' },
  };

  beforeEach(() => {
    mockStorage = new MockPaymentStorage();
    setPaymentStorage(mockStorage);
  });

  describe('generatePaymentRequestId', () => {
    it('should generate a unique payment request ID', () => {
      const id1 = generatePaymentRequestId();
      const id2 = generatePaymentRequestId();
      
      expect(id1).toMatch(/^pay_/);
      expect(id1).not.toBe(id2);
    });
  });

  describe('createPaymentRequest', () => {
    it('should create a valid payment request', async () => {
      const request = await createPaymentRequest(
        '/premium-content',
        mockAmount,
        'GAPAYEE123',
        {
          description: 'Access to premium content',
          baseUrl: 'https://example.com',
        }
      );

      expect(request.id).toMatch(/^pay_/);
      expect(request.resource).toBe('/premium-content');
      expect(request.amount).toEqual(mockAmount);
      expect(request.payee).toBe('GAPAYEE123');
      expect(request.description).toBe('Access to premium content');
      expect(request.status).toBe(PaymentStatus.PENDING);
      expect(request.paymentUrl).toBe('https://example.com/api/payments/verify');
      expect(request.expiresAt).toBeGreaterThan(Date.now());
    });

    it('should use default values when options not provided', async () => {
      const request = await createPaymentRequest('/content', mockAmount, 'GAPAYEE123');

      expect(request.description).toBeUndefined();
      expect(request.paymentUrl).toBe('/api/payments/verify');
      expect(request.expiresAt).toBeGreaterThan(Date.now());
    });

    it('should store the payment request', async () => {
      const request = await createPaymentRequest('/content', mockAmount, 'GAPAYEE123');
      const stored = await mockStorage.get(request.id);

      expect(stored).toEqual(request);
    });
  });
});
