import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Mic,
  History,
  UserCircle,
  LogOut,
  Sparkles,
  Settings,
  X,
  ChevronUp
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Avatar from './Avatar';

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

const Sidebar = ({ mobileOpen, onClose }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [sessionsCount, setSessionsCount] = useState(0);
  const dropdownRef = useRef(null);

  const workspaceItems = [
    { icon: LayoutDashboard, label: 'Dashboard',         path: '/dashboard' },
    { icon: Mic,             label: 'Start Interview',   path: '/interview' },
    { icon: History,         label: 'Interview History', path: '/history'   },
  ];

  const accountItems = [
    { icon: UserCircle,      label: 'Profile',           path: '/profile'   },
    { icon: Settings,        label: 'Settings',          path: '/settings'  },
  ];

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        if (token) {
          const res = await axios.get(`${API_URL}/api/interview/history`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          setSessionsCount(res.data.length);
        }
      } catch (e) {}
    };
    fetchData();
  }, []);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const currentName = user?.name || 'User';
  const usedCredits = Math.min(sessionsCount * 10, 100);

  const renderContent = (isMobile = false) => (
    <div className="flex flex-col h-full justify-between bg-[#0F172A] text-slate-400 font-sans relative">
      
      <div className="flex flex-col min-h-0 flex-1">
        {/* ── Brand Header (Region 1) ── */}
        <div 
          className="h-[72px] shrink-0 px-5 border-b border-white/[0.06] flex items-center justify-between cursor-pointer group"
          onClick={() => {
            navigate('/dashboard');
            if (isMobile && onClose) onClose();
          }}
        >
        <div className="flex items-center gap-3">
          <div className="w-[34px] h-[34px] rounded-lg bg-brand flex items-center justify-center border border-white/10 shrink-0">
            <Sparkles className="text-white animate-pulse" size={15} fill="white" />
          </div>
          <div className="flex flex-col">
            <span className="text-[16px] font-[650] text-white tracking-tight leading-none">
              Coach.ai
            </span>
            <span className="text-[11px] text-slate-500 font-medium mt-1 leading-none">
              AI Interview Coach
            </span>
          </div>
        </div>
      </div>

      {/* ── Navigation Sections (Region 2) ── */}
      <div className="flex-1 px-4 py-6 space-y-6 overflow-y-auto">
        
        {/* Workspace Group */}
        <div className="space-y-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 select-none mb-1.5 px-3 block">
            Workspace
          </span>
          <nav className="space-y-1">
            {workspaceItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.label}
                  to={item.path}
                  onClick={() => {
                    if (isMobile && onClose) onClose();
                  }}
                  className={`
                    group relative flex items-center gap-3.5 pl-3.5 pr-3 h-[46px] rounded-lg
                    transition-all duration-200 ease-in-out cursor-pointer overflow-hidden
                    ${isActive
                      ? 'bg-gradient-to-r from-[#4F46E5]/12 to-[#4F46E5]/0 text-white font-bold'
                      : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-100 hover:translate-x-[2.5px]'
                    }
                  `}
                >
                  {isActive && (
                    <div className="absolute left-0 top-[6px] bottom-[6px] w-[3px] bg-gradient-to-b from-[#4F46E5] to-[#6366F1] rounded-r shadow-[0_0_12px_rgba(79,70,229,0.8)]" />
                  )}
                  <item.icon
                    size={18}
                    className={`transition-all duration-200 shrink-0 ${isActive ? 'text-[#6366F1]' : 'text-slate-500 group-hover:text-slate-300'}`}
                  />
                  <span className="text-[14px] tracking-tight font-medium">
                    {item.label}
                  </span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Account Group */}
        <div className="space-y-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 select-none mb-1.5 px-3 block">
            Account
          </span>
          <nav className="space-y-1">
            {accountItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.label}
                  to={item.path}
                  onClick={() => {
                    if (isMobile && onClose) onClose();
                  }}
                  className={`
                    group relative flex items-center gap-3.5 pl-3.5 pr-3 h-[46px] rounded-lg
                    transition-all duration-200 ease-in-out cursor-pointer overflow-hidden
                    ${isActive
                      ? 'bg-gradient-to-r from-[#4F46E5]/12 to-[#4F46E5]/0 text-white font-bold'
                      : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-100 hover:translate-x-[2.5px]'
                    }
                  `}
                >
                  {isActive && (
                    <div className="absolute left-0 top-[6px] bottom-[6px] w-[3px] bg-gradient-to-b from-[#4F46E5] to-[#6366F1] rounded-r shadow-[0_0_12px_rgba(79,70,229,0.8)]" />
                  )}
                  <item.icon
                    size={18}
                    className={`transition-all duration-200 shrink-0 ${isActive ? 'text-[#6366F1]' : 'text-slate-500 group-hover:text-slate-300'}`}
                  />
                  <span className="text-[14px] tracking-tight font-medium">
                    {item.label}
                  </span>
                </Link>
              );
            })}
          </nav>
        </div>
      </div>
      </div>

      {/* ── Usage & Account Area (Region 3) ── */}
      <div className="px-5 pt-5 pb-6 border-t border-white/[0.06] flex flex-col gap-6 shrink-0 relative">
        
        {/* Credits Tracker Module */}
        <div className="bg-white/[0.02] border border-white/[0.05] rounded-xl p-4 space-y-3 h-[104px] flex flex-col justify-between shrink-0">
          <div className="flex justify-between items-center text-[10px] font-bold text-slate-500 uppercase tracking-[0.08em]">
            <span>AI Credits</span>
            <span className="text-[11px] text-slate-300 font-bold">{usedCredits} / 100 USED</span>
          </div>
          
          {/* Progress bar */}
          <div className="h-1.5 bg-white/[0.08] rounded-full overflow-hidden shrink-0">
            <div 
              className="h-full bg-gradient-to-r from-[#4F46E5] to-[#6366F1] rounded-full transition-all duration-700 ease-out" 
              style={{ width: `${usedCredits}%` }} 
            />
          </div>
          
          <div className="flex justify-between items-center text-[10px] text-slate-500 font-bold font-mono shrink-0 tracking-wider">
            <span>SESSIONS: {sessionsCount}</span>
            <span>REMAINING: {10 - Math.min(sessionsCount, 10)}</span>
          </div>
        </div>

        {/* Dropdown Menu Card */}
        {dropdownOpen && (
          <div 
            ref={dropdownRef}
            className="absolute bottom-24 left-5 right-5 bg-[#121214] border border-[#27272A] rounded-[14px] shadow-xl p-1.5 z-50 flex flex-col font-sans origin-bottom animate-toast"
          >
            <button 
              onClick={() => { handleLogout(); setDropdownOpen(false); }} 
              className="w-full flex items-center gap-2.5 px-3 py-2.5 text-[13px] text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors text-left font-semibold"
            >
              <LogOut size={15} />
              Sign Out
            </button>
          </div>
        )}
        
        {/* User Profile Card Toggle */}
        <div 
          onClick={() => setDropdownOpen(!dropdownOpen)}
          className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] border border-white/[0.05] hover:bg-slate-800/40 hover:border-white/[0.08] transition-all duration-150 cursor-pointer group w-full min-w-0"
        >
          <div className="flex items-center gap-3.5 min-w-0 flex-1 mr-1">
            <div className="relative shrink-0">
              <Avatar src={user?.profileImage} name={currentName} sizeClass="w-9 h-9 border border-white/[0.05]" initialsSizeClass="text-[12px]" />
              <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-500 border border-[#0F172A]" />
            </div>
            
            <div className="min-w-0 flex-1">
              <p className="text-[13px] font-bold text-slate-200 truncate leading-tight">{currentName}</p>
              <p className="text-[11px] text-slate-500 truncate mt-1.5 leading-none">{user?.email || 'Candidate'}</p>
            </div>
          </div>
          <ChevronUp size={14} className="text-slate-400 group-hover:text-slate-200 transition-colors shrink-0" />
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="w-[260px] shrink-0 flex flex-col h-screen sticky top-0 bg-[#0F172A] border-r border-white/[0.06] hidden md:flex select-none z-40">
        {renderContent(false)}
      </aside>

      {/* Mobile Drawer Overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="w-[260px] bg-[#0F172A] h-full flex flex-col border-r border-white/[0.06] relative animate-slide-in-left">
            <button 
              onClick={onClose}
              className="absolute top-4 right-4 text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-white/10 z-50"
              aria-label="Close navigation menu"
            >
              <X size={18} />
            </button>
            {renderContent(true)}
          </div>
          <div className="flex-1" onClick={onClose} />
        </div>
      )}
    </>
  );
};

export default Sidebar;
