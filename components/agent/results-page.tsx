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
  dailyScansUsed: number
  dailyScansLimit: number
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
  dailyScansUsed,
  dailyScansLimit 
}: ResultsPageProps) {
  const router = useRouter()
  const [inputValue, setInputValue] = useState(scannedUrl || searchQuery || '')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleSearch = useCallback(() => {
    if (!inputValue.trim()) return
    router.push(`/agents?q=${encodeURIComponent(inputValue.trim())}`)
  }, [inputValue, router])

  const handleScan = useCallback(() => {
    if (!inputValue.trim()) return
    router.push(`/agents?url=${encodeURIComponent(inputValue.trim())}`)
  }, [inputValue, router])

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

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#050505', color: '#ffffff', display: 'flex', flexDirection: 'column', paddingBottom: '50px' }}>
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
        backgroundColor: 'rgba(5,5,5,0.95)',
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid #1F1F1F'
      }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '64px', gap: '24px' }}>
            {/* Left: Logo + Brand */}
            <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none', flexShrink: 0 }}>
              <Logo size={28} />
              <span style={{ fontSize: '16px', fontWeight: 700, color: '#fff', letterSpacing: '-0.5px' }}>Agent Signals</span>
            </Link>

            {/* Center: Search Box */}
            <div style={{ flex: 1, maxWidth: '500px' }}>
              <div style={{ 
                backgroundColor: '#0A0A0A', 
                border: '1px solid #1F1F1F', 
                borderRadius: '9999px', 
                padding: '4px', 
                display: 'flex', 
                alignItems: 'center'
              }}>
                <svg width="16" height="16" fill="none" stroke="#666" viewBox="0 0 24 24" style={{ marginLeft: '12px', flexShrink: 0 }}>
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
                    color: '#fff', 
                    fontSize: '13px', 
                    fontFamily: "'JetBrains Mono', monospace", 
                    padding: '8px 12px', 
                    outline: 'none',
                    minWidth: 0
                  }}
                />
                <button
                  onClick={handleScan}
                  disabled={!inputValue.trim()}
                  style={{ 
                    padding: '6px 16px', 
                    borderRadius: '9999px', 
                    fontSize: '12px', 
                    fontWeight: 600, 
                    color: '#000', 
                    backgroundColor: '#00C853', 
                    border: 'none', 
                    cursor: inputValue.trim() ? 'pointer' : 'not-allowed',
                    opacity: inputValue.trim() ? 1 : 0.5,
                    flexShrink: 0
                  }}
                >
                  Scan
                </button>
              </div>
            </div>

            {/* Right: Navigation */}
            <nav style={{ display: 'flex', alignItems: 'center', gap: '20px', flexShrink: 0 }}>
              <Link href="/about" style={{ color: '#888', textDecoration: 'none', fontSize: '13px', fontWeight: 500 }}>About</Link>
              <Link href="/api-docs" style={{ color: '#888', textDecoration: 'none', fontSize: '13px', fontWeight: 500 }}>API</Link>
              <a href="https://github.com/agent-signals" target="_blank" rel="noopener noreferrer" style={{ color: '#888', textDecoration: 'none', fontSize: '13px', fontWeight: 500 }}>GitHub ↗</a>
              <button style={{ padding: '6px 12px', border: '1px solid #333', borderRadius: '6px', background: 'transparent', color: '#fff', fontSize: '13px', fontWeight: 500, cursor: 'pointer' }}>
                Sign In
              </button>
            </nav>
          </div>
        </div>
      </header>

      {/* Results List */}
      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '80px 16px 0', width: '100%', position: 'relative', zIndex: 1 }}>
        <p style={{ textAlign: 'center', fontSize: '11px', color: '#555', marginBottom: '24px' }}>
          Publicly accessible agents are automatically indexed. Owners can claim verified status.
        </p>
        
        {agents.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 0' }}>
            <p style={{ color: '#888', fontSize: '18px' }}>No agents found</p>
            <p style={{ color: '#555', fontSize: '14px', marginTop: '8px' }}>Try a different search or scan a URL</p>
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
      </div>

      {/* Bottom Ticker */}
      <footer style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        height: '40px',
        backgroundColor: 'rgba(5,5,5,0.9)',
        borderTop: '1px solid #1F1F1F',
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
              <span style={{ fontWeight: 600, color: '#fff' }}>{agent.name}</span>
              <span style={{ fontFamily: "'JetBrains Mono', monospace", color: '#00C853' }}>{agent.score.toFixed(1)}</span>
              <span style={{ 
                fontSize: '10px', 
                color: agent.trend === 'up' ? '#00C853' : agent.trend === 'down' ? '#FF5252' : '#888' 
              }}>
                {agent.trend === 'up' ? '▲' : agent.trend === 'down' ? '▼' : '▬'}
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
