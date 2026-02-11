/**
 * Tests for Stellar integration utilities
 */

import { describe, it, expect, vi } from 'vitest';
import {
  generateKeypair,
  loadAccount,
  getStellarServer,
} from './stellar';

describe('Stellar Integration', () => {
  describe('generateKeypair', () => {
    it('should generate a valid keypair', () => {
      const keypair = generateKeypair();
      
      expect(keypair).toHaveProperty('publicKey');
      expect(keypair).toHaveProperty('secretKey');
      expect(keypair.publicKey).toMatch(/^G[A-Z0-9]{55}$/);
      expect(keypair.secretKey).toMatch(/^S[A-Z0-9]{55}$/);
    });

    it('should generate unique keypairs', () => {
      const keypair1 = generateKeypair();
      const keypair2 = generateKeypair();
      
      expect(keypair1.publicKey).not.toBe(keypair2.publicKey);
      expect(keypair1.secretKey).not.toBe(keypair2.secretKey);
    });
  });

  describe('loadAccount', () => {
    it('should load account from secret key', () => {
      const original = generateKeypair();
      const loaded = loadAccount(original.secretKey!);
      
      expect(loaded.publicKey).toBe(original.publicKey);
      expect(loaded.secretKey).toBe(original.secretKey);
    });

    it('should throw error for invalid secret key', () => {
      expect(() => loadAccount('invalid')).toThrow();
    });
  });

  describe('getStellarServer', () => {
    it('should return testnet server by default', () => {
      const server = getStellarServer();
      expect(server.serverURL.toString()).toContain('testnet');
    });

    it('should return mainnet server when specified', () => {
      const server = getStellarServer('mainnet');
      expect(server.serverURL.toString()).toContain('horizon.stellar.org');
    });
  });
});
