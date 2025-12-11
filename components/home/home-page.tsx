'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Logo } from '@/components/ui/logo'
import Link from 'next/link'

interface HomePageProps {
  stats: {
    indexed: number
    verified: number
    scans: number
  }
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

export function HomePage({ stats }: HomePageProps) {
  const [mounted, setMounted] = useState(false)
  const router = useRouter()
  const [inputValue, setInputValue] = useState('')
  const [isScanning, setIsScanning] = useState(false)
  const [scanSteps, setScanSteps] = useState<number[]>([])

  useEffect(() => {
    setMounted(true)
  }, [])

  const isUrl = (value: string) => {
    return value.includes('.') && (
      value.startsWith('http') || 
      value.includes('github.com') || 
      value.includes('.ai') ||
      value.includes('.com') ||
      value.includes('.io')
    )
  }

  const handleSearch = () => {
    if (!inputValue.trim()) return
    router.push(`/agents?q=${encodeURIComponent(inputValue.trim())}`)
  }

  const handleScan = async () => {
    if (!inputValue.trim()) return
    setIsScanning(true)
    setScanSteps([])
    for (const step of [1, 2, 3, 4]) {
      await new Promise(resolve => setTimeout(resolve, 600))
      setScanSteps(prev => [...prev, step])
    }
    await new Promise(resolve => setTimeout(resolve, 400))
    router.push(`/agents?url=${encodeURIComponent(inputValue.trim())}`)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      if (isUrl(inputValue)) handleScan()
      else handleSearch()
    }
  }

  const isDisabled = isScanning || !inputValue.trim()

