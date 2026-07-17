import React from 'react';
import { ArrowRight, PlayCircle, Inbox, Calendar, Award } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const RecentInterviews = ({ interviews = [] }) => {
  const navigate = useNavigate();

  if (interviews.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-10 px-6 text-center">
        <div className="w-14 h-14 rounded-2xl bg-slate-50 flex items-center justify-center border border-slate-100 mb-4">
          <Inbox size={24} className="text-slate-300" />
        </div>
        <h3 className="text-sm font-bold text-slate-800 mb-1">No interviews yet</h3>
        <p className="text-xs text-slate-500 max-w-[220px] mb-5 leading-relaxed">
          Start your first AI practice session to begin tracking performance.
        </p>
        <button
          onClick={() => navigate('/interview')}
          className="flex items-center gap-2 bg-gradient-to-r from-primary to-secondary text-white text-xs font-bold px-5 py-2.5 rounded-xl shadow-sm hover:shadow-glow-indigo hover:-translate-y-0.5 transition-all duration-200 active:scale-95"
        >
          <PlayCircle size={14} />
          Start Practice Session
        </button>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      {/* Header */}
      <div className="grid grid-cols-[2fr_1.2fr_0.8fr_0.8fr_0.8fr] gap-4 px-4 py-2 border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
        <span>Role</span>
        <span>Date</span>
        <span className="hidden sm:block">Questions</span>
        <span>Score</span>
        <span className="text-right">Action</span>
      </div>

      {/* Rows */}
      <div className="divide-y divide-slate-50">
        {interviews.map((item) => (
          <div
            key={item.id}
            onClick={() => navigate('/history')}
            className="grid grid-cols-[2fr_1.2fr_0.8fr_0.8fr_0.8fr] gap-4 items-center px-4 py-3 hover:bg-primary/[0.02] cursor-pointer group transition-all duration-200 border-l-2 border-transparent hover:border-primary/40"
          >
            {/* Role */}
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-8 h-8 rounded-lg bg-primary/5 border border-primary/10 flex items-center justify-center font-bold text-xs text-primary shrink-0">
                {(item.role || 'IN').slice(0, 2).toUpperCase()}
              </div>
              <span className="text-xs font-bold text-slate-800 truncate group-hover:text-primary transition-colors">
                {item.role || item.title || 'Interview'}
              </span>
            </div>

            {/* Date */}
            <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
              <Calendar size={12} className="text-slate-400 shrink-0" />
              <span>{item.date || '—'}</span>
            </div>

            {/* Questions */}
            <div className="text-xs font-semibold text-slate-600 hidden sm:block">
              {item.questions ?? '—'} Qs
            </div>

            {/* Score */}
            <div className="flex items-center">
              <span className={`inline-flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-md ${
                parseInt(item.score) >= 80 
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                  : parseInt(item.score) >= 60
                  ? 'bg-amber-50 text-amber-700 border border-amber-100'
                  : 'bg-rose-50 text-rose-700 border border-rose-100'
              }`}>
                <Award size={11} className="shrink-0" />
                {item.score || '—'}
              </span>
            </div>

            {/* Action */}
            <div className="text-right">
              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-primary opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                Review <ArrowRight size={12} className="group-hover:translate-x-0.5 transition-transform" />
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RecentInterviews;
