/**
 * Open-Stellar Main Entry Point
 * 
 * Cloudflare Worker integrating Moltbot AI with Stellar blockchain
 */

import { Hono } from 'hono';
import { cors } from 'hono/cors';
import stellarRoutes from './routes/stellar';

const app = new Hono();

// Enable CORS for development
app.use('/*', cors());

// Health check endpoint
app.get('/', (c) => {
  return c.json({
    name: 'Open-Stellar',
    version: '1.0.0',
    description: 'AI-powered Moltbot gateway with Stellar blockchain integration',
    endpoints: {
      stellar: '/api/stellar/*',
      health: '/health',
    },
  });
});

app.get('/health', (c) => {
  return c.json({ status: 'ok', timestamp: Date.now() });
});

// Mount Stellar routes
app.route('/api/stellar', stellarRoutes);

export default app;
