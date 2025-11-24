'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import type { SearchCounts } from './AgentCarousel'

type MarketAgent = {
  id: string
  slug: string
  name: string
  short_description: string | null
  platform?: string | null
  key_features?: string[] | null
  official_url?: string | null
  ai_search_count?: number | null
}

interface AgentExperienceSwitchProps {
  agents: MarketAgent[]
  countsByAgentId: Record<string, SearchCounts>
}

type ViewMode = 'market' | 'push'

export function AgentExperienceSwitch({ agents, countsByAgentId }: AgentExperienceSwitchProps) {
  const [mode, setMode] = useState<ViewMode>('market')
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success'>('idle')

  const featuredAgents = useMemo(() => agents.slice(0, 9), [agents])

  const handleSubmit: React.FormEventHandler<HTMLFormElement> = (event) => {
    event.preventDefault()
    setStatus('submitting')

    // 模拟触发 AI ingest 工作流
    setTimeout(() => {
      setStatus('success')
      event.currentTarget.reset()
    }, 800)
  }

  return (
    <div className="rounded-[28px] border border-white/10 bg-white/5 p-1 backdrop-blur-xl">
      <div className="rounded-[24px] bg-slate-950/80 p-8">
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="text-xs uppercase tracking-[0.4em] text-slate-400">AGENT PORTAL</div>
            <h2 className="mt-2 text-3xl font-semibold text-white md:text-4xl">Agent Market / Push Agent</h2>
            <p className="mt-3 max-w-2xl text-sm text-slate-300">
              在 AI 搜索的时代，优秀的 Agent 需要被看见。浏览精选市场，或一键发布你的作品，Super Alpha Agent 会自动解析并结构化，让所有 AI 引擎都能理解你的价值。
            </p>
          </div>
          <div className="flex shrink-0 rounded-full border border-white/10 bg-white/5 p-1 text-sm font-medium text-slate-200">
            <button
              type="button"
              onClick={() => setMode('market')}
              className={`rounded-full px-6 py-2 transition ${mode === 'market' ? 'bg-cyan-400 text-slate-900 shadow-lg shadow-cyan-500/30' : 'hover:bg-white/10'}`}
            >
              Agent Market
            </button>
            <button
              type="button"
              onClick={() => setMode('push')}
              className={`rounded-full px-6 py-2 transition ${mode === 'push' ? 'bg-indigo-400 text-slate-900 shadow-lg shadow-indigo-500/30' : 'hover:bg-white/10'}`}
            >
              Push Agent
            </button>
          </div>
        </div>

        {mode === 'market' ? (
          <div className="mt-10 grid gap-6 lg:grid-cols-3">
            {featuredAgents.map((agent) => {
              const counts = countsByAgentId[agent.id] || { gpt: 0, gemini: 0, perplexity: 0, tavily: 0 }
              const total = Object.values(counts).reduce((sum, value) => sum + value, 0)
              return (
                <article
                  key={agent.id}
                  className="group relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-slate-900/80 via-slate-900/40 to-indigo-900/40 p-6 transition-all duration-300 hover:-translate-y-1 hover:border-cyan-400/60"
                >
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-semibold text-white">{agent.name}</h3>
                    {agent.platform && (
                      <span className="rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[11px] uppercase tracking-wide text-slate-200">
                        {agent.platform}
                      </span>
                    )}
                  </div>
                  {agent.short_description && (
                    <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-slate-300">{agent.short_description}</p>
                  )}

                  <div className="mt-5 grid grid-cols-2 gap-3 text-xs text-slate-200">
                    <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-3">
                      <div className="text-[11px] uppercase tracking-wide text-slate-400">AI 搜索总量</div>
                      <div className="mt-1 text-2xl font-semibold text-white">{total.toLocaleString()}</div>
                    </div>
                    <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-3">
                      <div className="text-[11px] uppercase tracking-wide text-slate-400">平台指数</div>
                      <div className="mt-1 text-lg font-semibold text-cyan-300">
                        {Math.max(1, Math.round((total || agent.ai_search_count || 0) / 12))}
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-2 text-[11px] text-slate-300">
                    <div className="rounded-lg bg-cyan-400/10 px-3 py-2">
                      <span className="font-medium text-cyan-200">GPT</span>
                      <span className="ml-2 font-semibold text-white">{counts.gpt.toLocaleString()}</span>
                    </div>
                    <div className="rounded-lg bg-purple-400/10 px-3 py-2">
                      <span className="font-medium text-purple-200">Gemini</span>
                      <span className="ml-2 font-semibold text-white">{counts.gemini.toLocaleString()}</span>
                    </div>
                    <div className="rounded-lg bg-blue-400/10 px-3 py-2">
                      <span className="font-medium text-blue-200">Perplexity</span>
                      <span className="ml-2 font-semibold text-white">{counts.perplexity.toLocaleString()}</span>
                    </div>
                    <div className="rounded-lg bg-amber-400/10 px-3 py-2">
                      <span className="font-medium text-amber-200">Tavily</span>
                      <span className="ml-2 font-semibold text-white">{counts.tavily.toLocaleString()}</span>
                    </div>
                  </div>

                  <div className="mt-6 flex flex-wrap items-center gap-2 text-[11px] uppercase tracking-wide text-slate-300">
                    {agent.key_features?.slice(0, 3).map((feature, idx) => (
                      <span key={idx} className="rounded-full bg-white/5 px-3 py-1 text-slate-200">
                        {feature}
                      </span>
                    ))}
                  </div>

                  <div className="mt-6 flex items-center justify-between text-sm">
                    <Link
                      href={`/agents/${agent.slug}`}
                      className="inline-flex items-center gap-2 text-cyan-300 transition hover:text-cyan-200"
                    >
                      查看详情
                      <span aria-hidden>↗</span>
                    </Link>
                    {agent.official_url && (
                      <a
                        href={agent.official_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-slate-300 transition hover:text-white"
                      >
                        官网
                        <span aria-hidden>↗</span>
                      </a>
                    )}
                  </div>
                </article>
              )
            })}
          </div>
        ) : (
          <div className="mt-10 grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
            <div className="rounded-2xl border border-indigo-400/40 bg-gradient-to-br from-indigo-500/20 via-slate-900/60 to-purple-500/20 p-8">
              <div className="text-xs uppercase tracking-[0.4em] text-indigo-200">PUSH YOUR AGENT</div>
              <h3 className="mt-3 text-3xl font-semibold text-white">一键上架 · AI 自动解析</h3>
              <p className="mt-3 text-sm leading-relaxed text-indigo-100/80">
                粘贴你的 Agent 页面链接，AI 将自动抓取介绍、功能、定价与使用场景，生成结构化数据并入库 Super Alpha Agent。所有 AI 搜索引擎将即时同步更新。
              </p>

              <ul className="mt-6 space-y-3 text-sm text-indigo-100/80">
                <li className="flex items-start gap-3">
                  <span className="mt-1 text-lg">⚡</span>
                  <div>
                    <span className="font-semibold text-white">全自动解析</span>
                    <p className="text-xs text-indigo-100/80">识别功能亮点、适用场景、核心卖点，并生成结构化 Schema。</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="mt-1 text-lg">🔁</span>
                  <div>
                    <span className="font-semibold text-white">实时回写</span>
                    <p className="text-xs text-indigo-100/80">当你的页面更新时，AI 会重新抓取，保持 AI 搜索结果与时俱进。</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="mt-1 text-lg">🌌</span>
                  <div>
                    <span className="font-semibold text-white">AI 优化曝光</span>
                    <p className="text-xs text-indigo-100/80">针对 GPT、Gemini、Perplexity、Tavily 的索引策略自动调优。</p>
                  </div>
                </li>
              </ul>
            </div>

            <form
              onSubmit={handleSubmit}
              className="flex flex-col gap-4 rounded-2xl border border-white/10 bg-white/5 p-8 text-sm text-slate-200"
            >
              <label className="flex flex-col gap-2">
                <span className="text-xs uppercase tracking-[0.3em] text-slate-400">Agent 名称</span>
                <input
                  name="agentName"
                  required
                  placeholder="如：Super Alpha Navigator"
                  className="rounded-lg border border-white/10 bg-slate-900/60 px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-400"
                />
              </label>

              <label className="flex flex-col gap-2">
                <span className="text-xs uppercase tracking-[0.3em] text-slate-400">Agent 官方链接</span>
                <input
                  name="agentUrl"
                  required
                  type="url"
                  placeholder="https://"
                  className="rounded-lg border border-white/10 bg-slate-900/60 px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-400"
                />
              </label>

              <label className="flex flex-col gap-2">
                <span className="text-xs uppercase tracking-[0.3em] text-slate-400">核心亮点 / 备注</span>
                <textarea
                  name="agentNotes"
                  rows={4}
                  placeholder="可贴上介绍、功能列表或使用场景。AI 会自动提取关键信息。"
                  className="rounded-lg border border-white/10 bg-slate-900/60 px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-400"
                />
              </label>

              <button
                type="submit"
                disabled={status === 'submitting'}
                className="mt-2 inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-cyan-400 via-sky-400 to-indigo-400 px-6 py-3 text-sm font-semibold text-slate-900 transition hover:from-cyan-300 hover:via-sky-300 hover:to-indigo-300 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {status === 'submitting' ? 'AI 解析中…' : status === 'success' ? '已提交，等待 AI 解析' : '推送至 Super Alpha Agent'}
              </button>

              {status === 'success' && (
                <p className="text-xs text-cyan-200">
                  ✅ 我们正在召唤多模态智能体读取你的 Agent，几分钟内即可在市场中展示。
                </p>
              )}
            </form>
          </div>
        )}
      </div>
    </div>
  )
}
