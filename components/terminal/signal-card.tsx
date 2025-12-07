'use client'

import { memo, useCallback, MouseEvent } from 'react'
import { cn } from '@/lib/utils'
import { Tooltip } from '@/components/ui/tooltip'
import { 
  getAutonomyTooltipContent, 
  geoScoreTooltip 
} from '@/lib/tooltip-content'
import type { SignalAgent, AgentStatus } from '@/lib/types/agent'
import {
  getEntityIcon,
  getEntityLabel,
  getFrameworkIcon,
  getAutonomyLevelStyle,
  formatLatency,
  formatCost,
  formatStars
} from '@/lib/entity-utils'

export interface SignalCardProps {
  agent: SignalAgent
  onCardClick?: (agent: SignalAgent) => void
  isSelected?: boolean
  className?: string
}

/**
 * 状态指示器组件
 */
function StatusIndicator({ status }: { status: AgentStatus }) {
  const statusConfig: Record<AgentStatus, { dot: string; text: string; textClass: string }> = {
    online: {
      dot: 'bg-emerald-500 animate-pulse',
      text: 'Online',
      textClass: 'text-emerald-400'
    },
    offline: {
      dot: 'bg-red-500',
      text: 'Offline',
      textClass: 'text-red-400'
    },
    maintenance: {
      dot: 'bg-yellow-500 animate-pulse',
      text: 'Maintenance',
      textClass: 'text-yellow-400'
    }
  }

  const config = statusConfig[status]

  return (
    <div className="flex items-center gap-1.5" data-testid="status-indicator">
      <span className={cn('w-1.5 h-1.5 rounded-full', config.dot)} />
      <span className={cn('text-xs font-mono', config.textClass)}>{config.text}</span>
    </div>
  )
}


/**
 * 排名徽章组件
 */
function RankBadge({ rank }: { rank: number }) {
  const isTopTier = rank <= 3

  return (
    <div
      className={cn(
        'flex items-center justify-center w-6 h-6 rounded font-mono text-xs font-bold',
        isTopTier
          ? 'bg-purple-500/20 text-purple-400 border border-purple-500/50'
          : 'bg-zinc-800 text-zinc-400 border border-zinc-700'
      )}
      data-testid="rank-badge"
    >
      #{rank}
    </div>
  )
}

/**
 * 自主等级徽章 Tooltip 内容
 */
function AutonomyTooltipContent({ level }: { level: string }) {
  const def = getAutonomyTooltipContent(level)
  if (!def) return <span>未知等级</span>
  
  return (
    <div className="space-y-1">
      <div className="font-semibold text-zinc-100">
        {def.label} ({def.labelEn})
      </div>
      <div className="text-zinc-300">{def.description}</div>
      <div className="text-zinc-400 text-[10px] mt-1">
        参考: {def.industryRef}
      </div>
    </div>
  )
}

/**
 * GEO 评分 Tooltip 内容
 */
function GeoTooltipContent() {
  return (
    <div className="space-y-2 max-w-[280px]">
      <div className="font-semibold text-zinc-100">{geoScoreTooltip.title}</div>
      <div className="text-zinc-300 text-[11px]">{geoScoreTooltip.description}</div>
      <div className="text-zinc-400 text-[10px] font-mono bg-zinc-900/50 p-1.5 rounded">
        {geoScoreTooltip.formula}
      </div>
    </div>
  )
}


/**
 * SignalCard 组件
 * 终端风格的 Agent 信息卡片
 * 
 * 交互逻辑:
 * - 标题点击: 在新标签页打开 official_url (target="_blank")
 * - 卡片主体点击: 触发 onCardClick 回调（打开抽屉）
 * - 不再导航到 /agents/[slug] 详情页
 * 
 * **Validates: Requirements 5.1, 5.2, 5.5**
 */
