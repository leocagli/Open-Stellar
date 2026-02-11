/**
 * Tests for x402 Payment Required Function
 */

import { describe, it, expect } from 'vitest';
import { x402, requirePayment } from './x402';

describe('x402 - HTTP 402 Payment Required', () => {
  it('should generate a valid 402 response', () => {
    const response = x402('10', 'XLM', 'GTEST123');
    
    expect(response.statusCode).toBe(402);
    expect(response.message).toBe('Payment Required');
    expect(response.paymentRequired.amount).toBe('10');
    expect(response.paymentRequired.asset).toBe('XLM');
    expect(response.paymentRequired.destination).toBe('GTEST123');
    expect(response.paymentRequired.paymentId).toMatch(/^pay_\d+_[a-z0-9]+$/);
  });
  
  it('should accept custom message', () => {
    const customMessage = 'Premium content requires payment';
    const response = x402('5', 'XLM', 'GTEST123', customMessage);
    
    expect(response.message).toBe(customMessage);
  });
  
  it('should default to XLM asset', () => {
    const response = x402('10', undefined as any, 'GTEST123');
    
    expect(response.paymentRequired.asset).toBe('XLM');
  });
  
  it('should generate unique payment IDs', () => {
    const response1 = x402('10', 'XLM', 'GTEST123');
    const response2 = x402('10', 'XLM', 'GTEST123');
    
    expect(response1.paymentRequired.paymentId).not.toBe(response2.paymentRequired.paymentId);
  });
  
  it('should support different assets', () => {
    const response = x402('100', 'USDC', 'GTEST123');
    
    expect(response.paymentRequired.asset).toBe('USDC');
  });
});

describe('requirePayment middleware', () => {
  it('should create middleware function', () => {
    const middleware = requirePayment('10', 'XLM', 'GTEST123');
    
    expect(typeof middleware).toBe('function');
  });
  
  // Note: Full middleware testing would require Hono context mocking
  // which would be done in integration tests
});
