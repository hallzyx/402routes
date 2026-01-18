'use client';

import { useCallback, useMemo, useState } from 'react';
import { Facilitator } from '@crypto.com/facilitator-client';
import { createApiClient } from '../lib/api';
import type { PaymentChallenge } from '../types';
import { ensureWallet } from '../utils/wallet';
import { ensureCronosChain } from '../utils/cronos';
import { GetDataKind, PostPayKind } from '../types';

export interface UseX402FlowResult {
  status: string;
  data: string;
  paymentId: string;
  isLoading: boolean;
  error: string | null;
  executeApi: (apiId: string, requestData?: unknown) => Promise<void>;
  retryWithPaymentId: () => Promise<void>;
  reset: () => void;
}

export function useX402Flow(): UseX402FlowResult {
  const api = useMemo(() => createApiClient(), []);

  const [status, setStatus] = useState<string>('');
  const [data, setData] = useState<string>('');
  const [paymentId, setPaymentId] = useState<string>('');
  const [currentApiId, setCurrentApiId] = useState<string>('');
  const [currentRequestData, setCurrentRequestData] = useState<unknown>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handlePaymentChallenge = useCallback(
    async (challenge: PaymentChallenge, apiId: string, requestData?: unknown) => {
      try {
        const accepts0 = challenge.accepts?.[0];
        if (!accepts0) throw new Error('Invalid x402 response: accepts[0] missing');

        const nextPaymentId = accepts0.extra?.paymentId;
        if (!nextPaymentId) {
          throw new Error('Invalid x402 response: paymentId missing');
        }

        setStatus('Connecting wallet...');
        const provider = await ensureWallet();
        
        setStatus('Switching to Cronos network...');
        await ensureCronosChain(accepts0.network);
        
        const signer = await provider.getSigner();
        setStatus('Signing payment authorization...');

        const fac = new Facilitator({ network: accepts0.network });
        const paymentHeader = await fac.generatePaymentHeader({
          to: accepts0.payTo,
          value: accepts0.maxAmountRequired,
          asset: accepts0.asset,
          signer,
          validBefore: Math.floor(Date.now() / 1000) + accepts0.maxTimeoutSeconds,
          validAfter: 0,
        });

        setStatus('Settling payment on-chain...');
        const payRes = await api.postPay({
          paymentId: nextPaymentId,
          paymentHeader,
          paymentRequirements: accepts0,
        });

        if (payRes.kind === PostPayKind.Error) {
          throw new Error(`Payment failed: ${JSON.stringify(payRes.data)}`);
        }

        setPaymentId(nextPaymentId);
        setStatus(`Payment settled! txHash: ${payRes.data.txHash || 'N/A'}`);

        // Retry the API call with the payment ID
        await executeApi(apiId, requestData, nextPaymentId);
      } catch (err: any) {
        setError(err.message || 'Payment failed');
        setStatus('Payment failed');
        setIsLoading(false);
      }
    },
    [api]
  );

  const executeApi = useCallback(
    async (apiId: string, requestData?: unknown, existingPaymentId?: string) => {
      try {
        setIsLoading(true);
        setError(null);
        setCurrentApiId(apiId);
        setCurrentRequestData(requestData);
        setStatus('Executing API call...');
        setData('');

        const result = await api.executeApi(
          apiId,
          existingPaymentId || paymentId,
          requestData
        );

        if (result.kind === GetDataKind.Ok) {
          setData(JSON.stringify(result.data, null, 2));
          setStatus('Success! API call executed.');
          setIsLoading(false);
          return;
        }

        if (result.kind === GetDataKind.PaymentRequired) {
          setStatus('Payment required. Initiating payment flow...');
          await handlePaymentChallenge(result.challenge, apiId, requestData);
          return;
        }

        throw new Error(`API call failed: ${result.status} ${result.text}`);
      } catch (err: any) {
        setError(err.message || 'API call failed');
        setStatus('Error');
        setIsLoading(false);
      }
    },
    [api, paymentId, handlePaymentChallenge]
  );

  const retryWithPaymentId = useCallback(async () => {
    if (!currentApiId || !paymentId) return;
    await executeApi(currentApiId, currentRequestData, paymentId);
  }, [currentApiId, currentRequestData, paymentId, executeApi]);

  const reset = useCallback(() => {
    setStatus('');
    setData('');
    setPaymentId('');
    setCurrentApiId('');
    setCurrentRequestData(null);
    setIsLoading(false);
    setError(null);
  }, []);

  return {
    status,
    data,
    paymentId,
    isLoading,
    error,
    executeApi,
    retryWithPaymentId,
    reset,
  };
}
