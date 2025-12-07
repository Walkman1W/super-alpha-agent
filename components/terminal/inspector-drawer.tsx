'use client'

import { useEffect, useCallback, useState } from 'react'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'
import { RadarChart } from './radar-chart'
import type { SignalAgent } from '@/lib/types/agent'
import {
  getEntityIcon,
  getEntityLabel,
  getAutonomyLevelStyle,
  generateApiSnippet,
  formatLatency,
  formatCost,
  formatStars
} from '@/lib/entity-utils'

interface InspectorDrawerProps {
  agent: SignalAgent | null
  isOpen: boolean
  onClose: () => void
}

/**
 * 代码片段显示组件
 */
function CodeSnippet({ code, language = 'javascript' }: { code: string; language?: string }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = useCallback(async () => {
    await navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }, [code])

  return (
    <div className="relative group">
      <pre className="bg-zinc-950 border border-zinc-800 rounded-lg p-4 overflow-x-auto text-xs font-mono text-zinc-300">
        <code>{code}</code>
      </pre>
      <button
        onClick={handleCopy}
        className={cn(
          'absolute top-2 right-2 px-2 py-1 text-xs font-mono rounded',
          'bg-zinc-800 border border-zinc-700',
          'opacity-0 group-hover:opacity-100 transition-opacity',
          copied ? 'text-green-400' : 'text-zinc-400 hover:text-zinc-200'
        )}
      >
        {copied ? '✓ Copied' : 'Copy'}
      </button>
    </div>
  )
}

/**
 * 从 Agent 数据生成雷达图数据
 * 基于 metrics 和其他属性估算能力值
 */
function generateRadarData(agent: SignalAgent) {
  const baseScore = agent.geo_score || 50
  
  // 基于 autonomy_level 调整基础分
  const autonomyBonus: Record<string, number> = {
    L1: 0, L2: 5, L3: 10, L4: 15, L5: 20
  }
  const bonus = autonomyBonus[agent.autonomy_level] || 0

  // 基于 metrics 调整各维度
  const latencyScore = agent.metrics.latency 
    ? Math.max(0, 100 - agent.metrics.latency / 20) 
    : 70
  const stabilityScore = agent.metrics.uptime || 85

  return {
    coding: Math.min(100, baseScore + bonus + Math.random() * 10),
    writing: Math.min(100, baseScore + bonus - 5 + Math.random() * 10),
    reasoning: Math.min(100, baseScore + bonus + 5 + Math.random() * 10),
    speed: Math.min(100, latencyScore),
    stability: Math.min(100, stabilityScore)
  }
}

/**
 * InspectorDrawer 组件
 * 右侧滑入的 Agent 详情抽屉
 * 
 * **Validates: Requirements 7.1, 7.2, 7.3, 7.4, 7.5**
 */
