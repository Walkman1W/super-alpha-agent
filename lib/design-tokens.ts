/**
 * Super Alpha Agent 设计令牌系统
 * 统一管理颜色、间距、字体、动画等设计变量
 */

export const designTokens = {
  colors: {
    brand: {
      primary: '#0066FF',      // 科技蓝
      primaryLight: '#3D8BFF',
      primaryDark: '#0052CC',
      secondary: '#7C3AED',    // 未来紫
      secondaryLight: '#A78BFA',
      secondaryDark: '#5B21B6',
      accent: '#06B6D4',       // 电光青
      accentGlow: '#22D3EE',
    },
    neutral: {
      900: '#0F172A',          // 深空灰
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
    semantic: {
      success: '#10B981',      // 科技绿
      warning: '#F59E0B',      // 霓虹橙
      error: '#EF4444',        // 赛博红
      info: '#3B82F6',         // 量子蓝
    }
  },
  spacing: {
    xs: '0.25rem',    // 4px
    sm: '0.5rem',     // 8px
    md: '1rem',       // 16px
    lg: '1.5rem',     // 24px
    xl: '2rem',       // 32px
    '2xl': '3rem',    // 48px
    '3xl': '4rem',    // 64px
    '4xl': '6rem',    // 96px
  },
  typography: {
    fontFamily: {
      display: 'var(--font-inter), Inter, system-ui, sans-serif',
      body: 'var(--font-inter), Inter, system-ui, sans-serif',
      mono: 'JetBrains Mono, Consolas, monospace',
    },
  },

  borderRadius: {
    sm: '0.375rem',   // 6px
    md: '0.5rem',     // 8px
    lg: '0.75rem',    // 12px
    xl: '1rem',       // 16px
    '2xl': '1.5rem',  // 24px
    '3xl': '2rem',    // 32px
    full: '9999px',
  },
  shadows: {
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
    '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    glow: '0 0 20px rgba(0, 102, 255, 0.5)',
    glowLg: '0 0 40px rgba(0, 102, 255, 0.6)',
    glowPurple: '0 0 20px rgba(124, 58, 237, 0.5)',
  },
  animation: {
    duration: {
      fast: '150ms',
      normal: '300ms',
      slow: '500ms',
      slower: '700ms',
    },
    easing: {
      easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
      easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
      easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
      spring: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
    }
  }
} as const

export type DesignTokens = typeof designTokens
