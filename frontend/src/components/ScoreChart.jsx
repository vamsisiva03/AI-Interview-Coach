import React from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import { BarChart3 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const ScoreChart = ({ data = [] }) => {
  const navigate = useNavigate();
  const hasData = data.length > 0;
  const isSingleSession = data.length === 1;

  const trend = (() => {
    if (data.length < 2) return { text: "Stable", type: "neutral" };
    const first = data[0].score || 0;
    const last = data[data.length - 1].score || 0;
    if (last > first) return { text: "Improving", type: "positive" };
    if (last < first) return { text: "Declining", type: "negative" };
    return { text: "Stable", type: "neutral" };
  })();

  const avgScore = hasData
    ? Math.round(data.reduce((sum, d) => sum + (d.score || 0), 0) / data.length)
    : 0;

  /* Custom tooltip */
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const score = payload[0].value;
      return (
        <div className="bg-white border border-slate-100 rounded-xl px-3.5 py-2.5 shadow-xl">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">{label}</p>
          <p className="text-[16px] font-extrabold text-[#4F46E5] tabular-nums">{score}%</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="premium-card h-full flex flex-col justify-between">
      {/* Header */}
      <div className="flex items-center justify-between p-5 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-slate-50 border border-slate-100 text-slate-600 flex items-center justify-center">
            <BarChart3 size={15} />
          </div>
          <div>
            <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wider leading-none mb-1.5">Performance Analytics</h2>
            <p className="text-[13px] text-slate-400 font-medium leading-none">Score trend over sessions</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {hasData && avgScore > 0 && (
            <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full border bg-slate-50 text-slate-600 border-slate-100 uppercase tracking-wider">
              Avg: {avgScore}%
            </span>
          )}
          {hasData && !isSingleSession && (
            <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border uppercase tracking-wider ${
              trend.type === 'positive' 
                ? 'bg-emerald-50 text-emerald-700 border-emerald-100' 
                : trend.type === 'negative'
                  ? 'bg-rose-50 text-rose-700 border-rose-100'
                  : 'bg-slate-50 text-slate-700 border-slate-100'
            }`}>
              {trend.text}
            </span>
          )}
        </div>
      </div>

      {/* Chart or empty/single state */}
      <div className="p-5 flex-1 flex flex-col justify-center min-h-[300px]">
        {!hasData ? (
          <div className="w-full flex flex-col items-center justify-center text-center py-6">
            <div className="w-12 h-12 rounded-xl bg-slate-50 flex items-center justify-center border border-slate-100 mb-3">
              <BarChart3 size={20} className="text-slate-350" />
            </div>
            <p className="text-[15px] font-semibold text-slate-800 mb-1.5">No analytics yet</p>
            <p className="text-[14px] text-slate-400 max-w-[280px] leading-relaxed mb-5">
              Complete your first mock interview to unlock performance tracking and score insights.
            </p>
            <button
              onClick={() => navigate('/interview')}
              className="h-10 px-5 bg-[#4F46E5] hover:bg-[#6366F1] text-white text-[14px] font-semibold rounded-xl shadow-sm transition-all duration-200 hover:-translate-y-[1px]"
            >
              Start Interview
            </button>
          </div>
        ) : isSingleSession ? (
          <div className="w-full flex flex-col items-center justify-center text-center py-6">
            <div className="text-[36px] font-bold text-slate-900 tracking-tight leading-none mb-1.5 tabular-nums">{data[0].score}%</div>
            <p className="text-[12px] text-slate-500 font-semibold uppercase tracking-wider">Initial Baseline Score</p>
            <div className="text-[13px] text-slate-500 font-medium mt-6 bg-slate-50 border border-slate-100 px-4 py-2.5 rounded-xl max-w-[300px]">
              Complete another interview to unlock trend analysis.
            </div>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="scoreGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--brand)" stopOpacity={0.12} />
                  <stop offset="95%" stopColor="var(--brand)" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
              <XAxis
                dataKey="name"
                tick={{ fontSize: 11, fill: '#9CA3AF', fontWeight: 500, fontFamily: 'Inter, sans-serif' }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                domain={[0, 100]}
                tick={{ fontSize: 11, fill: '#9CA3AF', fontWeight: 500, fontFamily: 'Inter, sans-serif' }}
                axisLine={false}
                tickLine={false}
                tickCount={5}
              />
              <Tooltip content={<CustomTooltip />} />
              {avgScore > 0 && (
                <ReferenceLine
                  y={avgScore}
                  stroke="#CBD5E1"
                  strokeDasharray="4 4"
                  strokeWidth={1}
                />
              )}
              <Area
                type="monotone"
                dataKey="score"
                stroke="var(--brand)"
                strokeWidth={2}
                fill="url(#scoreGrad)"
                dot={{ r: 3, fill: 'var(--brand)', strokeWidth: 1.5, stroke: '#fff' }}
                activeDot={{ r: 5, fill: 'var(--brand)', stroke: '#fff', strokeWidth: 2 }}
                animationDuration={800}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
};

export default ScoreChart;
