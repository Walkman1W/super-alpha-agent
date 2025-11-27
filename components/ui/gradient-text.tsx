/**
 * 渐变文字组件
 * 带发光效果的渐变文字
 */
interface GradientTextProps {
  children: string
  className?: string
  animate?: boolean
  glow?: boolean
}

export function GradientText({ 
  children, 
  className = '', 
  animate = false,
  glow = true 
}: GradientTextProps) {
  return (
    <span className={`relative inline-block ${className}`}>
      {/* 发光背景 */}
      {glow && (
        <span 
          className="absolute inset-0 blur-2xl bg-gradient-to-r from-yellow-300 via-pink-300 to-purple-300 opacity-50" 
          aria-hidden="true"
        />
      )}
      
      {/* 渐变文字 */}
      <span className={`
        relative bg-gradient-to-r from-yellow-300 via-pink-300 to-purple-300 
        bg-clip-text text-transparent
        ${animate ? 'bg-[length:200%_auto] animate-gradient' : ''}
      `}>
        {children}
      </span>
    </span>
  )
}
