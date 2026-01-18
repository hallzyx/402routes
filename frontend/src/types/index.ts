import type { CronosNetwork, Contract } from '@crypto.com/facilitator-client';

export interface ApiListing {
  id: string;
  name: string;
  description: string;
  category: string;
  endpoint: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  pricePerCall: string;
  ownerAddress: string;
  createdAt: number;
  isActive: boolean;
}

export interface CreateApiRequest {
  name: string;
  description: string;
  category: string;
  endpoint: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  pricePerCall: string;
  ownerAddress: string;
}

export interface PaymentRequirements {
  scheme: 'exact';
  network: CronosNetwork;
  asset: Contract;
  payTo: string;
  maxAmountRequired: string;
  maxTimeoutSeconds: number;
  description: string;
  mimeType?: string;
  resource?: string;
  extra?: { paymentId: string };
}

export interface PaymentChallenge {
  x402Version: 1;
  error: 'payment_required';
  accepts: PaymentRequirements[];
}

export enum HttpStatus {
  Ok = 200,
  Created = 201,
  PaymentRequired = 402,
  NotFound = 404,
  ServerError = 500,
}

export enum GetDataKind {
  Ok = 'ok',
  PaymentRequired = 'payment_required',
  Error = 'error',
}

export type GetDataResult =
  | { kind: GetDataKind.Ok; data: unknown }
  | { kind: GetDataKind.PaymentRequired; challenge: PaymentChallenge }
  | { kind: GetDataKind.Error; status: number; text: string };

export interface PostPayRequest {
  paymentId: string;
  paymentHeader: string;
  paymentRequirements: PaymentRequirements;
}

export enum PostPayKind {
  Ok = 'ok',
  Error = 'error',
}

export type PostPayResult =
  | { kind: PostPayKind.Ok; data: { ok: true; txHash?: string } }
  | { kind: PostPayKind.Error; status: number; data: unknown };
