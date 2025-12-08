'use client'

import { useState, useCallback, useMemo, memo } from 'react'
import { cn } from '@/lib/utils'
import { SignalCard } from './signal-card'
import type { SignalAgent } from '@/lib/types/agent'

interface Category {
  id: string
  name: string
  icon: string
  slug: string
}

interface AgentWindowProps {
  agents: SignalAgent[]
  categories: Category[]
  totalCount: number
  selectedCategory: string | null
  onCategoryChange: (categoryId: string | null) => void
  onAgentClick?: (agent: SignalAgent) => void
  className?: string
}

const WINDOW_SIZE = 16

/**
 * 窗口标题栏
 */
function WindowTitleBar() {
  return (
    <div className="flex items-center gap-2 px-4 py-2 bg-zinc-900 border-b border-zinc-800 rounded-t-lg">
      <div className="flex gap-1.5">
        <span className="w-3 h-3 rounded-full bg-red-500/80" />
        <span className="w-3 h-3 rounded-full bg-yellow-500/80" />
        <span className="w-3 h-3 rounded-full bg-green-500/80" />
      </div>
      <span className="ml-2 text-xs font-mono text-zinc-500">agents.signal</span>
    </div>
  )
}

/**
 * 分类 Tab 栏
 */
function CategoryTabs({
  categories,
  selectedCategory,
  onCategoryChange
}: {
  categories: Category[]
  selectedCategory: string | null
  onCategoryChange: (categoryId: string | null) => void
}) {
  return (
    <div className="flex items-center gap-1 px-3 py-2 bg-zinc-900/50 border-b border-zinc-800 overflow-x-auto scrollbar-hide">
      <button
        onClick={() => onCategoryChange(null)}
        className={cn(
          'px-3 py-1.5 text-xs font-mono rounded-md whitespace-nowrap transition-all',
          selectedCategory === null
            ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
            : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800'
        )}
      >
        All
      </button>
      {categories.map(cat => (
        <button
          key={cat.id}
          onClick={() => onCategoryChange(cat.id)}
          className={cn(
            'px-3 py-1.5 text-xs font-mono rounded-md whitespace-nowrap transition-all flex items-center gap-1.5',
            selectedCategory === cat.id
              ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
              : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800'
          )}
        >
          <span>{cat.icon}</span>
          <span>{cat.name}</span>
        </button>
      ))}
    </div>
  )
}

/**
 * 范围滑块
 */
function RangeSlider({
  current,
  total,
  windowSize,
  onChange
}: {
  current: number
  total: number
  windowSize: number
  onChange: (start: number) => void
}) {
  const maxStart = Math.max(0, total - windowSize)
  const percentage = maxStart > 0 ? (current / maxStart) * 100 : 0

  return (
    <div className="flex items-center gap-3 px-4 py-2 bg-zinc-900/50 border-t border-zinc-800">
      <span className="text-xs font-mono text-zinc-500">
        {current + 1}-{Math.min(current + windowSize, total)} / {total}
      </span>
      <div className="flex-1 relative h-1.5 bg-zinc-800 rounded-full">
        <div
          className="absolute top-0 left-0 h-full bg-purple-500/50 rounded-full"
          style={{ width: `${Math.min(100, (windowSize / total) * 100)}%`, left: `${percentage * (1 - windowSize / total)}%` }}
        />
        <input
          type="range"
          min={0}
          max={maxStart}
          value={current}
          onChange={(e) => onChange(Number(e.target.value))}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />
      </div>
      <div className="flex gap-1">
        <button
          onClick={() => onChange(Math.max(0, current - windowSize))}
          disabled={current === 0}
          className="p-1 text-zinc-500 hover:text-zinc-300 disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <button
          onClick={() => onChange(Math.min(maxStart, current + windowSize))}
          disabled={current >= maxStart}
          className="p-1 text-zinc-500 hover:text-zinc-300 disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </div>
  )
}

/**
 * 空状态
 */
function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="w-16 h-16 mb-4 rounded-full bg-zinc-800/50 flex items-center justify-center">
        <span className="text-3xl">📡</span>
      </div>
      <h3 className="text-lg font-semibold text-zinc-300 mb-2">No signals detected</h3>
      <p className="text-sm text-zinc-500">Try adjusting your filters</p>
    </div>
  )
}

/**
 * Agent 窗口组件
 */
function AgentWindowComponent({
  agents,
  categories,
  totalCount,
  selectedCategory,
  onCategoryChange,
  onAgentClick,
  className
}: AgentWindowProps) {
  const [windowStart, setWindowStart] = useState(0)

  // 当过滤条件变化时重置窗口位置
  const handleCategoryChange = useCallback((categoryId: string | null) => {
    setWindowStart(0)
    onCategoryChange(categoryId)
  }, [onCategoryChange])

  // 当前窗口显示的 agents
  const visibleAgents = useMemo(() => {
    return agents.slice(windowStart, windowStart + WINDOW_SIZE)
  }, [agents, windowStart])

  return (
    <div className={cn('flex flex-col bg-zinc-950 border border-zinc-800 rounded-lg overflow-hidden', className)}>
      {/* 标题栏 */}
      <WindowTitleBar />

      {/* 分类 Tab */}
      <CategoryTabs
        categories={categories}
        selectedCategory={selectedCategory}
        onCategoryChange={handleCategoryChange}
      />

      {/* 卡片网格 */}
      <div className="flex-1 p-4 overflow-hidden">
        {agents.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {visibleAgents.map((agent) => (
              <SignalCard
                key={agent.id}
                agent={agent}
                onCardClick={() => onAgentClick?.(agent)}
              />
            ))}
          </div>
        )}
      </div>

      {/* 范围滑块 */}
      {agents.length > WINDOW_SIZE && (
        <RangeSlider
          current={windowStart}
          total={agents.length}
          windowSize={WINDOW_SIZE}
          onChange={setWindowStart}
        />
      )}
    </div>
  )
}

export const AgentWindow = memo(AgentWindowComponent)
AgentWindow.displayName = 'AgentWindow'

export default AgentWindow
