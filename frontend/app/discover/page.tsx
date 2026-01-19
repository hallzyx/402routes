'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createApiClient } from '@/src/lib/api';
import type { ApiListing } from '@/src/types';
import ApiCard from '../components/ApiCard';

export default function DiscoverPage() {
  const router = useRouter();
  const [apis, setApis] = useState<ApiListing[]>([]);
  const [loading, setLoading] = useState(true);

  const api = createApiClient();

  useEffect(() => {
    loadApis();
  }, []);

  const loadApis = async () => {
    try {
      setLoading(true);
      const data = await api.getAllApis();
      setApis(data);
    } catch (error) {
      console.error('Failed to load APIs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectApi = (api: ApiListing) => {
    router.push(`/apis/${api.id}`);
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white border-b border-gray-100">
        <div className="container mx-auto max-w-7xl px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-8">
              <div className="flex items-center gap-2 cursor-pointer" onClick={() => router.push('/')}>
                <div className="w-8 h-8 bg-gradient-to-br from-violet-600 to-purple-700 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-lg">4</span>
                </div>
                <h1 className="text-xl font-bold text-gray-900">402Routes</h1>
              </div>
              <button
                onClick={() => router.push('/discover')}
                className="text-gray-700 hover:text-gray-900 font-medium transition-colors"
              >
                Discover APIs
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Marketplace Section */}
      <main className="container mx-auto max-w-7xl px-6 py-24">
        <div className="mb-12">
          <h1 className="text-5xl font-bold text-gray-900 mb-3">Discover APIs</h1>
          <p className="text-lg text-gray-600">{apis.length} {apis.length === 1 ? 'API' : 'APIs'} available</p>
        </div>

        {loading ? (
          <div className="text-center py-20">
            <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-violet-600 border-r-transparent"></div>
            <p className="mt-4 text-gray-600">Loading APIs...</p>
          </div>
        ) : apis.length === 0 ? (
          <div className="text-center py-24 bg-gray-50 rounded-lg border border-gray-200">
            <p className="text-2xl text-gray-900 font-semibold mb-2">No APIs available yet</p>
            <p className="text-gray-600 mb-8">Be the first to publish one!</p>
            <button
              onClick={() => router.push('/publish')}
              className="px-6 py-3 bg-violet-600 hover:bg-violet-700 text-white font-semibold rounded-lg transition-all"
            >
              Publish Your API
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {apis.map((api) => (
              <ApiCard
                key={api.id}
                api={api}
                onSelect={handleSelectApi}
              />
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
