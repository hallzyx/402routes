import type {
  ApiListing,
  CreateApiRequest,
  GetDataResult,
  PostPayRequest,
  PostPayResult,
  HttpStatus,
} from '../types';
import { GetDataKind, PostPayKind } from '../types';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:8787';

export interface ApiClient {
  // Marketplace CRUD
  getAllApis(): Promise<ApiListing[]>;
  getApiById(id: string): Promise<ApiListing>;
  createApi(data: CreateApiRequest): Promise<ApiListing>;
  updateApi(id: string, data: Partial<CreateApiRequest>): Promise<ApiListing>;
  deleteApi(id: string): Promise<void>;

  // X402 Payment Flow
  executeApi(apiId: string, paymentId?: string, requestData?: unknown): Promise<GetDataResult>;
  postPay(body: PostPayRequest): Promise<PostPayResult>;
}

export function createApiClient(): ApiClient {
  return {
    async getAllApis(): Promise<ApiListing[]> {
      const res = await fetch(`${API_BASE}/api/marketplace`);
      const json = await res.json();
      return json.data || [];
    },

    async getApiById(id: string): Promise<ApiListing> {
      const res = await fetch(`${API_BASE}/api/marketplace/${id}`);
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to fetch API');
      return json.data;
    },

    async createApi(data: CreateApiRequest): Promise<ApiListing> {
      const res = await fetch(`${API_BASE}/api/marketplace`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to create API');
      return json.data;
    },

    async updateApi(id: string, data: Partial<CreateApiRequest>): Promise<ApiListing> {
      const res = await fetch(`${API_BASE}/api/marketplace/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to update API');
      return json.data;
    },

    async deleteApi(id: string): Promise<void> {
      const res = await fetch(`${API_BASE}/api/marketplace/${id}`, {
        method: 'DELETE',
      });
      if (!res.ok) {
        const json = await res.json();
        throw new Error(json.error || 'Failed to delete API');
      }
    },

    async executeApi(apiId: string, paymentId?: string, requestData?: unknown): Promise<GetDataResult> {
      const res = await fetch(`${API_BASE}/api/execute/${apiId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(paymentId ? { 'x-payment-id': paymentId } : {}),
        },
        body: JSON.stringify(requestData || {}),
      });

      if (res.status === 200) {
        return {
          kind: GetDataKind.Ok,
          data: await res.json(),
        };
      }

      if (res.status === 402) {
        const challenge = await res.json();
        return {
          kind: GetDataKind.PaymentRequired,
          challenge,
        };
      }

      return {
        kind: GetDataKind.Error,
        status: res.status,
        text: await res.text(),
      };
    },

    async postPay(body: PostPayRequest): Promise<PostPayResult> {
      const res = await fetch(`${API_BASE}/api/pay`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const json = await res.json().catch(() => ({}));
      if (res.ok) {
        return {
          kind: PostPayKind.Ok,
          data: json,
        };
      }

      return {
        kind: PostPayKind.Error,
        status: res.status,
        data: json,
      };
    },
  };
}
