import Link from 'next/link'

export default function ValueIndexPage() {
  // 模拟受众卡片数据
  const audienceCards = [
    {
      icon: '👨‍💻',
      title: '开发者',
      description: '了解 AI 数字资产的技术架构和实现细节',
      description2: '优化你的 AI 应用性能和用户体验'
    },
    {
      icon: '📈',
      title: '品牌运营',
      description: '分析 AI 数字资产的市场表现和用户行为',
      description2: '制定有效的品牌推广策略'
    },
    {
      icon: '👥',
      title: '用户',
      description: '发现最有价值的 AI 数字资产',
      description2: '提升你的工作效率和生活品质'
    },
    {
      icon: '🎯',
      title: '产品经理',
      description: '洞察 AI 数字资产的发展趋势和用户需求',
      description2: '优化你的产品设计和功能规划'
    }
  ]

  // 模拟榜单数据
  const rankingData = [
    {
      id: 1,
      name: 'AI 创作助手 Pro',
      date: '2024-01-15',
      status: '上升',
      traffic: '15,892',
      rating: '4.9/5',
      value: '$2,345,678',
      tag: '热门'
    },
    {
      id: 2,
      name: '智能数据分析平台',
      date: '2024-01-15',
      status: '稳定',
      traffic: '12,456',
      rating: '4.7/5',
      value: '$1,890,123',
      tag: '推荐'
    },
    {
      id: 3,
      name: 'AI 语音交互系统',
      date: '2024-01-15',
      status: '下降',
      traffic: '9,789',
      rating: '4.6/5',
      value: '$1,567,890',
      tag: '趋势'
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700"></div>
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMzYgMzRjMC0yLjIxLTEuNzktNC00LTRzLTQgMS43OS00IDQgMS43OSA0IDQgNCA0LTEuNzkgNC00em0wLTEwYzAtMi4yMS0xLjc5LTQtNC00cy00IDEuNzktNCA0IDEuNzkgNCA0IDQgNC0xLjc5IDQtNHptMC0xMGMwLTIuMjEtMS43OS00LTQtNHMtNCAxLjc5LTQgNCAxLjc5IDQgNCA0IDQtMS43OSA0LTR6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-20"></div>
        
        <div className="relative container mx-auto px-4 py-24">
          {/* 顶部导航 */}
          <nav className="flex items-center justify-between mb-16 animate-fade-in">
            <div className="flex items-center gap-3 group">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold text-xl group-hover:scale-110 transition-transform shadow-lg">
                G
              </div>
              <div>
                <div className="text-xl font-bold text-white group-hover:text-blue-200 transition-colors">GEO 框组</div>
                <div className="text-xs text-blue-100">AI 数字资产价值索引</div>
              </div>
            </div>
            
            <div className="hidden md:flex items-center gap-6">
              <Link href="/agents" className="text-white hover:text-blue-200 font-medium transition-colors relative group">
                Agent 市场
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-blue-200 group-hover:w-full transition-all duration-300"></span>
              </Link>
              <Link href="/" className="text-white hover:text-blue-200 font-medium transition-colors relative group">
                探索 Agent
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-blue-200 group-hover:w-full transition-all duration-300"></span>
              </Link>
            </div>
            
            <div className="flex items-center gap-2">
              <button className="px-4 py-2 bg-white/20 backdrop-blur-sm rounded-lg text-white font-medium hover:bg-white/30 transition-all shadow-lg hover:shadow-xl">
                EN
              </button>
              <button className="px-4 py-2 bg-white/30 backdrop-blur-sm rounded-lg text-white font-medium hover:bg-white/40 transition-all shadow-lg hover:shadow-xl">
                中
              </button>
            </div>
          </nav>
          
          {/* 英雄主标题区 */}
          <div className="max-w-4xl animate-fade-in" style={{ animationDelay: '0.2s' }}>
            <h1 className="text-6xl md:text-7xl font-black mb-6 leading-tight text-white">
              AI 时代的数字资产
              <br />
              <span className="bg-gradient-to-r from-yellow-300 via-pink-300 to-purple-300 bg-clip-text text-transparent">
                价值索引。
              </span>
            </h1>
            
            <p className="text-xl md:text-2xl mb-8 text-blue-100 leading-relaxed">
              链接 AI 时代的数字资产，全网 Agent 流量风向标。
            </p>
            
            {/* 核心标签条 */}
            <div className="flex flex-wrap gap-3 mb-10">
              <span className="px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-sm font-medium text-white hover:bg-white/30 transition-all shadow-lg">
                实时报
              </span>
              <span className="px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-sm font-medium text-white hover:bg-white/30 transition-all shadow-lg">
                GEO 数据
              </span>
              <span className="px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-sm font-medium text-white hover:bg-white/30 transition-all shadow-lg">
                语义结构化分析
              </span>
              <span className="px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-sm font-medium text-white hover:bg-white/30 transition-all shadow-lg">
                全网流量监控
              </span>
            </div>
            
            {/* CTA 按钮 */}
            <Link 
              href="#rankings" 
              className="inline-block bg-white text-blue-600 px-8 py-4 rounded-xl font-bold text-lg hover:bg-blue-50 transition-all shadow-2xl hover:shadow-3xl hover:scale-105 transform"
            >
              立即查看榜单
            </Link>
          </div>
        </div>
        
        {/* 波浪分隔 */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0 120L60 105C120 90 240 60 360 45C480 30 600 30 720 37.5C840 45 960 60 1080 67.5C1200 75 1320 75 1380 75L1440 75V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z" fill="rgb(248 250 252)"/>
          </svg>
        </div>
      </section>
      
      {/* 受众卡片区 */}
      <section className="container mx-auto px-4 py-16">
        <div className="text-center mb-12 animate-fade-in">
          <div className="w-12 h-1 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full mx-auto mb-4"></div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">谁适合使用？</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">我们的平台为不同角色提供针对性的 AI 数字资产分析服务</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {audienceCards.map((card, index) => (
            <div 
              key={index}
              className="bg-white rounded-2xl p-8 hover:shadow-2xl transition-all border border-gray-100 hover:border-blue-300 group animate-fade-in"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-purple-100 rounded-2xl flex items-center justify-center text-3xl mb-6 group-hover:scale-110 transition-transform shadow-lg">
                {card.icon}
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors">
                {card.title}
              </h3>
              <p className="text-gray-600 text-sm mb-2 leading-relaxed">
                {card.description}
              </p>
              <p className="text-gray-600 text-sm leading-relaxed">
                {card.description2}
              </p>
            </div>
          ))}
        </div>
      </section>
      
      {/* 榜单区 */}
      <section id="rankings" className="container mx-auto px-4 py-16 bg-white/50 rounded-3xl backdrop-blur-sm">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-12 animate-fade-in">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-1 h-8 bg-gradient-to-b from-blue-600 to-purple-600 rounded-full"></div>
              <h2 className="text-3xl font-bold text-gray-900">AI 数字资产榜单</h2>
            </div>
            <p className="text-gray-600">基于全网流量和用户评分的实时排名</p>
          </div>
          <div className="relative w-full md:w-64 mt-6 md:mt-0">
            <input 
              type="text" 
              placeholder="搜索数字资产..." 
              className="w-full px-4 py-3 pr-12 bg-white rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all shadow-md"
            />
            <div className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 group-hover:text-blue-500 transition-colors">
              🔍
            </div>
          </div>
        </div>
        
        {/* 示例榜单卡片 */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {rankingData.map((item, index) => (
            <div 
              key={item.id}
              className="bg-white rounded-2xl p-8 hover:shadow-2xl transition-all border border-gray-100 hover:border-blue-300 group animate-fade-in"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-lg ${item.id === 1 ? 'bg-gradient-to-br from-yellow-500 to-orange-500' : item.id === 2 ? 'bg-gradient-to-br from-gray-400 to-gray-500' : 'bg-gradient-to-br from-amber-600 to-amber-700'}`}>
                    {item.id}
                  </div>
                  <div>
                    <h3 className="font-bold text-xl text-gray-900 group-hover:text-blue-600 transition-colors">
                      {item.name}
                    </h3>
                    <p className="text-xs text-gray-500">{item.date}</p>
                  </div>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${item.status === '上升' ? 'bg-green-100 text-green-700' : item.status === '稳定' ? 'bg-blue-100 text-blue-700' : 'bg-red-100 text-red-700'}`}>
                  {item.status}
                </span>
              </div>
              
              <div className="space-y-4 mb-6">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500 flex items-center gap-2">
                    <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                    流量指数
                  </span>
                  <span className="text-sm font-semibold text-gray-900">{item.traffic}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500 flex items-center gap-2">
                    <span className="w-2 h-2 bg-yellow-500 rounded-full"></span>
                    用户评分
                  </span>
                  <span className="text-sm font-semibold text-gray-900">{item.rating}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500 flex items-center gap-2">
                    <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                    市场价值
                  </span>
                  <span className="text-sm font-semibold text-gray-900">{item.value}</span>
                </div>
              </div>
              
              <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                <Link 
                  href="#" 
                  className="text-blue-600 hover:text-blue-800 font-medium text-sm transition-colors flex items-center gap-1 group"
                >
                  查看详情 →
                  <span className="group-hover:translate-x-1 transition-transform">→</span>
                </Link>
                <span className="text-xs bg-blue-100 text-blue-700 px-3 py-1 rounded-full">
                  {item.tag}
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}