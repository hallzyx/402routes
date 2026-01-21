'use client';

import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { createApiClient } from '@/src/lib/api';
import type { ApiListing } from '@/src/types';
import DiscoveryApiCard from '../components/DiscoveryApiCard';
import { MdSearch, MdFilterList, MdChevronLeft, MdChevronRight } from 'react-icons/md';

const ITEMS_PER_PAGE = 6;

export default function DiscoverPage() {
  const router = useRouter();
  const [apis, setApis] = useState<ApiListing[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Interactive State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All APIs');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedPricing, setSelectedPricing] = useState({
    payPerCall: true,
    subscription: false
  });

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

  // Derive Filtering Logic
  const filteredApis = useMemo(() => {
    return apis.filter(api => {
      // Search Filter
      const matchesSearch = 
        api.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        api.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        api.category.toLowerCase().includes(searchQuery.toLowerCase());

      // Category Filter
      const matchesCategory = selectedCategory === 'All APIs' || api.category === selectedCategory;

      // Pricing Filter (simplified assumption: all currently listed have pricePerCall)
      // If we had a subscription type field, we would check it here.
      // For now, we'll assume if "Pay-per-call" is unchecked, we show nothing (since all look like pay-per-call in db)
      // unless we implement subscription logic later. 
      // To not break UX, if Pay-per-call is checked, show all. 
      const matchesPricing = selectedPricing.payPerCall; 
      
      return matchesSearch && matchesCategory && matchesPricing;
    });
  }, [apis, searchQuery, selectedCategory, selectedPricing]);

  // Pagination Logic
  const totalPages = Math.ceil(filteredApis.length / ITEMS_PER_PAGE);
  const currentApis = filteredApis.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Dynamic Categories with Counts
  const categories = useMemo(() => {
    // Get all unique categories from the API list
    const categoryMap = new Map<string, number>();
    
    // Always include known categories from design if they exist in DB, 
    // or just iterate what we have.
    // Let's count them first.
    apis.forEach(api => {
      categoryMap.set(api.category, (categoryMap.get(api.category) || 0) + 1);
    });

    const categoryList = Array.from(categoryMap.entries()).map(([name, count]) => ({
      name,
      count
    }));

    // Add "All APIs" at the top
    return [
      { name: 'All APIs', count: apis.length },
      ...categoryList.sort((a, b) => b.count - a.count) // Sort by popularity
    ];
  }, [apis]);

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100 transition-colors duration-300 font-display">
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <h1 className="text-4xl font-bold tracking-tight mb-2">Discover APIs</h1>
              <p className="text-slate-500 dark:text-slate-400">Explore and integrate production-ready APIs monetized via X402 Protocol.</p>
            </div>
            <div className="flex items-center gap-3 w-full md:w-auto">
              <div className="relative flex-grow md:w-80">
                <MdSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xl" />
                <input 
                  className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all" 
                  placeholder="Search APIs..." 
                  type="text"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setCurrentPage(1); // Reset to page 1 on search
                  }}
                />
              </div>
              <button className="p-2.5 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 lg:hidden">
                <MdFilterList className="text-xl" />
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Sidebar */}
          <aside className="hidden lg:block lg:col-span-3 space-y-8">
            <div>
              <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-400 mb-4">Categories</h3>
              <div className="space-y-1">
                {categories.map((cat) => (
                  <button 
                    key={cat.name}
                    onClick={() => {
                      setSelectedCategory(cat.name);
                      setCurrentPage(1);
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg transition-colors ${
                      selectedCategory === cat.name
                        ? 'bg-primary/10 text-primary font-medium' 
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    <span>{cat.name}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      selectedCategory === cat.name
                        ? 'bg-primary text-white' 
                        : 'text-slate-400'
                    }`}>{cat.count}</span>
                  </button>
                ))}
              </div>
            </div>
            <div>
              <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-400 mb-4">Pricing Type</h3>
              <div className="space-y-3">
                <label className="flex items-center gap-3 cursor-pointer group">
                  <input 
                    checked={selectedPricing.payPerCall}
                    onChange={(e) => setSelectedPricing(prev => ({ ...prev, payPerCall: e.target.checked }))}
                    className="rounded border-slate-300 dark:border-slate-700 text-primary focus:ring-primary" 
                    type="checkbox"
                  />
                  <span className="text-sm text-slate-600 dark:text-slate-400 group-hover:text-primary transition-colors">Pay-per-call</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer group">
                  <input 
                    checked={selectedPricing.subscription}
                    onChange={(e) => setSelectedPricing(prev => ({ ...prev, subscription: e.target.checked }))}
                    className="rounded border-slate-300 dark:border-slate-700 text-primary focus:ring-primary" 
                    type="checkbox"
                  />
                  <span className="text-sm text-slate-600 dark:text-slate-400 group-hover:text-primary transition-colors">Subscription</span>
                </label>
              </div>
            </div>
          </aside>

          {/* Grid Content */}
          <div className="lg:col-span-9">
            {loading ? (
              <div className="flex items-center justify-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
              </div>
            ) : currentApis.length === 0 ? (
               <div className="text-center py-24 bg-white dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-800">
                <p className="text-2xl text-slate-900 dark:text-slate-100 font-semibold mb-2">No APIs found</p>
                <p className="text-slate-500 dark:text-slate-400 mb-8">
                  {apis.length === 0 ? "Be the first to publish one!" : "Try adjusting your search or filters."}
                </p>
                {apis.length === 0 && (
                  <button
                    onClick={() => router.push('/publish')}
                    className="px-6 py-3 bg-primary hover:opacity-90 text-white font-semibold rounded-lg transition-all"
                  >
                    Publish Your API
                  </button>
                )}
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {currentApis.map((api) => (
                    <DiscoveryApiCard
                      key={api.id}
                      api={api}
                      onSelect={handleSelectApi}
                    />
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="mt-12 flex items-center justify-center gap-2">
                    <button 
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="w-10 h-10 flex items-center justify-center rounded-lg border border-slate-200 dark:border-slate-700 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <MdChevronLeft className="text-xl" />
                    </button>
                    
                    {Array.from({ length: totalPages }).map((_, i) => {
                      const page = i + 1;
                      // Simple pagination logic to show limited pages if many
                      // For now, simple implementation showing all if <= 7, else complex logic or just show all
                      // Showing all for simplicity as we expect few items initially
                      return (
                        <button 
                          key={page}
                          onClick={() => handlePageChange(page)}
                          className={`w-10 h-10 flex items-center justify-center rounded-lg transition-colors ${
                            currentPage === page
                              ? 'bg-primary text-white font-semibold'
                              : 'border border-slate-200 dark:border-slate-700 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'
                          }`}
                        >
                          {page}
                        </button>
                      );
                    })}

                    <button 
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className="w-10 h-10 flex items-center justify-center rounded-lg border border-slate-200 dark:border-slate-700 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <MdChevronRight className="text-xl" />
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-20 border-t border-slate-200 dark:border-slate-800 py-12 bg-white dark:bg-slate-900 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="flex items-center gap-2">
              <div className="bg-primary text-white w-6 h-6 rounded flex items-center justify-center text-xs font-bold">4</div>
              <span className="text-sm font-bold text-slate-900 dark:text-white">402Routes</span>
              <span className="text-xs text-slate-400 ml-4">© 2024. Powered by Crounos & X402 Protocol.</span>
            </div>
            <div className="flex gap-8 text-sm text-slate-500 dark:text-slate-400">
              <a className="hover:text-primary transition-colors" href="#">Documentation</a>
              <a className="hover:text-primary transition-colors" href="#">Terms</a>
              <a className="hover:text-primary transition-colors" href="#">Privacy</a>
              <a className="hover:text-primary transition-colors" href="#">Github</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
