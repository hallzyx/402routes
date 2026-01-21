'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getWalletAddress, isWalletConnected } from '@/src/utils/wallet';
import WalletDropdown from './WalletDropdown';

export default function Header() {
  const router = useRouter();
  const [walletAddress, setWalletAddress] = useState<string>('');
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    checkWalletConnection();
  }, []);

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

  const handleLogout = () => {
    setWalletAddress('');
    setIsConnected(false);
  };

  return (
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
            <button
               onClick={() => router.push('/dashboard')}
               className="text-gray-700 hover:text-gray-900 font-medium transition-colors"
             >
               My Dashboard
             </button>
          </div>
          <div className="flex gap-3 items-center">
            {isConnected ? (
              <WalletDropdown walletAddress={walletAddress} onLogout={handleLogout} />
            ) : (
              <button
                onClick={handleConnectWallet}
                className="px-4 py-2 text-gray-700 hover:text-gray-900 font-medium transition-colors"
              >
                Sign In
              </button>
            )}
            <button
              onClick={() => router.push('/publish')}
              className="px-5 py-2.5 bg-violet-600 hover:bg-violet-700 text-white font-semibold rounded-lg transition-colors"
            >
              Publish API
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
