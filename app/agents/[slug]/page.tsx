import { supabaseAdmin } from '@/lib/supabase'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { AIVisitTracker } from '@/components/ai-visit-tracker'
import { Star, Zap, Globe, Briefcase, Calendar, ArrowRight, Award } from 'lucide-react'

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
  const slug = params.slug

  // 获取 Agent 详情
  let agent = null
  try {
    const { data } = await supabaseAdmin
      .from('agents')
      .select('*, categories(name, slug, icon)')
      .eq('slug', slug)
      .single()
    agent = data
    if (!agent) throw new Error('Agent not found')
  } catch (error) {
    // 使用模拟数据作为 fallback
    agent = {
      id: '1',
      slug: 'chatgpt',
      name: 'ChatGPT',
      category_id: 'coding',
      categories: { name: '编程', slug: 'coding', icon: 'code' },
      short_description: '强大的 AI 聊天机器人，能回答各种问题并帮助完成任务',
      detailed_description: 'ChatGPT 是由 OpenAI 开发的先进语言模型，能够理解和生成人类语言，广泛应用于聊天、写作、编程等领域',
      key_features: ['自然语言理解', '多轮对话', '代码生成', '文本摘要'],
      use_cases: ['客户服务', '内容创作', '编程辅助', '教育学习'],
      pros: ['响应迅速', '知识丰富', '支持多语言', '易于使用'],
      cons: ['有时生成错误信息', '需要网络连接', '使用限制'],
      how_to_use: '访问 https://chat.openai.com/ 并开始聊天',
      platform: 'web',
      pricing: '免费/订阅',
      official_url: 'https://chat.openai.com/',
      keywords: ['AI', '聊天', '语言模型'],
      ai_search_count: 123456,
      view_count: 123456,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  }

  // 增加浏览量
  try {
    await supabaseAdmin
      .from('agents')
      .update({ view_count: agent.view_count + 1 })
      .eq('id', agent.id)
  } catch (error) {
    // 忽略更新错误
  }

  // 获取相似 Agents
  let similarAgents = []
  try {
    const { data } = await supabaseAdmin
      .from('agents')
      .select('id, slug, name, short_description, platform, ai_search_count')
      .eq('category_id', agent.category_id)
      .neq('id', agent.id)
      .limit(3)
    similarAgents = data || []
  } catch (error) {
    // 使用模拟数据作为 fallback
    similarAgents = [
      {
        id: '2',
        slug: 'midjourney',
        name: 'Midjourney',
        short_description: 'AI 图像生成工具，根据文本提示创建高质量图像',
        platform: 'discord',
        ai_search_count: 98765,
        created_at: new Date().toISOString()
      },
      {
        id: '3',
        slug: 'dalle',
        name: 'DALL·E',
        short_description: 'OpenAI 开发的 AI 图像生成器，根据文本描述创建图像',
        platform: 'web',
        ai_search_count: 87654,
        created_at: new Date().toISOString()
      }
    ]
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
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

      {/* 页面头部背景 */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-900 via-indigo-900 to-purple-900 opacity-10"></div>
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiB2aWV3Qm94PSIwIDAgMSAxIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxwYXRoIGQ9Ik0wIDBsMSAxIiBmaWxsPSJ3aGl0ZSIgc3Ryb2tlPSIjZmZmIi8+PC9zdmc+')} opacity-5"></div>
        
        <div className="container mx-auto px-4 py-12">
          {/* 面包屑 */}
          <nav className="text-sm text-gray-600 mb-6">
            <a href="/" className="hover:text-blue-600">首页</a>
            {' / '}
            <a href="/agents" className="hover:text-blue-600">Agents</a>
            {' / '}
            <span className="font-medium">{agent.name}</span>
          </nav>

          {/* 🆕 AI 访问追踪 */}
          <AIVisitTracker agentSlug={params.slug} />
        </div>
      </div>

      <div className="container mx-auto px-4 -mt-8 relative z-10">
        {/* 标题区域卡片 */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-12 border border-gray-100">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="flex-1">
              <h1 className="text-4xl md:text-5xl font-bold mb-3 text-gray-900">{agent.name}</h1>
              <p className="text-xl md:text-2xl text-gray-600 mb-6 leading-relaxed">
                {agent.short_description}
              </p>
              
              {/* 🆕 AI 搜索量展示 */}
              {agent.ai_search_count > 0 && (
                <div className="flex flex-wrap items-center gap-6 mt-6">
                  <div className="flex items-center gap-3 bg-gradient-to-r from-purple-50 to-blue-50 px-6 py-3 rounded-xl border border-purple-100">
                    <Zap className="h-7 w-7 text-purple-600" />
                    <div className="flex items-center gap-3">
                <div className="flex-shrink-0 w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                  <Zap className="h-6 w-6 text-yellow-600" />
                </div>
                <div>
                  <dt className="text-gray-600 text-sm">AI 搜索量</dt>
                  <dd className="font-semibold text-lg text-gray-900">{agent.ai_search_count.toLocaleString()}</dd>
                </div>
              </div>
                      <div className="text-sm text-gray-600">AI 搜索量</div>
                      <div className="text-2xl md:text-3xl font-bold text-purple-600">
                        {agent.ai_search_count.toLocaleString()}
                      </div>
                    </div>
                  </div>
                  
                  {agent.ai_search_count > 100 && (
                    <div className="flex items-center gap-2 bg-yellow-50 px-4 py-2 rounded-full border border-yellow-100">
                      <Award className="h-4 w-4 text-yellow-600" />
                      <span className="text-sm font-medium text-yellow-800">AI 热门 Agent</span>
                    </div>
                  )}
                </div>
              )}
            </div>
            <div className="flex flex-col items-end">
              <div className="flex gap-3 mb-4">
                <span className="inline-block bg-blue-100 text-blue-800 px-4 py-2 rounded-lg text-sm font-medium">
                  {agent.platform}
                </span>
                
                <span className="inline-block bg-green-100 text-green-800 px-4 py-2 rounded-lg text-sm font-medium">
                  {agent.pricing}
                </span>
              </div>
              
              <a 
                href={agent.official_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 transition-all"
              >
                <span>访问官方网站</span>
                <ArrowRight className="h-4 w-4" />
              </a>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-12 gap-8">
          {/* 主要内容 */}
          <div className="lg:col-span-8 space-y-8">
            {/* 快速概览 */}
            <section className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
              <h2 className="text-2xl font-bold mb-6 text-gray-900">快速概览</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex items-center gap-3">
                  <div className="flex-shrink-0 w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <Briefcase className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <dt className="text-gray-600 text-sm">分类</dt>
                    <dd className="font-semibold text-lg text-gray-900">{agent.categories?.name}</dd>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex-shrink-0 w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center">
                    <Globe className="h-6 w-6 text-indigo-600" />
                  </div>
                  <div>
                    <dt className="text-gray-600 text-sm">平台</dt>
                    <dd className="font-semibold text-lg text-gray-900">{agent.platform}</dd>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex-shrink-0 w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                    <Star className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <dt className="text-gray-600 text-sm">定价</dt>
                    <dd className="font-semibold text-lg text-gray-900">{agent.pricing}</dd>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex-shrink-0 w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                    <Calendar className="h-6 w-6 text-purple-600" />
                  </div>
                  <div>
                    <dt className="text-gray-600 text-sm">浏览量</dt>
                    <dd className="font-semibold text-lg text-gray-900">{agent.view_count.toLocaleString()}</dd>
                  </div>
                </div>
            </div>
          </section>

          {/* 详细介绍 */}
          <section className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
            <h2 className="text-2xl font-bold mb-6 text-gray-900">详细介绍</h2>
            <div className="prose max-w-none text-gray-700 leading-relaxed">
              <p>{agent.detailed_description}</p>
            </div>
          </section>

          {/* 核心功能 */}
          <section className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
            <h2 className="text-2xl font-bold mb-6 text-gray-900">核心功能</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {agent.key_features?.map((feature: string, i: number) => (
                <div key={i} className="flex items-start gap-3 bg-blue-50 p-4 rounded-lg">
                  <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
                    <span className="font-bold">{i + 1}</span>
                  </div>
                  <span className="text-gray-800">{feature}</span>
                </div>
              ))}
            </div>
          </section>

          {/* 适用场景 */}
          <section className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
            <h2 className="text-2xl font-bold mb-6 text-gray-900">适用场景</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {agent.use_cases?.map((useCase: string, i: number) => (
                <div key={i} className="flex items-start gap-3 bg-green-50 p-4 rounded-lg">
                  <div className="flex-shrink-0 w-8 h-8 bg-green-100 rounded-full flex items-center justify-center text-green-600">
                    →
                  </div>
                  <span className="text-gray-800">{useCase}</span>
                </div>
              ))}
            </div>
          </section>

          {/* 优缺点对比 */}
          <section className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
            <h2 className="text-2xl font-bold mb-6 text-gray-900">优缺点分析</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-gradient-to-b from-green-50 to-white rounded-xl p-6 border border-green-100">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                    +
                  </div>
                  <h3 className="font-semibold text-xl text-green-800">优点</h3>
                </div>
                <ul className="space-y-3">
                  {agent.pros?.map((pro: string, i: number) => (
                    <li key={i} className="flex items-start gap-2">
                      <div className="flex-shrink-0 w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                      <span className="text-gray-700">{pro}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="bg-gradient-to-b from-red-50 to-white rounded-xl p-6 border border-red-100">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center text-red-600">
                    -
                  </div>
                  <h3 className="font-semibold text-xl text-red-800">缺点</h3>
                </div>
                <ul className="space-y-3">
                  {agent.cons?.map((con: string, i: number) => (
                    <li key={i} className="flex items-start gap-2">
                      <div className="flex-shrink-0 w-2 h-2 bg-red-500 rounded-full mt-2"></div>
                      <span className="text-gray-700">{con}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </section>

          {/* 使用方法 */}
          {agent.how_to_use && (
            <section className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
              <h2 className="text-2xl font-bold mb-6 text-gray-900">使用方法</h2>
              <div className="prose max-w-none">
                <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                  {agent.how_to_use}
                </p>
              </div>
            </section>
          )}
        </div>

        {/* 侧边栏 */}
        <div className="lg:col-span-4 space-y-6">
          {/* 操作按钮 */}
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
            <div className="space-y-3">
              {agent.official_url && (
                <a
                  href={agent.official_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white text-center py-4 rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 transition-all transform hover:-translate-y-1"
                >
                  访问官方网站
                </a>
              )}
              <button className="block w-full border border-gray-300 py-4 rounded-lg font-medium hover:bg-gray-50 transition-all transform hover:-translate-y-1">
                收藏 Agent
              </button>
            </div>
          </div>

          {/* 相似 Agents */}
          {similarAgents && similarAgents.length > 0 && (
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
              <div className="flex items-center gap-2 mb-6">
                <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600">
                  👥
                </div>
                <h3 className="font-bold text-xl text-gray-900">相似 Agents</h3>
              </div>
              <div className="space-y-4">
                {similarAgents.map((similar) => (
                  <a
                    key={similar.id}
                    href={`/agents/${similar.slug}`}
                    className="block p-4 rounded-xl border border-gray-100 hover:border-indigo-200 hover:bg-indigo-50 transition-all"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="font-semibold text-gray-900">{similar.name}</div>
                        <div className="text-sm text-gray-600 mt-1 line-clamp-2">
                          {similar.short_description}
                        </div>
                      </div>
                      <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs font-medium">
                        {similar.platform}
                      </span>
                    </div>
                    
                    {/* AI 搜索量展示 */}
                    {similar.ai_search_count > 0 && (
                      <div className="flex items-center gap-2 mt-3">
                        <Zap className="h-4 w-4 text-purple-600" />
                        <div className="text-xs text-gray-600">
                          <span className="font-medium">AI 搜索量:</span> {similar.ai_search_count.toLocaleString()}
                        </div>
                      </div>
                    )}
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* FAQ（AI 友好） */}
      <section className="mt-12">
        <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
          <div className="flex items-center gap-2 mb-8">
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
              ❓
            </div>
            <h2 className="text-2xl font-bold text-gray-900">常见问题</h2>
          </div>
          
          <div className="space-y-6">
            <div className="border-b border-gray-100 pb-6">
              <h3 className="font-semibold text-lg text-gray-900">{agent.name} 是什么？</h3>
              <p className="text-gray-700 mt-2">{agent.short_description}</p>
            </div>
            
            <div className="border-b border-gray-100 pb-6">
              <h3 className="font-semibold text-lg text-gray-900">{agent.name} 有什么功能？</h3>
              <p className="text-gray-700 mt-2">{agent.key_features?.join('、')}</p>
            </div>
            
            <div className="border-b border-gray-100 pb-6">
              <h3 className="font-semibold text-lg text-gray-900">{agent.name} 适合谁使用？</h3>
              <p className="text-gray-700 mt-2">{agent.use_cases?.join('、')}</p>
            </div>
            
            <div className="border-b border-gray-100 pb-6">
              <h3 className="font-semibold text-lg text-gray-900">{agent.name} 的优点是什么？</h3>
              <p className="text-gray-700 mt-2">{agent.pros?.join('、')}</p>
            </div>
            
            <div>
              <h3 className="font-semibold text-lg text-gray-900">{agent.name} 有什么缺点？</h3>
              <p className="text-gray-700 mt-2">{agent.cons?.join('、')}</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
