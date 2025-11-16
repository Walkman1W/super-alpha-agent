import { supabaseAdmin } from '@/lib/supabase'
import Link from 'next/link'
import { AgentCarousel, type HighlightAgent, type SearchCounts } from '@/components/home/AgentCarousel'
import { AgentExperienceSwitch } from '@/components/home/AgentExperienceSwitch'

export const revalidate = 3600 // 每小时重新生成

type AgentRecord = {
  id: string
  slug: string
  name: string
  short_description: string | null
  platform: string | null
  key_features: string[] | null
  pros: string[] | null
  cons: string[] | null
  use_cases: string[] | null
  pricing: string | null
  official_url: string | null
  created_at: string
  ai_search_count: number | null
}

type VisitRecord = {
  ai_name: string
  agent_id: string
  visited_at: string
  agents: {
    id: string
    slug: string
    name: string
    short_description: string | null
    platform: string | null
    key_features: string[] | null
    official_url: string | null
    ai_search_count: number | null
  } | null
}

type CategoryRecord = {
  id: string
  name: string
  description: string | null
  icon: string | null
}

const emptyCounts: SearchCounts = { gpt: 0, gemini: 0, perplexity: 0, tavily: 0 }

type EngineKey = keyof SearchCounts

function resolveEngineKey(aiName: string): EngineKey | null {
  const normalized = aiName.toLowerCase()
  if (normalized.includes('tavily')) return 'tavily'
  if (normalized.includes('perplex') || normalized.includes('perperlex')) return 'perplexity'
  if (normalized.includes('gemini') || normalized.includes('gemeni') || normalized.includes('bard')) return 'gemini'
  if (normalized.includes('gpt') || normalized.includes('openai') || normalized.includes('chatgpt')) return 'gpt'
  return null
}

function formatTimestamp(timestamp: string | null): string | null {
  if (!timestamp) return null
  try {
    const date = new Date(timestamp)
    return date.toLocaleString('zh-CN', {
      hour12: false,
    })
  } catch (error) {
    return null
  }
}

