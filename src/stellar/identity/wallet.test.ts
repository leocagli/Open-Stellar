/**
 * Tests for Stellar Wallet and Identity Management
 */

import { describe, it, expect } from 'vitest';
import {
  generateKeypair,
  keypairFromSecret,
  keypairFromPublicKey,
  isValidPublicKey,
  isValidSecretKey,
  createAgentIdentity,
} from './wallet';

describe('Stellar Wallet', () => {
  describe('generateKeypair', () => {
    it('should generate a valid Stellar keypair', () => {
      const keypair = generateKeypair();
      
      expect(keypair.publicKey()).toMatch(/^G[A-Z2-7]{55}$/);
      expect(keypair.secret()).toMatch(/^S[A-Z2-7]{55}$/);
    });

    it('should generate unique keypairs', () => {
      const keypair1 = generateKeypair();
      const keypair2 = generateKeypair();
      
      expect(keypair1.publicKey()).not.toBe(keypair2.publicKey());
      expect(keypair1.secret()).not.toBe(keypair2.secret());
    });
  });

  describe('keypairFromSecret', () => {
    it('should create keypair from valid secret key', () => {
      const original = generateKeypair();
      const secret = original.secret();
      
      const restored = keypairFromSecret(secret);
      
      expect(restored.publicKey()).toBe(original.publicKey());
      expect(restored.secret()).toBe(secret);
    });

    it('should throw error for invalid secret key', () => {
      expect(() => keypairFromSecret('INVALID')).toThrow();
    });
  });

  describe('keypairFromPublicKey', () => {
    it('should create keypair from valid public key', () => {
      const original = generateKeypair();
      const publicKey = original.publicKey();
      
      const keypair = keypairFromPublicKey(publicKey);
      
      expect(keypair.publicKey()).toBe(publicKey);
    });

    it('should throw error for invalid public key', () => {
      expect(() => keypairFromPublicKey('INVALID')).toThrow();
    });
  });

  describe('isValidPublicKey', () => {
    it('should return true for valid public key', () => {
      const keypair = generateKeypair();
      expect(isValidPublicKey(keypair.publicKey())).toBe(true);
    });

    it('should return false for invalid public key', () => {
      expect(isValidPublicKey('INVALID')).toBe(false);
      expect(isValidPublicKey('SABC123')).toBe(false); // Secret key format
      expect(isValidPublicKey('')).toBe(false);
    });
  });

  describe('isValidSecretKey', () => {
    it('should return true for valid secret key', () => {
      const keypair = generateKeypair();
      expect(isValidSecretKey(keypair.secret())).toBe(true);
    });

    it('should return false for invalid secret key', () => {
      expect(isValidSecretKey('INVALID')).toBe(false);
      expect(isValidSecretKey('GABC123')).toBe(false); // Public key format
      expect(isValidSecretKey('')).toBe(false);
    });
  });

  describe('createAgentIdentity', () => {
    it('should create agent identity with required fields', () => {
      const keypair = generateKeypair();
      const agentId = 'test-agent-001';
      
      const identity = createAgentIdentity(keypair, agentId);
      
      expect(identity.publicKey).toBe(keypair.publicKey());
      expect(identity.agentId).toBe(agentId);
      expect(identity.metadata).toBeDefined();
      expect(identity.metadata?.created).toBeTypeOf('number');
    });

    it('should include custom metadata', () => {
      const keypair = generateKeypair();
      const agentId = 'test-agent-001';
      const metadata = {
        name: 'Test Agent',
        description: 'A test AI agent',
      };
      
      const identity = createAgentIdentity(keypair, agentId, metadata);
      
      expect(identity.metadata?.name).toBe('Test Agent');
      expect(identity.metadata?.description).toBe('A test AI agent');
      expect(identity.metadata?.created).toBeTypeOf('number');
    });
  });
});