function SignalCardComponent({ agent, onCardClick, isSelected, className }: SignalCardProps) {
  const isTopTier = agent.rank <= 3
  const isOffline = agent.status === 'offline'
  const frameworkStyle = getFrameworkIcon(agent.framework)
  const autonomyStyle = getAutonomyLevelStyle(agent.autonomy_level)

  // 标题点击: 在新标签页打开官方 URL
  const handleTitleClick = useCallback((e: MouseEvent<HTMLAnchorElement>) => {
    // 阻止事件冒泡，避免触发卡片点击
    e.stopPropagation()
  }, [])

  // 卡片主体点击: 触发 onCardClick 回调
  const handleCardClick = useCallback(() => {
    onCardClick?.(agent)
  }, [agent, onCardClick])

  // 阻止徽章区域的点击冒泡
  const handleBadgeClick = useCallback((e: MouseEvent) => {
    e.stopPropagation()
  }, [])

  return (
    <div
      onClick={handleCardClick}
      className={cn(
        'group relative cursor-pointer',
        'bg-zinc-900/80 backdrop-blur-sm',
        'rounded-lg p-3 sm:p-4',
        'border border-zinc-800',
        'transition-all duration-200 ease-out',
        'hover:border-zinc-700 sm:hover:-translate-y-1',
        'focus:outline-none focus:ring-1 focus:ring-purple-500/50',
        'active:scale-[0.98] sm:active:scale-100',
        isTopTier && 'ring-1 ring-purple-500/30 shadow-[0_0_20px_rgba(168,85,247,0.15)]',
        isOffline && 'opacity-60',
        isSelected && 'ring-2 ring-purple-500 border-purple-500',
        className
      )}
      role="button"
      tabIndex={0}
      aria-label={`查看 ${agent.name} 详情`}
      data-testid="signal-card"
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          handleCardClick()
        }
      }}
    >
      {/* Top tier 光晕背景 */}
      {isTopTier && (
        <div
          className="absolute inset-0 rounded-lg bg-gradient-to-br from-purple-500/5 via-transparent to-purple-500/5 pointer-events-none"
          aria-hidden="true"
        />
      )}

      {/* 头部: 名称 + 状态 + 排名 */}
      <div className="flex items-start justify-between gap-2 mb-2 sm:mb-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 sm:gap-2 mb-1">
            <span className="text-sm sm:text-base" aria-label={getEntityLabel(agent.entity_type)}>
              {getEntityIcon(agent.entity_type)}
            </span>
            {/* 标题: 点击在新标签页打开官方 URL */}
            {agent.official_url ? (
              <a
                href={agent.official_url}
                target="_blank"
                rel="noopener noreferrer"
                onClick={handleTitleClick}
                className="text-sm sm:text-base font-semibold text-zinc-100 truncate hover:text-purple-300 hover:underline transition-colors"
                data-testid="agent-name-link"
              >
                {agent.name}
              </a>
            ) : (
              <h3
                className="text-sm sm:text-base font-semibold text-zinc-100 truncate group-hover:text-purple-300 transition-colors"
                data-testid="agent-name"
              >
                {agent.name}
              </h3>
            )}
          </div>
          <StatusIndicator status={agent.status} />
        </div>
        <RankBadge rank={agent.rank} />
      </div>

      {/* 描述 */}
      <p
        className="text-xs text-zinc-400 mb-2 sm:mb-3 line-clamp-1 sm:line-clamp-2 leading-relaxed"
        data-testid="agent-description"
      >
        {agent.short_description}
      </p>

      {/* 框架 + 自主等级 (带 Tooltip) */}
      <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mb-2 sm:mb-3" onClick={handleBadgeClick}>
        {agent.framework && (
          <div
            className={cn(
              'flex items-center gap-1 px-1.5 sm:px-2 py-0.5 rounded text-[10px] sm:text-xs font-mono',
              'bg-zinc-800 border border-zinc-700'
            )}
            data-testid="framework-badge"
          >
            <span className={frameworkStyle.color}>{frameworkStyle.icon}</span>
            <span className="text-zinc-300 hidden xs:inline">{agent.framework}</span>
          </div>
        )}
        {/* 自主等级徽章 - 带 Tooltip */}
        <Tooltip
          content={<AutonomyTooltipContent level={agent.autonomy_level} />}
          position="top"
        >
          <div
            className={cn(
              'px-1.5 sm:px-2 py-0.5 rounded text-[10px] sm:text-xs font-mono font-medium cursor-help',
              autonomyStyle.bgColor,
              autonomyStyle.color,
              'border border-current/20'
            )}
            data-testid="autonomy-badge"
          >
            {autonomyStyle.label}
          </div>
        </Tooltip>
      </div>

      {/* 指标 (GEO 评分带 Tooltip) */}
      <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-2 sm:mb-3 font-mono text-[10px] sm:text-xs" data-testid="metrics" onClick={handleBadgeClick}>
        {agent.metrics.latency !== undefined && (
          <div className="flex items-center gap-1">
            <span className="text-zinc-500">⚡</span>
            <span className="text-zinc-300">{formatLatency(agent.metrics.latency)}</span>
          </div>
        )}
        {agent.metrics.cost !== undefined && (
          <div className="flex items-center gap-1">
            <span className="text-zinc-500">💰</span>
            <span className="text-zinc-300">{formatCost(agent.metrics.cost)}</span>
          </div>
        )}
        {agent.metrics.stars !== undefined && (
          <div className="flex items-center gap-1">
            <span className="text-zinc-500">⭐</span>
            <span className="text-zinc-300">{formatStars(agent.metrics.stars)}</span>
          </div>
        )}
        {agent.geo_score > 0 && (
          <Tooltip
            content={<GeoTooltipContent />}
            position="top"
          >
            <div className="flex items-center gap-1 ml-auto cursor-help">
              <span className="text-zinc-500">GEO</span>
              <span className={cn(
                'font-medium',
                agent.geo_score >= 80 ? 'text-green-400' :
                agent.geo_score >= 60 ? 'text-yellow-400' : 'text-zinc-400'
              )}>
                {agent.geo_score}
              </span>
            </div>
          </Tooltip>
        )}
      </div>

      {/* 标签 */}
      {agent.tags && agent.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 sm:gap-1.5" data-testid="tags">
          {agent.tags.slice(0, 2).map((tag, idx) => (
            <span
              key={idx}
              className="px-1.5 sm:px-2 py-0.5 text-[10px] sm:text-xs font-mono text-zinc-400 bg-zinc-800/50 border border-zinc-700/50 rounded sm:hidden"
            >
              {tag}
            </span>
          ))}
          {agent.tags.slice(0, 4).map((tag, idx) => (
            <span
              key={idx}
              className="hidden sm:inline-block px-2 py-0.5 text-xs font-mono text-zinc-400 bg-zinc-800/50 border border-zinc-700/50 rounded"
            >
              {tag}
            </span>
          ))}
          {agent.tags.length > 2 && (
            <span className="px-1.5 py-0.5 text-[10px] font-mono text-zinc-500 sm:hidden">
              +{agent.tags.length - 2}
            </span>
          )}
          {agent.tags.length > 4 && (
            <span className="hidden sm:inline-block px-2 py-0.5 text-xs font-mono text-zinc-500">
              +{agent.tags.length - 4}
            </span>
          )}
        </div>
      )}
    </div>
  )
}

// 使用 memo 优化，只在关键 props 变化时重新渲染
export const SignalCard = memo(SignalCardComponent, (prevProps, nextProps) => {
  return (
    prevProps.agent.id === nextProps.agent.id &&
    prevProps.agent.status === nextProps.agent.status &&
    prevProps.agent.rank === nextProps.agent.rank &&
    prevProps.agent.geo_score === nextProps.agent.geo_score &&
    prevProps.isSelected === nextProps.isSelected &&
    prevProps.className === nextProps.className
  )
})

SignalCard.displayName = 'SignalCard'

export default SignalCard
