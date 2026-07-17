import React from 'react';
import { useNavigate } from 'react-router-dom';
import { HelpCircle, ArrowLeft, Home } from 'lucide-react';

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 relative overflow-hidden font-inter">
      {/* Absolute Soft Backgrounds */}
      <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-primary/5 rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-secondary/5 rounded-full blur-[150px] pointer-events-none" />

      <div className="w-full max-w-md text-center z-10 bg-white border border-slate-200/50 rounded-card p-10 shadow-premium relative transition-all duration-300">
        <div className="w-16 h-16 rounded-standard bg-primary/5 border border-primary/10 flex items-center justify-center text-primary mx-auto mb-6 shadow-sm">
          <HelpCircle size={28} className="animate-[float_3s_infinite]" />
        </div>

        <h1 className="text-6xl font-bold tracking-tight text-slate-900 font-sans leading-none">404</h1>
        <h2 className="text-2xl font-bold text-slate-800 mt-4 font-sans tracking-tight">Page Not Found</h2>
        <p className="text-sm text-slate-500 mt-2 leading-relaxed max-w-xs mx-auto">
          The cockpit coordinate you requested does not exist or has been relocated in space.
        </p>

        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={() => navigate(-1)}
            type="button"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-5 py-2.5 bg-white border border-slate-200 text-slate-700 rounded-button font-semibold text-xs shadow-premium hover:bg-slate-50 transition-all active:scale-95 font-sans"
          >
            <ArrowLeft size={13} />
            Go Back
          </button>
          <button
            onClick={() => navigate('/dashboard')}
            type="button"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-5 py-2.5 bg-gradient-to-r from-primary to-secondary hover:opacity-95 text-white rounded-button font-semibold text-xs shadow-premium transition-all active:scale-95 font-sans"
          >
            <Home size={13} />
            Dashboard
          </button>
        </div>
      </div>

      <footer className="mt-10 text-center z-10 font-sans text-xs text-slate-400">
        © 2026 AI Interview Coach • v2.0
      </footer>
    </div>
  );
};

export default NotFound;
