import React, { useState, useEffect } from 'react';
import { 
  Bell, 
  Save,
  CheckCircle,
  Shield,
  ChevronRight,
  UserCircle,
  LogOut,
  AlertCircle
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Avatar from '../components/Avatar';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

const Settings = () => {
  const { user, refreshUser, logout } = useAuth();
  const navigate = useNavigate();
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(true);
  
  const [activeTab, setActiveTab] = useState('account');

  // Appearance state
  const [appearance, setAppearance] = useState({
    theme: 'light',
    accentColor: 'indigo',
    density: 'comfortable',
    reducedMotion: false
  });

  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    bio: '',
    notifications: {
      emailUpdates: true,
      browserAlerts: false,
      weeklyReport: true
    },
    privacy: 'Private',
    provider: 'local'
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get(`${API_URL}/api/user/profile`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        const data = res.data;
        setProfileData({
          name: data.name || '',
          email: data.email || '',
          bio: data.bio || '',
          notifications: data.notifications || {
            emailUpdates: true,
            browserAlerts: false,
            weeklyReport: true
          },
          privacy: data.privacy || 'Private',
          provider: data.provider || 'local'
        });

        const savedAppearance = localStorage.getItem('appearance');
        if (savedAppearance) {
          setAppearance(JSON.parse(savedAppearance));
        }
      } catch (err) {
        // Clean handle
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    setErrorMessage('');
    try {
      const token = localStorage.getItem('token');
      const res = await axios.put(`${API_URL}/api/user/update-profile`, profileData, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      const updatedUser = res.data;
      if (updatedUser) {
        setProfileData(prev => ({
          ...prev,
          name: updatedUser.name || prev.name,
          email: updatedUser.email || prev.email,
          bio: updatedUser.bio || prev.bio,
          notifications: updatedUser.notifications || prev.notifications,
          privacy: updatedUser.privacy || prev.privacy
        }));
      }

      localStorage.setItem('appearance', JSON.stringify(appearance));

      await refreshUser();
      setIsSaving(false);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (err) {
      setErrorMessage(err.response?.data?.msg || 'Failed to save settings. Please try again.');
      setIsSaving(false);
      setTimeout(() => setErrorMessage(''), 4000);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto mt-4 px-4 pb-12 space-y-6">
        <div className="flex justify-between items-center pb-6 border-b border-border">
          <div className="space-y-2">
            <div className="skeleton h-6 w-48"></div>
            <div className="skeleton h-4 w-72"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-[1200px] mx-auto space-y-8 pb-12 font-sans">
      
      {/* Header */}
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-100">
        <div className="flex items-center gap-4">
          <Avatar src={user?.profileImage} name={user?.name} sizeClass="w-12 h-12 border border-slate-200 shadow-sm" initialsSizeClass="text-lg" />
          <div>
            <h1 className="text-[36px] md:text-[40px] font-bold tracking-[-0.04em] text-slate-900 leading-none">System Preferences</h1>
            <p className="text-[14px] md:text-[15px] text-slate-500 font-medium mt-2">Manage your candidate profile details, notification alerts, and security options.</p>
          </div>
        </div>
        
        <button
          onClick={handleSave}
          disabled={isSaving}
          type="button"
          className="flex items-center justify-center gap-1.5 px-6 h-[44px] bg-[#4F46E5] hover:bg-[#6366F1] text-white rounded-xl text-[14px] font-semibold hover:-translate-y-[1px] active:translate-y-0 transition-all disabled:opacity-50 shrink-0 shadow-sm"
        >
          {isSaving ? (
            <div className="w-3.5 h-3.5 border border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <Save size={14} />
          )}
          {showSuccess ? "Applied" : "Save Changes"}
        </button>
      </header>

      {/* Tabs navigation grid */}
      <div className="grid grid-cols-1 md:grid-cols-[240px_1fr] gap-8 items-start">
        
        {/* Left Side Tab Menu */}
        <div className="space-y-1.5 premium-card p-3">
          {[
            { id: 'account', label: 'Account Details', icon: UserCircle },
            { id: 'notifications', label: 'Notifications', icon: Bell },
            { id: 'security', label: 'Security & Theme', icon: Shield }
          ].map((tab) => (
            <button 
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg text-[14px] font-semibold transition-all duration-150 ${
                activeTab === tab.id 
                  ? 'bg-[#4F46E5]/10 text-[#4F46E5] font-bold' 
                  : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800 hover:translate-x-[1px]'
              }`}
            >
              <span className="flex items-center gap-2"><tab.icon size={14} /> {tab.label}</span>
              {activeTab === tab.id && <ChevronRight size={13} className="opacity-70" />}
            </button>
          ))}
        </div>

        {/* Right Active Panel */}
        <div className="min-w-0 space-y-6">
          
          {/* Account Panel */}
          {activeTab === 'account' && (
            <div className="space-y-6">
              
              {/* Profile details edit form */}
              <div className="premium-card p-6 space-y-5">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block border-b border-slate-100 pb-3">Profile details</span>
                
                <div className="space-y-2">
                  <label htmlFor="name" className="block text-[11px] font-bold uppercase tracking-wider text-slate-400">Full Name</label>
                  <input 
                    id="name"
                    type="text" 
                    value={profileData.name} 
                    onChange={(e) => setProfileData({...profileData, name: e.target.value})}
                    className="w-full premium-input focus:outline-none"
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="bio" className="block text-[11px] font-bold uppercase tracking-wider text-slate-400">Biography</label>
                  <textarea 
                    id="bio"
                    rows={4}
                    value={profileData.bio} 
                    onChange={(e) => setProfileData({...profileData, bio: e.target.value})}
                    className="w-full premium-input focus:outline-none py-3 h-auto min-h-[120px] resize-y"
                  />
                </div>
              </div>

              {/* Connected details */}
              <div className="premium-card p-6 space-y-4 font-sans text-[14px]">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block border-b border-slate-100 pb-3">SSO Integration Info</span>
                <div className="space-y-3 font-semibold text-slate-550">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500">Registered Email</span>
                    <span className="text-slate-800 font-bold">{profileData.email}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500">SSO Provider</span>
                    <span className="text-slate-800 uppercase tracking-wider text-[11px] font-bold">
                      {profileData.provider === 'google' ? 'Google OAuth' : 'Local email connection'}
                    </span>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 mt-4">
                  <button
                    onClick={handleLogout}
                    type="button"
                    className="inline-flex items-center gap-1.5 text-slate-500 hover:text-rose-600 font-bold text-[14px] transition-colors"
                  >
                    <LogOut size={14} />
                    Sign Out Account
                  </button>
                </div>
              </div>

              {/* Danger Zone */}
              <div className="border border-rose-100 bg-rose-50/10 rounded-2xl overflow-hidden font-sans shadow-sm">
                <div className="bg-rose-50/30 border-b border-rose-100 px-6 py-4">
                  <h3 className="text-[11px] font-bold text-rose-800 uppercase tracking-wider leading-none">Danger Zone</h3>
                </div>
                <div className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-0.5">
                    <p className="text-[14px] font-bold text-slate-800 leading-none">Wipe Candidate Account</p>
                    <p className="text-[13px] text-slate-500 font-medium leading-relaxed mt-1.5">Permanently delete all sessions, history reports, and identity fields.</p>
                  </div>
                  <button 
                    type="button" 
                    className="h-[42px] px-5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-[14px] font-semibold shadow-sm transition-all shrink-0 hover:-translate-y-[1px] active:translate-y-0"
                  >
                    Delete Account
                  </button>
                </div>
              </div>

            </div>
          )}

          {/* Notifications Panel */}
          {activeTab === 'notifications' && (
            <div className="premium-card overflow-hidden font-sans divide-y divide-slate-100">
              <div className="p-6 bg-slate-50/30">
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider leading-none">Notifications Configurations</h3>
              </div>
              {[
                { key: 'emailUpdates', label: 'Email Digest Alerts', sub: 'Receive regular rollups regarding your performance average.' },
                { key: 'weeklyReport', label: 'Weekly Summary Reports', sub: 'Weekly compiled review insights sent via email.' },
                { key: 'browserAlerts', label: 'Browser Reminders', sub: 'Instant badges inside the app when new metrics finish.' }
              ].map((item) => (
                <div key={item.key} className="flex items-center justify-between p-6 hover:bg-slate-50/30 transition-colors">
                  <div className="pr-4 space-y-1">
                    <p className="text-[14px] font-bold text-slate-800 leading-none">{item.label}</p>
                    <p className="text-[13px] text-slate-500 font-medium leading-relaxed mt-1">{item.sub}</p>
                  </div>
                  <button 
                    onClick={() => setProfileData({
                      ...profileData, 
                      notifications: { ...profileData.notifications, [item.key]: !profileData.notifications[item.key] }
                    })}
                    type="button"
                    className={`relative inline-flex h-5 w-10 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-150 ease-in-out focus:outline-none ${profileData.notifications[item.key] ? 'bg-[#4F46E5]' : 'bg-slate-200'}`}
                  >
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform duration-150 ease-in-out ${profileData.notifications[item.key] ? 'translate-x-[20px]' : 'translate-x-0'}`} />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Security & Theme Panel */}
          {activeTab === 'security' && (
            <div className="space-y-6">
              
              {/* Appearance preferences */}
              <div className="premium-card p-6 space-y-6">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block border-b border-slate-100 pb-3">Appearance & Styling</span>
                
                {/* Theme selection */}
                <div className="space-y-3">
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400">Accent Theme</label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {[
                      { id: 'indigo', name: 'Classic Iris', color: 'bg-[#4F46E5]' },
                      { id: 'violet', name: 'Sleek Violet', color: 'bg-[#6366F1]' },
                      { id: 'emerald', name: 'Emerald Forest', color: 'bg-emerald-500' }
                    ].map((accent) => (
                      <button
                        key={accent.id}
                        onClick={() => setAppearance({...appearance, accentColor: accent.id})}
                        type="button"
                        className={`flex items-center gap-3.5 rounded-xl p-3.5 border text-left transition-all ${
                          appearance.accentColor === accent.id
                            ? 'bg-slate-50 border-[#4F46E5] font-semibold shadow-sm'
                            : 'bg-white border-slate-200 hover:border-slate-350'
                        }`}
                      >
                        <span className={`w-3.5 h-3.5 rounded-full ${accent.color} border border-white shrink-0`} />
                        <span className="text-[14px] font-semibold text-slate-800">{accent.name}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <hr className="border-slate-100" />

                {/* Layout Density */}
                <div className="space-y-2.5">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Layout Density</span>
                  <div className="bg-slate-100 p-0.5 rounded-xl flex gap-0.5 border border-slate-100 w-fit">
                    {['comfortable', 'compact'].map((dens) => (
                      <button
                        key={dens}
                        onClick={() => setAppearance({...appearance, density: dens})}
                        type="button"
                        className={`px-3.5 py-1.5 rounded-lg text-[11px] font-bold uppercase tracking-wider transition-all capitalize ${
                          appearance.density === dens 
                            ? 'bg-white text-slate-900 shadow-sm' 
                            : 'text-slate-500 hover:text-slate-800'
                        }`}
                      >
                        {dens}
                      </button>
                    ))}
                  </div>
                </div>

                <hr className="border-slate-100" />

                {/* Reduced Motion Toggle */}
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <p className="text-[14px] font-bold text-slate-800">Support Reduced Motion</p>
                    <p className="text-[13px] text-slate-500 font-medium">Disable intensive animations and transition scales.</p>
                  </div>
                  <button 
                    onClick={() => setAppearance({...appearance, reducedMotion: !appearance.reducedMotion})}
                    type="button"
                    className={`relative inline-flex h-5 w-10 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-150 ease-in-out focus:outline-none ${appearance.reducedMotion ? 'bg-[#4F46E5]' : 'bg-slate-200'}`}
                  >
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform duration-150 ease-in-out ${appearance.reducedMotion ? 'translate-x-[20px]' : 'translate-x-0'}`} />
                  </button>
                </div>
              </div>

              {/* Privacy settings */}
              <div className="premium-card p-6 space-y-5">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block border-b border-slate-100 pb-3">Privacy & Visibility</span>
                
                {/* Profile Visibility */}
                <div className="space-y-3.5">
                  <div>
                    <h4 className="text-[14px] font-bold text-slate-800 leading-none">Profile Search Settings</h4>
                    <p className="text-[13px] text-slate-500 font-semibold mt-1.5">Configure visibility for training logs and certifications.</p>
                  </div>
                  
                  <div className="bg-slate-100 p-0.5 rounded-xl flex gap-0.5 border border-slate-100 w-fit">
                    {['Private', 'Teammates Only', 'Public Visibility'].map((mode) => (
                      <button
                        key={mode}
                        onClick={() => setProfileData({...profileData, privacy: mode})}
                        type="button"
                        className={`px-3.5 py-1.5 rounded-lg text-[11px] font-bold uppercase tracking-wider transition-all ${
                          profileData.privacy === mode 
                            ? 'bg-white text-slate-900 shadow-sm' 
                            : 'text-slate-500 hover:text-slate-800'
                        }`}
                      >
                        {mode}
                      </button>
                    ))}
                  </div>
                </div>

                <hr className="border-slate-100" />

                {/* AI Policy */}
                <div className="space-y-1 bg-slate-50 border border-slate-100 p-4 rounded-xl">
                  <h4 className="text-[14px] font-bold text-slate-800 flex items-center gap-1.5">
                    <Shield size={14} className="text-[#4F46E5]" />
                    AI Data Handling Policy
                  </h4>
                  <p className="text-[13px] text-slate-500 leading-relaxed font-medium mt-1">
                    Your interview text transcript is evaluated via secure API pathways using LLM evaluators. Transcripts are encrypted and never utilized for search index training.
                  </p>
                </div>
              </div>

              {/* Keyboard Shortcuts */}
              <div className="premium-card p-6 space-y-4">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block border-b border-slate-100 pb-3">Shortcuts blueprint</span>
                <div className="bg-slate-50 border border-slate-100 p-4 rounded-xl text-[14px] font-semibold text-slate-700">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500 font-semibold">Evaluate & Grader Submission</span>
                    <kbd className="px-2 py-0.5 bg-white border border-slate-205 rounded-md shadow-sm text-[11px] font-bold">Ctrl + Enter</kbd>
                  </div>
                </div>
              </div>

            </div>
          )}

        </div>
      </div>

      {/* Success Toast */}
      {showSuccess && (
        <div className="fixed bottom-6 right-6 bg-slate-950 border border-slate-800 p-4 rounded-xl shadow-2xl flex items-center gap-3 animate-toast z-50">
          <div className="w-7 h-7 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0">
            <CheckCircle className="w-4 h-4" />
          </div>
          <div>
            <p className="text-xs font-bold text-white uppercase tracking-wider">Changes Saved</p>
            <p className="text-[10px] text-slate-400 mt-0.5 font-medium">Configurations have been successfully updated.</p>
          </div>
        </div>
      )}

      {/* Error Toast */}
      {errorMessage && (
        <div className="fixed bottom-6 right-6 bg-slate-950 border border-slate-800 p-4 rounded-xl shadow-2xl flex items-center gap-3 animate-toast z-50">
          <div className="w-7 h-7 rounded-full bg-rose-500/10 text-rose-400 flex items-center justify-center shrink-0">
            <AlertCircle size={14} />
          </div>
          <div>
            <p className="text-xs font-bold text-white uppercase tracking-wider">Failed to save</p>
            <p className="text-[10px] text-slate-400 mt-0.5 font-medium">{errorMessage}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Settings;
