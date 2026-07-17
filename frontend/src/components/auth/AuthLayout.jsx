import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles } from 'lucide-react';
import AuthBrandPanel from './AuthBrandPanel';

/**
 * AuthLayout — fixed-viewport auth shell. No body scroll on desktop.
 * Shell: min(1000px, 100vw-64px) × min(720px, 100dvh-40px).
 * 50/50 grid split. Mobile hides left panel and allows natural scroll.
 */
const AuthLayout = ({ children }) => {
  const navigate = useNavigate();

  return (
    <div
      style={{
        width: '100%',
        minHeight: '100dvh',
        overflowY: 'auto',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#F4F6F8',
        padding: '40px 20px',
        boxSizing: 'border-box',
        fontFamily: '"Inter", ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
        animation: 'authFadeIn 500ms cubic-bezier(0.16, 1, 0.3, 1) forwards',
      }}
    >
      {/* ── Auth card ── */}
      <div
        className="auth-card-grid"
        style={{
          width: 'min(1120px, calc(100vw - 40px))',
          height: 920,
          overflow: 'hidden',
          borderRadius: 28,
          boxShadow: '0 25px 50px -12px rgba(15, 23, 42, 0.15), 0 0 0 1px rgba(210, 218, 228, 0.5)',
          background: '#FFFFFF',
          animation: 'authFadeUp 600ms cubic-bezier(0.16, 1, 0.3, 1) forwards',
        }}
      >
        {/* Left brand panel — hidden on mobile */}
        <AuthBrandPanel />

        {/* Right form panel */}
        <div
          style={{
            minWidth: 0,
            background: '#FFFFFF',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            height: '100%',
          }}
        >
          {/* Mobile-only brand header */}
          <div
            className="flex md:hidden items-center gap-2 cursor-pointer"
            style={{ padding: '18px 24px 0', flexShrink: 0 }}
            onClick={() => navigate('/')}
            role="button" tabIndex={0} aria-label="Go to home"
            onKeyDown={e => e.key === 'Enter' && navigate('/')}
          >
            <div style={{
              width: 28, height: 28, borderRadius: 7, background: '#2563EB',
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            }}>
              <Sparkles className="text-white" size={13} fill="white" />
            </div>
            <p style={{ fontSize: 13, fontWeight: 750, color: '#0F172A', letterSpacing: '-0.02em' }}>Coach.ai</p>
          </div>

          {/* Form content */}
          <div
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              padding: '56px',
              overflow: 'visible',
              boxSizing: 'border-box',
            }}
          >
            {children}
          </div>
        </div>
      </div>

      {/* Responsive overrides & animations */}
      <style>{`
        @keyframes authFadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes authFadeUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        input::placeholder {
          color: #98A2B3 !important;
          font-weight: 500 !important;
        }
        .auth-card-grid {
          display: grid;
          grid-template-columns: 100%;
        }
        @media (min-width: 768px) {
          .auth-card-grid {
            grid-template-columns: 44% 56%;
          }
        }
        body {
          overflow-y: auto !important;
        }
      `}</style>
    </div>
  );
};

export default AuthLayout;
