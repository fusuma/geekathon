'use client';

import { useQuery } from '@tanstack/react-query';
import { fetchHello } from '../lib/api';

export default function HomePage() {
  const {
    data: helloData,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['hello'],
    queryFn: fetchHello,
    enabled: false, // Don't auto-fetch, wait for user interaction
  });

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="z-10 w-full max-w-5xl items-center justify-between font-mono text-sm">
        <h1 className="text-4xl font-bold text-center mb-8">
          SmartLabel AI - Steel Thread
        </h1>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 max-w-md mx-auto">
          <h2 className="text-2xl font-semibold mb-4">Test API Connection</h2>

          <button
            onClick={() => refetch()}
            disabled={isLoading}
            className="bg-blue-500 hover:bg-blue-700 disabled:bg-blue-300 text-white font-bold py-2 px-4 rounded mb-4"
          >
            {isLoading ? 'Loading...' : 'Call Hello API'}
          </button>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              <strong>Error:</strong> {error.message}
            </div>
          )}

          {helloData && (
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
              <h3 className="font-semibold">API Response:</h3>
              <p><strong>Message:</strong> {helloData.message}</p>
              <p><strong>Timestamp:</strong> {helloData.timestamp}</p>
              <p><strong>Version:</strong> {helloData.version}</p>
            </div>
          )}
        </div>

        <div className="mt-8 text-center text-sm text-gray-500">
          <p>This is the Steel Thread implementation proving end-to-end connectivity.</p>
          <p>Frontend (Next.js) → Backend (AWS Lambda) → Response</p>
        </div>
      </div>
    </main>
  );
}