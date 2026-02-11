/**
 * Tests for Stellar SIWA Authentication
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
  createNonce,
  validateNonce,
  registerIdentity,
  getIdentity,
  isRegistered,
  verifySIWA,
  verifyReceipt,
} from './siwa';
import { generateKeypair, createAgentIdentity } from '../identity/wallet';
import { createSIWAMessage, signSIWAMessage, formatSIWAMessage } from '../identity/signing';

describe('Stellar SIWA Authentication', () => {
  describe('createNonce', () => {
    it('should create a valid nonce', async () => {
      const keypair = generateKeypair();
      const publicKey = keypair.publicKey();
      const agentId = 'test-agent';

      const nonce = await createNonce(publicKey, agentId);

      expect(nonce.value).toBeTruthy();
      expect(nonce.value.length).toBe(64); // 32 bytes in hex
      expect(nonce.publicKey).toBe(publicKey);
      expect(nonce.agentId).toBe(agentId);
      expect(nonce.used).toBe(false);
      expect(nonce.expiresAt).toBeGreaterThan(Date.now());
    });

    it('should create unique nonces', async () => {
      const keypair = generateKeypair();
      const publicKey = keypair.publicKey();
      const agentId = 'test-agent';

      const nonce1 = await createNonce(publicKey, agentId);
      const nonce2 = await createNonce(publicKey, agentId);

      expect(nonce1.value).not.toBe(nonce2.value);
    });

    it('should respect TTL parameter', async () => {
      const keypair = generateKeypair();
      const publicKey = keypair.publicKey();
      const agentId = 'test-agent';
      const ttl = 60; // 1 minute

      const nonce = await createNonce(publicKey, agentId, ttl);

      const expectedExpiry = Date.now() + (ttl * 1000);
      expect(nonce.expiresAt).toBeGreaterThanOrEqual(expectedExpiry - 100);
      expect(nonce.expiresAt).toBeLessThanOrEqual(expectedExpiry + 100);
    });
  });

  describe('validateNonce', () => {
    it('should validate correct nonce', async () => {
      const keypair = generateKeypair();
      const publicKey = keypair.publicKey();
      const agentId = 'test-agent';

      const nonce = await createNonce(publicKey, agentId);
      const validation = validateNonce(nonce.value, publicKey, agentId);

      expect(validation.valid).toBe(true);
      expect(validation.error).toBeUndefined();
    });

    it('should reject non-existent nonce', () => {
      const keypair = generateKeypair();
      const publicKey = keypair.publicKey();
      const agentId = 'test-agent';

      const validation = validateNonce('nonexistent', publicKey, agentId);

      expect(validation.valid).toBe(false);
      expect(validation.error).toBe('Nonce not found');
    });

    it('should reject mismatched nonce value', async () => {
      const keypair = generateKeypair();
      const publicKey = keypair.publicKey();
      const agentId = 'test-agent';

      await createNonce(publicKey, agentId);
      const validation = validateNonce('wrongvalue', publicKey, agentId);

      expect(validation.valid).toBe(false);
      expect(validation.error).toBe('Nonce mismatch');
    });

    it('should reject expired nonce', async () => {
      const keypair = generateKeypair();
      const publicKey = keypair.publicKey();
      const agentId = 'test-agent';

      // Create nonce with 1 second TTL
      const nonce = await createNonce(publicKey, agentId, 1);
      
      // Wait for it to expire
      await new Promise(resolve => setTimeout(resolve, 1100));
      
      const validation = validateNonce(nonce.value, publicKey, agentId);

      expect(validation.valid).toBe(false);
      // After expiry, the nonce is cleaned up so it's "not found"
      expect(validation.error).toMatch(/Nonce (expired|not found)/);
    });
  });

  describe('Identity Registration', () => {
    it('should register and retrieve identity', () => {
      const keypair = generateKeypair();
      const identity = createAgentIdentity(keypair, 'test-agent');

      registerIdentity(identity);

      expect(isRegistered(identity.publicKey)).toBe(true);
      
      const retrieved = getIdentity(identity.publicKey);
      expect(retrieved).toEqual(identity);
    });

    it('should return undefined for non-registered identity', () => {
      const keypair = generateKeypair();
      const retrieved = getIdentity(keypair.publicKey());

      expect(retrieved).toBeUndefined();
      expect(isRegistered(keypair.publicKey())).toBe(false);
    });
  });

  describe('verifySIWA', () => {
    it('should verify valid SIWA authentication', async () => {
      const keypair = generateKeypair();
      const publicKey = keypair.publicKey();
      const agentId = 'test-agent';
      const domain = 'example.com';

      // Create nonce
      const nonce = await createNonce(publicKey, agentId);

      // Create and sign message
      const message = createSIWAMessage({
        domain,
        address: publicKey,
        agentId,
        uri: 'https://example.com/api',
        chainId: 'testnet',
        nonce: nonce.value,
      });

      const { signature } = signSIWAMessage(message, keypair);
      const messageStr = formatSIWAMessage(message);

      // Verify
      const result = await verifySIWA(messageStr, signature, domain);

      expect(result.success).toBe(true);
      expect(result.identity).toBeDefined();
      expect(result.identity?.publicKey).toBe(publicKey);
      expect(result.receipt).toBeTruthy();
    });

    it('should reject message with wrong domain', async () => {
      const keypair = generateKeypair();
      const publicKey = keypair.publicKey();
      const agentId = 'test-agent';

      const nonce = await createNonce(publicKey, agentId);

      const message = createSIWAMessage({
        domain: 'wrong.com',
        address: publicKey,
        agentId,
        uri: 'https://example.com/api',
        chainId: 'testnet',
        nonce: nonce.value,
      });

      const { signature } = signSIWAMessage(message, keypair);
      const messageStr = formatSIWAMessage(message);

      const result = await verifySIWA(messageStr, signature, 'example.com');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Domain mismatch');
    });

    it('should reject expired message', async () => {
      const keypair = generateKeypair();
      const publicKey = keypair.publicKey();
      const agentId = 'test-agent';
      const domain = 'example.com';

      const nonce = await createNonce(publicKey, agentId);

      const message = createSIWAMessage({
        domain,
        address: publicKey,
        agentId,
        uri: 'https://example.com/api',
        chainId: 'testnet',
        nonce: nonce.value,
        expirationTime: new Date(Date.now() - 1000).toISOString(), // Expired
      });

      const { signature } = signSIWAMessage(message, keypair);
      const messageStr = formatSIWAMessage(message);

      const result = await verifySIWA(messageStr, signature, domain);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Message expired');
    });

    it('should reject invalid signature', async () => {
      const keypair = generateKeypair();
      const otherKeypair = generateKeypair();
      const publicKey = keypair.publicKey();
      const agentId = 'test-agent';
      const domain = 'example.com';

      const nonce = await createNonce(publicKey, agentId);

      const message = createSIWAMessage({
        domain,
        address: publicKey,
        agentId,
        uri: 'https://example.com/api',
        chainId: 'testnet',
        nonce: nonce.value,
      });

      // Sign with wrong key
      const { signature } = signSIWAMessage(message, otherKeypair);
      const messageStr = formatSIWAMessage(message);

      const result = await verifySIWA(messageStr, signature, domain);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Invalid signature');
    });
  });

  describe('verifyReceipt', () => {
    it('should verify valid receipt', async () => {
      const keypair = generateKeypair();
      const publicKey = keypair.publicKey();
      const agentId = 'test-agent';
      const domain = 'example.com';

      const nonce = await createNonce(publicKey, agentId);

      const message = createSIWAMessage({
        domain,
        address: publicKey,
        agentId,
        uri: 'https://example.com/api',
        chainId: 'testnet',
        nonce: nonce.value,
      });

      const { signature } = signSIWAMessage(message, keypair);
      const messageStr = formatSIWAMessage(message);

      const verifyResult = await verifySIWA(messageStr, signature, domain);
      expect(verifyResult.success).toBe(true);
      expect(verifyResult.receipt).toBeTruthy();

      const receiptVerification = verifyReceipt(verifyResult.receipt!);

      expect(receiptVerification.valid).toBe(true);
      expect(receiptVerification.publicKey).toBe(publicKey);
      expect(receiptVerification.agentId).toBe(agentId);
    });

    it('should reject invalid receipt', () => {
      const result = verifyReceipt('invalid-receipt');

      expect(result.valid).toBe(false);
      expect(result.error).toBe('Invalid receipt');
    });
  });
});
