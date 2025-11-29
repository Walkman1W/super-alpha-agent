'use client'

import Link from 'next/link'
import { memo } from 'react'
import { Eye, ExternalLink, Sparkles, Target, ThumbsUp } from 'lucide-react'
import { cn } from '@/lib/utils'

/**
 * Agent 数据类型（完整版）
 */
export interface AgentCardData {
  id: string
  slug: string
  name: string
  short_description: string
  platform?: string | null
  key_features?: string[]
  pros?: string[]
  cons?: string[]
  use_cases?: string[]
  pricing?: string | null
  official_url?: string | null
  ai_search_count?: number
  ai_search_breakdown?: Record<string, number>
}

/**
 * Agent 数据类型（精简版，用于首屏加载）
 */
export interface AgentCardDataMinimal {
  id: string
  slug: string
  name: string
  short_description: string
  platform?: string | null
  pricing?: string | null
  ai_search_count?: number
}

/**
 * AgentCard 组件属性
 */
export interface AgentCardProps {
  agent: AgentCardData
  showAIStats?: boolean
  className?: string
}

/**
 * 格式化大数字
 * - 小于 1000: 显示原数字
 * - 1000-999999: 显示 K 格式 (如 1.2K)
 * - 1000000+: 显示 M 格式 (如 1.5M)
 * @param num 要格式化的数字
 * @returns 格式化后的字符串
 */
export function formatNumber(num: number): string {
  if (num < 1000) {
    return num.toString()
  }
  
  if (num < 1000000) {
    const formatted = (num / 1000).toFixed(1)
    // 移除不必要的 .0
    return formatted.endsWith('.0') 
      ? `${Math.floor(num / 1000)}K` 
      : `${formatted}K`
  }
  
  const formatted = (num / 1000000).toFixed(1)
  return formatted.endsWith('.0') 
    ? `${Math.floor(num / 1000000)}M` 
    : `${formatted}M`
}

/**
 * 格式化数字为带分隔符的格式
 * @param num 要格式化的数字
 * @returns 带千位分隔符的字符串
 */
export function formatNumberWithSeparator(num: number): string {
  return num.toLocaleString('en-US')
}


/**
 * AI 搜索统计徽章组件 - 使用 memo 优化
 */
const AIStatsBadge = memo(({ count }: { count: number }) => {
  return (
    <div className="flex items-center gap-1.5 px-2.5 py-1 bg-gradient-to-r from-purple-100 to-blue-100 text-purple-700 rounded-full text-xs font-semibold">
      <Eye className="w-3.5 h-3.5" aria-hidden="true" />
      <span>{formatNumber(count)}</span>
      <span className="text-purple-500">AI 搜索</span>
    </div>
  )
})

AIStatsBadge.displayName = 'AIStatsBadge'

/**
 * AgentCard 组件
 * 展示单个 Agent 的摘要信息，包含 AI 搜索统计
 * 
 * 需求: 3.2, 3.4, 8.1, 8.5
 * 
 * 性能优化：使用 memo 避免不必要的重渲染
 */
