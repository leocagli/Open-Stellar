import { Hono } from 'hono';
import { botRoutes } from './bots';
import { swapRoutes } from './swap';
import { escrowRoutes } from './escrow';
import { orderRoutes } from './orders';

export const apiRouter = new Hono();

// Mount API routes
apiRouter.route('/bots', botRoutes);
apiRouter.route('/swap', swapRoutes);
apiRouter.route('/escrow', escrowRoutes);
apiRouter.route('/orders', orderRoutes);

// Health check
apiRouter.get('/health', (c) => {
  return c.json({
    status: 'healthy',
    timestamp: Date.now(),
  });
});
