/**
 * Tests for 8004 Payment Processing
 */

import { describe, it, expect } from 'vitest';
import { get8004ResultMessage } from './8004';
import {
  PAYMENT_CODE_8004_SUCCESS,
  PAYMENT_ERROR_CODES,
} from './config';

describe('8004 Payment Processing', () => {
  describe('get8004ResultMessage', () => {
    it('should return success message for 8004 code', () => {
      const message = get8004ResultMessage(PAYMENT_CODE_8004_SUCCESS);
      expect(message).toBe('Payment processed successfully');
    });

    it('should return correct message for each error code', () => {
      expect(get8004ResultMessage(PAYMENT_ERROR_CODES.INVALID_PAYMENT))
        .toBe('Invalid payment transaction');
      
      expect(get8004ResultMessage(PAYMENT_ERROR_CODES.INSUFFICIENT_FUNDS))
        .toBe('Insufficient funds for payment');
      
      expect(get8004ResultMessage(PAYMENT_ERROR_CODES.PAYMENT_EXPIRED))
        .toBe('Payment request has expired');
      
      expect(get8004ResultMessage(PAYMENT_ERROR_CODES.ESCROW_NOT_FOUND))
        .toBe('Escrow not found');
      
      expect(get8004ResultMessage(PAYMENT_ERROR_CODES.ESCROW_INVALID_STATE))
        .toBe('Escrow in invalid state for this operation');
      
      expect(get8004ResultMessage(PAYMENT_ERROR_CODES.UNAUTHORIZED))
        .toBe('Unauthorized to perform this operation');
      
      expect(get8004ResultMessage(PAYMENT_ERROR_CODES.NETWORK_ERROR))
        .toBe('Network error during payment processing');
    });

    it('should return unknown error message for unrecognized code', () => {
      const message = get8004ResultMessage(9999);
      expect(message).toBe('Unknown payment error');
    });
  });
});
