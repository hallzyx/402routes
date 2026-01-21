'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { HiSparkles, HiBolt, HiShieldCheck, HiCommandLine } from 'react-icons/hi2';
import { FiArrowRight } from 'react-icons/fi';
import { getWalletAddress, isWalletConnected } from '@/src/utils/wallet';
import WalletDropdown from './components/WalletDropdown';
import StatsSection from './components/StatsSection';
import FAQSection from './components/FAQSection';
import { motion } from 'framer-motion';

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

  // Animation variants
  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans selection:bg-violet-100 selection:text-violet-900">
      
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-32 pb-24 lg:pt-48 lg:pb-32">
        {/* Abstract Background Elements */}
        <div className="absolute inset-0 w-full h-full overflow-hidden z-0 pointer-events-none">
          <motion.div 
            animate={{ scale: [1, 1.1, 1], rotate: [0, 5, 0] }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            className="absolute -top-40 -right-40 w-96 h-96 bg-violet-200 rounded-full blur-3xl opacity-50 mix-blend-multiply" 
          />
          <motion.div 
            animate={{ scale: [1, 1.2, 1], rotate: [0, -5, 0] }}
            transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
            className="absolute top-40 -left-20 w-72 h-72 bg-purple-200 rounded-full blur-3xl opacity-50 mix-blend-multiply" 
          />
          <motion.div 
            animate={{ scale: [1, 1.1, 1], x: [0, 20, 0] }}
            transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
            className="absolute -bottom-40 left-1/2 w-80 h-80 bg-fuchsia-200 rounded-full blur-3xl opacity-50 mix-blend-multiply" 
          />
          {/* Restored Large Grid Background - Using style for better visibility control */}
          <div 
            className="absolute inset-0 opacity-[0.07]"
            style={{
              backgroundImage: `linear-gradient(#4c1d95 1px, transparent 1px), linear-gradient(90deg, #4c1d95 1px, transparent 1px)`,
              backgroundSize: '24px 24px',
              maskImage: 'linear-gradient(to bottom, rgba(0,0,0,1) 0%, rgba(0,0,0,1) 80%, rgba(0,0,0,0) 100%)',
              WebkitMaskImage: 'linear-gradient(to bottom, rgba(0,0,0,1) 0%, rgba(0,0,0,1) 80%, rgba(0,0,0,0) 100%)'
            }}
          ></div>
        </div>

        <motion.div
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
          className="container mx-auto max-w-7xl px-6 relative z-10 text-center"
        >
       
          <motion.div variants={fadeIn} className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-50 border border-violet-100 text-violet-600 text-sm font-semibold mb-8 shadow-sm">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-violet-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-violet-500"></span>
            </span>
            Live on Cronos Testnet
          </motion.div>

          <motion.h1 variants={fadeIn} className="text-5xl sm:text-7xl font-extrabold tracking-tight text-slate-900 mb-8 max-w-5xl mx-auto leading-[1.1]">
            Monetize APIs with <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-600 to-fuchsia-600">
              Autonomous Payments
            </span>
          </motion.h1>
          
          <motion.p variants={fadeIn} className="text-xl sm:text-2xl text-slate-600 mb-12 leading-relaxed max-w-3xl mx-auto font-light">
            The first marketplace where AI Agents discover, negotiate, and pay for APIs instantly using the <b>X402 Protocol</b>. Zero friction, zero invoices.
          </motion.p>

          <motion.div variants={fadeIn} className="flex flex-col sm:flex-row justify-center gap-4">
            <button
              onClick={() => router.push('/publish')}
              className="px-8 py-4 bg-violet-600 hover:bg-violet-700 text-white font-bold text-lg rounded-2xl transition-all shadow-lg hover:shadow-violet-200 hover:-translate-y-1 flex items-center justify-center gap-2 group"
            >
              <HiSparkles className="w-5 h-5" />
              Start Monetizing
              <FiArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
            <button
              onClick={() => router.push('/discover')}
              className="px-8 py-4 bg-white hover:bg-slate-50 text-slate-900 font-bold text-lg rounded-2xl border-2 border-slate-200 transition-all hover:border-slate-300 hover:shadow-md flex items-center justify-center gap-2"
            >
              <HiCommandLine className="w-5 h-5 text-slate-500" />
              Discover APIs
            </button>
          </motion.div>

          {/* Hero Dashboard Preview (Mock) */}
          <motion.div 
            initial={{ opacity: 0, y: 100, rotateX: 20 }}
            animate={{ opacity: 1, y: 0, rotateX: 12 }}
            transition={{ duration: 1, delay: 0.5, type: "spring" }}
            className="mt-20 -mb-40 mx-auto max-w-5xl relative z-20 perspective-1000"
          >
             <div className="bg-slate-900 rounded-2xl shadow-2xl border border-slate-800 p-2 overflow-hidden transform group hover:scale-[1.01] transition-transform duration-500">
                <div className="bg-slate-800 rounded-xl overflow-hidden relative">
                   {/* ... (keep mockup content same) ... */}
                   <div className="h-8 bg-slate-800 flex items-center px-4 gap-2 border-b border-slate-700/50">
                     <div className="w-3 h-3 rounded-full bg-red-400"></div>
                     <div className="w-3 h-3 rounded-full bg-amber-400"></div>
                     <div className="w-3 h-3 rounded-full bg-emerald-400"></div>
                   </div>
                   <div className="p-8 grid grid-cols-1 md:grid-cols-3 gap-6 opacity-90">
                      <div className="bg-slate-700/30 p-4 rounded-lg border border-slate-600/30">
                         <div className="h-2 w-20 bg-slate-600 rounded mb-2"></div>
                         <div className="h-8 w-12 bg-violet-500/20 rounded mb-2 border border-violet-500/30"></div>
                         <div className="h-2 w-full bg-slate-600/50 rounded"></div>
                      </div>
                      <div className="bg-slate-700/30 p-4 rounded-lg border border-slate-600/30">
                         <div className="h-2 w-20 bg-slate-600 rounded mb-2"></div>
                         <div className="h-8 w-24 bg-emerald-500/20 rounded mb-2 border border-emerald-500/30"></div>
                         <div className="h-2 w-full bg-slate-600/50 rounded"></div>
                      </div>
                      <div className="bg-slate-700/30 p-4 rounded-lg border border-slate-600/30">
                         <div className="h-2 w-20 bg-slate-600 rounded mb-2"></div>
                         <div className="h-8 w-16 bg-blue-500/20 rounded mb-2 border border-blue-500/30"></div>
                         <div className="h-2 w-full bg-slate-600/50 rounded"></div>
                      </div>
                   </div>
                   <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent opacity-60"></div>
                   <div className="absolute bottom-8 left-0 right-0 text-center">
                     <span className="text-slate-400 font-mono text-sm">Dashboard Preview</span>
                   </div>
                </div>
             </div>
          </motion.div>
        </motion.div>
      </section>

      {/* Features Section - Styling Adapted */}
      <section className="py-32 bg-slate-50 border-y border-slate-200 relative z-10">
        <div className="container mx-auto max-w-7xl px-6">
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="text-center mb-16"
          >
            <motion.h3 variants={fadeIn} className="text-sm font-bold text-violet-600 tracking-wider uppercase mb-2">Why 402Routes?</motion.h3>
            <motion.h2 variants={fadeIn} className="text-4xl font-bold text-slate-900">The Infrastructure for the Agent Economy</motion.h2>
          </motion.div>

          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
          >
            {[
              { 
                icon: HiBolt, 
                color: "violet", 
                title: "Micropayments on Steroids", 
                desc: "Monetize by the millisecond. Get paid instantly per call via Cronos blockchain. No minimum withdrawals." 
              },
              { 
                icon: HiShieldCheck, 
                color: "emerald", 
                title: "Guardian Protection", 
                desc: "Our AI Guardian monitors every transaction, preventing budget overruns and unauthorized usage automatically." 
              },
              { 
                icon: HiSparkles, 
                color: "blue", 
                title: "Agent-First Design", 
                desc: "APIs are exposed with machine-readable metadata, making them instantly discoverable and usable by autonomous agents." 
              }
            ].map((feature, idx) => (
              <motion.div 
                key={idx}
                variants={fadeIn}
                whileHover={{ y: -10 }}
                className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm transition-all duration-300 group"
              >
                <div className={`w-14 h-14 bg-${feature.color}-50 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                  <feature.icon className={`w-7 h-7 text-${feature.color}-600`} />
                </div>
                <h4 className="text-xl font-bold text-slate-900 mb-3">{feature.title}</h4>
                <p className="text-slate-600 leading-relaxed text-lg">
                  {feature.desc}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>


      {/* How It Works - Simplified Steps */}
      <section className="py-24 bg-white relative overflow-hidden">
         <div className="container mx-auto max-w-7xl px-6">
            <div className="flex flex-col lg:flex-row items-center gap-16">
               <div className="lg:w-1/2">
                  <h3 className="text-4xl font-bold text-slate-900 mb-6">Effortless Integration for Developers</h3>
                  <p className="text-xl text-slate-600 mb-8">
                     Turn any REST Endpoint into a revenue stream in minutes.
                  </p>
                  
                  <div className="space-y-6">
                     {[
                        { title: "Connect Wallet", desc: "Sign in with MetaMask on Cronos network." },
                        { title: "Define Usage Price", desc: "Set your price in USDC per API call." },
                        { title: "Add Context Proxy", desc: "We provide a wrapper URL that handles payments." }
                     ].map((step, i) => (
                        <div key={i} className="flex gap-4 items-start">
                           <div className="flex-shrink-0 w-8 h-8 rounded-full bg-violet-100 text-violet-600 flex items-center justify-center font-bold">
                              {i + 1}
                           </div>
                           <div>
                              <h5 className="font-bold text-slate-900 text-lg">{step.title}</h5>
                              <p className="text-slate-600">{step.desc}</p>
                           </div>
                        </div>
                     ))}
                  </div>
               </div>
               <div className="lg:w-1/2 bg-slate-900 rounded-3xl p-8 shadow-2xl relative">
                  <div className="absolute -top-10 -right-10 w-40 h-40 bg-violet-500 rounded-full blur-[80px] opacity-40"></div>
                   <pre className="text-slate-300 font-mono text-sm overflow-x-auto">
{`// Your API client code
const client = new ApiClient();

// The "Guardian" handles the payment
// automatically before the request
// reaches your server.

await client.execute({
  api: "weather-service",
  params: { city: "Lima" },
  maxPrice: 0.05 // USDC
});

// -> Payment Settled on Chain
// -> API Response Received
`}
                   </pre>
               </div>
            </div>
         </div>
      </section>

      {/* Stats Section with Consistent Styling */}
      <div className="bg-slate-50 border-t border-slate-200 py-12">
        <StatsSection />
      </div>

      {/* FAQ Section */}
      <FAQSection />

      {/* Footer */}
      <footer className="bg-white border-t border-slate-100 py-12">
        <div className="container mx-auto max-w-7xl px-6 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
             <div className="bg-violet-600 text-white p-1.5 rounded-lg font-bold">402</div>
             <span className="font-bold text-slate-900 text-xl">Routes</span>
          </div>
          <p className="text-slate-500 text-sm font-medium">
             © 2024 402Routes. Built on Cronos.
          </p>
        </div>
      </footer>
    </div>
  );
}
