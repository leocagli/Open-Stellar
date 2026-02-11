/**
 * Payment system configuration
 */

import type { StellarNetwork } from './types';

/**
 * Stellar network URLs
 */
export const STELLAR_NETWORKS = {
  testnet: 'https://horizon-testnet.stellar.org',
  mainnet: 'https://horizon.stellar.org',
} as const;

/**
 * Default network passphrase
 */
export const STELLAR_NETWORK_PASSPHRASES = {
  testnet: 'Test SDF Network ; September 2015',
  mainnet: 'Public Global Stellar Network ; September 2015',
} as const;

/**
 * Default escrow timeout (24 hours in milliseconds)
 */
export const DEFAULT_ESCROW_TIMEOUT_MS = 24 * 60 * 60 * 1000;

/**
 * Payment request timeout (1 hour in milliseconds)
 */
export const PAYMENT_REQUEST_TIMEOUT_MS = 60 * 60 * 1000;

/**
 * HTTP 402 Payment Required status code
 */
export const HTTP_402_PAYMENT_REQUIRED = 402;

/**
 * Custom payment processing success code
 */
export const PAYMENT_CODE_8004_SUCCESS = 8004;

/**
 * Custom payment processing error codes
 */
export const PAYMENT_ERROR_CODES = {
  INVALID_PAYMENT: 8001,
  INSUFFICIENT_FUNDS: 8002,
  PAYMENT_EXPIRED: 8003,
  ESCROW_NOT_FOUND: 8005,
  ESCROW_INVALID_STATE: 8006,
  UNAUTHORIZED: 8007,
  NETWORK_ERROR: 8008,
} as const;

/**
 * Minimum XLM balance for account (Stellar base reserve)
 */
export const STELLAR_MIN_BALANCE = '1';

/**
 * Get Stellar network configuration
 */
export function getStellarConfig(network: StellarNetwork = 'testnet') {
  return {
    horizonUrl: STELLAR_NETWORKS[network],
    networkPassphrase: STELLAR_NETWORK_PASSPHRASES[network],
  };
}
