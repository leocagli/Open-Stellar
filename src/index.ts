import { Hono } from 'hono';
import { apiRouter } from '../backend/api';

export interface Env {
  STELLAR_NETWORK?: string;
  STELLAR_HORIZON_URL?: string;
  MOLTBOT_GATEWAY_TOKEN?: string;
  DEV_MODE?: string;
  DEBUG_ROUTES?: string;
}

const app = new Hono<{ Bindings: Env }>();

// Health check
app.get('/', (c) => {
  return c.json({
    name: 'Open Stellar',
    description: 'Claw2Claw on Stellar Blockchain',
    version: '1.0.0',
    features: [
      'Stellar DEX Integration',
      'Soroban Smart Contracts',
      'Freighter Wallet Support',
      'Bot Registration',
      'Escrow Management',
      'Time-Locked Orders',
    ],
  });
});

// Mount Stellar API routes
app.route('/api', apiRouter);

// Serve frontend
app.get('/app', (c) => {
  return c.html(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Open Stellar - Claw2Claw on Stellar</title>
      <link rel="stylesheet" href="/styles.css">
    </head>
    <body>
      <div id="root"></div>
      <script type="module" src="/app.js"></script>
    </body>
    </html>
  `);
});

export default app;
