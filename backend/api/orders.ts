import { Hono } from 'hono';
import { ClaimableBalanceManager, StellarNetwork, StellarSdk } from '../stellar-sdk';

interface Order {
  id: string;
  creator: string;
  beneficiary: string;
  amount: string;
  asset: any;
  unlockTime: number;
  balanceId?: string;
  status: 'pending' | 'claimed' | 'cancelled';
  createdAt: number;
}

const orders = new Map<string, Order>();

export const orderRoutes = new Hono();

/**
 * Create a time-locked order
 */
orderRoutes.post('/create', async (c) => {
  try {
    const body = await c.req.json();
    const {
      creator,
      beneficiary,
      amount,
      asset,
      unlockTime,
      network = 'testnet',
    } = body;

    if (!creator || !beneficiary || !amount || !asset || !unlockTime) {
      return c.json({
        error: 'creator, beneficiary, amount, asset, and unlockTime are required',
      }, 400);
    }

    // Validate unlock time is in the future
    const unlockDate = new Date(unlockTime);
    if (unlockDate.getTime() <= Date.now()) {
      return c.json({ error: 'unlockTime must be in the future' }, 400);
    }

    // Generate order ID
    const orderId = Date.now().toString();

    const order: Order = {
      id: orderId,
      creator,
      beneficiary,
      amount,
      asset,
      unlockTime: unlockDate.getTime(),
      status: 'pending',
      createdAt: Date.now(),
    };

    orders.set(orderId, order);

    return c.json({
      success: true,
      order,
    });
  } catch (error) {
    return c.json({ error: 'Failed to create order' }, 500);
  }
});

/**
 * Claim a time-locked order
 */
orderRoutes.post('/:id/claim', async (c) => {
  try {
    const orderId = c.req.param('id');
    const order = orders.get(orderId);

    if (!order) {
      return c.json({ error: 'Order not found' }, 404);
    }

    if (order.status !== 'pending') {
      return c.json({ error: 'Order already processed' }, 400);
    }

    // Check if unlock time has passed
    if (Date.now() < order.unlockTime) {
      return c.json({ error: 'Order is still locked' }, 400);
    }

    // Update status
    order.status = 'claimed';
    orders.set(orderId, order);

    return c.json({
      success: true,
      order,
    });
  } catch (error) {
    return c.json({ error: 'Failed to claim order' }, 500);
  }
});

/**
 * Cancel a time-locked order (before unlock time)
 */
orderRoutes.post('/:id/cancel', async (c) => {
  try {
    const orderId = c.req.param('id');
    const order = orders.get(orderId);

    if (!order) {
      return c.json({ error: 'Order not found' }, 404);
    }

    if (order.status !== 'pending') {
      return c.json({ error: 'Order already processed' }, 400);
    }

    // Check if unlock time has not passed
    if (Date.now() >= order.unlockTime) {
      return c.json({ error: 'Cannot cancel after unlock time' }, 400);
    }

    // Update status
    order.status = 'cancelled';
    orders.set(orderId, order);

    return c.json({
      success: true,
      order,
    });
  } catch (error) {
    return c.json({ error: 'Failed to cancel order' }, 500);
  }
});

/**
 * Get order details
 */
orderRoutes.get('/:id', async (c) => {
  const orderId = c.req.param('id');
  const order = orders.get(orderId);

  if (!order) {
    return c.json({ error: 'Order not found' }, 404);
  }

  return c.json({ order });
});

/**
 * List all orders
 */
orderRoutes.get('/', async (c) => {
  const allOrders = Array.from(orders.values());
  return c.json({
    orders: allOrders,
    count: allOrders.length,
  });
});

/**
 * Get claimable orders for beneficiary
 */
orderRoutes.get('/claimable/:beneficiary', async (c) => {
  const beneficiary = c.req.param('beneficiary');
  const currentTime = Date.now();

  const claimableOrders = Array.from(orders.values()).filter(
    (order) =>
      order.beneficiary === beneficiary &&
      order.status === 'pending' &&
      order.unlockTime <= currentTime
  );

  return c.json({
    orders: claimableOrders,
    count: claimableOrders.length,
  });
});
