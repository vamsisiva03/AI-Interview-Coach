import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import Avatar from '../components/Avatar';
import {
  CheckCircle2,
  Clock,
  TrendingUp,
  Sparkles,
  AlertCircle,
  Play,
  Flame,
  Target,
  ChevronRight,
} from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';

import RecentInterviews from '../components/RecentInterviews';
import AIInsightCard from '../components/AIInsightCard';
import ScoreChart from '../components/ScoreChart';
import ActivityTimeline from '../components/ActivityTimeline';

const fadeUp = {
  hidden: { opacity: 0, y: 12 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.35, delay: i * 0.05, ease: [0.25, 0.46, 0.45, 0.94] }
  })
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.05, delayChildren: 0.02 }
  }
};

const useAnimatedCounter = (target, duration = 1000, enabled = true) => {
  const [count, setCount] = useState(0);
  const ref = useRef(null);

  useEffect(() => {
    if (!enabled || target === 0) { setCount(target); return; }
    
    let startTime;
    const step = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.round(eased * target));
      if (progress < 1) ref.current = requestAnimationFrame(step);
    };
    ref.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(ref.current);
  }, [target, duration, enabled]);

  return count;
};

const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
};

const getMotivation = (streak, completedCount, avgPerformance) => {
  if (completedCount === 0) return "Start your first AI mock interview to unlock personalized coaching insights.";
  if (streak >= 3) return "Incredible consistency! Your dedication is building interview mastery.";
  if (avgPerformance >= 80) return "Outstanding performance. Focus on advanced scenarios to push past 90%.";
  if (avgPerformance >= 60) return "Great progress! One more session today could boost your confidence score.";
  return "Keep practicing — every session sharpens your responses. You've got this!";
};

const API_URL = process.env.REACT_APP_API_URL;

