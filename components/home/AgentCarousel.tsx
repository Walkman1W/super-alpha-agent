'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'

export type SearchCounts = {
  gpt: number
  gemini: number
  perplexity: number
  tavily: number
}

export type HighlightAgent = {
  id: string
  slug: string
  name: string
  shortDescription?: string | null
  platform?: string | null
  keyFeatures?: string[] | null
  officialUrl?: string | null
  counts: SearchCounts
  totalSearches: number
  lastSeen?: string | null
}

const ENGINE_META: Array<{ key: keyof SearchCounts; label: string; accent: string; icon: string }> = [
  { key: 'gpt', label: 'GPT 搜索', accent: 'from-cyan-400/50 to-sky-500/20', icon: '🟢' },
  { key: 'gemini', label: 'Gemini 搜索', accent: 'from-purple-500/50 to-fuchsia-500/10', icon: '🟣' },
  { key: 'perplexity', label: 'Perplexity 搜索', accent: 'from-blue-500/50 to-indigo-500/10', icon: '🔵' },
  { key: 'tavily', label: 'Tavily 搜索', accent: 'from-amber-500/50 to-orange-500/10', icon: '🟠' },
]

interface AgentCarouselProps {
  agents: HighlightAgent[]
}

export function AgentCarousel({ agents }: AgentCarouselProps) {
  const slides = useMemo(() => agents.filter(Boolean), [agents])
  const [activeIndex, setActiveIndex] = useState(0)

  useEffect(() => {
    if (slides.length <= 1) return
    const timer = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % slides.length)
    }, 7000)
    return () => clearInterval(timer)
  }, [slides.length])

  if (slides.length === 0) {
    return (
      <div className="rounded-3xl border border-white/10 bg-white/5 p-12 text-center text-sm text-slate-300">
        暂无 AI 搜索数据，等待下一次宇宙级更新。
      </div>
    )
  }

  const handleNavigate = (direction: 'prev' | 'next') => {
    if (slides.length === 0) return
    setActiveIndex((prev) => {
      if (direction === 'next') {
        return (prev + 1) % slides.length
      }
      return (prev - 1 + slides.length) % slides.length
    })
  }

  return (
    <div className="relative">
      <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-slate-900/80 via-slate-900/40 to-indigo-900/40 p-1 backdrop-blur-xl">
        <div className="relative min-h-[320px]">
          {slides.map((agent, index) => {
            const isActive = index === activeIndex
            return (
              <article
                key={agent.id}
                className={`absolute inset-0 flex flex-col gap-8 rounded-[26px] bg-slate-950/70 p-10 transition-all duration-700 ease-out ${
                  isActive
                    ? 'translate-x-0 opacity-100'
                    : index < activeIndex
                      ? '-translate-x-full opacity-0'
                      : 'translate-x-full opacity-0'
                }`}
                aria-hidden={!isActive}
              >
                <header className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                  <div>
                    <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-white/5 px-4 py-1 text-xs tracking-widest text-slate-300">
                      <span className="h-2 w-2 rounded-full bg-emerald-400"></span>
                      SUPER AGENT RANKING · AI DISCOVERY
                    </div>
                    <h3 className="text-3xl font-semibold tracking-tight text-white md:text-4xl">{agent.name}</h3>
                    {agent.shortDescription && (
                      <p className="mt-4 max-w-2xl text-base leading-relaxed text-slate-300">
                        {agent.shortDescription}
                      </p>
                    )}
                  </div>
                  <div className="flex shrink-0 flex-col items-end text-right">
                    <span className="text-sm uppercase tracking-[0.3em] text-slate-400">AI 搜索热度</span>
                    <span className="mt-2 text-4xl font-black text-white">
                      {agent.totalSearches.toLocaleString()}
                    </span>
                    <span className="mt-2 text-xs text-slate-400">日常被 AI 搜索引擎发现的次数</span>
                    {agent.lastSeen && (
                      <span className="mt-3 inline-flex items-center gap-2 rounded-full bg-white/5 px-3 py-1 text-xs text-slate-300">
                        <span className="h-2 w-2 animate-pulse rounded-full bg-cyan-400"></span>
                        最近一次被索引 · {agent.lastSeen}
                      </span>
                    )}
                  </div>
                </header>

                <div className="grid gap-4 md:grid-cols-4">
                  {ENGINE_META.map((meta) => {
                    const value = agent.counts[meta.key]
                    return (
                      <div
                        key={meta.key}
                        className={`group relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br ${meta.accent} p-4 transition-transform duration-300 hover:-translate-y-1`}
                      >
                        <div className="relative z-10 flex flex-col gap-2">
                          <span className="text-2xl">{meta.icon}</span>
                          <span className="text-xs uppercase tracking-wide text-slate-200">{meta.label}</span>
                          <span className="text-2xl font-semibold text-white">{value.toLocaleString()}</span>
                          <span className="text-[11px] text-slate-300">每日索引触达</span>
                        </div>
                        <div className="absolute -right-6 -top-6 h-16 w-16 rounded-full bg-white/10 blur-2xl transition-opacity group-hover:opacity-80"></div>
                      </div>
                    )
                  })}
                </div>

                <footer className="flex flex-col justify-between gap-4 border-t border-white/10 pt-6 md:flex-row md:items-center">
                  <div className="flex flex-wrap items-center gap-2 text-sm text-slate-300">
                    {agent.platform && (
                      <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs uppercase tracking-wide text-slate-200">
                        {agent.platform}
                      </span>
                    )}
                    {agent.keyFeatures?.slice(0, 3).map((feature, idx) => (
                      <span key={idx} className="rounded-full bg-white/5 px-3 py-1 text-xs text-slate-200">
                        {feature}
                      </span>
                    ))}
                  </div>
                  <div className="flex items-center gap-3">
                    {agent.officialUrl && (
                      <a
                        href={agent.officialUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-5 py-2 text-sm font-medium text-white transition hover:bg-white/20"
                      >
                        访问官网
                        <span aria-hidden>↗</span>
                      </a>
                    )}
                    <Link
                      href={`/agents/${agent.slug}`}
                      className="inline-flex items-center gap-2 rounded-full bg-cyan-400/90 px-5 py-2 text-sm font-semibold text-slate-900 transition hover:bg-cyan-300"
                    >
                      查看深度解析
                    </Link>
                  </div>
                </footer>
              </article>
            )
          })}
        </div>
      </div>

      {slides.length > 1 && (
        <div className="mt-6 flex flex-col items-center justify-between gap-4 sm:flex-row">
          <div className="flex items-center gap-3 text-xs uppercase tracking-[0.3em] text-slate-400">
            <span className="h-2 w-2 rounded-full bg-cyan-400"></span>
            AI DISCOVERY STREAM
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => handleNavigate('prev')}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-white/5 text-white transition hover:bg-white/20"
              aria-label="上一个 Agent"
            >
              ←
            </button>
            <button
              type="button"
              onClick={() => handleNavigate('next')}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-white/5 text-white transition hover:bg-white/20"
              aria-label="下一个 Agent"
            >
              →
            </button>
          </div>
        </div>
      )}

      {slides.length > 1 && (
        <div className="mt-4 flex justify-center gap-2">
          {slides.map((agent, index) => (
            <button
              key={agent.id}
              type="button"
              onClick={() => setActiveIndex(index)}
              className={`h-2 w-8 rounded-full transition ${index === activeIndex ? 'bg-cyan-400' : 'bg-white/20 hover:bg-white/40'}`}
              aria-label={`跳转到 ${agent.name}`}
            />
          ))}
        </div>
      )}
    </div>
  )
}
