import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Loader2, AlertCircle } from 'lucide-react';
import axios from 'axios';
import AuthLayout from '../components/auth/AuthLayout';
import OAuthButtons from '../components/auth/OAuthButtons';

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";
const FONT = '"Inter", ui-sans-serif, system-ui, -apple-system, sans-serif';

/* ── Input base style ── */
const inputBase = {
  width: '100%',
  height: 56,
  background: '#FFFFFF',
  border: '1px solid #E5E7EB',
  borderRadius: 14,
  padding: '0 18px',
  fontSize: 15,
  color: '#0F172A',
  fontWeight: 400,
  fontFamily: FONT,
  outline: 'none',
  transition: 'all 200ms cubic-bezier(0.16, 1, 0.3, 1)',
  boxSizing: 'border-box',
};

const inputError = {
  ...inputBase,
  borderColor: '#F87171',
  boxShadow: '0 0 0 4px rgba(248,113,113,0.15)',
};

/* ── Inline field error message ── */
const FieldError = ({ msg }) =>
  msg ? (
    <p style={{
      marginTop: 5, fontSize: 11.5, fontWeight: 600,
      color: '#DC2626', fontFamily: FONT,
      display: 'flex', alignItems: 'center', gap: 4,
    }}>
      <AlertCircle size={11} style={{ flexShrink: 0 }} />
      {msg}
    </p>
  ) : null;

const onFocusClean = e => {
  e.target.style.borderColor = '#3B82F6';
  e.target.style.boxShadow   = '0 0 0 4px rgba(59, 130, 246, 0.12)';
};
const onBlurClean  = e => {
  if (!e.target.dataset.hasError) {
    e.target.style.borderColor = '#E5E7EB';
    e.target.style.boxShadow   = 'none';
  }
};
const onHoverIn  = e => { if (document.activeElement !== e.target && !e.target.dataset.hasError) e.target.style.borderColor = '#D1D5DB'; };
const onHoverOut = e => { if (document.activeElement !== e.target && !e.target.dataset.hasError) e.target.style.borderColor = '#E5E7EB'; };

/* ── Label style ── */
const labelStyle = {
  display: 'block',
  fontSize: 13, fontWeight: 700,
  textTransform: 'uppercase', letterSpacing: '0.06em',
  color: '#475569', marginBottom: 10, fontFamily: FONT,
};

