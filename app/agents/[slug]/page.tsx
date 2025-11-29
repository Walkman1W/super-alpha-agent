import { supabaseAdmin } from '@/lib/supabase'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { AIVisitTracker } from '@/components/ai-visit-tracker'
import { AISearchStats } from '@/components/ai-search-stats'

export const revalidate = 3600

type Props = {
  params: { slug: string }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { data: agent } = await supabaseAdmin
    .from('agents')
    .select('*, categories(name, slug)')
    .eq('slug', params.slug)
    .single()

  if (!agent) return { title: 'Agent Not Found' }

  // 从类别和特性派生出关键词
  const keywords = [
    agent.name,
    agent.categories?.name || '',
    ...(agent.key_features || []),
    ...(agent.use_cases || []),
    agent.platform,
    agent.pricing
  ].filter(Boolean).join(', ')

  return {
    title: `${agent.name} - AI Agent 详细分析 | Super Alpha Agent`,
    description: agent.short_description,
    keywords,
    authors: [{ name: 'Super Alpha Agent' }],
    publisher: 'Super Alpha Agent',
    openGraph: {
      title: `${agent.name} - AI Agent 详细分析`,
      description: agent.short_description,
      type: 'software',
      url: `${process.env.NEXT_PUBLIC_SITE_URL}/agents/${params.slug}`,
      images: agent.image_url ? [agent.image_url] : undefined,
      site_name: 'Super Alpha Agent',
      softwareVersion: agent.version || '1.0',
      applicationCategory: agent.categories?.name,
    },
    twitter: {
      card: 'summary_large_image',
      title: `${agent.name} - AI Agent 详细分析`,
      description: agent.short_description,
      images: agent.image_url ? [agent.image_url] : undefined,
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
    .select('id, slug, name, short_description, platform')
    .eq('category_id', agent.category_id)
    .neq('id', agent.id)
    .limit(3)

  // 获取 AI 搜索统计数据
  const { data: aiVisits } = await supabaseAdmin
    .from('ai_visits')
    .select('ai_name, COUNT(*) as count')
    .eq('agent_id', agent.id)
    .groupBy('ai_name')
    .order('count', { ascending: false })

  // 计算总计和百分比
  const totalAISearches = aiVisits?.reduce((sum, visit) => sum + visit.count, 0) || 0
  const aiSearchStats = aiVisits?.map(visit => ({
    engine: visit.ai_name,
    count: visit.count,
    percentage: totalAISearches > 0 ? (visit.count / totalAISearches) * 100 : 0,
    trend: 'stable', // 这里可以根据实际数据计算趋势
    trendValue: 0 // 这里可以根据实际数据计算趋势值
  })) || []

  return (
    <div className="container mx-auto px-4 py-12">
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
              priceCurrency: 'CNY',
            },
            author: {
              '@type': 'Organization',
              name: 'Super Alpha Agent'
            },
            publisher: {
              '@type': 'Organization',
              name: 'Super Alpha Agent',
              url: process.env.NEXT_PUBLIC_SITE_URL
            },
            softwareVersion: agent.version || '1.0',
            operatingSystem: agent.platform,
            url: `${process.env.NEXT_PUBLIC_SITE_URL}/agents/${params.slug}`,
            image: agent.image_url,
            keywords: agent.keywords,
            datePublished: agent.created_at,
            dateModified: agent.updated_at,
          }),
        }}
      />

      {/* 面包屑 */}
      <nav aria-label="面包屑导航" className="text-sm text-gray-600 mb-6">
        <ol className="flex items-center space-x-2">
          <li>
            <a href="/" className="hover:text-blue-600" aria-label="首页">首页</a>
          </li>
          <li className="text-gray-400">/</li>
          <li>
            <a href="/agents" className="hover:text-blue-600" aria-label="Agents列表">Agents</a>
          </li>
          <li className="text-gray-400">/</li>
          <li className="font-medium" aria-current="page">{agent.name}</li>
        </ol>
      </nav>

      {/* 🆕 AI 访问追踪 */}
      <AIVisitTracker agentSlug={params.slug} />

      {/* 标题区域 */}
      <header className="mb-8">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h1 className="text-4xl font-bold mb-3">{agent.name}</h1>
            <p className="text-xl text-gray-600 mb-4" aria-label="简短描述">
              {agent.short_description}
            </p>
            
            {/* 🆕 AI 搜索量展示 */}
            {agent.ai_search_count > 0 && (
              <div className="flex items-center gap-4 mt-4">
                <div className="flex items-center gap-2 bg-gradient-to-r from-purple-50 to-blue-50 px-4 py-2 rounded-lg border border-purple-200">
                  <span className="text-2xl">🤖</span>
                  <div>
                    <div className="text-sm text-gray-600">AI 搜索量</div>
                    <div className="text-2xl font-bold text-purple-600">
                      {agent.ai_search_count}
                    </div>
                  </div>
                </div>
                <div className="text-sm text-gray-500">
                  <div>被 AI 搜索引擎发现</div>
                  <div className="text-xs">(ChatGPT, Claude, Perplexity 等)</div>
                </div>
              </div>
            )}
          </div>
          <div className="text-right">
            <span className="inline-block bg-blue-100 text-blue-800 px-3 py-1 rounded mb-2">
              {agent.platform}
            </span>
            <div className="text-sm text-gray-600">
              {agent.pricing}
            </div>
          </div>
        </div>
      </header>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* 主要内容 */}
        <div className="lg:col-span-2 space-y-8">
          {/* AI 搜索统计细分 */}
          <AISearchStats stats={aiSearchStats} total={totalAISearches} />
          {/* 快速概览 */}
          <section className="border rounded-lg p-6" aria-labelledby="quick-overview-heading">
            <h2 id="quick-overview-heading" className="text-2xl font-bold mb-4">快速概览</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-gray-600 text-sm">分类:</span>
                <span className="font-semibold ml-1">{agent.categories?.name}</span>
              </div>
              <div>
                <span className="text-gray-600 text-sm">平台:</span>
                <span className="font-semibold ml-1">{agent.platform}</span>
              </div>
              <div>
                <span className="text-gray-600 text-sm">定价:</span>
                <span className="font-semibold ml-1">{agent.pricing}</span>
              </div>
              <div>
                <span className="text-gray-600 text-sm">浏览量:</span>
                <span className="font-semibold ml-1">{agent.view_count}</span>
              </div>
              <div>
                <span className="text-gray-600 text-sm">🤖 AI 搜索:</span>
                <span className="font-semibold ml-1 text-purple-600">{agent.ai_search_count}</span>
              </div>
            </div>
          </section>

          {/* 详细介绍 */}
          <section aria-labelledby="detailed-intro-heading">
            <h2 id="detailed-intro-heading" className="text-2xl font-bold mb-4">详细介绍</h2>
            <p className="text-gray-700 leading-relaxed">
              {agent.detailed_description}
            </p>
          </section>

          {/* 核心功能 */}
          <section aria-labelledby="key-features-heading">
            <h2 id="key-features-heading" className="text-2xl font-bold mb-4">核心功能</h2>
            <ul className="space-y-2">
              {agent.key_features?.map((feature: string, i: number) => (
                <li key={i} className="flex items-start">
                  <span className="text-blue-600 mr-2">✓</span>
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
          </section>

          {/* 适用场景 */}
          <section aria-labelledby="use-cases-heading">
            <h2 id="use-cases-heading" className="text-2xl font-bold mb-4">适用场景</h2>
            <ul className="space-y-2">
              {agent.use_cases?.map((useCase: string, i: number) => (
                <li key={i} className="flex items-start">
                  <span className="text-green-600 mr-2">→</span>
                  <span>{useCase}</span>
                </li>
              ))}
            </ul>
          </section>

          {/* 优缺点对比 */}
          <section aria-labelledby="pros-cons-heading">
            <h2 id="pros-cons-heading" className="text-2xl font-bold mb-4">优缺点分析</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="border rounded-lg p-4 bg-green-50">
                <h3 className="font-semibold text-green-800 mb-3">优点</h3>
                <ul className="space-y-2">
                  {agent.pros?.map((pro: string, i: number) => (
                    <li key={i} className="text-sm">+ {pro}</li>
                  ))}
                </ul>
              </div>
              <div className="border rounded-lg p-4 bg-red-50">
                <h3 className="font-semibold text-red-800 mb-3">缺点</h3>
                <ul className="space-y-2">
                  {agent.cons?.map((con: string, i: number) => (
                    <li key={i} className="text-sm">- {con}</li>
                  ))}
                </ul>
              </div>
            </div>
          </section>

          {/* 使用方法 */}
          {agent.how_to_use && (
            <section>
              <h2 className="text-2xl font-bold mb-4">使用方法</h2>
              <div className="prose max-w-none">
                <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                  {agent.how_to_use}
                </p>
              </div>
            </section>
          )}
        </div>

        {/* 侧边栏 */}
        <div className="space-y-6">
          {/* 操作按钮 */}
          <div className="border rounded-lg p-6 space-y-3">
            {agent.official_url && (
              <a
                href={agent.official_url}
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full bg-blue-600 text-white text-center py-3 rounded-lg hover:bg-blue-700"
              >
                访问官网
              </a>
            )}
            <button className="block w-full border border-gray-300 py-3 rounded-lg hover:bg-gray-50">
              收藏
            </button>
          </div>

          {/* 相似 Agents */}
          {similarAgents && similarAgents.length > 0 && (
            <div className="border rounded-lg p-6">
              <h3 className="font-bold mb-4">相似 Agents</h3>
              <div className="space-y-3">
                {similarAgents.map((similar) => (
                  <a
                    key={similar.id}
                    href={`/agents/${similar.slug}`}
                    className="block p-3 border rounded hover:bg-gray-50"
                  >
                    <div className="font-semibold text-sm">{similar.name}</div>
                    <div className="text-xs text-gray-600 mt-1 line-clamp-2">
                      {similar.short_description}
                    </div>
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* FAQ（AI 友好） */}
      <section className="mt-12 prose max-w-none">
        <h2>常见问题</h2>
        
        <h3>{agent.name} 是什么？</h3>
        <p>{agent.short_description}</p>
        
        <h3>{agent.name} 有什么功能？</h3>
        <p>{agent.key_features?.join('、')}</p>
        
        <h3>{agent.name} 适合谁使用？</h3>
        <p>{agent.use_cases?.join('、')}</p>
        
        <h3>{agent.name} 的优点是什么？</h3>
        <p>{agent.pros?.join('、')}</p>
        
        <h3>{agent.name} 有什么缺点？</h3>
        <p>{agent.cons?.join('、')}</p>
      </section>
    </div>
  )
}
