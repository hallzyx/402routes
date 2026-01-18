import crypto from 'node:crypto';
import { Facilitator } from '@crypto.com/facilitator-client';
import { handleX402Payment } from '../middlewares/x402.middleware.js';
import type { ApiListing, CreateApiRequest, PaymentRequirements } from '../types/index.js';
import { NETWORK } from '../config/x402.config.js';

/**
 * Service for managing API marketplace listings and X402 payments.
 */
export class MarketplaceService {
  private facilitator = new Facilitator({ network: NETWORK });
  
  /**
   * In-memory storage for API listings.
   * In production, replace with a database.
   */
  private apis = new Map<string, ApiListing>();

  constructor() {
    // Seed with example APIs
    this.seedExampleApis();
  }

  /**
   * Seeds the marketplace with example APIs for demo purposes.
   */
  private seedExampleApis() {
    const examples: Omit<ApiListing, 'id' | 'createdAt'>[] = [
      {
        name: 'Weather API',
        description: 'Get current weather data for any city',
        category: 'Weather',
        endpoint: '/weather',
        method: 'GET',
        pricePerCall: '100000', // $0.10
        ownerAddress: '0x0000000000000000000000000000000000000001',
        isActive: true,
      },
      {
        name: 'Stock Price API',
        description: 'Real-time stock prices and market data',
        category: 'Finance',
        endpoint: '/stock',
        method: 'GET',
        pricePerCall: '500000', // $0.50
        ownerAddress: '0x0000000000000000000000000000000000000002',
        isActive: true,
      },
      {
        name: 'AI Text Generation',
        description: 'Generate text using AI models',
        category: 'AI',
        endpoint: '/ai/generate',
        method: 'POST',
        pricePerCall: '2000000', // $2.00
        ownerAddress: '0x0000000000000000000000000000000000000003',
        isActive: true,
      },
    ];

    examples.forEach((api) => {
      const id = crypto.randomUUID();
      this.apis.set(id, {
        ...api,
        id,
        createdAt: Date.now(),
      });
    });
  }

  /**
   * Returns all active API listings.
   */
  getAllApis(): ApiListing[] {
    return Array.from(this.apis.values())
      .filter(api => api.isActive)
      .sort((a, b) => b.createdAt - a.createdAt);
  }

  /**
   * Returns a specific API listing by id.
   */
  getApiById(id: string): ApiListing | undefined {
    return this.apis.get(id);
  }

  /**
   * Creates a new API listing.
   */
  createApi(data: CreateApiRequest): ApiListing {
    const id = crypto.randomUUID();
    const api: ApiListing = {
      ...data,
      id,
      createdAt: Date.now(),
      isActive: true,
    };
    
    this.apis.set(id, api);
    return api;
  }

  /**
   * Updates an existing API listing.
   */
  updateApi(id: string, updates: Partial<CreateApiRequest>): ApiListing | null {
    const api = this.apis.get(id);
    if (!api) return null;

    const updated = { ...api, ...updates };
    this.apis.set(id, updated);
    return updated;
  }

  /**
   * Deletes (deactivates) an API listing.
   */
  deleteApi(id: string): boolean {
    const api = this.apis.get(id);
    if (!api) return false;

    api.isActive = false;
    this.apis.set(id, api);
    return true;
  }

  /**
   * Settles an X402 payment for API access.
   */
  async settlePayment(params: {
    paymentId: string;
    paymentHeader: string;
    paymentRequirements: PaymentRequirements;
  }) {
    return handleX402Payment({
      facilitator: this.facilitator,
      paymentId: params.paymentId,
      paymentHeader: params.paymentHeader,
      paymentRequirements: params.paymentRequirements,
    });
  }

  /**
   * Executes a protected API call (mock implementation).
   * In production, this would proxy to the actual API endpoint.
   */
  async executeApiCall(apiId: string, requestData: unknown): Promise<unknown> {
    const api = this.apis.get(apiId);
    if (!api) {
      throw new Error('API not found');
    }

    // Mock response based on API type
    switch (api.category) {
      case 'Weather':
        return {
          city: 'San Francisco',
          temperature: 18,
          conditions: 'Partly Cloudy',
          timestamp: Date.now(),
        };
      case 'Finance':
        return {
          symbol: 'AAPL',
          price: 178.45,
          change: '+2.3%',
          timestamp: Date.now(),
        };
      case 'AI':
        return {
          text: 'This is a generated AI response based on your input.',
          model: 'gpt-4',
          tokens: 25,
          timestamp: Date.now(),
        };
      default:
        return {
          ok: true,
          message: 'API call successful',
          data: requestData,
        };
    }
  }
}
