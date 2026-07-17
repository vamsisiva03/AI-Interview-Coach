import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import Avatar from '../components/Avatar';
import {
  History as HistoryIcon,
  Search,
  AlertCircle,
  TrendingUp,
  Clock,
  Award,
  ChevronRight,
  Loader2,
  PlayCircle
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

const History = () => {
  const { token, user } = useAuth();
  const navigate = useNavigate();
  const [interviews, setInterviews] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState('All');

  useEffect(() => {
    const fetchHistory = async () => {
      if (!token) return;
      
      setLoading(true);
      setError(null);
      try {
        const res = await axios.get(`${API_URL}/api/interview/history`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        const formatted = res.data.map(h => ({
          ...h,
          title: h.domain,
          category: h.difficulty,
          date: formatDate(h.date),
          questions: h.questionsCount || h.questions?.length || 0,
          rawDuration: h.duration || 900,
          duration: `${Math.floor((h.duration || 900) / 60)}m`,
          score: h.score
        }));
        setInterviews(formatted);
      } catch (e) {
        setError("Failed to load history data. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [token]);

  const formatDate = (dateStr) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  /* ── Computed Stats ── */
  const totalInterviews = interviews.length;
  const avgScore = totalInterviews > 0 
    ? Math.round(interviews.reduce((sum, i) => sum + (i.score || 0), 0) / totalInterviews)
    : 0;
  const bestScore = totalInterviews > 0 
    ? Math.max(...interviews.map(i => i.score || 0))
    : 0;
  const totalTime = totalInterviews > 0
    ? Math.round(interviews.reduce((sum, i) => sum + (i.rawDuration || 900), 0) / 60)
    : 0;

  /* ── Filter & Search Logic ── */
  const filteredInterviews = interviews.filter(item => {
    const matchesSearch = searchQuery.trim()
      ? item.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.category?.toLowerCase().includes(searchQuery.toLowerCase())
      : true;
      
    const matchesDifficulty = selectedDifficulty === 'All'
      ? true
      : item.category?.toLowerCase() === selectedDifficulty.toLowerCase();
      
    return matchesSearch && matchesDifficulty;
  });

  return (
    <div className="w-full max-w-[1400px] mx-auto space-y-8 pb-12 font-sans">
      {/* Page Header */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="hover:scale-[1.03] hover:shadow transition-all duration-150 rounded-full">
            <Avatar src={user?.profileImage} name={user?.name} sizeClass="w-10 h-10 border border-[#4F46E5]/25 shadow-sm" initialsSizeClass="text-sm" />
          </div>
          <div>
            <h1 className="text-[36px] md:text-[40px] font-bold tracking-[-0.04em] text-slate-900 leading-none">
              Interview History
            </h1>
            <p className="text-[14px] md:text-[15px] text-slate-500 font-medium mt-2">
              Review your past mock sessions, performance scores, and evaluations logs.
            </p>
          </div>
        </div>

        {interviews.length > 0 && (
          <div className="flex flex-col sm:flex-row gap-3.5 items-start sm:items-center">
            {/* Search Input */}
            <div className="relative w-full sm:w-60">
              <Search
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#4F46E5] transition-colors"
                size={14}
              />
              <input
                type="text"
                placeholder="Search domain..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full premium-input pl-10 focus:outline-none font-semibold text-xs h-[42px] rounded-xl"
              />
            </div>
            
            {/* Difficulty Tabs */}
            <div className="bg-slate-100 p-0.5 rounded-xl flex gap-0.5 border border-slate-100">
              {['All', 'Beginner', 'Intermediate', 'Advanced'].map((lvl) => (
                <button
                  key={lvl}
                  onClick={() => setSelectedDifficulty(lvl)}
                  type="button"
                  className={`px-3.5 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all font-sans ${
                    selectedDifficulty === lvl
                      ? 'bg-white text-slate-900 shadow-sm'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  {lvl}
                </button>
              ))}
            </div>
          </div>
        )}
      </header>

      {/* Quick stats panel */}
      {totalInterviews > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
          {[
            { label: 'Total Sessions', value: totalInterviews, icon: HistoryIcon },
            { label: 'Average Score', value: `${avgScore}%`, icon: TrendingUp },
            { label: 'Best Rating', value: `${bestScore}%`, icon: Award },
            { label: 'Duration Practiced', value: `${totalTime}m`, icon: Clock },
          ].map((stat, i) => (
            <div key={i} className="premium-card p-5 flex items-center gap-3.5 cursor-default hover:-translate-y-[1px]">
              <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 text-slate-500 flex items-center justify-center shrink-0 shadow-sm">
                <stat.icon size={15} />
              </div>
              <div className="min-w-0">
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider leading-none">{stat.label}</p>
                <p className="text-[18px] font-extrabold text-slate-800 tracking-tight mt-1.5 leading-none">{stat.value}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Datatable Card */}
      <div className="premium-card overflow-hidden">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
             <Loader2 className="animate-spin text-[#4F46E5]" size={24} />
             <p className="text-xs font-semibold text-slate-400">Loading completed sessions...</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3 text-center px-6">
            <div className="w-10 h-10 rounded-xl bg-rose-50 flex items-center justify-center text-rose-500 border border-rose-100">
               <AlertCircle size={18} />
            </div>
            <div>
              <h3 className="text-xs font-bold text-slate-800">Something went wrong</h3>
              <p className="text-[11px] text-slate-400 max-w-sm mt-0.5">{error}</p>
            </div>
            <button 
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-white border border-slate-200 text-xs font-semibold text-slate-700 rounded-xl hover:bg-slate-50 transition-colors shadow-sm"
            >
              Try Again
            </button>
          </div>
        ) : interviews.length === 0 ? (
          <div className="min-h-[50vh] flex flex-col items-center justify-center pt-8 pb-16 relative overflow-hidden px-4 text-center">
            {/* Ambient background glow */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-indigo-500/5 via-transparent to-transparent pointer-events-none -z-10" />
            
            <div className="w-full max-w-[640px] mx-auto space-y-6">
              <div>
                <span className="inline-flex items-center px-3 py-1 rounded-full bg-[#4F46E5]/5 border border-[#4F46E5]/10 text-[#4F46E5] text-[11px] font-[650] tracking-[0.08em] uppercase mb-4">
                  Archive Status
                </span>
                <h1 className="text-[36px] md:text-[44px] font-extrabold tracking-[-0.04em] text-slate-900 leading-tight">
                  No sessions <span className="text-[#4F46E5]">completed.</span>
                </h1>
                <p className="text-[15px] text-slate-500 font-medium max-w-md mx-auto mt-3.5 leading-relaxed">
                  Start practicing target roles to generate custom reports and career suggestions.
                </p>
              </div>

              <div className="pt-2">
                <button
                  onClick={() => navigate('/interview')}
                  className="px-6 h-12 rounded-xl font-semibold text-sm bg-[#4F46E5] hover:bg-[#6366F1] text-white hover:-translate-y-[1px] active:translate-y-0 shadow-sm hover:shadow-md transition-all duration-150 flex items-center justify-center gap-1.5 mx-auto"
                >
                  <PlayCircle size={14} className="text-white" />
                  Start Training Session
                </button>
              </div>
            </div>
          </div>
        ) : filteredInterviews.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center px-6">
            <p className="text-xs font-bold text-slate-800 uppercase tracking-wider">No matching sessions</p>
            <p className="text-xs text-slate-400 mt-1">Adjust search parameters or difficulty tabs.</p>
            <button onClick={() => { setSearchQuery(''); setSelectedDifficulty('All'); }} className="text-xs text-[#4F46E5] font-semibold mt-3 hover:underline">Reset Filters</button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead className="bg-[#F8FAFC] border-b border-slate-100 font-sans select-none text-[11px]">
                <tr>
                  <th className="px-6 py-4.5 font-bold text-slate-400 uppercase tracking-wider">Role</th>
                  <th className="px-6 py-4.5 font-bold text-slate-400 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-4.5 font-bold text-slate-400 uppercase tracking-wider">Difficulty</th>
                  <th className="px-6 py-4.5 font-bold text-slate-400 uppercase tracking-wider">Duration</th>
                  <th className="px-6 py-4.5 font-bold text-slate-400 uppercase tracking-wider">Score</th>
                  <th className="px-6 py-4.5 font-bold text-slate-400 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4.5 font-bold text-slate-400 uppercase tracking-wider text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredInterviews.map((item, idx) => {
                  const scoreColor = item.score >= 80 ? 'text-emerald-650' : item.score >= 60 ? 'text-amber-500' : 'text-rose-500';
                  const scoreDot = item.score >= 80 ? 'bg-emerald-500' : item.score >= 60 ? 'bg-amber-500' : 'bg-rose-500';
                  return (
                    <tr
                      key={item.sessionId || item._id || idx}
                      onClick={() => navigate(`/report/${item.sessionId}`, { state: { reportData: item } })}
                      className="hover:bg-slate-50/70 transition-colors duration-150 cursor-pointer group"
                    >
                      <td className="px-5 py-3.5 whitespace-nowrap">
                        <div className="flex items-center gap-2.5">
                          <div className="w-6 h-6 rounded bg-slate-50 flex items-center justify-center border border-border text-slate-600 font-semibold shrink-0">
                            {(item.title || 'IN').slice(0, 2).toUpperCase()}
                          </div>
                          <span className="font-semibold text-slate-800 truncate max-w-[200px]">{item.title}</span>
                        </div>
                      </td>
                      <td className="px-5 py-3.5 whitespace-nowrap text-slate-500 font-medium">
                        {item.date}
                      </td>
                      <td className="px-5 py-3.5 whitespace-nowrap text-slate-600 font-medium">
                        {item.category}
                      </td>
                      <td className="px-5 py-3.5 whitespace-nowrap text-slate-500 font-medium">
                        {item.duration}
                      </td>
                      <td className="px-5 py-3.5 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <span className={`w-1.5 h-1.5 rounded-full ${scoreDot}`} />
                          <span className={`font-semibold ${scoreColor}`}>{item.score}%</span>
                        </div>
                      </td>
                      <td className="px-5 py-3.5 whitespace-nowrap text-slate-500 font-medium">
                        Completed
                      </td>
                      <td className="px-5 py-3.5 whitespace-nowrap text-right">
                        <button 
                          type="button"
                          className="inline-flex items-center gap-0.5 px-3 py-1.5 border border-border text-sm font-semibold rounded-lg text-slate-700 bg-white hover:bg-slate-50 hover:text-brand hover:border-slate-350 transition-colors"
                        >
                          Review <ChevronRight size={13} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default History;
