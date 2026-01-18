'use client';

import { useState } from 'react';
import type { ApiListing } from '@/src/types';
import { useX402Flow } from '@/src/hooks/useX402Flow';

interface ApiExecutorProps {
  api: ApiListing;
  onBack: () => void;
}

export default function ApiExecutor({ api, onBack }: ApiExecutorProps) {
  const { status, data, paymentId, isLoading, error, executeApi, reset } = useX402Flow();
  const [requestData, setRequestData] = useState('{}');

  const priceInUSD = (parseInt(api.pricePerCall) / 1_000_000).toFixed(2);

  const handleExecute = async () => {
    try {
      const parsed = JSON.parse(requestData);
      await executeApi(api.id, parsed);
    } catch (err) {
      alert('Invalid JSON in request data');
    }
  };

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <button
        onClick={onBack}
        className="text-purple-400 hover:text-purple-300 flex items-center gap-2"
      >
        ← Back to Marketplace
      </button>

      {/* API Details */}
      <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-lg p-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h2 className="text-3xl font-bold text-white mb-2">{api.name}</h2>
            <p className="text-gray-400">{api.description}</p>
          </div>
          <span className="px-3 py-1 bg-purple-500/20 text-purple-300 border border-purple-500 rounded text-sm">
            {api.category}
          </span>
        </div>

        <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-gray-700">
          <div>
            <p className="text-gray-500 text-sm">Method</p>
            <p className="text-white font-mono">{api.method}</p>
          </div>
          <div>
            <p className="text-gray-500 text-sm">Endpoint</p>
            <p className="text-white font-mono text-sm">{api.endpoint}</p>
          </div>
          <div>
            <p className="text-gray-500 text-sm">Price per Call</p>
            <p className="text-green-400 font-bold">${priceInUSD} USD</p>
          </div>
        </div>
      </div>

      {/* Request Builder */}
      <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-lg p-6">
        <h3 className="text-xl font-bold text-white mb-4">Test API Call</h3>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Request Data (JSON)
            </label>
            <textarea
              rows={6}
              value={requestData}
              onChange={(e) => setRequestData(e.target.value)}
              className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white font-mono text-sm focus:border-purple-500 focus:outline-none"
              placeholder='{"param": "value"}'
            />
          </div>

          <button
            onClick={handleExecute}
            disabled={isLoading}
            className="w-full px-6 py-3 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-lg text-white font-medium transition"
          >
            {isLoading ? 'Processing...' : `Execute API Call ($${priceInUSD})`}
          </button>

          {paymentId && (
            <div className="text-xs text-gray-500 text-center">
              Payment ID: <code className="text-purple-400">{paymentId}</code>
            </div>
          )}
        </div>
      </div>

      {/* Status & Results */}
      {(status || data || error) && (
        <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-lg p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold text-white">Results</h3>
            <button
              onClick={reset}
              className="text-sm text-gray-400 hover:text-white"
            >
              Clear
            </button>
          </div>

          {status && (
            <div className={`mb-4 px-4 py-2 rounded-lg ${
              error ? 'bg-red-500/20 border border-red-500 text-red-300' :
              data ? 'bg-green-500/20 border border-green-500 text-green-300' :
              'bg-blue-500/20 border border-blue-500 text-blue-300'
            }`}>
              <p className="text-sm">{status}</p>
            </div>
          )}

          {error && (
            <div className="mb-4 px-4 py-2 rounded-lg bg-red-500/20 border border-red-500 text-red-300">
              <p className="text-sm font-bold">Error:</p>
              <p className="text-sm">{error}</p>
            </div>
          )}

          {data && (
            <div>
              <p className="text-sm text-gray-400 mb-2">Response Data:</p>
              <pre className="bg-gray-900 border border-gray-700 rounded-lg p-4 text-sm text-green-400 overflow-x-auto">
                {data}
              </pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
