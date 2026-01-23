'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { HiSparkles } from 'react-icons/hi2';
import { FiTrash2 } from 'react-icons/fi';
import { createApiClient } from '@/src/lib/api';
import { getWalletAddress, isWalletConnected } from '@/src/utils/wallet';
import ApiCard from '../components/ApiCard';
import type { ApiListing } from '@/src/types';

export default function MySubscriptionsPage() {
  const router = useRouter();
  const [subscriptions, setSubscriptions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const api = createApiClient();

  useEffect(() => {
    loadSubscriptions();
  }, []);

  const loadSubscriptions = async () => {
    try {
      const connected = await isWalletConnected();
      if (!connected) {
        setLoading(false);
        return;
      }
      const address = await getWalletAddress();
      const subs = await api.getSubscriptions(address);
      setSubscriptions(subs);
    } catch (error) {
      console.error('Failed to load subscriptions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectApi = (apiListing: ApiListing) => {
    router.push(`/execute/${apiListing.id}`);
  };

  const handleUnsubscribe = async (apiId: string) => {
    try {
      const address = await getWalletAddress();
      await api.unsubscribeToApi(address, apiId);
      // Reload subscriptions
      loadSubscriptions();
      alert('Successfully unsubscribed!');
    } catch (error) {
      console.error('Failed to unsubscribe:', error);
      alert('Failed to unsubscribe. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Main Content */}
      <main className="container mx-auto max-w-7xl px-6 py-24">
        <div className="mb-12">
          <h1 className="text-5xl font-bold text-gray-900 mb-3">My Subscriptions</h1>
          <p className="text-lg text-gray-600">
            APIs you've subscribed to
          </p>
        </div>

        {loading ? (
          <div className="text-center py-20">
            <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-violet-600 border-r-transparent"></div>
            <p className="mt-4 text-gray-600">Loading subscriptions...</p>
          </div>
        ) : subscriptions.length === 0 ? (
          <div className="text-center py-24 bg-gray-50 rounded-lg border border-gray-200">
            <HiSparkles className="w-16 h-16 text-violet-600 mx-auto mb-4" />
            <p className="text-2xl text-gray-900 font-semibold mb-2">No subscriptions yet</p>
            <p className="text-gray-600 mb-8">Start using APIs from the marketplace!</p>
            <button
              onClick={() => router.push('/discover')}
              className="px-6 py-3 bg-violet-600 hover:bg-violet-700 text-white font-semibold rounded-lg transition-all inline-flex items-center gap-2"
            >
              <HiSparkles className="w-5 h-5" />
              Discover APIs
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {subscriptions.map((sub) => (
              <div key={sub.apiId} className="relative">
                <ApiCard
                  api={sub.api}
                  onSelect={handleSelectApi}
                />
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleUnsubscribe(sub.apiId);
                  }}
                  className="absolute top-4 right-4 p-2 bg-red-500 hover:bg-red-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all"
                  title="Unsubscribe"
                >
                  <FiTrash2 className="w-4 h-4" />
                </button>
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
