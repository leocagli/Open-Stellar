/**
 * Tests for Payment Types
 */

import { describe, it, expect } from 'vitest';
import { EscrowState } from './types';
import type { 
  PaymentRequest, 
  PaymentResponse, 
  EscrowContract,
  X402Response,
  Payment8004Request,
  Payment8004Response 
} from './types';

describe('Payment Types', () => {
  it('should validate PaymentRequest structure', () => {
    const request: PaymentRequest = {
      amount: '10',
      asset: 'XLM',
      destination: 'GTEST123',
      memo: 'Test payment',
      source: 'GSOURCE123',
    };
    
    expect(request.amount).toBe('10');
    expect(request.asset).toBe('XLM');
    expect(request.destination).toBe('GTEST123');
  });
  
  it('should validate PaymentResponse structure', () => {
    const response: PaymentResponse = {
      success: true,
      transactionHash: 'tx_abc123',
      paymentId: 'pay_123',
    };
    
    expect(response.success).toBe(true);
    expect(response.transactionHash).toBeDefined();
  });
  
  it('should validate EscrowContract structure', () => {
    const contract: EscrowContract = {
      id: 'escrow_123',
      buyer: 'GBUYER',
      seller: 'GSELLER',
      arbiter: 'GARBITER',
      amount: '100',
      asset: 'XLM',
      state: EscrowState.CREATED,
      createdAt: Date.now(),
      expiresAt: Date.now() + 30 * 24 * 60 * 60 * 1000,
    };
    
    expect(contract.id).toBe('escrow_123');
    expect(contract.state).toBe(EscrowState.CREATED);
  });
  
  it('should validate X402Response structure', () => {
    const response: X402Response = {
      statusCode: 402,
      message: 'Payment Required',
      paymentRequired: {
        amount: '10',
        asset: 'XLM',
        destination: 'GTEST',
        paymentId: 'pay_123',
      },
    };
    
    expect(response.statusCode).toBe(402);
    expect(response.paymentRequired).toBeDefined();
  });
  
  it('should validate Payment8004Request structure', () => {
    const request: Payment8004Request = {
      paymentId: 'pay_123',
      transactionHash: 'tx_abc',
    };
    
    expect(request.paymentId).toBeDefined();
    expect(request.transactionHash).toBeDefined();
  });
  
  it('should validate Payment8004Response structure', () => {
    const response: Payment8004Response = {
      validated: true,
      status: 'confirmed',
      confirmations: 1,
    };
    
    expect(response.validated).toBe(true);
    expect(response.status).toBe('confirmed');
  });
  
  it('should have all EscrowState values', () => {
    expect(EscrowState.CREATED).toBe('created');
    expect(EscrowState.FUNDED).toBe('funded');
    expect(EscrowState.RELEASED).toBe('released');
    expect(EscrowState.REFUNDED).toBe('refunded');
    expect(EscrowState.DISPUTED).toBe('disputed');
  });
});
