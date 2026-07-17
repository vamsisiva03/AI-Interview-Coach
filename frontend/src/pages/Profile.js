import React, { useState, useEffect, useRef } from 'react';
import { 
  Camera, 
  Edit3,
  Award,
  Loader2
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Avatar from '../components/Avatar';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

const Profile = () => {
  const { user, refreshUser, updateAvatar } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const [isUploading, setIsUploading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    bio: '',
    privacy: 'Private',
    provider: 'local',
    createdAt: ''
  });

  const [skills, setSkills] = useState([]);
  const [badges, setBadges] = useState([]);
  const [stats, setStats] = useState({
    completed: 0,
    avg: 0,
    time: 0
  });

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;

        const res = await axios.get(`${API_URL}/api/user/profile`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        const data = res.data;
        setProfileData({
          name: data.name || 'User Name',
          email: data.email || 'user@example.com',
          bio: data.bio || 'AI capabilities explorer and continuous learner.',
          privacy: data.privacy || 'Private',
          provider: data.provider || 'local',
          createdAt: data.createdAt ? new Date(data.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : 'June 2026'
        });

        const historyRes = await axios.get(`${API_URL}/api/interview/history`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        const historyData = historyRes.data || [];

        const completedCount = historyData.length;
        const totalScore = historyData.reduce((sum, s) => sum + (Number(s.score) || 0), 0);
        const avgScore = completedCount > 0 ? Math.round(totalScore / completedCount) : 0;
        const totalDuration = historyData.reduce((sum, s) => sum + (Number(s.duration) || 0), 0);
        const totalMin = Math.round(totalDuration / 60);

        setStats({
          completed: completedCount,
          avg: avgScore,
          time: totalMin
        });

        const domainMap = {};
        historyData.forEach(s => {
          const dom = s.domain || 'Interview';
          if (!domainMap[dom]) {
            domainMap[dom] = { sum: 0, count: 0 };
          }
          domainMap[dom].sum += Number(s.score) || 0;
          domainMap[dom].count += 1;
        });

        const computedSkills = Object.keys(domainMap).map(dom => ({
          domain: dom,
          avg: Math.round(domainMap[dom].sum / domainMap[dom].count),
          count: domainMap[dom].count
        }));
        setSkills(computedSkills);

        const computedBadges = [];
        if (completedCount >= 1) {
          computedBadges.push({
            title: "Icebreaker 🌱",
            desc: "Completed your first AI mock session.",
            unlocked: true,
            color: "bg-emerald-50 text-emerald-700 border-emerald-100"
          });
        } else {
          computedBadges.push({
            title: "Icebreaker 🌱",
            desc: "Complete your first AI mock session to unlock.",
            unlocked: false,
            color: "bg-slate-50 text-slate-400 border-slate-100 opacity-60"
          });
        }

        const hasElite = historyData.some(s => (s.score || 0) >= 80);
        if (hasElite) {
          computedBadges.push({
            title: "Elite Candidate 🏆",
            desc: "Scored a distinguished rating (>=80%) on a session.",
            unlocked: true,
            color: "bg-amber-50 text-amber-700 border-amber-100"
          });
        } else {
          computedBadges.push({
            title: "Elite Candidate 🏆",
            desc: "Score a distinguished rating (>=80%) to unlock.",
            unlocked: false,
            color: "bg-slate-50 text-slate-400 border-slate-100 opacity-60"
          });
        }

        const uniqueDomainsCount = Object.keys(domainMap).length;
        if (uniqueDomainsCount >= 2) {
          computedBadges.push({
            title: "Polymath 🚀",
            desc: "Practiced mock sessions in 2+ different domains.",
            unlocked: true,
            color: "bg-indigo-50 text-indigo-700 border-indigo-100"
          });
        } else {
          computedBadges.push({
            title: "Polymath 🚀",
            desc: "Practice mock sessions in 2+ different domains to unlock.",
            unlocked: false,
            color: "bg-slate-50 text-slate-400 border-slate-100 opacity-60"
          });
        }

        if (totalMin >= 30) {
          computedBadges.push({
            title: "Marathoner ⚡",
            desc: "Practiced for over 30 total minutes.",
            unlocked: true,
            color: "bg-purple-50 text-purple-700 border-purple-100"
          });
        } else {
          computedBadges.push({
            title: "Marathoner ⚡",
            desc: "Practice for over 30 total minutes to unlock.",
            unlocked: false,
            color: "bg-slate-50 text-slate-400 border-slate-100 opacity-60"
          });
        }

        setBadges(computedBadges);

      } catch (err) {
        console.error("[Profile] Failed to fetch profile data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfileData();
  }, []);

  const handlePhotoClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('profileImage', file);

    setIsUploading(true);
    setToast(null);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.post(`${API_URL}/api/auth/upload-photo`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${token}`
        }
      });

      if (res.data.profileImage) {
        updateAvatar(res.data.profileImage);
        await refreshUser();
        setToast({ type: 'success', title: 'Photo Updated', message: 'Your profile picture has been successfully uploaded.' });
        setTimeout(() => setToast(null), 3000);
      }
    } catch (err) {
      setToast({ type: 'error', title: 'Upload Failed', message: 'Unable to upload photo. Please check the file and try again.' });
      setTimeout(() => setToast(null), 3000);
    } finally {
      setIsUploading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 pb-12 max-w-5xl mx-auto animate-fade-in">
        <div className="bg-white rounded-xl p-8 flex flex-col items-center border border-border">
          <div className="skeleton w-24 h-24 rounded-full mb-4"></div>
          <div className="skeleton h-6 w-40 mx-auto mb-2"></div>
          <div className="skeleton h-4 w-48 mx-auto"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-[1200px] mx-auto space-y-8 pb-12 font-sans">
      
      {/* Page Header */}
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-[36px] md:text-[40px] font-bold tracking-[-0.04em] text-slate-900 leading-none">Candidate Profile</h1>
          <p className="text-[14px] md:text-[15px] text-slate-500 font-medium mt-2">Review your skill competencies, achievements, and training logs.</p>
        </div>
        <button
          onClick={() => navigate('/settings')}
          type="button"
          className="px-5 h-[44px] bg-white border border-slate-200 text-[14px] font-semibold text-slate-700 rounded-xl hover:bg-slate-50 hover:-translate-y-[1px] active:translate-y-0 shadow-sm transition-all flex items-center gap-1.5 self-start sm:self-auto"
        >
          <Edit3 size={12} />
          Edit Settings
        </button>
      </header>

      {/* Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        
        {/* Left Side: Avatar Card */}
        <div className="lg:col-span-1 space-y-6">
          <div className="premium-card p-6 flex flex-col items-center text-center relative overflow-hidden">
            
            {/* Avatar Upload */}
            <div 
              className="relative inline-block group cursor-pointer shrink-0 mb-5" 
              onClick={!isUploading ? handlePhotoClick : undefined}
            >
              <div className="w-32 h-32 rounded-full border border-slate-200 flex items-center justify-center overflow-hidden relative transition-all group-hover:scale-[1.02] group-hover:shadow-md">
                <Avatar src={user?.profileImage} name={profileData.name} sizeClass="w-full h-full" initialsSizeClass="text-[32px]" />
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-150">
                  {isUploading ? (
                    <Loader2 className="animate-spin text-white" size={18} />
                  ) : (
                    <Camera size={18} className="text-white" />
                  )}
                </div>
              </div>
              <input 
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/*"
                className="hidden"
              />
            </div>

            <h2 className="text-lg font-bold text-slate-900 tracking-tight leading-tight">{profileData.name}</h2>
            <span className="text-[10px] font-bold text-[#4F46E5] bg-[#4F46E5]/5 px-2.5 py-0.5 rounded-full border border-[#4F46E5]/10 uppercase tracking-wider mt-2">
              Active Candidate
            </span>

            {/* Meta summary details */}
            <div className="w-full border-t border-slate-100 pt-5 mt-5 space-y-3.5 text-left text-[14px] font-semibold">
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Email</span>
                <span className="text-slate-800 truncate max-w-[150px]">{profileData.email}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Connected SSO</span>
                <span className="text-slate-800 uppercase tracking-wider text-[11px] font-bold">
                  {profileData.provider === 'google' ? 'Google OAuth' : 'Local Email'}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Member Since</span>
                <span className="text-slate-800 font-medium">{profileData.createdAt}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Profile Access</span>
                <span className="text-slate-800 font-bold">{profileData.privacy}</span>
              </div>
            </div>
          </div>

          {/* Quick Statistics List */}
          <div className="premium-card p-6 space-y-4 font-sans text-[14px]">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider border-b border-slate-100 pb-3">Workspace Metrics</h3>
            <div className="space-y-3 font-semibold text-slate-550">
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Practice Sessions</span>
                <span className="text-slate-850 font-extrabold">{stats.completed}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Average Performance</span>
                <span className="text-slate-850 font-extrabold">{stats.avg}%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Training Duration</span>
                <span className="text-slate-850 font-extrabold">{stats.time} mins</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Bio, Skills & Achievements */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Bio statement */}
          <div className="premium-card p-6 space-y-3">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider border-b border-slate-100 pb-3">Professional Summary</h3>
            <p className="text-[14px] text-slate-655 leading-relaxed font-medium">
              {profileData.bio || "No professional abstract provided yet. Edit your biography inside settings."}
            </p>
          </div>

          {/* Competency bars */}
          <div className="premium-card p-6 space-y-4">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider border-b border-slate-100 pb-3">Skills assessment Coverage</h3>
            
            {skills.length === 0 ? (
              <div className="text-center py-6 text-[14px] text-slate-400 font-medium">
                No target domains practiced yet.
              </div>
            ) : (
              <div className="space-y-5">
                {skills.map((skill, idx) => (
                  <div key={idx} className="space-y-2">
                    <div className="flex justify-between items-center text-[14px]">
                      <span className="font-semibold text-slate-700">{skill.domain}</span>
                      <span className="font-bold text-[#4F46E5] font-mono">{skill.avg}% ({skill.count} session{skill.count > 1 ? 's' : ''})</span>
                    </div>
                    <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                      <div 
                        className="h-full rounded-full bg-gradient-to-r from-[#4F46E5] to-[#6366F1] transition-all duration-500"
                        style={{ width: `${skill.avg}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Career Milestones */}
          <div className="premium-card p-6 space-y-4">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider border-b border-slate-100 pb-3">Achievements</h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {badges.map((badge, idx) => (
                <div 
                  key={idx} 
                  className={`p-4 border rounded-xl flex items-start gap-3.5 transition-all duration-150 ${
                    badge.unlocked 
                      ? 'border-slate-100 bg-slate-50/50 hover:bg-slate-50' 
                      : 'border-dashed border-slate-200 bg-white opacity-60'
                  }`}
                >
                  <div className={`w-9 h-9 rounded-lg border flex items-center justify-center shrink-0 shadow-sm ${
                    badge.unlocked 
                      ? 'bg-[#4F46E5]/5 text-[#4F46E5] border-[#4F46E5]/10' 
                      : 'bg-slate-50 text-slate-450 border-slate-150'
                  }`}>
                    <Award size={16} />
                  </div>
                  <div className="space-y-1 min-w-0">
                    <h4 className={`text-[14px] font-bold leading-tight ${badge.unlocked ? 'text-slate-800' : 'text-slate-450'}`}>{badge.title}</h4>
                    <p className="text-[12px] leading-relaxed font-medium text-slate-500">{badge.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Upload Toast */}
      {toast && (
        <div className="fixed bottom-6 right-6 bg-slate-950 border border-slate-800 p-4 rounded-xl shadow-2xl flex items-center gap-3 animate-toast z-50">
          <div className="w-7 h-7 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <div>
            <p className="text-xs font-bold text-white uppercase tracking-wider">{toast.title}</p>
            <p className="text-[10px] text-slate-400 mt-0.5 font-medium">{toast.message}</p>
          </div>
        </div>
      )}
    </div>
  );
};

const CheckCircle2 = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"/>
    <path d="m9 12 2 2 4-4"/>
  </svg>
);

export default Profile;
