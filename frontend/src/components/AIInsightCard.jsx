import React from 'react';
import { Sparkles, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const AIInsightCard = ({ hasHistory = false }) => {
  const navigate = useNavigate();

  const dimensions = [
    { name: 'Communication', status: hasHistory ? 'Structured' : 'Pending', color: 'bg-emerald-500' },
    { name: 'Technical Depth', status: hasHistory ? 'Sufficient' : 'bg-[#4F46E5]' },
    { name: 'STAR Structure', status: hasHistory ? 'Developing' : 'Pending', color: 'bg-amber-500' }
  ];

  return (
    <div className="premium-card p-6 h-full flex flex-col justify-between">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-4">
        <div className="flex items-center gap-2">
          <Sparkles size={14} className="text-[#4F46E5]" />
          <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wider">AI Coaching Insight</h2>
        </div>
        <span className="inline-flex items-center gap-1 bg-[#4F46E5]/5 text-[#4F46E5] px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider">
          Active Analyst
        </span>
      </div>

      {/* Primary recommendation section */}
      <div className="py-5 space-y-2">
        <p className="text-[15px] font-bold text-slate-900 leading-tight">
          Structure scenario-based answers using the STAR framework.
        </p>
        <p className="text-[14px] text-slate-500 leading-relaxed font-medium">
          Outlining the Situation, Task, Action, and Result explicitly makes behavioral answers punchy, quantifiable, and easy for evaluators to grade.
        </p>
      </div>

      {/* Dimensions section */}
      <div className="space-y-4 pb-5">
        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.08em]">Evaluation Dimensions</p>
        <div className="space-y-3">
          {dimensions.map((dim, idx) => (
            <div key={idx} className="flex items-center justify-between text-[14px]">
              <span className="font-semibold text-slate-700">{dim.name}</span>
              <div className="flex items-center gap-2.5">
                <span className="text-[13px] text-slate-500 font-medium">{dim.status}</span>
                <span className={`w-2 h-2 rounded-full ${hasHistory ? (dim.color || 'bg-[#4F46E5]') : 'bg-slate-300'}`} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col gap-2.5 pt-4 border-t border-slate-100">
        <button
          onClick={() => navigate('/interview')}
          type="button"
          className="w-full h-11 bg-[#4F46E5] hover:bg-[#6366F1] text-white text-[14px] font-semibold rounded-xl shadow-sm transition-all duration-200 hover:-translate-y-[1px] active:translate-y-0 flex items-center justify-center gap-1.5"
        >
          Start Focused Practice
          <ArrowRight size={13} />
        </button>
        <button
          onClick={() => navigate('/history')}
          type="button"
          className="w-full h-11 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-[14px] font-semibold rounded-xl shadow-sm transition-all duration-200 hover:-translate-y-[1px]"
        >
          View Full Analysis
        </button>
      </div>
    </div>
  );
};

export default AIInsightCard;
