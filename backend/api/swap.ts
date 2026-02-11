import { Hono } from 'hono';
import { StellarNetwork, StellarDEX, StellarSdk } from '../stellar-sdk';

export const swapRoutes = new Hono();

/**
 * Get swap path for asset pair
 */
swapRoutes.post('/path', async (c) => {
  try {
    const body = await c.req.json();
    const { sourceAsset, destAsset, amount, network = 'testnet' } = body;

    if (!sourceAsset || !destAsset || !amount) {
      return c.json({ error: 'sourceAsset, destAsset, and amount are required' }, 400);
    }

    const stellarNetwork = new StellarNetwork({ network });
    const dex = new StellarDEX(stellarNetwork);

    // Parse assets
    const source = parseAsset(sourceAsset);
    const dest = parseAsset(destAsset);

    // Find paths
    const paths = await stellarNetwork.server
      .strictSendPaths(source, amount, [dest])
      .call();

    return c.json({
      paths: paths.records,
      count: paths.records.length,
    });
  } catch (error) {
    return c.json({ error: 'Failed to find swap path' }, 500);
  }
});

/**
 * Create swap transaction
 */
swapRoutes.post('/create', async (c) => {
  try {
    const body = await c.req.json();
    const {
      sourceAsset,
      destAsset,
      sourceAmount,
      minDestAmount,
      sourceAccount,
      network = 'testnet',
    } = body;

    if (!sourceAsset || !destAsset || !sourceAmount || !minDestAmount || !sourceAccount) {
      return c.json({
        error: 'sourceAsset, destAsset, sourceAmount, minDestAmount, and sourceAccount are required',
      }, 400);
    }

    const stellarNetwork = new StellarNetwork({ network });
    const dex = new StellarDEX(stellarNetwork);

    const transaction = await dex.createSwapTransaction({
      sourceAsset: parseAsset(sourceAsset),
      destAsset: parseAsset(destAsset),
      sourceAmount,
      minDestAmount,
      sourceAccount,
    });

    return c.json({
      xdr: transaction.toXDR(),
      hash: transaction.hash().toString('hex'),
    });
  } catch (error) {
    return c.json({ error: `Failed to create swap transaction: ${error}` }, 500);
  }
});

/**
 * Get orderbook for asset pair
 */
swapRoutes.post('/orderbook', async (c) => {
  try {
    const body = await c.req.json();
    const { selling, buying, network = 'testnet' } = body;

    if (!selling || !buying) {
      return c.json({ error: 'selling and buying assets are required' }, 400);
    }

    const stellarNetwork = new StellarNetwork({ network });
    const dex = new StellarDEX(stellarNetwork);

    const orderbook = await dex.getOrderbook(
      parseAsset(selling),
      parseAsset(buying)
    );

    return c.json({ orderbook });
  } catch (error) {
    return c.json({ error: 'Failed to get orderbook' }, 500);
  }
});

/**
 * Parse asset from JSON representation
 */
function parseAsset(asset: any): StellarSdk.Asset {
  if (asset.type === 'native' || asset.code === 'XLM') {
    return StellarSdk.Asset.native();
  }
  return new StellarSdk.Asset(asset.code, asset.issuer);
}
