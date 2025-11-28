import { cn } from '@/lib/utils'

/**
 * AgentCardSkeleton 组件属性
 */
export interface AgentCardSkeletonProps {
  /** 自定义类名 */
  className?: string
}

/**
 * 骨架屏动画样式
 */
const shimmerClass = 'animate-pulse bg-gray-200'

/**
 * AgentCardSkeleton 组件
 * Agent 卡片的骨架屏加载状态
 * 
 * 需求: 3.5
 */
export function AgentCardSkeleton({ className }: AgentCardSkeletonProps) {
  return (
    <div
      className={cn(
        'bg-white/80 backdrop-blur-sm',
        'rounded-2xl p-6',
        'border border-gray-200/50',
        className
      )}
      aria-hidden="true"
      role="presentation"
    >
      {/* 头部: 名称 + 平台 */}
      <div className="flex items-start justify-between mb-4 gap-2">
        <div className={cn(shimmerClass, 'h-7 w-3/4 rounded-lg')} />
        <div className={cn(shimmerClass, 'h-6 w-16 rounded-full')} />
      </div>
      
      {/* AI 搜索统计徽章 */}
      <div className="mb-4">
        <div className={cn(shimmerClass, 'h-6 w-24 rounded-full')} />
      </div>
      
      {/* 描述 */}
      <div className="space-y-2 mb-4">
        <div className={cn(shimmerClass, 'h-4 w-full rounded')} />
        <div className={cn(shimmerClass, 'h-4 w-5/6 rounded')} />
      </div>
      
      {/* 核心功能标签 */}
      <div className="mb-4">
        <div className={cn(shimmerClass, 'h-4 w-16 rounded mb-2')} />
        <div className="flex flex-wrap gap-2">
          <div className={cn(shimmerClass, 'h-6 w-20 rounded-lg')} />
          <div className={cn(shimmerClass, 'h-6 w-24 rounded-lg')} />
          <div className={cn(shimmerClass, 'h-6 w-16 rounded-lg')} />
        </div>
      </div>
      
      {/* 优势 */}
      <div className="mb-4">
        <div className={cn(shimmerClass, 'h-4 w-12 rounded mb-2')} />
        <div className="space-y-1">
          <div className={cn(shimmerClass, 'h-4 w-full rounded')} />
          <div className={cn(shimmerClass, 'h-4 w-4/5 rounded')} />
        </div>
      </div>
      
      {/* 底部: 价格 + 链接 */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
        <div className={cn(shimmerClass, 'h-4 w-16 rounded')} />
        <div className={cn(shimmerClass, 'h-4 w-20 rounded')} />
      </div>
    </div>
  )
}

/**
 * AgentGridSkeleton 组件属性
 */
export interface AgentGridSkeletonProps {
  /** 显示的骨架卡片数量 */
  count?: number
  /** 自定义类名 */
  className?: string
}

/**
 * AgentGridSkeleton 组件
 * Agent 网格的骨架屏加载状态
 * 
 * 需求: 3.5
 */
export function AgentGridSkeleton({ count = 6, className }: AgentGridSkeletonProps) {
  return (
    <div className={cn('w-full', className)}>
      {/* 排序控制栏骨架 */}
      <div className="flex items-center justify-between mb-6">
        <div className={cn(shimmerClass, 'h-5 w-24 rounded')} />
        <div className={cn(shimmerClass, 'h-10 w-40 rounded-lg')} />
      </div>
      
      {/* 网格骨架 */}
      <div 
        className={cn(
          'grid gap-6',
          'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
        )}
        aria-label="加载中..."
        role="status"
      >
        {Array.from({ length: count }).map((_, index) => (
          <AgentCardSkeleton key={index} />
        ))}
      </div>
      
      {/* 屏幕阅读器提示 */}
      <span className="sr-only">正在加载 Agent 列表...</span>
    </div>
  )
}

export default AgentCardSkeleton
