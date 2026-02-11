/**
 * Stellar API Routes
 * 
 * Provides HTTP endpoints for Stellar agent authentication and escrow management
 */

import { Hono } from 'hono';
import * as StellarSdk from '@stellar/stellar-sdk';
import { 
  generateKeypair,
  createAgentIdentity,
  getNetworkConfig,
  fundTestnetAccount,
} from '../stellar/identity/wallet';
import {
  createSIWAMessage,
  signSIWAMessage,
  formatSIWAMessage,
} from '../stellar/identity/signing';
import {
  createNonce,
  verifySIWA,
  registerIdentity,
  getIdentity,
  isRegistered,
  verifyReceipt,
} from '../stellar/auth/siwa';
import {
  createEscrowAccount,
  setupEscrowOnChain,
  createEscrowPayment,
  signEscrowTransaction,
  submitEscrowTransaction,
  getEscrowAccountDetails,
} from '../stellar/escrow/trustless';

const stellarRoutes = new Hono();

/**
 * POST /api/stellar/keypair
 * Generate a new Stellar keypair for an agent
 */
stellarRoutes.post('/keypair', async (c) => {
  try {
    const keypair = generateKeypair();
    
    return c.json({
      success: true,
      publicKey: keypair.publicKey(),
      secretKey: keypair.secret(),
      warning: 'Store the secret key securely. It cannot be recovered if lost.',
    });
  } catch (error) {
    return c.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to generate keypair',
    }, 500);
  }
});

/**
 * POST /api/stellar/register
 * Register a new agent identity
 * 
 * Body: { publicKey: string, agentId: string, metadata?: object }
 */
stellarRoutes.post('/register', async (c) => {
  try {
    const body = await c.req.json();
    const { publicKey, agentId, metadata } = body;
    
    if (!publicKey || !agentId) {
      return c.json({
        success: false,
        error: 'publicKey and agentId are required',
      }, 400);
    }
    
    // Check if already registered
    if (isRegistered(publicKey)) {
      return c.json({
        success: false,
        error: 'Agent already registered with this public key',
      }, 409);
    }
    
    // Create and register identity
    const keypair = StellarSdk.Keypair.fromPublicKey(publicKey);
    const identity = createAgentIdentity(keypair, agentId, metadata);
    registerIdentity(identity);
    
    return c.json({
      success: true,
      identity,
    });
  } catch (error) {
    return c.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to register agent',
    }, 500);
  }
});

/**
 * POST /api/stellar/nonce
 * Request a nonce for SIWA authentication
 * 
 * Body: { publicKey: string, agentId: string }
 */
stellarRoutes.post('/nonce', async (c) => {
  try {
    const body = await c.req.json();
    const { publicKey, agentId } = body;
    
    if (!publicKey || !agentId) {
      return c.json({
        success: false,
        error: 'publicKey and agentId are required',
      }, 400);
    }
    
    const nonce = await createNonce(publicKey, agentId);
    
    return c.json({
      success: true,
      nonce: nonce.value,
      expiresAt: nonce.expiresAt,
    });
  } catch (error) {
    return c.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create nonce',
    }, 500);
  }
});

/**
 * POST /api/stellar/verify
 * Verify a SIWA authentication
 * 
 * Body: { message: string, signature: string, network?: 'public' | 'testnet' }
 */
stellarRoutes.post('/verify', async (c) => {
  try {
    const body = await c.req.json();
    const { message, signature, network = 'testnet' } = body;
    
    if (!message || !signature) {
      return c.json({
        success: false,
        error: 'message and signature are required',
      }, 400);
    }
    
    // Get domain from request
    const domain = new URL(c.req.url).hostname;
    
    // Get network config
    const config = getNetworkConfig(network as 'public' | 'testnet');
    
    // Verify the SIWA message
    const result = await verifySIWA(message, signature, domain, config);
    
    if (!result.success) {
      return c.json(result, 401);
    }
    
    return c.json(result);
  } catch (error) {
    return c.json({
      success: false,
      error: error instanceof Error ? error.message : 'Verification failed',
    }, 500);
  }
});

/**
 * GET /api/stellar/identity/:publicKey
 * Get agent identity by public key
 */
stellarRoutes.get('/identity/:publicKey', async (c) => {
  try {
    const publicKey = c.req.param('publicKey');
    const identity = getIdentity(publicKey);
    
    if (!identity) {
      return c.json({
        success: false,
        error: 'Identity not found',
      }, 404);
    }
    
    return c.json({
      success: true,
      identity,
    });
  } catch (error) {
    return c.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get identity',
    }, 500);
  }
});

