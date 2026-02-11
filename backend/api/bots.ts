import { Hono } from 'hono';
import { StellarNetwork, FreighterWallet, StellarSdk } from '../stellar-sdk';

interface BotRegistration {
  publicKey: string;
  name: string;
  description?: string;
  timestamp: number;
}

const bots = new Map<string, BotRegistration>();

export const botRoutes = new Hono();

/**
 * Register a new bot with Stellar wallet
 */
botRoutes.post('/register', async (c) => {
  try {
    const body = await c.req.json();
    const { publicKey, name, description } = body;

    if (!publicKey || !name) {
      return c.json({ error: 'publicKey and name are required' }, 400);
    }

    // Validate Stellar public key format
    if (!StellarSdk.StrKey.isValidEd25519PublicKey(publicKey)) {
      return c.json({ error: 'Invalid Stellar public key' }, 400);
    }

    // Check if bot already registered
    if (bots.has(publicKey)) {
      return c.json({ error: 'Bot already registered' }, 409);
    }

    // Register bot
    const registration: BotRegistration = {
      publicKey,
      name,
      description,
      timestamp: Date.now(),
    };

    bots.set(publicKey, registration);

    return c.json({
      success: true,
      bot: registration,
    });
  } catch (error) {
    return c.json({ error: 'Failed to register bot' }, 500);
  }
});

/**
 * Get bot details
 */
botRoutes.get('/:publicKey', async (c) => {
  const publicKey = c.req.param('publicKey');
  const bot = bots.get(publicKey);

  if (!bot) {
    return c.json({ error: 'Bot not found' }, 404);
  }

  return c.json({ bot });
});

/**
 * List all registered bots
 */
botRoutes.get('/', async (c) => {
  const allBots = Array.from(bots.values());
  return c.json({ bots: allBots, count: allBots.length });
});

/**
 * Unregister a bot
 */
botRoutes.delete('/:publicKey', async (c) => {
  const publicKey = c.req.param('publicKey');
  
  if (!bots.has(publicKey)) {
    return c.json({ error: 'Bot not found' }, 404);
  }

  bots.delete(publicKey);
  return c.json({ success: true });
});
