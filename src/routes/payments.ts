/**
 * Payment API Routes
 * 
 * Exposes endpoints for x402, 8004, and escrow functionality
 */

import { Hono } from 'hono';
import type { AppEnv } from '../types';
import { x402, process8004, getPaymentStatus } from '../payments';
import { 
  createEscrow, 
  fundEscrow, 
  releaseEscrow, 
  refundEscrow,
  getEscrow,
  listEscrows 
} from '../payments/escrow';
import { verifyPayment, createKeypair } from '../payments/stellar';

const payments = new Hono<AppEnv>();

/**
 * POST /payments/x402
 * 
 * Generate a payment requirement response
 */
payments.post('/x402', async (c) => {
  const body = await c.req.json();
  const { amount, asset, destination, message } = body;
  
  if (!amount || !destination) {
    return c.json({ error: 'Missing required fields: amount, destination' }, 400);
  }
  
  const response = x402(amount, asset || 'XLM', destination, message);
  return c.json(response);
});

/**
 * POST /payments/8004
 * 
 * Validate and process a payment
 */
payments.post('/8004', async (c) => {
  const body = await c.req.json();
  const { paymentId, transactionHash } = body;
  
  if (!paymentId || !transactionHash) {
    return c.json({ error: 'Missing required fields: paymentId, transactionHash' }, 400);
  }
  
  try {
    const result = await process8004({ paymentId, transactionHash });
    return c.json(result);
  } catch (error) {
    return c.json({ error: String(error) }, 500);
  }
});

/**
 * GET /payments/status/:paymentId
 * 
 * Get payment status
 */
payments.get('/status/:paymentId', async (c) => {
  const paymentId = c.req.param('paymentId');
  const status = getPaymentStatus(paymentId);
  
  if (!status) {
    return c.json({ error: 'Payment not found' }, 404);
  }
  
  return c.json(status);
});

/**
 * POST /payments/escrow/create
 * 
 * Create a new escrow contract
 */
payments.post('/escrow/create', async (c) => {
  const body = await c.req.json();
  const { buyer, seller, arbiter, amount, asset, expirationDays } = body;
  
  if (!buyer || !seller || !arbiter || !amount) {
    return c.json({ 
      error: 'Missing required fields: buyer, seller, arbiter, amount' 
    }, 400);
  }
  
  try {
    const contract = await createEscrow({
      buyer,
      seller,
      arbiter,
      amount,
      asset,
      expirationDays,
    });
    
    return c.json(contract);
  } catch (error) {
    return c.json({ error: String(error) }, 500);
  }
});

/**
 * POST /payments/escrow/:escrowId/fund
 * 
 * Fund an escrow contract
 * 
 * SECURITY WARNING: This endpoint is for DEMONSTRATION ONLY.
 * In production, implement client-side signing with Freighter or similar wallet.
 * Never send secret keys over the network!
 */
payments.post('/escrow/:escrowId/fund', async (c) => {
  const escrowId = c.req.param('escrowId');
  const body = await c.req.json();
  const { buyerSecretKey } = body;
  
  if (!buyerSecretKey) {
    return c.json({ error: 'Missing buyerSecretKey' }, 400);
  }
  
  // SECURITY: In production, replace this with:
  // 1. Client-side wallet signing (Freighter, Albedo, etc.)
  // 2. Session-based authentication
  // 3. Multi-signature transactions
  // DO NOT accept secret keys in production!
  
  try {
    const { loadKeypair } = await import('../payments/stellar');
    const buyerKeypair = loadKeypair(buyerSecretKey);
    
    const txHash = await fundEscrow(escrowId, buyerKeypair);
    return c.json({ success: true, transactionHash: txHash });
  } catch (error) {
    return c.json({ error: String(error) }, 500);
  }
});

/**
 * POST /payments/escrow/:escrowId/release
 * 
 * Release escrow funds to seller
 * 
 * SECURITY WARNING: This endpoint is for DEMONSTRATION ONLY.
 * In production, implement client-side signing with Freighter or similar wallet.
 * Never send secret keys over the network!
 */
payments.post('/escrow/:escrowId/release', async (c) => {
  const escrowId = c.req.param('escrowId');
  const body = await c.req.json();
  const { signerSecretKey } = body;
  
  if (!signerSecretKey) {
    return c.json({ error: 'Missing signerSecretKey' }, 400);
  }
  
  // SECURITY: See fundEscrow endpoint comments above
  
  try {
    const { loadKeypair } = await import('../payments/stellar');
    const signerKeypair = loadKeypair(signerSecretKey);
    
    const txHash = await releaseEscrow(escrowId, signerKeypair);
    return c.json({ success: true, transactionHash: txHash });
  } catch (error) {
    return c.json({ error: String(error) }, 500);
  }
});

/**
 * POST /payments/escrow/:escrowId/refund
 * 
 * Refund escrow funds to buyer
 * 
 * SECURITY WARNING: This endpoint is for DEMONSTRATION ONLY.
 * In production, implement client-side signing with Freighter or similar wallet.
 * Never send secret keys over the network!
 */
payments.post('/escrow/:escrowId/refund', async (c) => {
  const escrowId = c.req.param('escrowId');
  const body = await c.req.json();
  const { signerSecretKey } = body;
  
  if (!signerSecretKey) {
    return c.json({ error: 'Missing signerSecretKey' }, 400);
  }
  
  // SECURITY: See fundEscrow endpoint comments above
  
  try {
    const { loadKeypair } = await import('../payments/stellar');
    const signerKeypair = loadKeypair(signerSecretKey);
    
    const txHash = await refundEscrow(escrowId, signerKeypair);
    return c.json({ success: true, transactionHash: txHash });
  } catch (error) {
    return c.json({ error: String(error) }, 500);
  }
});

/**
 * GET /payments/escrow/:escrowId
 * 
 * Get escrow contract details
 */
payments.get('/escrow/:escrowId', async (c) => {
  const escrowId = c.req.param('escrowId');
  const contract = getEscrow(escrowId);
  
  if (!contract) {
    return c.json({ error: 'Escrow contract not found' }, 404);
  }
  
  return c.json(contract);
});

/**
 * GET /payments/escrow/list/:publicKey
 * 
 * List escrow contracts for a participant
 */
payments.get('/escrow/list/:publicKey', async (c) => {
  const publicKey = c.req.param('publicKey');
  const contracts = listEscrows(publicKey);
  
  return c.json({ contracts });
});

/**
 * POST /payments/verify
 * 
 * Verify a Stellar payment transaction
 */
payments.post('/verify', async (c) => {
  const body = await c.req.json();
  const { transactionHash, destination, amount, asset } = body;
  
  if (!transactionHash || !destination || !amount) {
    return c.json({ 
      error: 'Missing required fields: transactionHash, destination, amount' 
    }, 400);
  }
  
  try {
    const verified = await verifyPayment(
      transactionHash,
      destination,
      amount,
      asset || 'XLM'
    );
    
    return c.json({ verified });
  } catch (error) {
    return c.json({ error: String(error) }, 500);
  }
});

/**
 * POST /payments/keypair
 * 
 * Generate a new Stellar keypair (for testing)
 */
payments.post('/keypair', async (c) => {
  try {
    const keypair = createKeypair();
    return c.json({
      publicKey: keypair.publicKey(),
      secretKey: keypair.secret(),
      warning: 'This is for testing only. Never expose secret keys in production!',
    });
  } catch (error) {
    return c.json({ error: String(error) }, 500);
  }
});

export { payments };
