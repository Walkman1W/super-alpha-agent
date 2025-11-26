import { supabaseAdmin, mockSupabase, USE_MOCK_DATA } from '@/lib/supabase'
import Link from 'next/link'

export const revalidate = 3600

export default async function ComparePage() {
  let agents = []
  let categories = []

  if (USE_MOCK_DATA) {
    // 使用虚拟数据
    agents = await mockSupabase.getAllAgents()
    categories = await mockSupabase.getCategories()
  } else if (supabaseAdmin) {
    try {
      // 获取所有agents用于对比
      const { data: agentsData } = await supabaseAdmin
        .from('agents')
        .select('id, slug, name, short_description, platform, key_features, pros, cons, use_cases, pricing, official_url, category_id')
        .order('name')
      
      const { data: categoriesData } = await supabaseAdmin
        .from('categories')
        .select('*')
        .order('name')

      agents = agentsData || []
      categories = categoriesData || []
    } catch (error) {
      console.error('获取对比数据失败:', error)
      agents = []
      categories = []
    }
  }

  // 按分类分组agents
  const agentsByCategory = agents.reduce((acc, agent) => {
    const categoryId = agent.category_id || 'uncategorized'
    if (!acc[categoryId]) {
      acc[categoryId] = []
    }
    acc[categoryId].push(agent)
    return acc
  }, {} as Record<string, typeof agents>)

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-700"></div>
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMzYgMzRjMC0yLjIxLTEuNzktNC00LTRzLTQgMS43OS00IDQgMS43OSA0IDQgNCA0LTEuNzkgNC00em0wLTEwYzAtMi4yMS0xLjc5LTQtNC00cy00IDEuNzktNCA0IDEuNzkgNCA0IDQgNC0xLjc5IDQtNHptMC0xMGMwLTIuMjEtMS43OS00LTQtNHMtNCAxLjc5LTQgNCAxLjc5IDQgNCA0IDQtMS43OSA0LTR6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-20"></div>
        
        <div className="relative container mx-auto px-4 py-24 text-center text-white">
          <div className="inline-block mb-6 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-sm font-medium">
            🔍 AI 工具对比分析
          </div>
          
          <h1 className="text-5xl md:text-6xl font-black mb-6 leading-tight">
            智能对比
            <br />
            <span className="bg-gradient-to-r from-yellow-300 via-pink-300 to-purple-300 bg-clip-text text-transparent">
              AI 工具
            </span>
          </h1>
          
          <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto text-blue-100 leading-relaxed">
            深度对比分析 {agents.length || 0}+ 个 AI 工具
            <br />
            功能对比 · 优势劣势 · 适用场景 · 价格比较
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <a 
              href="#categories" 
              className="bg-white text-purple-600 px-8 py-4 rounded-xl font-bold text-lg hover:bg-purple-50 transition-all shadow-2xl hover:shadow-3xl hover:scale-105 transform"
            >
              🚀 开始对比
            </a>
            <div className="text-blue-100 text-sm">
              📊 数据驱动 · 客观分析
            </div>
          </div>
        </div>
        
        {/* 波浪分隔 */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0 120L60 105C120 90 240 60 360 45C480 30 600 30 720 37.5C840 45 960 60 1080 67.5C1200 75 1320 75 1380 75L1440 75V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z" fill="rgb(248 250 252)"/>
          </svg>
        </div>
      </section>

      {/* 分类对比区域 */}
      <section id="categories" className="container mx-auto px-4 py-16">
        <div className="flex items-center gap-3 mb-12">
          <div className="w-1 h-8 bg-gradient-to-b from-purple-600 to-blue-600 rounded-full"></div>
          <h2 className="text-4xl font-bold text-gray-900">按分类对比</h2>
        </div>

        {categories.map((category) => {
          const categoryAgents = agentsByCategory[category.id] || []
          if (categoryAgents.length < 2) return null

          return (
            <div key={category.id} className="mb-16">
              <div className="flex items-center gap-4 mb-8">
                <div className="text-3xl">{category.icon || '📦'}</div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">{category.name}</h3>
                  <p className="text-gray-600">{category.description}</p>
                </div>
              </div>

              {/* 对比表格 */}
              <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-200">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gradient-to-r from-purple-50 to-blue-50">
                      <tr>
                        <th className="px-6 py-4 text-left font-bold text-gray-900">工具名称</th>
                        <th className="px-6 py-4 text-left font-bold text-gray-900">平台</th>
                        <th className="px-6 py-4 text-left font-bold text-gray-900">核心功能</th>
                        <th className="px-6 py-4 text-left font-bold text-gray-900">优势</th>
                        <th className="px-6 py-4 text-left font-bold text-gray-900">劣势</th>
                        <th className="px-6 py-4 text-left font-bold text-gray-900">价格</th>
                        <th className="px-6 py-4 text-left font-bold text-gray-900">操作</th>
                      </tr>
                    </thead>
                    <tbody>
                      {categoryAgents.map((agent, index) => (
                        <tr key={agent.id} className={`border-t border-gray-100 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                          <td className="px-6 py-4">
                            <div>
                              <div className="font-bold text-gray-900">{agent.name}</div>
                              <div className="text-sm text-gray-600 mt-1">{agent.short_description}</div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                              {agent.platform || 'Web'}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex flex-wrap gap-1">
                              {agent.key_features?.slice(0, 3).map((feature, idx) => (
                                <span key={idx} className="inline-block px-2 py-1 text-xs bg-green-100 text-green-800 rounded">
                                  {feature}
                                </span>
                              ))}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <ul className="text-sm text-gray-700 space-y-1">
                              {agent.pros?.slice(0, 2).map((pro, idx) => (
                                <li key={idx} className="flex items-start">
                                  <span className="text-green-500 mr-2">✓</span>
                                  <span className="line-clamp-2">{pro}</span>
                                </li>
                              ))}
                            </ul>
                          </td>
                          <td className="px-6 py-4">
                            <ul className="text-sm text-gray-700 space-y-1">
                              {agent.cons?.slice(0, 2).map((con, idx) => (
                                <li key={idx} className="flex items-start">
                                  <span className="text-red-500 mr-2">✗</span>
                                  <span className="line-clamp-2">{con}</span>
                                </li>
                              ))}
                            </ul>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                              agent.pricing?.toLowerCase().includes('free') ? 'bg-green-100 text-green-800' :
                              agent.pricing?.toLowerCase().includes('$') ? 'bg-yellow-100 text-yellow-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {agent.pricing || '免费'}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <Link 
                              href={`/agents/${agent.slug}`}
                              className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white text-sm font-medium rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all"
                            >
                              详情
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )
        })}

        {Object.keys(agentsByCategory).filter(catId => agentsByCategory[catId].length >= 2).length === 0 && (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">📊</div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">暂无对比数据</h3>
            <p className="text-gray-600 mb-8">当前没有足够的工具可以进行对比分析</p>
            <Link 
              href="/"
              className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-medium rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all"
            >
              返回首页
            </Link>
          </div>
        )}
      </section>

      {/* 特色功能区域 */}
      <section className="bg-gradient-to-r from-purple-50 to-blue-50 py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">对比特色功能</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">我们提供多维度的AI工具对比分析，帮助您做出明智的选择</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white rounded-2xl p-8 text-center shadow-lg">
              <div className="text-4xl mb-4">🔍</div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">功能对比</h3>
              <p className="text-gray-600">详细对比每个工具的核心功能，让您快速了解差异</p>
            </div>

            <div className="bg-white rounded-2xl p-8 text-center shadow-lg">
              <div className="text-4xl mb-4">⚖️</div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">优劣势分析</h3>
              <p className="text-gray-600">客观分析每个工具的优势和劣势，帮助权衡选择</p>
            </div>

            <div className="bg-white rounded-2xl p-8 text-center shadow-lg">
              <div className="text-4xl mb-4">💰</div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">价格比较</h3>
              <p className="text-gray-600">对比不同工具的定价策略，找到性价比最高的选择</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}