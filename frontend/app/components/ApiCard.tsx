import type { ApiListing } from '@/src/types';

interface ApiCardProps {
  api: ApiListing;
  onSelect: (api: ApiListing) => void;
}

export default function ApiCard({ api, onSelect }: ApiCardProps) {
  const priceInUSD = (parseInt(api.pricePerCall) / 1_000_000).toFixed(2);

  const categoryColors: Record<string, string> = {
    Weather: 'bg-blue-500/20 text-blue-300 border-blue-500',
    Finance: 'bg-green-500/20 text-green-300 border-green-500',
    AI: 'bg-purple-500/20 text-purple-300 border-purple-500',
    default: 'bg-gray-500/20 text-gray-300 border-gray-500',
  };

  const colorClass = categoryColors[api.category] || categoryColors.default;

  return (
    <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-lg p-6 hover:border-purple-500 transition cursor-pointer"
      onClick={() => onSelect(api)}
    >
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-xl font-bold text-white">{api.name}</h3>
        <span className={`px-2 py-1 rounded text-xs border ${colorClass}`}>
          {api.category}
        </span>
      </div>

      <p className="text-gray-400 text-sm mb-4 line-clamp-2">{api.description}</p>

      <div className="flex justify-between items-center text-sm">
        <div>
          <span className="text-gray-500">Price:</span>
          <span className="ml-2 text-green-400 font-bold">${priceInUSD}</span>
        </div>
        <span className={`px-2 py-1 rounded text-xs ${
          api.method === 'GET' ? 'bg-blue-500/20 text-blue-300' :
          api.method === 'POST' ? 'bg-green-500/20 text-green-300' :
          'bg-yellow-500/20 text-yellow-300'
        }`}>
          {api.method}
        </span>
      </div>

      <div className="mt-4 pt-4 border-t border-gray-700 text-xs text-gray-500">
        <code>{api.endpoint}</code>
      </div>
    </div>
  );
}
