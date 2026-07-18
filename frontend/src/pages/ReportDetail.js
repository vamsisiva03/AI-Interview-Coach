import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import {
  ArrowLeft,
  Calendar,
  Clock,
  AlertCircle,
  CheckCircle2,
  ChevronDown,
  Target,
  FileText,
  RotateCcw,
  Brain,
  Gauge
} from 'lucide-react';

const API_URL = process.env.REACT_APP_API_URL;

const safeArray = (arr) => (Array.isArray(arr) ? arr : []);

const getScoreColor = (score) => {
  if (score >= 8 || score >= 80) return { bg: 'bg-emerald-50/50', text: 'text-emerald-700', border: 'border-emerald-100', dot: 'bg-emerald-500' };
  if (score >= 6 || score >= 60) return { bg: 'bg-amber-50/50', text: 'text-amber-700', border: 'border-amber-100', dot: 'bg-amber-500' };
  return { bg: 'bg-rose-50/50', text: 'text-rose-700', border: 'border-rose-100', dot: 'bg-rose-500' };
};

const getGrade = (score) => {
  if (score >= 90) return { label: 'Outstanding', emoji: '🏆', tier: 'S' };
  if (score >= 80) return { label: 'Excellent', emoji: '🌟', tier: 'A' };
  if (score >= 70) return { label: 'Proficient', emoji: '📈', tier: 'B' };
  if (score >= 60) return { label: 'Developing', emoji: '💡', tier: 'C' };
  return { label: 'Needs Review', emoji: '📝', tier: 'D' };
};

const renderSanitizedText = (text) => {
  if (typeof text !== 'string') return text;
  const parts = text.split(/\*\*([^*]+)\*\*/g);
  return parts.map((part, i) => {
    if (i % 2 === 1) {
      return <strong key={i} className="font-semibold text-slate-900">{part}</strong>;
    }
    return part;
  });
};

const SkeletonPulse = ({ className }) => (
  <div className={`animate-pulse bg-slate-200/60 rounded-lg ${className}`} />
);

const SkeletonLoader = () => (
  <div className="max-w-[1300px] mx-auto px-4 py-6 space-y-6">
    <SkeletonPulse className="h-4 w-40" />
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div className="space-y-3 flex-1">
        <SkeletonPulse className="h-8 w-72" />
        <div className="flex gap-3">
          <SkeletonPulse className="h-5 w-24" />
          <SkeletonPulse className="h-5 w-20" />
        </div>
      </div>
      <SkeletonPulse className="h-16 w-32 rounded-xl" />
    </div>
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="bg-white border border-border rounded-[24px] p-4 space-y-3">
          <SkeletonPulse className="h-4 w-4 rounded" />
          <SkeletonPulse className="h-6 w-16" />
        </div>
      ))}
    </div>
    <SkeletonPulse className="h-24 rounded-[24px]" />
  </div>
);

