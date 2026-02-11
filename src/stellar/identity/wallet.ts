/**
 * Stellar Wallet and Keypair Management
 * 
 * Provides wallet creation and key management for Stellar agents
 */

import * as StellarSdk from '@stellar/stellar-sdk';
import { StellarAgentIdentity, StellarConfig } from '../types';

/**
 * Generate a new Stellar keypair for an agent
 */
export function generateKeypair(): StellarSdk.Keypair {
  return StellarSdk.Keypair.random();
}

/**
 * Create a Stellar keypair from a secret key
 */
export function keypairFromSecret(secret: string): StellarSdk.Keypair {
  return StellarSdk.Keypair.fromSecret(secret);
}

/**
 * Create a Stellar keypair from a public key (for verification only)
 */
export function keypairFromPublicKey(publicKey: string): StellarSdk.Keypair {
  return StellarSdk.Keypair.fromPublicKey(publicKey);
}

/**
 * Validate a Stellar public key
 */
export function isValidPublicKey(publicKey: string): boolean {
  try {
    StellarSdk.StrKey.decodeEd25519PublicKey(publicKey);
    return true;
  } catch {
    return false;
  }
}

/**
 * Validate a Stellar secret key
 */
export function isValidSecretKey(secret: string): boolean {
  try {
    StellarSdk.StrKey.decodeEd25519SecretSeed(secret);
    return true;
  } catch {
    return false;
  }
}

/**
 * Create an agent identity from a keypair
 */
export function createAgentIdentity(
  keypair: StellarSdk.Keypair,
  agentId: string,
  metadata?: Record<string, any>
): StellarAgentIdentity {
  return {
    publicKey: keypair.publicKey(),
    agentId,
    metadata: {
      ...metadata,
      created: Date.now(),
    },
  };
}

/**
 * Get the network configuration for Stellar
 */
export function getNetworkConfig(network: 'public' | 'testnet'): StellarConfig {
  if (network === 'public') {
    return {
      network: 'public',
      horizonUrl: 'https://horizon.stellar.org',
      networkPassphrase: StellarSdk.Networks.PUBLIC,
    };
  } else {
    return {
      network: 'testnet',
      horizonUrl: 'https://horizon-testnet.stellar.org',
      networkPassphrase: StellarSdk.Networks.TESTNET,
    };
  }
}

/**
 * Fund a testnet account (only works on testnet)
 */
export async function fundTestnetAccount(publicKey: string): Promise<boolean> {
  try {
    const response = await fetch(
      `https://friendbot.stellar.org?addr=${encodeURIComponent(publicKey)}`
    );
    return response.ok;
  } catch (error) {
    console.error('Failed to fund testnet account:', error);
    return false;
  }
}

/**
 * Check if a Stellar account exists
 */
export async function accountExists(
  publicKey: string,
  config: StellarConfig
): Promise<boolean> {
  try {
    const server = new StellarSdk.Horizon.Server(
      config.horizonUrl || 'https://horizon.stellar.org'
    );
    await server.loadAccount(publicKey);
    return true;
  } catch {
    return false;
  }
}
