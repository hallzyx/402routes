'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { HiServer, HiChip, HiLightningBolt, HiExternalLink } from 'react-icons/hi';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { createApiClient } from '@/src/lib/api';
import { getWalletAddress, isWalletConnected } from '@/src/utils/wallet';

const mockHistoricalData = [
  { date: 'Jan 1', weather: 40, ai: 24, utility: 2 },
  { date: 'Jan 5', weather: 30, ai: 13, utility: 5 },
  { date: 'Jan 10', weather: 20, ai: 58, utility: 3 },
  { date: 'Jan 15', weather: 27, ai: 39, utility: 8 },
  { date: 'Jan 20', weather: 18, ai: 48, utility: 4 },
  { date: 'Jan 25', weather: 23, ai: 38, utility: 6 },
  { date: 'Feb 1', weather: 34, ai: 43, utility: 7 },
];

export default function UserDashboard() {
  const router = useRouter();
  const [subscribedApis, setSubscribedApis] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const apiClient = createApiClient();

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
      const subs = await apiClient.getSubscriptions(address);
      
      // Transform data for UI
      const transformed = subs.map(sub => {
        const api = sub.api;
        // Mocking usage data for coherence with the story
        let calls = 0;
        let cost = 0.0;
        let trend = '+0%';
        let icon = HiLightningBolt;
        let color = 'text-gray-500';
        let bg = 'bg-gray-100';

        if (api.name.includes('Weather')) {
          calls = 45; cost = 4.50; trend = '+12%'; icon = HiLightningBolt; color = 'text-amber-500'; bg = 'bg-amber-100';
        } else if (api.name.includes('AI') || api.category === 'AI') {
          calls = 7; cost = 14.00; trend = '+5%'; icon = HiChip; color = 'text-violet-500'; bg = 'bg-violet-100';
        } else if (api.name.includes('No') || api.category === 'Utility' || api.category === 'Other') {
          calls = 150; cost = 1.50; trend = '-2%'; icon = HiServer; color = 'text-blue-500'; bg = 'bg-blue-100';
        }

        return {
          ...api,
          calls,
          cost,
          trend,
          icon,
          color,
          bg
        };
      });

      setSubscribedApis(transformed);
    } catch (error) {
      console.error('Failed to load subscriptions:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-white relative overflow-hidden border-b border-gray-100">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808018_1px,transparent_1px),linear-gradient(to_bottom,#80808018_1px,transparent_1px)] bg-[size:4rem_4rem]"></div>
        <div className="container mx-auto max-w-7xl px-6 py-12 relative z-10">
          <div className="max-w-4xl">
            <h1 className="text-4xl font-bold mb-4 leading-tight text-gray-900">
              My API <span className="text-violet-600">Subscriptions</span>
            </h1>
            <p className="text-xl text-gray-600">
              Track your usage, costs, and performance across all your subscribed services.
            </p>
          </div>
        </div>
      </section>

      <div className="container mx-auto max-w-7xl px-6 py-8">
        
        {/* API Cards Grid */}
        {loading ? (
           <div className="text-center py-10">Loading...</div>
        ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          {subscribedApis.map((api, idx) => (
            <div key={idx} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-4">
                <div className={`w-12 h-12 ${api.bg} rounded-xl flex items-center justify-center ${api.color}`}>
                  <api.icon className="w-6 h-6" />
                </div>
                <span className={`text-sm font-medium px-2 py-1 rounded-full ${api.trend.startsWith('+') ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}>
                  {api.trend}
                </span>
              </div>
              
              <h3 className="text-lg font-bold text-gray-900 mb-1">{api.name}</h3>
              <p className="text-sm text-gray-500 mb-6">{api.category}</p>
              
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Total Calls</span>
                  <span className="font-mono font-medium text-gray-900">{api.calls.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Total Cost</span>
                  <span className="font-mono font-medium text-gray-900">${api.cost.toFixed(4)}</span>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-gray-50">
                 <button onClick={() => router.push(`/execute/${api.id}`)} className="text-violet-600 hover:text-violet-700 text-sm font-semibold flex items-center gap-1 transition-colors">
                    View Details <HiExternalLink />
                 </button>
              </div>
            </div>
          ))}
        </div>
        )}

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Chart */}
          <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h3 className="text-lg font-bold text-gray-900 mb-6">Usage History (Last 30 Days)</h3>
            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={mockHistoricalData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorAi" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorWeather" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                  <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fill: '#6B7280', fontSize: 12}} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#6B7280', fontSize: 12}} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <Area type="monotone" dataKey="ai" stroke="#8b5cf6" strokeWidth={3} fillOpacity={1} fill="url(#colorAi)" name="AI Calls" />
                  <Area type="monotone" dataKey="weather" stroke="#f59e0b" strokeWidth={3} fillOpacity={1} fill="url(#colorWeather)" name="Weather Calls" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Quick Stats / Cost Distribution */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
             <h3 className="text-lg font-bold text-gray-900 mb-6">Cost Distribution</h3>
             <div className="space-y-6">
                <div className="relative pt-1">
                  <div className="flex mb-2 items-center justify-between">
                    <div>
                      <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-violet-600 bg-violet-200">
                        AI Generation
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-semibold inline-block text-violet-600">
                        80.5%
                      </span>
                    </div>
                  </div>
                  <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-violet-100">
                    <div style={{ width: "80%" }} className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-violet-500"></div>
                  </div>
                </div>

                <div className="relative pt-1">
                  <div className="flex mb-2 items-center justify-between">
                    <div>
                      <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-amber-600 bg-amber-200">
                        Weather API
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-semibold inline-block text-amber-600">
                        18.2%
                      </span>
                    </div>
                  </div>
                  <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-amber-100">
                    <div style={{ width: "18%" }} className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-amber-500"></div>
                  </div>
                </div>

                 <div className="mt-8 pt-6 border-t border-gray-100">
                    <div className="flex justify-between items-end mb-1">
                        <span className="text-gray-500 text-sm">Total Spend (This Month)</span>
                        <span className="text-2xl font-bold text-gray-900">$0.795</span>
                    </div>
                    <p className="text-xs text-green-600 font-medium">Coming in under budget ($100.00)</p>
                 </div>
             </div>
          </div>

        </div>

      </div>
    </div>
  );
}