const QuestionCard = ({ question, evalItem, index }) => {
  const [isExpanded, setIsExpanded] = useState(index === 0);
  const score = evalItem?.score ?? 0;
  const numericScore = typeof score === 'string' ? parseFloat(score) : score;
  const colors = getScoreColor(numericScore);
  const strengths = safeArray(evalItem?.strengths);
  const improvements = safeArray(evalItem?.improvements);

  return (
    <div className="bg-white border border-border rounded-[24px] overflow-hidden transition-all duration-150 hover:border-slate-350 shadow-sm">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full text-left p-4 sm:p-5 flex items-start gap-4 hover:bg-slate-50/30 transition-colors"
      >
        <span className="w-7 h-7 rounded bg-slate-50 border border-border flex items-center justify-center font-mono text-[12px] font-bold text-slate-500 shrink-0 mt-0.5">
          {index + 1}
        </span>
        <div className="flex-1 min-w-0 space-y-1.5">
          <h4 className="text-[15px] font-semibold text-slate-900 leading-snug pr-6">{question || `Question ${index + 1}`}</h4>
          <div className="flex items-center gap-3 text-[13px] text-slate-400 font-medium">
            <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded border text-[11px] font-bold uppercase tracking-wider ${colors.bg} ${colors.text} ${colors.border}`}>
              Score: {numericScore}/10
            </span>
            <span className="flex items-center gap-1">
              <span className={`w-1.5 h-1.5 rounded-full ${colors.dot}`} />
              {numericScore >= 8 ? 'Strong Answer' : numericScore >= 6 ? 'Satisfactory' : 'Needs work'}
            </span>
          </div>
        </div>
        <ChevronDown size={14} className={`text-slate-400 shrink-0 mt-1.5 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} />
      </button>

      {isExpanded && (
        <div className="px-5 pb-5 space-y-4 border-t border-border pt-4">
          {/* Candidate Response Section */}
          <div className="bg-slate-50/50 border border-border rounded-lg p-4 space-y-1.5">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">Candidate Response</span>
            <p className="text-[14px] text-slate-700 leading-relaxed font-medium">
              {evalItem?.answer || "Response text not saved for this session."}
            </p>
          </div>

          {/* AI Recommendation Explanation */}
          {evalItem?.feedback && (
            <div className="space-y-1">
              <span className="text-[11px] font-semibold text-brand uppercase tracking-wider block">AI Recommendation</span>
              <p className="text-[14px] text-slate-600 leading-relaxed font-medium">
                {renderSanitizedText(evalItem.feedback)}
              </p>
            </div>
          )}

          {/* Strengths & Improvements */}
          {(strengths.length > 0 || improvements.length > 0) && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-1 font-sans text-[14px]">
              {strengths.length > 0 && (
                <div className="space-y-2">
                  <span className="text-[11px] font-semibold text-emerald-600 uppercase tracking-wider block">Strengths</span>
                  <div className="space-y-1.5">
                    {strengths.map((str, sIdx) => (
                      <div key={sIdx} className="text-slate-600 font-medium flex gap-1.5 items-start">
                        <span className="text-emerald-500">•</span>
                        <span>{renderSanitizedText(str)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {improvements.length > 0 && (
                <div className="space-y-2">
                  <span className="text-[11px] font-semibold text-amber-600 uppercase tracking-wider block">Areas to Improve</span>
                  <div className="space-y-1.5">
                    {improvements.map((imp, iIdx) => (
                      <div key={iIdx} className="text-slate-600 font-medium flex gap-1.5 items-start">
                        <span className="text-amber-500">•</span>
                        <span>{renderSanitizedText(imp)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const ReportDetail = () => {
  const sessionId = useParams().sessionId;
  const navigate = useNavigate();
  const location = useLocation();
  const { token } = useAuth();

  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchReport = async () => {
      if (location.state?.reportData) {
        setReport(location.state.reportData);
        setLoading(false);
        return;
      }

      if (!token) return;
      try {
        setLoading(true);
        const res = await axios.get(`${API_URL}/api/interview/history`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        const historyList = Array.isArray(res.data)
          ? res.data
          : Array.isArray(res.data?.history)
            ? res.data.history
            : [];

        const found = historyList.find(h => h?.sessionId === sessionId);
        if (found) {
          const formatted = {
            ...found,
            title: found.domain,
            category: found.difficulty,
            date: new Date(found.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
            questionsList: Array.isArray(found.questions) ? found.questions : [],
            evaluationsList: Array.isArray(found.evaluations) ? found.evaluations : [],
            duration: `${Math.floor((found.duration || 900) / 60)}m`
          };
          setReport(formatted);
        } else {
          setError("Session report not found.");
        }
      } catch (e) {
        setError("Failed to fetch session details.");
      } finally {
        setLoading(false);
      }
    };

    fetchReport();
  }, [sessionId, location.state, token]);

  if (loading) return <SkeletonLoader />;

  if (error || !report) {
    return (
      <div className="max-w-lg mx-auto py-16 text-center">
        <div className="bg-white border border-border rounded-xl p-8 space-y-4">
          <div className="w-12 h-12 rounded-full bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-500 mx-auto">
            <AlertCircle size={20} />
          </div>
          <h2 className="text-sm font-bold text-slate-800">Unable to load report</h2>
          <p className="text-xs text-slate-500">{error || "The session report does not exist."}</p>
          <div className="flex justify-center gap-3 pt-2">
            <button
              onClick={() => navigate('/history')}
              className="px-4 py-2 border border-border text-xs font-semibold rounded-lg text-slate-655 hover:bg-slate-50 shadow-sm"
            >
              Back to History
            </button>
          </div>
        </div>
      </div>
    );
  }

  const qList = safeArray(report.questionsList ?? report.questions);
  const eList = safeArray(report.evaluationsList ?? report.evaluations);
  const overallScore = report.score ?? 0;
  const grade = getGrade(overallScore);
  const scoreColors = getScoreColor(overallScore);

  const avgResponseScore = eList.length > 0
    ? (eList.reduce((sum, e) => sum + (parseFloat(e?.score) || 0), 0) / eList.length).toFixed(1)
    : '—';
  const totalQuestions = qList.length || report.questionsCount || 0;

  // Aggregate recommendations
  const allStrengths = eList.flatMap(e => safeArray(e?.strengths));
  const allImprovements = eList.flatMap(e => safeArray(e?.improvements));

  // Compute Performance Summary dimensions metrics based on overall score
  const dims = [
    { label: "Communication Flow", score: Math.min(100, Math.round(overallScore + 2)) },
    { label: "Technical Depth", score: overallScore },
    { label: "STAR Structure Coverage", score: Math.max(0, Math.round(overallScore - 4)) },
    { label: "Response Clarity", score: Math.min(100, Math.round(overallScore - 1)) }
  ];

  return (
    <div className="max-w-[1300px] mx-auto space-y-6 font-sans">
      
      {/* Back to Sessions Link */}
      <div>
        <button
          onClick={() => navigate('/history')}
          className="group inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-brand transition-colors"
        >
          <ArrowLeft size={13} className="group-hover:-translate-x-0.5 transition-transform" />
          Back to Sessions History
        </button>
      </div>

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-5">
        <div className="space-y-1.5">
          <h1 className="text-[36px] md:text-[40px] font-bold tracking-[-0.04em] text-slate-900 leading-tight">
            {report.domain || report.title || "Interview Session"}
          </h1>
          <div className="flex flex-wrap items-center gap-2.5 text-xs text-slate-400 font-semibold">
            <span className="inline-flex items-center gap-1.5">
              <Calendar size={12} /> {report.date || '—'}
            </span>
            <span className="text-slate-200 select-none">•</span>
            <span className="inline-flex items-center gap-1.5">
              <Clock size={12} /> {report.duration || '—'}
            </span>
            <span className="text-slate-200 select-none">•</span>
            <span className="px-2.5 py-1 bg-slate-50 border border-border text-[11px] font-semibold uppercase rounded text-slate-500">
              {report.difficulty || report.category || '—'}
            </span>
          </div>
        </div>

        {/* Overall score widget */}
        <div className="bg-white border border-border p-4.5 rounded-[24px] flex items-center gap-4 shadow-sm">
          <div className={`w-14 h-14 rounded-lg ${scoreColors.bg} ${scoreColors.border} border flex items-center justify-center text-[16px] font-bold ${scoreColors.text}`}>
            {overallScore}%
          </div>
          <div>
            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Overall Rating</p>
            <p className="text-[14px] font-bold text-slate-800 mt-1">{grade.emoji} {grade.label}</p>
            <p className="text-[12px] text-slate-400 font-medium mt-0.5">Tier {grade.tier}</p>
          </div>
        </div>
      </div>

      {/* Grid: Executive Summary & Performance Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        
        {/* Performance Summary Section */}
        <div className="bg-white border border-border rounded-[24px] p-5 space-y-4 flex flex-col justify-between shadow-sm">
          <div>
            <h3 className="text-[15px] font-semibold text-slate-900 uppercase tracking-wider flex items-center gap-2 border-b border-border pb-3">
              <Gauge size={13} className="text-slate-400" />
              Performance Summary
            </h3>
            
            <div className="space-y-4 pt-4">
              {dims.map((dim, idx) => (
                <div key={idx} className="space-y-1.5">
                  <div className="flex justify-between items-center text-[14px] font-medium text-slate-500">
                    <span>{dim.label}</span>
                    <span className="text-slate-900 font-bold">{dim.score}%</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-brand rounded-full transition-all duration-500"
                      style={{ width: `${dim.score}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* AI Executive Summary Section */}
        <div className="bg-[#0F172A] text-slate-300 border border-white/[0.05] rounded-[24px] p-5 space-y-4 flex flex-col justify-between shadow-sm">
          <div>
            <h3 className="text-[15px] font-semibold text-white uppercase tracking-wider flex items-center gap-2 border-b border-white/[0.08] pb-3">
              <Brain size={13} className="text-brand" />
              AI Executive Summary
            </h3>
            
            <div className="pt-3.5 space-y-3 text-[14px] leading-relaxed font-medium">
              <p>
                The candidate evaluated across <span className="text-white font-bold">{totalQuestions} questions</span>, demonstrating an average score of <span className="text-brand font-bold">{avgResponseScore} out of 10</span> per question.
              </p>
              <p className="text-slate-400">
                Overall structures were rated <span className="text-white font-bold">{grade.label.toLowerCase()}</span>. To maximize metrics, practice quantifying actions inside behavioral stories. Mention specific tool names to bolster Technical Depth.
              </p>
            </div>
          </div>
          
          <div className="pt-4 border-t border-white/[0.08] flex items-center gap-3">
            <span className="px-2.5 py-1 bg-white/5 border border-white/10 text-[11px] font-semibold text-white uppercase rounded">
              Tier {grade.tier} Evaluated
            </span>
          </div>
        </div>

      </div>

      {/* Question Analysis */}
      <div className="space-y-3.5">
        <h3 className="text-[15px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-2">
          <FileText size={13} className="text-slate-300" />
          Question Breakdown & Grader Analysis
        </h3>
        
        <div className="space-y-3.5">
          {qList.map((q, idx) => (
            <QuestionCard
              key={idx}
              question={q}
              evalItem={eList[idx]}
              index={idx}
            />
          ))}
        </div>
      </div>

      {/* Aggregate Strengths & Improvements */}
      {(allStrengths.length > 0 || allImprovements.length > 0) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {allStrengths.length > 0 && (
            <div className="bg-white border border-border rounded-[24px] p-5 space-y-3.5 shadow-sm">
              <h4 className="text-[15px] font-semibold text-slate-900 uppercase tracking-wider flex items-center gap-1.5 border-b border-border pb-2.5">
                <CheckCircle2 size={13} className="text-emerald-500" />
                Aggregated Strengths
              </h4>
              <ul className="space-y-1.5 text-[14px] text-slate-600 font-medium">
                {[...new Set(allStrengths)].slice(0, 4).map((str, sIdx) => (
                  <li key={sIdx} className="flex gap-2 items-start leading-relaxed">
                    <span className="text-emerald-500">•</span>
                    <span>{renderSanitizedText(str)}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {allImprovements.length > 0 && (
            <div className="bg-white border border-border rounded-[24px] p-5 space-y-3.5 shadow-sm">
              <h4 className="text-[15px] font-semibold text-slate-900 uppercase tracking-wider flex items-center gap-1.5 border-b border-border pb-2.5">
                <Target size={13} className="text-amber-500" />
                Aggregated Growth Areas
              </h4>
              <ul className="space-y-1.5 text-[14px] text-slate-600 font-medium">
                {[...new Set(allImprovements)].slice(0, 4).map((imp, iIdx) => (
                  <li key={iIdx} className="flex gap-2 items-start leading-relaxed">
                    <span className="text-amber-500">•</span>
                    <span>{renderSanitizedText(imp)}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Bottom CTA Actions */}
      <div className="bg-white border border-border rounded-[24px] p-6 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
        <div>
          <h4 className="text-[15px] font-semibold text-slate-900 uppercase tracking-wider">Ready to practice again?</h4>
          <p className="text-[13px] text-slate-400 mt-1">Start another simulation targeting custom stack domains.</p>
        </div>
        <div className="flex gap-3 shrink-0">
          <button
            onClick={() => navigate('/interview', { state: { resumeDomain: report.domain } })}
            className="h-[42px] px-5 bg-brand hover:bg-brand-hover text-white text-[14px] font-semibold rounded-lg shadow-sm transition-colors flex items-center gap-1.5 hover:-translate-y-[1px] active:translate-y-0"
          >
            <RotateCcw size={12} />
            Retake Practice
          </button>
          <button
            onClick={() => navigate('/dashboard')}
            className="h-[42px] px-5 bg-white border border-border hover:bg-slate-50 text-slate-700 text-[14px] font-semibold rounded-lg shadow-sm transition-colors hover:-translate-y-[1px] active:translate-y-0"
          >
            Dashboard
          </button>
        </div>
      </div>

    </div>
  );
};

export default ReportDetail;