/**
 * POST /api/stellar/fund-testnet
 * Fund a testnet account using Friendbot
 * 
 * Body: { publicKey: string }
 */
stellarRoutes.post('/fund-testnet', async (c) => {
  try {
    const body = await c.req.json();
    const { publicKey } = body;
    
    if (!publicKey) {
      return c.json({
        success: false,
        error: 'publicKey is required',
      }, 400);
    }
    
    const funded = await fundTestnetAccount(publicKey);
    
    if (!funded) {
      return c.json({
        success: false,
        error: 'Failed to fund testnet account',
      }, 500);
    }
    
    return c.json({
      success: true,
      message: 'Testnet account funded successfully',
    });
  } catch (error) {
    return c.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fund account',
    }, 500);
  }
});

/**
 * POST /api/stellar/escrow/create
 * Create an escrow account configuration
 * 
 * Body: { 
 *   signers: Array<{ publicKey: string, weight: number }>,
 *   threshold: number,
 *   timeBounds?: { minTime?: number, maxTime?: number }
 * }
 */
stellarRoutes.post('/escrow/create', async (c) => {
  try {
    const body = await c.req.json();
    const { signers, threshold, timeBounds, network = 'testnet' } = body;
    
    if (!signers || !threshold) {
      return c.json({
        success: false,
        error: 'signers and threshold are required',
      }, 400);
    }
    
    const config = getNetworkConfig(network as 'public' | 'testnet');
    const escrowAccount = await createEscrowAccount(config, signers, threshold, timeBounds);
    
    return c.json({
      success: true,
      escrow: escrowAccount,
    });
  } catch (error) {
    return c.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create escrow',
    }, 500);
  }
});

/**
 * GET /api/stellar/escrow/:publicKey
 * Get escrow account details
 */
stellarRoutes.get('/escrow/:publicKey', async (c) => {
  try {
    const publicKey = c.req.param('publicKey');
    const network = c.req.query('network') || 'testnet';
    
    const config = getNetworkConfig(network as 'public' | 'testnet');
    const details = await getEscrowAccountDetails(publicKey, config);
    
    if (!details.success) {
      return c.json(details, 404);
    }
    
    return c.json(details);
  } catch (error) {
    return c.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get escrow details',
    }, 500);
  }
});

/**
 * POST /api/stellar/escrow/payment
 * Create an escrow payment transaction (returns unsigned transaction)
 * 
 * Body: {
 *   escrowPublicKey: string,
 *   destination: string,
 *   amount: string,
 *   network?: 'public' | 'testnet'
 * }
 */
stellarRoutes.post('/escrow/payment', async (c) => {
  try {
    const body = await c.req.json();
    const { escrowPublicKey, destination, amount, network = 'testnet' } = body;
    
    if (!escrowPublicKey || !destination || !amount) {
      return c.json({
        success: false,
        error: 'escrowPublicKey, destination, and amount are required',
      }, 400);
    }
    
    const config = getNetworkConfig(network as 'public' | 'testnet');
    const transaction = await createEscrowPayment(
      escrowPublicKey,
      destination,
      amount,
      StellarSdk.Asset.native(),
      config
    );
    
    return c.json({
      success: true,
      transactionXDR: transaction.toXDR(),
      message: 'Transaction created. Sign with required signers and submit via /api/stellar/escrow/submit',
    });
  } catch (error) {
    return c.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create payment',
    }, 500);
  }
});

/**
 * POST /api/stellar/escrow/submit
 * Submit a signed escrow transaction
 * 
 * Body: {
 *   transactionXDR: string,
 *   network?: 'public' | 'testnet'
 * }
 */
stellarRoutes.post('/escrow/submit', async (c) => {
  try {
    const body = await c.req.json();
    const { transactionXDR, network = 'testnet' } = body;
    
    if (!transactionXDR) {
      return c.json({
        success: false,
        error: 'transactionXDR is required',
      }, 400);
    }
    
    const config = getNetworkConfig(network as 'public' | 'testnet');
    const transaction = StellarSdk.TransactionBuilder.fromXDR(
      transactionXDR,
      config.networkPassphrase || StellarSdk.Networks.TESTNET
    ) as StellarSdk.Transaction;
    
    const result = await submitEscrowTransaction(transaction, config);
    
    if (!result.success) {
      return c.json(result, 500);
    }
    
    return c.json(result);
  } catch (error) {
    return c.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to submit transaction',
    }, 500);
  }
});

export default stellarRoutes;
