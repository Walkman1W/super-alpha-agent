import { supabaseAdmin } from '@/lib/supabase'
import Link from 'next/link'

export const revalidate = 3600

export default async function AIStatsPage() {
  // 检查 supabaseAdmin 是否可用
  if (!supabaseAdmin) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-5xl font-bold mb-4 flex items-center justify-center gap-3">
              <span>🤖</span>
              <span>AI 搜索统计</span>
            </h1>
            <p className="text-xl text-gray-600">
              追踪 AI 搜索引擎如何发现和推荐 Agents
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-8">
            <div className="text-center">
              <div className="text-3xl mb-4">⚠️</div>
              <h2 className="text-2xl font-bold mb-2">Supabase 未配置</h2>
              <p className="text-gray-600 mb-4">请检查您的环境变量配置</p>
              <Link
                href="/"
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
              >
                返回首页
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // 获取 AI 搜索统计
  const { data: aiVisits } = await supabaseAdmin
    .from('ai_visits')
    .select('ai_name, agent_id, visited_at, agents(name, slug)')
    .order('visited_at', { ascending: false })
    .limit(100)

  // 按 AI 分组统计
  const aiStats = aiVisits?.reduce((acc, visit) => {
    const aiName = visit.ai_name
    if (!acc[aiName]) {
      acc[aiName] = { count: 0, agents: new Set() }
    }
    acc[aiName].count++
    acc[aiName].agents.add(visit.agent_id)
    return acc
  }, {} as Record<string, { count: number; agents: Set<string> }>)

  // 获取总统计
  const { data: totalStats } = await supabaseAdmin
    .from('agents')
    .select('ai_search_count')

  const totalAISearches = totalStats?.reduce((sum, agent) => sum + (agent.ai_search_count || 0), 0) || 0

  // 获取 Top Agents
  const { data: topAgents } = await supabaseAdmin
    .from('agents')
    .select('id, slug, name, short_description, ai_search_count, platform')
    .gt('ai_search_count', 0)
    .order('ai_search_count', { ascending: false })
    .limit(20)

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-6xl mx-auto">
        {/* 标题 */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-4 flex items-center justify-center gap-3">
            <span>🤖</span>
            <span>AI 搜索统计</span>
          </h1>
          <p className="text-xl text-gray-600">
            追踪 AI 搜索引擎如何发现和推荐 Agents
          </p>
        </div>

        {/* 总览卡片 */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <div className="bg-gradient-to-br from-purple-50 to-blue-50 border border-purple-200 rounded-lg p-6">
            <div className="text-gray-600 mb-2">总 AI 搜索量</div>
            <div className="text-4xl font-bold text-purple-600">{totalAISearches}</div>
          </div>
          <div className="bg-gradient-to-br from-green-50 to-teal-50 border border-green-200 rounded-lg p-6">
            <div className="text-gray-600 mb-2">活跃 AI 引擎</div>
            <div className="text-4xl font-bold text-green-600">
              {aiStats ? Object.keys(aiStats).length : 0}
            </div>
          </div>
          <div className="bg-gradient-to-br from-orange-50 to-red-50 border border-orange-200 rounded-lg p-6">
            <div className="text-gray-600 mb-2">被发现的 Agents</div>
            <div className="text-4xl font-bold text-orange-600">
              {topAgents?.length || 0}
            </div>
          </div>
        </div>

        {/* AI 引擎统计 */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold mb-6">各 AI 引擎活跃度</h2>
          <div className="grid md:grid-cols-2 gap-4">
            {aiStats && Object.entries(aiStats)
              .sort(([, a], [, b]) => b.count - a.count)
              .map(([aiName, stats]) => (
                <div key={aiName} className="border rounded-lg p-4 hover:shadow-lg transition-shadow">
                  <div className="flex items-center justify-between mb-2">
                    <div className="font-semibold text-lg">{aiName}</div>
                    <div className="text-2xl">
                      {aiName.includes('ChatGPT') ? '🟢' : 
                       aiName.includes('Claude') ? '🟣' :
                       aiName.includes('Perplexity') ? '🔵' : '🤖'}
                    </div>
                  </div>
                  <div className="text-gray-600 text-sm">
                    搜索次数: <span className="font-semibold">{stats.count}</span>
                  </div>
                  <div className="text-gray-600 text-sm">
                    发现 Agents: <span className="font-semibold">{stats.agents.size}</span>
                  </div>
                </div>
              ))}
          </div>
        </section>

        {/* Top Agents 排行榜 */}
        <section>
          <h2 className="text-3xl font-bold mb-6">AI 最爱排行榜</h2>
          <div className="space-y-4">
            {topAgents?.map((agent, index) => (
              <Link
                key={agent.id}
                href={`/agents/${agent.slug}`}
                className="block border rounded-lg p-6 hover:shadow-lg transition-shadow"
              >
                <div className="flex items-center gap-4">
                  {/* 排名 */}
                  <div className={`
                    w-12 h-12 rounded-full flex items-center justify-center font-bold text-xl
                    ${index === 0 ? 'bg-yellow-400 text-yellow-900' :
                      index === 1 ? 'bg-gray-300 text-gray-700' :
                      index === 2 ? 'bg-orange-400 text-orange-900' :
                      'bg-gray-100 text-gray-600'}
                  `}>
                    {index + 1}
                  </div>

                  {/* Agent 信息 */}
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold text-lg">{agent.name}</h3>
                      <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                        {agent.platform}
                      </span>
                    </div>
                    <p className="text-gray-600 text-sm line-clamp-2">
                      {agent.short_description}
                    </p>
                  </div>

                  {/* AI 搜索量 */}
                  <div className="text-right">
                    <div className="text-3xl font-bold text-purple-600">
                      {agent.ai_search_count}
                    </div>
                    <div className="text-sm text-gray-600">AI 搜索</div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* 说明 */}
        <section className="mt-12 prose max-w-none">
          <h2>什么是 AI 搜索量？</h2>
          <p>
            AI 搜索量是指这个 Agent 被 AI 搜索引擎（如 ChatGPT、Claude、Perplexity）
            发现和推荐的次数。这是一个全新的指标，反映了 AI 对这个 Agent 的认可度。
          </p>
          
          <h3>为什么 AI 搜索量重要？</h3>
          <ul>
            <li><strong>真实需求</strong>：反映用户通过 AI 搜索的真实需求</li>
            <li><strong>质量认证</strong>：被 AI 推荐说明内容质量高</li>
            <li><strong>未来趋势</strong>：AI 搜索正在成为主流</li>
          </ul>

          <h3>如何增加 AI 搜索量？</h3>
          <ul>
            <li>提供详细、结构化的 Agent 信息</li>
            <li>使用清晰的功能描述和使用场景</li>
            <li>保持内容更新和准确</li>
          </ul>
        </section>
      </div>
    </div>
  )
}