const AgentCardComponent = ({ agent, showAIStats = true, className }: AgentCardProps) => {
  const hasAIStats = showAIStats && typeof agent.ai_search_count === 'number' && agent.ai_search_count > 0
  
  return (
    <Link 
      href={`/agents/${agent.slug}`}
      className={cn(
        'group block relative',
        'bg-white/80 backdrop-blur-sm',
        'rounded-2xl p-6',
        'border border-gray-200/50',
        'transition-all duration-300 ease-out',
        'hover:border-blue-500/50 hover:-translate-y-2 hover:shadow-2xl',
        'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
        className
      )}
      aria-label={`查看 ${agent.name} 详情`}
    >
      {/* 渐变发光效果 */}
      <div 
        className="absolute inset-0 rounded-2xl bg-gradient-to-br from-blue-500/20 via-purple-500/20 to-cyan-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10 blur-xl" 
        aria-hidden="true"
      />
      
      {/* 顶部光效条 */}
      <div 
        className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-cyan-500 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-t-2xl" 
        aria-hidden="true"
      />
      
      {/* 内容区域 */}
      <article 
        itemScope 
        itemType="https://schema.org/SoftwareApplication"
        className="relative z-10"
      >
        {/* 头部: 名称 + 平台 + AI统计 */}
        <div className="flex items-start justify-between mb-4 gap-2">
          <h3 
            className="font-bold text-xl text-gray-900 group-hover:text-blue-600 transition-colors flex-1 line-clamp-1" 
            itemProp="name"
          >
            {agent.name}
          </h3>
          <div className="flex items-center gap-2 flex-shrink-0">
            {agent.platform && (
              <span className="text-xs bg-blue-100 text-blue-700 px-3 py-1 rounded-full font-medium">
                {agent.platform}
              </span>
            )}
          </div>
        </div>
        
        {/* AI 搜索统计 */}
        {hasAIStats && (
          <div className="mb-4">
            <AIStatsBadge count={agent.ai_search_count!} />
          </div>
        )}
        
        {/* 描述 */}
        <p 
          className="text-gray-600 text-sm mb-4 line-clamp-2 leading-relaxed" 
          itemProp="description"
        >
          {agent.short_description}
        </p>
        
        {/* 核心功能 */}
        {agent.key_features && Array.isArray(agent.key_features) && agent.key_features.length > 0 && (
          <div className="mb-4">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 mb-2">
              <Sparkles className="w-3.5 h-3.5" aria-hidden="true" />
              <span>核心功能</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {agent.key_features.slice(0, 3).map((feature, idx) => (
                <span 
                  key={idx} 
                  className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded-lg transition-colors group-hover:bg-blue-100" 
                  itemProp="featureList"
                >
                  {feature}
                </span>
              ))}
            </div>
          </div>
        )}
        
        {/* 优势 */}
        {agent.pros && Array.isArray(agent.pros) && agent.pros.length > 0 && (
          <div className="mb-4">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-green-600 mb-2">
              <ThumbsUp className="w-3.5 h-3.5" aria-hidden="true" />
              <span>优势</span>
            </div>
            <ul className="text-xs text-gray-600 space-y-1">
              {agent.pros.slice(0, 2).map((pro, idx) => (
                <li key={idx} className="flex items-start gap-1">
                  <span className="text-green-500 mt-0.5">•</span>
                  <span className="line-clamp-1">{pro}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
        
        {/* 适用场景 */}
        {agent.use_cases && Array.isArray(agent.use_cases) && agent.use_cases.length > 0 && (
          <div className="mb-4">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-purple-600 mb-2">
              <Target className="w-3.5 h-3.5" aria-hidden="true" />
              <span>适用场景</span>
            </div>
            <div className="text-xs text-gray-600">{agent.use_cases.slice(0, 2).join(' · ')}</div>
          </div>
        )}
        
        {/* 底部: 价格 + 访问链接 */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
          {agent.pricing && (
            <span 
              className="text-xs font-semibold text-gray-700" 
              itemProp="offers" 
              itemScope 
              itemType="https://schema.org/Offer"
            >
              <span itemProp="price">💰 {agent.pricing}</span>
            </span>
          )}
          <span 
            className="text-xs text-blue-600 group-hover:text-blue-700 font-medium flex items-center gap-1 ml-auto"
          >
            查看详情
            <ExternalLink className="w-3 h-3 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
          </span>
        </div>
      </article>
    </Link>
  )
}

// 使用 memo 优化，只在 props 变化时重新渲染
export const AgentCard = memo(AgentCardComponent, (prevProps, nextProps) => {
  // 自定义比较函数：只比较关键属性
  return (
    prevProps.agent.id === nextProps.agent.id &&
    prevProps.agent.ai_search_count === nextProps.agent.ai_search_count &&
    prevProps.showAIStats === nextProps.showAIStats &&
    prevProps.className === nextProps.className
  )
})

AgentCard.displayName = 'AgentCard'

export default AgentCard
