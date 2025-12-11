'use client'

import { useState } from 'react'

type TagKey = 'MCP' | 'API' | 'JSON-LD'

interface AgentResultItemProps {
  agent: {
    id: string
    name: string
    url: string
    icon: string
    description: string
    isVerified: boolean
    isMcp: boolean
    hasJsonLd: boolean
    hasApi: boolean
    isClaimed?: boolean
    srScore: number
    srTier: 'S' | 'A' | 'B' | 'C'
    inputTypes: string[]
    outputTypes: string[]
  }
  onCopyPrompt: (agentId: string) => void
  onViewJsonLd: (agentId: string) => void
  onClaim?: (agentId: string) => void
}

function getTierColor(tier: string) {
  switch (tier) {
    case 'S': return '#00C853'
    case 'A': return '#FFD600'
    case 'B': return '#FF9800'
    case 'C': return '#888'
    default: return '#888'
  }
}

function formatUrlWithProtocol(url: string) {
  if (!url) return ''
  return /^https?:\/\//i.test(url) ? url : `https://${url}`
}

export function AgentResultItem({ agent, onCopyPrompt, onViewJsonLd, onClaim }: AgentResultItemProps) {
  const [copiedPrompt, setCopiedPrompt] = useState(false)
  const [hoveredTag, setHoveredTag] = useState<TagKey | null>(null)
  const [copiedTag, setCopiedTag] = useState<TagKey | null>(null)

  const handleCopyPrompt = () => {
    onCopyPrompt(agent.id)
    setCopiedPrompt(true)
    setTimeout(() => setCopiedPrompt(false), 2000)
  }

  const tierColor = getTierColor(agent.srTier)
  const isClaimed = agent.isClaimed ?? agent.isVerified
  const normalizedUrl = formatUrlWithProtocol(agent.url)
  const ioSummary = `IN: ${agent.inputTypes.length ? agent.inputTypes.join(', ') : 'N/A'} | OUT: ${agent.outputTypes.length ? agent.outputTypes.join(', ') : 'N/A'}`
  const tagCopyContent: Record<TagKey, string | null> = {
    'MCP': agent.isMcp
      ? `${agent.name} is MCP-ready\nURL: ${normalizedUrl}\n${ioSummary}`
      : null,
    'API': agent.hasApi
      ? `${agent.name} API endpoint/docs: ${normalizedUrl}\n${ioSummary}`
      : null,
    'JSON-LD': agent.hasJsonLd
      ? JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'SoftwareApplication',
        name: agent.name,
        url: normalizedUrl,
        description: agent.description
      }, null, 2)
      : null
  }

  const handleCopyTag = async (tag: TagKey) => {
    const content = tagCopyContent[tag]
    if (!content) return
    try {
      await navigator.clipboard.writeText(content)
      setCopiedTag(tag)
      setTimeout(() => setCopiedTag(null), 2000)
    } catch (error) {
      console.error('Failed to copy tag content', error)
    }
  }

  return (
    <div style={{
      display: 'flex',
      gap: '20px',
      padding: '20px 0',
      borderBottom: '1px solid #1F1F1F'
    }}>
      {/* Left: Icon */}
      <div style={{
        width: '48px',
        height: '48px',
        borderRadius: '12px',
        backgroundColor: '#0A0A0A',
        border: '1px solid #1F1F1F',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '24px',
        flexShrink: 0,
        filter: isClaimed ? 'none' : 'grayscale(0.5)'
      }}>
        {agent.icon}
      </div>

      {/* Middle: Content */}
      <div style={{ flex: 1, minWidth: 0 }}>
        {/* Name + Verified Badge */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px', flexWrap: 'wrap' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#fff', margin: 0 }}>
            {agent.name}
          </h3>
          <div
            role={!isClaimed && onClaim ? 'button' : undefined}
            onClick={() => !isClaimed && onClaim?.(agent.id)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '4px 10px',
              borderRadius: '999px',
              backgroundColor: isClaimed ? 'rgba(0, 200, 83, 0.12)' : 'rgba(255,255,255,0.05)',
              border: `1px solid ${isClaimed ? 'rgba(0, 200, 83, 0.35)' : '#1F1F1F'}`,
              color: isClaimed ? '#00C853' : '#777',
              fontSize: '11px',
              fontWeight: 700,
              textTransform: 'uppercase',
              cursor: !isClaimed && onClaim ? 'pointer' : 'default'
            }}
            title={isClaimed ? 'Claimed' : 'Claim this agent'}
          >
            {isClaimed ? (
              <>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="#00C853">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                </svg>
                <span>Claimed</span>
              </>
            ) : (
              <span style={{ color: '#777', letterSpacing: '0.5px' }}>Claim</span>
            )}
          </div>
        </div>

        {/* URL */}
        <div style={{ 
          fontFamily: "'JetBrains Mono', monospace", 
          fontSize: '12px', 
          color: '#666', 
          marginBottom: '8px',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap'
        }}>
          {agent.url}
        </div>

        {/* Description */}
        <p style={{ 
          fontSize: '13px', 
          color: '#888', 
          lineHeight: 1.5, 
          margin: '0 0 12px 0',
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden'
        }}>
          {agent.description}
        </p>

        {/* Signal Badges - 通过亮色，未通过灰色 */}
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {(['MCP', 'API', 'JSON-LD'] as TagKey[]).map((tag) => {
            const config = {
              active: tag === 'MCP' ? agent.isMcp : tag === 'API' ? agent.hasApi : agent.hasJsonLd,
              activeBg: tag === 'MCP' ? 'rgba(139, 92, 246, 0.15)' : tag === 'API' ? 'rgba(59, 130, 246, 0.15)' : 'rgba(0, 200, 83, 0.15)',
              activeColor: tag === 'MCP' ? '#8B5CF6' : tag === 'API' ? '#3B82F6' : '#00C853',
              activeBorder: tag === 'MCP' ? 'rgba(139, 92, 246, 0.3)' : tag === 'API' ? 'rgba(59, 130, 246, 0.3)' : 'rgba(0, 200, 83, 0.3)'
            }
            const isHovered = hoveredTag === tag
            const isCopied = copiedTag === tag
            const showIcon = isHovered || isCopied
            return (
              <div
                key={tag}
                role={config.active ? 'button' : undefined}
                onClick={() => config.active && handleCopyTag(tag)}
                onMouseEnter={() => config.active && setHoveredTag(tag)}
                onMouseLeave={() => setHoveredTag(null)}
                style={{
                  fontSize: '10px',
                  fontWeight: 600,
                  padding: '3px 8px',
                  borderRadius: '4px',
                  textTransform: 'uppercase',
                  backgroundColor: config.active ? config.activeBg : 'rgba(255,255,255,0.05)',
                  color: config.active ? config.activeColor : '#444',
                  border: `1px solid ${config.active ? config.activeBorder : '#222'}`,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  cursor: config.active ? 'pointer' : 'default',
                  transition: 'border-color 0.15s ease, color 0.15s ease'
                }}
                title={config.active ? `Copy ${tag} info` : `${tag} unavailable`}
              >
                <span>{tag}</span>
                {config.active && (
                  <span style={{
                    display: 'flex',
                    alignItems: 'center',
                    color: config.activeColor,
                    opacity: showIcon ? 1 : 0,
                    transition: 'opacity 0.15s ease'
                  }}>
                    {isCopied ? (
                      <svg width="12" height="12" viewBox="0 0 24 24" fill={config.activeColor}>
                        <path d="M9 16.2l-3.5-3.5L4 14.2l5 5 11-11-1.4-1.4z" />
                      </svg>
                    ) : (
                      <svg width="12" height="12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                    )}
                  </span>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Right: Score & Actions */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', justifyContent: 'space-between', flexShrink: 0 }}>
        {/* SR Score */}
        <div style={{ textAlign: 'right' }}>
          <div style={{ 
            fontFamily: "'JetBrains Mono', monospace", 
            fontSize: '28px', 
            fontWeight: 700, 
            color: tierColor,
            lineHeight: 1
          }}>
            {agent.srScore.toFixed(1)}
          </div>
          <div style={{ 
            fontSize: '10px', 
            color: tierColor, 
            opacity: 0.8, 
            letterSpacing: '1px',
            marginTop: '2px'
          }}>
            TIER {agent.srTier}
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'flex-end' }}>
          {/* View JSON-LD + Copy Prompt Row */}
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            {agent.hasJsonLd && (
              <button
                onClick={() => onViewJsonLd(agent.id)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#666',
                  fontSize: '11px',
                  cursor: 'pointer',
                  textDecoration: 'underline',
                  padding: 0
                }}
              >
                View JSON-LD
              </button>
            )}
            <button
              onClick={handleCopyPrompt}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 12px',
                backgroundColor: '#0A0A0A',
                border: '1px solid #1F1F1F',
                borderRadius: '6px',
                fontSize: '11px',
                fontWeight: 500,
                color: '#fff',
                cursor: 'pointer'
              }}
            >
              <svg width="12" height="12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              {copiedPrompt ? 'Copied!' : 'Copy Prompt'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AgentResultItem
