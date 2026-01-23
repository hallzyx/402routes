import crypto from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';
import { Facilitator } from '@crypto.com/facilitator-client';
import { handleX402Payment } from '../middlewares/x402.middleware.js';
import type { ApiListing, CreateApiRequest, PaymentRequirements } from '../types/index.js';
import { NETWORK } from '../config/x402.config.js';

interface Database {
  apis: ApiListing[];
  subscriptions: Array<{
    walletAddress: string;
    apiId: string;
    timestamp: number;
  }>;
  wallets: string[];
  transactions: Array<{
    id: string;
    apiId: string;
    walletAddress: string;
    amount: string;
    timestamp: number;
  }>;
}

/**
 * Service for managing API marketplace listings and X402 payments.
 */
export class MarketplaceService {
  private facilitator = new Facilitator({ network: NETWORK });
  private dbPath = path.join(process.cwd(), 'db.json');
  
  constructor() {
    this.initDatabase();
  }

  /**
   * Initialize database with example data if empty.
   */
  private async initDatabase() {
    try {
      const db = await this.readDatabase();
      if (db.apis.length === 0) {
        await this.seedExampleApis();
      }
    } catch (error) {
      console.error('Failed to initialize database:', error);
    }
  }

  /**
   * Read database from JSON file.
   */
  private async readDatabase(): Promise<Database> {
    try {
      const data = await fs.readFile(this.dbPath, 'utf-8');
      const db = JSON.parse(data);
      if (!db.subscriptions) db.subscriptions = [];
      return db;
    } catch (error) {
      // If file doesn't exist, return empty database
      return { apis: [], subscriptions: [], wallets: [], transactions: [] };
    }
  }

  /**
   * Write database to JSON file.
   */
  private async writeDatabase(db: Database): Promise<void> {
    await fs.writeFile(this.dbPath, JSON.stringify(db, null, 2), 'utf-8');
  }

  /**
   * Subscribe user to an API
   */
  async subscribeToApi(walletAddress: string, apiId: string) {
    const db = await this.readDatabase();
    
    // Check if API exists
    const apiExists = db.apis.find(a => a.id === apiId);
    if (!apiExists) throw new Error('API not found');

    // Check if already subscribed
    const existing = db.subscriptions.find(s => s.walletAddress.toLowerCase() === walletAddress.toLowerCase() && s.apiId === apiId);
    if (existing) return existing;

    const subscription = {
      walletAddress,
      apiId,
      timestamp: Date.now()
    };
    
    db.subscriptions.push(subscription);
    await this.writeDatabase(db);
    return subscription;
  }

  /**
   * Get user subscriptions
   */
  async getSubscriptions(walletAddress: string) {
    const db = await this.readDatabase();
    const subs = db.subscriptions.filter(s => s.walletAddress.toLowerCase() === walletAddress.toLowerCase());
    
    // Enrich with API details
    return subs.map(sub => {
      const api = db.apis.find(a => a.id === sub.apiId);
      return { ...sub, api };
    });
  }

  /**
   * Unsubscribe user from an API
   */
  async unsubscribeToApi(walletAddress: string, apiId: string) {
    const db = await this.readDatabase();
    const index = db.subscriptions.findIndex(s => s.walletAddress.toLowerCase() === walletAddress.toLowerCase() && s.apiId === apiId);
    if (index === -1) throw new Error('Subscription not found');
    db.subscriptions.splice(index, 1);
    await this.writeDatabase(db);
    return true;
  }

  /**
   * Get all active APIs.
   */
  async getAllApis(): Promise<ApiListing[]> {
    const db = await this.readDatabase();
    return db.apis.filter(api => api.isActive);
  }

  /**
   * Get API by ID.
   */
  async getApiById(id: string): Promise<ApiListing | undefined> {
    const db = await this.readDatabase();
    return db.apis.find(api => api.id === id);
  }

  /**
   * Create a new API listing.
   */
  async createApi(data: CreateApiRequest): Promise<ApiListing> {
    const db = await this.readDatabase();
    
    const newApi: ApiListing = {
      id: crypto.randomUUID(),
      ...data,
      ownerAddress: data.ownerAddress || '0x0000000000000000000000000000000000000000',
      isActive: true,
      createdAt: new Date().toISOString(),
    };

    db.apis.push(newApi);
    await this.writeDatabase(db);
    
    return newApi;
  }

  private async seedExampleApis() {
    const examples: Omit<ApiListing, 'id' | 'createdAt'>[] = [
      {
        name: 'Weather API',
        description: 'Get current weather data for any city',
        category: 'Weather',
        baseUrl: 'https://api.weatherapi.com',
        endpoint: '/v1/current.json',
        method: 'GET',
        pricePerCall: '100000', // $0.10
        ownerAddress: '0x0000000000000000000000000000000000000001',
        isActive: true,
      },
      {
        name: 'Stock Price API',
        description: 'Real-time stock prices and market data',
        category: 'Finance',
        baseUrl: 'https://finnhub.io',
        endpoint: '/api/v1/quote',
        method: 'GET',
        pricePerCall: '500000', // $0.50
        ownerAddress: '0x0000000000000000000000000000000000000002',
        isActive: true,
      },
      {
        name: 'AI Text Generation',
        description: 'Generate text using AI models',
        category: 'AI',
        baseUrl: 'https://api.openai.com',
        endpoint: '/v1/completions',
        method: 'POST',
        pricePerCall: '2000000', // $2.00
        ownerAddress: '0x0000000000000000000000000000000000000003',
        isActive: true,
      },
    ];

    const db = await this.readDatabase();
    examples.forEach((api) => {
      const id = crypto.randomUUID();
      db.apis.push({
        ...api,
        id,
        createdAt: Date.now(),
      });
    });
    await this.writeDatabase(db);
  }

