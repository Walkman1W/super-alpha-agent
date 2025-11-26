import { supabaseAdmin } from '@/lib/supabase'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { AIVisitTracker } from '@/components/ai-visit-tracker'

export const revalidate = 3600

type Props = {
  params: { slug: string }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { data: agent } = await supabaseAdmin
    .from('agents')
    .select('*')
    .eq('slug', params.slug)
    .single()

  if (!agent) return { title: 'Agent Not Found' }

  return {
    title: `${agent.name} - AI Agent 详细分析`,
    description: agent.short_description,
    keywords: agent.keywords,
    openGraph: {
      title: agent.name,
      description: agent.short_description,
      type: 'article',
    },
  }
}

export default async function AgentDetailPage({ params }: Props) {
  const { data: agent } = await supabaseAdmin
    .from('agents')
    .select('*, categories(name, slug, icon)')
    .eq('slug', params.slug)
    .single()

  if (!agent) notFound()

  // 增加浏览量
  await supabaseAdmin
    .from('agents')
    .update({ view_count: agent.view_count + 1 })
    .eq('id', agent.id)

  // 获取相似 Agents
  const { data: similarAgents } = await supabaseAdmin
    .from('agents')
    .select('id, slug, name, short_description, platform, ai_search_count')
    .eq('category_id', agent.category_id)
    .neq('id', agent.id)
    .order('ai_search_count', { ascending: false })
    .limit(3)

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-purple-900">
      {/* 背景动画 */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/50 via-blue-900/50 to-black/50 opacity-90"></div>
        <div className="absolute inset-0" style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)`,
          backgroundSize: '40px 40px'
        }}></div>
      </div>

      {/* 导航栏 */}
      <nav className="relative z-20 bg-black/20 backdrop-blur-md border-b border-white/10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">SA</span>
              </div>
              <span className="text-white font-bold text-xl">Super Alpha Agent</span>
            </div>
            <div className="flex space-x-4">
              <Link href="/market" className="text-white hover:text-purple-300 transition-colors px-4 py-2 rounded-lg hover:bg-white/10">
                Agent市场
              </Link>
              <Link href="/submit" className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-4 py-2 rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all">
                发布Agent
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="relative z-10 container mx-auto px-4 py-12">
        {/* 结构化数据（AI 友好） */}
        <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'SoftwareApplication',
            name: agent.name,
            description: agent.detailed_description,
            applicationCategory: agent.categories?.name,
            offers: {
              '@type': 'Offer',
              price: agent.pricing === '免费' ? '0' : 'varies',
            },
          }),
        }}
      />

      {/* 面包屑 */}
      <div className="flex items-center gap-2 text-sm text-gray-300 mb-6">
        <Link href="/" className="text-purple-300 hover:text-white transition-colors">首页</Link>
        <span className="text-gray-500">›</span>
        <Link href="/market" className="text-purple-300 hover:text-white transition-colors">Agent市场</Link>
        <span className="text-gray-500">›</span>
        <Link href={`/categories/${agent.categories?.slug}`} className="text-purple-300 hover:text-white transition-colors">
          {agent.categories?.name}
        </Link>
        <span className="text-gray-500">›</span>
        <span className="text-white font-semibold">{agent.name}</span>
      </div>

      {/* 🆕 AI 访问追踪 */}
      <AIVisitTracker agentSlug={params.slug} />

      {/* 标题区域 */}
      <header className="border-b border-white/20 pb-6 mb-8">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-green-400 text-sm font-medium">AI 搜索引擎优化就绪</span>
            </div>
            <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
              {agent.name}
            </h1>
            <p className="text-xl text-gray-300 mb-6 leading-relaxed">
              {agent.short_description}
            </p>
            
            {/* AI 搜索量展示 - 科技感设计 */}
            {agent.ai_search_count > 0 && (
              <div className="flex items-center gap-6 mt-6">
                <div className="flex items-center gap-3 bg-gradient-to-r from-purple-500/20 to-blue-500/20 backdrop-blur-sm px-6 py-3 rounded-xl border border-purple-400/30">
                  <span className="text-3xl animate-pulse">🤖</span>
                  <div>
                    <div className="text-sm text-purple-300 mb-1">AI 搜索量</div>
                    <div className="text-3xl font-bold text-transparent bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text">
                      {agent.ai_search_count.toLocaleString()}
                    </div>
                  </div>
                </div>
                <div className="text-sm text-gray-400">
                  <div className="font-medium text-purple-300">被 AI 搜索引擎发现</div>
                  <div className="text-xs mt-1">ChatGPT • Claude • Perplexity • Gemini</div>
                </div>
              </div>
            )}
          </div>
          <div className="text-right space-y-3">
            <div className="inline-block bg-gradient-to-r from-blue-500/20 to-purple-500/20 backdrop-blur-sm px-4 py-2 rounded-lg border border-blue-400/30">
              <span className="text-blue-300 font-semibold">{agent.platform}</span>
            </div>
            <div className="text-lg text-gray-300 font-medium">
              {agent.pricing}
            </div>
          </div>
        </div>
      </header>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* 主要内容 */}
        <div className="lg:col-span-2 space-y-8">
          {/* 快速概览 - 科技感卡片 */}
          <section className="bg-gradient-to-r from-slate-800/50 to-blue-900/50 backdrop-blur-sm rounded-xl p-8 border border-white/20">
            <h2 className="text-2xl font-bold mb-6 text-white">快速概览</h2>
            <dl className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <dt className="text-purple-300 text-sm font-medium">分类</dt>
                <dd className="font-semibold text-white text-lg">{agent.categories?.name}</dd>
              </div>
              <div className="space-y-2">
                <dt className="text-purple-300 text-sm font-medium">平台</dt>
                <dd className="font-semibold text-white text-lg">{agent.platform}</dd>
              </div>
              <div className="space-y-2">
                <dt className="text-purple-300 text-sm font-medium">定价</dt>
                <dd className="font-semibold text-white text-lg">{agent.pricing}</dd>
              </div>
              <div className="space-y-2">
                <dt className="text-purple-300 text-sm font-medium">浏览量</dt>
                <dd className="font-semibold text-white text-lg">{agent.view_count?.toLocaleString()}</dd>
              </div>
              <div className="col-span-2 space-y-2">
                <dt className="text-purple-300 text-sm font-medium">🤖 AI 搜索量</dt>
                <dd className="font-bold text-transparent bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-2xl">{agent.ai_search_count?.toLocaleString()}</dd>
              </div>
            </dl>
          </section>

          {/* 详细介绍 - 科技感卡片 */}
          <section className="bg-gradient-to-r from-slate-800/50 to-blue-900/50 backdrop-blur-sm rounded-xl p-8 border border-white/20">
            <h2 className="text-2xl font-bold mb-6 text-white">详细介绍</h2>
            <p className="text-gray-300 leading-relaxed text-lg">
              {agent.detailed_description}
            </p>
          </section>

          {/* 核心功能 - 科技感卡片 */}
          <section className="bg-gradient-to-r from-slate-800/50 to-blue-900/50 backdrop-blur-sm rounded-xl p-8 border border-white/20">
            <h2 className="text-2xl font-bold mb-6 text-white">核心功能</h2>
            <ul className="space-y-3">
              {agent.key_features?.map((feature: string, i: number) => (
                <li key={i} className="flex items-start">
                  <span className="text-purple-400 mr-3 text-lg">✓</span>
                  <span className="text-gray-300 text-lg">{feature}</span>
                </li>
              ))}
            </ul>
          </section>

          {/* 适用场景 - 科技感卡片 */}
          <section className="bg-gradient-to-r from-slate-800/50 to-blue-900/50 backdrop-blur-sm rounded-xl p-8 border border-white/20">
            <h2 className="text-2xl font-bold mb-6 text-white">适用场景</h2>
            <ul className="space-y-3">
              {agent.use_cases?.map((useCase: string, i: number) => (
                <li key={i} className="flex items-start">
                  <span className="text-blue-400 mr-3 text-lg">→</span>
                  <span className="text-gray-300 text-lg">{useCase}</span>
                </li>
              ))}
            </ul>
          </section>

          {/* 优缺点对比 - 科技感卡片 */}
          <section className="bg-gradient-to-r from-slate-800/50 to-blue-900/50 backdrop-blur-sm rounded-xl p-8 border border-white/20">
            <h2 className="text-2xl font-bold mb-6 text-white">优缺点分析</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-gradient-to-br from-green-900/30 to-emerald-900/30 backdrop-blur-sm rounded-xl p-6 border border-green-400/30">
                <h3 className="font-semibold text-green-300 mb-4 text-lg flex items-center gap-2">
                  <span className="text-green-400">✓</span> 优点
                </h3>
                <ul className="space-y-3">
                  {agent.pros?.map((pro: string, i: number) => (
                    <li key={i} className="text-gray-300">+ {pro}</li>
                  ))}
                </ul>
              </div>
              <div className="bg-gradient-to-br from-red-900/30 to-rose-900/30 backdrop-blur-sm rounded-xl p-6 border border-red-400/30">
                <h3 className="font-semibold text-red-300 mb-4 text-lg flex items-center gap-2">
                  <span className="text-red-400">⚠</span> 缺点
                </h3>
                <ul className="space-y-3">
                  {agent.cons?.map((con: string, i: number) => (
                    <li key={i} className="text-gray-300">- {con}</li>
                  ))}
                </ul>
              </div>
            </div>
          </section>

          {/* 使用方法 - 科技感卡片 */}
          {agent.how_to_use && (
            <section className="bg-gradient-to-r from-slate-800/50 to-blue-900/50 backdrop-blur-sm rounded-xl p-8 border border-white/20">
              <h2 className="text-2xl font-bold mb-6 text-white">使用方法</h2>
              <div className="prose prose-invert max-w-none">
                <p className="text-gray-300 leading-relaxed text-lg whitespace-pre-line">
                  {agent.how_to_use}
                </p>
              </div>
            </section>
          )}
        </div>

        {/* 侧边栏 */}
        <div className="space-y-6">
          {/* 操作按钮 - 科技感卡片 */}
          <div className="bg-gradient-to-r from-slate-800/50 to-blue-900/50 backdrop-blur-sm rounded-xl p-6 space-y-4 border border-white/20">
            {agent.official_url && (
              <a
                href={agent.official_url}
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white text-center py-3 rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all font-semibold"
              >
                访问官网
              </a>
            )}
            <button className="block w-full border border-white/30 text-white py-3 rounded-lg hover:bg-white/10 transition-all">
              收藏
            </button>
          </div>

          {/* 相似 Agents - 科技感卡片 */}
          {similarAgents && similarAgents.length > 0 && (
            <div className="bg-gradient-to-r from-slate-800/50 to-blue-900/50 backdrop-blur-sm rounded-xl p-6 border border-white/20">
              <h3 className="font-bold mb-4 text-white text-lg">相似 Agents</h3>
              <div className="space-y-4">
                {similarAgents.map((similar) => (
                  <Link
                    key={similar.id}
                    href={`/agents/${similar.slug}`}
                    className="block p-4 bg-white/5 rounded-lg border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all group"
                  >
                    <div className="font-semibold text-white group-hover:text-purple-300 transition-colors">{similar.name}</div>
                    <div className="text-sm text-gray-400 mt-2 line-clamp-2">
                      {similar.short_description}
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-xs text-purple-300">AI搜索: {similar.ai_search_count?.toLocaleString()}</span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* FAQ（AI 友好） - 科技感卡片 */}
      <section className="mt-12 bg-gradient-to-r from-slate-800/50 to-blue-900/50 backdrop-blur-sm rounded-xl p-8 border border-white/20">
        <h2 className="text-2xl font-bold text-white mb-6">常见问题</h2>
        
        <div className="space-y-6">
          <div className="border-b border-white/20 pb-4">
            <h3 className="text-lg font-semibold text-purple-300 mb-2">{agent.name} 是什么？</h3>
            <p className="text-gray-300">{agent.short_description}</p>
          </div>
          
          <div className="border-b border-white/20 pb-4">
            <h3 className="text-lg font-semibold text-purple-300 mb-2">{agent.name} 有什么功能？</h3>
            <p className="text-gray-300">{agent.key_features?.join(' • ')}</p>
          </div>
          
          <div className="border-b border-white/20 pb-4">
            <h3 className="text-lg font-semibold text-purple-300 mb-2">{agent.name} 适合谁使用？</h3>
            <p className="text-gray-300">{agent.use_cases?.join(' • ')}</p>
          </div>
          
          <div className="border-b border-white/20 pb-4">
            <h3 className="text-lg font-semibold text-purple-300 mb-2">{agent.name} 的优点是什么？</h3>
            <p className="text-gray-300">{agent.pros?.join(' • ')}</p>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold text-purple-300 mb-2">{agent.name} 有什么缺点？</h3>
            <p className="text-gray-300">{agent.cons?.join(' • ')}</p>
          </div>
        </div>
      </section>
    </div>
  )
}
