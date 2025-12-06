'use client'

import { StatusPill } from './status-pill'
import { Omnibar } from './omnibar'
import { CodeMarquee } from './code-marquee'

interface HeroTerminalProps {
  signalCount: number
  searchValue: string
  onSearch: (query: string) => void
}

export function HeroTerminal({ signalCount, searchValue, onSearch }: HeroTerminalProps) {
  return (
    <section className="relative w-full overflow-hidden">
      {/* Purple spotlight glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-purple-500/10 rounded-full blur-3xl animate-pulse-slow pointer-events-none" />
      
      <div className="relative z-10 flex flex-col items-center justify-center min-h-[50vh] px-4 py-16 md:py-24">
        {/* Status Pill */}
        <div className="mb-8">
          <StatusPill signalCount={signalCount} status="active" />
        </div>

        {/* Main Headline */}
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-center text-zinc-100 mb-4 tracking-tight">
          Index the{' '}
          <span className="bg-gradient-to-r from-purple-400 to-purple-600 bg-clip-text text-transparent">
            Intelligence
          </span>{' '}
          Economy.
        </h1>

        {/* Subtitle */}
        <p className="text-lg md:text-xl text-zinc-400 text-center mb-10 max-w-2xl font-mono">
          Discover, compare, and track AI agents in real-time
        </p>

        {/* Omnibar Search */}
        <Omnibar
          value={searchValue}
          onChange={onSearch}
          placeholder="Search agents by name, framework, or capability..."
        />
      </div>

      {/* Code Marquee at bottom */}
      <CodeMarquee />
    </section>
  )
}
