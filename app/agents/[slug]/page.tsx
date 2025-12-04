import { supabaseAdmin } from '@/lib/supabase'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import dynamic from 'next/dynamic'
import { AIRecommendationSnippets } from '@/components/ai-recommendation-snippets'

// 动态导入客户端组件以实现代码分割 - 需求: 9.1
const AIVisitTracker = dynamic(() => import('@/components/ai-visit-tracker').then(mod => ({ default: mod.AIVisitTracker })), {
  ssr: false, // 客户端追踪组件，不需要 SSR
})

const AISearchStats = dynamic(() => import('@/components/ai-search-stats').then(mod => ({ default: mod.AISearchStats })), {
  loading: () => (
    <div className="border rounded-lg p-6 animate-pulse">
      <div className="h-6 bg-gray-200 rounded w-1/2 mb-4"></div>
      <div className="space-y-3">
        <div className="h-4 bg-gray-200 rounded"></div>
        <div className="h-4 bg-gray-200 rounded w-5/6"></div>
        <div className="h-4 bg-gray-200 rounded w-4/6"></div>
      </div>
    </div>
  ),
  ssr: false, // 统计图表不需要 SSR
})

export const revalidate = 3600

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://superalphaagent.com'

type Props = {
  params: { slug: string }
}

/**
 * 从Agent类别和特性派生关键词
 * 验证: 需求 7.3
 */
function deriveKeywords(agent: {
  name: string
  categories?: { name: string } | null
  key_features?: string[] | null
  platform?: string | null
}): string[] {
  const keywords: string[] = [agent.name, 'AI Agent', 'AI工具']
  
  if (agent.categories?.name) {
    keywords.push(agent.categories.name)
  }
  
  if (agent.platform) {
    keywords.push(agent.platform)
  }
  
  // 从key_features提取关键词（取前5个）
  if (agent.key_features && agent.key_features.length > 0) {
    const featureKeywords = agent.key_features
      .slice(0, 5)
      .map(f => f.split(/[，,、]/)[0].trim()) // 取每个特性的第一部分
      .filter(k => k.length > 0 && k.length < 20)
    keywords.push(...featureKeywords)
  }
  
  return [...new Set(keywords)] // 去重
}

/**
 * 生成SEO优化的元数据
 * 验证: 需求 4.4, 7.3
 */
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { data: agent } = await supabaseAdmin
    .from('agents')
    .select('*, categories(name, slug)')
    .eq('slug', params.slug)
    .single()

  if (!agent) {
    return { 
      title: 'Agent Not Found | Super Alpha Agent',
      description: '抱歉，您访问的Agent不存在或已被删除'
    }
  }

  const keywords = deriveKeywords(agent)
  const pageUrl = `${SITE_URL}/agents/${agent.slug}`
  const siteName = 'Super Alpha Agent'
  
  // 构建完整的描述，包含关键信息
  const fullDescription = agent.short_description 
    ? `${agent.short_description} | 平台: ${agent.platform || '多平台'} | 定价: ${agent.pricing || '免费'}`
    : `${agent.name} - 专业AI Agent工具，提供智能化解决方案`

  return {
    title: `${agent.name} - AI Agent 详细介绍 | ${siteName}`,
    description: fullDescription,
    keywords: keywords.join(', '),
    authors: [{ name: siteName }],
    creator: siteName,
    publisher: siteName,
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
    alternates: {
      canonical: pageUrl,
    },
    openGraph: {
      title: `${agent.name} - AI Agent 详细介绍`,
      description: agent.short_description || `了解${agent.name}的功能、特点和使用场景`,
      type: 'article',
      url: pageUrl,
      siteName: siteName,
      locale: 'zh_CN',
      images: agent.logo_url ? [
        {
          url: agent.logo_url,
          width: 200,
          height: 200,
          alt: `${agent.name} Logo`,
        }
      ] : [],
      publishedTime: agent.created_at,
      modifiedTime: agent.updated_at,
      section: agent.categories?.name || 'AI工具',
      tags: keywords,
    },
    twitter: {
      card: 'summary',
      title: `${agent.name} - AI Agent`,
      description: agent.short_description || `了解${agent.name}的功能和特点`,
      images: agent.logo_url ? [agent.logo_url] : [],
    },
    category: agent.categories?.name || 'AI工具',
  }
}

/**
 * 生成Schema.org SoftwareApplication结构化数据
 * 验证: 需求 4.3, 7.1
 */
