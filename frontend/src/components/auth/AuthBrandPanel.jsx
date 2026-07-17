import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, Video, Zap, BarChart3 } from 'lucide-react';

const FEATURES = [
  { Icon: Video,     label: 'Mock Interviews'       },
  { Icon: Zap,       label: 'Real-Time Feedback'    },
  { Icon: BarChart3, label: 'Performance Analytics' },
];

const GOLD_PALETTE = ['#FFD76A', '#FFE8A3', '#F3D17C', '#FADA8B'];

const isOverlap = (x, y) => {
  // Title/Logo zone: left 72% and top 50%
  if (x < 72 && y < 50) return true;
  // Feature cards zone: left 90% and bottom 48% (y > 52%)
  if (x < 90 && y > 52) return true;
  return false;
};

const generateParticles = () => {
  const list = [];
  
  // 1. Diagonal stream particles flowing from bottom-left to top-right (approx 30 particles)
  let streamCount = 0;
  while (streamCount < 30) {
    const t = Math.random() * 100; // progress along diagonal
    const offsetLimit = 16;
    const offsetX = (Math.random() - 0.5) * offsetLimit;
    const offsetY = (Math.random() - 0.5) * offsetLimit;
    const x = Math.max(0, Math.min(100, t + offsetX));
    const y = Math.max(0, Math.min(100, (100 - t) + offsetY));
    
    if (isOverlap(x, y)) continue;

    const sizeVal = Math.random();
    let size = 2;
    if (sizeVal > 0.90) size = Math.floor(Math.random() * 3) + 4; // 4-6px
    else if (sizeVal > 0.60) size = 3;
    else if (sizeVal > 0.30) size = 2.5;

    const color = GOLD_PALETTE[Math.floor(Math.random() * GOLD_PALETTE.length)];
    const opacity = 0.10 + Math.random() * 0.22; // 0.10 to 0.32
    const delay = Math.random() * 8;
    const duration = 4 + Math.random() * 4; // 4-8 seconds
    const glow = size >= 4 && Math.random() > 0.4;
    const float = Math.random() > 0.5;

    list.push({
      x,
      y,
      size,
      color,
      opacity,
      delay,
      duration,
      glow,
      float,
      type: 'dot',
    });
    streamCount++;
  }

  // 2. Background scattered dots (approx 60 particles)
  let scatteredCount = 0;
  while (scatteredCount < 60) {
    const x = Math.random() * 100;
    const y = Math.random() * 100;

    if (isOverlap(x, y)) continue;

    const sizeVal = Math.random();
    let size = 2;
    if (sizeVal > 0.92) size = Math.floor(Math.random() * 3) + 4; // 4-6px
    else if (sizeVal > 0.70) size = 3;
    else if (sizeVal > 0.40) size = 2.5;

    const opacity = 0.08 + Math.random() * 0.18; // very subtle
    const color = GOLD_PALETTE[Math.floor(Math.random() * GOLD_PALETTE.length)];
    const delay = Math.random() * 8;
    const duration = 4 + Math.random() * 4; // 4-8 seconds
    const glow = size >= 4 && Math.random() > 0.6;
    const float = Math.random() > 0.6;

    list.push({
      x,
      y,
      size,
      color,
      opacity,
      delay,
      duration,
      glow,
      float,
      type: 'dot',
    });
    scatteredCount++;
  }

  // 3. Sparkle stars (exactly 4 elegant gold stars with a soft glow)
  let sparkleCount = 0;
  while (sparkleCount < 4) {
    const x = Math.random() * 100;
    const y = Math.random() * 100;

    if (isOverlap(x, y)) continue;

    const opacity = 0.15 + Math.random() * 0.20;
    const size = Math.floor(Math.random() * 3) + 5; // 5px to 7px
    const color = GOLD_PALETTE[Math.floor(Math.random() * GOLD_PALETTE.length)];
    const delay = Math.random() * 8;
    const duration = 5 + Math.random() * 3;
    const float = Math.random() > 0.5;

    list.push({
      x,
      y,
      size,
      color,
      opacity,
      delay,
      duration,
      glow: true,
      float,
      type: 'sparkle',
    });
    sparkleCount++;
  }

  // 4. Diamond outline crystals (exactly 6 crystal icons - 8-15% opacity)
  let crystalCount = 0;
  while (crystalCount < 6) {
    const x = Math.random() * 100;
    const y = Math.random() * 100;

    if (isOverlap(x, y)) continue;

    const opacity = 0.08 + Math.random() * 0.07; // 8-15% opacity
    const size = Math.floor(Math.random() * 3) + 5; // 5px to 7px
    const color = GOLD_PALETTE[Math.floor(Math.random() * GOLD_PALETTE.length)];
    const delay = Math.random() * 8;
    const duration = 5 + Math.random() * 3;
    const float = true;

    list.push({
      x,
      y,
      size,
      color,
      opacity,
      delay,
      duration,
      glow: false,
      float,
      type: 'diamond',
    });
    crystalCount++;
  }

  return list;
};

