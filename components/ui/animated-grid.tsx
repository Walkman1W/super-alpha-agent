'use client'

/**
 * 动态网格背景组件
 * 用于 Hero Section 增加科技感
 */
export function AnimatedGrid() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* 主网格 */}
      <div className="absolute inset-0 opacity-20">
        <div 
          className="absolute inset-0 animate-grid-move"
          style={{
            backgroundImage: `
              linear-gradient(rgba(255,255,255,0.1) 2px, transparent 2px),
              linear-gradient(90deg, rgba(255,255,255,0.1) 2px, transparent 2px)
            `,
            backgroundSize: '60px 60px',
          }}
        />
      </div>
      
      {/* 辅助光点 */}
      <div className="absolute inset-0 opacity-30">
        <div 
          className="absolute inset-0"
          style={{
            backgroundImage: `radial-gradient(circle at 25% 25%, rgba(255,255,255,0.2) 1px, transparent 1px)`,
            backgroundSize: '100px 100px',
          }}
        />
      </div>
    </div>
  )
}
