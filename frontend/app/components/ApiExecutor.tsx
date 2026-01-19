'use client';

import { useState } from 'react';
import { FiArrowLeft, FiX, FiCheckCircle, FiAlertCircle, FiCode } from 'react-icons/fi';
import { HiSparkles } from 'react-icons/hi2';
import type { ApiListing } from '@/src/types';
import { useX402Flow } from '@/src/hooks/useX402Flow';

interface ApiExecutorProps {
  api: ApiListing;
  onBack: () => void;
}

export default function ApiExecutor({ api, onBack }: ApiExecutorProps) {
  const { status, data, paymentId, isLoading, error, executeApi, reset } = useX402Flow();
  const [requestData, setRequestData] = useState('{}');
  const [httpMethod, setHttpMethod] = useState(api.method || 'GET');

  const priceInUSD = (parseInt(api.pricePerCall) / 1_000_000).toFixed(3);

  const handleExecute = async () => {
    try {
      const parsed = JSON.parse(requestData);
      await executeApi(api.id, parsed, httpMethod);
    } catch (err) {
      alert('Invalid JSON in request data');
    }
  };

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <button
        onClick={onBack}
        className="text-purple-600 hover:text-purple-700 flex items-center gap-2 font-semibold text-sm transition-colors"
      >
        <FiArrowLeft /> Back to Marketplace
      </button>

      {/* API Details */}
      <div className="bg-white border-2 border-gray-200 rounded-xl p-6 sm:p-8 shadow-md">
        <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-6">
          <div>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">{api.name}</h2>
            <p className="text-gray-600 text-base sm:text-lg">{api.description}</p>
          </div>
          <span className="px-4 py-2 bg-purple-100 text-purple-700 border-2 border-purple-300 rounded-full text-xs sm:text-sm font-bold shrink-0">
            {api.category}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-6 pt-6 border-t border-gray-200">
          <div>
            <p className="text-gray-500 text-sm font-semibold mb-1">Method</p>
            <p className="text-gray-900 font-mono font-bold">{api.method}</p>
          </div>
          <div>
            <p className="text-gray-500 text-sm font-semibold mb-1">Endpoint</p>
            <p className="text-gray-900 font-mono text-sm break-all">{api.endpoint}</p>
          </div>
          <div>
            <p className="text-gray-500 text-sm font-semibold mb-1">Price per Call</p>
            <p className="text-purple-600 font-bold text-xl font-mono">${priceInUSD} USDC</p>
          </div>
        </div>
      </div>

      {/* Request Builder */}
      <div className="bg-white border-2 border-gray-200 rounded-xl p-6 sm:p-8 shadow-md">
        <div className="flex items-center gap-3 mb-6">
          <FiCode className="w-6 h-6 text-purple-600" />
          <h3 className="text-2xl font-bold text-gray-900">Test API Call</h3>
        </div>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-bold text-gray-900 mb-2">
              HTTP Method
            </label>
            <select
              value={httpMethod}
              onChange={(e) => setHttpMethod(e.target.value)}
              className="w-full px-4 py-3 bg-white border-2 border-gray-300 rounded-lg text-gray-900 font-semibold focus:border-purple-500 focus:ring-2 focus:ring-purple-200 focus:outline-none transition-all"
            >
              <option value="GET">GET</option>
              <option value="POST">POST</option>
              <option value="PUT">PUT</option>
              <option value="DELETE">DELETE</option>
              <option value="PATCH">PATCH</option>
            </select>
          </div>

          {httpMethod !== 'GET' && (
            <div>
              <label className="block text-sm font-bold text-gray-900 mb-2">
                Request Data (JSON)
              </label>
              <textarea
                rows={8}
                value={requestData}
                onChange={(e) => setRequestData(e.target.value)}
                className="w-full px-4 py-3 bg-white border-2 border-gray-300 rounded-lg text-gray-900 font-mono text-sm focus:border-purple-500 focus:ring-2 focus:ring-purple-200 focus:outline-none transition-all"
                placeholder='{"param": "value"}'
              />
            </div>
          )}

          <button
            onClick={handleExecute}
            disabled={isLoading}
            className="w-full px-6 py-4 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed rounded-lg text-white font-bold text-lg transition-all duration-200 shadow-md hover:shadow-lg flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <div className="inline-block h-5 w-5 animate-spin rounded-full border-3 border-solid border-white border-r-transparent" />
                Processing...
              </>
            ) : (
              <>
                <HiSparkles className="w-5 h-5" />
                Execute API Call - ${priceInUSD} USDC
              </>
            )}
          </button>

          {paymentId && (
            <div className="text-xs text-purple-700 text-center p-3 bg-purple-50 rounded-lg border-2 border-purple-200">
              Payment ID: <code className="text-purple-800 font-bold">{paymentId}</code>
            </div>
          )}
        </div>
      </div>

      {/* Status & Results */}
      {(status || data || error) && (
        <div className="bg-white border-2 border-gray-200 rounded-xl p-6 sm:p-8 shadow-md">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-2xl font-bold text-gray-900">Results</h3>
            <button
              onClick={reset}
              className="text-sm text-gray-600 hover:text-gray-900 font-semibold transition-colors flex items-center gap-1"
            >
              <FiX className="w-4 h-4" />
              Clear
            </button>
          </div>

          {status && (
            <div className={`mb-4 px-4 py-3 rounded-lg border-2 font-semibold flex items-center gap-2 ${
              error ? 'bg-red-50 border-red-300 text-red-800' :
              data ? 'bg-emerald-50 border-emerald-300 text-emerald-800' :
              'bg-blue-50 border-blue-300 text-blue-800'
            }`}>
              {error ? <FiAlertCircle className="w-5 h-5" /> : <FiCheckCircle className="w-5 h-5" />}
              <p className="text-sm">{status}</p>
            </div>
          )}

          {error && (
            <div className="mb-4 px-4 py-3 rounded-lg bg-red-50 border-2 border-red-300">
              <div className="flex items-center gap-2 mb-2">
                <FiAlertCircle className="w-5 h-5 text-red-600" />
                <p className="text-sm font-bold text-red-900">Error:</p>
              </div>
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {data && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <FiCheckCircle className="w-5 h-5 text-emerald-600" />
                <p className="text-sm font-bold text-gray-900">Response Data:</p>
              </div>
              <pre className="bg-gray-50 border-2 border-gray-300 rounded-lg p-4 text-sm text-gray-800 overflow-x-auto font-mono">
                {data}
              </pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