const Dashboard = () => {
  const { user, login, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [statsData, setStatsData] = useState(null);
  const [history, setHistory] = useState([]);
  const [error, setError] = useState(null);
  const [isSyncing, setIsSyncing] = useState(true);
  const [dataReady, setDataReady] = useState(false);

  const [streak, setStreak] = useState(0);
  const [weeklyProgress, setWeeklyProgress] = useState(0);
  const [timelineEvents, setTimelineEvents] = useState([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      const token = localStorage.getItem('token'); 
      if (!token && !user?.id) return;

      try {
        setError(null);
        setIsSyncing(true);

        const res = await axios.get(`${API_URL}/api/dashboard`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        const historyRes = await axios.get(`${API_URL}/api/interview/history`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        const fullHistory = historyRes.data || [];
        setHistory(fullHistory);
        setStatsData(res.data);

        calculateStreak(fullHistory);
        calculateWeeklyProgress(fullHistory);
        generateTimeline(fullHistory);

        setIsSyncing(false);
        setTimeout(() => setDataReady(true), 50);
      } catch (e) {
        setError("Failed to synchronize dashboard metrics.");
        setStatsData({
          interviewsCompleted: 0,
          averagePerformance: 0,
          totalPractice: 0,
          aiConfidence: 0,
          recentInterviews: []
        });
        setIsSyncing(false);
        setDataReady(true);
      }
    };

    fetchDashboardData();
  }, [user?.id]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const token = params.get('token');
    if (token) {
      login(token);
      navigate('/dashboard', { replace: true });
    }
  }, [location.search, login, navigate]);

  const calculateStreak = (sessions) => {
    if (!sessions || sessions.length === 0) { setStreak(0); return; }
    
    const dates = sessions.map(s => new Date(s.date).toISOString().split('T')[0]);
    const uniqueDates = [...new Set(dates)].sort((a, b) => new Date(b) - new Date(a));
    
    const todayStr = new Date().toISOString().split('T')[0];
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    let currentStreak = 0;
    let checkDate = new Date();

    if (uniqueDates[0] !== todayStr && uniqueDates[0] !== yesterdayStr) {
      setStreak(0);
      return;
    }

    let index = 0;
    if (uniqueDates[0] === todayStr) {
      currentStreak = 1;
      index = 1;
      checkDate.setDate(checkDate.getDate() - 1);
    } else if (uniqueDates[0] === yesterdayStr) {
      currentStreak = 1;
      index = 1;
      checkDate.setDate(checkDate.getDate() - 2);
    }

    while (index < uniqueDates.length) {
      const targetStr = checkDate.toISOString().split('T')[0];
      if (uniqueDates[index] === targetStr) {
        currentStreak++;
        index++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        break;
      }
    }
    setStreak(currentStreak);
  };

  const calculateWeeklyProgress = (sessions) => {
    if (!sessions || sessions.length === 0) { setWeeklyProgress(0); return; }
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const count = sessions.filter(s => new Date(s.date) >= sevenDaysAgo).length;
    setWeeklyProgress(count);
  };

  const generateTimeline = (sessions) => {
    if (!sessions || sessions.length === 0) {
      setTimelineEvents([{
        id: 1,
        Icon: Sparkles,
        label: 'Account Active',
        description: 'Welcome to Coach.ai! Your training environment is ready.',
        time: 'Active',
        color: 'bg-slate-100 text-slate-700 border-border'
      }]);
      return;
    }

    const events = sessions.slice(0, 4).map((s, index) => {
      const daysAgo = Math.floor((new Date() - new Date(s.date)) / (1000 * 60 * 60 * 24));
      const timeStr = daysAgo === 0 ? 'Today' : daysAgo === 1 ? 'Yesterday' : `${daysAgo}d ago`;
      const rating = s.score;
      
      let iconColor = 'bg-rose-50 text-rose-600 border-rose-100';
      if (rating >= 80) iconColor = 'bg-emerald-50 text-emerald-600 border-emerald-100';
      else if (rating >= 60) iconColor = 'bg-amber-50 text-amber-600 border-amber-100';

      return {
        id: index + 1,
        Icon: CheckCircle2,
        label: `Practiced ${s.domain}`,
        description: `Score rating: ${rating}% (${s.difficulty})`,
        time: timeStr,
        color: iconColor
      };
    });

    setTimelineEvents(events);
  };

  if (loading || (isSyncing && !statsData)) {
    return (
      <div className="space-y-6 pb-10 animate-fade-in">
        {/* Hero skeleton */}
        <div className="skeleton h-36 rounded-xl" />
        {/* KPI skeletons */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="skeleton h-28 rounded-xl" />
          ))}
        </div>
        {/* Chart + insights skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <div className="lg:col-span-2 skeleton h-[320px] rounded-xl" />
          <div className="skeleton h-[320px] rounded-xl" />
        </div>
      </div>
    );
  }

  const completedCount = Number(statsData?.interviewsCompleted || 0);
  const avgPerformance = Number(statsData?.averagePerformance || 0);
  const totalSeconds   = Number(statsData?.totalPractice || 0); 
  const aiConfidence   = Number(statsData?.aiConfidence || 0);
  
  const formatPracticeTime = (seconds) => {
    const s = Number(seconds || 0);
    const hours = Math.floor(s / 3600);
    const minutes = Math.floor((s % 3600) / 60);
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  const practiceDisplay = totalSeconds > 0 ? formatPracticeTime(totalSeconds) : '0m';

  // Calculate actual trend context based on history
  const averageScoreTrend = (() => {
    if (history.length < 2) return "Established baseline";
    const diff = (history[0]?.score || 0) - (history[1]?.score || 0);
    return diff >= 0 ? `+${diff}% from previous session` : `${diff}% from previous session`;
  })();

  const stats = [
    {
      label: 'Sessions Done',
      value: completedCount,
      displayValue: `${completedCount}`,
      icon: CheckCircle2,
      subtitle: completedCount > 0 ? 'Mock sessions' : 'Inactive',
      trendText: completedCount > 0 ? 'Practice active' : 'No sessions'
    },
    {
      label: 'Average Score',
      value: avgPerformance,
      displayValue: completedCount > 0 ? `${avgPerformance}%` : '--',
      icon: TrendingUp,
      subtitle: completedCount > 0 ? 'Historical scale' : 'No data',
      trendText: averageScoreTrend
    },
    {
      label: 'Practice Time',
      value: totalSeconds,
      displayValue: practiceDisplay,
      icon: Clock,
      subtitle: 'Total duration',
      trendText: 'Accumulated practice'
    },
    {
      label: 'AI Confidence',
      value: aiConfidence,
      displayValue: completedCount > 0 ? `${aiConfidence}%` : '--',
      icon: Sparkles,
      subtitle: 'System readiness',
      trendText: completedCount > 0 ? 'Evaluations calibrated' : 'Awaiting baseline'
    },
  ];

  const recentInterviews = (history || []).slice(0, 3).map(h => ({
    id: h.sessionId,
    role: h.domain,
    date: new Date(h.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
    questions: h.questionsCount || (h.questions ? h.questions.length : 0),
    score: `${h.score}%`,
    scoreColor: h.score >= 80 ? 'text-emerald-600' : h.score >= 60 ? 'text-amber-600' : 'text-rose-600'
  }));

  const scoreData = (history || []).slice(0, 7).reverse().map((h, i) => ({
    name: `S${i + 1}`,
    score: h.score
  }));

  const displayName = user?.name || 'User';
  const firstName = displayName.split(' ')[0];

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={staggerContainer}
      className="space-y-8 pb-12 font-sans"
    >
      {/* Error Notification */}
      {error && (
        <motion.div variants={fadeUp} className="flex items-center gap-3 bg-rose-50 border border-rose-100 p-4 rounded-xl text-rose-600">
          <AlertCircle size={16} />
          <p className="text-xs font-bold">{error}</p>
        </motion.div>
      )}

      {/* ── Dashboard Hero Section ── */}
      <motion.div
        variants={fadeUp}
        custom={0}
        className="premium-card p-6 min-h-[140px] flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative overflow-hidden"
      >
        <div className="absolute right-0 top-0 w-[400px] h-[400px] bg-[#4F46E5]/5 rounded-full blur-[100px] pointer-events-none" />

        <div className="flex items-start gap-4.5 z-10 flex-1">
          <div className="hover:scale-[1.03] hover:shadow transition-all duration-150 rounded-full shrink-0">
            <Avatar src={user?.profileImage} name={user?.name} sizeClass="w-[50px] h-[50px] border border-slate-200 shadow-sm" initialsSizeClass="text-lg" />
          </div>
          <div className="space-y-2 flex-1 min-w-0">
            <h1 className="text-[38px] font-bold tracking-[-0.04em] text-slate-900 leading-[1.1] truncate">
              {getGreeting()}, {firstName} <span className="animate-wave inline-block">👋</span>
            </h1>
            <p className="text-[15px] text-slate-500 font-medium max-w-2xl leading-relaxed">
              {getMotivation(streak, completedCount, avgPerformance)}
            </p>
            <div className="flex flex-wrap items-center gap-4 pt-1.5 text-[12px] text-slate-400 font-semibold uppercase tracking-wider">
              {streak > 0 && (
                <span className="flex items-center gap-1.5">
                  <Flame size={13} className="text-orange-500" fill="currentColor" /> {streak} day streak
                </span>
              )}
              {streak > 0 && <span className="text-slate-300 select-none font-normal">•</span>}
              {completedCount > 0 && (
                <span className="flex items-center gap-1.5">
                  <Brain className="text-[#4F46E5] w-3.5 h-3.5" /> {aiConfidence}% AI confidence
                </span>
              )}
              {completedCount > 0 && <span className="text-slate-300 select-none font-normal">•</span>}
              <span className="flex items-center gap-1.5">
                <Target size={13} className="text-emerald-500" /> {weeklyProgress} of 3 sessions this week
              </span>
            </div>
          </div>
        </div>

        {/* CTA Buttons */}
        <div className="flex items-center gap-3 shrink-0 z-10">
          <button 
            onClick={() => navigate('/history')}
            type="button"
            className="h-[44px] px-5 bg-white border border-slate-200 hover:bg-slate-50 text-[14px] font-semibold text-slate-700 rounded-xl shadow-sm transition-all duration-150 hover:-translate-y-[1px] active:translate-y-0"
          >
            View History
          </button>
          <button 
            onClick={() => navigate('/interview')}
            type="button"
            className="h-[44px] px-[22px] bg-[#4F46E5] hover:bg-[#6366F1] text-white text-[14px] font-semibold rounded-xl shadow-sm transition-all duration-150 hover:-translate-y-[1px] active:translate-y-0 flex items-center gap-1.5"
          >
            <Play size={12} fill="white" className="text-white" />
            Start Interview
          </button>
        </div>
      </motion.div>

      {/* ── Metrics Cards Grid ── */}
      <motion.div variants={staggerContainer} className="grid grid-cols-2 lg:grid-cols-4 gap-5">
        {stats.map((stat, idx) => (
          <StatCardAnimated key={stat.label} stat={stat} idx={idx} dataReady={dataReady} />
        ))}
      </motion.div>

      {/* ── Combined Practice Progress Panel ── */}
      <motion.div variants={fadeUp} custom={2} className="premium-card p-6 min-h-[96px] flex items-center">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center w-full">
          {/* Left Column: Streak details */}
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center border border-orange-100 shrink-0">
              <Flame size={18} fill="currentColor" />
            </div>
            <div>
              <p className="text-[11px] font-bold text-slate-450 uppercase tracking-wider">Streak Status</p>
              <h3 className="text-[16px] font-semibold text-slate-800 leading-tight mt-1">
                {streak === 0 ? "No active practice streak" : `${streak} Day${streak > 1 ? 's' : ''} Practicing`}
              </h3>
              <p className="text-[13px] text-slate-500 mt-1">
                {streak === 0 ? "Complete a mock session today to launch a practice streak." : "Maintain your consistency milestone badge."}
              </p>
            </div>
          </div>

          {/* Right Column: Weekly Target */}
          <div className="flex items-center justify-between gap-6 border-t md:border-t-0 md:border-l border-slate-100 pt-4 md:pt-0 md:pl-8">
            <div className="flex-1 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.08em] font-sans">Weekly target (Goal: 3)</span>
                <span className="text-[15px] font-bold text-[#4F46E5] font-mono">
                  {weeklyProgress}/3 Sessions
                </span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-[#4F46E5] to-[#6366F1] rounded-full transition-all duration-700 ease-out" 
                  style={{ width: `${Math.min((weeklyProgress / 3) * 100, 100)}%` }}
                />
              </div>
            </div>
            <button
              onClick={() => navigate('/interview')}
              className="text-[14px] font-semibold text-[#4F46E5] hover:text-[#6366F1] flex items-center gap-1 group shrink-0"
            >
              Continue practice <ChevronRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>
        </div>
      </motion.div>

      {/* ── Chart + Insights ── */}
      <motion.div variants={fadeUp} custom={3} className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2">
          <ScoreChart data={scoreData} />
        </div>
        <div className="lg:col-span-1">
          <AIInsightCard hasHistory={history.length > 0} />
        </div>
      </motion.div>

      {/* ── Recent Sessions + Timeline ── */}
      <motion.div variants={fadeUp} custom={4} className="grid grid-cols-1 lg:grid-cols-5 gap-5">
        <div className="lg:col-span-3 premium-card p-6 space-y-4">
          <div className="flex items-center justify-between pb-3.5 border-b border-slate-100">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Recent Sessions</h3>
            <button onClick={() => navigate('/history')} className="text-xs font-bold text-[#4F46E5] hover:text-[#6366F1] inline-flex items-center gap-0.5 group">
              View All <ChevronRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>
          <RecentInterviews interviews={recentInterviews} />
        </div>

        <div className="lg:col-span-2 premium-card p-6 space-y-4">
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider border-b border-slate-100 pb-3.5">Activity Timeline</h3>
          <ActivityTimeline events={timelineEvents} />
        </div>
      </motion.div>
    </motion.div>
  );
};

const StatCardAnimated = ({ stat, idx, dataReady }) => {
  const animatedValue = useAnimatedCounter(
    typeof stat.value === 'number' ? stat.value : 0, 
    1000 + idx * 100, 
    dataReady
  );

  const liveDisplay = (() => {
    if (stat.displayValue === '--') return '--';
    if (stat.label === 'Practice Time') return stat.displayValue;
    if (stat.displayValue.endsWith('%')) return `${animatedValue}%`;
    return `${animatedValue}`;
  })();

  const IconComponent = stat.icon;

  const gradients = [
    'from-indigo-500/10 to-[#4F46E5]/0 text-[#4F46E5] border-[#4F46E5]/10',
    'from-violet-500/10 to-[#6366F1]/0 text-[#6366F1] border-[#6366F1]/10',
    'from-emerald-500/10 to-[#10B981]/0 text-emerald-600 border-emerald-500/10',
    'from-amber-500/10 to-orange-500/0 text-amber-600 border-amber-500/10',
  ];
  const gradClass = gradients[idx % gradients.length];

  return (
    <div className="premium-card premium-card-hover p-6 h-[160px] flex flex-col justify-between relative overflow-hidden">
      <div className="absolute -right-4 -top-4 w-16 h-16 bg-gradient-to-br from-[#4F46E5]/5 to-transparent rounded-full blur-xl pointer-events-none" />

      <div className="flex justify-between items-start">
        <div>
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.08em]">{stat.label}</p>
          <h2 className="text-[42px] font-extrabold text-slate-900 tracking-tight mt-3 leading-none tabular-nums font-sans">
            {liveDisplay}
          </h2>
        </div>
        <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${gradClass} border flex items-center justify-center shrink-0 shadow-sm`}>
          <IconComponent size={18} />
        </div>
      </div>
      <p className="text-[13px] text-slate-400 font-medium leading-none truncate">
        {stat.trendText || stat.subtitle}
      </p>
    </div>
  );
};

const Brain = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96-.44 2.5 2.5 0 0 1 0-3.12 3 3 0 0 1 0-4.88 2.5 2.5 0 0 1 0-3.12A2.5 2.5 0 0 1 9.5 2Z"/>
    <path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96-.44 2.5 2.5 0 0 0 0-3.12 3 3 0 0 0 0-4.88 2.5 2.5 0 0 0 0-3.12A2.5 2.5 0 0 0 14.5 2Z"/>
  </svg>
);

export default Dashboard;