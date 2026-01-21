'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { HiSparkles } from 'react-icons/hi2';
import { FiEdit, FiTrash2, FiDollarSign } from 'react-icons/fi';
import { createApiClient } from '@/src/lib/api';
import { getWalletAddress, isWalletConnected } from '@/src/utils/wallet';
import type { ApiListing } from '@/src/types';

export default function MyApisPage() {
  const router = useRouter();
  const [apis, setApis] = useState<ApiListing[]>([]);
  const [walletAddress, setWalletAddress] = useState<string>('');
  const [loading, setLoading] = useState(true);

  const api = createApiClient();

  useEffect(() => {
    checkWalletAndLoadApis();
  }, []);

  const checkWalletAndLoadApis = async () => {
    try {
      const connected = await isWalletConnected();
      if (!connected) {
        router.push('/');
        return;
      }

      const address = await getWalletAddress();
      setWalletAddress(address);

      const allApis = await api.getAllApis();
      const myApis = allApis.filter((apiItem) => 
        apiItem.ownerAddress?.toLowerCase() === address.toLowerCase()
      );
      setApis(myApis);
    } catch (error) {
      console.error('Failed to load APIs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEditApi = (apiId: string) => {
    // TODO: Implementar edición de API
    console.log('Edit API:', apiId);
  };

  const handleDeleteApi = async (apiId: string) => {
    if (!confirm('Are you sure you want to delete this API? This action cannot be undone.')) {
      return;
    }
    
    try {
      await api.deleteApi(apiId);
      // Remove from state immediately
      setApis(prev => prev.filter(api => api.id !== apiId));
    } catch (error) {
      console.error('Failed to delete API:', error);
      alert('Failed to delete API. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Main Content */}
      <main className="container mx-auto max-w-7xl px-6 py-24">
        <div className="mb-12">
          <h1 className="text-5xl font-bold text-gray-900 mb-3">My APIs</h1>
          <p className="text-lg text-gray-600">
            {apis.length} {apis.length === 1 ? 'API' : 'APIs'} published
          </p>
        </div>

        {loading ? (
          <div className="text-center py-20">
            <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-violet-600 border-r-transparent"></div>
            <p className="mt-4 text-gray-600">Loading your APIs...</p>
          </div>
        ) : apis.length === 0 ? (
          <div className="text-center py-24 bg-gray-50 rounded-lg border border-gray-200">
            <HiSparkles className="w-16 h-16 text-violet-600 mx-auto mb-4" />
            <p className="text-2xl text-gray-900 font-semibold mb-2">No APIs published yet</p>
            <p className="text-gray-600 mb-8">Start monetizing your APIs today!</p>
            <button
              onClick={() => router.push('/publish')}
              className="px-6 py-3 bg-violet-600 hover:bg-violet-700 text-white font-semibold rounded-lg transition-all inline-flex items-center gap-2"
            >
              <HiSparkles className="w-5 h-5" />
              Publish Your First API
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {apis.map((apiItem) => (
              <div
                key={apiItem.id}
                className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      {apiItem.name}
                    </h3>
                    <p className="text-gray-600 mb-4">{apiItem.description}</p>
                    <div className="flex items-center gap-4 text-sm">
                      <span className="px-3 py-1 bg-violet-100 text-violet-700 rounded-full font-medium">
                        {apiItem.category}
                      </span>
                      <span className="flex items-center gap-1 text-gray-700">
                        <FiDollarSign className="w-4 h-4" />
                        {(parseInt(apiItem.pricePerCall) / 1_000_000).toFixed(3)} USDC per call
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => router.push(`/apis/${apiItem.id}`)}
                      className="px-4 py-2 text-violet-600 hover:bg-violet-50 rounded-lg transition-colors font-medium"
                    >
                      View
                    </button>
                    <button
                      onClick={() => handleEditApi(apiItem.id)}
                      className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors flex items-center gap-2"
                    >
                      <FiEdit className="w-4 h-4" />
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteApi(apiItem.id)}
                      className="px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors flex items-center gap-2"
                    >
                      <FiTrash2 className="w-4 h-4" />
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-100 bg-white mt-24">
        <div className="container mx-auto max-w-7xl px-6 py-8 text-center">
          <p className="text-gray-500 text-sm">Powered by Cronos & X402 Protocol</p>
        </div>
      </footer>
    </div>
  );
}
