import { supabaseAdmin } from '@/lib/supabase'

export const revalidate = 3600 // 每小时重新生成

export default async function HeroPage() {
  // 获取所有 Agents（按创建时间排序）
  const { data: allAgents } = await supabaseAdmin
    .from('agents')
    .select('id, slug, name, short_description, platform, key_features, pros, cons, use_cases, pricing, official_url, created_at')
    .order('created_at', { ascending: false })
    .limit(100)

  // 获取统计数据
  const { count: agentCount } = await supabaseAdmin
    .from('agents')
    .select('*', { count: 'exact', head: true })

  // 获取分类
  const { data: categories } = await supabaseAdmin
    .from('categories')
    .select('*')
    .order('name')

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* 新 Hero Section - 结合中英双语文案 */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700"></div>
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMzYgMzRjMC0yLjIxLTEuNzktNC00LTRzLTQgMS43OS00IDQgMS43OSA0IDQgNCA0LTEuNzkgNC00em0wLTEwYzAtMi4yMS0xLjc5LTQtNC00cy00IDEuNzktNCA0IDEuNzkgNCA0IDQgNC0xLjc5IDQtNHptMC0xMGMwLTIuMjEtMS43OS00LTQtNHMtNCAxLjc5LTQgNCAxLjc5IDQgNCA0IDQtMS43OSA0LTR6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-20"></div>

        <div className="relative container mx-auto px-4 py-24 text-center text-white">
          <div className="inline-block mb-6 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-sm font-medium">
            🤖 GEO 数据基座 · AI 搜索 & Agent 发现
          </div>

          <h1 className="text-5xl md:text-6xl font-black mb-6 leading-tight">
            <span className="block mb-2">
              赢下每一次 AI Agent 搜索
            </span>
            <span className="block text-2xl md:text-3xl text-blue-100">
              Win Every AI Agent Search
            </span>
          </h1>

          <p className="text-lg md:text-2xl mb-6 max-w-4xl mx-auto text-blue-100 leading-relaxed">
            <span className="block mb-3">
              Superalphaagent 是面向 AI 搜索引擎和 Agent 开发者的 GEO 数据基座，
              让你的 Agent 在 ChatGPT、Claude、Perplexity 等生成式引擎中被准确发现、深度理解，并持续被推荐。
            </span>
            <span className="block text-base md:text-lg text-blue-100/90">
              Superalphaagent is the GEO data layer for AI search engines and agent builders,
              making your agents easier to discover, understand, and recommend across ChatGPT,
              Claude, Perplexity, and beyond.
            </span>
          </p>

          <p className="text-sm md:text-base mb-10 max-w-2xl mx-auto text-blue-100/90">
            当前已收录{' '}
            <span className="font-bold text-white">
              {agentCount || 0}+
            </span>{' '}
            个 AI Agents · 深度分析 · 实时更新 · 为 AI 搜索优化
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <a
              href="#agents"
              className="bg-white text-blue-600 px-8 py-4 rounded-xl font-bold text-lg hover:bg-blue-50 transition-all shadow-2xl hover:shadow-3xl hover:scale-105 transform"
            >
              🚀 浏览 Agent 目录
            </a>
            <a
              href="/ai-stats"
              className="px-8 py-4 rounded-xl font-semibold text-sm md:text-base border border-white/60 text-white/90 hover:bg-white/10 transition-all"
            >
              📊 查看 AI 搜索信号 / View AI Signals
            </a>
          </div>
        </div>

        {/* 波浪分隔 */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0 120L60 105C120 90 240 60 360 45C480 30 600 30 720 37.5C840 45 960 60 1080 67.5C1200 75 1320 75 1380 75L1440 75V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z" fill="rgb(248 250 252)" />
          </svg>
        </div>
      </section>

      {/* 分类快速导航（复用主页面结构） */}
      {categories && categories.length > 0 && (
        <section className="container mx-auto px-4 py-12">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-1 h-8 bg-gradient-to-b from-blue-600 to-purple-600 rounded-full"></div>
            <h2 className="text-3xl font-bold text-gray-900">按分类浏览</h2>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {categories.map((category) => (
              <div
                key={category.id}
                className="bg-white rounded-xl p-6 hover:shadow-xl transition-all cursor-pointer border-2 border-transparent hover:border-blue-500 group"
              >
                <div className="text-4xl mb-3 group-hover:scale-110 transition-transform">
                  {category.icon || '📦'}
                </div>
                <h3 className="font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                  {category.name}
                </h3>
                <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                  {category.description}
                </p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 主要 Agents 展示区 - 结构化数据（复用主页面结构） */}
      <section id="agents" className="container mx-auto px-4 py-12">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-1 h-8 bg-gradient-to-b from-blue-600 to-purple-600 rounded-full"></div>
            <h2 className="text-3xl font-bold text-gray-900">全部 AI Agents</h2>
          </div>
          <div className="text-sm text-gray-500">
            共 {allAgents?.length || 0} 个
          </div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {allAgents?.map((agent) => (
            <article
              key={agent.id}
              className="bg-white rounded-2xl p-6 hover:shadow-2xl transition-all border border-gray-100 hover:border-blue-300 group"
              itemScope
              itemType="https://schema.org/SoftwareApplication"
            >
              {/* 标题和平台 */}
              <div className="flex items-start justify-between mb-4">
                <h3
                  className="font-bold text-xl text-gray-900 group-hover:text-blue-600 transition-colors flex-1"
                  itemProp="name"
                >
                  {agent.name}
                </h3>
                {agent.platform && (
                  <span className="text-xs bg-gradient-to-r from-blue-100 to-purple-100 text-blue-700 px-3 py-1 rounded-full font-medium ml-2">
                    {agent.platform}
                  </span>
                )}
              </div>

              {/* 描述 */}
              <p
                className="text-gray-600 text-sm mb-4 line-clamp-2 leading-relaxed"
                itemProp="description"
              >
                {agent.short_description}
              </p>

              {/* 核心功能 */}
              {agent.key_features && Array.isArray(agent.key_features) && agent.key_features.length > 0 && (
                <div className="mb-4">
                  <div className="text-xs font-semibold text-gray-500 mb-2">✨ 核心功能</div>
                  <div className="flex flex-wrap gap-2">
                    {agent.key_features.slice(0, 3).map((feature, idx) => (
                      <span
                        key={idx}
                        className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded-lg"
                        itemProp="featureList"
                      >
                        {feature}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* 优点 */}
              {agent.pros && Array.isArray(agent.pros) && agent.pros.length > 0 && (
                <div className="mb-4">
                  <div className="text-xs font-semibold text-green-600 mb-2">✅ 优势</div>
                  <ul className="text-xs text-gray-600 space-y-1">
                    {agent.pros.slice(0, 2).map((pro, idx) => (
                      <li key={idx} className="flex items-start gap-1">
                        <span className="text-green-500 mt-0.5">•</span>
                        <span className="line-clamp-1">{pro}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* 适用场景 */}
              {agent.use_cases && Array.isArray(agent.use_cases) && agent.use_cases.length > 0 && (
                <div className="mb-4">
                  <div className="text-xs font-semibold text-purple-600 mb-2">🎯 适用场景</div>
                  <div className="text-xs text-gray-600">
                    {agent.use_cases.slice(0, 2).join(' · ')}
                  </div>
                </div>
              )}

              {/* 底部信息 */}
              <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                {agent.pricing && (
                  <span
                    className="text-xs font-semibold text-gray-700"
                    itemProp="offers"
                    itemScope
                    itemType="https://schema.org/Offer"
                  >
                    <span itemProp="price">💰 {agent.pricing}</span>
                  </span>
                )}
                {agent.official_url && (
                  <a
                    href={agent.official_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1 group-hover:gap-2 transition-all"
                    itemProp="url"
                  >
                    访问 →
                  </a>
                )}
              </div>
            </article>
          ))}
        </div>

        {(!allAgents || allAgents.length === 0) && (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">🤖</div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">暂无 Agent 数据</h3>
            <p className="text-gray-600 mb-6">运行爬虫来获取 Agent 信息</p>
            <code className="bg-gray-100 px-4 py-2 rounded-lg text-sm">
              npm run crawler
            </code>
          </div>
        )}
      </section>
    </div>
  )
}

