import React, { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Lock, Loader2, CheckCircle2, AlertCircle, ArrowLeft, Sparkles } from 'lucide-react';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL;

function ResetPassword() {
  const { token } = useParams();
  const navigate  = useNavigate();
  const [password, setPassword]               = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError]                     = useState('');
  const [message, setMessage]                 = useState('');
  const [isLoading, setIsLoading]             = useState(false);

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) return setError("Passwords do not match");
    setIsLoading(true);
    setError('');
    setMessage('');
    try {
      const res = await axios.post(`${API_URL}/api/auth/reset-password/${token}`, { password });
      setMessage(res.data.msg || 'Password has been reset successfully.');
      setTimeout(() => navigate('/login'), 3000);
    } catch (err) {
      setError(err.response?.data?.msg || 'Failed to reset password');
    } finally {
      setIsLoading(false);
    }
  };

  /* ── Input style ── */
  const inputStyle = {
    width: '100%', height: 56,
    background: '#FFFFFF', border: '1px solid #DCE3EC',
    borderRadius: 12, padding: '0 16px 0 40px',
    fontSize: 16, color: '#0F172A', fontWeight: 450,
    outline: 'none',
    transition: 'border-color 180ms ease, box-shadow 180ms ease',
    boxSizing: 'border-box',
  };
  const onFocus = e => {
    e.target.style.borderColor = '#6366F1';
    e.target.style.boxShadow = '0 0 0 3px rgba(99,102,241,0.10)';
  };
  const onBlur  = e => {
    e.target.style.borderColor = '#DCE3EC';
    e.target.style.boxShadow = 'none';
  };
  const onHoverIn = e => {
    if (document.activeElement !== e.target) e.target.style.borderColor = '#CBD5E1';
  };
  const onHoverOut = e => {
    if (document.activeElement !== e.target) e.target.style.borderColor = '#DCE3EC';
  };

  return (
    <div
      className="min-h-screen font-sans flex items-center justify-center animate-fade-in"
      style={{
        background: `
          radial-gradient(circle at 50% 0%, rgba(99, 102, 241, 0.06), transparent 38%),
          #F6F8FC
        `,
        padding: '32px 16px',
        boxSizing: 'border-box',
      }}
    >
      <div className="form-entrance" style={{
        width: '100%', maxWidth: 480,
        background: '#FFFFFF',
        borderRadius: 28,
        boxShadow: '0 24px 70px rgba(15,23,42,0.12), 0 4px 16px rgba(15,23,42,0.04)',
        border: '1px solid rgba(226,232,240,0.85)',
        padding: 'clamp(32px, 6vh, 48px) clamp(24px, 5vw, 56px)',
      }}>
        <style>{`
          .form-entrance {
            animation: formFadeIn 350ms cubic-bezier(0.16, 1, 0.3, 1) forwards;
            opacity: 0;
          }
          @keyframes formFadeIn {
            from { opacity: 0; transform: translateY(6px); }
            to { opacity: 1; transform: translateY(0); }
          }
        `}</style>

        {/* Logo */}
        <div
          className="flex items-center gap-2.5 cursor-pointer mb-7"
          onClick={() => navigate('/')}
          role="button" tabIndex={0} aria-label="Go to home"
          onKeyDown={e => e.key === 'Enter' && navigate('/')}
        >
          <div style={{
            width: 38, height: 38, borderRadius: 12,
            background: '#2563EB', flexShrink: 0,
            display: 'flex', alignItems: 'center', justifycontent: 'center',
            boxShadow: '0 4px 12px rgba(37,99,235,0.30)',
          }}>
            <Sparkles className="text-white" size={18} fill="white" />
          </div>
          <div>
            <p style={{ fontSize: 15, fontWeight: 750, color: '#0F172A', letterSpacing: '-0.03em', lineHeight: 1 }}>Coach.ai</p>
            <p style={{ fontSize: 11, color: '#64748B', fontWeight: 500, marginTop: 2 }}>AI Interview Coach</p>
          </div>
        </div>

        {/* Back link */}
        <Link
          to="/login"
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            fontSize: 12.5, fontWeight: 650,
            color: '#64748B', textDecoration: 'none',
            marginBottom: 24, transition: 'color 150ms',
          }}
          onMouseEnter={e => { e.currentTarget.style.color = '#4F46E5'; }}
          onMouseLeave={e => { e.currentTarget.style.color = '#64748B'; }}
        >
          <ArrowLeft size={13} style={{ transition: 'transform 150ms' }} />
          Back to Sign In
        </Link>

        {/* Heading */}
        <div style={{ marginBottom: 28 }}>
          <h1 style={{
            fontSize: '38px',
            fontWeight: 700, color: '#0F172A',
            letterSpacing: '-0.04em', lineHeight: 1.1, marginBottom: 8,
          }}>
            Reset Password
          </h1>
          <p style={{ fontSize: 15.5, color: '#64748B', fontWeight: 450, lineHeight: 1.5 }}>
            Enter your new password below to regain access to your account.
          </p>
        </div>

        {/* Status messages */}
        {error && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: 10,
            background: '#FFF1F2', border: '1px solid #FECDD3',
            color: '#E11D48', padding: '10px 14px',
            borderRadius: 12, fontSize: 13, fontWeight: 600, marginBottom: 16,
          }}>
            <AlertCircle size={14} style={{ flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        )}
        {message && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: 10,
            background: '#F0FDF4', border: '1px solid #BBF7D0',
            color: '#15803D', padding: '10px 14px',
            borderRadius: 12, fontSize: 13, fontWeight: 600, marginBottom: 16,
          }}>
            <CheckCircle2 size={14} style={{ flexShrink: 0 }} />
            <span>{message}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleResetPassword} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>

          {/* New Password */}
          <div>
            <label htmlFor="reset-password" style={{
              display: 'block', fontSize: 12, fontWeight: 600,
              textTransform: 'uppercase', letterSpacing: '0.06em', color: '#334155', marginBottom: 8,
            }}>NEW PASSWORD</label>
            <div style={{ position: 'relative' }}>
              <Lock size={14} style={{
                position: 'absolute', left: 15, top: '50%',
                transform: 'translateY(-50%)', color: '#94A3B8', pointerEvents: 'none',
              }} />
              <input
                id="reset-password" type="password" value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Minimum 6 characters" minLength={6} required
                style={inputStyle}
                onFocus={onFocus} onBlur={onBlur}
                onMouseEnter={onHoverIn} onMouseLeave={onHoverOut}
              />
            </div>
          </div>

          {/* Confirm Password */}
          <div>
            <label htmlFor="reset-confirm" style={{
              display: 'block', fontSize: 12, fontWeight: 600,
              textTransform: 'uppercase', letterSpacing: '0.06em', color: '#334155', marginBottom: 8,
            }}>CONFIRM NEW PASSWORD</label>
            <div style={{ position: 'relative' }}>
              <Lock size={14} style={{
                position: 'absolute', left: 15, top: '50%',
                transform: 'translateY(-50%)', color: '#94A3B8', pointerEvents: 'none',
              }} />
              <input
                id="reset-confirm" type="password" value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                placeholder="Confirm your password" minLength={6} required
                style={inputStyle}
                onFocus={onFocus} onBlur={onBlur}
                onMouseEnter={onHoverIn} onMouseLeave={onHoverOut}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading || !!message}
            style={{
              width: '100%', height: 56,
              background: (isLoading || message) ? '#334155' : '#0F172A',
              color: '#FFFFFF', border: 'none', borderRadius: 12,
              fontSize: 14, fontWeight: 650, letterSpacing: '0.08em',
              textTransform: 'uppercase',
              cursor: (isLoading || message) ? 'not-allowed' : 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 8px 20px rgba(15,23,42,0.16)',
              transition: 'background 180ms, transform 180ms, box-shadow 180ms',
              opacity: (isLoading || message) ? 0.7 : 1,
              marginTop: 4,
            }}
            onMouseEnter={e => {
              if (!isLoading && !message) {
                e.currentTarget.style.background = '#111C33';
                e.currentTarget.style.transform = 'translateY(-1px)';
                e.currentTarget.style.boxShadow = '0 12px 24px rgba(15,23,42,0.24)';
              }
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = (isLoading || message) ? '#334155' : '#0F172A';
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 8px 20px rgba(15,23,42,0.16)';
            }}
            onMouseDown={e => {
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            {isLoading ? <Loader2 className="animate-spin" size={17} /> : 'RESET PASSWORD'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default ResetPassword;
