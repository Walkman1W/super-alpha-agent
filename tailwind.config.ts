import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        mono: ['JetBrains Mono', 'Fira Code', 'Consolas', 'monospace'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        brand: {
          primary: '#0066FF',
          primaryLight: '#3D8BFF',
          primaryDark: '#0052CC',
          secondary: '#7C3AED',
          secondaryLight: '#A78BFA',
          secondaryDark: '#5B21B6',
          accent: '#06B6D4',
          accentGlow: '#22D3EE',
        },
        neutral: {
          900: '#0F172A',
          800: '#1E293B',
          700: '#334155',
          600: '#475569',
          500: '#64748B',
          400: '#94A3B8',
          300: '#CBD5E1',
          200: '#E2E8F0',
          100: '#F1F5F9',
          50: '#F8FAFC',
        },
        // Terminal 深色主题色系 (Zinc)
        terminal: {
          bg: '#050505',        // Zinc-950 主背景
          surface: '#09090b',   // Zinc-950 卡片背景
          border: '#27272a',    // Zinc-800 边框
          borderHover: '#3f3f46', // Zinc-700 悬停边框
          text: '#f4f4f5',      // Zinc-100 主文本
          textMuted: '#a1a1aa', // Zinc-400 次要文本
          textDim: '#71717a',   // Zinc-500 暗淡文本
          accent: '#a855f7',    // Purple-500 强调色
          accentGlow: '#c084fc', // Purple-400 光晕
          success: '#22c55e',   // Green-500 在线状态
          warning: '#f59e0b',   // Amber-500 维护状态
          error: '#ef4444',     // Red-500 离线状态
        },
      },
      boxShadow: {
        'glow': '0 0 20px rgba(0, 102, 255, 0.5)',
        'glow-lg': '0 0 40px rgba(0, 102, 255, 0.6)',
        'glow-purple': '0 0 20px rgba(124, 58, 237, 0.5)',
        '3xl': '0 35px 60px -15px rgba(0, 0, 0, 0.3)',
        // Terminal 主题阴影
        'terminal-glow': '0 0 30px rgba(168, 85, 247, 0.4)',
        'terminal-glow-lg': '0 0 60px rgba(168, 85, 247, 0.5)',
        'terminal-card': '0 4px 20px rgba(0, 0, 0, 0.5)',
        'terminal-inset': 'inset 0 1px 0 rgba(255, 255, 255, 0.05)',
      },
      animation: {
        'gradient': 'gradient 3s ease infinite',
        'pulse-ring': 'pulse-ring 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 6s ease-in-out infinite',
        'glow': 'glow 2s ease-in-out infinite',
        'shimmer': 'shimmer 2s linear infinite',
        'slide-up': 'slideUp 0.5s ease-out',
        'slide-down': 'slideDown 0.5s ease-out',
        'fade-in': 'fadeIn 0.5s ease-out',
        'scale-in': 'scaleIn 0.3s ease-out',
        'blob': 'blob 7s infinite',
        'wave': 'wave 3s ease-in-out infinite',
        'grid-move': 'gridMove 30s linear infinite',
        // Terminal 主题动画
        'marquee': 'marquee 25s linear infinite',
        'marquee-reverse': 'marquee-reverse 25s linear infinite',
        'ping-slow': 'ping 3s cubic-bezier(0, 0, 0.2, 1) infinite',
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'spotlight': 'spotlight 8s ease-in-out infinite',
      },
      keyframes: {
        gradient: {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
        'pulse-ring': {
          '0%': { boxShadow: '0 0 0 0 rgba(0, 102, 255, 0.7)' },
          '70%': { boxShadow: '0 0 0 10px rgba(0, 102, 255, 0)' },
          '100%': { boxShadow: '0 0 0 0 rgba(0, 102, 255, 0)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        glow: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.5' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-1000px 0' },
          '100%': { backgroundPosition: '1000px 0' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.9)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        blob: {
          '0%, 100%': { transform: 'translate(0, 0) scale(1)' },
          '25%': { transform: 'translate(20px, -20px) scale(1.1)' },
          '50%': { transform: 'translate(-20px, 20px) scale(0.9)' },
          '75%': { transform: 'translate(20px, 20px) scale(1.05)' },
        },
        wave: {
          '0%, 100%': { transform: 'translateX(0)' },
          '50%': { transform: 'translateX(-10px)' },
        },
        gridMove: {
          '0%': { transform: 'translate(0, 0)' },
          '100%': { transform: 'translate(60px, 60px)' },
        },
        // Terminal 主题 keyframes
        marquee: {
          '0%': { transform: 'translateX(0%)' },
          '100%': { transform: 'translateX(-50%)' },
        },
        'marquee-reverse': {
          '0%': { transform: 'translateX(-50%)' },
          '100%': { transform: 'translateX(0%)' },
        },
        spotlight: {
          '0%, 100%': { opacity: '0.5', transform: 'scale(1)' },
          '50%': { opacity: '0.8', transform: 'scale(1.05)' },
        },
      },
      backdropBlur: {
        xs: '2px',
      },
      typography: {
        DEFAULT: {
          css: {
            maxWidth: 'none',
          },
        },
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
}
export default config
