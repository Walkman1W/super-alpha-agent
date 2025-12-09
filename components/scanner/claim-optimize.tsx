'use client'

import { useState, useCallback, memo } from 'react'
import { cn } from '@/lib/utils'
import type { ScannerAgent } from '@/lib/types/scanner'

interface ClaimOptimizeProps {
  agent: ScannerAgent
  onVerifyDeployment?: () => void
}

/**
 * 认领优化面板组件
 * 
 * 为未认领的 Agent 提供 JSON-LD 代码、徽章嵌入代码和部署说明
 * Requirements: 5.5, 6.1-6.8
 */
function ClaimOptimizeComponent({ agent, onVerifyDeployment }: ClaimOptimizeProps) {
  const [activeTab, setActiveTab] = useState<'jsonld' | 'badge'>('jsonld')
  const [copiedJsonLd, setCopiedJsonLd] = useState(false)
  const [copiedBadge, setCopiedBadge] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedContent, setGeneratedContent] = useState<{
    jsonLd?: string
    badge?: string
    instructions?: string
  }>({})

  // 生成 JSON-LD 和徽章
  const generateContent = useCallback(async () => {
    setIsGenerating(true)
    try {
      // 生成 JSON-LD
      const jsonLdRes = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ agentSlug: agent.slug, type: 'jsonld' })
      })
      const jsonLdData = await jsonLdRes.json()

      // 生成徽章
      const badgeRes = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ agentSlug: agent.slug, type: 'badge' })
      })
      const badgeData = await badgeRes.json()

      setGeneratedContent({
        jsonLd: jsonLdData.jsonLdString || JSON.stringify(jsonLdData.jsonLd, null, 2),
        badge: badgeData.embedCode,
        instructions: jsonLdData.deploymentInstructions
      })
    } catch (err) {
      console.error('Failed to generate content:', err)
      // 使用本地生成的默认内容
      setGeneratedContent({
        jsonLd: generateDefaultJsonLd(agent),
        badge: generateDefaultBadge(agent),
        instructions: getDefaultInstructions()
      })
    } finally {
      setIsGenerating(false)
    }
  }, [agent])

  // 复制到剪贴板
  const copyToClipboard = useCallback(async (text: string, type: 'jsonld' | 'badge') => {
    try {
      await navigator.clipboard.writeText(text)
      if (type === 'jsonld') {
        setCopiedJsonLd(true)
        setTimeout(() => setCopiedJsonLd(false), 2000)
      } else {
        setCopiedBadge(true)
        setTimeout(() => setCopiedBadge(false), 2000)
      }
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }, [])

  // 如果还没有生成内容，显示生成按钮
  if (!generatedContent.jsonLd && !isGenerating) {
    return (
      <div className={cn(
        'p-6 md:p-8 rounded-2xl',
        'bg-gradient-to-br from-purple-500/10 to-[#00FF94]/10',
        'border border-purple-500/30'
      )}>
        <div className="text-center">
          <div className="text-4xl mb-4">⚡</div>
          <h3 className="text-xl font-bold text-white mb-2">认领并优化</h3>
          <p className="text-zinc-400 mb-6 max-w-md mx-auto">
            生成 JSON-LD 结构化数据和 AI-Ready 徽章，提升您的 Agent 在 AI 搜索中的可见性
          </p>
          <button
            onClick={generateContent}
            className={cn(
              'px-6 py-3 rounded-xl font-semibold',
              'bg-gradient-to-r from-purple-600 to-purple-500',
              'text-white',
              'hover:from-purple-500 hover:to-purple-400',
              'shadow-lg shadow-purple-500/25',
              'transition-all duration-200'
            )}
          >
            生成优化代码
          </button>
        </div>
      </div>
    )
  }

  // 加载状态
  if (isGenerating) {
    return (
      <div className={cn(
        'p-8 rounded-2xl',
        'bg-zinc-900/80 border border-zinc-800',
        'flex items-center justify-center'
      )}>
        <div className="text-center">
          <svg className="w-8 h-8 animate-spin text-purple-500 mx-auto mb-4" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          <p className="text-zinc-400">正在生成优化代码...</p>
        </div>
      </div>
    )
  }

  return (
    <div className={cn(
      'rounded-2xl overflow-hidden',
      'bg-zinc-900/80 backdrop-blur-sm',
      'border border-zinc-800'
    )}>
      {/* 标签页头部 */}
      <div className="flex border-b border-zinc-800">
        <TabButton
          active={activeTab === 'jsonld'}
          onClick={() => setActiveTab('jsonld')}
          icon="📋"
          label="JSON-LD"
        />
        <TabButton
          active={activeTab === 'badge'}
          onClick={() => setActiveTab('badge')}
          icon="🏷️"
          label="AI-Ready 徽章"
        />
      </div>

      {/* 内容区域 */}
      <div className="p-6">
        {activeTab === 'jsonld' ? (
          <div className="space-y-4">
            {/* JSON-LD 代码块 */}
            <div className="relative">
              <div className="flex items-center justify-between mb-2">
                <span className="text-zinc-400 text-sm">将以下代码添加到您网站的 &lt;head&gt; 标签中</span>
                <button
                  onClick={() => copyToClipboard(generatedContent.jsonLd || '', 'jsonld')}
                  className={cn(
                    'px-3 py-1.5 rounded-lg text-xs font-medium',
                    'transition-all duration-200',
                    copiedJsonLd
                      ? 'bg-[#00FF94]/20 text-[#00FF94]'
                      : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
                  )}
                >
                  {copiedJsonLd ? '✓ 已复制' : '复制代码'}
                </button>
              </div>
              <pre className={cn(
                'p-4 rounded-xl overflow-x-auto',
                'bg-zinc-950 border border-zinc-800',
                'text-sm font-mono text-zinc-300',
                'max-h-80'
              )}>
                <code>{generatedContent.jsonLd}</code>
              </pre>
            </div>

            {/* 部署说明 */}
            {generatedContent.instructions && (
              <div className={cn(
                'p-4 rounded-xl',
                'bg-blue-500/10 border border-blue-500/20'
              )}>
                <h4 className="text-blue-400 font-medium mb-2 flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                      d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  部署说明
                </h4>
                <p className="text-zinc-400 text-sm whitespace-pre-line">
                  {generatedContent.instructions}
                </p>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {/* 徽章预览 */}
            <div className="flex items-center justify-center p-6 bg-zinc-950 rounded-xl border border-zinc-800">
              <BadgePreview tier={agent.srTier} score={agent.srScore} />
            </div>

            {/* 徽章嵌入代码 */}
            <div className="relative">
              <div className="flex items-center justify-between mb-2">
                <span className="text-zinc-400 text-sm">将以下代码添加到您的 README 或网站</span>
                <button
                  onClick={() => copyToClipboard(generatedContent.badge || '', 'badge')}
                  className={cn(
                    'px-3 py-1.5 rounded-lg text-xs font-medium',
                    'transition-all duration-200',
                    copiedBadge
                      ? 'bg-[#00FF94]/20 text-[#00FF94]'
                      : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
                  )}
                >
                  {copiedBadge ? '✓ 已复制' : '复制代码'}
                </button>
              </div>
              <pre className={cn(
                'p-4 rounded-xl overflow-x-auto',
                'bg-zinc-950 border border-zinc-800',
                'text-sm font-mono text-zinc-300'
              )}>
                <code>{generatedContent.badge}</code>
              </pre>
            </div>
          </div>
        )}

        {/* 验证部署按钮 */}
        <div className="mt-6 pt-6 border-t border-zinc-800 flex justify-end">
          <button
            onClick={onVerifyDeployment}
            className={cn(
              'px-4 py-2 rounded-lg text-sm font-medium',
              'bg-[#00FF94] text-black',
              'hover:bg-[#00FF94]/90',
              'transition-colors'
            )}
          >
            验证部署
          </button>
        </div>
      </div>
    </div>
  )
}

/**
 * 标签页按钮
 */
function TabButton({ 
  active, 
  onClick, 
  icon, 
  label 
}: { 
  active: boolean
  onClick: () => void
  icon: string
  label: string 
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'flex-1 px-4 py-3 text-sm font-medium',
        'transition-colors',
        active
          ? 'bg-zinc-800 text-white border-b-2 border-[#00FF94]'
          : 'text-zinc-400 hover:text-white hover:bg-zinc-800/50'
      )}
    >
      <span className="mr-2">{icon}</span>
      {label}
    </button>
  )
}

