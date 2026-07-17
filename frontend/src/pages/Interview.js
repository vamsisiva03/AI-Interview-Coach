import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Play, 
  Mic, 
  StopCircle, 
  ChevronRight, 
  Award, 
  Clock, 
  AlertCircle,
  Loader2,
  CheckCircle2,
  Sparkles,
  Search,
  X
} from 'lucide-react';

const evaluationSteps = [
  "Analyzing Answer...",
  "Evaluating Technical Knowledge...",
  "Checking STAR Framework...",
  "Generating Feedback..."
];

const SUGGESTED_ROLES = [
  "Java Developer",
  "Python Developer",
  "Frontend Developer",
  "React Developer",
  "Backend Developer",
  "Full Stack Developer",
  "AI/ML Engineer",
  "Data Scientist",
  "DevOps Engineer",
  "Android Developer",
  "Software Engineer",
  "Cloud Engineer"
];

const escapeRegExp = (string) => {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
};

const renderSanitizedText = (text) => {
  if (!text) return "";
  const parts = text.split(/\*\*([^*]+)\*\*/g);
  if (parts.length === 1) return text;
  return parts.map((part, i) => {
    if (i % 2 === 1) {
      return <strong key={i} className="font-semibold text-slate-900">{part}</strong>;
    }
    return part;
  });
};

