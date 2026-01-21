'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getWalletAddress, isWalletConnected } from '@/src/utils/wallet';
import { createApiClient } from '@/src/lib/api';
import type { CreateApiRequest } from '@/src/types';
import { 
  MdAccountBalanceWallet, 
  MdInfo, 
  MdSettingsEthernet, 
  MdPayments, 
  MdHelp, 
  MdAutoAwesome, 
  MdClose, 
  MdSecurity, 
  MdSpeed 
} from 'react-icons/md';

export default function PublishPage() {
  const router = useRouter();
  const [walletAddress, setWalletAddress] = useState<string>('');
  const [isConnected, setIsConnected] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState<CreateApiRequest>({
    name: '',
    description: '',
    category: 'Other',
    baseUrl: '',
    endpoint: '',
    method: 'GET',
    pricePerCall: '1000000', // Default 1.00 USDC
    ownerAddress: '',
  });

  // Helper for price input (User sees USDC, we store microUSDC)
  const [displayPrice, setDisplayPrice] = useState('1.000');

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
        setFormData(prev => ({ ...prev, ownerAddress: address }));
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
      setFormData(prev => ({ ...prev, ownerAddress: address }));
      setIsConnected(true);
    } catch (error) {
      console.error('Failed to connect wallet:', error);
      alert('Please install MetaMask to publish an API');
    }
  };

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setDisplayPrice(val);
    const numeric = parseFloat(val);
    if (!isNaN(numeric)) {
      setFormData(prev => ({ ...prev, pricePerCall: Math.round(numeric * 1000000).toString() }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      // Map category values if necessary (e.g. "ai" -> "AI")
      const categoryMap: Record<string, string> = {
        'ai': 'AI',
        'weather': 'Weather',
        'finance': 'Finance',
        'data': 'Data',
        'other': 'Other',
        'ecommerce': 'Ecommerce'
      };
      
      const payload = {
        ...formData,
        category: categoryMap[formData.category.toLowerCase()] || formData.category
      };

      const result = await api.createApi(payload);
      router.push(`/apis/${result.id}`); 
    } catch (error: any) {
      alert(`Failed to create API: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background-light flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-background-light dark:bg-background-dark flex items-center justify-center p-4">
        <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-xl max-w-md w-full text-center border border-slate-200 dark:border-slate-700">
           <div className="w-16 h-16 bg-primary/10 text-primary rounded-2xl flex items-center justify-center mx-auto mb-6">
            <MdAccountBalanceWallet className="text-3xl" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Connect Wallet</h2>
          <p className="text-slate-500 mb-8">Please connect your wallet to publish an API.</p>
          <button 
            onClick={handleConnectWallet}
            className="w-full bg-primary hover:opacity-90 text-white py-3 rounded-xl font-bold transition-all shadow-lg shadow-primary/20"
          >
            Connect MetaMask
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100 transition-colors duration-200 font-display">
      <main className="max-w-3xl mx-auto px-4 py-12 relative animate-fade-in">
        <div className="fixed inset-0 grid-pattern pointer-events-none -z-10"></div>
        
        <div className="mb-10 text-center">
          <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white mb-3">Publish New API</h1>
          <p className="text-slate-600 dark:text-slate-400 text-lg">Share your API with the community and start earning USDC on every call.</p>
        </div>

        <div className="bg-card-light dark:bg-card-dark rounded-3xl shadow-2xl shadow-slate-200/50 dark:shadow-none border border-slate-200 dark:border-slate-800 overflow-hidden">
          <div className="p-8 md:p-10">
            <form onSubmit={handleSubmit} className="space-y-8">
              
              {/* General Info */}
              <div className="space-y-6">
                <div className="flex items-center gap-2 text-primary font-bold text-sm uppercase tracking-wider">
                  <MdInfo className="text-lg" />
                  General Information
                </div>
                <div className="grid grid-cols-1 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2" htmlFor="api-name">API Name *</label>
                    <input 
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all dark:text-white placeholder:text-slate-400" 
                      id="api-name" 
                      required
                      placeholder="e.g., Global Weather Insights" 
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2" htmlFor="description">Description *</label>
                    <textarea 
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all dark:text-white placeholder:text-slate-400" 
                      id="description" 
                      required
                      placeholder="Describe what your API does and how it helps developers..." 
                      rows={3}
                      value={formData.description}
                      onChange={(e) => setFormData({...formData, description: e.target.value})}
                    ></textarea>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2" htmlFor="category">Category *</label>
                    <select 
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all dark:text-white" 
                      id="category"
                      value={formData.category}
                      onChange={(e) => setFormData({...formData, category: e.target.value})}
                    >
                      <option value="Data">Data & Analytics</option>
                      <option value="AI">Artificial Intelligence</option>
                      <option value="Weather">Weather</option>
                      <option value="Finance">Finance</option>
                      <option value="Ecommerce">E-commerce</option>
                      <option value="Funny">Funny</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2" htmlFor="method">Method *</label>
                    <select 
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all dark:text-white" 
                      id="method"
                      value={formData.method}
                      onChange={(e) => setFormData({...formData, method: e.target.value as any})}
                    >
                      <option value="GET">GET</option>
                      <option value="POST">POST</option>
                      <option value="PUT">PUT</option>
                      <option value="DELETE">DELETE</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="h-px bg-slate-100 dark:bg-slate-800"></div>

              {/* Technical Setup */}
              <div className="space-y-6">
                <div className="flex items-center gap-2 text-primary font-bold text-sm uppercase tracking-wider">
                  <MdSettingsEthernet className="text-lg" />
                  Technical Setup
                </div>
                <div className="grid grid-cols-1 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2" htmlFor="base-url">Base URL *</label>
                    <input 
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all dark:text-white placeholder:text-slate-400" 
                      id="base-url" 
                      required
                      placeholder="https://api.yourdomain.com" 
                      type="url"
                      value={formData.baseUrl}
                      onChange={(e) => setFormData({...formData, baseUrl: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2" htmlFor="endpoint-path">Endpoint Path *</label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-mono text-sm">/</span>
                      <input 
                        className="w-full pl-7 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all dark:text-white placeholder:text-slate-400" 
                        id="endpoint-path" 
                        required
                        placeholder="v1/forecast" 
                        type="text"
                        value={formData.endpoint.startsWith('/') ? formData.endpoint.substring(1) : formData.endpoint}
                        onChange={(e) => setFormData({...formData, endpoint: '/' + e.target.value.replace(/^\//, '')})}
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="h-px bg-slate-100 dark:bg-slate-800"></div>

              {/* Monetization */}
              <div className="space-y-6">
                <div className="flex items-center gap-2 text-primary font-bold text-sm uppercase tracking-wider">
                  <MdPayments className="text-lg" />
                  Monetization & Ownership
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2" htmlFor="price">Price per Call (USDC) *</label>
                    <div className="relative">
                      <input 
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all dark:text-white placeholder:text-slate-400" 
                        id="price" 
                        placeholder="1.000" 
                        step="0.001" 
                        type="number"
                        min="0"
                        value={displayPrice}
                        onChange={handlePriceChange}
                      />
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">USDC</div>
                    </div>
                    <p className="mt-2 text-xs text-slate-500 dark:text-slate-500 flex items-center gap-1">
                      <MdHelp className="text-sm" />
                      Base units: 1,000,000 (Cronos USDC decimals)
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2" htmlFor="owner-address">Owner Address *</label>
                    <input 
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-900/50 text-slate-500 dark:text-slate-500 font-mono text-xs cursor-not-allowed" 
                      id="owner-address" 
                      readOnly 
                      type="text" 
                      value={walletAddress}
                    />
                    <p className="mt-2 text-xs text-slate-500 dark:text-slate-500">Default: Your connected wallet address</p>
                  </div>
                </div>
              </div>

              <div className="pt-6 flex flex-col sm:flex-row items-center gap-4">
                <button 
                  className="w-full sm:flex-1 bg-primary hover:opacity-90 text-white py-4 rounded-2xl text-base font-bold transition-all shadow-xl shadow-primary/20 flex items-center justify-center gap-2 group disabled:opacity-70 disabled:cursor-not-allowed" 
                  type="submit"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    'Publishing...'
                  ) : (
                    <>
                      <MdAutoAwesome className="group-hover:rotate-12 transition-transform" />
                      Publish API
                    </>
                  )}
                </button>
                <button 
                  className="w-full sm:w-auto px-8 py-4 rounded-2xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 font-bold hover:bg-slate-50 dark:hover:bg-slate-800 transition-all flex items-center justify-center gap-2" 
                  type="button"
                  onClick={() => router.back()}
                >
                  <MdClose />
                  Cancel
                </button>
              </div>
            </form>
          </div>
          
          <div className="bg-slate-50 dark:bg-slate-900/50 px-8 py-4 border-t border-slate-100 dark:border-slate-800/50 flex items-center justify-center gap-6">
            <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
              <MdSecurity className="text-base text-emerald-500" />
              X402 Protocol Secured
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
              <MdSpeed className="text-base text-primary" />
              Instant Settlement
            </div>
          </div>
        </div>

        <p className="mt-8 text-center text-sm text-slate-500 dark:text-slate-500 max-w-lg mx-auto leading-relaxed">
          By publishing, you agree to the 402Routes Developer Terms. Your API will be immediately discoverable by AI Agents across the Cronos ecosystem.
        </p>
      </main>

      <footer className="mt-12 py-8 border-t border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="bg-primary/10 text-primary p-1 rounded-md font-bold text-xs">4</div>
            <span className="font-bold text-sm tracking-tight text-slate-400">Routes</span>
          </div>
          <p className="text-xs text-slate-400 dark:text-slate-600">
            © 2024 402Routes. Built on Cronos & X402 Protocol.
          </p>
        </div>
      </footer>
    </div>
  );
}
