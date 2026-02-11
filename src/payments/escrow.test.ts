/**
 * Tests for Trusstles Escrow System
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
  generateEscrowId,
  canAutoRelease,
  isEscrowExpired,
  getEscrowStatus,
} from './escrow';
import { EscrowState, type EscrowConfig, type PaymentAmount } from './types';
import { DEFAULT_ESCROW_TIMEOUT_MS } from './config';

describe('Trusstles Escrow System', () => {
  let mockEscrow: EscrowConfig;
  const mockAmount: PaymentAmount = {
    amount: '100',
    asset: { code: 'XLM' },
  };

  beforeEach(() => {
    mockEscrow = {
      id: 'test-escrow-123',
      participants: {
        payer: 'GAPAYER123',
        payee: 'GAPAYEE456',
      },
      amount: mockAmount,
      state: EscrowState.CREATED,
      createdAt: Date.now(),
      expiresAt: Date.now() + DEFAULT_ESCROW_TIMEOUT_MS,
      transactionHashes: {},
    };
  });

  describe('generateEscrowId', () => {
    it('should generate a unique escrow ID', () => {
      const id1 = generateEscrowId();
      const id2 = generateEscrowId();
      
      expect(id1).toMatch(/^escrow_/);
      expect(id1).not.toBe(id2);
    });
  });

  describe('isEscrowExpired', () => {
    it('should return false for non-expired escrow', () => {
      expect(isEscrowExpired(mockEscrow)).toBe(false);
    });

    it('should return true for expired escrow', () => {
      const expiredEscrow = {
        ...mockEscrow,
        expiresAt: Date.now() - 1000,
      };
      expect(isEscrowExpired(expiredEscrow)).toBe(true);
    });
  });

  describe('canAutoRelease', () => {
    it('should return false if escrow not funded', () => {
      expect(canAutoRelease(mockEscrow)).toBe(false);
    });

    it('should return false if no autoReleaseAfter set', () => {
      const fundedEscrow = {
        ...mockEscrow,
        state: EscrowState.FUNDED,
      };
      expect(canAutoRelease(fundedEscrow)).toBe(false);
    });

    it('should return true if funded and autoReleaseAfter time reached', () => {
      const autoReleaseEscrow = {
        ...mockEscrow,
        state: EscrowState.FUNDED,
        conditions: {
          autoReleaseAfter: Date.now() - 1000,
        },
      };
      expect(canAutoRelease(autoReleaseEscrow)).toBe(true);
    });

    it('should return false if funded but autoReleaseAfter time not reached', () => {
      const futureReleaseEscrow = {
        ...mockEscrow,
        state: EscrowState.FUNDED,
        conditions: {
          autoReleaseAfter: Date.now() + 10000,
        },
      };
      expect(canAutoRelease(futureReleaseEscrow)).toBe(false);
    });
  });

  describe('getEscrowStatus', () => {
    it('should return correct status for created escrow', () => {
      const status = getEscrowStatus(mockEscrow);
      
      expect(status.state).toBe(EscrowState.CREATED);
      expect(status.canRelease).toBe(false);
      expect(status.canRefund).toBe(false);
      expect(status.isExpired).toBe(false);
      expect(status.canAutoRelease).toBe(false);
    });

    it('should return correct status for funded escrow', () => {
      const fundedEscrow = {
        ...mockEscrow,
        state: EscrowState.FUNDED,
      };
      const status = getEscrowStatus(fundedEscrow);
      
      expect(status.state).toBe(EscrowState.FUNDED);
      expect(status.canRelease).toBe(true);
      expect(status.canRefund).toBe(true);
      expect(status.isExpired).toBe(false);
    });

    it('should not allow release if expired', () => {
      const expiredEscrow = {
        ...mockEscrow,
        state: EscrowState.FUNDED,
        expiresAt: Date.now() - 1000,
      };
      const status = getEscrowStatus(expiredEscrow);
      
      expect(status.canRelease).toBe(false);
      expect(status.canRefund).toBe(true);
      expect(status.isExpired).toBe(true);
    });

    it('should detect auto-release eligibility', () => {
      const autoReleaseEscrow = {
        ...mockEscrow,
        state: EscrowState.FUNDED,
        conditions: {
          autoReleaseAfter: Date.now() - 1000,
        },
      };
      const status = getEscrowStatus(autoReleaseEscrow);
      
      expect(status.canAutoRelease).toBe(true);
    });
  });
});
