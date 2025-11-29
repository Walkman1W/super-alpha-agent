'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { AgentCard, AgentCardData, AgentCardDataMinimal } from '@/components/agent-card'
import { cn } from '@/lib/utils'
import { ChevronDown, TrendingUp, Clock, Eye, Loader2 } from 'lucide-react'

/**
 * 排序选项类型
 */
export type SortOption = 'popularity' | 'recent' | 'ai_search_count'

/**
 * AgentMarketGrid 组件属性
 */
export interface AgentMarketGridProps {
  /** 初始 Agent 数据列表（首屏数据，精简版） */
  initialAgents: AgentCardDataMinimal[]
  /** 初始排序方式 */
  initialSortBy?: SortOption
  /** 每页显示数量 */
  pageSize?: number
  /** 是否显示 AI 统计 */
  showAIStats?: boolean
  /** 自定义类名 */
  className?: string
}

/**
 * 排序选项配置
 */
const SORT_OPTIONS: { value: SortOption; label: string; icon: React.ReactNode }[] = [
  { value: 'ai_search_count', label: 'AI 搜索热度', icon: <Eye className="w-4 h-4" /> },
  { value: 'popularity', label: '热门程度', icon: <TrendingUp className="w-4 h-4" /> },
  { value: 'recent', label: '最近添加', icon: <Clock className="w-4 h-4" /> },
]

/**
 * 对 Agent 列表进行排序
 * @param agents Agent 列表
 * @param sortBy 排序方式
 * @returns 排序后的列表
 */
export function sortAgents<T extends AgentCardDataMinimal>(agents: T[], sortBy: SortOption): T[] {
  const sorted = [...agents]
  
  switch (sortBy) {
    case 'ai_search_count':
      return sorted.sort((a, b) => (b.ai_search_count ?? 0) - (a.ai_search_count ?? 0))
    case 'popularity':
      // 使用 ai_search_count 作为热门程度的指标
      return sorted.sort((a, b) => (b.ai_search_count ?? 0) - (a.ai_search_count ?? 0))
    case 'recent':
      // 假设 id 是按时间顺序生成的，较新的 id 较大
      return sorted.sort((a, b) => b.id.localeCompare(a.id))
    default:
      return sorted
  }
}

/**
 * AgentMarketGrid 组件
 * 展示 Agent 卡片网格，支持排序和无限滚动
 * 
 * 需求: 3.1, 3.3, 10.4
 */
