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

// POST /api/subscriptions - Subscribe to API
router.post('/subscriptions', controller.subscribeToApi);

// GET /api/subscriptions - Get user subscriptions
router.get('/subscriptions', controller.getSubscriptions);

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
 * Proxy routes - Forward requests to original APIs after X402 payment
 * This middleware must be placed AFTER the specific routes to catch remaining paths
 */
const proxyHandler = async (req: any, res: any, next: any) => {
  // Check if this is a proxy request
  const match = req.path.match(/^\/proxy\/([^\/]+)(\/.*)?$/);
  if (!match) {
    return next();
  }

  console.log('\n🔵 ===== PROXY REQUEST START =====');
  console.log('📍 Original URL:', req.originalUrl);
  console.log('📍 Path:', req.path);
  console.log('📍 Method:', req.method);

  try {
    const apiId = match[1];
    const fullEndpointPath = match[2] || '/';
    
    console.log('🔑 Extracted apiId:', apiId);
    console.log('🛤️  Extracted endpoint path:', fullEndpointPath);
    
    // Get API details
    console.log('🔍 Searching for API in database...');
    const api = await controller['service'].getApiById(apiId);
    
    if (!api) {
      console.log('❌ API not found in database');
      return res.status(404).json({ ok: false, error: 'API not found' });
    }
    
    console.log('✅ API found:', {
      name: api.name,
      baseUrl: api.baseUrl,
      endpoint: api.endpoint,
      pricePerCall: api.pricePerCall
    });
    
    // Check if request is from browser (has Accept: text/html)
    const acceptHeader = req.headers.accept || '';
    const isBrowser = acceptHeader.includes('text/html');
    
    // Check if payment header exists
    const paymentId = req.headers['x-payment-id'];
    
    console.log('💳 Payment ID:', paymentId || 'NONE');
    console.log('🌐 Is Browser:', isBrowser);
    
    // If browser access without payment, redirect to frontend payment page
    if (isBrowser && !paymentId) {
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
      console.log('🔀 Redirecting to frontend payment page');
      return res.redirect(`${frontendUrl}/execute/${apiId}?autoexecute=true`);
    }
    
    // Create X402 middleware with API-specific details
    const middleware = requireX402Payment({
      network: NETWORK,
      payTo: api.ownerAddress,
      asset: ASSET,
      maxAmountRequired: api.pricePerCall,
      maxTimeoutSeconds: 60,
      description: `Payment for ${api.name} API call`,
    });
    
    console.log('🔐 Checking X402 payment...');
    
    // Apply X402 middleware
    await new Promise<void>((resolve, reject) => {
      middleware(req, res, (err?: unknown) => {
        if (err) reject(err);
        else resolve();
      });
    });
    
    // If response already sent (402 payment required), stop here
    if (res.headersSent) {
      console.log('💰 Payment required - 402 response sent');
      console.log('🔵 ===== PROXY REQUEST END =====\n');
      return;
    }
    
    console.log('✅ Payment validated successfully');
    console.log('🚀 Proxying to original API...');
    
    // If payment succeeded, proxy the request to the original API
    const response = await controller['service'].executeProxiedApiCall(
      apiId,
      fullEndpointPath,
      req.method,
      req.headers as Record<string, string>,
      req.body
    );
    
    console.log('📨 Response received from original API');
    console.log('📊 Status:', response.status);
    console.log('📋 Headers:', Object.fromEntries(response.headers));
    
    // Record transaction
    await controller['service'].recordTransaction(
      apiId,
      req.headers['x-wallet-address'] as string || 'unknown',
      api.pricePerCall
    );
    
    console.log('💾 Transaction recorded');
    
    // Forward the response
    const responseBody = await response.text();
    console.log('📄 Response body length:', responseBody.length);
    console.log('📄 Response preview:', responseBody.substring(0, 200));
    
    // Filter out hop-by-hop headers and problematic headers
    const filteredHeaders: Record<string, string> = {};
    const headersToSkip = [
      'connection',
      'keep-alive',
      'transfer-encoding',
      'upgrade',
      'proxy-authenticate',
      'proxy-authorization',
      'te',
      'trailer',
      'alt-svc', // This header can cause issues
      'content-encoding', // We already decoded the content with .text()
      'access-control-allow-origin', // Will set our own CORS headers
      'access-control-allow-credentials',
      'access-control-allow-headers',
      'access-control-allow-methods'
    ];
    
    response.headers.forEach((value, key) => {
      if (!headersToSkip.includes(key.toLowerCase())) {
        filteredHeaders[key] = value;
      }
    });
    
    // Ensure CORS headers are set correctly
    filteredHeaders['Access-Control-Allow-Origin'] = req.headers.origin || '*';
    filteredHeaders['Access-Control-Allow-Credentials'] = 'true';
    
    console.log('📋 Filtered headers:', filteredHeaders);
    console.log('✅ Sending response to client...');
    
    res.status(response.status)
      .set(filteredHeaders)
      .send(responseBody);
      
    console.log('✅ Response sent successfully');
    console.log('🔵 ===== PROXY REQUEST END =====\n');
      
  } catch (error) {
    console.log('❌ ERROR in proxy handler:', error);
    console.log('🔵 ===== PROXY REQUEST END (ERROR) =====\n');
    next(error);
  }
};

// Apply proxy handler to all methods
router.use(proxyHandler);

/**
 * Protected routes (require X402 payment)
 */

// POST /api/execute/:id - Execute API call (requires payment)
router.post('/execute/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    
    // Get API details to extract owner address and price
    const api = await controller['service'].getApiById(id);
    
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
