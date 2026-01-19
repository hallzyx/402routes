'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { HiSparkles, HiCurrencyDollar, HiBolt } from 'react-icons/hi2';
import { FiArrowRight } from 'react-icons/fi';
import { getWalletAddress, isWalletConnected } from '@/src/utils/wallet';
import WalletDropdown from './components/WalletDropdown';
import StatsSection from './components/StatsSection';
import FAQSection from './components/FAQSection';

export default function Home() {
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

      {/* Hero Section */}
      <section className="bg-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808018_1px,transparent_1px),linear-gradient(to_bottom,#80808018_1px,transparent_1px)] bg-[size:4rem_4rem]"></div>
        <div className="container mx-auto max-w-7xl px-6 pt-32 pb-24 relative z-10">
          <div className="max-w-4xl">
            <h2 className="text-6xl sm:text-7xl font-bold mb-8 leading-tight text-gray-900">
              Monetize Your API with <span className="text-violet-600">Automatic Payments</span>
            </h2>
            <p className="text-xl sm:text-2xl text-gray-600 mb-12 leading-relaxed max-w-3xl">
              Let AI agents discover and pay for your API automatically - no API keys, no billing headaches.
            </p>
            <div className="flex gap-4">
              <button
                onClick={() => router.push('/publish')}
                className="px-6 py-3.5 bg-violet-600 hover:bg-violet-700 text-white font-semibold rounded-lg transition-all flex items-center gap-2 group"
              >
                <HiSparkles className="w-5 h-5" />
                Publish Your API
                <FiArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
              <button
                onClick={() => router.push('/discover')}
                className="px-6 py-3.5 bg-white text-gray-900 font-semibold rounded-lg border-2 border-gray-300 hover:border-gray-400 hover:bg-gray-50 transition-all"
              >
                Discover APIs
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-24 bg-white">
        <div className="container mx-auto max-w-7xl px-6">
          <h3 className="text-4xl font-bold text-gray-900 mb-16">Why 402Routes?</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gray-50 p-10 rounded-lg border border-gray-200">
              <div className="w-16 h-16 bg-white border border-gray-200 rounded-lg flex items-center justify-center mb-6">
                <HiBolt className="w-8 h-8 text-violet-600" />
              </div>
              <h4 className="text-xl font-semibold text-gray-900 mb-3">Instant Payments</h4>
              <p className="text-gray-600 leading-relaxed">
                Get paid automatically for every API call via X402 protocol. No invoices, no delays.
              </p>
            </div>

            <div className="bg-gray-50 p-10 rounded-lg border border-gray-200">
              <div className="w-16 h-16 bg-white border border-gray-200 rounded-lg flex items-center justify-center mb-6">
                <HiCurrencyDollar className="w-8 h-8 text-green-600" />
              </div>
              <h4 className="text-xl font-semibold text-gray-900 mb-3">Set Your Price</h4>
              <p className="text-gray-600 leading-relaxed">
                Control your pricing per API call. From $0.0001 to $1+ - you decide the value.
              </p>
            </div>

            <div className="bg-gray-50 p-10 rounded-lg border border-gray-200">
              <div className="w-16 h-16 bg-white border border-gray-200 rounded-lg flex items-center justify-center mb-6">
                <HiSparkles className="w-8 h-8 text-blue-600" />
              </div>
              <h4 className="text-xl font-semibold text-gray-900 mb-3">AI Discovery</h4>
              <p className="text-gray-600 leading-relaxed">
                AI agents can discover and use your API automatically. No manual integration needed.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <StatsSection />

      {/* FAQ Section */}
      <FAQSection />

      {/* Footer */}
      <footer className="border-t border-gray-100 bg-white mt-24">
        <div className="container mx-auto max-w-7xl px-6 py-8 text-center">
          <p className="text-gray-500 text-sm">Powered by Cronos & X402 Protocol</p>
        </div>
      </footer>
    </div>
  );
}
