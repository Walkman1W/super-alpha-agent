'use client'

import { StatusPill } from './status-pill'
import { Omnibar } from './omnibar'
import { CodeMarquee } from './code-marquee'

interface HeroTerminalProps {
  signalCount: number
  searchValue: string
  onSearch: (query: string) => void
}

/**
 * HeroTerminal 组件
 * 终端风格 Hero 区域，响应式布局优化
 * 
 * **Validates: Requirements 2.1, 2.2, 2.3, 2.4, 2.6, 9.1**
 */
export function HeroTerminal({ signalCount, searchValue, onSearch }: HeroTerminalProps) {
  return (
    <section className="relative w-full overflow-hidden">
      {/* Purple spotlight glow - 移动端缩小 */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[200px] sm:w-[400px] sm:h-[300px] md:w-[600px] md:h-[400px] bg-purple-500/10 rounded-full blur-3xl animate-pulse-slow pointer-events-none" />
      
      {/* 响应式内边距和最小高度 */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-[40vh] sm:min-h-[45vh] md:min-h-[50vh] px-4 py-10 sm:py-14 md:py-20 lg:py-24">
        {/* Status Pill - 移动端缩小间距 */}
        <div className="mb-4 sm:mb-6 md:mb-8">
          <StatusPill signalCount={signalCount} status="active" />
        </div>

        {/* Main Headline - 响应式字体大小 */}
        <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold text-center text-zinc-100 mb-2 sm:mb-3 md:mb-4 tracking-tight leading-tight">
          <span className="block sm:inline">Index the</span>{' '}
          <span className="bg-gradient-to-r from-purple-400 to-purple-600 bg-clip-text text-transparent">
            Intelligence
          </span>{' '}
          <span className="block sm:inline">Economy.</span>
        </h1>

        {/* Subtitle - 响应式字体和间距 */}
        <p className="text-sm sm:text-base md:text-lg lg:text-xl text-zinc-400 text-center mb-6 sm:mb-8 md:mb-10 max-w-xs sm:max-w-md md:max-w-xl lg:max-w-2xl font-mono px-2">
          Discover, compare, and track AI agents in real-time
        </p>

        {/* Omnibar Search - 响应式宽度 */}
        <div className="w-full max-w-[90vw] sm:max-w-md md:max-w-lg lg:max-w-xl">
          <Omnibar
            value={searchValue}
            onChange={onSearch}
            placeholder="Search agents..."
          />
        </div>
      </div>

      {/* Code Marquee at bottom - 移动端可选隐藏 */}
      <div className="hidden sm:block">
        <CodeMarquee />
      </div>
    </section>
  )
}
