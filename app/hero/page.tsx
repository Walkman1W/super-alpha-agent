import { supabaseAdmin } from '@/lib/supabase'
import Link from 'next/link'

export const revalidate = 3600 // 每小时重新生成

export default async function HeroPage() {
  // 获取热门 Agents（按AI搜索次数排序）
  const { data: hotAgents } = await supabaseAdmin
    .from('agents')
    .select('id, slug, name, short_description, platform, ai_search_count, key_features, pricing, official_url')
    .gt('ai_search_count', 0)
    .order('ai_search_count', { ascending: false })
    .limit(6)

  // 获取统计数据
  const { count: totalAgents } = await supabaseAdmin
    .from('agents')
    .select('*', { count: 'exact', head: true })

  const { data: totalAISearches } = await supabaseAdmin
    .from('agents')
    .select('ai_search_count')

  const totalSearches = totalAISearches?.reduce((sum, agent) => sum + (agent.ai_search_count || 0), 0) || 0

  return (
    <div className="min-h-screen bg-black overflow-hidden">
      {/* 科技感背景动画 */}
      <div className="fixed inset-0 z-0">
        {/* 渐变背景 */}
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900 via-blue-900 to-black opacity-90"></div>
        
        {/* 网格线 */}
        <div className="absolute inset-0" style={{
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px'
        }}></div>
        
        {/* 粒子效果 */}
        <div className="absolute inset-0">
          {[...Array(50)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-white rounded-full opacity-30 animate-pulse"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 3}s`,
                animationDuration: `${2 + Math.random() * 3}s`
              }}
            />
          ))}
        </div>
        
        {/* 光束效果 */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
          <div className="w-96 h-96 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-full opacity-20 blur-3xl animate-pulse"></div>
        </div>
      </div>

      {/* 主要内容 */}
      <div className="relative z-10">
        {/* 导航栏 */}
        <nav className="fixed top-0 w-full bg-black/20 backdrop-blur-md border-b border-white/10 z-50">
          <div className="container mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                  <span className="text-white font-bold text-xl">S</span>
                </div>
                <div className="text-white">
                  <div className="font-bold text-xl">Super Alpha Agent</div>
                  <div className="text-xs text-gray-300">AI Agent 发现平台</div>
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                <Link href="/market" className="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-medium hover:shadow-lg transition-all hover:scale-105">
                  🛒 Agent市场
                </Link>
                <Link href="/submit" className="px-6 py-2 border border-white/30 text-white rounded-lg font-medium hover:bg-white/10 transition-all">
                  🚀 发布Agent
                </Link>
              </div>
            </div>
          </div>
        </nav>

        {/* Hero Section */}
        <section className="pt-32 pb-20 px-6">
          <div className="container mx-auto text-center">
            <div className="mb-8">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full border border-white/20 mb-6">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-white text-sm">AI 搜索引擎优化平台</span>
              </div>
              
              <h1 className="text-7xl md:text-8xl font-black mb-6 bg-gradient-to-r from-white via-blue-200 to-purple-200 bg-clip-text text-transparent">
                发现最强
                <br />
                <span className="bg-gradient-to-r from-yellow-400 via-pink-400 to-purple-400 bg-clip-text text-transparent">
                  AI Agents
                </span>
              </h1>
              
              <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-3xl mx-auto leading-relaxed">
                专为 AI 搜索引擎优化的 Agent 聚合平台
                <br />
                深度分析 · 实时更新 · 结构化数据
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
                <Link href="/market" className="group px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-bold text-lg hover:shadow-2xl transition-all hover:scale-110 transform flex items-center gap-3">
                  <span>🛒</span>
                  浏览 Agent 市场
                  <span className="group-hover:translate-x-1 transition-transform">→</span>
                </Link>
                <Link href="/submit" className="group px-8 py-4 border-2 border-white/50 text-white rounded-xl font-bold text-lg hover:bg-white/10 transition-all flex items-center gap-3">
                  <span>🚀</span>
                  发布我的 Agent
                  <span className="group-hover:translate-x-1 transition-transform">→</span>
                </Link>
              </div>
            </div>

            {/* 统计数据 */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
              <div className="text-center">
                <div className="text-4xl md:text-5xl font-black text-white mb-2">
                  {totalAgents || 0}
                </div>
                <div className="text-gray-400">精选 Agents</div>
              </div>
              <div className="text-center">
                <div className="text-4xl md:text-5xl font-black text-blue-400 mb-2">
                  {totalSearches}
                </div>
                <div className="text-gray-400">AI 搜索量</div>
              </div>
              <div className="text-center">
                <div className="text-4xl md:text-5xl font-black text-purple-400 mb-2">24/7</div>
                <div className="text-gray-400">实时更新</div>
              </div>
            </div>
          </div>
        </section>

        {/* 热门 Agents 预览 */}
        {hotAgents && hotAgents.length > 0 && (
          <section className="py-20 px-6 bg-gradient-to-b from-transparent to-black/50">
            <div className="container mx-auto">
              <div className="text-center mb-12">
                <h2 className="text-4xl font-bold text-white mb-4">🔥 热门 Agents</h2>
                <p className="text-gray-400 text-lg">被 AI 搜索引擎频繁推荐的顶级 Agents</p>
              </div>
              
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {hotAgents.map((agent) => (
                  <Link
                    key={agent.id}
                    href={`/agents/${agent.slug}`}
                    className="group block bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 hover:bg-white/10 hover:border-white/20 transition-all hover:scale-105 transform"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <h3 className="font-bold text-xl text-white group-hover:text-blue-300 transition-colors">
                        {agent.name}
                      </h3>
                      {agent.platform && (
                        <span className="text-xs bg-gradient-to-r from-blue-500/20 to-purple-500/20 text-blue-300 px-3 py-1 rounded-full font-medium">
                          {agent.platform}
                        </span>
                      )}
                    </div>
                    
                    <p className="text-gray-400 text-sm mb-4 line-clamp-2">
                      {agent.short_description}
                    </p>
                    
                    {agent.key_features && Array.isArray(agent.key_features) && agent.key_features.length > 0 && (
                      <div className="mb-4">
                        <div className="flex flex-wrap gap-2">
                          {agent.key_features.slice(0, 2).map((feature, idx) => (
                            <span
                              key={idx}
                              className="text-xs bg-white/10 text-white px-2 py-1 rounded-lg"
                            >
                              {feature}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    <div className="flex items-center justify-between pt-4 border-t border-white/10">
                      {agent.pricing && (
                        <span className="text-sm font-semibold text-green-400">
                          {agent.pricing}
                        </span>
                      )}
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">🤖</span>
                        <span className="text-sm font-bold text-purple-400">
                          {agent.ai_search_count}
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
              
              <div className="text-center mt-12">
                <Link href="/market" className="inline-flex items-center gap-2 px-6 py-3 border border-white/30 text-white rounded-lg hover:bg-white/10 transition-all">
                  查看全部 Agents
                  <span>→</span>
                </Link>
              </div>
            </div>
          </section>
        )}

        {/* 特色功能 */}
        <section className="py-20 px-6">
          <div className="container mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-white mb-4">✨ 平台特色</h2>
              <p className="text-gray-400 text-lg">专为 AI 时代设计的 Agent 发现平台</p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">🤖</span>
                </div>
                <h3 className="text-xl font-bold text-white mb-2">AI 搜索优化</h3>
                <p className="text-gray-400">专为 ChatGPT、Claude、Perplexity 等 AI 搜索引擎优化</p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-teal-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">📊</span>
                </div>
                <h3 className="text-xl font-bold text-white mb-2">深度分析</h3>
                <p className="text-gray-400">提供详细的优缺点分析、使用场景和功能对比</p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">🔄</span>
                </div>
                <h3 className="text-xl font-bold text-white mb-2">实时更新</h3>
                <p className="text-gray-400">24/7 自动爬取和更新，确保信息最新</p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
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

