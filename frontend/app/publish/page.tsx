'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FiArrowLeft } from 'react-icons/fi';
import { getWalletAddress, isWalletConnected } from '@/src/utils/wallet';
import CreateApiForm from '../components/CreateApiForm';
import { createApiClient } from '@/src/lib/api';
import type { CreateApiRequest } from '@/src/types';

export default function PublishPage() {
  const router = useRouter();
  const [walletAddress, setWalletAddress] = useState<string>('');
  const [isConnected, setIsConnected] = useState(false);
  const [loading, setLoading] = useState(true);
  
  const api = createApiClient();

  useEffect(() => {
    checkWallet();
  }, []);

  const checkWallet = async () => {
    try {
      const connected = await isWalletConnected();
      if (connected) {
        const address = await getWalletAddress();
        setWalletAddress(address);
        setIsConnected(true);
      }
    } catch (error) {
      console.error('Failed to check wallet:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleConnectWallet = async () => {
    try {
      const address = await getWalletAddress();
      setWalletAddress(address);
      setIsConnected(true);
    } catch (error) {
      console.error('Failed to connect wallet:', error);
      alert('Please install MetaMask to publish an API');
    }
  };

  const handleCreateApi = async (data: CreateApiRequest) => {
    try {
      const result = await api.createApi(data);
      // Redirect to success page with API id
      router.push(`/publish/success?id=${result.id}`);
    } catch (error: any) {
      alert(`Failed to create API: ${error.message}`);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-purple-600 border-r-transparent"></div>
      </div>
    );
  }

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
          <button
            onClick={() => router.push('/')}
            className="text-purple-600 hover:text-purple-700 flex items-center gap-2 font-semibold text-sm mb-8 transition-colors"
          >
            <FiArrowLeft /> Back to Home
          </button>

          <div className="max-w-md mx-auto">
            <div className="bg-white border-2 border-gray-200 rounded-2xl p-8 shadow-xl text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              
              <h2 className="text-2xl font-bold text-gray-900 mb-3">Connect Your Wallet</h2>
              <p className="text-gray-600 mb-8">
                Connect your wallet to start publishing APIs on 402Routes
              </p>

              <button
                onClick={handleConnectWallet}
                className="w-full px-6 py-4 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-lg transition-all duration-200 shadow-md hover:shadow-lg flex items-center justify-center gap-3"
              >
                <svg className="w-6 h-6" viewBox="0 0 40 40" fill="none">
                  <path d="M37.8 15.2L22.5 4.8c-1.4-1-3.6-1-5 0L2.2 15.2C.8 16.2 0 17.8 0 19.4v1.2c0 1.6.8 3.2 2.2 4.2l15.3 10.4c1.4 1 3.6 1 5 0l15.3-10.4c1.4-1 2.2-2.6 2.2-4.2v-1.2c0-1.6-.8-3.2-2.2-4.2z" fill="#E17726"/>
                  <path d="M26.8 20L20 24.8 13.2 20l6.8-4.8 6.8 4.8z" fill="#E27625"/>
                  <path d="M13.2 20v8l6.8 4.8v-8l-6.8-4.8z" fill="#E27625"/>
                  <path d="M26.8 20v8l-6.8 4.8v-8l6.8-4.8z" fill="#D5BFB2"/>
                  <path d="M13.2 12l6.8-4.8L26.8 12 20 16.8 13.2 12z" fill="#E27625"/>
                </svg>
                Connect MetaMask
              </button>

              <button
                onClick={() => router.push('/')}
                className="w-full mt-4 px-6 py-3 bg-white border-2 border-gray-300 hover:border-gray-400 text-gray-700 font-semibold rounded-lg transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <button
          onClick={() => router.push('/')}
          className="text-purple-600 hover:text-purple-700 flex items-center gap-2 font-semibold text-sm mb-8 transition-colors"
        >
          <FiArrowLeft /> Back to Home
        </button>

        <div className="max-w-3xl mx-auto">
          <CreateApiForm
            onSubmit={handleCreateApi}
            onCancel={() => router.push('/')}
            walletAddress={walletAddress}
          />
        </div>
      </div>
    </div>
  );
}
