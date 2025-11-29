import { supabaseAdmin } from '@/lib/supabase'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { AIVisitTracker } from '@/components/ai-visit-tracker'
import AISearchStats from '@/components/ai-search-stats'

export const revalidate = 3600

type Props = {
  params: { slug: string }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { data: agent } = await supabaseAdmin
    .from('agents')
    .select('*, categories(name, slug, icon)')
    .eq('slug', params.slug)
    .single()

  if (!agent) return { title: 'Agent Not Found' }

  // 生成关键词
  const keywords = [
    agent.name,
    'AI Agent',
    '人工智能助手',
    agent.categories?.name,
    ...(agent.keywords || []),
    ...(agent.key_features || []).slice(0, 3), // 取前3个特性作为关键词
    'AI工具推荐',
    'AI应用分析',
    'Super Alpha Agent'
  ].filter(Boolean)

  // 生成详细描述
  const description = agent.detailed_description 
    ? `${agent.short_description}。主要功能包括：${(agent.key_features || []).slice(0, 2).join('、')}。`
    : agent.short_description

  return {
    title: `${agent.name} - AI Agent 详细分析 | Super Alpha Agent`,
    description: description,
    keywords: keywords,
    authors: [{ name: 'Super Alpha Agent', url: 'https://superalphaagent.com' }],
    creator: 'Super Alpha Agent',
    publisher: 'Super Alpha Agent',
    formatDetection: {
      email: false,
      address: false,
      telephone: false,
    },
    metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://superalphaagent.com'),
    alternates: {
      canonical: `/agents/${params.slug}`,
    },
    openGraph: {
      title: `${agent.name} - AI Agent 详细分析`,
      description: agent.short_description,
      type: 'article',
      siteName: 'Super Alpha Agent',
      locale: 'zh_CN',
      url: `/agents/${params.slug}`,
      images: [
        {
          url: '/og-image.png',
          width: 1200,
          height: 630,
          alt: `${agent.name} - AI Agent`,
        }
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${agent.name} - AI Agent 详细分析`,
      description: agent.short_description,
      images: ['/og-image.png'],
      creator: '@superalphaagent',
      site: '@superalphaagent',
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
    other: {
      'geo.region': 'CN',
      'geo.placename': 'China',
      'geo.position': '35.8617;104.1954',
      'ICBM': '35.8617, 104.1954',
      // AI 搜索引擎优化
      'ai:agent': agent.name,
      'ai:category': agent.categories?.name || '',
      'ai:platform': agent.platform || '',
      'ai:pricing': agent.pricing || '',
      'ai:features': (agent.key_features || []).join(', '),
      'ai:use-cases': (agent.use_cases || []).join(', '),
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

  // 获取AI搜索统计
  const { data: aiVisits } = await supabaseAdmin
    .from('ai_visits')
    .select('ai_name, count')
    .eq('agent_id', agent.id)
    .order('count', { ascending: false })

  // 生成结构化数据
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: agent.name,
    description: agent.detailed_description || agent.short_description,
    url: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://superalphaagent.com'}/agents/${params.slug}`,
    applicationCategory: agent.categories?.name || 'AI Application',
    operatingSystem: 'Web, Mobile',
    offers: {
      '@type': 'Offer',
      price: agent.pricing === '免费' ? '0' : agent.pricing || 'varies',
      priceCurrency: agent.pricing === '免费' ? 'CNY' : 'USD',
      availability: 'https://schema.org/InStock',
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.5',
      reviewCount: Math.max(agent.view_count, 1),
      bestRating: '5',
      worstRating: '1',
    },
    author: {
      '@type': 'Organization',
      name: 'Super Alpha Agent',
      url: 'https://superalphaagent.com',
    },
    datePublished: agent.created_at,
    dateModified: agent.updated_at,
    keywords: (agent.keywords || []).join(', '),
    featureList: (agent.key_features || []).join(', '),
    screenshot: agent.screenshot_url || '',
    softwareHelp: {
      '@type': 'CreativeWork',
      text: agent.how_to_use || '请访问官方网站了解使用方法',
    },
    softwareRequirements: 'Web浏览器或移动应用',
    // AI 搜索优化数据
    'ai:searchCount': agent.ai_search_count,
    'ai:category': agent.categories?.name,
    'ai:platform': agent.platform,
    'ai:pricing': agent.pricing,
    'ai:features': agent.key_features,
    'ai:useCases': agent.use_cases,
    'ai:pros': agent.pros,
    'ai:cons': agent.cons,
  }

  return (
    <main className="container mx-auto px-4 py-12" role="main">
      {/* 结构化数据（AI 友好） */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(structuredData, null, 2),
        }}
      />

      {/* 面包屑导航 */}
      <nav className="text-sm text-gray-600 mb-6" aria-label="面包屑导航">
        <ol className="flex items-center space-x-2">
          <li>
            <a href="/" className="hover:text-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded">
              首页
            </a>
          </li>
          <li aria-hidden="true">/</li>
          <li>
            <a href="/agents" className="hover:text-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded">
              Agents
            </a>
          </li>
          <li aria-hidden="true">/</li>
          <li aria-current="page" className="text-gray-900 font-medium">
            {agent.name}
          </li>
        </ol>
      </nav>

      {/* AI 访问追踪 */}
      <AIVisitTracker agentSlug={params.slug} />

      {/* 标题区域 */}
      <header className="mb-8" role="banner">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h1 className="text-4xl font-bold mb-3" itemProp="name">{agent.name}</h1>
            <p className="text-xl text-gray-600 mb-4" itemProp="description">
              {agent.short_description}
            </p>
            
            {/* AI 搜索统计组件 */}
            {agent.ai_search_count > 0 && (
              <div className="flex items-center gap-4 mt-4" role="region" aria-label="AI搜索统计">
                <div className="flex items-center gap-2 bg-gradient-to-r from-purple-50 to-blue-50 px-4 py-2 rounded-lg border border-purple-200">
                  <span className="text-2xl" aria-hidden="true">🤖</span>
                  <div>
                    <div className="text-sm text-gray-600">AI 搜索量</div>
                    <div className="text-2xl font-bold text-purple-600" itemProp="interactionCount">
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
            <span 
              className="inline-block bg-blue-100 text-blue-800 px-3 py-1 rounded mb-2" 
              itemProp="applicationCategory"
            >
              {agent.platform}
            </span>
            <div className="text-sm text-gray-600" itemProp="offers" itemScope itemType="https://schema.org/Offer">
              <span itemProp="price">{agent.pricing}</span>
            </div>
          </div>
        </div>
      </header>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* 主要内容 */}
        <article className="lg:col-span-2 space-y-8" itemScope itemType="https://schema.org/SoftwareApplication">
          {/* 快速概览 */}
          <section className="border rounded-lg p-6" aria-labelledby="overview-heading">
            <h2 id="overview-heading" className="text-2xl font-bold mb-4">快速概览</h2>
            <dl className="grid grid-cols-2 gap-4" role="list">
              <div role="listitem">
                <dt className="text-gray-600 text-sm">分类</dt>
                <dd className="font-semibold" itemProp="applicationCategory">{agent.categories?.name}</dd>
              </div>
              <div role="listitem">
                <dt className="text-gray-600 text-sm">平台</dt>
                <dd className="font-semibold">{agent.platform}</dd>
              </div>
              <div role="listitem">
                <dt className="text-gray-600 text-sm">定价</dt>
                <dd className="font-semibold" itemProp="offers" itemScope itemType="https://schema.org/Offer">
                  <span itemProp="price">{agent.pricing}</span>
                </dd>
              </div>
              <div role="listitem">
                <dt className="text-gray-600 text-sm">浏览量</dt>
                <dd className="font-semibold">{agent.view_count}</dd>
              </div>
              <div role="listitem">
                <dt className="text-gray-600 text-sm">🤖 AI 搜索</dt>
                <dd className="font-semibold text-purple-600">{agent.ai_search_count}</dd>
              </div>
            </dl>
          </section>

          {/* 详细介绍 */}
          <section aria-labelledby="description-heading">
            <h2 id="description-heading" className="text-2xl font-bold mb-4">详细介绍</h2>
            <div 
              className="text-gray-700 leading-relaxed" 
              itemProp="description"
              dangerouslySetInnerHTML={{ __html: agent.detailed_description }}
            />
          </section>

          {/* 核心功能 */}
          <section aria-labelledby="features-heading">
            <h2 id="features-heading" className="text-2xl font-bold mb-4">核心功能</h2>
            <ul className="space-y-2" role="list" itemScope itemType="https://schema.org/ItemList">
              {agent.key_features?.map((feature: string, i: number) => (
                <li key={i} className="flex items-start" role="listitem" itemProp="itemListElement">
                  <span className="text-blue-600 mr-2" aria-hidden="true">✓</span>
                  <span itemProp="name">{feature}</span>
                </li>
              ))}
            </ul>
          </section>

          {/* 适用场景 */}
          <section aria-labelledby="use-cases-heading">
            <h2 id="use-cases-heading" className="text-2xl font-bold mb-4">适用场景</h2>
            <ul className="space-y-2" role="list">
              {agent.use_cases?.map((useCase: string, i: number) => (
                <li key={i} className="flex items-start" role="listitem">
                  <span className="text-green-600 mr-2" aria-hidden="true">→</span>
                  <span>{useCase}</span>
                </li>
              ))}
            </ul>
          </section>

          {/* 优缺点对比 */}
          <section aria-labelledby="pros-cons-heading">
            <h2 id="pros-cons-heading" className="text-2xl font-bold mb-4">优缺点分析</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="border rounded-lg p-4 bg-green-50" role="region" aria-labelledby="pros-heading">
                <h3 id="pros-heading" className="font-semibold text-green-800 mb-3">优点</h3>
                <ul className="space-y-2" role="list">
                  {agent.pros?.map((pro: string, i: number) => (
                    <li key={i} className="text-sm" role="listitem">+ {pro}</li>
                  ))}
                </ul>
              </div>
              <div className="border rounded-lg p-4 bg-red-50" role="region" aria-labelledby="cons-heading">
                <h3 id="cons-heading" className="font-semibold text-red-800 mb-3">缺点</h3>
                <ul className="space-y-2" role="list">
                  {agent.cons?.map((con: string, i: number) => (
                    <li key={i} className="text-sm" role="listitem">- {con}</li>
                  ))}
                </ul>
              </div>
            </div>
          </section>

          {/* 使用方法 */}
          {agent.how_to_use && (
            <section aria-labelledby="usage-heading">
              <h2 id="usage-heading" className="text-2xl font-bold mb-4">使用方法</h2>
              <div className="prose max-w-none">
                <div 
                  className="text-gray-700 leading-relaxed whitespace-pre-line" 
                  itemProp="softwareHelp"
                  dangerouslySetInnerHTML={{ __html: agent.how_to_use }}
                />
              </div>
            </section>
          )}
        </article>

        {/* 侧边栏 */}
        <aside className="space-y-6" role="complementary">
          {/* 操作按钮 */}
          <div className="border rounded-lg p-6 space-y-3">
            {agent.official_url && (
              <a
                href={agent.official_url}
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full bg-blue-600 text-white text-center py-3 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                aria-label={`访问 ${agent.name} 官网`}
              >
                访问官网
              </a>
            )}
            <button 
              className="block w-full border border-gray-300 py-3 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
              aria-label={`收藏 ${agent.name}`}
            >
              收藏
            </button>
          </div>

          {/* AI 搜索统计组件 */}
          {agent.ai_search_count > 0 && (
            <AISearchStats 
              agentSlug={params.slug} 
              totalCount={agent.ai_search_count}
            />
          )}

          {/* 相似 Agents */}
          {similarAgents && similarAgents.length > 0 && (
            <div className="border rounded-lg p-6">
              <h3 className="font-bold mb-4">相似 Agents</h3>
              <nav className="space-y-3" role="navigation" aria-label="相似AI工具推荐">
                {similarAgents.map((similar) => (
                  <a
                    key={similar.id}
                    href={`/agents/${similar.slug}`}
                    className="block p-3 border rounded hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded"
                    aria-label={`查看 ${similar.name} 详情`}
                  >
                    <div className="font-semibold text-sm">{similar.name}</div>
                    <div className="text-xs text-gray-600 mt-1 line-clamp-2">
                      {similar.short_description}
                    </div>
                  </a>
                ))}
              </nav>
            </div>
          )}
        </aside>
      </div>

      {/* FAQ（AI 友好） */}
      <section className="mt-12 prose max-w-none" aria-labelledby="faq-heading">
        <h2 id="faq-heading">常见问题</h2>
        
        <div itemScope itemType="https://schema.org/FAQPage">
          <div itemScope itemProp="mainEntity" itemType="https://schema.org/Question">
            <h3 itemProp="name">{agent.name} 是什么？</h3>
            <div itemScope itemProp="acceptedAnswer" itemType="https://schema.org/Answer">
              <div itemProp="text">{agent.short_description}</div>
            </div>
          </div>
          
          <div itemScope itemProp="mainEntity" itemType="https://schema.org/Question">
            <h3 itemProp="name">{agent.name} 有什么功能？</h3>
            <div itemScope itemProp="acceptedAnswer" itemType="https://schema.org/Answer">
              <div itemProp="text">{agent.key_features?.join('、')}</div>
            </div>
          </div>
          
          <div itemScope itemProp="mainEntity" itemType="https://schema.org/Question">
            <h3 itemProp="name">{agent.name} 适合谁使用？</h3>
            <div itemScope itemProp="acceptedAnswer" itemType="https://schema.org/Answer">
              <div itemProp="text">{agent.use_cases?.join('、')}</div>
            </div>
          </div>
          
          <div itemScope itemProp="mainEntity" itemType="https://schema.org/Question">
            <h3 itemProp="name">{agent.name} 的优点是什么？</h3>
            <div itemScope itemProp="acceptedAnswer" itemType="https://schema.org/Answer">
              <div itemProp="text">{agent.pros?.join('、')}</div>
            </div>
          </div>
          
          <div itemScope itemProp="mainEntity" itemType="https://schema.org/Question">
            <h3 itemProp="name">{agent.name} 有什么缺点？</h3>
            <div itemScope itemProp="acceptedAnswer" itemType="https://schema.org/Answer">
              <div itemProp="text">{agent.cons?.join('、')}</div>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
