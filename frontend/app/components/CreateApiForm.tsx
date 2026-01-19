'use client';

import { useState } from 'react';
import { HiSparkles } from 'react-icons/hi2';
import { FiX } from 'react-icons/fi';
import type { CreateApiRequest } from '@/src/types';

interface CreateApiFormProps {
  onSubmit: (data: CreateApiRequest) => Promise<void>;
  onCancel: () => void;
  walletAddress: string;
}

export default function CreateApiForm({ onSubmit, onCancel, walletAddress }: CreateApiFormProps) {
  const [formData, setFormData] = useState<CreateApiRequest>({
    name: '',
    description: '',
    category: 'Other',
    baseUrl: '',
    endpoint: '',
    method: 'GET',
    pricePerCall: '1000000', // $1.00 default
    ownerAddress: walletAddress,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onSubmit(formData);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const usdPrice = e.target.value;
    const price = parseFloat(usdPrice) || 0;
    setFormData({ ...formData, pricePerCall: (price * 1_000_000).toString() });
  };

  return (
    <div className="bg-gradient-to-br from-purple-50 to-white border-2 border-purple-200 rounded-2xl p-8 shadow-lg">
      <h2 className="text-3xl font-bold text-gray-900 mb-2">Publish New API</h2>
      <p className="text-gray-600 mb-8">Share your API with the community and start earning</p>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-bold text-gray-900 mb-2">
            API Name *
          </label>
          <input
            type="text"
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full px-4 py-3 bg-white border-2 border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 focus:outline-none transition-all"
            placeholder="e.g., Weather Data API"
          />
        </div>

        <div>
          <label className="block text-sm font-bold text-gray-900 mb-2">
            Description *
          </label>
          <textarea
            required
            rows={3}
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="w-full px-4 py-3 bg-white border-2 border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 focus:outline-none transition-all resize-none"
            placeholder="Describe what your API does..."
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-bold text-gray-900 mb-2">
              Category *
            </label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full px-4 py-3 bg-white border-2 border-gray-300 rounded-lg text-gray-900 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 focus:outline-none transition-all"
            >
              <option value="Weather">Weather</option>
              <option value="Finance">Finance</option>
              <option value="AI">AI</option>
              <option value="Data">Data</option>
              <option value="Gaming">Gaming</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-900 mb-2">
              Method *
            </label>
            <select
              value={formData.method}
              onChange={(e) => setFormData({ ...formData, method: e.target.value as any })}
              className="w-full px-4 py-3 bg-white border-2 border-gray-300 rounded-lg text-gray-900 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 focus:outline-none transition-all"
            >
              <option value="GET">GET</option>
              <option value="POST">POST</option>
              <option value="PUT">PUT</option>
              <option value="DELETE">DELETE</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-bold text-gray-900 mb-2">
            Base URL *
          </label>
          <input
            type="url"
            required
            value={formData.baseUrl}
            onChange={(e) => setFormData({ ...formData, baseUrl: e.target.value })}
            className="w-full px-4 py-3 bg-white border-2 border-gray-300 rounded-lg text-gray-900 font-mono text-sm placeholder-gray-400 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 focus:outline-none transition-all"
            placeholder="https://api.example.com"
          />
        </div>

        <div>
          <label className="block text-sm font-bold text-gray-900 mb-2">
            Endpoint Path *
          </label>
          <input
            type="text"
            required
            value={formData.endpoint}
            onChange={(e) => setFormData({ ...formData, endpoint: e.target.value })}
            className="w-full px-4 py-3 bg-white border-2 border-gray-300 rounded-lg text-gray-900 font-mono text-sm placeholder-gray-400 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 focus:outline-none transition-all"
            placeholder="/api/your-endpoint"
          />
        </div>

        <div>
          <label className="block text-sm font-bold text-gray-900 mb-2">
            Price per Call (USDC) *
          </label>
          <input
            type="number"
            step="0.001"
            min="0"
            required
            value={(parseInt(formData.pricePerCall) / 1_000_000).toFixed(3)}
            onChange={handlePriceChange}
            className="w-full px-4 py-3 bg-white border-2 border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 focus:outline-none transition-all"
            placeholder="0.001"
          />
          <p className="mt-2 text-xs text-gray-600 font-mono bg-gray-50 px-3 py-2 rounded">
            Base units: {formData.pricePerCall}
          </p>
        </div>

        <div>
          <label className="block text-sm font-bold text-gray-900 mb-2">
            Owner Address *
          </label>
          <input
            type="text"
            required
            value={formData.ownerAddress}
            onChange={(e) => setFormData({ ...formData, ownerAddress: e.target.value })}
            className="w-full px-4 py-3 bg-white border-2 border-gray-300 rounded-lg text-gray-900 font-mono text-sm placeholder-gray-400 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 focus:outline-none transition-all"
            placeholder="0x..."
          />
          <p className="mt-2 text-xs text-gray-600">
            Default: Your connected wallet address
          </p>
        </div>

        <div className="flex gap-4 pt-4">
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex-1 px-6 py-4 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed rounded-lg text-white font-bold transition-all duration-200 shadow-md hover:shadow-lg flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <>
                <div className="inline-block h-5 w-5 animate-spin rounded-full border-3 border-solid border-white border-r-transparent" />
                Publishing...
              </>
            ) : (
              <>
                <HiSparkles className="w-5 h-5" />
                Publish API
              </>
            )}
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="px-8 py-4 bg-white border-2 border-gray-300 hover:border-gray-900 hover:bg-gray-50 rounded-lg text-gray-900 font-semibold transition-all duration-200 flex items-center gap-2"
          >
            <FiX className="w-5 h-5" />
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
