/**
 * Tests for Stellar Message Signing
 */

import { describe, it, expect } from 'vitest';
import {
  formatSIWAMessage,
  parseSIWAMessage,
  signSIWAMessage,
  signMessage,
  verifySignature,
  verifySIWASignature,
  createSIWAMessage,
} from './signing';
import { generateKeypair } from './wallet';
import type { StellarSIWAMessage } from '../types';

describe('Stellar Message Signing', () => {
  describe('formatSIWAMessage', () => {
    it('should format SIWA message correctly', () => {
      const message: StellarSIWAMessage = {
        domain: 'example.com',
        address: 'GXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX',
        agentId: 'test-agent',
        uri: 'https://example.com/api',
        version: '1',
        chainId: 'testnet',
        nonce: 'abc123',
        issuedAt: '2024-01-01T00:00:00.000Z',
      };

      const formatted = formatSIWAMessage(message);

      expect(formatted).toContain('example.com wants you to sign in');
      expect(formatted).toContain('URI: https://example.com/api');
      expect(formatted).toContain('Version: 1');
      expect(formatted).toContain('Chain ID: testnet');
      expect(formatted).toContain('Nonce: abc123');
      expect(formatted).toContain('Agent ID: test-agent');
    });

    it('should include optional fields when present', () => {
      const message: StellarSIWAMessage = {
        domain: 'example.com',
        address: 'GXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX',
        agentId: 'test-agent',
        uri: 'https://example.com/api',
        version: '1',
        chainId: 'testnet',
        nonce: 'abc123',
        issuedAt: '2024-01-01T00:00:00.000Z',
        statement: 'Sign in to access AI services',
        expirationTime: '2024-01-02T00:00:00.000Z',
        resources: ['https://example.com/resource1', 'https://example.com/resource2'],
      };

      const formatted = formatSIWAMessage(message);

      expect(formatted).toContain('Sign in to access AI services');
      expect(formatted).toContain('Expiration Time: 2024-01-02T00:00:00.000Z');
      expect(formatted).toContain('Resources:');
      expect(formatted).toContain('- https://example.com/resource1');
      expect(formatted).toContain('- https://example.com/resource2');
    });
  });

  describe('parseSIWAMessage', () => {
    it('should parse formatted SIWA message correctly', () => {
      const original: StellarSIWAMessage = {
        domain: 'example.com',
        address: 'GXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX',
        agentId: 'test-agent',
        uri: 'https://example.com/api',
        version: '1',
        chainId: 'testnet',
        nonce: 'abc123',
        issuedAt: '2024-01-01T00:00:00.000Z',
      };

      const formatted = formatSIWAMessage(original);
      const parsed = parseSIWAMessage(formatted);

      expect(parsed).not.toBeNull();
      expect(parsed?.domain).toBe(original.domain);
      expect(parsed?.address).toBe(original.address);
      expect(parsed?.agentId).toBe(original.agentId);
      expect(parsed?.uri).toBe(original.uri);
      expect(parsed?.version).toBe(original.version);
      expect(parsed?.chainId).toBe(original.chainId);
      expect(parsed?.nonce).toBe(original.nonce);
      expect(parsed?.issuedAt).toBe(original.issuedAt);
    });

    it('should return null for invalid message format', () => {
      expect(parseSIWAMessage('invalid message')).toBeNull();
      expect(parseSIWAMessage('')).toBeNull();
    });
  });

  describe('signMessage', () => {
    it('should sign a message and produce valid signature', () => {
      const keypair = generateKeypair();
      const message = 'Hello, Stellar!';

      const result = signMessage(message, keypair);

      expect(result.signature).toBeTruthy();
      expect(result.publicKey).toBe(keypair.publicKey());
      expect(result.message).toBe(message);
    });
  });

  describe('verifySignature', () => {
    it('should verify valid signature', () => {
      const keypair = generateKeypair();
      const message = 'Hello, Stellar!';

      const { signature, publicKey } = signMessage(message, keypair);
      const isValid = verifySignature(message, signature, publicKey);

      expect(isValid).toBe(true);
    });

    it('should reject invalid signature', () => {
      const keypair = generateKeypair();
      const message = 'Hello, Stellar!';

      const { signature, publicKey } = signMessage(message, keypair);
      const isValid = verifySignature('Different message', signature, publicKey);

      expect(isValid).toBe(false);
    });

    it('should reject signature from wrong key', () => {
      const keypair1 = generateKeypair();
      const keypair2 = generateKeypair();
      const message = 'Hello, Stellar!';

      const { signature } = signMessage(message, keypair1);
      const isValid = verifySignature(message, signature, keypair2.publicKey());

      expect(isValid).toBe(false);
    });
  });

  describe('signSIWAMessage and verifySIWASignature', () => {
    it('should sign and verify SIWA message', () => {
      const keypair = generateKeypair();
      const message = createSIWAMessage({
        domain: 'example.com',
        address: keypair.publicKey(),
        agentId: 'test-agent',
        uri: 'https://example.com/api',
        chainId: 'testnet',
        nonce: 'abc123',
      });

      const { signature } = signSIWAMessage(message, keypair);
      const isValid = verifySIWASignature(message, signature, keypair.publicKey());

      expect(isValid).toBe(true);
    });

    it('should reject SIWA message with wrong address', () => {
      const keypair = generateKeypair();
      const otherKeypair = generateKeypair();
      
      const message = createSIWAMessage({
        domain: 'example.com',
        address: otherKeypair.publicKey(), // Different address
        agentId: 'test-agent',
        uri: 'https://example.com/api',
        chainId: 'testnet',
        nonce: 'abc123',
      });

      const { signature } = signSIWAMessage(message, keypair);
      const isValid = verifySIWASignature(message, signature, keypair.publicKey());

      expect(isValid).toBe(false);
    });
  });

  describe('createSIWAMessage', () => {
    it('should create SIWA message with required fields', () => {
      const message = createSIWAMessage({
        domain: 'example.com',
        address: 'GXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX',
        agentId: 'test-agent',
        uri: 'https://example.com/api',
        chainId: 'testnet',
        nonce: 'abc123',
      });

      expect(message.domain).toBe('example.com');
      expect(message.address).toBe('GXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX');
      expect(message.agentId).toBe('test-agent');
      expect(message.uri).toBe('https://example.com/api');
      expect(message.version).toBe('1');
      expect(message.chainId).toBe('testnet');
      expect(message.nonce).toBe('abc123');
      expect(message.issuedAt).toBeTruthy();
    });

    it('should include optional fields', () => {
      const message = createSIWAMessage({
        domain: 'example.com',
        address: 'GXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX',
        agentId: 'test-agent',
        uri: 'https://example.com/api',
        chainId: 'testnet',
        nonce: 'abc123',
        statement: 'Sign in to access services',
        resources: ['resource1', 'resource2'],
      });

      expect(message.statement).toBe('Sign in to access services');
      expect(message.resources).toEqual(['resource1', 'resource2']);
    });
  });
});
