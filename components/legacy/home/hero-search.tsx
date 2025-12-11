'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Logo } from '@/components/ui/logo'

interface HeroSearchProps {
  stats: {
    indexed: number
    verified: number
    scans: number
  }
}

export function HeroSearch({ stats }: HeroSearchProps) {
  const router = useRouter()
  const [inputValue, setInputValue] = useState('')
  const [isScanning, setIsScanning] = useState(false)
  const [scanSteps, setScanSteps] = useState<number[]>([])

  const isUrl = (value: string) => {
    return value.includes('.') && (
      value.startsWith('http') || 
      value.includes('github.com') || 
      value.includes('.ai') ||
      value.includes('.com') ||
      value.includes('.io')
    )
  }

  const handleSearch = useCallback(() => {
    if (!inputValue.trim()) return
    router.push(`/agents?q=${encodeURIComponent(inputValue.trim())}`)
  }, [inputValue, router])

  const handleScan = useCallback(async () => {
    if (!inputValue.trim()) return
    
    setIsScanning(true)
    setScanSteps([])

    const steps = [1, 2, 3, 4]
    for (const step of steps) {
      await new Promise(resolve => setTimeout(resolve, 600))
      setScanSteps(prev => [...prev, step])
    }

    await new Promise(resolve => setTimeout(resolve, 400))
    router.push(`/agents?url=${encodeURIComponent(inputValue.trim())}`)
  }, [inputValue, router])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      if (isUrl(inputValue)) {
        handleScan()
      } else {
        handleSearch()
      }
    }
  }

  const isDisabled = isScanning || !inputValue.trim()

  // Pre-format numbers to strings to ensure consistency
  const formattedStats = {
    indexed: stats.indexed.toLocaleString('en-US'),
    verified: stats.verified.toLocaleString('en-US'),
    scans: stats.scans.toLocaleString('en-US'),
  }

  return (
    <main style={{
      flex: '1 1 0%',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '0 16px 80px 16px',
    }}>
      {/* Logo */}
      <div style={{ marginBottom: '24px' }}>
        <Logo size={120} className="text-white" />
      </div>

      {/* Slogan */}
      <h1 style={{
        fontSize: '42px',
        fontWeight: 700,
        letterSpacing: '-1px',
        marginBottom: '48px',
        textAlign: 'center',
      }}>
        <span style={{ color: '#ffffff' }}>Index the </span>
        <span style={{ color: '#71717a' }}>Intelligence Economy.</span>
      </h1>

      {/* Search Box */}
      <div style={{ width: '100%', maxWidth: '672px', position: 'relative', zIndex: 20 }}>
        <div style={{
          backgroundColor: '#18181b',
          border: '1px solid #27272a',
          borderRadius: '9999px',
          padding: '6px',
          display: 'flex',
          alignItems: 'center',
          boxShadow: '0 4px 24px rgba(0,0,0,0.4)',
        }}>
          {/* Search Icon */}
          <div style={{ paddingLeft: '16px', color: '#71717a' }}>
            <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>

          {/* Input */}
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="https://github.com/... or 'coding agent'"
            disabled={isScanning}
            style={{
              flex: 1,
              backgroundColor: 'transparent',
              border: 'none',
              color: '#ffffff',
              fontSize: '16px',
              fontFamily: 'JetBrains Mono, monospace',
              padding: '12px 16px',
              outline: 'none',
            }}
          />

          {/* Buttons */}
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
                opacity: isDisabled ? 0.4 : 1,
                transition: 'all 0.2s',
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
                backgroundColor: '#22c55e',
                border: 'none',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                cursor: isDisabled ? 'not-allowed' : 'pointer',
                opacity: isDisabled ? 0.4 : 1,
                transition: 'all 0.2s',
              }}
            >
              <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              Scan URL
            </button>
          </div>
        </div>

        {/* Scan Progress Overlay */}
        {isScanning && (
          <div style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            marginTop: '16px',
            backgroundColor: 'rgba(24, 24, 27, 0.95)',
            border: '1px solid #27272a',
            borderRadius: '12px',
            padding: '20px',
            fontFamily: 'JetBrains Mono, monospace',
            fontSize: '14px',
          }}>
            <ScanStep active={scanSteps.includes(1)} label="Initializing crawler..." />
            <ScanStep active={scanSteps.includes(2)} label="Detecting Model Context Protocol (MCP)..." />
            <ScanStep active={scanSteps.includes(3)} label="Verifying JSON-LD Schema..." />
            <ScanStep active={scanSteps.includes(4)} label="Calculating Signal Rank (SR)..." />
          </div>
        )}
      </div>

      {/* Stats */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '48px',
        marginTop: '48px',
      }}>
        <StatItem value={formattedStats.indexed} label="Indexed" />
        <StatItem value={formattedStats.verified} label="Verified" isGreen />
        <StatItem value={formattedStats.scans} label="Scans" />
      </div>
    </main>
  )
}

function ScanStep({ active, label }: { active: boolean; label: string }) {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      marginBottom: '8px',
      opacity: active ? 1 : 0.4,
    }}>
      {active ? (
        <span style={{ color: '#22c55e' }}>✓</span>
      ) : (
        <div style={{
          width: '12px',
          height: '12px',
          border: '2px solid #22c55e',
          borderTopColor: 'transparent',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
        }} />
      )}
      <span style={{ color: active ? '#71717a' : '#ffffff' }}>{label}</span>
    </div>
  )
}

function StatItem({ value, label, isGreen = false }: { value: string; label: string; isGreen?: boolean }) {
  return (
    <div style={{ textAlign: 'center' }}>
      <div style={{
        fontFamily: 'JetBrains Mono, monospace',
        fontSize: '20px',
        fontWeight: 700,
        color: isGreen ? '#22c55e' : '#ffffff',
      }}>
        {value}
      </div>
      <div style={{
        fontSize: '12px',
        textTransform: 'uppercase',
        color: '#71717a',
        marginTop: '4px',
        letterSpacing: '0.1em',
      }}>
        {label}
      </div>
    </div>
  )
}

export default HeroSearch
