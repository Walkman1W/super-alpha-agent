import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

async function getMarketAgents() {
  const supabase = createClient()
  
  const { data: agents, error } = await supabase
    .from('agents')
    .select(`
      *,
      categories (
        id,
        name,
        icon
      )
    `)
    .eq('status', 'published')
    .order('ai_search_count', { ascending: false })
    .limit(50)

  if (error) {
    console.error('Error fetching market agents:', error)
    return []
  }

  return agents || []
}

export default async function MarketPage() {
  const agents = await getMarketAgents()

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

      {/* 主要内容 */}
      <div className="relative z-10">
        {/* 导航栏 */}
        <nav className="fixed top-0 w-full bg-black/20 backdrop-blur-md border-b border-white/10 z-50">
          <div className="container mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <Link href="/hero" className="flex items-center gap-4">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                  <span className="text-white font-bold text-xl">S</span>
                </div>
                <div className="text-white">
                  <div className="font-bold text-xl">Super Alpha Agent</div>
                  <div className="text-xs text-gray-300">AI Agent 发现平台</div>
                </div>
              </Link>
              
              <div className="flex items-center gap-4">
                <Link href="/market" className="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-medium">
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
        <section className="pt-32 pb-16 px-6">
          <div className="container mx-auto text-center">
            <div className="mb-8">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full border border-white/20 mb-6">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-white text-sm">Agent 交易市场</span>
              </div>
              
              <h1 className="text-6xl md:text-7xl font-black mb-6 bg-gradient-to-r from-white via-blue-200 to-purple-200 bg-clip-text text-transparent">
                Agent 市场
              </h1>
              
              <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-3xl mx-auto leading-relaxed">
                发现最受欢迎的 AI Agents
                <br />
                按 AI 搜索次数排序 · 实时更新
              </p>
            </div>

            {/* 市场统计 */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto mb-12">
              <div className="text-center">
                <div className="text-4xl md:text-5xl font-black text-white mb-2">
                  {agents.length}
                </div>
                <div className="text-gray-400">精选 Agents</div>
              </div>
              <div className="text-center">
                <div className="text-4xl md:text-5xl font-black text-blue-400 mb-2">
                  {agents.reduce((sum, agent) => sum + (agent.ai_search_count || 0), 0)}
                </div>
                <div className="text-gray-400">总 AI 搜索量</div>
              </div>
              <div className="text-center">
                <div className="text-4xl md:text-5xl font-black text-purple-400 mb-2">
                  {agents.length > 0 ? agents[0].ai_search_count : 0}
                </div>
                <div className="text-gray-400">最高搜索次数</div>
              </div>
            </div>
          </div>
        </section>

        {/* Agents 列表 */}
        <section className="py-16 px-6">
          <div className="container mx-auto">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-3xl font-bold text-white">🔥 热门 Agents</h2>
              <div className="text-gray-400">
                按 AI 搜索次数排序
              </div>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {agents.map((agent, index) => (
                <Link
                  key={agent.id}
                  href={`/agents/${agent.slug}`}
                  className="group block bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 hover:bg-white/10 hover:border-white/20 transition-all hover:scale-105 transform"
                >
                  {/* 排名 */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl font-black text-yellow-400">
                        #{index + 1}
                      </span>
                      {agent.platform && (
                        <span className="text-xs bg-gradient-to-r from-blue-500/20 to-purple-500/20 text-blue-300 px-2 py-1 rounded-full font-medium">
                          {agent.platform}
                        </span>
                      )}
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-gray-400">AI 搜索</div>
                      <div className="text-lg font-bold text-purple-400">
                        {agent.ai_search_count}
                      </div>
                    </div>
                  </div>

                  {/* Agent 信息 */}
                  <h3 className="font-bold text-xl text-white group-hover:text-blue-300 transition-colors mb-3">
                    {agent.name}
                  </h3>
                  
                  <p className="text-gray-400 text-sm mb-4 line-clamp-3">
                    {agent.short_description}
                  </p>

                  {/* 分类 */}
                  {agent.categories && (
                    <div className="mb-4">
                      <span className="text-xs bg-white/10 text-white px-2 py-1 rounded-lg">
                        {agent.categories.icon} {agent.categories.name}
                      </span>
                    </div>
                  )}

                  {/* 核心功能 */}
                  {agent.key_features && Array.isArray(agent.key_features) && agent.key_features.length > 0 && (
                    <div className="mb-4">
                      <div className="text-xs font-semibold text-gray-400 mb-2">核心功能</div>
                      <div className="flex flex-wrap gap-1">
                        {agent.key_features.slice(0, 3).map((feature, idx) => (
                          <span
                            key={idx}
                            className="text-xs bg-white/10 text-white px-2 py-1 rounded"
                          >
                            {feature}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* 底部信息 */}
                  <div className="flex items-center justify-between pt-4 border-t border-white/10">
                    {agent.pricing && (
                      <span className="text-sm font-semibold text-green-400">
                        {agent.pricing}
                      </span>
                    )}
                    <div className="flex items-center gap-2">
                      <span className="text-lg">🤖</span>
                      <span className="text-xs text-purple-400">
                        {agent.ai_search_count} 次搜索
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {agents.length === 0 && (
              <div className="text-center py-16">
                <div className="text-6xl mb-4">🤖</div>
                <h3 className="text-2xl font-bold text-white mb-2">暂无 Agents</h3>
                <p className="text-gray-400 mb-6">还没有 Agents 被收录，成为第一个发布者吧！</p>
                <Link href="/submit" className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all">
                  <span>🚀</span>
                  发布我的 Agent
                </Link>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  )
}