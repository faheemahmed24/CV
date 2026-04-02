import { Sparkles } from 'lucide-react';

export default function Loading() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50">
      <div className="bg-white p-12 rounded-3xl shadow-2xl border border-slate-100 max-w-sm w-full text-center">
        <div className="relative w-24 h-24 mx-auto mb-8">
          <div className="absolute inset-0 bg-indigo-600 rounded-3xl animate-pulse opacity-20" />
          <div className="absolute inset-0 flex items-center justify-center">
            <Sparkles className="w-10 h-10 text-indigo-600 animate-bounce" />
          </div>
        </div>
        <h2 className="text-2xl font-black text-slate-900 mb-2 tracking-tight">CV Architect Pro</h2>
        <p className="text-slate-500 font-bold text-xs uppercase tracking-widest animate-pulse">
          AI-Powered Career Engine
        </p>
        <div className="mt-10 w-full h-1 bg-slate-100 rounded-full overflow-hidden">
          <div className="h-full bg-indigo-600 animate-progress w-1/3" />
        </div>
      </div>
    </div>
  );
}