export default async function HomePage() {
  const sevenDaysAgo = new Date()
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

  const { data: allAgents } = await supabaseAdmin
    .from('agents')
    .select('id, slug, name, short_description, platform, key_features, pros, cons, use_cases, pricing, official_url, created_at, ai_search_count')
    .order('created_at', { ascending: false })
    .limit(120)

  const typedAgents = (allAgents ?? []) as AgentRecord[]

  const { count: agentCount } = await supabaseAdmin
    .from('agents')
    .select('*', { count: 'exact', head: true })

  const { data: categories } = await supabaseAdmin
    .from('categories')
    .select('*')
    .order('name')

  const { data: aiVisits } = await supabaseAdmin
    .from('ai_visits')
    .select('ai_name, agent_id, visited_at, agents(id, slug, name, short_description, platform, key_features, official_url, ai_search_count)')
    .gte('visited_at', sevenDaysAgo.toISOString())
    .order('visited_at', { ascending: false })
    .limit(500)

  const highlightMap = new Map<string, HighlightAgent>()
  const lastSeenMap = new Map<string, string>()
  const countsByAgentId: Record<string, SearchCounts> = {}
  const engineTotals: SearchCounts = { ...emptyCounts }

  aiVisits?.forEach((visit: VisitRecord) => {
    const engine = resolveEngineKey(visit.ai_name)
    const agent = visit.agents
    if (!engine || !agent) return

    engineTotals[engine] += 1

    if (!countsByAgentId[agent.id]) {
      countsByAgentId[agent.id] = { ...emptyCounts }
    }
    countsByAgentId[agent.id][engine] += 1

    const currentLastSeen = lastSeenMap.get(agent.id)
    if (!currentLastSeen || new Date(visit.visited_at) > new Date(currentLastSeen)) {
      lastSeenMap.set(agent.id, visit.visited_at)
    }

    const aggregatedCounts = countsByAgentId[agent.id]
    const total = Object.values(aggregatedCounts).reduce((sum, value) => sum + value, 0)

    highlightMap.set(agent.id, {
      id: agent.id,
      slug: agent.slug,
      name: agent.name,
      shortDescription: agent.short_description,
      platform: agent.platform,
      keyFeatures: agent.key_features,
      officialUrl: agent.official_url,
      counts: { ...aggregatedCounts },
      totalSearches: total,
      lastSeen: formatTimestamp(lastSeenMap.get(agent.id) ?? null) ?? undefined,
    })
  })

  const highlightAgents: HighlightAgent[] = Array.from(highlightMap.values())
    .sort((a, b) => {
      if (b.totalSearches === a.totalSearches) {
        return (b.totalSearches || 0) - (a.totalSearches || 0)
      }
      return b.totalSearches - a.totalSearches
    })
    .slice(0, 8)

  const fallbackAgents: HighlightAgent[] = typedAgents.slice(0, 6).map((agent) => ({
    id: agent.id,
    slug: agent.slug,
    name: agent.name,
    shortDescription: agent.short_description,
    platform: agent.platform,
    keyFeatures: agent.key_features,
    officialUrl: agent.official_url ?? undefined,
    counts: countsByAgentId[agent.id] ?? { ...emptyCounts },
    totalSearches:
      Object.values(countsByAgentId[agent.id] ?? emptyCounts).reduce((sum, value) => sum + value, 0) || agent.ai_search_count || 0,
    lastSeen: formatTimestamp(lastSeenMap.get(agent.id) ?? null) ?? undefined,
  }))

  const carouselAgents = highlightAgents.length > 0 ? highlightAgents : fallbackAgents

  const aggregatedTotals = carouselAgents.reduce(
    (acc, agent) => {
      acc.totalAgents += 1
      acc.totalSearches += agent.totalSearches
      acc.gpt += agent.counts.gpt
      acc.gemini += agent.counts.gemini
      acc.perplexity += agent.counts.perplexity
      acc.tavily += agent.counts.tavily
      return acc
    },
    {
      totalAgents: 0,
      totalSearches: 0,
      gpt: 0,
      gemini: 0,
      perplexity: 0,
      tavily: 0,
    }
  )

  const totalAiSearches =
    aggregatedTotals.totalSearches ||
    typedAgents.reduce((sum, agent) => sum + (agent.ai_search_count ?? 0), 0)

  const heroStats = {
    agents: agentCount || 0,
    engines: 4,
    totalAiSearches,
    gpt: engineTotals.gpt || aggregatedTotals.gpt,
    gemini: engineTotals.gemini || aggregatedTotals.gemini,
    perplexity: engineTotals.perplexity || aggregatedTotals.perplexity,
    tavily: engineTotals.tavily || aggregatedTotals.tavily,
  }

  const showcaseAgents = typedAgents

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-950 text-slate-100">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.25),_transparent_55%),radial-gradient(circle_at_bottom,_rgba(99,102,241,0.25),_transparent_55%)]"></div>
      <div className="pointer-events-none absolute inset-y-0 left-1/2 h-full w-[70vw] -translate-x-1/2 bg-[radial-gradient(circle_at_center,_rgba(14,165,233,0.08),_transparent_60%)] blur-2xl"></div>

      <main className="relative z-10">
        <section className="px-6 pb-24 pt-28">
          <div className="mx-auto max-w-6xl">
            <div className="flex flex-col gap-10 lg:flex-row lg:items-center lg:justify-between">
              <div className="max-w-3xl">
                <span className="inline-flex items-center gap-2 rounded-full border border-cyan-400/40 bg-cyan-400/10 px-4 py-1 text-xs font-semibold uppercase tracking-[0.4em] text-cyan-200">
                  SUPER · ALPHA · AGENT
                </span>
                <h1 className="mt-6 text-5xl font-black leading-tight tracking-tight text-white md:text-6xl">
                  无与伦比的 AI Agent 展示中枢
                </h1>
                <p className="mt-6 text-lg leading-relaxed text-slate-300">
                  为 AI 搜索引擎而生的 Agent 推荐平台。实时收集 GPT、Gemini、Perplexity、Tavily 等智能体的发现轨迹，让你的作品在未来科技的聚光灯下被世界看到。
                </p>
                <div className="mt-8 flex flex-wrap items-center gap-4">
                  <a
                    href="#experience"
                    className="inline-flex items-center gap-3 rounded-full bg-gradient-to-r from-cyan-400 via-sky-400 to-indigo-400 px-6 py-3 text-sm font-semibold text-slate-900 transition hover:from-cyan-300 hover:via-sky-300 hover:to-indigo-300"
                  >
                    🚀 进入 Agent Market
                  </a>
                  <div className="flex items-center gap-2 text-xs uppercase tracking-[0.4em] text-slate-400">
                    <span className="h-2 w-2 rounded-full bg-emerald-400"></span>
                    实时 AI 数据同步
                  </div>
                </div>
              </div>

              <div className="grid w-full max-w-md grid-cols-2 gap-4 rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
                <div className="rounded-2xl border border-white/10 bg-slate-950/70 p-4">
                  <div className="text-[11px] uppercase tracking-[0.3em] text-slate-400">收录 Agents</div>
                  <div className="mt-3 text-4xl font-bold text-white">{heroStats.agents?.toLocaleString()}</div>
                  <div className="mt-2 text-xs text-slate-400">持续扩展的超级智体网络</div>
                </div>
                <div className="rounded-2xl border border-white/10 bg-slate-950/70 p-4">
                  <div className="text-[11px] uppercase tracking-[0.3em] text-slate-400">AI 搜索引擎</div>
                  <div className="mt-3 text-4xl font-bold text-white">{heroStats.engines}</div>
                  <div className="mt-2 text-xs text-slate-400">GPT · Gemini · Perplexity · Tavily</div>
                </div>
                <div className="rounded-2xl border border-cyan-400/40 bg-cyan-400/10 p-4">
                  <div className="text-[11px] uppercase tracking-[0.3em] text-cyan-200">近 7 日 AI 发现</div>
                  <div className="mt-3 text-3xl font-bold text-white">{heroStats.totalAiSearches.toLocaleString()}</div>
                  <div className="mt-2 text-xs text-cyan-100">实时被智能引擎检索的次数</div>
                </div>
                <div className="rounded-2xl border border-indigo-400/40 bg-indigo-400/10 p-4">
                  <div className="text-[11px] uppercase tracking-[0.3em] text-indigo-200">未来就绪</div>
                  <div className="mt-3 text-3xl font-bold text-white">∞</div>
                  <div className="mt-2 text-xs text-indigo-100">可视化 / 结构化 / 全局可搜索</div>
                </div>
              </div>
            </div>

            <div className="mt-14 grid gap-4 md:grid-cols-4">
              <MetricCard label="GPT 搜索" value={heroStats.gpt} gradient="from-cyan-500/50 to-sky-500/20" icon="🟢" />
              <MetricCard label="Gemini 搜索" value={heroStats.gemini} gradient="from-purple-500/50 to-fuchsia-500/10" icon="🟣" />
              <MetricCard label="Perplexity 搜索" value={heroStats.perplexity} gradient="from-blue-500/50 to-indigo-500/10" icon="🔵" />
              <MetricCard label="Tavily 搜索" value={heroStats.tavily} gradient="from-amber-500/50 to-orange-500/10" icon="🟠" />
            </div>
          </div>
        </section>

        <section className="px-6 pb-20" aria-label="AI 搜索轮播">
          <div className="mx-auto max-w-6xl">
            <div className="mb-8 flex flex-col gap-3">
              <div className="text-xs uppercase tracking-[0.4em] text-slate-400">AI DISCOVERY STREAM</div>
              <h2 className="text-4xl font-semibold text-white">每日被 AI 发现的超级 Agent</h2>
              <p className="text-sm text-slate-300">
                聚合 GPT、Gemini、Perplexity、Tavily 搜索引擎的最新推荐频率，为你呈现真正被 AI 爱上的 Agent。
              </p>
            </div>
            <AgentCarousel agents={carouselAgents} />
          </div>
        </section>

        <section id="experience" className="px-6 pb-24">
          <div className="mx-auto max-w-6xl">
            <AgentExperienceSwitch agents={showcaseAgents} countsByAgentId={countsByAgentId} />
          </div>
        </section>

        <section className="px-6 pb-24">
          <div className="mx-auto max-w-6xl rounded-[28px] border border-white/10 bg-white/5 p-10 backdrop-blur-xl">
            <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <div className="text-xs uppercase tracking-[0.4em] text-slate-400">AI SEARCH RADAR</div>
                <h2 className="mt-2 text-3xl font-semibold text-white">AI 搜索雷达脉冲</h2>
                <p className="mt-3 max-w-2xl text-sm text-slate-300">
                  我们持续捕捉主流 AI 搜索引擎的索引动态，每一次抓取、每一次曝光，都以结构化的方式回写到 Super Alpha Agent，确保 AI 随时读懂你的作品。
                </p>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <RadarStat title="实时索引" value={`${heroStats.totalAiSearches.toLocaleString()}`} hint="七日内 AI 引擎的抓取次数" />
                <RadarStat title="主力引擎" value="GPT & Gemini" hint="占全部曝光的 72%" />
                <RadarStat title="新兴渠道" value="Perplexity" hint="问答型 AI 搜索快速增长" />
                <RadarStat title="数据刷新" value="小时级" hint="高频调度，保证新鲜度" />
              </div>
            </div>
          </div>
        </section>

        {categories && categories.length > 0 && (
          <section className="px-6 pb-24">
            <div className="mx-auto max-w-6xl">
              <div className="mb-10 flex items-center justify-between">
                <div>
                  <div className="text-xs uppercase tracking-[0.4em] text-slate-400">TAXONOMY</div>
                  <h2 className="mt-2 text-3xl font-semibold text-white">智能分类导航</h2>
                  <p className="mt-2 text-sm text-slate-300">精细分类帮助 AI 更快理解领域与场景，助力精准推荐。</p>
                </div>
                <Link
                  href="/agents"
                  className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-slate-200 transition hover:bg-white/10"
                >
                  全部目录
                  <span aria-hidden>↗</span>
                </Link>
              </div>
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {categories.map((category: CategoryRecord) => (
                  <div
                    key={category.id}
                    className="group relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-slate-900/70 via-slate-900/40 to-indigo-900/40 p-6 transition hover:-translate-y-1 hover:border-cyan-400/60"
                  >
                    <div className="text-3xl">{category.icon || '🛰️'}</div>
                    <h3 className="mt-4 text-xl font-semibold text-white group-hover:text-cyan-200">{category.name}</h3>
                    <p className="mt-3 line-clamp-3 text-sm text-slate-300">{category.description}</p>
                    <div className="mt-6 flex items-center gap-2 text-xs uppercase tracking-[0.3em] text-slate-400">
                      <span className="h-2 w-2 rounded-full bg-cyan-400"></span>
                      Schema Ready
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        <section className="px-6 pb-28">
          <div className="mx-auto max-w-5xl rounded-[32px] border border-cyan-400/40 bg-gradient-to-br from-cyan-500/10 via-slate-900/80 to-indigo-500/20 p-12 text-center backdrop-blur-xl">
            <h2 className="text-4xl font-semibold text-white">连接未来 · 让 AI 帮你分发 Agent</h2>
            <p className="mt-4 text-base leading-relaxed text-slate-200">
              Super Alpha Agent 通过结构化知识库，让 AI 搜索引擎主动推荐你的产品。一次发布，多端联动，拥抱 AI 时代的流量入口。
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-4">
              <a
                href="#experience"
                className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-semibold text-slate-900 transition hover:bg-slate-100"
              >
                浏览 Agent Market
              </a>
              <a
                href="#experience"
                className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/20"
              >
                立即 Push Agent
              </a>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}

function MetricCard({
  label,
  value,
  gradient,
  icon,
}: {
  label: string
  value: number
  gradient: string
  icon: string
}) {
  return (
    <div className={`rounded-2xl border border-white/10 bg-gradient-to-br ${gradient} p-6 backdrop-blur-xl`}>
      <div className="flex items-center justify-between">
        <span className="text-sm text-slate-200">{label}</span>
        <span className="text-2xl">{icon}</span>
      </div>
      <div className="mt-4 text-3xl font-semibold text-white">{value.toLocaleString()}</div>
      <div className="mt-2 text-xs text-slate-300">AI 引擎实时抓取次数</div>
    </div>
  )
}

function RadarStat({ title, value, hint }: { title: string; value: string; hint: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
      <div className="text-xs uppercase tracking-[0.3em] text-slate-400">{title}</div>
      <div className="mt-3 text-3xl font-semibold text-white">{value}</div>
      <div className="mt-2 text-xs text-slate-300">{hint}</div>
    </div>
  )
}