function Signup() {
  const navigate = useNavigate();
  const { login, token: existingToken } = useAuth();

  const [name, setName]           = useState('');
  const [email, setEmail]         = useState('');
  const [password, setPassword]   = useState('');
  const [error, setError]         = useState('');
  const [isLoading, setIsLoading] = useState(false);

  /* per-field inline errors */
  const [fieldErrors, setFieldErrors] = useState({ name: '', email: '', password: '' });

  useEffect(() => {
    const params   = new URLSearchParams(window.location.search);
    const urlToken = params.get("token");
    if (urlToken) {
      window.history.replaceState({}, document.title, window.location.pathname);
      login(urlToken);
      navigate("/dashboard", { replace: true });
    } else if (existingToken) {
      navigate("/dashboard", { replace: true });
    }
  }, [navigate, login, existingToken]);

  /* ── Client-side validation — returns true if valid ── */
  const validate = () => {
    const errs = { name: '', email: '', password: '' };
    if (!name.trim()) {
      errs.name = 'Full name is required.';
    }
    if (!email.trim()) {
      errs.email = 'Email address is required.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errs.email = 'Please enter a valid email address.';
    }
    if (!password) {
      errs.password = 'Password is required.';
    } else if (password.length < 6) {
      errs.password = 'Password must be at least 6 characters.';
    }
    setFieldErrors(errs);
    return !errs.name && !errs.email && !errs.password;
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setIsLoading(true);
    setError('');
    try {
      const res = await axios.post(`${API_URL}/api/auth/register`, { name, email, password });
      login(res.data.token);
      navigate('/dashboard', { replace: true });
    } catch (err) {
      setError(err.response?.data?.msg || 'An error occurred during sign up.');
    } finally {
      setIsLoading(false);
    }
  };

  /* clear field error as user types */
  const clearFieldError = (field) => {
    if (fieldErrors[field]) setFieldErrors(prev => ({ ...prev, [field]: '' }));
  };

  return (
    <AuthLayout>
      <div style={{ width: '100%', fontFamily: FONT }}>

        {/* ── Heading ── */}
        <div style={{ marginBottom: 48 }}>
          <h2 style={{
            fontSize: '48px', fontWeight: 800, color: '#0F172A',
            letterSpacing: '-0.04em', lineHeight: 1.1, marginBottom: 20,
            fontFamily: FONT,
          }}>
            Create your account.
          </h2>
          <p style={{ fontSize: 18, color: '#667085', fontWeight: 400, lineHeight: 1.6, fontFamily: FONT }}>
            Join Coach.ai and start preparing for your next interview.
          </p>
        </div>

        {/* ── Server error banner ── */}
        {error && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: 8,
            background: '#FFF1F2', border: '1px solid #FECDD3',
            color: '#DC2626', padding: '8px 12px',
            borderRadius: 9, fontSize: 13, fontWeight: 600,
            marginBottom: 14, fontFamily: FONT,
          }}>
            <AlertCircle size={13} style={{ flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        )}

        {/* ── Form (noValidate disables browser popups) ── */}
        <form onSubmit={handleSignup} noValidate style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

          {/* Full Name */}
          <div>
            <label htmlFor="signup-name" style={labelStyle}>Full Name</label>
            <input
              id="signup-name" type="text" value={name}
              onChange={e => { setName(e.target.value); clearFieldError('name'); }}
              placeholder="Your full name"
              data-has-error={fieldErrors.name ? 'true' : ''}
              style={fieldErrors.name ? inputError : inputBase}
              onFocus={onFocusClean} onBlur={onBlurClean}
              onMouseEnter={onHoverIn} onMouseLeave={onHoverOut}
            />
            <FieldError msg={fieldErrors.name} />
          </div>

          {/* Email */}
          <div>
            <label htmlFor="signup-email" style={labelStyle}>Email Address</label>
            <input
              id="signup-email" type="email" value={email}
              onChange={e => { setEmail(e.target.value); clearFieldError('email'); }}
              placeholder="you@company.com"
              data-has-error={fieldErrors.email ? 'true' : ''}
              style={fieldErrors.email ? inputError : inputBase}
              onFocus={onFocusClean} onBlur={onBlurClean}
              onMouseEnter={onHoverIn} onMouseLeave={onHoverOut}
            />
            <FieldError msg={fieldErrors.email} />
          </div>

          {/* Password */}
          <div>
            <label htmlFor="signup-password" style={labelStyle}>Password</label>
            <input
              id="signup-password" type="password" value={password}
              onChange={e => { setPassword(e.target.value); clearFieldError('password'); }}
              placeholder="Minimum 6 characters"
              data-has-error={fieldErrors.password ? 'true' : ''}
              style={fieldErrors.password ? inputError : inputBase}
              onFocus={onFocusClean} onBlur={onBlurClean}
              onMouseEnter={onHoverIn} onMouseLeave={onHoverOut}
            />
            <FieldError msg={fieldErrors.password} />
          </div>

          {/* Create Account CTA */}
          <button
            type="submit"
            disabled={isLoading}
            style={{
              width: '100%', height: 56,
              background: isLoading ? '#1E293B' : '#0F172A',
              color: '#FFFFFF', border: 'none', borderRadius: 14,
              fontSize: 14, fontWeight: 700, letterSpacing: '0.08em',
              textTransform: 'uppercase', fontFamily: FONT,
              cursor: isLoading ? 'not-allowed' : 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(15,23,42,0.08)',
              transition: 'all 250ms cubic-bezier(0.16, 1, 0.3, 1)',
              opacity: isLoading ? 0.75 : 1,
              marginTop: 2,
            }}
            onMouseEnter={e => { if (!isLoading) { e.currentTarget.style.background = '#1E293B'; e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 6px 16px rgba(15,23,42,0.12)'; }}}
            onMouseLeave={e => { e.currentTarget.style.background = '#0F172A'; e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(15,23,42,0.08)'; }}
            onMouseDown={e => { e.currentTarget.style.transform = 'translateY(0)'; }}
          >
            {isLoading ? <Loader2 className="animate-spin" size={16} /> : 'Create Account'}
          </button>
        </form>

        {/* ── OR divider ── */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 16,
          marginTop: 28, marginBottom: 28,
          fontSize: 12, fontWeight: 600,
          textTransform: 'uppercase', letterSpacing: '0.05em',
          color: '#98A2B3', userSelect: 'none', fontFamily: FONT,
        }}>
          <div style={{ flex: 1, height: 1, background: '#E5E7EB' }} />
          <span>OR CONTINUE WITH</span>
          <div style={{ flex: 1, height: 1, background: '#E5E7EB' }} />
        </div>

        {/* ── OAuth ── */}
        <OAuthButtons />

        {/* ── Footer ── */}
        <div style={{
          textAlign: 'center', marginTop: 20,
          fontSize: 13, fontWeight: 400,
          color: '#64748B', fontFamily: FONT,
        }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: '#2563EB', textDecoration: 'none', fontWeight: 500 }}
            onMouseEnter={e => { e.target.style.color = '#1D4ED8'; e.target.style.textDecoration = 'underline'; e.target.style.textUnderlineOffset = '2px'; }}
            onMouseLeave={e => { e.target.style.color = '#2563EB'; e.target.style.textDecoration = 'none'; }}
          >Sign In</Link>
        </div>
      </div>
    </AuthLayout>
  );
}

export default Signup;
