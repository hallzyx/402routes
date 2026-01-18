import crypto from 'node:crypto';
import type { Request, Response, NextFunction } from 'express';
import type {
  Facilitator,
  VerifyRequest,
  X402VerifyResponse,
  X402SettleResponse,
  CronosNetwork,
  Contract,
} from '@crypto.com/facilitator-client';
import type {
  PaymentRequirements,
  PaidRecord,
  PayResult,
  X402Response,
} from '../types/index.js';
import { PaymentStatus } from '../types/index.js';

/**
 * In-memory entitlement store keyed by payment id.
 * In production, replace with Redis or a database.
 */
const paid = new Map<string, PaidRecord>();

/**
 * Generates a unique payment identifier.
 */
const newPaymentId = (): string => `pay_${crypto.randomUUID()}`;

/**
 * Options for X402 middleware
 */
export interface RequireX402Options {
  network: CronosNetwork;
  payTo: string;
  asset: Contract;
  maxAmountRequired: string;
  maxTimeoutSeconds?: number;
  description: string;
  mimeType?: string;
  resource?: string;
  getEntitlementKey?: (req: Request) => string;
}

/**
 * Creates an Express middleware that enforces X402 paywall.
 * 
 * If the request has a valid entitlement (via x-payment-id header),
 * allows access. Otherwise, responds with 402 Payment Required.
 */
export const requireX402Payment = (options: RequireX402Options) => {
  const {
    network,
    payTo,
    asset,
    maxAmountRequired,
    maxTimeoutSeconds = 300,
    description,
    mimeType = 'application/json',
    resource,
    getEntitlementKey,
  } = options;

  return (req: Request, res: Response, next: NextFunction): void => {
    const entitlementKey = (
      getEntitlementKey?.(req) ?? 
      req.header('x-payment-id') ?? 
      ''
    ).trim();

    // Check if already paid
    if (entitlementKey && paid.get(entitlementKey)?.settled) {
      next();
      return;
    }

    // Generate new payment challenge
    const paymentId = newPaymentId();

    const accepts = {
      scheme: 'exact' as const,
      network,
      asset,
      payTo,
      maxAmountRequired,
      maxTimeoutSeconds,
      description,
      mimeType,
      resource,
      extra: { paymentId },
    } as PaymentRequirements;

    const response: X402Response = {
      x402Version: 1,
      error: PaymentStatus.PaymentRequired,
      accepts: [accepts],
    };

    res.status(402).json(response);
  };
};

/**
 * Verifies and settles an X402 payment.
 * On success, records entitlement in memory.
 */
export async function handleX402Payment(params: {
  facilitator: Facilitator;
  paymentId: string;
  paymentHeader: string;
  paymentRequirements: VerifyRequest['paymentRequirements'];
}): Promise<PayResult> {
  const { facilitator, paymentId, paymentHeader, paymentRequirements } = params;

  const body: VerifyRequest = {
    x402Version: 1,
    paymentHeader,
    paymentRequirements,
  };

  // Verify payment off-chain
  const verify = (await facilitator.verifyPayment(body)) as X402VerifyResponse;
  if (!verify.isValid) {
    return {
      ok: false,
      error: PaymentStatus.VerifyFailed,
      details: verify,
    };
  }

  // Settle payment on-chain
  const settle = (await facilitator.settlePayment(body)) as X402SettleResponse;
  if (settle.event !== 'payment.settled') {
    return {
      ok: false,
      error: PaymentStatus.SettleFailed,
      details: settle,
    };
  }

  // Record entitlement
  paid.set(paymentId, { 
    settled: true, 
    txHash: settle.txHash, 
    at: Date.now() 
  });

  return {
    ok: true,
    txHash: settle.txHash,
  };
}