function Interview() {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [view, setView] = useState("SETUP");
  const [domain, setDomain] = useState("");
  const [difficulty, setDifficulty] = useState("Intermediate");
  const [sessionId, setSessionId] = useState(null);

  const [suggestionsOpen, setSuggestionsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const dropdownRef = React.useRef(null);
  const inputRef = React.useRef(null);

  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answer, setAnswer] = useState("");
  const [answersList, setAnswersList] = useState([]); // Store candidate responses in-memory
  const [result, setResult] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [reportData, setReportData] = useState(null);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [toast, setToast] = useState(null);
  const [evaluationStep, setEvaluationStep] = useState(0);

  const recognitionRef = React.useRef(null);

  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  const filteredSuggestions = domain.trim() === ""
    ? SUGGESTED_ROLES
    : SUGGESTED_ROLES.filter(role => 
        role.toLowerCase().includes(domain.toLowerCase())
      );

  // Handle click outside dropdown
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setSuggestionsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleKeyDown = (e) => {
    if (!suggestionsOpen) {
      if (e.key === 'ArrowDown') {
        setSuggestionsOpen(true);
      }
      return;
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightedIndex((prev) => 
        prev < filteredSuggestions.length - 1 ? prev + 1 : 0
      );
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightedIndex((prev) => 
        prev > 0 ? prev - 1 : filteredSuggestions.length - 1
      );
    } else if (e.key === 'Enter') {
      if (filteredSuggestions.length > 0 && highlightedIndex >= 0 && highlightedIndex < filteredSuggestions.length) {
        e.preventDefault();
        setDomain(filteredSuggestions[highlightedIndex]);
        setSuggestionsOpen(false);
      }
    } else if (e.key === 'Escape') {
      setSuggestionsOpen(false);
    }
  };

  const handleSelectSuggestion = (role) => {
    setDomain(role);
    setSuggestionsOpen(false);
  };

  const handleClearInput = (e) => {
    e.stopPropagation();
    setDomain("");
    setSuggestionsOpen(true);
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const renderHighlightedText = (text, highlight) => {
    if (!highlight) return <span>{text}</span>;
    const parts = text.split(new RegExp(`(${escapeRegExp(highlight)})`, 'gi'));
    return (
      <span>
        {parts.map((part, i) => 
          part.toLowerCase() === highlight.toLowerCase()
            ? <mark key={i} className="bg-amber-100 text-amber-900 rounded-[2px] font-semibold">{part}</mark>
            : part
        )}
      </span>
    );
  };

  useEffect(() => {
    let interval;
    if (isLoading && view === "ONGOING") {
      setEvaluationStep(0);
      interval = setInterval(() => {
        setEvaluationStep((prev) => (prev < 3 ? prev + 1 : prev));
      }, 1200);
    }
    return () => clearInterval(interval);
  }, [isLoading, view]);

  const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";
  const apiBase = `${API_URL}/api/interview`;

  const getAuthHeaders = useCallback(() => ({
    headers: { Authorization: `Bearer ${token}` }
  }), [token]);

  useEffect(() => {
    let interval;
    if (view === "ONGOING") {
      interval = setInterval(() => {
        setTimeElapsed((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [view]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60).toString().padStart(2, "0");
    const secs = (seconds % 60).toString().padStart(2, "0");
    return `${mins}:${secs}`;
  };

  const startInterview = async () => {
    if (domain.trim() === "") return;

    setIsLoading(true);
    setToast(null);
    try {
      const res = await axios.post(`${apiBase}/start-interview`, {
        domain,
        difficulty
      }, getAuthHeaders());
      
      const sid = res.data.sessionId;
      setSessionId(sid);
      
      setTimeElapsed(0);
      setAnswersList([]);
      setView("ONGOING");
      
      const warmUpQ = `To start our interview, could you briefly describe your background and experience working with ${domain}?`;
      setQuestions([warmUpQ]);
      setCurrentQuestionIndex(0);
      setIsLoading(false);
      
      axios.post(`${apiBase}/generate-questions`, { sessionId: sid, count: 10 }, getAuthHeaders())
        .then(qRes => {
          if (qRes.data.success) {
            setQuestions([warmUpQ, ...qRes.data.questions]);
          }
        })
        .catch(() => {});

    } catch (error) {
      setToast({ type: 'error', title: 'Start Failed', message: error.response?.data?.error || error.message || 'Failed to start interview.' });
      setTimeout(() => setToast(null), 4000);
      setIsLoading(false);
    }
  };

  const nextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setAnswer("");
      setResult(null);
    } else {
      endInterview();
    }
  };

  const startSpeechRecognition = () => {
    if (!("webkitSpeechRecognition" in window) && !("SpeechRecognition" in window)) {
      setToast({ type: 'error', title: 'Not Supported', message: 'Speech recognition is not supported in this browser.' });
      setTimeout(() => setToast(null), 4000);
      return;
    }

    const SpeechRecognitionClass = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognitionClass();
    recognition.lang = "en-US";
    recognition.continuous = true;
    recognition.interimResults = true;

    recognition.onstart = () => setIsRecording(true);
    recognition.onresult = (event) => {
      let transcript = "";
      for (let i = 0; i < event.results.length; i++) {
        transcript += event.results[i][0].transcript;
      }
      setAnswer(transcript);
    };
    recognition.onend = () => setIsRecording(false);
    recognition.onerror = () => setIsRecording(false);
    recognition.start();
    recognitionRef.current = recognition;
  };

  const stopSpeechRecognition = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsRecording(false);
    }
  };

  const evaluateAnswer = async () => {
    if (answer.trim() === "") return;

    setIsLoading(true);
    setToast(null);
    try {
      const res = await axios.post(`${apiBase}/evaluate-answer`, {
        sessionId,
        question: questions[currentQuestionIndex],
        answer
      }, getAuthHeaders());
      
      setResult(res.data);
      
      // Save candidate's response text matching current question index
      setAnswersList(prev => {
        const copy = [...prev];
        copy[currentQuestionIndex] = answer;
        return copy;
      });
    } catch (error) {
      const errMsg = error.response?.data?.error || error.response?.data?.message || error.message || 'Failed to evaluate answer. Please try again.';
      setToast({ type: 'error', title: 'Grading Error', message: errMsg });
      setTimeout(() => setToast(null), 5000);
    }
    setIsLoading(false);
  };

  const endInterview = async () => {
    setIsLoading(true);
    setToast(null);
    try {
      const res = await axios.get(`${apiBase}/report/${sessionId}`, getAuthHeaders());
      const fullReport = res.data;
      setReportData(fullReport);
      
      try {
        // Map evaluation items to append frontend captured answer text
        const mappedEvaluations = (fullReport?.evaluations || []).map((evalItem, idx) => ({
          ...evalItem,
          answer: answersList[idx] || ""
        }));

        await axios.post(`${apiBase}/save-report`, {
          sessionId,
          duration: timeElapsed,
          score: calculateAverageScore(mappedEvaluations),
          evaluations: mappedEvaluations,
          questions: fullReport?.questions || []
        }, getAuthHeaders());
      } catch (saveError) {
        console.error("[save-report] failed:", saveError);
      }

      setView("SUMMARY");
    } catch (error) {
      setToast({ type: 'error', title: 'Report Error', message: 'Error generating report. Please try again.' });
      setTimeout(() => setToast(null), 4000);
    }
    setIsLoading(false);
  };

  const calculateAverageScore = (evals) => {
    if (!evals || evals.length === 0) return 0;
    const scores = evals.map(e => parseInt(e?.score) || 0);
    const sum = scores.reduce((a, b) => a + b, 0);
    return Math.round((sum / scores.length) * 10);
  };

  const progressPercent = questions.length > 0 
    ? Math.round(((currentQuestionIndex + (result ? 1 : 0)) / questions.length) * 100) 
    : 0;

  const wordCount = answer.trim() === "" ? 0 : answer.trim().split(/\s+/).length;
  const charCount = answer.length;

  const getConfidenceLevel = (wCount) => {
    if (wCount === 0) return { pct: 0, text: 'Awaiting Input', color: 'text-slate-400' };
    if (wCount < 15) return { pct: 20, text: 'Under-detailed', color: 'text-rose-500' };
    if (wCount < 40) return { pct: 55, text: 'Calibrating...', color: 'text-amber-500' };
    if (wCount < 80) return { pct: 85, text: 'Good Structure', color: 'text-indigo-500' };
    return { pct: 95, text: 'Substantive', color: 'text-emerald-500' };
  };
  const conf = getConfidenceLevel(wordCount);

  const lowerAnswer = answer.toLowerCase();
  const starChecklist = {
    situation: /\b(when\s+i|role|project|team|company|working|time|background|assigned)\b/i.test(lowerAnswer),
    task: /\b(task|goal|challenge|problem|objective|requirement|needed|target|issue)\b/i.test(lowerAnswer),
    action: /\b(i\s+implemented|i\s+designed|i\s+created|i\s+wrote|i\s+managed|i\s+led|i\s+solved|i\s+optimized|using|resolved|we\s+built|i\s+built)\b/i.test(lowerAnswer),
    result: /\b(result|outcome|increased|decreased|achieved|improved|percent|%|metrics|delivered|reduced|saved)\b/i.test(lowerAnswer)
  };

  const getContextualTips = (domName) => {
    const dLower = domName ? domName.toLowerCase() : '';
    if (dLower.includes('react') || dLower.includes('frontend') || dLower.includes('javascript')) {
      return [
        "Detail state hooks and optimizations.",
        "Talk about web performance features.",
        "Outline modular layout strategies."
      ];
    }
    if (dLower.includes('backend') || dLower.includes('database') || dLower.includes('sql') || dLower.includes('api')) {
      return [
        "Explain query plans and latency checks.",
        "Describe concurrency controls.",
        "Talk about security protocols."
      ];
    }
    return [
      "Explain using Situation-Task-Action-Result.",
      "Quantify historical indicators clearly.",
      "Mention standard engineering guidelines."
    ];
  };
  const tips = getContextualTips(domain);

  return (
    <div className="space-y-6 pb-12 font-sans">
      {/* ── SETUP VIEW ── */}
      {view === "SETUP" && (
        <div className="min-h-[75vh] flex flex-col items-center justify-center pt-8 pb-16 relative overflow-hidden px-4">
          {/* Ambient background glow */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-indigo-500/5 via-transparent to-transparent pointer-events-none -z-10" />
          
          <div className="w-full max-w-[840px] mx-auto space-y-6 text-center z-10">
            {/* Pill */}
            <div>
              <span className="inline-flex items-center px-3 py-1 rounded-full bg-[#4F46E5]/5 border border-[#4F46E5]/10 text-[#4F46E5] text-[11px] font-[650] tracking-[0.08em] uppercase mb-4">
                Set Up Your Interview
              </span>
              <h1 className="text-[48px] md:text-[56px] font-extrabold tracking-[-0.04em] text-slate-900 leading-[1.05]">
                Start New <span className="text-[#4F46E5]">Interview.</span>
              </h1>
              <p className="text-[15px] text-slate-500 font-medium max-w-xl mx-auto mt-3.5 leading-relaxed">
                Select your target role and complexity level. The AI agent generates customized challenges.
              </p>
            </div>

            {/* Setup card */}
            <div className="premium-card p-8 space-y-6 text-left">
              {/* Domain Input */}
              <div className="space-y-2.5">
                <label htmlFor="domain" className="block text-[11px] font-[650] tracking-[0.08em] uppercase text-slate-400">
                  Job Role / Domain
                </label>
                <div className="relative group w-full" ref={dropdownRef}>
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#4F46E5] transition-colors" size={16} />
                  <input
                    ref={inputRef}
                    id="domain"
                    type="text"
                    className="w-full premium-input pl-10 pr-10 focus:outline-none font-medium"
                    placeholder="Search or select a role... e.g. Frontend Developer"
                    value={domain}
                    onChange={(e) => {
                      setDomain(e.target.value);
                      setSuggestionsOpen(true);
                      setHighlightedIndex(0);
                    }}
                    onFocus={() => {
                      setSuggestionsOpen(true);
                      setHighlightedIndex(0);
                    }}
                    onKeyDown={handleKeyDown}
                    spellCheck={false}
                    autoCorrect="off"
                    autoCapitalize="off"
                    autoComplete="off"
                  />

                  {domain && (
                    <button
                      type="button"
                      onClick={handleClearInput}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-450 hover:text-slate-700 transition-colors focus:outline-none"
                    >
                      <X size={16} />
                    </button>
                  )}

                  <AnimatePresence>
                    {suggestionsOpen && filteredSuggestions.length > 0 && (
                      <motion.div
                        initial={{ opacity: 0, y: -4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -4 }}
                        transition={{ duration: 0.15, ease: "easeOut" }}
                        className="absolute left-0 right-0 mt-2 bg-white border border-slate-200/80 rounded-xl shadow-xl max-h-60 overflow-y-auto z-50 divide-y divide-slate-50"
                      >
                        <ul className="py-1">
                          {filteredSuggestions.map((role, idx) => {
                            const isHighlighted = idx === highlightedIndex;
                            return (
                              <li
                                key={role}
                                className={`px-4 py-2.5 text-sm cursor-pointer transition-colors flex items-center justify-between font-sans ${
                                  isHighlighted 
                                    ? 'bg-slate-50 text-slate-900 font-semibold' 
                                    : 'text-slate-600 hover:bg-slate-50/50'
                                }`}
                                onClick={() => handleSelectSuggestion(role)}
                                onMouseEnter={() => setHighlightedIndex(idx)}
                              >
                                <span>{renderHighlightedText(role, domain)}</span>
                                {domain && role.toLowerCase() === domain.toLowerCase() && (
                                  <CheckCircle2 size={13} className="text-[#4F46E5]" />
                                )}
                              </li>
                            );
                          })}
                        </ul>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              {/* Difficulty */}
              <div className="space-y-2.5">
                <label className="block text-[11px] font-[650] tracking-[0.08em] uppercase text-slate-400">
                  Interview Difficulty
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {['Beginner', 'Intermediate', 'Advanced'].map((level) => {
                    const isSelected = difficulty === level;
                    return (
                      <button
                        key={level}
                        onClick={() => setDifficulty(level)}
                        type="button"
                        className={`relative flex flex-col items-center justify-center py-3.5 rounded-xl border text-center transition-all duration-200 hover:-translate-y-[1px] focus:outline-none ${
                          isSelected 
                            ? 'bg-[#0F172A] text-white border-[#0F172A] font-semibold shadow-[0_0_16px_rgba(79,70,229,0.2)]' 
                            : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-slate-350'
                        }`}
                      >
                        {isSelected && (
                          <CheckCircle2 size={12} className="text-[#6366F1] absolute top-2.5 right-2.5 shrink-0 animate-fade-in" />
                        )}
                        <span className="text-xs font-bold">{level}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Live Selection Summary */}
              {domain.trim() !== "" && (
                <div className="bg-slate-50 border border-slate-100 rounded-xl p-3.5 text-xs text-slate-500 flex justify-between items-center font-sans select-none animate-[fade-in_0.2s_ease-out] hover:border-slate-200 transition-colors">
                  <div>
                    <span className="font-bold text-[10px] uppercase text-slate-400 block tracking-wider leading-none">Target stack</span>
                    <span className="font-semibold text-slate-800 text-[13px] mt-1.5 block leading-none">{domain}</span>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-[10px] uppercase text-slate-400 block tracking-wider leading-none">Difficulty</span>
                    <span className="font-semibold text-slate-800 text-[13px] mt-1.5 block leading-none">{difficulty}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Launch button outside the card matching card width */}
            <div className="pt-1">
              <button
                onClick={startInterview}
                disabled={!domain.trim() || isLoading}
                className={`w-full premium-btn font-semibold text-sm flex items-center justify-center gap-1.5 group select-none transition-all duration-200 focus:outline-none ${
                  !domain.trim() || isLoading
                    ? 'bg-[#4F46E5]/40 text-white opacity-70 cursor-not-allowed'
                    : 'bg-[#4F46E5] hover:bg-[#6366F1] text-white shadow-sm hover:shadow-md'
                }`}
              >
                {isLoading ? (
                  <Loader2 className="animate-spin text-white" size={14} />
                ) : (
                  <>
                    <Play size={12} fill="white" className="text-white transition-transform duration-150 group-hover:translate-x-[2px] shrink-0" />
                    Start Interview
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── ONGOING VIEW ── */}
      {view === "ONGOING" && (
        <div className="w-full max-w-[1450px] mx-auto space-y-6 pt-2">
          
          {/* Top Session Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
            <div>
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-brand/5 border border-brand/10 text-brand text-[11px] font-semibold uppercase tracking-wider font-sans">
                Live Practice
              </span>
              <h1 className="text-xl font-bold text-slate-900 mt-1.5">
                {domain ? `${domain} Session` : 'Interview Session'}
              </h1>
            </div>
            
            <div className="flex flex-wrap items-center gap-6 text-[13px] text-slate-500 font-semibold font-sans">
              <div>
                <span className="text-[11px] text-slate-400 font-bold uppercase tracking-wider block">Progress</span>
                <span className="text-slate-900 font-bold mt-0.5 block">{currentQuestionIndex + 1} of {questions.length}</span>
              </div>
              <div className="w-[1px] h-6 bg-border hidden sm:block" />
              <div>
                <span className="text-[11px] text-slate-400 font-bold uppercase tracking-wider block">Duration</span>
                <span className="text-slate-900 font-bold mt-0.5 block font-mono">{formatTime(timeElapsed)}</span>
              </div>
              <div className="w-[1px] h-6 bg-border hidden sm:block" />
              <button
                onClick={endInterview}
                type="button"
                className="h-9 px-4 border border-red-200 hover:bg-rose-50 text-rose-600 rounded-lg text-xs font-semibold shadow-sm transition-colors"
              >
                End Session
              </button>
            </div>
          </div>

          {/* Main workspace layout */}
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_330px] xl:grid-cols-[1fr_350px] gap-8 items-start">
            
            {/* Left Column */}
            <div className="space-y-5">
              
              {/* Question Text */}
              <div className="py-4">
                <span className="text-[12px] font-semibold text-brand uppercase tracking-wider block mb-2">
                  Question {currentQuestionIndex + 1}
                </span>
                <h2 className="text-[30px] md:text-[34px] font-bold text-slate-900 leading-snug font-sans">
                  {isLoading && questions.length === 0 ? (
                    <span className="flex items-center gap-2 text-slate-400">
                      <Loader2 className="animate-spin text-brand" size={18} /> Preparing questions...
                    </span>
                  ) : questions[currentQuestionIndex]}
                </h2>
              </div>

              {/* Textarea Workspace */}
              <div className="bg-white border border-border rounded-xl p-6 space-y-4">
                <div className="relative">
                  <textarea
                    id="response"
                    value={answer}
                    onChange={(e) => setAnswer(e.target.value)}
                    placeholder="Draft your detailed technical response here... Use the STAR method to organize Situation, Task, Action, and Result."
                    className="w-full bg-slate-50 border border-border focus:bg-white rounded-lg p-6 min-h-[280px] h-[280px] md:h-[300px] text-slate-900 text-[16px] focus:outline-none focus:ring-1 focus:ring-brand focus:border-brand transition-all placeholder:text-slate-400 resize-y leading-relaxed font-medium"
                  />
                  
                  {/* Dictation triggers */}
                  <div className="absolute bottom-4 right-4">
                    {isRecording ? (
                      <button 
                        onClick={stopSpeechRecognition}
                        type="button"
                        className="flex items-center gap-1.5 bg-rose-50 text-rose-600 border border-rose-200 px-3 py-1.5 rounded-lg text-[12px] font-semibold uppercase tracking-wider hover:bg-rose-100 transition-colors"
                      >
                        <StopCircle size={12} className="animate-pulse" />
                        <span>Stop Voice</span>
                      </button>
                    ) : (
                      <button 
                        onClick={startSpeechRecognition}
                        type="button"
                        className="bg-white border border-border text-slate-655 px-3 py-1.5 rounded-lg text-[12px] font-semibold uppercase tracking-wider hover:bg-slate-50 hover:border-slate-350 transition-colors flex items-center gap-1.5 shadow-sm active:scale-98"
                      >
                        <Mic size={12} className="text-brand" />
                        Voice Dictate
                      </button>
                    )}
                  </div>
                </div>

                <div className="flex justify-between items-center text-[12px] font-semibold text-slate-400 pt-1">
                  <div className="flex gap-4">
                    <span>{wordCount} Words</span>
                    <span>{charCount} Characters</span>
                  </div>
                  <span className="italic text-slate-405 font-medium">
                    Aim for 50–150 words
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={evaluateAnswer}
                  disabled={!answer.trim() || isLoading || result}
                  className="flex-1 h-11 bg-brand hover:bg-brand-hover disabled:opacity-50 text-white rounded-lg font-semibold transition-colors text-[14px] flex items-center justify-center gap-1.5"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="animate-spin text-white" size={13} />
                      <span>Grading Answer...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles size={13} />
                      <span>Submit Response for AI Grading</span>
                    </>
                  )}
                </button>
                <button
                  onClick={nextQuestion}
                  disabled={!result || isLoading}
                  className="flex-1 h-11 bg-white border border-border hover:bg-slate-50 text-slate-700 rounded-lg font-semibold transition-all text-[14px] flex items-center justify-center gap-1 shadow-sm disabled:opacity-40 disabled:pointer-events-none"
                >
                  <span>{currentQuestionIndex < questions.length - 1 ? "Next Question" : "Finish Interview"}</span>
                  <ChevronRight size={13} />
                </button>
              </div>

              {/* IMMERSIVE STEP LOADERS */}
              {isLoading && (
                <div className="bg-white border border-border rounded-xl p-6 text-center space-y-3.5 animate-fade-in-up">
                  <div className="flex items-center justify-center">
                    <Loader2 className="animate-spin text-brand" size={24} />
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-slate-800 tracking-tight">
                      {evaluationSteps[evaluationStep]}
                    </p>
                    <p className="text-[11px] text-slate-400 font-medium">
                      AI is evaluating structures, terminology choice, and STAR structure indicators.
                    </p>
                  </div>
                </div>
              )}

              {/* GRADED AI FEEDBACK */}
              {result && (
                <div className="bg-white border border-border rounded-xl p-6 space-y-5 animate-fade-in-up">
                  <div className="flex items-center gap-3 border-b border-border pb-4">
                    <div className="w-12 h-12 rounded-lg bg-brand/5 border border-brand/10 text-brand flex items-center justify-center font-bold text-sm">
                      {result.score}/10
                    </div>
                    <div>
                      <p className="text-[12px] font-bold uppercase tracking-wider text-slate-400">Response Graded</p>
                      <h3 className="text-[15px] font-bold text-slate-800 mt-0.5">
                        {result.score >= 8 ? '🎉 Strong Answer Structure' : result.score >= 6 ? '👍 Satisfactory Response' : '💡 Key Adjustments Recommended'}
                      </h3>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm font-medium font-sans">
                    <div className="space-y-2.5">
                      <p className="font-bold text-emerald-600 uppercase tracking-wider text-[12px] flex items-center gap-1.5">
                        <CheckCircle2 size={12} /> Strengths
                      </p>
                      <div className="space-y-2">
                        {result.strengths?.map((s, i) => (
                          <div key={i} className="bg-emerald-50/30 border border-emerald-100/50 p-3.5 rounded-lg text-slate-700 text-[13px] leading-relaxed">
                            {renderSanitizedText(s)}
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="space-y-2.5">
                      <p className="font-bold text-amber-600 uppercase tracking-wider text-[12px] flex items-center gap-1.5">
                        <AlertCircle size={12} /> Areas to Improve
                      </p>
                      <div className="space-y-2">
                        {result.improvements?.map((im, i) => (
                          <div key={i} className="bg-amber-50/30 border border-amber-100/50 p-3.5 rounded-lg text-slate-700 text-[13px] leading-relaxed">
                            {renderSanitizedText(im)}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Right AI Coach Panel */}
            <div>
              <div className="bg-[#0F172A] text-slate-400 border border-white/[0.05] rounded-xl p-6 space-y-5 font-sans">
                
                {/* Status Indicator */}
                <div className="flex items-center justify-between pb-1.5 border-b border-white/[0.06]">
                  <span className="text-[12px] font-semibold text-white uppercase tracking-wider">AI Assistant</span>
                  <span className="flex h-2.5 w-2.5 relative shrink-0">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                  </span>
                </div>

                {/* Metrics strip */}
                <div className="grid grid-cols-3 gap-2.5 text-center text-[13px] py-1 border-b border-white/[0.06]">
                  <div>
                    <span className="text-[11px] text-slate-500 uppercase font-bold tracking-wider block">Progress</span>
                    <span className="text-[14px] font-bold text-white block mt-1">{progressPercent}%</span>
                  </div>
                  <div className="border-x border-white/[0.08]">
                    <span className="text-[11px] text-slate-500 uppercase font-bold tracking-wider block">Timer</span>
                    <span className="text-[14px] font-bold text-white block mt-1 font-mono">{formatTime(timeElapsed)}</span>
                  </div>
                  <div>
                    <span className="text-[11px] text-slate-500 uppercase font-bold tracking-wider block">Quality</span>
                    <span className={`text-[14px] font-bold block mt-1 ${conf.color}`}>{conf.pct}%</span>
                  </div>
                </div>

                {/* Graded info */}
                <div className="space-y-1.5 text-[13px]">
                  <span className="text-[11px] text-slate-505 uppercase font-bold tracking-wider block">Analysis State</span>
                  {result ? (
                    <p className="text-slate-300 leading-relaxed font-medium">
                      Evaluated score: <span className="text-white font-bold">{result.score}/10</span>. Ready to proceed to next.
                    </p>
                  ) : (
                    <p className="text-slate-400 leading-relaxed font-medium">
                      Awaiting response submission. Speak or dictate into the workspace.
                    </p>
                  )}
                </div>

                {/* STAR Framework */}
                <div className="space-y-2.5 border-t border-white/[0.06] pt-3.5">
                  <span className="text-[11px] text-slate-505 uppercase font-bold tracking-wider block">STAR checklist</span>
                  <div className="grid grid-cols-2 gap-3 text-[13px] font-semibold">
                    {[
                      { label: 'Situation', checked: starChecklist.situation },
                      { label: 'Task', checked: starChecklist.task },
                      { label: 'Action', checked: starChecklist.action },
                      { label: 'Result', checked: starChecklist.result }
                    ].map((item, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${item.checked ? 'bg-emerald-500' : 'bg-white/10'}`} />
                        <span className={item.checked ? 'text-emerald-450' : 'text-slate-500'}>
                          {item.label}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Quick Tips */}
                <div className="space-y-2 border-t border-white/[0.06] pt-3.5 text-[13px] leading-relaxed">
                  <span className="text-[11px] text-slate-505 uppercase font-bold tracking-wider block">Session Guidance</span>
                  <ul className="space-y-1.5 text-slate-400 font-medium">
                    {tips.map((tip, idx) => (
                      <li key={idx} className="flex items-start gap-1.5">
                        <span className="text-brand text-xs mt-0.5">•</span>
                        <span>{tip}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* ── SUMMARY VIEW ── */}
      {view === "SUMMARY" && isLoading && (
        <div className="flex flex-col items-center justify-center min-h-[50vh] gap-3">
          <Loader2 className="animate-spin text-brand" size={24} />
          <p className="text-xs font-semibold text-slate-500 font-sans">Compiling analytical feedback report...</p>
        </div>
      )}

      {view === "SUMMARY" && !isLoading && reportData && (
        <div className="w-full max-w-[1450px] mx-auto space-y-6 pt-2">
          
          {/* Header */}
          <div className="bg-white border border-border rounded-xl p-6 flex flex-col md:flex-row items-center gap-6">
            <div className="relative shrink-0 flex items-center justify-center">
              <div className="w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center text-xl font-bold text-slate-900 border border-border shadow-sm font-mono">
                {calculateAverageScore(reportData?.evaluations)}%
              </div>
            </div>

            <div className="space-y-1 text-center md:text-left flex-1">
              <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Mock Evaluation Completed</h1>
              <p className="text-xs text-slate-500 leading-relaxed font-medium">
                Your performance report has been generated. View the question breakdown below.
              </p>
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: 'Role Stack', value: domain, icon: Play },
              { label: 'Complexity', value: difficulty, icon: Award },
              { label: 'Duration', value: formatTime(timeElapsed), icon: Clock },
              { label: 'Avg Rating', value: `${(calculateAverageScore(reportData?.evaluations) / 10).toFixed(1)} / 10`, icon: Sparkles },
            ].map((stat, i) => (
              <div key={i} className="bg-white border border-border rounded-xl p-4 flex items-center gap-3">
                <div className="p-2 rounded bg-slate-50 border border-border text-slate-500 shrink-0">
                  <stat.icon size={13} />
                </div>
                <div>
                  <span className="text-[12px] font-bold text-slate-400 uppercase tracking-wider block">{stat.label}</span>
                  <p className="text-sm font-bold text-slate-800 truncate mt-0.5">{stat.value}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Report evaluations list */}
          <div className="space-y-4">
            <h2 className="text-md font-bold text-slate-900 tracking-tight">Question evaluations</h2>
            
            <div className="space-y-3">
              {(!reportData?.evaluations || reportData.evaluations.length === 0) ? (
                <div className="text-center py-10 bg-slate-50 border border-dashed border-border rounded-xl">
                  <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">No evaluations recorded</p>
                </div>
              ) : (
                (reportData?.questions || []).map((q, idx) => {
                  const evalData = reportData?.evaluations?.[idx];
                  const score = evalData?.score || 0;
                  return (
                    <div key={idx} className="bg-white border border-border rounded-xl p-5 space-y-3">
                      <div className="flex items-start gap-3">
                        <span className="w-5 h-5 rounded bg-slate-50 border border-border flex items-center justify-center font-mono text-[12px] font-bold text-slate-500 shrink-0 mt-0.5">
                          {idx + 1}
                        </span>
                        <div className="space-y-2 flex-1 min-w-0">
                          <h4 className="text-sm font-bold text-slate-900 leading-normal">{q}</h4>
                          
                          {/* Graded results */}
                          {evalData ? (
                            <div className="space-y-3">
                              <div className="flex items-center gap-2">
                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded border border-brand/20 bg-brand/5 text-brand text-[12px] font-semibold uppercase">
                                  Score: {score}/10
                                </span>
                              </div>

                              {/* Strengths & Improvements */}
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm font-medium font-sans">
                                {evalData?.strengths && evalData.strengths.length > 0 && (
                                  <div className="space-y-2">
                                    <span className="text-[12px] font-bold text-emerald-600 uppercase tracking-wider block">Strengths</span>
                                    <ul className="space-y-1.5 text-slate-700 leading-relaxed text-[13px] font-medium">
                                      {evalData.strengths.map((s, i) => (
                                        <li key={i} className="flex gap-1.5 items-start">
                                          <span className="text-emerald-500">•</span>
                                          <span>{renderSanitizedText(s)}</span>
                                        </li>
                                      ))}
                                    </ul>
                                  </div>
                                )}
                                {evalData?.improvements && evalData.improvements.length > 0 && (
                                  <div className="space-y-2">
                                    <span className="text-[12px] font-bold text-amber-600 uppercase tracking-wider block">Adjustments</span>
                                    <ul className="space-y-1.5 text-slate-700 leading-relaxed text-[13px] font-medium">
                                      {evalData.improvements.map((im, i) => (
                                        <li key={i} className="flex gap-1.5 items-start">
                                          <span className="text-amber-500">•</span>
                                          <span>{renderSanitizedText(im)}</span>
                                        </li>
                                      ))}
                                    </ul>
                                  </div>
                                )}
                              </div>
                            </div>
                          ) : (
                            <span className="text-[12px] font-bold uppercase text-slate-400">Not Graded</span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Action CTAs */}
          <div className="pt-4 flex items-center justify-center gap-4">
            <button
              onClick={() => {
                setView("SETUP");
                setDomain("");
                setQuestions([]);
                setCurrentQuestionIndex(0);
                setAnswer("");
                setResult(null);
                setReportData(null);
                setTimeElapsed(0);
              }}
              type="button"
              className="h-10 px-5 bg-brand hover:bg-brand-hover text-white rounded-lg font-semibold text-xs shadow-sm transition-colors"
            >
              Practice Again
            </button>
            <button
              onClick={() => navigate('/dashboard')}
              type="button"
              className="h-10 px-5 bg-white border border-border hover:bg-slate-50 text-slate-700 rounded-lg font-semibold text-xs shadow-sm transition-colors"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      )}

      {/* Toast notifications */}
      {toast && (
        <div className="fixed bottom-6 right-6 bg-slate-950 border border-slate-800 p-4 rounded-lg shadow-2xl flex items-center gap-3 animate-toast z-50">
          <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${
            toast.type === 'success' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'
          }`}>
            {toast.type === 'success' ? <CheckCircle2 size={14} /> : <AlertCircle size={14} />}
          </div>
          <div>
            <p className="text-xs font-bold text-white uppercase tracking-wider">{toast.title}</p>
            <p className="text-[10px] text-slate-400 mt-0.5 font-medium">{toast.message}</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default Interview;
