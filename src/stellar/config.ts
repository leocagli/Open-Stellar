/**
 * Stellar Network Configuration
 */

export const STELLAR_CONFIG = {
  // Stellar network configuration
  NETWORK_PASSPHRASE: process.env.STELLAR_NETWORK === 'mainnet' 
    ? 'Public Global Stellar Network ; September 2015'
    : 'Test SDF Network ; September 2015',
  
  // Horizon server URLs
  HORIZON_URL: process.env.STELLAR_NETWORK === 'mainnet'
    ? 'https://horizon.stellar.org'
    : 'https://horizon-testnet.stellar.org',
  
  // Soroban RPC URLs
  SOROBAN_RPC_URL: process.env.STELLAR_NETWORK === 'mainnet'
    ? 'https://soroban-rpc.stellar.org'
    : 'https://soroban-testnet.stellar.org',
  
  // Network type
  NETWORK: (process.env.STELLAR_NETWORK || 'testnet') as 'testnet' | 'mainnet',
  
  // Contract IDs (to be deployed)
  CONTRACTS: {
    ESCROW: process.env.STELLAR_ESCROW_CONTRACT_ID || '',
    ORDER_MATCHING: process.env.STELLAR_ORDER_MATCHING_CONTRACT_ID || '',
  },
  
  // Transaction settings
  BASE_FEE: '100000', // 0.01 XLM
  TIMEOUT: 180, // 3 minutes
  
  // Asset codes
  NATIVE_ASSET: 'XLM',
  
  // Escrow settings
  ESCROW_MIN_AMOUNT: '1', // Minimum 1 XLM for escrow
  TIME_LOCK_DEFAULT: 3600, // 1 hour default time lock
} as const;

export type StellarNetwork = typeof STELLAR_CONFIG.NETWORK;
