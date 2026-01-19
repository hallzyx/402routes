import type { ApiListing } from '@/src/types';

interface ApiCardProps {
  api: ApiListing;
  onSelect: (api: ApiListing) => void;
}

export default function ApiCard({ api, onSelect }: ApiCardProps) {
  const priceInUSD = (parseInt(api.pricePerCall) / 1_000_000).toFixed(3);
  const proxyUrl = `http://localhost:8787/api/proxy/${api.id}`;

  const categoryColors: Record<string, string> = {
    Weather: 'bg-blue-100 text-blue-700 border-blue-300',
    Finance: 'bg-emerald-100 text-emerald-700 border-emerald-300',
    AI: 'bg-purple-100 text-purple-700 border-purple-300',
    Gaming: 'bg-pink-100 text-pink-700 border-pink-300',
    Data: 'bg-orange-100 text-orange-700 border-orange-300',
    default: 'bg-gray-100 text-gray-700 border-gray-300',
  };

  const methodColors: Record<string, string> = {
    GET: 'bg-blue-100 text-blue-800 font-semibold',
    POST: 'bg-emerald-100 text-emerald-800 font-semibold',
    PUT: 'bg-amber-100 text-amber-800 font-semibold',
    DELETE: 'bg-red-100 text-red-800 font-semibold',
  };

  const colorClass = categoryColors[api.category] || categoryColors.default;
  const methodClass = methodColors[api.method] || methodColors.GET;

  return (
    <div 
      className="group bg-gray-50 border border-gray-200 rounded-lg p-8 hover:shadow-md transition-all duration-300 cursor-pointer"
      onClick={() => onSelect(api)}
    >
      <div className="mb-6">
        <div className="w-16 h-16 bg-white border border-gray-200 rounded-lg flex items-center justify-center mb-4">
          <span className="text-3xl font-bold text-gray-900">{api.name.charAt(0)}</span>
        </div>
      </div>

      <div className="mb-4">
        <h3 className="text-2xl font-semibold text-gray-900 mb-2">
          {api.name}
        </h3>
        <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium uppercase ${colorClass}`}>
          {api.category}
        </span>
      </div>

      <p className="text-gray-600 text-base mb-6 line-clamp-3 leading-relaxed">
        {api.description}
      </p>

      <div className="mb-4">
        <code className="text-xs text-gray-600 font-mono break-all bg-gray-100 px-3 py-2 rounded block">
          {proxyUrl}
        </code>
      </div>

      <div className="flex justify-between items-center pt-4 border-t border-gray-200">
        <div className="flex items-baseline gap-1.5">
          <span className="text-gray-900 font-bold text-xl font-mono">${priceInUSD}</span>
          <span className="text-gray-500 text-sm">USDC</span>
        </div>
        <span className={`px-3 py-1.5 rounded-md text-xs ${methodClass}`}>
          {api.method}
        </span>
      </div>

      {api.isActive && (
        <div className="mt-4 flex items-center gap-2">
          <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
          <span className="text-xs text-emerald-600 font-semibold">Active</span>
        </div>
      )}
    </div>
  );
}
