import { Router } from 'express';
import { MarketplaceController } from '../controllers/marketplace.controller.js';
import { requireX402Payment } from '../middlewares/x402.middleware.js';
import { NETWORK, ASSET, MERCHANT_ADDRESS } from '../config/x402.config.js';

const router = Router();
const controller = new MarketplaceController();

/**
 * Public routes (no payment required)
 */

// GET /api/marketplace - List all APIs
router.get('/marketplace', controller.getAllApis);

// GET /api/marketplace/:id - Get API details
router.get('/marketplace/:id', controller.getApiById);

// POST /api/marketplace - Create new API
router.post('/marketplace', controller.createApi);

// PUT /api/marketplace/:id - Update API
router.put('/marketplace/:id', controller.updateApi);

// DELETE /api/marketplace/:id - Delete API
router.delete('/marketplace/:id', controller.deleteApi);

// POST /api/pay - Settle X402 payment
router.post('/pay', controller.settlePayment);

/**
 * Protected routes (require X402 payment)
 */

// POST /api/execute/:id - Execute API call (requires payment)
router.post('/execute/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    
    // Get API details to extract owner address and price
    const api = controller['service'].getApiById(id);
    
    if (!api) {
      return res.status(404).json({ ok: false, error: 'API not found' });
    }
    
    // Create X402 middleware with API-specific details
    const middleware = requireX402Payment({
      network: NETWORK,
      payTo: api.ownerAddress, // Use the API owner's address
      asset: ASSET,
      maxAmountRequired: api.pricePerCall, // Use the API's price
      description: `Execute ${api.name} API`,
      resource: `/api/execute/${id}`,
    });
    
    middleware(req, res, next);
  } catch (error) {
    next(error);
  }
}, controller.executeApiCall);

export default router;