function generateJsonLd(agent: {
  name: string
  slug: string
  short_description?: string | null
  detailed_description?: string | null
  categories?: { name: string; slug: string } | null
  platform?: string | null
  pricing?: string | null
  official_url?: string | null
  logo_url?: string | null
  key_features?: string[] | null
  pros?: string[] | null
  cons?: string[] | null
  ai_search_count?: number
  view_count?: number
  created_at?: string
  updated_at?: string
}) {
  const pageUrl = `${SITE_URL}/agents/${agent.slug}`
  
  // 解析定价信息
  const isPriceFree = agent.pricing?.toLowerCase().includes('免费') || 
                      agent.pricing?.toLowerCase().includes('free')
  const priceValue = isPriceFree ? '0' : undefined
  
  // 构建SoftwareApplication结构化数据
  const softwareAppSchema = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    '@id': pageUrl,
    name: agent.name,
    description: agent.detailed_description || agent.short_description,
    url: pageUrl,
    applicationCategory: agent.categories?.name || 'AI工具',
    operatingSystem: agent.platform || 'Web',
    ...(agent.logo_url && { image: agent.logo_url }),
    ...(agent.official_url && { 
      sameAs: agent.official_url,
      installUrl: agent.official_url 
    }),
    offers: {
      '@type': 'Offer',
      price: priceValue || '0',
      priceCurrency: 'USD',
      ...(agent.pricing && { description: agent.pricing }),
      availability: 'https://schema.org/InStock',
    },
    ...(agent.key_features && agent.key_features.length > 0 && {
      featureList: agent.key_features.join(', '),
    }),
    aggregateRating: agent.ai_search_count && agent.ai_search_count > 0 ? {
      '@type': 'AggregateRating',
      ratingValue: Math.min(5, 3 + (agent.ai_search_count / 100)), // 基于AI搜索量的评分
      bestRating: 5,
      worstRating: 1,
      ratingCount: agent.ai_search_count,
      reviewCount: agent.view_count || 1,
    } : undefined,
    ...(agent.created_at && { datePublished: agent.created_at }),
    ...(agent.updated_at && { dateModified: agent.updated_at }),
    publisher: {
      '@type': 'Organization',
      name: 'Super Alpha Agent',
      url: SITE_URL,
    },
  }

  // 构建面包屑结构化数据
  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: '首页',
        item: SITE_URL,
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Agents',
        item: `${SITE_URL}/agents`,
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: agent.name,
        item: pageUrl,
      },
    ],
  }

  // 构建FAQ结构化数据
  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: `${agent.name} 是什么？`,
        acceptedAnswer: {
          '@type': 'Answer',
          text: agent.short_description || `${agent.name}是一款AI Agent工具`,
        },
      },
      ...(agent.key_features && agent.key_features.length > 0 ? [{
        '@type': 'Question',
        name: `${agent.name} 有什么功能？`,
        acceptedAnswer: {
          '@type': 'Answer',
          text: agent.key_features.join('、'),
        },
      }] : []),
      ...(agent.pros && agent.pros.length > 0 ? [{
        '@type': 'Question',
        name: `${agent.name} 的优点是什么？`,
        acceptedAnswer: {
          '@type': 'Answer',
          text: agent.pros.join('、'),
        },
      }] : []),
      ...(agent.cons && agent.cons.length > 0 ? [{
        '@type': 'Question',
        name: `${agent.name} 有什么缺点？`,
        acceptedAnswer: {
          '@type': 'Answer',
          text: agent.cons.join('、'),
        },
      }] : []),
    ],
  }

  return [softwareAppSchema, breadcrumbSchema, faqSchema]
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

  // 生成结构化数据
  const jsonLdSchemas = generateJsonLd(agent)

  return (
    <article 
      className="container mx-auto px-4 py-12"
      itemScope 
      itemType="https://schema.org/SoftwareApplication"
      aria-labelledby="agent-title"
    >
      {/* 结构化数据（AI 友好）- Schema.org SoftwareApplication + BreadcrumbList + FAQPage */}
      {jsonLdSchemas.map((schema, index) => (
        <script
          key={index}
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(schema),
          }}
        />
      ))}

      {/* 面包屑导航 - 语义化nav元素 */}
      <nav 
        className="text-sm text-gray-600 mb-6" 
        aria-label="面包屑导航"
        role="navigation"
      >
        <ol className="flex items-center space-x-2" role="list">
          <li>
            <a 
              href="/" 
              className="hover:text-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded"
              aria-label="返回首页"
            >
              首页
            </a>
          </li>
          <li aria-hidden="true">/</li>
          <li>
            <a 
              href="/agents" 
              className="hover:text-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded"
              aria-label="返回Agent列表"
            >
              Agents
            </a>
          </li>
          <li aria-hidden="true">/</li>
          <li aria-current="page">
            <span itemProp="name">{agent.name}</span>
          </li>
        </ol>
      </nav>

      {/* AI 访问追踪 */}
      <AIVisitTracker agentSlug={params.slug} />

      {/* 标题区域 - 语义化header元素 */}
      <header className="mb-8" role="banner">
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div className="flex-1 min-w-0">
            <h1 
              id="agent-title"
              className="text-4xl font-bold mb-3"
              itemProp="name"
            >
              {agent.name}
            </h1>
            <p 
              className="text-xl text-gray-600 mb-4"
              itemProp="description"
            >
              {agent.short_description}
            </p>
            
            {/* AI 搜索量展示 */}
            {agent.ai_search_count > 0 && (
              <div 
                className="flex items-center gap-4 mt-4"
                role="status"
                aria-label={`AI搜索量: ${agent.ai_search_count}次`}
              >
                <div className="flex items-center gap-2 bg-gradient-to-r from-purple-50 to-blue-50 px-4 py-2 rounded-lg border border-purple-200">
                  <span className="text-2xl" aria-hidden="true">🤖</span>
                  <div>
                    <div className="text-sm text-gray-600" id="ai-search-label">AI 搜索量</div>
                    <div 
                      className="text-2xl font-bold text-purple-600"
                      aria-labelledby="ai-search-label"
                    >
                      {agent.ai_search_count.toLocaleString()}
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
              itemProp="operatingSystem"
            >
              {agent.platform}
            </span>
            <div 
              className="text-sm text-gray-600"
              itemProp="offers"
              itemScope
              itemType="https://schema.org/Offer"
            >
              <span itemProp="price">{agent.pricing}</span>
            </div>
          </div>
        </div>
      </header>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* 主要内容 - 语义化main元素 */}
        <main className="lg:col-span-2 space-y-8" role="main">
          {/* 快速概览 */}
          <section 
            className="border rounded-lg p-6"
            aria-labelledby="overview-heading"
          >
            <h2 id="overview-heading" className="text-2xl font-bold mb-4">快速概览</h2>
            <dl className="grid grid-cols-2 gap-4" role="list">
              <div className="flex flex-col">
                <dt className="text-gray-600 text-sm">分类</dt>
                <dd className="font-semibold" itemProp="applicationCategory">
                  {agent.categories?.name}
                </dd>
              </div>
              <div className="flex flex-col">
                <dt className="text-gray-600 text-sm">平台</dt>
                <dd className="font-semibold">{agent.platform}</dd>
              </div>
              <div className="flex flex-col">
                <dt className="text-gray-600 text-sm">定价</dt>
                <dd className="font-semibold">{agent.pricing}</dd>
              </div>
              <div className="flex flex-col">
                <dt className="text-gray-600 text-sm">浏览量</dt>
                <dd className="font-semibold">{agent.view_count?.toLocaleString()}</dd>
              </div>
              <div className="flex flex-col">
                <dt className="text-gray-600 text-sm">
                  <span aria-hidden="true">🤖</span> AI 搜索
                </dt>
                <dd className="font-semibold text-purple-600">
                  {agent.ai_search_count?.toLocaleString()}
                </dd>
              </div>
            </dl>
          </section>

          {/* 详细介绍 */}
          <section aria-labelledby="description-heading">
            <h2 id="description-heading" className="text-2xl font-bold mb-4">详细介绍</h2>
            <p 
              className="text-gray-700 leading-relaxed"
              itemProp="description"
            >
              {agent.detailed_description}
            </p>
          </section>

          {/* 核心功能 */}
          <section aria-labelledby="features-heading">
            <h2 id="features-heading" className="text-2xl font-bold mb-4">核心功能</h2>
            <ul 
              className="space-y-2" 
              role="list"
              aria-label="核心功能列表"
              itemProp="featureList"
            >
              {agent.key_features?.map((feature: string, i: number) => (
                <li key={i} className="flex items-start">
                  <span className="text-blue-600 mr-2" aria-hidden="true">✓</span>
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
          </section>

          {/* 适用场景 */}
          <section aria-labelledby="usecases-heading">
            <h2 id="usecases-heading" className="text-2xl font-bold mb-4">适用场景</h2>
            <ul 
              className="space-y-2" 
              role="list"
              aria-label="适用场景列表"
            >
              {agent.use_cases?.map((useCase: string, i: number) => (
                <li key={i} className="flex items-start">
                  <span className="text-green-600 mr-2" aria-hidden="true">→</span>
                  <span>{useCase}</span>
                </li>
              ))}
            </ul>
          </section>

          {/* 优缺点对比 */}
          <section aria-labelledby="proscons-heading">
            <h2 id="proscons-heading" className="text-2xl font-bold mb-4">优缺点分析</h2>
            <div className="grid md:grid-cols-2 gap-6" role="group" aria-label="优缺点对比">
              <div className="border rounded-lg p-4 bg-green-50">
                <h3 id="pros-heading" className="font-semibold text-green-800 mb-3">优点</h3>
                <ul 
                  className="space-y-2" 
                  role="list"
                  aria-labelledby="pros-heading"
                >
                  {agent.pros?.map((pro: string, i: number) => (
                    <li key={i} className="text-sm">
                      <span aria-hidden="true">+</span> {pro}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="border rounded-lg p-4 bg-red-50">
                <h3 id="cons-heading" className="font-semibold text-red-800 mb-3">缺点</h3>
                <ul 
                  className="space-y-2" 
                  role="list"
                  aria-labelledby="cons-heading"
                >
                  {agent.cons?.map((con: string, i: number) => (
                    <li key={i} className="text-sm">
                      <span aria-hidden="true">-</span> {con}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </section>

          {/* 使用方法 */}
          {agent.how_to_use && (
            <section aria-labelledby="howto-heading">
              <h2 id="howto-heading" className="text-2xl font-bold mb-4">使用方法</h2>
              <div className="prose max-w-none">
                <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                  {agent.how_to_use}
                </p>
              </div>
            </section>
          )}

          {/* AI 推荐词模块 - GEO 核心 */}
          <AIRecommendationSnippets agent={agent} />
        </main>

        {/* 侧边栏 - 语义化aside元素 */}
        <aside className="space-y-6" role="complementary" aria-label="操作和相关内容">
          {/* 操作按钮 */}
          <div className="border rounded-lg p-6 space-y-3">
            {agent.official_url && (
              <a
                href={agent.official_url}
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full bg-blue-600 text-white text-center py-3 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors min-h-[44px]"
                aria-label={`访问${agent.name}官网（在新窗口打开）`}
                itemProp="url"
              >
                访问官网
              </a>
            )}
            <button 
              className="block w-full border border-gray-300 py-3 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors min-h-[44px]"
              aria-label={`收藏${agent.name}`}
              type="button"
            >
              收藏
            </button>
          </div>

          {/* AI搜索统计细分 - 验证: 需求 4.5, 8.2 */}
          <AISearchStats 
            agentId={agent.id} 
            totalCount={agent.ai_search_count || 0}
            showChart={true}
          />

          {/* 相似 Agents */}
          {similarAgents && similarAgents.length > 0 && (
            <nav 
              className="border rounded-lg p-6"
              aria-labelledby="similar-agents-heading"
            >
              <h3 id="similar-agents-heading" className="font-bold mb-4">相似 Agents</h3>
              <ul className="space-y-3" role="list">
                {similarAgents.map((similar) => (
                  <li key={similar.id}>
                    <a
                      href={`/agents/${similar.slug}`}
                      className="block p-3 border rounded hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
                      aria-label={`查看${similar.name}详情`}
                    >
                      <div className="font-semibold text-sm">{similar.name}</div>
                      <div className="text-xs text-gray-600 mt-1 line-clamp-2">
                        {similar.short_description}
                      </div>
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          )}
        </aside>
      </div>

      {/* FAQ（AI 友好）- 语义化section */}
      <section 
        className="mt-12 prose max-w-none"
        aria-labelledby="faq-heading"
        itemScope
        itemType="https://schema.org/FAQPage"
      >
        <h2 id="faq-heading">常见问题</h2>
        
        <div itemScope itemProp="mainEntity" itemType="https://schema.org/Question">
          <h3 itemProp="name">{agent.name} 是什么？</h3>
          <div itemScope itemProp="acceptedAnswer" itemType="https://schema.org/Answer">
            <p itemProp="text">{agent.short_description}</p>
          </div>
        </div>
        
        <div itemScope itemProp="mainEntity" itemType="https://schema.org/Question">
          <h3 itemProp="name">{agent.name} 有什么功能？</h3>
          <div itemScope itemProp="acceptedAnswer" itemType="https://schema.org/Answer">
            <p itemProp="text">{agent.key_features?.join('、')}</p>
          </div>
        </div>
        
        <div itemScope itemProp="mainEntity" itemType="https://schema.org/Question">
          <h3 itemProp="name">{agent.name} 适合谁使用？</h3>
          <div itemScope itemProp="acceptedAnswer" itemType="https://schema.org/Answer">
            <p itemProp="text">{agent.use_cases?.join('、')}</p>
          </div>
        </div>
        
        <div itemScope itemProp="mainEntity" itemType="https://schema.org/Question">
          <h3 itemProp="name">{agent.name} 的优点是什么？</h3>
          <div itemScope itemProp="acceptedAnswer" itemType="https://schema.org/Answer">
            <p itemProp="text">{agent.pros?.join('、')}</p>
          </div>
        </div>
        
        <div itemScope itemProp="mainEntity" itemType="https://schema.org/Question">
          <h3 itemProp="name">{agent.name} 有什么缺点？</h3>
          <div itemScope itemProp="acceptedAnswer" itemType="https://schema.org/Answer">
            <p itemProp="text">{agent.cons?.join('、')}</p>
          </div>
        </div>
      </section>
    </article>
  )
}
