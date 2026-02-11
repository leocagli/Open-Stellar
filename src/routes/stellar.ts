/**
 * Stellar API Routes
 * REST API endpoints for Stellar blockchain operations
 */

import { Hono } from 'hono';
import { 
  freighterService, 
  escrowService, 
  dexService, 
  botRegistrationService,
  stellarClient 
} from '../stellar';

type Bindings = {
  STELLAR_NETWORK?: string;
  STELLAR_ESCROW_CONTRACT_ID?: string;
  STELLAR_ORDER_MATCHING_CONTRACT_ID?: string;
};

const stellar = new Hono<{ Bindings: Bindings }>();

// ============================================================
// Bot Registration Endpoints
// ============================================================

/**
 * Register a new bot
 */
stellar.post('/bot/register', async (c) => {
  try {
    const { name, description, capabilities } = await c.req.json();

    if (!name || !capabilities || !Array.isArray(capabilities)) {
      return c.json({ error: 'Invalid request. Name and capabilities are required.' }, 400);
    }

    const registration = await botRegistrationService.registerBot({
      name,
      description,
      capabilities,
    });

    return c.json({
      success: true,
      bot: registration,
    });
  } catch (error) {
    return c.json({ 
      error: error instanceof Error ? error.message : 'Failed to register bot' 
    }, 500);
  }
});

/**
 * Get bot registration details
 */
stellar.get('/bot/:publicKey', async (c) => {
  const publicKey = c.req.param('publicKey');
  
  const bot = botRegistrationService.getBotRegistration(publicKey);
  
  if (!bot) {
    return c.json({ error: 'Bot not found' }, 404);
  }

  return c.json({ bot });
});

/**
 * List all registered bots
 */
stellar.get('/bots', async (c) => {
  const capability = c.req.query('capability');
  
  let bots;
  if (capability) {
    bots = botRegistrationService.searchBotsByCapability(capability);
  } else {
    bots = botRegistrationService.listRegisteredBots();
  }

  return c.json({ bots });
});

/**
 * Update bot details
 */
stellar.put('/bot/:publicKey', async (c) => {
  try {
    const publicKey = c.req.param('publicKey');
    const updates = await c.req.json();

    const bot = await botRegistrationService.updateBot(publicKey, updates);

    return c.json({ success: true, bot });
  } catch (error) {
    return c.json({ 
      error: error instanceof Error ? error.message : 'Failed to update bot' 
    }, 500);
  }
});

/**
 * Unregister a bot
 */
stellar.delete('/bot/:publicKey', async (c) => {
  try {
    const publicKey = c.req.param('publicKey');

    const success = await botRegistrationService.unregisterBot(publicKey);

    return c.json({ success });
  } catch (error) {
    return c.json({ 
      error: error instanceof Error ? error.message : 'Failed to unregister bot' 
    }, 500);
  }
});

// ============================================================
// Escrow Endpoints
// ============================================================

/**
 * Get escrow details
 */
stellar.get('/escrow/:balanceId', async (c) => {
  try {
    const balanceId = c.req.param('balanceId');
    
    const escrow = await escrowService.getEscrowDetails(balanceId);
    
    if (!escrow) {
      return c.json({ error: 'Escrow not found' }, 404);
    }

    return c.json({ escrow });
  } catch (error) {
    return c.json({ 
      error: error instanceof Error ? error.message : 'Failed to fetch escrow' 
    }, 500);
  }
});

/**
 * List escrows for an account
 */
stellar.get('/escrows/:publicKey', async (c) => {
  try {
    const publicKey = c.req.param('publicKey');
    
    const escrows = await escrowService.listEscrowsForAccount(publicKey);

    return c.json({ escrows });
  } catch (error) {
    return c.json({ 
      error: error instanceof Error ? error.message : 'Failed to list escrows' 
    }, 500);
  }
});

// ============================================================
// DEX Endpoints
// ============================================================

/**
 * Get active orders for an account
 */
stellar.get('/orders/:publicKey', async (c) => {
  try {
    const publicKey = c.req.param('publicKey');
    
    const orders = await dexService.getOrdersForAccount(publicKey);

    return c.json({ orders });
  } catch (error) {
    return c.json({ 
      error: error instanceof Error ? error.message : 'Failed to fetch orders' 
    }, 500);
  }
});

/**
 * Get order book for a trading pair
 */
stellar.get('/orderbook', async (c) => {
  try {
    const sellingCode = c.req.query('selling_code') || 'XLM';
    const sellingIssuer = c.req.query('selling_issuer');
    const buyingCode = c.req.query('buying_code');
    const buyingIssuer = c.req.query('buying_issuer');
    const limit = parseInt(c.req.query('limit') || '20');

    if (!buyingCode) {
      return c.json({ error: 'buying_code is required' }, 400);
    }

    const orderbook = await dexService.getOrderBook(
      { code: sellingCode, issuer: sellingIssuer },
      { code: buyingCode, issuer: buyingIssuer },
      limit
    );

    return c.json({ orderbook });
  } catch (error) {
    return c.json({ 
      error: error instanceof Error ? error.message : 'Failed to fetch order book' 
    }, 500);
  }
});

/**
 * Find payment paths
 */
stellar.post('/paths', async (c) => {
  try {
    const { source, destination, destAsset, destAmount } = await c.req.json();

    if (!source || !destination || !destAsset || !destAmount) {
      return c.json({ error: 'Missing required parameters' }, 400);
    }

    const paths = await dexService.findPaymentPaths(
      source,
      destination,
      destAsset,
      destAmount
    );

    return c.json({ paths });
  } catch (error) {
    return c.json({ 
      error: error instanceof Error ? error.message : 'Failed to find paths' 
    }, 500);
  }
});

// ============================================================
// Account Endpoints
// ============================================================

/**
 * Get account balance
 */
stellar.get('/account/:publicKey/balance', async (c) => {
  try {
    const publicKey = c.req.param('publicKey');
    
    const balances = await stellarClient.getBalance(publicKey);

    return c.json({ balances });
  } catch (error) {
    return c.json({ 
      error: error instanceof Error ? error.message : 'Failed to fetch balance' 
    }, 500);
  }
});

/**
 * Get account details
 */
stellar.get('/account/:publicKey', async (c) => {
  try {
    const publicKey = c.req.param('publicKey');
    
    const account = await stellarClient.loadAccount(publicKey);

    return c.json({ 
      publicKey: account.accountId(),
      sequence: account.sequence,
      balances: account.balances,
      signers: account.signers,
      flags: account.flags,
    });
  } catch (error) {
    return c.json({ 
      error: error instanceof Error ? error.message : 'Failed to fetch account' 
    }, 500);
  }
});

// ============================================================
// Health Check
// ============================================================

stellar.get('/health', async (c) => {
  return c.json({
    status: 'ok',
    network: process.env.STELLAR_NETWORK || 'testnet',
    timestamp: new Date().toISOString(),
  });
});

export default stellar;
