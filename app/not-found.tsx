import Link from 'next/link';
import { Search, Home } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 px-4">
      <div className="bg-white p-12 rounded-3xl shadow-2xl border border-slate-100 max-w-lg w-full text-center">
        <div className="bg-indigo-50 p-4 rounded-full w-fit mx-auto mb-8">
          <Search className="w-10 h-10 text-indigo-600" />
        </div>
        <h2 className="text-4xl font-black text-slate-900 mb-4 tracking-tight">404</h2>
        <h3 className="text-xl font-bold text-slate-800 mb-2">Page Not Found</h3>
        <p className="text-slate-500 mb-10 leading-relaxed">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <Link 
          href="/"
          className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 px-8 rounded-2xl shadow-lg shadow-indigo-100 transition-all"
        >
          <Home className="w-5 h-5" />
          Back to Home
        </Link>
      </div>
    </div>
  );
}
