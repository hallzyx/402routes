'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { use } from 'react';
import { FiArrowLeft } from 'react-icons/fi';
import { createApiClient } from '@/src/lib/api';
import ApiExecutor from '@/app/components/ApiExecutor';
import type { ApiListing } from '@/src/types';

export default function ExecuteApiPage({ params }: { params: Promise<{ apiId: string }> }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { apiId } = use(params);
  const [api, setApi] = useState<ApiListing | null>(null);
  const [loading, setLoading] = useState(true);
  const [autoExecute, setAutoExecute] = useState(false);

  const client = createApiClient();

  useEffect(() => {
    loadApiDetails();
    // Check if autoexecute parameter is present
    if (searchParams.get('autoexecute') === 'true') {
      setAutoExecute(true);
    }
  }, [apiId]);

  const loadApiDetails = async () => {
    try {
      const data = await client.getApiById(apiId);
      setApi(data);
    } catch (error) {
      console.error('Failed to load API:', error);
    } finally {
      setLoading(false);
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

  return (
    <div className="min-h-screen bg-white">
      {/* Main Content */}
      <main className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        {autoExecute && (
          <div className="mb-6 p-4 bg-blue-50 border-2 border-blue-200 rounded-lg">
            <p className="text-blue-800 font-semibold">
              ⚡ Preparando ejecución automática del API. Conecta tu wallet para continuar.
            </p>
          </div>
        )}

        <div className="bg-white border-2 border-gray-200 rounded-2xl p-6 sm:p-8 shadow-lg mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">{api.name}</h1>
          <p className="text-gray-600 text-lg mb-6">{api.description}</p>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
            <div>
              <p className="text-gray-600 text-sm font-semibold mb-1">Method</p>
              <p className="text-gray-900 font-mono font-bold">{api.method}</p>
            </div>
            <div>
              <p className="text-gray-600 text-sm font-semibold mb-1">Price</p>
              <p className="text-purple-600 font-bold text-lg font-mono">
                ${(parseInt(api.pricePerCall) / 1_000_000).toFixed(3)} USDC
              </p>
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

        {/* API Executor */}
        <ApiExecutor 
          api={api} 
          onBack={() => router.push('/discover')} 
        />
      </main>
    </div>
  );
}