export function AgentMarketGrid({
  initialAgents,
  initialSortBy = 'ai_search_count',
  pageSize = 12,
  showAIStats = true,
  className,
}: AgentMarketGridProps) {
  const [agents, setAgents] = useState<(AgentCardDataMinimal | AgentCardData)[]>(initialAgents)
  const [sortBy, setSortBy] = useState<SortOption>(initialSortBy)
  const [displayCount, setDisplayCount] = useState(pageSize)
  const [isLoading, setIsLoading] = useState(false)
  const [isSortDropdownOpen, setIsSortDropdownOpen] = useState(false)
  const [hasLoadedAll, setHasLoadedAll] = useState(false)
  const loadMoreRef = useRef<HTMLDivElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // 排序后的 Agent 列表
  const sortedAgents = sortAgents(agents, sortBy)
  
  // 当前显示的 Agent 列表
  const displayedAgents = sortedAgents.slice(0, displayCount)
  
  // 是否还有更多数据
  const hasMore = displayCount < sortedAgents.length || !hasLoadedAll

  // 加载更多
  const loadMore = useCallback(async () => {
    if (isLoading || !hasMore) return
    
    setIsLoading(true)
    
    // 如果本地还有数据，直接显示
    if (displayCount < sortedAgents.length) {
      setTimeout(() => {
        setDisplayCount(prev => Math.min(prev + pageSize, sortedAgents.length))
        setIsLoading(false)
      }, 200)
      return
    }
    
    // 如果本地数据已显示完，从服务器加载更多
    if (!hasLoadedAll) {
      try {
        const response = await fetch(`/api/agents?offset=${agents.length}&limit=${pageSize}`)
        if (response.ok) {
          const newAgents = await response.json()
          if (newAgents.length > 0) {
            setAgents(prev => [...prev, ...newAgents])
            setDisplayCount(prev => prev + newAgents.length)
          } else {
            setHasLoadedAll(true)
          }
        }
      } catch (error) {
        console.error('Failed to load more agents:', error)
      }
    }
    
    setIsLoading(false)
  }, [isLoading, hasMore, displayCount, sortedAgents.length, pageSize, agents.length, hasLoadedAll])

  // 无限滚动 - Intersection Observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !isLoading) {
          loadMore()
        }
      },
      { threshold: 0.1, rootMargin: '100px' }
    )

    const currentRef = loadMoreRef.current
    if (currentRef) {
      observer.observe(currentRef)
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef)
      }
    }
  }, [hasMore, isLoading, loadMore])

  // 点击外部关闭下拉菜单
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsSortDropdownOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // 排序变更时重置显示数量
  const handleSortChange = (newSortBy: SortOption) => {
    setSortBy(newSortBy)
    setDisplayCount(pageSize)
    setIsSortDropdownOpen(false)
  }

  const currentSortOption = SORT_OPTIONS.find(opt => opt.value === sortBy)

  return (
    <div className={cn('w-full', className)}>
      {/* 排序控制栏 */}
      <div className="flex items-center justify-between mb-6 gap-4">
        <div className="text-sm text-gray-500">
          共 <span className="font-semibold text-gray-700">{agents.length}</span> 款 Agent
        </div>
        
        {/* 排序下拉菜单 - 移动端优化 */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setIsSortDropdownOpen(!isSortDropdownOpen)}
            className={cn(
              'flex items-center gap-2 px-4 py-2',
              'bg-white border border-gray-200 rounded-lg',
              'text-sm font-medium text-gray-700',
              'hover:bg-gray-50 hover:border-gray-300',
              'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
              'transition-all duration-200',
              // 移动端触摸优化：确保至少 44x44 像素触摸目标
              'min-h-[44px] min-w-[44px]',
              'sm:min-w-[160px] justify-between',
              // 触摸反馈
              'active:bg-gray-100 touch-manipulation'
            )}
            aria-haspopup="listbox"
            aria-expanded={isSortDropdownOpen}
            aria-label="选择排序方式"
          >
            <span className="flex items-center gap-2">
              {currentSortOption?.icon}
              {/* 移动端隐藏文字，只显示图标 */}
              <span className="hidden sm:inline">{currentSortOption?.label}</span>
            </span>
            <ChevronDown 
              className={cn(
                'w-4 h-4 transition-transform duration-200',
                isSortDropdownOpen && 'rotate-180'
              )} 
            />
          </button>
          
          {isSortDropdownOpen && (
            <div 
              className={cn(
                'absolute right-0 mt-2 min-w-[180px]',
                'bg-white border border-gray-200 rounded-lg shadow-lg',
                'py-1 z-50',
                'animate-in fade-in-0 zoom-in-95 duration-200'
              )}
              role="listbox"
              aria-label="排序选项"
            >
              {SORT_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  onClick={() => handleSortChange(option.value)}
                  className={cn(
                    'w-full flex items-center gap-2 px-4 py-3',
                    'text-sm text-left',
                    'hover:bg-gray-50 transition-colors',
                    // 移动端触摸优化：增加点击区域
                    'min-h-[44px] touch-manipulation',
                    'active:bg-gray-100',
                    sortBy === option.value 
                      ? 'text-blue-600 bg-blue-50 font-medium' 
                      : 'text-gray-700'
                  )}
                  role="option"
                  aria-selected={sortBy === option.value}
                >
                  {option.icon}
                  {option.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Agent 网格 - 响应式布局 */}
      {/* 移动端 (<768px): 单列布局，优化触摸交互 */}
      {/* 平板 (768-1024px): 双列布局 */}
      {/* 桌面 (>1024px): 三列布局 */}
      <div 
        className={cn(
          'grid',
          // 移动端单列，间距更紧凑以适应小屏幕
          'grid-cols-1 gap-4',
          // 平板双列，增加间距
          'md:grid-cols-2 md:gap-6',
          // 桌面三列
          'lg:grid-cols-3'
        )}
        role="list"
        aria-label="Agent 列表"
      >
        {displayedAgents.map((agent) => (
          <div 
            key={agent.id} 
            role="listitem"
            className={cn(
              // 移动端触摸优化：增加点击区域的视觉反馈
              'touch-manipulation',
              // 确保卡片在移动端有足够的触摸目标
              'min-h-[200px]'
            )}
          >
            <AgentCard 
              agent={{
                ...agent,
                key_features: 'key_features' in agent ? agent.key_features : [],
                pros: 'pros' in agent ? agent.pros : [],
                cons: 'cons' in agent ? agent.cons : [],
                use_cases: 'use_cases' in agent ? agent.use_cases : [],
                official_url: 'official_url' in agent ? agent.official_url : null
              }}
              showAIStats={showAIStats}
              className={cn(
                // 移动端优化：增加触摸反馈
                'active:scale-[0.98] active:opacity-90',
                'transition-transform duration-150'
              )}
            />
          </div>
        ))}
      </div>

      {/* 加载更多触发器 / 加载状态 */}
      {hasMore && (
        <div 
          ref={loadMoreRef}
          className="flex justify-center items-center py-8 mt-6"
        >
          {isLoading ? (
            <div className="flex items-center gap-2 text-gray-500">
              <Loader2 className="w-5 h-5 animate-spin" />
              <span className="text-sm">加载中...</span>
            </div>
          ) : (
            <button
              onClick={loadMore}
              className={cn(
                'px-6 py-3 rounded-lg',
                'bg-white border border-gray-200',
                'text-sm font-medium text-gray-700',
                'hover:bg-gray-50 hover:border-gray-300',
                'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
                'transition-all duration-200',
                // 移动端触摸优化：确保至少 44x44 像素触摸目标
                'min-h-[44px] min-w-[120px]',
                'touch-manipulation active:bg-gray-100'
              )}
              aria-label="加载更多 Agent"
            >
              加载更多 ({sortedAgents.length - displayCount} 剩余)
            </button>
          )}
        </div>
      )}

      {/* 空状态 */}
      {agents.length === 0 && (
        <div className="text-center py-20">
          <div className="text-6xl mb-4">🤖</div>
          <h3 className="text-2xl font-bold text-gray-900 mb-2">暂无 Agent 数据</h3>
          <p className="text-gray-600">请稍后再试或运行爬虫获取数据</p>
        </div>
      )}

      {/* 已加载全部 */}
      {!hasMore && agents.length > 0 && displayCount >= agents.length && (
        <div className="text-center py-8 text-gray-500 text-sm">
          已显示全部 {agents.length} 款 Agent
        </div>
      )}
    </div>
  )
}

export default AgentMarketGrid
