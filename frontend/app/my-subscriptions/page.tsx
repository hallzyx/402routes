'use client';

import { useRouter } from 'next/navigation';
import { HiSparkles } from 'react-icons/hi2';

export default function MySubscriptionsPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white border-b border-gray-100">
        <div className="container mx-auto max-w-7xl px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-8">
              <div className="flex items-center gap-2 cursor-pointer" onClick={() => router.push('/')}>
                <div className="w-8 h-8 bg-gradient-to-br from-violet-600 to-purple-700 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-lg">4</span>
                </div>
                <h1 className="text-xl font-bold text-gray-900">402Routes</h1>
              </div>
              <button
                onClick={() => router.push('/discover')}
                className="text-gray-700 hover:text-gray-900 font-medium transition-colors"
              >
                Discover APIs
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto max-w-7xl px-6 py-24">
        <div className="mb-12">
          <h1 className="text-5xl font-bold text-gray-900 mb-3">My Subscriptions</h1>
          <p className="text-lg text-gray-600">
            APIs you've used and paid for
          </p>
        </div>

        <div className="text-center py-24 bg-gray-50 rounded-lg border border-gray-200">
          <HiSparkles className="w-16 h-16 text-violet-600 mx-auto mb-4" />
          <p className="text-2xl text-gray-900 font-semibold mb-2">No subscriptions yet</p>
          <p className="text-gray-600 mb-8">Start using APIs from the marketplace!</p>
          <button
            onClick={() => router.push('/discover')}
            className="px-6 py-3 bg-violet-600 hover:bg-violet-700 text-white font-semibold rounded-lg transition-all inline-flex items-center gap-2"
          >
            <HiSparkles className="w-5 h-5" />
            Discover APIs
          </button>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-100 bg-white mt-24">
        <div className="container mx-auto max-w-7xl px-6 py-8 text-center">
          <p className="text-gray-500 text-sm">Powered by Cronos & X402 Protocol</p>
        </div>
      </footer>
    </div>
  );
}
