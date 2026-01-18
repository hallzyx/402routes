import type { CronosNetwork, PaymentRequirements } from '@crypto.com/facilitator-client';

/**
 * API listing in the marketplace
 */
export interface ApiListing {
  id: string;
  name: string;
  description: string;
  category: string;
  endpoint: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  pricePerCall: string; // in base units
  ownerAddress: string;
  createdAt: number;
  isActive: boolean;
}

/**
 * Request to create a new API listing
 */
export interface CreateApiRequest {
  name: string;
  description: string;
  category: string;
  endpoint: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  pricePerCall: string;
  ownerAddress: string;
}

/**
 * Payment status enum
 */
export enum PaymentStatus {
  PaymentRequired = 'payment_required',
  VerifyFailed = 'verify_failed',
  SettleFailed = 'settle_failed',
}

/**
 * X402 challenge response
 */
export interface X402Response {
  x402Version: 1;
  error: PaymentStatus.PaymentRequired;
  accepts: PaymentRequirements[];
}

// Re-export PaymentRequirements from SDK
export type { PaymentRequirements };

/**
 * Settled payment record
 */
export interface PaidRecord {
  settled: true;
  txHash?: string;
  at: number;
}

/**
 * Payment settlement result
 */
export type PayResult =
  | { ok: true; txHash?: string }
  | { ok: false; error: PaymentStatus; details?: unknown };
