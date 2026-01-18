import type { Application } from 'express';
import marketplaceRoutes from './marketplace.routes.js';

/**
 * Registers all application routes.
 */
export function register(app: Application): void {
  // Health check
  app.get('/health', (_req, res) => {
    res.json({ ok: true, status: 'healthy', timestamp: Date.now() });
  });

  // API routes
  app.use('/api', marketplaceRoutes);

  // 404 handler
  app.use((_req, res) => {
    res.status(404).json({ ok: false, error: 'Not found' });
  });
}
