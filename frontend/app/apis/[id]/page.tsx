'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { use } from 'react';
import { FiArrowLeft, FiEdit, FiBarChart2, FiCheck } from 'react-icons/fi';
import { HiOutlineCodeBracket, HiSparkles } from 'react-icons/hi2';
import { createApiClient } from '@/src/lib/api';
import { getWalletAddress, isWalletConnected } from '@/src/utils/wallet';
import ApiExecutor from '@/app/components/ApiExecutor';
import type { ApiListing } from '@/src/types';

export default function ApiDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id } = use(params);
  const [api, setApi] = useState<ApiListing | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [subscriptionLoading, setSubscriptionLoading] = useState(true);

  const client = createApiClient();

  useEffect(() => {
    loadApiDetails();
    checkSubscription();
  }, [id]);

  const loadApiDetails = async () => {
    try {
      const data = await client.getApiById(id);
      setApi(data);
    } catch (error) {
      console.error('Failed to load API:', error);
    } finally {
      setLoading(false);
    }
  };

  const checkSubscription = async () => {
    try {
      const connected = await isWalletConnected();
      if (connected) {
        const address = await getWalletAddress();
        const subs = await client.getSubscriptions(address);
        const isSub = subs.some((s: any) => s.apiId === id);
        setIsSubscribed(isSub);
      }
    } catch (error) {
      console.error('Failed to check subscription:', error);
    } finally {
      setSubscriptionLoading(false);
    }
  };

  const handleSubscribe = async () => {
    try {
      setSubscriptionLoading(true);
      const address = await getWalletAddress();
      await client.subscribeToApi(address, id);
      setIsSubscribed(true);
      alert('Successfully subscribed! You can now use the API.');
    } catch (error) {
      console.error('Failed to subscribe:', error);
      alert('Failed to subscribe. Please try again.');
    } finally {
      setSubscriptionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-purple-600 border-r-transparent"></div>
      </div>
    );
  }

  if (!api) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl text-gray-600 mb-4">API not found</p>
          <button
            onClick={() => router.push('/')}
            className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
          >
            Back to Marketplace
          </button>
        </div>
      </div>
    );
  }

  const priceInUSD = (parseInt(api.pricePerCall) / 1_000_000).toFixed(3);

  return (
    <div className="min-h-screen bg-white">
      {/* API Details */}
      <main className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white border-2 border-gray-200 rounded-2xl p-6 sm:p-8 shadow-lg mb-8">
          <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-6">
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">{api.name}</h1>
              <p className="text-gray-600 text-lg mb-3">{api.description}</p>
              <p className="text-sm text-gray-500 font-mono">
                by {api.ownerAddress.slice(0, 6)}...{api.ownerAddress.slice(-4)}
              </p>
            </div>
            <span className="px-4 py-2 bg-purple-100 text-purple-700 border-2 border-purple-300 rounded-full text-sm font-bold shrink-0">
              {api.category}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 p-6 bg-gray-50 rounded-xl mb-8">
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
              {api.isActive ? (
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                  <span className="text-emerald-600 font-semibold">Active</span>
                </div>
              ) : (
                <span className="text-gray-500 font-semibold">Inactive</span>
              )}
            </div>
          </div>

          {isSubscribed && (
            <div className="space-y-4">
              {/* Unified Endpoint URL */}
              <div className="p-6 bg-purple-50 border-2 border-purple-200 rounded-xl">
                <div className="flex items-center gap-2 mb-3">
                  <HiOutlineCodeBracket className="w-5 h-5 text-purple-600" />
                  <p className="text-sm font-bold text-gray-900">Endpoint de Consumo 402 Wrapped</p>
                </div>
                <code className="block px-4 py-3 bg-white border-2 border-gray-300 rounded-lg text-sm font-mono text-gray-700 break-all">
                  {process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:8787'}/api/proxy/{api.id}{api.endpoint}
                </code>
                <p className="text-xs text-gray-600 mt-3 leading-relaxed">
                  🌐 <b>Navegador:</b> Redirige automáticamente al pago con MetaMask.<br/>
                  🔧 <b>Scripts/Backend:</b> Incluye el header <code className="px-1 py-0.5 bg-gray-200 rounded">x-payment-id</code> para pagos programáticos.
                </p>
              </div>
            </div>
          )}

          <div className="flex flex-wrap gap-4 mt-8">
            <button
              onClick={() => alert('Edit functionality coming soon')}
              className="px-6 py-3 bg-white border-2 border-gray-300 hover:border-purple-600 text-gray-900 hover:text-purple-600 font-semibold rounded-lg transition-all flex items-center gap-2"
            >
              <FiEdit className="w-4 h-4" />
              Edit
            </button>
            <button
              onClick={() => alert('Stats dashboard coming soon')}
              className="px-6 py-3 bg-white border-2 border-gray-300 hover:border-purple-600 text-gray-900 hover:text-purple-600 font-semibold rounded-lg transition-all flex items-center gap-2"
            >
              <FiBarChart2 className="w-4 h-4" />
              View Stats
            </button>
          </div>
        </div>

        {/* Test API Section or Subscribe */}
        {isSubscribed ? (
           <ApiExecutor 
             api={api} 
             onBack={() => router.push('/')} 
           />
        ) : (
           <div className="bg-gradient-to-br from-violet-50 to-purple-50 border-2 border-violet-100 rounded-2xl p-8 text-center mt-8">
              <div className="bg-white w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
                <HiSparkles className="w-8 h-8 text-violet-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Subscribe to Use This API</h2>
              <p className="text-gray-600 max-w-lg mx-auto mb-8">
                 Add this API to your subscriptions to start making requests and integrating it into your applications.
              </p>
              <button
                onClick={handleSubscribe}
                disabled={subscriptionLoading}
                className="px-8 py-4 bg-violet-600 hover:bg-violet-700 text-white font-bold rounded-xl transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 flex items-center gap-2 mx-auto disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {subscriptionLoading ? 'Processing...' : 'Subscribe Now (Free)'}
              </button>
           </div>
        )}
      </main>
    </div>
  );
}
