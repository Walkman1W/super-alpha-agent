'use client'

import { memo } from 'react'
import { cn } from '@/lib/utils'
import type { ScanResponse, DiagnosticItem, SRTier } from '@/lib/types/scanner'

interface ScanResultsProps {
  result: ScanResponse
  onRescan?: () => void
  isRescanning?: boolean
}

/**
 * 扫描结果展示组件
 * 
 * 显示 SR 分数、等级徽章、轨道类型和诊断指标
 * Requirements: 5.1-5.5
 */
function ScanResultsComponent({ result, onRescan, isRescanning }: ScanResultsProps) {
  const { agent, isCached, cacheAge, diagnostics } = result

  return (
    <div className="space-y-6">
      {/* 主评分卡片 */}
      <div className={cn(
        'p-6 md:p-8 rounded-2xl',
        'bg-zinc-900/80 backdrop-blur-sm',
        'border border-zinc-800'
      )}>
        {/* 头部: 名称 + 缓存状态 */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">
              {agent.name}
            </h2>
            {agent.description && (
              <p className="text-zinc-400 text-sm md:text-base max-w-xl">
                {agent.description}
              </p>
            )}
          </div>
          
          {/* 缓存状态 */}
          {isCached && cacheAge !== undefined && (
            <div className="flex items-center gap-2 text-zinc-500 text-xs">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>缓存于 {formatCacheAge(cacheAge)} 前</span>
            </div>
          )}
        </div>

        {/* 评分区域 */}
        <div className="flex flex-col md:flex-row items-start md:items-center gap-6 md:gap-12">
          {/* SR 分数 */}
          <div className="flex items-center gap-4">
            <div className="text-center">
              <div className={cn(
                'text-5xl md:text-6xl font-bold font-mono',
                getTierColor(agent.srTier)
              )}>
                {agent.srScore.toFixed(1)}
              </div>
              <div className="text-zinc-500 text-sm uppercase tracking-wider mt-1">
                Signal Rank
              </div>
            </div>
            
            {/* 等级徽章 */}
            <TierBadge tier={agent.srTier} />
          </div>

          {/* 轨道类型 + 标签 */}
          <div className="flex flex-wrap items-center gap-3">
            {/* 轨道类型 */}
            <TrackBadge track={agent.srTrack} />
            
            {/* MCP 标签 */}
            {agent.isMcp && (
              <span className={cn(
                'px-3 py-1 rounded-full text-xs font-mono font-medium',
                'bg-purple-500/20 text-purple-400 border border-purple-500/30'
              )}>
                MCP-Ready
              </span>
            )}
            
            {/* 已验证标签 */}
            {agent.isVerified && (
              <span className={cn(
                'px-3 py-1 rounded-full text-xs font-medium',
                'bg-[#00FF94]/20 text-[#00FF94] border border-[#00FF94]/30',
                'flex items-center gap-1'
              )}>
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                </svg>
                Verified
              </span>
            )}
          </div>
        </div>

        {/* I/O 模态 */}
        {(agent.inputTypes.length > 0 || agent.outputTypes.length > 0) && (
          <div className="mt-6 pt-6 border-t border-zinc-800">
            <div className="flex flex-wrap gap-4">
              {agent.inputTypes.length > 0 && (
                <div className="flex items-center gap-2">
                  <span className="text-zinc-500 text-sm">IN:</span>
                  <div className="flex gap-1">
                    {agent.inputTypes.map((type, i) => (
                      <IOTag key={i} type={type} />
                    ))}
                  </div>
                </div>
              )}
              {agent.outputTypes.length > 0 && (
                <div className="flex items-center gap-2">
                  <span className="text-zinc-500 text-sm">OUT:</span>
                  <div className="flex gap-1">
                    {agent.outputTypes.map((type, i) => (
                      <IOTag key={i} type={type} />
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* 重新扫描按钮 */}
        {onRescan && (
          <div className="mt-6 pt-6 border-t border-zinc-800 flex justify-end">
            <button
              onClick={onRescan}
              disabled={isRescanning}
              className={cn(
                'px-4 py-2 rounded-lg text-sm font-medium',
                'bg-zinc-800 text-zinc-300 border border-zinc-700',
                'hover:bg-zinc-700 hover:text-white',
                'disabled:opacity-50 disabled:cursor-not-allowed',
                'transition-colors'
              )}
            >
              {isRescanning ? '扫描中...' : '重新扫描'}
            </button>
          </div>
        )}
      </div>

      {/* 诊断指标卡片 */}
      <div className={cn(
        'p-6 rounded-2xl',
        'bg-zinc-900/80 backdrop-blur-sm',
        'border border-zinc-800'
      )}>
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <svg className="w-5 h-5 text-[#00FF94]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          诊断报告
        </h3>
        
        <div className="grid gap-3">
          {diagnostics.map((item, index) => (
            <DiagnosticRow key={index} item={item} />
          ))}
        </div>
      </div>
    </div>
  )
}

/**
 * 等级徽章组件
 */
function TierBadge({ tier }: { tier: SRTier }) {
  const config: Record<SRTier, { bg: string; text: string; label: string }> = {
    S: { bg: 'bg-[#00FF94]/20', text: 'text-[#00FF94]', label: 'Tier S' },
    A: { bg: 'bg-blue-500/20', text: 'text-blue-400', label: 'Tier A' },
    B: { bg: 'bg-yellow-500/20', text: 'text-yellow-400', label: 'Tier B' },
    C: { bg: 'bg-zinc-500/20', text: 'text-zinc-400', label: 'Tier C' }
  }
  
  const { bg, text, label } = config[tier]
  
  return (
    <div className={cn(
      'w-16 h-16 rounded-xl flex flex-col items-center justify-center',
      bg, 'border border-current/20'
    )}>
      <span className={cn('text-2xl font-bold', text)}>{tier}</span>
      <span className={cn('text-[10px] uppercase tracking-wider', text)}>{label.split(' ')[0]}</span>
    </div>
  )
}

/**
 * 轨道类型徽章
 */
function TrackBadge({ track }: { track: string }) {
  const config: Record<string, { icon: string; label: string; color: string }> = {
    OpenSource: { icon: '🔓', label: 'Open Source', color: 'text-green-400' },
    SaaS: { icon: '☁️', label: 'SaaS', color: 'text-blue-400' },
    Hybrid: { icon: '🔀', label: 'Hybrid', color: 'text-purple-400' }
  }
  
  const { icon, label, color } = config[track] || config.SaaS
  
  return (
    <span className={cn(
      'px-3 py-1 rounded-full text-xs font-medium',
      'bg-zinc-800 border border-zinc-700',
      'flex items-center gap-1.5'
    )}>
      <span>{icon}</span>
      <span className={color}>{label}</span>
    </span>
  )
}

/**
 * I/O 模态标签
 */
function IOTag({ type }: { type: string }) {
  return (
    <span className={cn(
      'px-2 py-0.5 rounded text-xs font-mono',
      'bg-zinc-800 text-zinc-300 border border-zinc-700'
    )}>
      {type}
    </span>
  )
}

/**
 * 诊断行组件
 */
function DiagnosticRow({ item }: { item: DiagnosticItem }) {
  const statusConfig = {
    pass: { icon: '✓', color: 'text-[#00FF94]', bg: 'bg-[#00FF94]/10' },
    fail: { icon: '✗', color: 'text-red-400', bg: 'bg-red-500/10' },
    warning: { icon: '!', color: 'text-yellow-400', bg: 'bg-yellow-500/10' }
  }
  
  const { icon, color, bg } = statusConfig[item.status]
  
  return (
    <div className={cn(
      'p-4 rounded-xl',
      bg,
      'border border-zinc-800'
    )}>
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          {/* 状态图标 */}
          <div className={cn(
            'w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0',
            'bg-zinc-900 border border-current/30',
            color
          )}>
            <span className="text-xs font-bold">{icon}</span>
          </div>
          
          {/* 指标信息 */}
          <div>
            <div className="text-white font-medium">{item.metric}</div>
            {item.suggestion && (
              <p className="text-zinc-400 text-sm mt-1">{item.suggestion}</p>
            )}
          </div>
        </div>
        
        {/* 分数 */}
        <div className="text-right flex-shrink-0">
          <span className={cn('font-mono font-bold', color)}>
            {item.score.toFixed(1)}
          </span>
          <span className="text-zinc-500 font-mono">/{item.maxScore.toFixed(1)}</span>
        </div>
      </div>
    </div>
  )
}

/**
 * 获取等级对应的颜色类
 */
function getTierColor(tier: SRTier): string {
  const colors: Record<SRTier, string> = {
    S: 'text-[#00FF94]',
    A: 'text-blue-400',
    B: 'text-yellow-400',
    C: 'text-zinc-400'
  }
  return colors[tier]
}

/**
 * 格式化缓存时间
 */
function formatCacheAge(minutes: number): string {
  if (minutes < 60) return `${minutes} 分钟`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours} 小时`
  const days = Math.floor(hours / 24)
  return `${days} 天`
}

export const ScanResults = memo(ScanResultsComponent)
export default ScanResults
