'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { HiShieldCheck, HiCurrencyDollar, HiChartBar, HiLightningBolt, HiCog } from 'react-icons/hi';
import { FiAlertTriangle, FiCheck } from 'react-icons/fi';

export default function GuardianDashboard() {
  const router = useRouter();
  // Budget adjusted to 30.00 to match coherent story:
  // Budget (30) - Spent (20) = 10.00 Remaining (Matches Agent Wallet Balance)
  const [budget] = useState(30.00);
  const [spent] = useState(20.00);
  const [isOptimized, setIsOptimized] = useState(false);

  const percentage = (spent / budget) * 100;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section Style Header */}
      <section className="bg-white relative overflow-hidden border-b border-gray-100">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808018_1px,transparent_1px),linear-gradient(to_bottom,#80808018_1px,transparent_1px)] bg-[size:4rem_4rem]"></div>
        <div className="container mx-auto max-w-7xl px-6 py-16 relative z-10">
          <div className="max-w-4xl">
            <div className="flex items-center gap-3 mb-4">
               <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1">
                <HiShieldCheck className="w-4 h-4" />
                Active Guardian
               </span>
               <span className="text-gray-500 text-sm">Last check: 2 mins ago</span>
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold mb-4 leading-tight text-gray-900">
              AI Budget <span className="text-violet-600">Guardian</span> Dashboard
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mb-8">
              Monitor your API spending in real-time, get intelligent optimizations, and prevent bill shocks.
            </p>
            
            <button
               onClick={() => router.push('/guardian/setup')}
               className="inline-flex items-center gap-2 px-6 py-3 bg-violet-600 text-white font-semibold rounded-lg hover:bg-violet-700 transition-colors shadow-md hover:shadow-lg"
            >
               <HiCog className="w-5 h-5" />
               Configure Guardian
            </button>
          </div>
        </div>
      </section>

      <div className="container mx-auto max-w-7xl px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Status Column */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Budget Overview Card */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Budget Overview</h3>
                  <p className="text-gray-500 text-sm">Monthly API Spending Limit</p>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-gray-900">${spent.toFixed(2)}</div>
                  <div className="text-sm text-gray-500">of ${budget.toFixed(2)} limit</div>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-gray-100 rounded-full h-4 mb-4 overflow-hidden">
                <div 
                  className={`h-full rounded-full transition-all duration-500 ${percentage > 90 ? 'bg-red-500' : percentage > 75 ? 'bg-amber-500' : 'bg-violet-600'}`}
                  style={{ width: `${percentage}%` }}
                ></div>
              </div>
              <div className="flex justify-between text-sm text-gray-600 mb-6">
                <span>0%</span>
                <span className={`font-medium ${percentage > 75 ? 'text-amber-600' : ''}`}>{percentage}% Used</span>
                <span>100%</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                 <div className="p-4 bg-violet-50 rounded-xl border border-violet-100">
                    <div className="text-violet-600 mb-1"><HiCurrencyDollar className="w-6 h-6" /></div>
                    <div className="text-sm text-violet-700 font-medium">Remaining Budget</div>
                    <div className="text-2xl font-bold text-violet-900">${(budget - spent).toFixed(2)}</div>
                 </div>
                 <div className="p-4 bg-blue-50 rounded-xl border border-blue-100">
                    <div className="text-blue-600 mb-1"><HiChartBar className="w-6 h-6" /></div>
                    <div className="text-sm text-blue-700 font-medium">Forecasted Spend</div>
                    <div className="text-2xl font-bold text-blue-900">$28.50</div>
                 </div>
                 <div className="p-4 bg-green-50 rounded-xl border border-green-100">
                    <div className="text-green-600 mb-1"><HiLightningBolt className="w-6 h-6" /></div>
                    <div className="text-sm text-green-700 font-medium">Efficiency Score</div>
                    <div className="text-2xl font-bold text-green-900">A-</div>
                 </div>
              </div>
            </div>

            {/* Smart Insights / Recommendations (The "Magic Moment") */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
               <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gradient-to-r from-violet-50 to-white">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <HiShieldCheck className="text-violet-600" />
                    Guardian Insights
                  </h3>
                  <span className="bg-violet-100 text-violet-700 text-xs px-2 py-1 rounded-full font-medium">1 New Optimization</span>
               </div>
               
               <div className="p-6">
                  {!isOptimized ? (
                    <div className="flex flex-col md:flex-row gap-6 items-start">
                        <div className="bg-amber-50 p-3 rounded-full flex-shrink-0">
                           <FiAlertTriangle className="w-6 h-6 text-amber-600" />
                        </div>
                        <div className="flex-grow">
                           <h4 className="text-gray-900 font-semibold mb-1">High Cost Detected: OpenAI GPT-4</h4>
                           <p className="text-gray-600 text-sm mb-4">
                             Your Guardian noticed that <span className="font-semibold">80%</span> of your requests to GPT-4 are simple queries that could be handled by cheaper models.
                             Currently spending <span className="font-semibold">$45.00</span> (57% of total).
                           </p>
                           <div className="bg-gray-50 rounded-lg p-4 mb-4 border border-gray-100">
                              <div className="flex justify-between items-center mb-2">
                                <span className="text-gray-600 text-sm">Suggested Action:</span>
                                <span className="text-green-600 font-bold text-sm">Save ~$25.00/mo</span>
                              </div>
                              <p className="text-gray-800 font-medium">Switch to GPT-3.5-turbo for simple queries automatically.</p>
                           </div>
                           <button 
                             onClick={() => setIsOptimized(true)}
                             className="bg-violet-600 hover:bg-violet-700 text-white px-6 py-2 rounded-lg font-medium transition-colors shadow-sm w-full md:w-auto"
                           >
                             Apply Optimization
                           </button>
                        </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-4 bg-green-50 p-6 rounded-xl border border-green-100">
                        <div className="bg-green-100 p-2 rounded-full">
                            <FiCheck className="w-6 h-6 text-green-600" />
                        </div>
                        <div>
                            <h4 className="text-green-900 font-semibold">Optimization Applied Successfully</h4>
                            <p className="text-green-700 text-sm">Your traffic is now being routed intelligently. Projected savings updated.</p>
                        </div>
                    </div>
                  )}
               </div>
            </div>

          </div>

          {/* Sidebar / Activity */}
          <div className="space-y-8">
             {/* Activity Log */}
             <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <h3 className="text-lg font-semibold text-gray-900 mb-6">Recent Activity</h3>
                <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-300 before:to-transparent">
                  {[
                    { day: 'Today', amount: 78, desc: 'Daily cap warning (78%)', type: 'warning' },
                    { day: 'Day 15', amount: 70, desc: 'Auto-payment processed', type: 'pay' },
                    { day: 'Day 10', amount: 64, desc: 'Usage spike detected', type: 'info' },
                    { day: 'Day 5', amount: 32, desc: 'Weekly summary', type: 'info' },
                  ].map((item, i) => (
                    <div key={i} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                        <div className="flex items-center justify-center w-10 h-10 rounded-full border border-white bg-slate-50 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
                            {item.type === 'warning' ? (
                                <span className="w-2.5 h-2.5 bg-amber-500 rounded-full"></span>
                            ) : item.type === 'pay' ? (
                                <span className="w-2.5 h-2.5 bg-green-500 rounded-full"></span>
                            ) : (
                                <span className="w-2.5 h-2.5 bg-violet-400 rounded-full"></span>
                            )}
                        </div>
                        <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-xl border border-slate-100 shadow-sm bg-white">
                            <div className="flex items-center justify-between space-x-2 mb-1">
                                <div className="font-bold text-slate-900 text-sm">{item.day}</div>
                                <div className="text-xs font-mono text-slate-500">${item.amount}</div>
                            </div>
                            <div className="text-slate-500 text-sm">{item.desc}</div>
                        </div>
                    </div>
                  ))}
                </div>
             </div>

             {/* Quick Actions */}
             <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
                <div className="space-y-3">
                    <button className="w-full py-2.5 px-4 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 font-medium text-sm transition-colors text-left flex items-center justify-between group">
                        <span>Deposit Funds</span>
                        <span className="text-violet-600 group-hover:translate-x-1 transition-transform">→</span>
                    </button>
                    <button className="w-full py-2.5 px-4 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 font-medium text-sm transition-colors text-left flex items-center justify-between group">
                        <span>Update Limits</span>
                        <span className="text-violet-600 group-hover:translate-x-1 transition-transform">→</span>
                    </button>
                    <button className="w-full py-2.5 px-4 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 font-medium text-sm transition-colors text-left flex items-center justify-between group">
                        <span>View Guardian Logs</span>
                        <span className="text-violet-600 group-hover:translate-x-1 transition-transform">→</span>
                    </button>
                </div>
             </div>
          </div>

        </div>
      </div>
    </div>
  );
}
