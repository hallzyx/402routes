import type { Request, Response, NextFunction } from 'express';
import { MarketplaceService } from '../services/marketplace.service.js';
import type { CreateApiRequest } from '../types/index.js';

/**
 * Controller for marketplace API endpoints.
 */
export class MarketplaceController {
  public service = new MarketplaceService();

  /**
   * GET /api/marketplace
   * Returns all active API listings.
   */
  getAllApis = async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const apis = await this.service.getAllApis();
      res.json({ ok: true, data: apis });
    } catch (error) {
      next(error);
    }
  };

  /**
   * GET /api/marketplace/:id
   * Returns a specific API listing by id.
   */
  getApiById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const api = await this.service.getApiById(id);
      
      if (!api) {
        return res.status(404).json({ ok: false, error: 'API not found' });
      }
      
      res.json({ ok: true, data: api });
    } catch (error) {
      next(error);
    }
  };

  /**
   * POST /api/marketplace
   * Creates a new API listing.
   */
  createApi = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data: CreateApiRequest = req.body;
      
      // Validate required fields
      if (!data.name || !data.description || !data.endpoint || !data.ownerAddress) {
        return res.status(400).json({ 
          ok: false, 
          error: 'Missing required fields: name, description, endpoint, ownerAddress' 
        });
      }
      
      const api = await this.service.createApi(data);
      res.status(201).json({ ok: true, data: api });
    } catch (error) {
      next(error);
    }
  };

  /**
   * PUT /api/marketplace/:id
   * Updates an existing API listing.
   */
  updateApi = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const updates = req.body;
      
      const api = await this.service.updateApi(id, updates);
      
      if (!api) {
        return res.status(404).json({ ok: false, error: 'API not found' });
      }
      
      res.json({ ok: true, data: api });
    } catch (error) {
      next(error);
    }
  };

  /**
   * DELETE /api/marketplace/:id
   * Deletes (deactivates) an API listing.
   */
  deleteApi = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const deleted = await this.service.deleteApi(id);
      
      if (!deleted) {
        return res.status(404).json({ ok: false, error: 'API not found' });
      }
      
      res.json({ ok: true, message: 'API deleted successfully' });
    } catch (error) {
      next(error);
    }
  };

  /**
   * POST /api/pay
   * Settles an X402 payment for API access.
   */
  settlePayment = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { paymentId, paymentHeader, paymentRequirements } = req.body;
      
      if (!paymentId || !paymentHeader || !paymentRequirements) {
        return res.status(400).json({ 
          ok: false, 
          error: 'Missing required fields: paymentId, paymentHeader, paymentRequirements' 
        });
      }
      
      const result = await this.service.settlePayment({
        paymentId,
        paymentHeader,
        paymentRequirements,
      });
      
      res.json(result);
    } catch (error) {
      next(error);
    }
  };

  /**
   * POST /api/execute/:id
   * Executes a protected API call (requires X402 payment).
   */
  executeApiCall = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const requestData = req.body;
      
      const result = await this.service.executeApiCall(id, requestData);
      res.json({ ok: true, data: result });
    } catch (error) {
      next(error);
    }
  };
}