  /**
   * Returns all active API listings.
   */
  async getAllApis(): Promise<ApiListing[]> {
    const db = await this.readDatabase();
    return db.apis
      .filter(api => api.isActive)
      .sort((a, b) => b.createdAt - a.createdAt);
  }

  /**
   * Returns a specific API listing by id.
   */
  async getApiById(id: string): Promise<ApiListing | undefined> {
    const db = await this.readDatabase();
    return db.apis.find(api => api.id === id);
  }

  /**
   * Creates a new API listing.
   */
  async createApi(data: CreateApiRequest): Promise<ApiListing> {
    const db = await this.readDatabase();
    const id = crypto.randomUUID();
    const api: ApiListing = {
      ...data,
      id,
      createdAt: Date.now(),
      isActive: true,
    };
    
    db.apis.push(api);
    
    // Add wallet to wallets list if not exists
    if (!db.wallets.includes(data.ownerAddress)) {
      db.wallets.push(data.ownerAddress);
    }
    
    await this.writeDatabase(db);
    return api;
  }

  /**
   * Updates an existing API listing.
   */
  async updateApi(id: string, updates: Partial<CreateApiRequest>): Promise<ApiListing | null> {
    const db = await this.readDatabase();
    const apiIndex = db.apis.findIndex(api => api.id === id);
    
    if (apiIndex === -1) return null;

    db.apis[apiIndex] = { ...db.apis[apiIndex], ...updates };
    await this.writeDatabase(db);
    return db.apis[apiIndex];
  }

  /**
   * Deletes (deactivates) an API listing.
   */
  async deleteApi(id: string): Promise<boolean> {
    const db = await this.readDatabase();
    const api = db.apis.find(api => api.id === id);
    
    if (!api) return false;

    api.isActive = false;
    await this.writeDatabase(db);
    return true;
  }

  /**
   * Records a transaction in the database.
   */
  async recordTransaction(apiId: string, walletAddress: string, amount: string): Promise<void> {
    const db = await this.readDatabase();
    db.transactions.push({
      id: crypto.randomUUID(),
      apiId,
      walletAddress,
      amount,
      timestamp: Date.now(),
    });
    await this.writeDatabase(db);
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
   * Executes a proxied API call to the original endpoint.
   * This is called after X402 payment validation.
   */
  async executeProxiedApiCall(
    apiId: string,
    endpointPath: string,
    method: string,
    headers: Record<string, string>,
    body?: unknown
  ): Promise<Response> {
    console.log('  🔧 executeProxiedApiCall called');
    console.log('  📌 apiId:', apiId);
    console.log('  📌 endpointPath:', endpointPath);
    console.log('  📌 method:', method);
    
    const api = await this.getApiById(apiId);
    if (!api) {
      console.log('  ❌ API not found in executeProxiedApiCall');
      return new Response(JSON.stringify({ error: 'API not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Construct the full URL to the original API
    const targetUrl = `${api.baseUrl}${endpointPath}`;
    console.log('  🎯 Target URL constructed:', targetUrl);

    try {
      // Clean up headers before forwarding
      const forwardedHeaders = { ...headers };
      
      // Remove unsafe/hop-by-hop headers
      const headersToRemove = [
        'host',
        'connection',
        'content-length',
        'transfer-encoding',
        'keep-alive',
        'upgrade',
        'expect',
        'cookie', // Optional: decide if you want to forward cookies
        'x-forwarded-for',
        'x-forwarded-proto',
        'x-forwarded-host',
        'x-payment-id', // Don't forward payment ID to original API
        'accept-encoding' // Don't forward encoding to avoid compression issues
      ];

      headersToRemove.forEach(header => {
        delete forwardedHeaders[header];
        delete forwardedHeaders[header.toUpperCase()]; // Just in case
      });

      console.log('  📤 Headers to forward:', forwardedHeaders);

      // Forward the request to the original API
      const fetchOptions: RequestInit = {
        method: method.toUpperCase(),
        headers: forwardedHeaders,
      };

      if (body && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
        fetchOptions.body = JSON.stringify(body);
        // Ensure Content-Type is set for JSON body
        forwardedHeaders['content-type'] = 'application/json';
        console.log('  📦 Request body included');
      }

      console.log('  🌐 Fetching from original API...');
      const response = await fetch(targetUrl, fetchOptions);
      
      console.log('  ✅ Response received from original API');
      console.log('  📊 Status:', response.status, response.statusText);
      console.log('  📋 Response headers:', Object.fromEntries(response.headers));
      
      // Return the response from the original API
      return response;
    } catch (error) {
      console.error('  ❌ Error proxying API call:', error);
      console.error('  ❌ Target URL was:', targetUrl);
      return new Response(JSON.stringify({ 
        error: 'Failed to proxy API call',
        details: error instanceof Error ? error.message : 'Unknown error',
        targetUrl
      }), {
        status: 502,
        headers: { 'Content-Type': 'application/json' },
      });
    }
  }

  /**
   * Executes a protected API call (mock implementation).
   * In production, this would proxy to the actual API endpoint.
   */
  async executeApiCall(apiId: string, requestData: unknown): Promise<unknown> {
    const api = await this.getApiById(apiId);
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
