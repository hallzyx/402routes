'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { FiCheck, FiCopy, FiExternalLink } from 'react-icons/fi';
import { HiSparkles } from 'react-icons/hi2';
import { createApiClient } from '@/src/lib/api';
import type { ApiListing } from '@/src/types';

function SuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const apiId = searchParams.get('id');
  
  const [api, setApi] = useState<ApiListing | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  const client = createApiClient();

  useEffect(() => {
    if (apiId) {
      loadApiDetails();
    } else {
      router.push('/');
    }
  }, [apiId]);

  const loadApiDetails = async () => {
    try {
      const data = await client.getApiById(apiId!);
      setApi(data);
    } catch (error) {
      console.error('Failed to load API:', error);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-emerald-50 flex items-center justify-center">
        <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-purple-600 border-r-transparent"></div>
      </div>
    );
  }

  if (!api) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl text-gray-600">API not found</p>
          <button
            onClick={() => router.push('/')}
            className="mt-4 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
          >
            Go to Home
          </button>
        </div>
      </div>
    );
  }

  const priceInUSD = (parseInt(api.pricePerCall) / 1_000_000).toFixed(3);
  const apiUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}/api/${api.id}`;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-emerald-50">
      <div className="container mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-12">
        {/* Success Icon */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-emerald-100 rounded-full mb-4 animate-bounce">
            <FiCheck className="w-10 h-10 text-emerald-600" strokeWidth={3} />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">API Published!</h1>
          <p className="text-lg text-gray-600">Your API is now live on 402Routes</p>
        </div>

        {/* API Card */}
        <div className="bg-white border-2 border-emerald-200 rounded-2xl p-8 shadow-xl mb-8">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">{api.name}</h2>
              <p className="text-gray-600">{api.description}</p>
            </div>
            <span className="px-4 py-2 bg-purple-100 text-purple-700 border-2 border-purple-300 rounded-full text-sm font-bold shrink-0">
              {api.category}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 p-6 bg-gray-50 rounded-xl">
            <div>
              <p className="text-gray-600 text-sm font-semibold mb-1">Method</p>
              <p className="text-gray-900 font-mono font-bold">{api.method}</p>
            </div>
            <div>
              <p className="text-gray-600 text-sm font-semibold mb-1">Price per Call</p>
              <p className="text-purple-600 font-bold text-xl font-mono">${priceInUSD} USDC</p>
            </div>
            <div>
              <p className="text-gray-600 text-sm font-semibold mb-1">Status</p>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                <span className="text-emerald-600 font-semibold">Active</span>
              </div>
            </div>
          </div>
        </div>

        {/* Next Steps */}
        <div className="bg-white border-2 border-gray-200 rounded-2xl p-8 mb-8 shadow-lg">
          <div className="flex items-center gap-3 mb-6">
            <HiSparkles className="w-6 h-6 text-purple-600" />
            <h3 className="text-2xl font-bold text-gray-900">Next Steps</h3>
          </div>

          <ul className="space-y-4 mb-8">
            <li className="flex items-start gap-3">
              <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center shrink-0 mt-0.5">
                <span className="text-purple-600 font-bold text-sm">1</span>
              </div>
              <div>
                <p className="text-gray-900 font-medium">AI agents can now discover your API</p>
                <p className="text-gray-600 text-sm">Your API is listed in the marketplace</p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center shrink-0 mt-0.5">
                <span className="text-purple-600 font-bold text-sm">2</span>
              </div>
              <div>
                <p className="text-gray-900 font-medium">You'll receive payments automatically</p>
                <p className="text-gray-600 text-sm">Via X402 protocol to your wallet</p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center shrink-0 mt-0.5">
                <span className="text-purple-600 font-bold text-sm">3</span>
              </div>
              <div>
                <p className="text-gray-900 font-medium">Monitor usage in your dashboard</p>
                <p className="text-gray-600 text-sm">Track calls and revenue in real-time</p>
              </div>
            </li>
          </ul>

          <div className="p-6 bg-gray-50 rounded-xl">
            <p className="text-sm font-bold text-gray-900 mb-3">API Endpoint for Agents:</p>
            <div className="flex items-center gap-3">
              <code className="flex-1 px-4 py-3 bg-white border-2 border-gray-300 rounded-lg text-sm font-mono text-gray-700 break-all">
                {apiUrl}
              </code>
              <button
                onClick={() => copyToClipboard(apiUrl)}
                className="px-4 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors shrink-0"
                title="Copy to clipboard"
              >
                {copied ? <FiCheck className="w-5 h-5" /> : <FiCopy className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4">
          <button
            onClick={() => router.push(`/apis/${api.id}`)}
            className="flex-1 px-6 py-4 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-lg transition-all duration-200 shadow-md hover:shadow-lg flex items-center justify-center gap-2"
          >
            <FiExternalLink className="w-5 h-5" />
            View in Marketplace
          </button>
          <button
            onClick={() => router.push('/publish')}
            className="flex-1 px-6 py-4 bg-white border-2 border-gray-300 hover:border-purple-600 text-gray-900 hover:text-purple-600 font-semibold rounded-lg transition-all duration-200 flex items-center justify-center gap-2"
          >
            <HiSparkles className="w-5 h-5" />
            Publish Another API
          </button>
        </div>
      </div>
    </div>
  );
}

export default function SuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-emerald-50 flex items-center justify-center">
        <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-purple-600 border-r-transparent"></div>
      </div>
    }>
      <SuccessContent />
    </Suspense>
  );
}
