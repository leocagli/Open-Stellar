/**
 * Stellar Authentication
 * 
 * Implements SIWA-style authentication flow for Stellar agents
 */

import * as StellarSdk from '@stellar/stellar-sdk';
import { 
  StellarNonce, 
  StellarSIWAMessage, 
  StellarVerificationResult,
  StellarAgentIdentity,
  StellarConfig,
} from '../types';
import { verifySIWASignature, parseSIWAMessage } from '../identity/signing';
import { accountExists } from '../identity/wallet';

// In-memory nonce storage (in production, use a database or KV store)
const nonceStore = new Map<string, StellarNonce>();

// In-memory identity registry (in production, use a database)
const identityRegistry = new Map<string, StellarAgentIdentity>();

/**
 * Generate a random nonce
 */
function generateNonceValue(): string {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return Array.from(bytes)
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

/**
 * Create a new nonce for agent authentication
 * 
 * @param publicKey - Stellar public key of the agent
 * @param agentId - Agent identifier
 * @param ttlSeconds - Time-to-live in seconds (default: 300 = 5 minutes)
 */
export async function createNonce(
  publicKey: string,
  agentId: string,
  ttlSeconds: number = 300
): Promise<StellarNonce> {
  const now = Date.now();
  const nonce: StellarNonce = {
    value: generateNonceValue(),
    publicKey,
    agentId,
    createdAt: now,
    expiresAt: now + (ttlSeconds * 1000),
    used: false,
  };
  
  const key = `${publicKey}:${agentId}`;
  nonceStore.set(key, nonce);
  
  // Clean up expired nonces
  setTimeout(() => {
    const stored = nonceStore.get(key);
    if (stored && stored.value === nonce.value) {
      nonceStore.delete(key);
    }
  }, ttlSeconds * 1000);
  
  return nonce;
}

/**
 * Validate a nonce
 */
export function validateNonce(
  nonceValue: string,
  publicKey: string,
  agentId: string
): { valid: boolean; error?: string } {
  const key = `${publicKey}:${agentId}`;
  const nonce = nonceStore.get(key);
  
  if (!nonce) {
    return { valid: false, error: 'Nonce not found' };
  }
  
  if (nonce.value !== nonceValue) {
    return { valid: false, error: 'Nonce mismatch' };
  }
  
  if (nonce.used) {
    return { valid: false, error: 'Nonce already used' };
  }
  
  if (Date.now() > nonce.expiresAt) {
    nonceStore.delete(key);
    return { valid: false, error: 'Nonce expired' };
  }
  
  return { valid: true };
}

/**
 * Mark a nonce as used
 */
function markNonceAsUsed(publicKey: string, agentId: string): void {
  const key = `${publicKey}:${agentId}`;
  const nonce = nonceStore.get(key);
  if (nonce) {
    nonce.used = true;
  }
}

/**
 * Register an agent identity
 */
export function registerIdentity(identity: StellarAgentIdentity): void {
  identityRegistry.set(identity.publicKey, identity);
}

/**
 * Get an agent identity by public key
 */
export function getIdentity(publicKey: string): StellarAgentIdentity | undefined {
  return identityRegistry.get(publicKey);
}

/**
 * Check if an agent is registered
 */
export function isRegistered(publicKey: string): boolean {
  return identityRegistry.has(publicKey);
}

/**
 * Verify a SIWA authentication attempt
 * 
 * @param messageStr - The SIWA message string
 * @param signature - The signature in base64 format
 * @param expectedDomain - The domain that should be in the message
 * @param config - Stellar network configuration
 */
export async function verifySIWA(
  messageStr: string,
  signature: string,
  expectedDomain: string,
  config?: StellarConfig
): Promise<StellarVerificationResult> {
  // Parse the message
  const message = parseSIWAMessage(messageStr);
  if (!message) {
    return {
      success: false,
      error: 'Invalid message format',
    };
  }
  
  // Verify domain matches
  if (message.domain !== expectedDomain) {
    return {
      success: false,
      error: 'Domain mismatch',
    };
  }
  
  // Verify the message hasn't expired
  if (message.expirationTime) {
    const expirationDate = new Date(message.expirationTime);
    if (Date.now() > expirationDate.getTime()) {
      return {
        success: false,
        error: 'Message expired',
      };
    }
  }
  
  // Verify not-before time
  if (message.notBefore) {
    const notBeforeDate = new Date(message.notBefore);
    if (Date.now() < notBeforeDate.getTime()) {
      return {
        success: false,
        error: 'Message not yet valid',
      };
    }
  }
  
  // Validate nonce
  const nonceValidation = validateNonce(message.nonce, message.address, message.agentId);
  if (!nonceValidation.valid) {
    return {
      success: false,
      error: nonceValidation.error || 'Invalid nonce',
    };
  }
  
  // Verify signature
  const signatureValid = verifySIWASignature(message, signature, message.address);
  if (!signatureValid) {
    return {
      success: false,
      error: 'Invalid signature',
    };
  }
  
  // Mark nonce as used
  markNonceAsUsed(message.address, message.agentId);
  
  // Get or create identity
  let identity = getIdentity(message.address);
  if (!identity) {
    // Auto-register if not already registered
    identity = {
      publicKey: message.address,
      agentId: message.agentId,
      metadata: {
        created: Date.now(),
      },
    };
    registerIdentity(identity);
  }
  
  // Optionally verify account exists on Stellar network
  if (config) {
    const exists = await accountExists(message.address, config);
    if (!exists) {
      return {
        success: false,
        error: 'Stellar account does not exist',
      };
    }
  }
  
  // Generate verification receipt (simple JWT-like token)
  const receipt = generateReceipt(identity, message);
  
  return {
    success: true,
    identity,
    receipt,
  };
}

/**
 * Generate a verification receipt
 * In production, this should be a signed JWT
 */
function generateReceipt(
  identity: StellarAgentIdentity,
  message: StellarSIWAMessage
): string {
  const payload = {
    publicKey: identity.publicKey,
    agentId: identity.agentId,
    domain: message.domain,
    issuedAt: Date.now(),
    expiresAt: Date.now() + (24 * 60 * 60 * 1000), // 24 hours
  };
  
  // In production, sign this with a server key
  return Buffer.from(JSON.stringify(payload)).toString('base64');
}

/**
 * Verify a receipt
 * In production, this should verify a JWT signature
 */
export function verifyReceipt(receipt: string): {
  valid: boolean;
  publicKey?: string;
  agentId?: string;
  error?: string;
} {
  try {
    const payload = JSON.parse(Buffer.from(receipt, 'base64').toString('utf8'));
    
    if (Date.now() > payload.expiresAt) {
      return { valid: false, error: 'Receipt expired' };
    }
    
    return {
      valid: true,
      publicKey: payload.publicKey,
      agentId: payload.agentId,
    };
  } catch {
    return { valid: false, error: 'Invalid receipt' };
  }
}

/**
 * Clean up expired nonces (should be called periodically)
 */
export function cleanupExpiredNonces(): void {
  const now = Date.now();
  for (const [key, nonce] of nonceStore.entries()) {
    if (now > nonce.expiresAt) {
      nonceStore.delete(key);
    }
  }
}
