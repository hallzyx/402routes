import type { ApiListing } from '@/src/types';

interface DiscoveryApiCardProps {
  api: ApiListing;
  onSelect: (api: ApiListing) => void;
}

export default function DiscoveryApiCard({ api, onSelect }: DiscoveryApiCardProps) {
  const priceInUSD = (parseInt(api.pricePerCall) / 1_000_000).toFixed(3);
  const proxyUrl = `https://402routes.api/proxy/${api.id.substring(0, 8)}...`; // Using the truncated view from user design

  // Map category to styles - extending existing logic to match new design palette
  const getCategoryStyles = (category: string) => {
    switch (category) {
      case 'AI':
      case 'Artificial Intelligence':
        return 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400';
      case 'Weather':
        return 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400';
      case 'Finance':
      case 'Financial Data':
        return 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400';
      case 'Funny':
        return 'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400';
      case 'Ecommerce':
        return 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400';
      default:
        return 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300';
    }
  };

  const getButtonStyles = (method: string) => {
    if (method === 'POST') {
      return 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 hover:bg-green-600 hover:text-white';
    }
    return 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 hover:bg-blue-600 hover:text-white';
  };

  return (
    <div 
      className="bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden hover:shadow-xl transition-all group flex flex-col cursor-pointer"
      onClick={() => onSelect(api)}
    >
      <div className="p-6 flex-grow">
        <div className="flex justify-between items-start mb-4">
          <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded-xl flex items-center justify-center font-bold text-2xl text-slate-700 dark:text-slate-300">
            {api.name.charAt(0).toUpperCase()}
          </div>
          <span className={`${getCategoryStyles(api.category)} text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full`}>
            {api.category}
          </span>
        </div>
        <h3 className="text-lg font-bold mb-2 group-hover:text-primary transition-colors">
          {api.name}
        </h3>
        <p className="text-slate-500 dark:text-slate-400 text-sm mb-4 line-clamp-2 leading-relaxed">
          {api.description}
        </p>
        <div className="bg-slate-50 dark:bg-slate-900/50 p-2.5 rounded-lg border border-slate-100 dark:border-slate-800 font-mono text-[11px] text-slate-400 truncate mb-4">
          {proxyUrl}
        </div>
      </div>
      <div className="px-6 py-4 bg-slate-50/50 dark:bg-slate-800/80 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
        <div>
          <span className="text-lg font-bold">${priceInUSD}</span>
          <span className="text-xs text-slate-400 ml-1">USDC</span>
        </div>
        <button className={`${getButtonStyles(api.method)} px-4 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all`}>
          {api.method}
        </button>
      </div>
    </div>
  );
}
