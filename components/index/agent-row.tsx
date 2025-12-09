'use client'

import { memo, useState, useCallback } from 'react'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import type { ScannerAgent, SRTier, IOModality } from '@/lib/types/scanner'
import { BADGE_COLORS } from '@/lib/types/scanner'

interface AgentRowProps {
  agent: ScannerAgent
  className?: string
}

/**
 * 已验证徽章 SVG
 */
function VerifiedBadge() {
  return (
    <svg 
      className="w-4 h-4 fill-[#00FF94]" 
      viewBox="0 0 24 24"
      aria-label="Verified"
    >
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
    </svg>
  )
}

/**
 * SR 分数颜色
 */
function getScoreColor(tier: SRTier): string {
  return BADGE_COLORS[tier]
}

/**
 * 协议标签
 */
function ProtocolTag({ isMcp }: { isMcp: boolean }) {
  if (isMcp) {
    return (
      <span className="bg-purple-500/20 text-purple-400 px-1.5 py-0.5 rounded text-[10px] uppercase font-mono">
        MCP-Ready
      </span>
    )
  }
  return (
    <span className="bg-zinc-800 text-zinc-500 px-1.5 py-0.5 rounded text-[10px] uppercase font-mono">
      No Protocol
    </span>
  )
}

/**
 * I/O 标签
 */
function IOTag({ type, prefix }: { type: IOModality; prefix: 'IN' | 'OUT' }) {
  return (
    <span className="text-zinc-400 font-mono text-xs border border-zinc-700 px-1.5 py-0.5 rounded">
      {prefix}: {type}
    </span>
  )
}

/**
 * 复制成功提示
 */
function CopyToast({ show }: { show: boolean }) {
  if (!show) return null
  return (
    <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-zinc-800 text-zinc-200 text-xs px-2 py-1 rounded shadow-lg">
      Copied!
    </div>
  )
}

/**
 * Agent 行组件
 * 终端风格的 Agent 列表行，带悬停操作
 * 
 * **Validates: Requirements 7.2, 7.5**
 */
function AgentRowComponent({ agent, className }: AgentRowProps) {
  const [showCopyToast, setShowCopyToast] = useState(false)
  const scoreColor = getScoreColor(agent.srTier)

  // 获取显示的 URL
  const displayUrl = agent.githubUrl 
    ? agent.githubUrl.replace('https://', '')
    : agent.homepageUrl?.replace('https://', '') ?? ''

  // 复制 JSON-LD
  const handleCopyJsonLd = useCallback(async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    const jsonLd = agent.jsonLd ?? {
      '@context': 'https://schema.org',
      '@type': 'SoftwareApplication',
      name: agent.name,
      description: agent.description ?? '',
      url: agent.homepageUrl ?? agent.githubUrl ?? ''
    }
    
    try {
      await navigator.clipboard.writeText(JSON.stringify(jsonLd, null, 2))
      setShowCopyToast(true)
      setTimeout(() => setShowCopyToast(false), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }, [agent])

  // 查看文档
  const handleViewDocs = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    const docsUrl = agent.apiDocsUrl ?? agent.homepageUrl ?? agent.githubUrl
    if (docsUrl) {
      window.open(docsUrl, '_blank', 'noopener,noreferrer')
    }
  }, [agent])

  // 认领并修复
  const handleClaimFix = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    // 跳转到扫描页面
    const scanUrl = agent.githubUrl ?? agent.homepageUrl
    if (scanUrl) {
      window.location.href = `/scan?url=${encodeURIComponent(scanUrl)}`
    }
  }, [agent])

  return (
    <div
      className={cn(
        'group relative flex justify-between items-start',
        'py-5 px-4 border-b border-zinc-800/50',
        'hover:bg-zinc-900/30 transition-colors duration-200',
        className
      )}
      data-testid="agent-row"
    >
      {/* 左侧内容区 */}
      <div className="flex flex-col gap-1.5 flex-1 min-w-0">
        {/* 第一层：标题 + 验证徽章 */}
        <div className="flex items-center gap-2">
          <Link
            href={`/agents/${agent.slug}`}
            className={cn(
              'text-lg font-semibold transition-colors',
              agent.isVerified 
                ? 'text-[#4DA6FF] hover:underline' 
                : 'text-zinc-200 hover:text-zinc-100'
            )}
          >
            {agent.name}
          </Link>
          {agent.isVerified && <VerifiedBadge />}
        </div>

        {/* 第二层：技术参数 */}
        <div className="flex items-center gap-3 font-mono text-sm text-[#00FF94]">
          <span className={cn(!agent.isVerified && 'text-zinc-600')}>
            {displayUrl || 'No URL'}
          </span>
          <ProtocolTag isMcp={agent.isMcp} />
        </div>

        {/* 第三层：能力摘要 */}
        <div className="flex items-center gap-2 flex-wrap">
          {agent.inputTypes.length > 0 && (
            <IOTag type={agent.inputTypes[0]} prefix="IN" />
          )}
          {agent.outputTypes.length > 0 && (
            <IOTag type={agent.outputTypes[0]} prefix="OUT" />
          )}
          <span className="text-sm text-zinc-500 line-clamp-1 flex-1">
            {agent.description ?? agent.metaDescription ?? 'No description available'}
          </span>
        </div>
      </div>

      {/* 右侧：评分区 */}
      <div className="text-right ml-4 flex-shrink-0">
        <div 
          className="font-mono text-3xl font-bold tracking-tight"
          style={{ color: scoreColor }}
        >
          {agent.srScore.toFixed(1)}
        </div>
        <div className="text-[10px] text-zinc-500 uppercase tracking-wider">
          Signal Rank
        </div>
        {agent.srTrack === 'Hybrid' && (
          <span className="text-[10px] text-[#00FF94] block mt-0.5">
            ▲ Hybrid
          </span>
        )}
      </div>

      {/* 悬停操作按钮 */}
      <div className="absolute right-4 bottom-5 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex gap-2 items-center">
        <CopyToast show={showCopyToast} />
        
        {agent.isVerified ? (
          <>
            <button
              onClick={handleCopyJsonLd}
              className="bg-zinc-800 border border-zinc-700 text-zinc-200 px-3 py-1 text-xs rounded hover:bg-zinc-700 transition-colors"
            >
              Copy JSON-LD
            </button>
            <button
              onClick={handleViewDocs}
              className="bg-zinc-800 border border-zinc-700 text-zinc-200 px-3 py-1 text-xs rounded hover:bg-zinc-700 transition-colors"
            >
              View Docs
            </button>
          </>
        ) : (
          <button
            onClick={handleClaimFix}
            className="border border-purple-500 text-purple-400 px-3 py-1 text-xs rounded hover:bg-purple-500/10 transition-colors"
          >
            ⚡ Claim & Fix
          </button>
        )}
      </div>
    </div>
  )
}

export const AgentRow = memo(AgentRowComponent)
AgentRow.displayName = 'AgentRow'

export default AgentRow
