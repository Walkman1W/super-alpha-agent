'use client'

import { memo } from 'react'
import { cn } from '@/lib/utils'
import { SignalCard } from './signal-card'
import type { SignalAgent } from '@/lib/types/agent'

interface AgentGridProps {
  agents: SignalAgent[]
  isLoading?: boolean
  searchQuery?: string
  onAgentClick?: (agent: SignalAgent) => void
  className?: string
}

/**
 * 骨架屏卡片组件
 */
function SkeletonCard() {
  return (
    <div className="bg-zinc-900/80 rounded-lg p-4 border border-zinc-800 animate-pulse">
      <div className="flex items-start justify-between gap-2 mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-5 h-5 bg-zinc-800 rounded" />
            <div className="h-5 bg-zinc-800 rounded w-32" />
          </div>
          <div className="h-3 bg-zinc-800 rounded w-16" />
        </div>
        <div className="w-6 h-6 bg-zinc-800 rounded" />
      </div>
      <div className="space-y-2 mb-3">
        <div className="h-3 bg-zinc-800 rounded w-full" />
        <div className="h-3 bg-zinc-800 rounded w-3/4" />
      </div>
      <div className="flex gap-2 mb-3">
        <div className="h-5 bg-zinc-800 rounded w-20" />
        <div className="h-5 bg-zinc-800 rounded w-10" />
      </div>
      <div className="flex gap-2">
        <div className="h-4 bg-zinc-800 rounded w-12" />
        <div className="h-4 bg-zinc-800 rounded w-12" />
        <div className="h-4 bg-zinc-800 rounded w-12" />
      </div>
    </div>
  )
}

/**
 * 空状态组件
 */
function EmptyState({ searchQuery, onReset }: { searchQuery?: string; onReset?: () => void }) {
  return (
    <div className="col-span-full flex flex-col items-center justify-center py-16 text-center">
      <div className="w-16 h-16 mb-4 rounded-full bg-zinc-800/50 flex items-center justify-center">
        <span className="text-3xl">📡</span>
      </div>
      <h3 className="text-lg font-semibold text-zinc-300 mb-2">No signals detected</h3>
      <p className="text-sm text-zinc-500 mb-4 max-w-md">
        {searchQuery
          ? <>No agents found matching &ldquo;{searchQuery}&rdquo;. Try adjusting your filters.</>
          : 'No agents available at the moment. Check back later.'}
      </p>
      {onReset && (
        <button
          onClick={onReset}
          className="px-4 py-2 text-sm font-mono text-purple-400 bg-purple-500/10 border border-purple-500/30 rounded hover:bg-purple-500/20 transition-colors"
        >
          Reset Filters
        </button>
      )}
    </div>
  )
}

/**
 * Grid Header 组件
 * **Property 6: Grid Header Accuracy**
 * **Validates: Requirements 5.2, 9.3**
 */
function GridHeader({ searchQuery, count }: { searchQuery?: string; count: number }) {
  return (
    <div className="col-span-full flex flex-col xs:flex-row items-start xs:items-center justify-between gap-2 mb-3 sm:mb-4 pb-3 sm:pb-4 border-b border-zinc-800" data-testid="grid-header">
      <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
        <span className="text-[10px] sm:text-xs font-mono text-zinc-500 uppercase tracking-wider">
          Signals
        </span>
        {searchQuery && (
          <span className="text-[10px] sm:text-xs font-mono text-zinc-400 truncate max-w-[150px] sm:max-w-none">
            for &ldquo;<span className="text-purple-400" data-testid="search-query">{searchQuery}</span>&rdquo;
          </span>
        )}
      </div>
      <span className="text-[10px] sm:text-xs font-mono text-zinc-400 whitespace-nowrap" data-testid="result-count">
        {count} {count === 1 ? 'result' : 'results'}
      </span>
    </div>
  )
}

/**
 * AgentGrid 组件
 * 响应式网格布局展示 Agent 卡片
 * 
 * **Validates: Requirements 5.1, 5.2, 5.3, 5.4, 5.5, 9.1, 9.3**
 */
function AgentGridComponent({
  agents,
  isLoading = false,
  searchQuery,
  onAgentClick,
  className
}: AgentGridProps) {
  // 加载状态 - 响应式骨架屏数量
  if (isLoading) {
    return (
      <div
        className={cn(
          'grid',
          // 响应式间距 - 移动端更紧凑
          'gap-3 sm:gap-4',
          // 响应式列数 - 更细粒度的断点
          'grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
          className
        )}
        data-testid="agent-grid-loading"
      >
        {/* 移动端显示4个，桌面端显示8个 */}
        {Array.from({ length: 8 }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    )
  }

  // 空状态
  if (agents.length === 0) {
    return (
      <div className={cn('grid', className)} data-testid="agent-grid-empty">
        <EmptyState searchQuery={searchQuery} />
      </div>
    )
  }

  return (
    <div
      className={cn(
        'grid',
        // 响应式间距
        'gap-3 sm:gap-4',
        // 响应式列数 - 更细粒度的断点
        'grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
        className
      )}
      data-testid="agent-grid"
    >
      <GridHeader searchQuery={searchQuery} count={agents.length} />
      
      {agents.map((agent) => (
        <SignalCard
          key={agent.id}
          agent={agent}
          onCardClick={() => onAgentClick?.(agent)}
        />
      ))}
    </div>
  )
}

export const AgentGrid = memo(AgentGridComponent)
AgentGrid.displayName = 'AgentGrid'

export default AgentGrid
