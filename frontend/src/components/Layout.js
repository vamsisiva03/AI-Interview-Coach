import React, { useEffect, useRef, useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Menu } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Sidebar from './Sidebar';
import { useAuth } from '../context/AuthContext';
import Avatar from './Avatar';

/**
 * Layout – wraps every protected page.
 * Premium SaaS layout with smooth page transitions.
 */
const Layout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const mainRef = useRef(null);
  const { user } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  /* ── Scroll to top on route change ── */
  useEffect(() => {
    if (mainRef.current) {
      mainRef.current.scrollTo({ top: 0, behavior: 'instant' });
    }
  }, [location.pathname]);


  return (
    <div className="flex h-screen overflow-hidden bg-background relative">
      {/* ── Sidebar ── */}
      <Sidebar mobileOpen={mobileOpen} onClose={() => setMobileOpen(false)} />

      {/* ── Main content ── */}
      <main className="flex-1 min-w-0 relative flex flex-col h-screen overflow-hidden bg-background">
        
        {/* Mobile SaaS Header */}
        <header className="h-[74px] shrink-0 border-b border-slate-100 flex md:hidden items-center px-6 justify-between bg-white/80 backdrop-blur-md z-30">
          <button
            onClick={() => setMobileOpen(true)}
            className="p-1.5 rounded-button text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
            aria-label="Open navigation menu"
          >
            <Menu size={20} />
          </button>
          <div className="flex items-center gap-2.5 text-[13px] font-medium text-slate-500 font-sans">
            <span className="text-slate-900 font-bold capitalize">{location.pathname.replace('/','').replace('-',' ')}</span>
          </div>
          <div className="hover:scale-[1.03] hover:shadow transition-all duration-150 rounded-full">
            <Avatar src={user?.profileImage} name={user?.name} sizeClass="w-[34px] h-[34px]" initialsSizeClass="text-[12px]" />
          </div>
        </header>

        {/* Global SaaS Header */}
        <header className="h-[74px] shrink-0 border-b border-slate-200/80 hidden md:flex items-center px-8 justify-between bg-white/80 backdrop-blur-md z-30">
          <div className="flex items-center gap-3.5 text-[12px] font-semibold text-slate-400 font-sans uppercase tracking-[0.06em]">
            <span 
              className="hover:text-[#4F46E5] cursor-pointer transition-colors"
              onClick={() => navigate('/dashboard')}
            >
              coach.ai
            </span>
            <span className="text-slate-300 font-normal">/</span>
            <span className="text-slate-800 font-bold capitalize">{location.pathname.replace('/','').replace('-',' ')}</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-[11px] tracking-[0.05em] uppercase text-[#4F46E5] bg-[#4F46E5]/5 px-3 py-1.5 rounded-full border border-[#4F46E5]/10 font-bold flex items-center gap-1.5 hover:-translate-y-[1px] transition-transform duration-150 shadow-sm cursor-default">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Standard Plan
            </div>
            <div className="hover:scale-[1.03] hover:shadow transition-all duration-150 rounded-full">
              <Avatar src={user?.profileImage} name={user?.name} sizeClass="w-[34px] h-[34px]" initialsSizeClass="text-[12px]" />
            </div>
          </div>
        </header>

        {/* Scrollable Content Workspace */}
        <div ref={mainRef} className="flex-1 overflow-y-auto w-full relative">
          <div className="w-full max-w-[1400px] mx-auto px-8 pt-8 pb-10 flex flex-col">
            <AnimatePresence mode="wait">
              <motion.div
                key={location.pathname}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.25, ease: [0.25, 0.46, 0.45, 0.94] }}
                className="flex-1 flex flex-col"
              >
                <Outlet />
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </main>

    </div>
  );
};

export default Layout;