/**
 * AuthBrandPanel — left 44% blue panel.
 * Background features a premium blue gradient, radial glows, and luxury gold crystal dust.
 */
const AuthBrandPanel = () => {
  const navigate = useNavigate();

  // Stable generation of particles
  const particles = React.useMemo(() => generateParticles(), []);

  return (
    <div
      className="hidden md:flex"
      style={{
        minWidth: 0,
        flexDirection: 'column',
        position: 'relative',
        overflow: 'hidden',
        userSelect: 'none',
        padding: '56px 48px 52px 48px',
        background: `
          radial-gradient(circle at 20% 15%, rgba(99, 179, 250, 0.22), transparent 35%),
          radial-gradient(circle at 85% 78%, rgba(56, 100, 220, 0.18), transparent 38%),
          linear-gradient(145deg, #3B6EF5 0%, #2563EB 52%, #2155D4 100%)
        `,
        color: '#FFFFFF',
        display: 'flex',
      }}
    >
      {/* ── CSS animations stylesheet ── */}
      <style>{`
        @keyframes crystalTwinkle {
          0%, 100% { opacity: 0.40; }
          50% { opacity: 1; }
        }
        @keyframes crystalFloat {
          0% { transform: translate(0, 0); }
          50% { transform: translate(3px, -5px); }
          100% { transform: translate(0, 0); }
        }
        @keyframes crystalFloatRotate {
          0% { transform: rotate(45deg) translate(0, 0); }
          50% { transform: rotate(45deg) translate(-2px, 3px); }
          100% { transform: rotate(45deg) translate(0, 0); }
        }
      `}</style>

      {/* ── Radial glows ── */}
      <div
        style={{
          position: 'absolute',
          top: '10%',
          left: '10%',
          width: '350px',
          height: '350px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(255, 232, 163, 0.08) 0%, rgba(255,255,255,0) 70%)',
          pointerEvents: 'none',
          zIndex: 1,
        }}
      />
      <div
        style={{
          position: 'absolute',
          bottom: '10%',
          left: '20%',
          width: '450px',
          height: '450px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(255, 255, 255, 0.05) 0%, rgba(255,255,255,0) 70%)',
          pointerEvents: 'none',
          zIndex: 1,
        }}
      />

      {/* ── Luxury Gold Particles & Sparkle Dust Layer ── */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          pointerEvents: 'none',
          zIndex: 2,
        }}
      >
        {particles.map((p, index) => {
          const animationString = `crystalTwinkle ${p.duration}s ease-in-out infinite`;

          const innerAnimation = p.type === 'diamond'
            ? `crystalFloatRotate ${p.duration + 1.5}s ease-in-out infinite`
            : p.float
              ? `crystalFloat ${p.duration + 1.5}s ease-in-out infinite`
              : 'none';

          return (
            <div
              key={index}
              style={{
                position: 'absolute',
                left: `${p.x}%`,
                top: `${p.y}%`,
                opacity: p.opacity,
                animation: animationString,
                animationDelay: `${p.delay}s`,
                pointerEvents: 'none',
              }}
            >
              {p.type === 'dot' && (
                <div
                  style={{
                    width: p.size,
                    height: p.size,
                    borderRadius: '50%',
                    background: p.color,
                    boxShadow: p.glow ? `0 0 ${p.size * 2}px ${p.color}, 0 0 ${p.size * 4}px ${p.color}` : 'none',
                    animation: innerAnimation,
                    animationDelay: `${p.delay * 0.5}s`,
                  }}
                />
              )}
              {p.type === 'sparkle' && (
                <div
                  style={{
                    width: p.size,
                    height: p.size,
                    background: p.color,
                    clipPath: 'polygon(50% 0%, 61% 39%, 100% 50%, 61% 61%, 50% 100%, 39% 61%, 0% 50%, 39% 39%)',
                    boxShadow: p.glow ? `0 0 ${p.size * 2.5}px ${p.color}` : 'none',
                    animation: innerAnimation,
                    animationDelay: `${p.delay * 0.5}s`,
                  }}
                />
              )}
              {p.type === 'diamond' && (
                <div
                  style={{
                    width: p.size,
                    height: p.size,
                    border: `1px solid ${p.color}`,
                    borderRadius: '1px',
                    background: 'transparent',
                    transform: 'rotate(45deg)',
                    animation: innerAnimation,
                    animationDelay: `${p.delay * 0.5}s`,
                  }}
                />
              )}
            </div>
          );
        })}
      </div>

      {/* ── Subtle dot texture ── */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 3,
          backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.80) 1px, transparent 1px)',
          backgroundSize: '22px 22px',
          opacity: 0.03,
        }}
      />

      {/* ── TOP: Logo + heading + subtitle ── */}
      <div style={{ position: 'relative', zIndex: 10 }}>
        {/* Logo */}
        <div
          style={{
            width: 50, height: 50, borderRadius: 14, marginBottom: 40,
            background: 'rgba(255,255,255,0.11)',
            border: '1px solid rgba(255,255,255,0.20)',
            backdropFilter: 'blur(10px)',
            boxShadow: '0 4px 14px rgba(0,0,0,0.10)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer',
          }}
          onClick={() => navigate('/')}
          role="button" tabIndex={0} aria-label="Go to home"
          onKeyDown={e => e.key === 'Enter' && navigate('/')}
        >
          <Sparkles size={22} fill="white" style={{ color: '#fff' }} />
        </div>

        {/* Main heading */}
        <h1 style={{
          fontSize: 'clamp(36px, 3.2vw, 46px)',
          fontWeight: 800,
          lineHeight: 1.1,
          letterSpacing: '-0.04em',
          color: '#FFFFFF',
          fontFamily: '"Inter", ui-sans-serif, sans-serif',
          marginBottom: 26,
        }}>
          AI Interview<br />
          <span style={{ color: 'rgba(191, 219, 254, 0.90)' }}>Coach.</span>
        </h1>

        {/* Subtitle with vertical accent line */}
        <div style={{ display: 'flex', alignItems: 'stretch', gap: 0 }}>
          <div style={{
            width: 2, borderRadius: 2,
            background: 'rgba(147,197,253,0.55)',
            marginRight: 14, flexShrink: 0,
          }} />
          <p style={{
            fontSize: '16px',
            color: 'rgba(255,255,255,0.82)',
            fontWeight: 450,
            lineHeight: 1.55,
            fontFamily: '"Inter", ui-sans-serif, sans-serif',
          }}>
            Advanced AI-powered<br />interview preparation.
          </p>
        </div>
      </div>

      {/* ── BOTTOM: Feature cards ── */}
      <div style={{
        position: 'relative', zIndex: 10,
        marginTop: 'auto',
        display: 'flex', flexDirection: 'column', gap: 16,
      }}>
        {FEATURES.map(({ Icon, label }) => (
          <div
            key={label}
            style={{
              display: 'flex', alignItems: 'center', gap: 16,
              height: 70, borderRadius: 14,
              padding: '0 20px',
              background: 'rgba(255,255,255,0.12)',
              border: '1px solid rgba(255,255,255,0.15)',
              backdropFilter: 'blur(12px)',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.03)',
              transition: 'all 250ms cubic-bezier(0.16, 1, 0.3, 1)',
              cursor: 'default',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = 'rgba(255,255,255,0.16)';
              e.currentTarget.style.borderColor = 'rgba(255,255,255,0.25)';
              e.currentTarget.style.transform = 'translateY(-3px)';
              e.currentTarget.style.boxShadow = '0 12px 30px rgba(15, 23, 42, 0.15)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = 'rgba(255,255,255,0.12)';
              e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)';
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.03)';
            }}
          >
            <div style={{
              width: 40, height: 40, borderRadius: 11,
              background: 'rgba(255,255,255,0.12)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0,
            }}>
              <Icon size={20} style={{ color: '#fff' }} />
            </div>
            <span style={{
              fontSize: 13, fontWeight: 700, letterSpacing: '0.04em',
              color: 'rgba(255,255,255,0.95)', textTransform: 'uppercase',
              fontFamily: '"Inter", ui-sans-serif, sans-serif',
            }}>
              {label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AuthBrandPanel;
