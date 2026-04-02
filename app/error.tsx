'use client';

import { useEffect } from 'react';
import { AlertCircle, RefreshCcw, Home } from 'lucide-react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Unhandled error:', error);
  }, [error]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 px-4">
      <div className="bg-white p-8 rounded-2xl shadow-xl border border-slate-200 max-w-md w-full text-center">
        <div className="bg-rose-100 p-3 rounded-full w-fit mx-auto mb-6">
          <AlertCircle className="w-8 h-8 text-rose-600" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Something went wrong!</h2>
        <p className="text-slate-500 mb-8">
          An unexpected error occurred. We&apos;ve been notified and are working on it.
        </p>
        <div className="flex flex-col gap-3">
          <button 
            onClick={() => reset()}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 rounded-xl shadow-lg shadow-indigo-200 flex items-center justify-center gap-2 transition-all"
          >
            <RefreshCcw className="w-5 h-5" />
            Try again
          </button>
          <button 
            onClick={() => window.location.href = '/'}
            className="w-full border border-slate-200 text-slate-600 font-bold py-4 rounded-xl hover:bg-slate-50 transition-all flex items-center justify-center gap-2"
          >
            <Home className="w-5 h-5" />
            Go back home
          </button>
        </div>
        {process.env.NODE_ENV === 'development' && (
          <div className="mt-8 p-4 bg-slate-100 rounded-lg text-left overflow-auto max-h-40">
            <p className="text-xs font-mono text-slate-600">{error.message}</p>
            <pre className="text-[10px] font-mono text-slate-400 mt-2">{error.stack}</pre>
          </div>
        )}
      </div>
    </div>
  );
}
