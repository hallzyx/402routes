'use client';

import { useEffect, useState } from 'react';
import { createApiClient } from '@/src/lib/api';
import { getWalletAddress, isWalletConnected } from '@/src/utils/wallet';
import type { ApiListing, CreateApiRequest } from '@/src/types';
import ApiCard from './components/ApiCard';
import CreateApiForm from './components/CreateApiForm';
import ApiExecutor from './components/ApiExecutor';

export default function Home() {
  const [apis, setApis] = useState<ApiListing[]>([]);
  const [selectedApi, setSelectedApi] = useState<ApiListing | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [walletAddress, setWalletAddress] = useState<string>('');
  const [isConnected, setIsConnected] = useState(false);
  const [loading, setLoading] = useState(true);

  const api = createApiClient();

  useEffect(() => {
    loadApis();
    checkWalletConnection();
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

  const checkWalletConnection = async () => {
    const connected = await isWalletConnected();
    setIsConnected(connected);
    if (connected) {
      try {
        const address = await getWalletAddress();
        setWalletAddress(address);
      } catch (error) {
        console.error('Failed to get wallet address:', error);
      }
    }
  };

  const handleConnectWallet = async () => {
    try {
      const address = await getWalletAddress();
      setWalletAddress(address);
      setIsConnected(true);
    } catch (error) {
      console.error('Failed to connect wallet:', error);
      alert('Please install MetaMask to use this application');
    }
  };

  const handleCreateApi = async (data: CreateApiRequest) => {
    try {
      await api.createApi(data);
      await loadApis();
      setShowCreateForm(false);
    } catch (error: any) {
      alert(`Failed to create API: ${error.message}`);
    }
  };

  const handleSelectApi = (api: ApiListing) => {
    setSelectedApi(api);
  };

  const handleBackToMarketplace = () => {
    setSelectedApi(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900">
      {/* Header */}
      <header className="border-b border-gray-700 bg-black/40 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-white">402Routes</h1>
            <p className="text-sm text-gray-400">API Marketplace with X402 Payments</p>
          </div>
          <div className="flex gap-4 items-center">
            {isConnected ? (
              <div className="px-4 py-2 bg-green-600/20 border border-green-500 rounded-lg text-green-300 text-sm">
                {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
              </div>
            ) : (
              <button
                onClick={handleConnectWallet}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg text-white font-medium transition"
              >
                Connect Wallet
              </button>
            )}
            <button
              onClick={() => setShowCreateForm(!showCreateForm)}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-white font-medium transition"
            >
              {showCreateForm ? 'Cancel' : '+ Publish API'}
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {showCreateForm && (
          <div className="mb-8">
            <CreateApiForm
              onSubmit={handleCreateApi}
              onCancel={() => setShowCreateForm(false)}
              walletAddress={walletAddress}
            />
          </div>
        )}

        {selectedApi ? (
          <ApiExecutor api={selectedApi} onBack={handleBackToMarketplace} />
        ) : (
          <div>
            <div className="mb-6 flex justify-between items-center">
              <h2 className="text-2xl font-bold text-white">Marketplace</h2>
              <p className="text-gray-400">{apis.length} APIs available</p>
            </div>

            {loading ? (
              <div className="text-center py-12 text-gray-400">Loading APIs...</div>
            ) : apis.length === 0 ? (
              <div className="text-center py-12 text-gray-400">
                No APIs available yet. Be the first to publish one!
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
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-700 bg-black/40 backdrop-blur-sm mt-12">
        <div className="max-w-7xl mx-auto px-4 py-6 text-center text-gray-400 text-sm">
          <p>Powered by Cronos & X402 Protocol</p>
        </div>
      </footer>
    </div>
  );
}
