import { ReactNode } from 'react'

/**
 * 增强按钮组件
 * 带脉冲动画、发光效果和箭头动画
 */
interface EnhancedButtonProps {
  children: ReactNode
  href: string
  variant?: 'primary' | 'secondary'
  icon?: ReactNode
  showArrow?: boolean
  className?: string
}

export function EnhancedButton({ 
  children, 
  href, 
  variant = 'primary',
  icon,
  showArrow = true,
  className = ''
}: EnhancedButtonProps) {
  const baseClasses = `
    group relative 
    w-full sm:w-auto
    px-6 md:px-8 py-3 md:py-4 
    rounded-xl font-bold text-base md:text-lg 
    overflow-hidden 
    transition-all duration-300 
    hover:scale-105 
    inline-flex items-center justify-center gap-2
    text-center
  `
  
  const variantClasses = {
    primary: "bg-white text-blue-600 hover:shadow-lg",
    secondary: "bg-purple-600 text-white border-2 border-white/30 hover:bg-purple-700"
  }

  return (
    <a 
      href={href}
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
    >
      {/* 发光效果 */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      
      {/* 内容 */}
      <span className="relative z-10 flex items-center gap-2">
        {icon && (
          <span className="text-xl md:text-2xl group-hover:scale-110 transition-transform duration-300">
            {icon}
          </span>
        )}

        <span>{children}</span>
        {showArrow && (
          <svg 
            className="w-4 h-4 md:w-5 md:h-5 transform group-hover:translate-x-1 transition-transform duration-300" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
            aria-hidden="true"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
          </svg>
        )}
      </span>
      
      {/* 脉冲动画 - 仅 primary 变体 */}
      {variant === 'primary' && (
        <div 
          className="absolute inset-0 rounded-xl animate-pulse-ring pointer-events-none" 
          aria-hidden="true"
        />
      )}
    </a>
  )
}
