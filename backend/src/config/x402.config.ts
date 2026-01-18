import 'dotenv/config';
import { CronosNetwork, Contract } from '@crypto.com/facilitator-client';

/**
 * X402 configuration for the API marketplace.
 * 
 * Environment variables:
 * - NETWORK: Cronos network identifier (default: 'cronos-testnet')
 * - MERCHANT_ADDRESS: Address that receives payments (required)
 * - PUBLIC_RESOURCE_URL: Base URL for API resources
 */

export const NETWORK = (process.env.NETWORK ?? 'cronos-testnet') as CronosNetwork;

export const MERCHANT_ADDRESS = process.env.MERCHANT_ADDRESS ?? '';

export const ASSET = NETWORK === CronosNetwork.CronosMainnet ? Contract.USDCe : Contract.DevUSDCe;

export const PUBLIC_RESOURCE_URL = process.env.PUBLIC_RESOURCE_URL ?? 'http://localhost:8787';

export const DEFAULT_TIMEOUT_SECONDS = 300;

if (!MERCHANT_ADDRESS) {
  console.warn('Warning: MERCHANT_ADDRESS not set in environment variables');
}

/**
 * Resolved X402 configuration values.
 */
export const x402Config = {
  NETWORK,
  MERCHANT_ADDRESS,
  ASSET,
  PUBLIC_RESOURCE_URL,
  DEFAULT_TIMEOUT_SECONDS,
};
