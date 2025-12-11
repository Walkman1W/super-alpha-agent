'use client'

import { useState, useCallback, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { AgentResultItem } from './agent-result-item'
import { Logo } from '@/components/ui/logo'
import Link from 'next/link'

interface Agent {
  id: string
  name: string
  url: string
  icon: string
  description: string
  isVerified: boolean
  isClaimed?: boolean
  isMcp: boolean
  hasJsonLd: boolean
  hasApi: boolean
  srScore: number
  srTier: 'S' | 'A' | 'B' | 'C'
  inputTypes: string[]
  outputTypes: string[]
}

interface ResultsPageProps {
  agents: Agent[]
  searchQuery?: string
  scannedUrl?: string
  verifiedOnly?: boolean
  dailyScansUsed: number
  dailyScansLimit: number
  errorMessage?: string
  currentPage: number
  totalPages: number
  pageSize: number
  totalCount: number
}

// Ticker data
const tickerAgents = [
  { name: 'Manus AI', score: 9.8, trend: 'up' as const },
  { name: 'Claude Computer Use', score: 9.5, trend: 'up' as const },
  { name: 'Devin', score: 9.1, trend: 'up' as const },
  { name: 'LangChain', score: 8.7, trend: 'stable' as const },
  { name: 'AutoGPT', score: 8.2, trend: 'down' as const },
  { name: 'BabyAGI', score: 7.9, trend: 'down' as const },
  { name: 'OpenAI Swarm', score: 8.5, trend: 'up' as const },
  { name: 'CrewAI', score: 8.3, trend: 'up' as const },
  { name: 'MetaGPT', score: 7.8, trend: 'stable' as const },
  { name: 'AgentGPT', score: 7.5, trend: 'down' as const },
]

export function ResultsPage({ 
  agents, 
  searchQuery, 
  scannedUrl,
  verifiedOnly,
  dailyScansUsed,
  dailyScansLimit,
  errorMessage,
  currentPage,
  totalPages,
  pageSize,
  totalCount
}: ResultsPageProps) {
  const router = useRouter()
  const [inputValue, setInputValue] = useState(scannedUrl || searchQuery || '')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleSearch = useCallback(() => {
    if (!inputValue.trim()) return
    const params = new URLSearchParams()
    params.set('q', inputValue.trim())
    if (verifiedOnly) params.set('verified', 'true')
    router.push(`/agents?${params.toString()}`)
  }, [inputValue, router, verifiedOnly])

  const handleScan = useCallback(() => {
    if (!inputValue.trim()) return
    const params = new URLSearchParams()
    params.set('url', inputValue.trim())
    if (verifiedOnly) params.set('verified', 'true')
    router.push(`/agents?${params.toString()}`)
  }, [inputValue, router, verifiedOnly])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      if (inputValue.includes('.')) handleScan()
      else handleSearch()
    }
  }

  const handleCopyPrompt = useCallback((agentId: string) => {
    const agent = agents.find(a => a.id === agentId)
    if (!agent) return
    const prompt = `Use ${agent.name} (${agent.url}) to help with this task. ${agent.description}`
    navigator.clipboard.writeText(prompt)
  }, [agents])

  const handleViewJsonLd = useCallback((agentId: string) => {
    console.log('View JSON-LD for:', agentId)
  }, [])

  const handleClaim = useCallback((agentId: string) => {
    router.push(`/claim/${agentId}`)
  }, [router])

  if (!mounted) {
    return <div style={{ minHeight: '100vh', backgroundColor: '#050505' }} />
  }

  const tickerItems = [...tickerAgents, ...tickerAgents]

  const buildPageNumbers = () => {
    const pages: (number | string)[] = []
    const maxSlots = 9
    if (totalPages <= maxSlots) {
      for (let i = 1; i <= totalPages; i++) pages.push(i)
      return pages
    }
    const addEllipsis = () => pages.push('…')
    pages.push(1)
    const start = Math.max(2, currentPage - 2)
    const end = Math.min(totalPages - 1, currentPage + 2)
    if (start > 2) addEllipsis()
    for (let i = start; i <= end; i++) pages.push(i)
    if (end < totalPages - 1) addEllipsis()
    pages.push(totalPages)
    return pages
  }

  const handlePageChange = (page: number) => {
    const target = Math.min(Math.max(1, page), totalPages || 1)
    const params = new URLSearchParams()
    if (searchQuery) params.set('q', searchQuery)
    if (scannedUrl) params.set('url', scannedUrl)
    if (verifiedOnly) params.set('verified', 'true')
    if (target > 1) params.set('page', String(target))
    router.push(`/agents?${params.toString()}`)
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#050505', color: '#e5e5e5', display: 'flex', flexDirection: 'column', paddingBottom: '56px' }}>
      {/* Grid Background */}
      <div style={{
        position: 'fixed',
        inset: 0,
        backgroundImage: 'linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)',
        backgroundSize: '50px 50px',
        maskImage: 'radial-gradient(circle at center, black 30%, transparent 100%)',
        WebkitMaskImage: 'radial-gradient(circle at center, black 30%, transparent 100%)',
        zIndex: 0,
        pointerEvents: 'none'
      }} />
      
      {/* Fixed Header with Search */}
      <header style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 50,
        backgroundColor: '#050505',
        borderBottom: '1px solid #1A1A1A',
        padding: '12px 18px'
      }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 6px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            {/* Left: Logo + Brand */}
            <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none', flexShrink: 0 }}>
              <Logo size={28} />
              <span style={{ fontSize: '16px', fontWeight: 700, color: '#e5e5e5', letterSpacing: '-0.5px' }}>Agent Signals</span>
            </Link>

            {/* Center: Search Box */}
            <div style={{ flex: 1, maxWidth: '720px' }}>
              <div style={{ 
                backgroundColor: '#0A0A0A', 
                border: '1px solid #1A1A1A', 
                borderRadius: '24px', 
                padding: '4px 10px 4px 16px', 
                display: 'flex', 
                alignItems: 'center',
                transition: 'all 0.2s'
              }}>
                <svg width="16" height="16" fill="none" stroke="#888" viewBox="0 0 24 24" style={{ marginRight: '10px', flexShrink: 0 }}>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
                </svg>
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Search or paste URL..."
                  style={{ 
                    flex: 1, 
                    backgroundColor: 'transparent', 
                    border: 'none', 
                    color: '#e5e5e5', 
                    fontSize: '15px', 
                    fontFamily: "'JetBrains Mono', monospace", 
                    padding: '10px 0', 
                    outline: 'none',
                    minWidth: 0
                  }}
                />
                <div style={{ width: '1px', height: '24px', background: '#1A1A1A', margin: '0 8px' }} />
                <button
                  onClick={handleScan}
                  disabled={!inputValue.trim()}
                  style={{ 
                    padding: '8px 14px', 
                    borderRadius: '18px', 
                    fontSize: '13px', 
                    fontWeight: 600, 
                    color: '#000', 
                    backgroundColor: '#00FF94', 
                    border: 'none', 
                    cursor: inputValue.trim() ? 'pointer' : 'not-allowed',
                    opacity: inputValue.trim() ? 1 : 0.4,
                    flexShrink: 0,
                    transition: 'all 0.2s'
                  }}
                >
                  Scan
                </button>
              </div>
            </div>

            {/* Right: Navigation */}
            <nav style={{ display: 'flex', alignItems: 'center', gap: '14px', flexShrink: 0 }}>
              <Link href="/about" style={{ color: '#888', textDecoration: 'none', fontSize: '13px', fontWeight: 500 }}>About</Link>
              <Link href="/api-docs" style={{ color: '#888', textDecoration: 'none', fontSize: '13px', fontWeight: 500 }}>API</Link>
              <a href="https://github.com/agent-signals" target="_blank" rel="noopener noreferrer" style={{ color: '#4DA6FF', textDecoration: 'none', fontSize: '13px', fontWeight: 500 }}>GitHub ↗</a>
              <button style={{ padding: '8px 14px', border: '1px solid #1A1A1A', borderRadius: '8px', background: '#0A0A0A', color: '#e5e5e5', fontSize: '13px', fontWeight: 500, cursor: 'pointer' }}>
                Sign In
              </button>
            </nav>
          </div>
        </div>
      </header>

      {/* Results List */}
      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '88px 16px 0', width: '100%', position: 'relative', zIndex: 1 }}>
        <p style={{ textAlign: 'center', fontSize: '12px', color: '#888', marginBottom: '24px' }}>
          Publicly accessible agents are automatically indexed. Owners can claim verified status.
        </p>

        <div style={{ fontSize: '12px', color: '#888', marginBottom: '12px', display: 'flex', justifyContent: 'space-between', gap: '12px' }}>
          {(() => {
            const start = totalCount === 0 ? 0 : Math.min((currentPage - 1) * pageSize + 1, totalCount)
            const end = totalCount === 0 ? 0 : Math.min(currentPage * pageSize, totalCount)
            return <span>Showing {start}–{end} of {totalCount} agents</span>
          })()}
          {verifiedOnly && <span style={{ color: '#4DA6FF' }}>Verified only</span>}
        </div>
        
        {errorMessage && (
          <div style={{
            marginBottom: '16px',
            padding: '12px 14px',
            borderRadius: '10px',
            border: '1px solid rgba(255, 82, 82, 0.35)',
            background: 'rgba(255, 82, 82, 0.12)',
            color: '#ffb3b3',
            fontSize: '13px',
            lineHeight: 1.4
          }}>
            {errorMessage}
          </div>
        )}
        
        {agents.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 0' }}>
            <p style={{ color: '#888', fontSize: '18px' }}>
              {errorMessage ? 'Unable to load agents' : 'No agents found'}
            </p>
            <p style={{ color: '#555', fontSize: '14px', marginTop: '8px' }}>
              {errorMessage ? 'Please refresh or adjust your search.' : 'Try a different search or scan a URL'}
            </p>
          </div>
        ) : (
          agents.map((agent) => (
            <AgentResultItem
              key={agent.id}
              agent={agent}
              onCopyPrompt={handleCopyPrompt}
              onViewJsonLd={handleViewJsonLd}
              onClaim={!agent.isVerified ? handleClaim : undefined}
            />
          ))
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div style={{ marginTop: '28px', display: 'flex', justifyContent: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: '#888' }}>
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                style={{
                  padding: '6px 10px',
                  borderRadius: '8px',
                  border: '1px solid #1A1A1A',
                  background: '#0A0A0A',
                  color: '#e5e5e5',
                  cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                  opacity: currentPage === 1 ? 0.4 : 1
                }}
              >
                ‹ Prev
              </button>
              {buildPageNumbers().map((item, idx) => {
                const isNumber = typeof item === 'number'
                const isActive = isNumber && item === currentPage
                return (
                  <button
                    key={`${item}-${idx}`}
                    onClick={() => isNumber && handlePageChange(item)}
                    disabled={!isNumber}
                    style={{
                      minWidth: '36px',
                      padding: '8px 10px',
                      borderRadius: '10px',
                      border: isActive ? '1px solid #00FF94' : '1px solid #1A1A1A',
                      background: isActive ? 'rgba(0,255,148,0.12)' : '#0A0A0A',
                      color: isActive ? '#00FF94' : '#e5e5e5',
                      fontWeight: isActive ? 700 : 500,
                      cursor: isNumber ? 'pointer' : 'default',
                      opacity: isNumber ? 1 : 0.6
                    }}
                  >
                    {item}
                  </button>
                )
              })}
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                style={{
                  padding: '6px 10px',
                  borderRadius: '8px',
                  border: '1px solid #1A1A1A',
                  background: '#0A0A0A',
                  color: '#e5e5e5',
                  cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                  opacity: currentPage === totalPages ? 0.4 : 1
                }}
              >
                Next ›
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Ticker */}
      <footer style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        height: '44px',
        backgroundColor: '#050505',
        borderTop: '1px solid #1A1A1A',
        display: 'flex',
        alignItems: 'center',
        overflow: 'hidden',
        zIndex: 100
      }}>
        <div style={{
          display: 'flex',
          gap: '40px',
          animation: 'ticker 30s linear infinite',
          whiteSpace: 'nowrap',
          paddingLeft: '100%'
        }}>
          {tickerItems.map((agent, index) => (
            <div key={`${agent.name}-${index}`} style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '8px', 
              fontSize: '13px', 
              color: '#888',
              cursor: 'pointer'
            }}>
              <span style={{ fontWeight: 600, color: '#e5e5e5' }}>{agent.name}</span>
              <span style={{ fontFamily: "'JetBrains Mono', monospace", color: '#00FF94' }}>{agent.score.toFixed(1)}</span>
              <span style={{ 
                fontSize: '10px', 
                color: agent.trend === 'up' ? '#00FF94' : agent.trend === 'down' ? '#FF5252' : '#888' 
              }}>
                {agent.trend === 'up' ? '▲' : agent.trend === 'down' ? '▼' : '■'}
              </span>
            </div>
          ))}
        </div>
      </footer>

      <style jsx global>{`
        @keyframes ticker {
          from { transform: translateX(0); }
          to { transform: translateX(-100%); }
        }
      `}</style>
    </div>
  )
}

export default ResultsPage