export function InspectorDrawer({ agent, isOpen, onClose }: InspectorDrawerProps) {
  const router = useRouter()

  // ESC 键关闭
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    if (isOpen) {
      document.addEventListener('keydown', handleEsc)
      document.body.style.overflow = 'hidden'
    }
    return () => {
      document.removeEventListener('keydown', handleEsc)
      document.body.style.overflow = ''
    }
  }, [isOpen, onClose])

  if (!agent) return null

  const autonomyStyle = getAutonomyLevelStyle(agent.autonomy_level)
  const apiSnippet = generateApiSnippet(agent)
  const radarData = generateRadarData(agent)

  return (
    <>
      {/* Backdrop */}
      <div
        className={cn(
          'fixed inset-0 z-40 bg-black/60 backdrop-blur-sm transition-opacity duration-300',
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        )}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer */}
      <aside
        className={cn(
          'fixed right-0 top-0 z-50 h-full w-full max-w-lg',
          'bg-zinc-900 border-l border-zinc-800',
          'transform transition-transform duration-300 ease-out',
          'overflow-y-auto',
          isOpen ? 'translate-x-0' : 'translate-x-full'
        )}
        role="dialog"
        aria-modal="true"
        aria-labelledby="inspector-title"
        data-testid="inspector-drawer"
      >
        {/* Header */}
        <div className="sticky top-0 z-10 bg-zinc-900/95 backdrop-blur-sm border-b border-zinc-800 p-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xl">{getEntityIcon(agent.entity_type)}</span>
                <h2 
                  id="inspector-title"
                  className="text-xl font-bold text-zinc-100 truncate"
                >
                  {agent.name}
                </h2>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <span className="text-zinc-500">{getEntityLabel(agent.entity_type)}</span>
                <span className="text-zinc-700">•</span>
                <span className={cn('font-mono', autonomyStyle.color)}>
                  {autonomyStyle.label}
                </span>
                <span className="text-zinc-700">•</span>
                <span className={cn(
                  'font-mono',
                  agent.status === 'online' ? 'text-emerald-400' : 
                  agent.status === 'offline' ? 'text-red-400' : 'text-yellow-400'
                )}>
                  {agent.status}
                </span>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 rounded-lg transition-colors"
              aria-label="Close inspector"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 space-y-6">
          {/* Description */}
          <section>
            <p className="text-sm text-zinc-400 leading-relaxed">
              {agent.short_description}
            </p>
          </section>

          {/* Metrics */}
          <section>
            <h3 className="text-xs font-mono text-zinc-500 uppercase tracking-wider mb-3">
              Metrics
            </h3>
            <div className="grid grid-cols-3 gap-3">
              {agent.metrics.latency !== undefined && (
                <div className="bg-zinc-800/50 rounded-lg p-3 text-center">
                  <div className="text-lg font-mono text-zinc-200">
                    {formatLatency(agent.metrics.latency)}
                  </div>
                  <div className="text-xs text-zinc-500">Latency</div>
                </div>
              )}
              {agent.metrics.cost !== undefined && (
                <div className="bg-zinc-800/50 rounded-lg p-3 text-center">
                  <div className="text-lg font-mono text-zinc-200">
                    {formatCost(agent.metrics.cost)}
                  </div>
                  <div className="text-xs text-zinc-500">Cost</div>
                </div>
              )}
              {agent.metrics.stars !== undefined && (
                <div className="bg-zinc-800/50 rounded-lg p-3 text-center">
                  <div className="text-lg font-mono text-zinc-200">
                    {formatStars(agent.metrics.stars)}
                  </div>
                  <div className="text-xs text-zinc-500">Stars</div>
                </div>
              )}
              <div className="bg-zinc-800/50 rounded-lg p-3 text-center">
                <div className="text-lg font-mono text-purple-400">
                  {agent.geo_score}
                </div>
                <div className="text-xs text-zinc-500">GEO Score</div>
              </div>
              <div className="bg-zinc-800/50 rounded-lg p-3 text-center">
                <div className="text-lg font-mono text-zinc-200">
                  #{agent.rank}
                </div>
                <div className="text-xs text-zinc-500">Rank</div>
              </div>
            </div>
          </section>

          {/* Radar Chart */}
          <section>
            <h3 className="text-xs font-mono text-zinc-500 uppercase tracking-wider mb-3">
              Capabilities
            </h3>
            <div className="bg-zinc-800/30 rounded-lg p-2">
              <RadarChart data={radarData} />
            </div>
          </section>

          {/* Tags */}
          {agent.tags && agent.tags.length > 0 && (
            <section>
              <h3 className="text-xs font-mono text-zinc-500 uppercase tracking-wider mb-3">
                Tags
              </h3>
              <div className="flex flex-wrap gap-2">
                {agent.tags.map((tag, idx) => (
                  <span
                    key={idx}
                    className="px-2 py-1 text-xs font-mono text-zinc-400 bg-zinc-800 border border-zinc-700 rounded"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </section>
          )}

          {/* API Snippet */}
          <section>
            <h3 className="text-xs font-mono text-zinc-500 uppercase tracking-wider mb-3">
              Quick Start
            </h3>
            <CodeSnippet code={apiSnippet} />
          </section>

          {/* Actions */}
          <section className="pt-4 border-t border-zinc-800">
            <div className="flex gap-3">
              {agent.official_url && (
                <a
                  href={agent.official_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={cn(
                    'flex-1 flex items-center justify-center gap-2',
                    'px-4 py-3 rounded-lg font-medium text-sm',
                    'bg-purple-600 text-white',
                    'hover:bg-purple-500 transition-colors'
                  )}
                  data-testid="visit-site-button"
                >
                  <span>🌐</span>
                  Visit Site
                </a>
              )}
              <button
                onClick={() => router.push('/publish')}
                className={cn(
                  'flex-1 flex items-center justify-center gap-2',
                  'px-4 py-3 rounded-lg font-medium text-sm',
                  'bg-emerald-600 text-white',
                  'hover:bg-emerald-500 transition-colors'
                )}
                data-testid="publish-agent-button"
              >
                <span>🚀</span>
                Publish Agent
              </button>
            </div>
            <button
              className={cn(
                'w-full mt-3 flex items-center justify-center gap-2',
                'px-4 py-3 rounded-lg font-medium text-sm',
                'bg-zinc-800/50 text-zinc-400 border border-zinc-700/50',
                'hover:bg-zinc-800 hover:text-zinc-200 transition-colors'
              )}
            >
              <span>🏷️</span>
              Claim This Signal
            </button>
          </section>
        </div>
      </aside>
    </>
  )
}

export default InspectorDrawer
