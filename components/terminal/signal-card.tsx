'use client'

import Link from 'next/link'
import { memo } from 'react'
import { cn } from '@/lib/utils'
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
  onClick?: () => void
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
 * SignalCard 组件
 * 终端风格的 Agent 信息卡片
 * 
 * **Validates: Requirements 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7**
 */
function SignalCardComponent({ agent, onClick, className }: SignalCardProps) {
  const isTopTier = agent.rank <= 3
  const isOffline = agent.status === 'offline'
  const frameworkStyle = getFrameworkIcon(agent.framework)
  const autonomyStyle = getAutonomyLevelStyle(agent.autonomy_level)

  return (
    <Link
      href={`/agents/${agent.slug}`}
      onClick={onClick}
      className={cn(
        'group block relative',
        'bg-zinc-900/80 backdrop-blur-sm',
        'rounded-lg p-4',
        'border border-zinc-800',
        'transition-all duration-200 ease-out',
        'hover:border-zinc-700 hover:-translate-y-1',
        'focus:outline-none focus:ring-1 focus:ring-purple-500/50',
        // Top tier 紫色光晕效果
        isTopTier && 'ring-1 ring-purple-500/30 shadow-[0_0_20px_rgba(168,85,247,0.15)]',
        // 离线状态样式
        isOffline && 'opacity-60',
        className
      )}
      aria-label={`查看 ${agent.name} 详情`}
      data-testid="signal-card"
    >
      {/* Top tier 光晕背景 */}
      {isTopTier && (
        <div
          className="absolute inset-0 rounded-lg bg-gradient-to-br from-purple-500/5 via-transparent to-purple-500/5 pointer-events-none"
          aria-hidden="true"
        />
      )}

      {/* 头部: 名称 + 状态 + 排名 */}
      <div className="flex items-start justify-between gap-2 mb-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-base" aria-label={getEntityLabel(agent.entity_type)}>
              {getEntityIcon(agent.entity_type)}
            </span>
            <h3
              className="font-semibold text-zinc-100 truncate group-hover:text-purple-300 transition-colors"
              data-testid="agent-name"
            >
              {agent.name}
            </h3>
          </div>
          <StatusIndicator status={agent.status} />
        </div>
        <RankBadge rank={agent.rank} />
      </div>

      {/* 描述 */}
      <p
        className="text-xs text-zinc-400 mb-3 line-clamp-2 leading-relaxed"
        data-testid="agent-description"
      >
        {agent.short_description}
      </p>

      {/* 框架 + 自主等级 */}
      <div className="flex items-center gap-2 mb-3">
        {agent.framework && (
          <div
            className={cn(
              'flex items-center gap-1 px-2 py-0.5 rounded text-xs font-mono',
              'bg-zinc-800 border border-zinc-700'
            )}
            data-testid="framework-badge"
          >
            <span className={frameworkStyle.color}>{frameworkStyle.icon}</span>
            <span className="text-zinc-300">{agent.framework}</span>
          </div>
        )}
        <div
          className={cn(
            'px-2 py-0.5 rounded text-xs font-mono font-medium',
            autonomyStyle.bgColor,
            autonomyStyle.color,
            'border border-current/20'
          )}
          title={autonomyStyle.description}
          data-testid="autonomy-badge"
        >
          {autonomyStyle.label}
        </div>
      </div>

      {/* 指标 */}
      <div className="flex items-center gap-3 mb-3 font-mono text-xs" data-testid="metrics">
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
          <div className="flex items-center gap-1 ml-auto">
            <span className="text-zinc-500">GEO</span>
            <span className={cn(
              'font-medium',
              agent.geo_score >= 80 ? 'text-green-400' :
              agent.geo_score >= 60 ? 'text-yellow-400' : 'text-zinc-400'
            )}>
              {agent.geo_score}
            </span>
          </div>
        )}
      </div>

      {/* 标签 */}
      {agent.tags && agent.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5" data-testid="tags">
          {agent.tags.slice(0, 4).map((tag, idx) => (
            <span
              key={idx}
              className="px-2 py-0.5 text-xs font-mono text-zinc-400 bg-zinc-800/50 border border-zinc-700/50 rounded"
            >
              {tag}
            </span>
          ))}
          {agent.tags.length > 4 && (
            <span className="px-2 py-0.5 text-xs font-mono text-zinc-500">
              +{agent.tags.length - 4}
            </span>
          )}
        </div>
      )}
    </Link>
  )
}

// 使用 memo 优化，只在关键 props 变化时重新渲染
export const SignalCard = memo(SignalCardComponent, (prevProps, nextProps) => {
  return (
    prevProps.agent.id === nextProps.agent.id &&
    prevProps.agent.status === nextProps.agent.status &&
    prevProps.agent.rank === nextProps.agent.rank &&
    prevProps.agent.geo_score === nextProps.agent.geo_score &&
    prevProps.className === nextProps.className
  )
})

SignalCard.displayName = 'SignalCard'

export default SignalCard
