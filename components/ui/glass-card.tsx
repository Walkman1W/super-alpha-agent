import { ReactNode } from 'react'

/**
 * Glassmorphism 卡片组件
 * 毛玻璃效果 + 渐变边框 + 悬浮动画
 */
interface GlassCardProps {
  children: ReactNode
  className?: string
  hover?: boolean
  gradient?: boolean
}

export function GlassCard({ 
  children, 
  className = '', 
  hover = true,
  gradient = true 
}: GlassCardProps) {
  return (
    <div className={`
      group relative 
      bg-white/80 backdrop-blur-sm 
      rounded-2xl p-6 
      border border-gray-200/50
      transition-all duration-500
      ${hover ? 'hover:border-blue-500/50 hover:-translate-y-2 hover:shadow-2xl' : ''}
      ${className}
    `}>
      {/* 渐变发光效果 */}
      {gradient && (
        <div 
          className="absolute inset-0 rounded-2xl bg-gradient-to-br from-blue-500/20 via-purple-500/20 to-cyan-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10 blur-xl" 
          aria-hidden="true"
        />
      )}
      
      {/* 顶部光效条 */}
      {hover && (
        <div 
          className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-cyan-500 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-t-2xl" 
          aria-hidden="true"
        />
      )}
      
      {/* 内容 */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  )
}
