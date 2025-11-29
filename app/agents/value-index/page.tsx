import Link from 'next/link'

// 模拟数据 - 受众卡片
const audienceCards = [
  {
    icon: '💻',
    title: '开发者',
    description: '发现高潜力AI Agent，获取技术洞察和开发灵感',
    subDescription: '优化你的AI产品，提升市场竞争力'
  },
  {
    icon: '📈',
    title: '品牌运营',
    tracking: '监控AI Agent市场趋势，了解用户需求变化',
    subDescription: '制定有效的品牌推广策略'
  },
  {
    icon: '👥',
    title: '用户',
    description: '找到最适合你的AI Agent，提高工作效率',
    subDescription: '享受AI技术带来的便利生活'
  },
  {
    icon: '🎯',
    title: '产品经理',
    description: '分析AI Agent市场需求，优化产品设计',
    subDescription: '打造用户喜爱的AI产品'
  }
]

export default function ValueIndexPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 opacity-50"></div>
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMzYgMzRjMC0yLjIxLTEuNzktNC00LTRzLTQgMS43OS00IDQgMS43OSA0IDQgNCA0LTEuNzkgNC00em0wLTEwYzAtMi4yMS0xLjc5LTQtNC00cy00IDEuNzktNCA0IDEuNzkgNCA0IDQgNC0xLjc5IDQtNHptMC0xMGMwLTIuMjEtMS43OS00LTQtNHMtNCAxLjc5LTQgNCAxLjc5IDQgNCA0IDQtMS43OSA0LTR6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-30"></div>
        
        <div className="relative container mx-auto px-4 py-24">
          {/* 顶部导航 */}
          <nav className="flex items-center justify-between mb-16">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center text-white font-bold text-2xl">
                G
              </div>
              <div>
                <div className="text-xl font-bold text-white">GEO 框组</div>
                <div className="text-xs text-gray-300">AI 数字资产价值索引</div>
              </div>
            </div>
            
            <div className="flex gap-6 items-center">
              <Link 
                href="/agents" 
                className="text-gray-300 hover:text-white font-medium transition-colors"
              >
                Agent 市场
              </Link>
              <Link 
                href="/explore" 
                className="text-gray-300 hover:text-white font-medium transition-colors"
              >
                探索 Agent
              </Link>
              <div className="flex gap-2">
                <button className="px-4 py-2 bg-white/20 backdrop-blur-sm rounded-lg text-white font-medium hover:bg-white/30 transition-all">
                  EN
                </button>
                <button className="px-4 py-2 bg-white/20 backdrop-blur-sm rounded-lg text-white font-medium hover:bg-white/30 transition-all">
                  中
                </button>
              </div>
            </div>
          </nav>
          
          {/* 英雄主标题区 */}
          <div className="text-center max-w-5xl mx-auto">
            <div className="inline-block mb-8 px-6 py-3 bg-white/20 backdrop-blur-sm rounded-full text-sm font-medium text-white">
              🚀 AI 数字资产价值索引
            </div>
            
            <h1 className="text-6xl md:text-7xl font-black mb-8 leading-tight">
              <span className="block text-white">AI 时代的数字资产</span>
              <span className="block bg-gradient-to-r from-yellow-300 via-pink-300 to-purple-300 bg-clip-text text-transparent">
                价值索引。
              </span>
            </h1>
            
            <p className="text-xl md:text-2xl mb-10 max-w-4xl mx-auto text-gray-200 leading-relaxed">
              链接 AI 时代的数字资产，全网 Agent 流量风向标。
              实时监控、深度分析、精准定位，助力你在 AI 浪潮中抢占先机。
            </p>
            
            {/* 核心标签条 */}
            <div className="flex flex-wrap gap-3 justify-center mb-12">
              <span className="px-5 py-2 bg-blue-500/20 text-blue-200 rounded-full text-sm font-medium border border-blue-500/30">
                实时报
              </span>
              <span className="px-5 py-2 bg-green-500/20 text-green-200 rounded-full text-sm font-medium border border-green-500/30">
                GEO 数据
              </span>
              <span className="px-5 py-2 bg-purple-500/20 text-purple-200 rounded-full text-sm font-medium border border-purple-500/30">
                语义结构化分析
              </span>
              <span className="px-5 py-2 bg-yellow-500/20 text-yellow-200 rounded-full text-sm font-medium border border-yellow-500/30">
                流量风向标
              </span>
              <span className="px-5 py-2 bg-pink-500/20 text-pink-200 rounded-full text-sm font-medium border border-pink-500/30">
                价值评估
              </span>
            </div>
            
            {/* CTA 按钮 */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link 
                href="#ranking" 
                className="bg-white text-blue-600 px-10 py-5 rounded-xl font-bold text-lg hover:bg-blue-50 transition-all shadow-2xl hover:shadow-3xl hover:scale-105 transform"
              >
                📊 立即查看榜单
              </Link>
              <div className="text-gray-300 text-sm">
                ⚡ 实时更新 · 深度分析 · 完全免费
              </div>
            </div>
          </div>
        </div>
        
        {/* 波浪分隔 */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0 120L60 105C120 90 240 60 360 45C480 30 600 30 720 37.5C840 45 960 60 1080 67.5C1200 75 1320 75 1380 75L1440 75V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z" fill="rgb(15 23 42)"/>
          </svg>
        </div>
      </section>
      
      {/* 受众卡片区 */}
      <section className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-white mb-4">
            为不同角色量身定制
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            无论你是开发者、品牌运营、普通用户还是产品经理，
            都能在这里找到你需要的AI数字资产信息
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {audienceCards.map((card, index) => (
            <div 
              key={index}
              className="bg-gray-800/80 backdrop-blur-sm rounded-2xl p-8 border border-gray-700 hover:border-blue-500/50 hover:shadow-2xl transition-all group"
            >
              <div className="text-5xl mb-6 group-hover:scale-110 transition-transform">
                {card.icon}
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">
                {card.title}
              </h3>
              <p className="text-gray-300 mb-3 leading-relaxed">
                {card.description}
              </p>
              <p className="text-gray-400 text-sm leading-relaxed">
                {card.subDescription}
              </p>
            </div>
          ))}
        </div>
      </section>
      
      {/* 榜单区（需求1中只需要基础结构） */}
      <section id="ranking" className="container mx-auto px-4 py-16">
        <div className="flex items-center justify-between mb-10">
          <div>
            <h2 className="text-4xl font-bold text-white mb-3">
              AI Agent 价值榜单
            </h2>
            <p className="text-xl text-gray-300">
              基于实时数据和深度分析的AI Agent价值排名
            </p>
          </div>
          <div className="relative w-full max-w-xs">
            <input 
              type="text" 
              placeholder="搜索 Agent 名称..." 
              className="w-full px-5 py-3 bg-gray-800/80 backdrop-blur-sm rounded-xl border border-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
            />
            <div className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400">
              🔍
            </div>
          </div>
        </div>
        
        {/* 示例榜单卡片 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[1, 2, 3].map((index) => (
            <div 
              key={index}
              className="bg-gray-800/80 backdrop-blur-sm rounded-2xl p-8 border border-gray-700 hover:border-blue-500/50 hover:shadow-2xl transition-all group"
            >
              <div className="flex items-center justify-between mb-6">
                <div className="text-3xl font-bold text-yellow-400">
                  #{index}
                </div>
                <div className="px-4 py-2 bg-green-500/20 text-green-200 rounded-full text-sm font-medium border border-green-500/30">
                  上升趋势
                </div>
              </div>
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center text-white font-bold">
                  A
                </div>
                <div>
                  <div className="text-xl font-bold text-white">
                    AI Agent {index}
                  </div>
                  <div className="text-sm text-gray-400">
                    综合评分: 9.8
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <div className="text-sm text-gray-400 mb-1">
                    流量指数
                  </div>
                  <div className="text-lg font-bold text-blue-400">
                    12,345
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-400 mb-1">
                    价值评分
                  </div>
                  <div className="text-lg font-bold text-green-400">
                    98.5
                  </div>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                {['AI', '工具', '创新', '高效'].map((tag, tagIndex) => (
                  <span 
                    key={tagIndex}
                    className="px-3 py-1 bg-gray-700/80 text-gray-300 rounded-full text-xs font-medium"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}