/**
 * 徽章预览组件
 */
function BadgePreview({ tier, score }: { tier: string; score: number }) {
  const colors: Record<string, string> = {
    S: '#00FF94',
    A: '#3B82F6',
    B: '#EAB308',
    C: '#6B7280'
  }
  const color = colors[tier] || colors.C

  return (
    <svg width="120" height="28" viewBox="0 0 120 28" xmlns="http://www.w3.org/2000/svg">
      <rect width="120" height="28" rx="4" fill="#1a1a1a"/>
      <rect width="70" height="28" rx="4" fill="#2a2a2a"/>
      <text x="35" y="18" fontFamily="monospace" fontSize="11" fill="#e5e5e5" textAnchor="middle">
        Signal Rank
      </text>
      <rect x="70" width="50" height="28" rx="4" fill={color}/>
      <text x="95" y="18" fontFamily="monospace" fontSize="12" fontWeight="bold" fill="#000" textAnchor="middle">
        {score.toFixed(1)}
      </text>
    </svg>
  )
}

/**
 * 生成默认 JSON-LD
 */
function generateDefaultJsonLd(agent: ScannerAgent): string {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: agent.name,
    description: agent.description || `${agent.name} - AI Agent`,
    url: agent.homepageUrl || agent.githubUrl || `https://agentsignals.ai/agents/${agent.slug}`,
    applicationCategory: 'AI Agent',
    operatingSystem: 'Web',
    provider: {
      '@type': 'Organization',
      name: agent.name
    }
  }
  
  return `<script type="application/ld+json">
${JSON.stringify(jsonLd, null, 2)}
</script>`
}

/**
 * 生成默认徽章代码
 */
function generateDefaultBadge(agent: ScannerAgent): string {
  const badgeUrl = `https://agentsignals.ai/api/badge/${agent.slug}`
  const reportUrl = `https://agentsignals.ai/agents/${agent.slug}`
  
  return `<!-- HTML -->
<a href="${reportUrl}" target="_blank">
  <img src="${badgeUrl}" alt="Signal Rank: ${agent.srScore.toFixed(1)}" />
</a>

<!-- Markdown -->
[![Signal Rank](${badgeUrl})](${reportUrl})`
}

/**
 * 获取默认部署说明
 */
function getDefaultInstructions(): string {
  return `1. 复制上方的 JSON-LD 代码
2. 将代码粘贴到您网站的 <head> 标签内
3. 部署更新后的网站
4. 点击"验证部署"按钮重新扫描以确认更改`
}

export const ClaimOptimize = memo(ClaimOptimizeComponent)
export default ClaimOptimize
