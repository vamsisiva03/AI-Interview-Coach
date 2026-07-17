/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html"
  ],
  theme: {
    extend: {
      colors: {
        background: 'var(--background)',
        card: 'var(--surface)',
        surface: 'var(--surface)',
        'surface-muted': 'var(--surface-muted)',
        'surface-elevated': 'var(--surface-elevated)',
        border: 'var(--border)',
        'border-subtle': 'var(--border-subtle)',
        'text-primary': 'var(--text-primary)',
        'text-secondary': 'var(--text-secondary)',
        'text-muted': 'var(--text-muted)',
        brand: 'var(--brand)',
        'brand-hover': 'var(--brand-hover)',
        primary: 'var(--brand)',
        primaryHover: 'var(--brand-hover)',
        secondary: 'var(--brand)', // Standardize brand actions
        success: 'var(--success)',
        warning: 'var(--warning)',
        danger: 'var(--danger)',
        foreground: 'var(--text-primary)',
        muted: 'var(--text-secondary)',
      },
      fontFamily: {
        sans: [
          '"Geist"',
          '"Inter"',
          'system-ui',
          '-apple-system',
          'BlinkMacSystemFont',
          '"Segoe UI"',
          'sans-serif'
        ],
        mono: [
          '"Geist Mono"',
          'Consolas',
          'Monaco',
          'monospace'
        ]
      },
      fontSize: {
        'xs':   ['12px', { lineHeight: '16px' }],   // 12px (Metadata)
        'sm':   ['14px', { lineHeight: '21px' }],   // 14px (Nav, Buttons, Supporting)
        'base': ['16px', { lineHeight: '24px' }],   // 16px
        'lg':   ['18px', { lineHeight: '28px' }],   // 18px
        'xl':   ['20px', { lineHeight: '28px' }],   // 20px
        '2xl':  ['24px', { lineHeight: '32px' }],   // 24px
        '3xl':  ['30px', { lineHeight: '36px' }],   // 30px
        '4xl':  ['36px', { lineHeight: '40px' }],   // 36px
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out',
        'slide-up': 'slideUp 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
        'pulse-glow': 'pulseGlow 2s ease-in-out infinite',
        'float': 'float 3s ease-in-out infinite',
        'fade-in-up': 'fadeInUp 0.6s ease-out forwards',
        'glow': 'glow-border 3s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(15px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        pulseGlow: {
          '0%, 100%': { opacity: '0.4', transform: 'scale(1)' },
          '50%': { opacity: '0.7', transform: 'scale(1.05)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        }
      },
      borderRadius: {
        'standard': '18px',
        'card': '22px',
        'button': '14px',
      },
      boxShadow: {
        'glow-indigo': '0 0 20px -3px rgba(91, 92, 246, 0.2)',
        'glow-purple': '0 0 20px -3px rgba(124, 108, 249, 0.2)',
        'card': '0 2px 8px rgba(0,0,0,0.02), 0 8px 24px rgba(0,0,0,0.03)',
        'card-hover': '0 12px 40px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.02)',
        'premium': '0 1px 2px rgba(0, 0, 0, 0.02), 0 4px 16px rgba(0, 0, 0, 0.02)',
        'premium-hover': '0 10px 30px rgba(0, 0, 0, 0.04), 0 2px 8px rgba(0, 0, 0, 0.02)',
      }
    },
  },
  plugins: [],
}