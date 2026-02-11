/**
 * Stellar Agent Identity and Authentication Types
 * 
 * Adapted from ERC-8004 (Sign-In With Agent) for Stellar blockchain
 */

/**
 * Agent identity information stored on Stellar
 * Replaces ERC-8004 NFT identity with Stellar account-based identity
 */
export interface StellarAgentIdentity {
  /** Stellar public key (G... format) */
  publicKey: string;
  
  /** Agent identifier (unique name/ID) */
  agentId: string;
  
  /** Optional metadata */
  metadata?: {
    name?: string;
    description?: string;
    created?: number;
    [key: string]: any;
  };
}

/**
 * SIWA message structure adapted for Stellar
 * Similar to Sign-In With Ethereum (EIP-4361) but for Stellar
 */
export interface StellarSIWAMessage {
  /** Domain requesting the sign-in */
  domain: string;
  
  /** Stellar public key of the agent */
  address: string;
  
  /** Agent identifier */
  agentId: string;
  
  /** Statement/description */
  statement?: string;
  
  /** URI of the request origin */
  uri: string;
  
  /** Version of the message format */
  version: string;
  
  /** Chain ID (for Stellar: 'public' or 'testnet') */
  chainId: string;
  
  /** Random nonce */
  nonce: string;
  
  /** Issuance timestamp (ISO 8601) */
  issuedAt: string;
  
  /** Optional expiration timestamp */
  expirationTime?: string;
  
  /** Optional not-before timestamp */
  notBefore?: string;
  
  /** Optional request ID */
  requestId?: string;
  
  /** Optional resources */
  resources?: string[];
}

/**
 * Nonce for SIWA authentication
 */
export interface StellarNonce {
  /** The nonce value */
  value: string;
  
  /** Stellar public key this nonce is for */
  publicKey: string;
  
  /** Agent ID this nonce is for */
  agentId: string;
  
  /** Timestamp when created */
  createdAt: number;
  
  /** Expiration timestamp */
  expiresAt: number;
  
  /** Whether this nonce has been used */
  used: boolean;
}

/**
 * Verification result
 */
export interface StellarVerificationResult {
  /** Whether verification succeeded */
  success: boolean;
  
  /** The verified agent identity */
  identity?: StellarAgentIdentity;
  
  /** Error message if verification failed */
  error?: string;
  
  /** Verification receipt (JWT or similar) */
  receipt?: string;
}

/**
 * Escrow account configuration
 * Uses Stellar's native multi-signature and time-bounds features
 */
export interface StellarEscrowAccount {
  /** Escrow account public key */
  publicKey: string;
  
  /** Signers required for the escrow */
  signers: {
    publicKey: string;
    weight: number;
  }[];
  
  /** Threshold for signatures */
  threshold: number;
  
  /** Optional time bounds */
  timeBounds?: {
    minTime?: number;
    maxTime?: number;
  };
  
  /** Asset being held in escrow */
  asset?: {
    code: string;
    issuer?: string;
  };
  
  /** Amount in escrow */
  amount?: string;
}

/**
 * Signature data for Stellar messages
 */
export interface StellarSignature {
  /** The signature in base64 format */
  signature: string;
  
  /** Public key that created the signature */
  publicKey: string;
  
  /** The message that was signed */
  message: string;
}

/**
 * Configuration for Stellar integration
 */
export interface StellarConfig {
  /** Network: 'public' or 'testnet' */
  network: 'public' | 'testnet';
  
  /** Horizon server URL */
  horizonUrl?: string;
  
  /** Network passphrase */
  networkPassphrase?: string;
}
