'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { HiShieldCheck, HiCog, HiCurrencyDollar, HiBell, HiSave, HiCreditCard, HiRefresh } from 'react-icons/hi';
import { FiArrowLeft } from 'react-icons/fi';
import { JsonRpcProvider, BrowserProvider, Contract, formatEther, formatUnits } from 'ethers';
import { Contract as CronosContract } from '@crypto.com/facilitator-client';
import { getWalletAddress, isWalletConnected } from '@/src/utils/wallet';

const AGENT_WALLET = "0x1f24eF014de80617470B2c4470FFB14CA4c20825";
const RPC_URL = "https://evm-t3.cronos.org";
const USDC_ADDRESS = CronosContract.DevUSDCe;

const ERC20_ABI = [
  "function balanceOf(address owner) view returns (uint256)",
  "function decimals() view returns (uint8)"
];

export default function GuardianSetupPage() {
  const router = useRouter();
  const [budget, setBudget] = useState(100);
  const [alertThreshold, setAlertThreshold] = useState(80);
  const [autoOptimize, setAutoOptimize] = useState(false);
  const [saving, setSaving] = useState(false);

  // Balance States
  const [userBalances, setUserBalances] = useState({ tcro: '0.0', usdc: '0.0' });
  const [agentBalances, setAgentBalances] = useState({ tcro: '0.0', usdc: '0.0' });
  const [loadingBalances, setLoadingBalances] = useState(true);

  useEffect(() => {
    fetchBalances();
  }, []);

  const fetchBalances = async () => {
    setLoadingBalances(true);
    try {
      const provider = new JsonRpcProvider(RPC_URL);
      const usdcContract = new Contract(USDC_ADDRESS, ERC20_ABI, provider);

      // Fetch Agent Balances
      const [agentTcroRaw, agentUsdcRaw] = await Promise.all([
        provider.getBalance(AGENT_WALLET),
        usdcContract.balanceOf(AGENT_WALLET)
      ]);

      setAgentBalances({
        tcro: parseFloat(formatEther(agentTcroRaw)).toFixed(4),
        usdc: parseFloat(formatUnits(agentUsdcRaw, 6)).toFixed(2) // USDC usually 6 decimals
      });

      // Fetch User Balances if connected
      const connected = await isWalletConnected();
      if (connected) {
        const address = await getWalletAddress();
        // Use BrowserProvider for user to ensure we see what they see (or use RPC for consistency)
        // Using RPC for consistency and speed without wallet prompt
        const [userTcroRaw, userUsdcRaw] = await Promise.all([
          provider.getBalance(address),
          usdcContract.balanceOf(address)
        ]);
        
        setUserBalances({
          tcro: parseFloat(formatEther(userTcroRaw)).toFixed(4),
          usdc: parseFloat(formatUnits(userUsdcRaw, 6)).toFixed(2)
        });
      }
    } catch (error) {
      console.error("Error fetching balances:", error);
    } finally {
      setLoadingBalances(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // In a real app, we would save these settings to the backend
    console.log('Saved settings:', { budget, alertThreshold, autoOptimize });
    
    setSaving(false);
    router.push('/guardian');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <section className="bg-white border-b border-gray-200">
        <div className="container mx-auto max-w-3xl px-6 py-6">
          <button
            onClick={() => router.push('/guardian')}
            className="text-gray-500 hover:text-violet-600 flex items-center gap-2 font-medium text-sm mb-4 transition-colors"
          >
            <FiArrowLeft /> Back to Dashboard
          </button>
          <div className="flex items-center gap-3">
             <div className="w-12 h-12 bg-violet-100 rounded-xl flex items-center justify-center text-violet-600">
                <HiCog className="w-7 h-7" />
             </div>
             <div>
                <h1 className="text-2xl font-bold text-gray-900">Guardian Configuration</h1>
                <p className="text-gray-600">Set your budget limits and autonomous protections</p>
             </div>
          </div>
        </div>
      </section>

      <main className="container mx-auto max-w-3xl px-6 py-8">
        <form onSubmit={handleSave} className="space-y-6">

          {/* Agent Wallet Funding */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
             <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <HiCreditCard className="w-6 h-6 text-blue-600" />
                  <h2 className="text-lg font-semibold text-gray-900">Fund AI Agent</h2>
                </div>
                <button 
                  type="button" 
                  onClick={fetchBalances}
                  disabled={loadingBalances} 
                  className="text-violet-600 hover:text-violet-800 transition-colors"
                >
                  <HiRefresh className={`w-5 h-5 ${loadingBalances ? 'animate-spin' : ''}`} />
                </button>
             </div>

             {/* Live Balances Grid */}
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                {/* User Balance Card */}
                <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-4 border border-gray-200">
                  <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Your Wallet (Connected)</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-700">TCRO (Testnet)</span>
                      <span className="font-mono font-bold text-gray-900">{userBalances.tcro}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-700">USDC.e</span>
                      <span className="font-mono font-bold text-blue-600">{userBalances.usdc}</span>
                    </div>
                  </div>
                </div>

                {/* Agent Balance Card */}
                <div className="bg-gradient-to-br from-violet-50 to-purple-50 rounded-xl p-4 border border-violet-100">
                  <h3 className="text-xs font-bold text-violet-500 uppercase tracking-wider mb-3">Agent Wallet</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-700">TCRO (Testnet)</span>
                      <span className="font-mono font-bold text-gray-900">{agentBalances.tcro}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-700">USDC.e</span>
                      <span className="font-mono font-bold text-violet-600">{agentBalances.usdc}</span>
                    </div>
                  </div>
                </div>
             </div>

             <div className="p-4 bg-gray-50 rounded-lg mb-6 border border-gray-200 break-all">
                <p className="text-xs text-gray-500 uppercase font-bold mb-1">Guardian Wallet Address</p>
                <div className="flex justify-between items-center">
                   <p className="font-mono text-sm text-gray-700">{AGENT_WALLET}</p>
                   <button type="button" className="text-violet-600 text-xs font-bold hover:underline" onClick={() => navigator.clipboard.writeText(AGENT_WALLET)}>COPY</button>
                </div>
             </div>
             
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* USDC.e Funding */}
                <div className="flex flex-col gap-2">
                   <label className="text-sm font-medium text-gray-700">Send USDC.e</label>
                   <div className="flex gap-2">
                      <input 
                        type="number" 
                        placeholder="Amount" 
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-violet-500 focus:border-violet-500" 
                      />
                      <button type="button" className="px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors">
                         Send
                      </button>
                   </div>
                </div>

                {/* TCRO Funding */}
                <div className="flex flex-col gap-2">
                   <label className="text-sm font-medium text-gray-700">Send TCRO</label>
                   <div className="flex gap-2">
                      <input 
                        type="number" 
                        placeholder="Amount" 
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-violet-500 focus:border-violet-500" 
                      />
                      <button type="button" className="px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors">
                         Send
                      </button>
                   </div>
                </div>
             </div>
          </div>
          
          {/* Budget Settings */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
             <div className="flex items-center gap-3 mb-6">
                <HiCurrencyDollar className="w-6 h-6 text-violet-600" />
                <h2 className="text-lg font-semibold text-gray-900">Budget Limits</h2>
             </div>
             
             <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Monthly Spending Limit (USDC)
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <span className="text-gray-500 sm:text-sm">$</span>
                    </div>
                    <input
                      type="number"
                      value={budget}
                      onChange={(e) => setBudget(Number(e.target.value))}
                      className="block w-full pl-7 pr-12 py-3 border-gray-300 rounded-lg focus:ring-violet-500 focus:border-violet-500 border"
                      placeholder="0.00"
                    />
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                      <span className="text-gray-500 sm:text-sm">USDC</span>
                    </div>
                  </div>
                  <p className="mt-2 text-sm text-gray-500">
                    The Guardian will stop transactions if this limit is reached.
                  </p>
                </div>
             </div>
          </div>

          {/* Alert Settings */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
             <div className="flex items-center gap-3 mb-6">
                <HiBell className="w-6 h-6 text-amber-500" />
                <h2 className="text-lg font-semibold text-gray-900">Alerts & Notifications</h2>
             </div>
             
             <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Alert Threshold (%)
                  </label>
                  <input
                    type="range"
                    min="10"
                    max="100"
                    step="5"
                    value={alertThreshold}
                    onChange={(e) => setAlertThreshold(Number(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-violet-600"
                  />
                  <div className="flex justify-between text-sm text-gray-600 mt-2">
                    <span>10%</span>
                    <span className="font-bold text-violet-600">Notify at {alertThreshold}% usage</span>
                    <span>100%</span>
                  </div>
                </div>
             </div>
          </div>

          {/* Autonomous Settings */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
             <div className="flex items-center gap-3 mb-6">
                <HiShieldCheck className="w-6 h-6 text-green-600" />
                <h2 className="text-lg font-semibold text-gray-900">Autonomous Protection</h2>
             </div>
             
             <div className="flex items-start gap-4">
                <div className="flex items-center h-5">
                  <input
                    id="auto-optimize"
                    type="checkbox"
                    checked={autoOptimize}
                    onChange={(e) => setAutoOptimize(e.target.checked)}
                    className="focus:ring-violet-500 h-5 w-5 text-violet-600 border-gray-300 rounded"
                  />
                </div>
                <div>
                  <label htmlFor="auto-optimize" className="font-medium text-gray-900">
                    Enable Autonomous Optimization
                  </label>
                  <p className="text-gray-500 text-sm mt-1">
                    Allow the Guardian to automatically switch to cheaper API providers if performance is similar but cost is lower.
                  </p>
                </div>
             </div>
          </div>

          <div className="flex justify-end pt-4">
            <button
              type="submit"
              disabled={saving}
              className={`
                flex items-center gap-2 px-8 py-3 bg-violet-600 text-white font-bold rounded-lg shadow-md
                hover:bg-violet-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-violet-500 transition-all
                ${saving ? 'opacity-75 cursor-not-allowed' : ''}
              `}
            >
              <HiSave className="w-5 h-5" />
              {saving ? 'Saving...' : 'Save Configuration'}
            </button>
          </div>

        </form>
      </main>
    </div>
  );
}