  // 骨架屏
  if (!mounted) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#050505' }} />
    )
  }

  const tickerItems = [...tickerAgents, ...tickerAgents]

  return (
    <div style={{ 
      minHeight: '100vh', 
      backgroundColor: '#050505', 
      color: '#ffffff', 
      display: 'flex', 
      flexDirection: 'column', 
      position: 'relative',
      overflow: 'hidden'
    }}>
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

      {/* Header - Right aligned nav */}
      <nav style={{
        position: 'absolute',
        top: 0,
        right: 0,
        padding: '24px 32px',
        display: 'flex',
        gap: '24px',
        zIndex: 10
      }}>
        <Link href="/about" style={{ color: '#888', textDecoration: 'none', fontSize: '14px', fontWeight: 500 }}>About</Link>
        <Link href="/api-docs" style={{ color: '#888', textDecoration: 'none', fontSize: '14px', fontWeight: 500 }}>API</Link>
        <a href="https://github.com/agent-signals" target="_blank" rel="noopener noreferrer" style={{ color: '#888', textDecoration: 'none', fontSize: '14px', fontWeight: 500 }}>GitHub ↗</a>
        <button style={{ padding: '6px 12px', border: '1px solid #333', borderRadius: '6px', background: 'transparent', color: '#fff', fontSize: '14px', fontWeight: 500, cursor: 'pointer' }}>
          Sign In
        </button>
      </nav>
      
      {/* Main Content */}
      <main style={{ 
        flex: 1, 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        justifyContent: 'center', 
        padding: '0 16px 80px',
        position: 'relative',
        zIndex: 1,
        maxWidth: '800px',
        margin: '0 auto',
        width: '100%'
      }}>
        {/* Logo */}
        <div style={{ marginBottom: '24px' }}>
          <Logo size={120} />
        </div>

        {/* Slogan */}
        <h1 style={{ 
          fontSize: '42px', 
          fontWeight: 700, 
          letterSpacing: '-1px', 
          marginBottom: '48px', 
          textAlign: 'center' 
        }}>
          <span style={{ 
            background: 'linear-gradient(135deg, #fff 0%, #888 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
          }}>
            Index the Intelligence Economy.
          </span>
        </h1>

        {/* Search Box */}
        <div style={{ width: '100%', position: 'relative', zIndex: 20 }}>
          <div style={{ 
            backgroundColor: '#0A0A0A', 
            border: '1px solid #1F1F1F', 
            borderRadius: '9999px', 
            padding: '6px', 
            display: 'flex', 
            alignItems: 'center', 
            boxShadow: '0 4px 24px rgba(0,0,0,0.4)' 
          }}>
            <div style={{ paddingLeft: '16px', color: '#888' }}>
              <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="https://aistudio.google.com/ or 'coding agent'"
              disabled={isScanning}
              style={{ 
                flex: 1, 
                backgroundColor: 'transparent', 
                border: 'none', 
                color: '#ffffff', 
                fontSize: '16px', 
                fontFamily: "'JetBrains Mono', monospace", 
                padding: '12px 16px', 
                outline: 'none' 
              }}
            />
            <div style={{ display: 'flex', gap: '8px', paddingRight: '4px' }}>
              <button 
                onClick={handleSearch} 
                disabled={isDisabled} 
                style={{ 
                  padding: '10px 20px', 
                  borderRadius: '9999px', 
                  fontSize: '14px', 
                  fontWeight: 600, 
                  color: '#ffffff', 
                  backgroundColor: 'transparent', 
                  border: 'none', 
                  cursor: isDisabled ? 'not-allowed' : 'pointer', 
                  opacity: isDisabled ? 0.4 : 1 
                }}
              >
                Search
              </button>
              <button 
                onClick={handleScan} 
                disabled={isDisabled} 
                style={{ 
                  padding: '10px 20px', 
                  borderRadius: '9999px', 
                  fontSize: '14px', 
                  fontWeight: 600, 
                  color: '#000000', 
                  backgroundColor: '#00C853', 
                  border: 'none', 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '6px', 
                  cursor: isDisabled ? 'not-allowed' : 'pointer', 
                  opacity: isDisabled ? 0.4 : 1 
                }}
              >
                <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Scan URL
              </button>
            </div>
          </div>

          {/* Scan Progress */}
          {isScanning && (
            <div style={{ 
              position: 'absolute', 
              top: '120%', 
              left: 0, 
              right: 0, 
              backgroundColor: 'rgba(10,10,10,0.9)', 
              border: '1px solid #1F1F1F', 
              borderRadius: '12px', 
              padding: '20px', 
              fontFamily: "'JetBrains Mono', monospace", 
              fontSize: '13px' 
            }}>
              {[1, 2, 3, 4].map(step => (
                <div key={step} style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '10px', 
                  marginBottom: '8px', 
                  opacity: scanSteps.includes(step) ? 1 : (scanSteps.length >= step - 1 ? 1 : 0.4)
                }}>
                  {scanSteps.includes(step) ? (
                    <span style={{ color: '#00C853' }}>✓</span>
                  ) : (
                    <div style={{ 
                      width: '12px', 
                      height: '12px', 
                      border: '2px solid #00C853', 
                      borderTopColor: 'transparent', 
                      borderRadius: '50%',
                      animation: 'spin 0.8s linear infinite'
                    }} />
                  )}
                  <span style={{ color: scanSteps.includes(step) ? '#888' : '#fff' }}>
                    {step === 1 && 'Initializing crawler...'}
                    {step === 2 && 'Detecting Model Context Protocol (MCP)...'}
                    {step === 3 && 'Verifying JSON-LD Schema...'}
                    {step === 4 && 'Calculating Signal Rank (SR)...'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Stats */}
        <div style={{ display: 'flex', gap: '48px', marginTop: '48px' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '20px', fontWeight: 700, color: '#ffffff' }}>
              {stats.indexed.toLocaleString('en-US')}
            </div>
            <div style={{ fontSize: '12px', textTransform: 'uppercase', color: '#888', marginTop: '4px', letterSpacing: '1px' }}>
              Indexed
            </div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '20px', fontWeight: 700, color: '#00C853' }}>
              {stats.verified.toLocaleString('en-US')}
            </div>
            <div style={{ fontSize: '12px', textTransform: 'uppercase', color: '#888', marginTop: '4px', letterSpacing: '1px' }}>
              Verified
            </div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '20px', fontWeight: 700, color: '#ffffff' }}>
              {stats.scans.toLocaleString('en-US')}
            </div>
            <div style={{ fontSize: '12px', textTransform: 'uppercase', color: '#888', marginTop: '4px', letterSpacing: '1px' }}>
              Scans
            </div>
          </div>
        </div>
      </main>

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

      {/* CSS Animations */}
      <style jsx global>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        @keyframes ticker {
          from { transform: translateX(0); }
          to { transform: translateX(-100%); }
        }
      `}</style>
    </div>
  )
}

export default HomePage
