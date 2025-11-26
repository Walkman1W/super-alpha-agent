import Link from 'next/link'

export const metadata = {
  title: 'AI 数字资产价值索引 | GEO 框组',
  description: '链接 AI 时代的数字资产，全网 Agent 流量风向标。实时数据、GEO 分析、语义结构化分析。',
}

// 受众卡片数据
const audienceCards = [
  {
    icon: '💻',
    title: '开发者',
    description: [
      '发现高潜力 AI 项目',
      '获取实时流量数据'
    ]
  },
  {
    icon: '📈',
    title: '品牌运营',
    description: [
      '洞察市场趋势',
      '优化营销策略'
    ]
  },
  {
    icon: '👥',
    title: '用户',
    description: [
      '找到优质 AI 工具',
      '了解使用价值'
    ]
  },
  {
    icon: '🎯',
    title: '产品经理',
    description: [
      '分析竞品表现',
      '指导产品决策'
    ]
  }
]

export default function ValueIndexPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-pink-500/10 rounded-full blur-3xl animate-pulse" style={{animationDelay: '2s'}}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl animate-pulse" style={{animationDelay: '4s'}}></div>
      </div>
      {/* 顶部导航 */}
      <nav className="bg-slate-900/60 backdrop-blur-xl border-b border-purple-500/10 sticky top-0 z-50 shadow-lg shadow-purple-500/5">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <a href="/" className="flex items-center gap-3 group">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-purple-500/30 group-hover:shadow-xl group-hover:shadow-purple-500/50 transition-all duration-300 group-hover:scale-110">
                G
              </div>
              <div>
                <div className="text-xl font-bold bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent bg-size-200 animate-gradient">
                  GEO 框组
                </div>
                <div className="text-xs text-slate-400">
                  AI 数字资产价值索引
                </div>
              </div>
            </a>
            
            {/* 中间二级导航 */}
            <div className="hidden md:flex gap-8 items-center">
              <Link href="/agents" className="text-slate-300 hover:text-purple-400 font-medium transition-all duration-300 relative group">
                Agent 市场
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-purple-400 to-pink-400 transition-all duration-300 group-hover:w-full"></span>
              </Link>
              <Link href="/agents" className="text-slate-300 hover:text-purple-400 font-medium transition-all duration-300 relative group">
                探索 Agent
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-purple-400 to-pink-400 transition-all duration-300 group-hover:w-full"></span>
              </Link>
            </div>
            
            {/* 右侧语言切换 */}
            <div className="flex gap-2 bg-slate-800/50 backdrop-blur-md rounded-lg p-1 border border-purple-500/10">
              <button className="px-3 py-1.5 text-sm font-medium text-purple-400 bg-purple-500/10 rounded-md transition-all duration-300 hover:bg-purple-500/20">
                中
              </button>
              <button className="px-3 py-1.5 text-sm font-medium text-slate-400 hover:text-purple-400 transition-all duration-300">
                EN
              </button>
            </div>
          </div>
        </div>
      </nav>
      
      {/* 英雄区 */}
      <section className="relative overflow-hidden py-24 md:py-36 z-10">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDM0YzAtMi4yMS0xLjc5LTQtNC00cy00IDEuNzktNCA0IDEuNzkgNCA0IDQgNC0xLjc5IDQtNHptMC0xMGMwLTIuMjEtMS43OS00LTQtNHMtNCAxLjc5LTQgNCAxLjc5IDQgNCA0IDQtMS43OSA0LTR6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-20"></div>
        
        <div className="relative container mx-auto px-4 text-center">
          {/* 核心标签条 */}
          <div className="flex flex-wrap justify-center gap-3 mb-8">
            <span className="bg-purple-500/10 backdrop-blur-md text-purple-300 px-4 py-2 rounded-full text-sm font-medium border border-purple-400/20 shadow-lg shadow-purple-500/10">
              📊 实时报
            </span>
            <span className="bg-blue-500/10 backdrop-blur-md text-blue-300 px-4 py-2 rounded-full text-sm font-medium border border-blue-400/20 shadow-lg shadow-blue-500/10">
              🌍 GEO 数据
            </span>
            <span className="bg-green-500/10 backdrop-blur-md text-green-300 px-4 py-2 rounded-full text-sm font-medium border border-green-400/20 shadow-lg shadow-green-500/10">
              🧠 语义结构化分析
            </span>
            <span className="bg-pink-500/10 backdrop-blur-md text-pink-300 px-4 py-2 rounded-full text-sm font-medium border border-pink-400/20 shadow-lg shadow-pink-500/10">
              📈 流量风向标
            </span>
          </div>
          
          {/* 主标题 */}
          <h1 className="text-5xl md:text-7xl font-black mb-6 leading-tight text-white">
            AI 时代的
            <br />
            <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent bg-size-200 animate-gradient">
              数字资产
            </span>
            <br />
            价值索引。
          </h1>
          
          {/* 副标题 */}
          <p className="text-xl md:text-2xl mb-10 max-w-3xl mx-auto text-slate-300 leading-relaxed font-light">
            链接 AI 时代的数字资产，
            <br />
            全网 Agent 流量风向标。
          </p>
          
          {/* CTA 按钮 */}
          <div className="mb-16">
            <a 
              href="#rankings" 
              className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8 py-4 rounded-xl font-bold text-lg hover:from-purple-700 hover:to-pink-700 transition-all duration-300 shadow-xl shadow-purple-500/30 hover:shadow-2xl hover:shadow-purple-500/50 hover:scale-105 transform inline-block relative overflow-hidden group"
            >
              <span className="relative z-10">🚀 立即查看榜单</span>
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-500"></div>
            </a>
          </div>
        </div>
      </section>
      
      {/* 受众卡片区 */}
      <section className="container mx-auto px-4 py-24 z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {audienceCards.map((card, index) => (
            <div 
              key={index}
              className="bg-slate-800/30 backdrop-blur-md rounded-2xl p-8 border border-purple-500/10 hover:border-purple-500/40 hover:bg-slate-800/50 transition-all duration-300 transform hover:-translate-y-2 relative group"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative z-10">
                <div className="text-5xl mb-4 transform group-hover:scale-110 transition-transform duration-300">
                  {card.icon}
                </div>
                <h3 className="text-xl font-bold text-white mb-3 group-hover:text-purple-300 transition-colors duration-300">
                  {card.title}
                </h3>
                <div className="space-y-2">
                  {card.description.map((line, lineIndex) => (
                    <p key={lineIndex} className="text-slate-400 text-sm leading-relaxed">
                      {line}
                    </p>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
      
      {/* 榜单区（基本结构，可后续扩展） */}
      <section id="rankings" className="container mx-auto px-4 py-24 z-10">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-4">
          <div className="flex items-center gap-3">
            <div className="w-1 h-10 bg-gradient-to-b from-purple-500 to-pink-500 rounded-full"></div>
            <h2 className="text-4xl font-bold bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent">AI Agent 价值榜单</h2>
          </div>
          
          {/* 搜索框 */}
          <div className="w-full md:w-auto">
            <div className="relative">
              <input 
                type="text" 
                placeholder="搜索 Agent..." 
                className="bg-slate-800/50 backdrop-blur-md border border-purple-500/10 rounded-xl px-6 py-4 pl-14 text-white placeholder-slate-400 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all duration-300 w-full md:w-96"
              />
              <div className="absolute left-5 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-purple-400 transition-colors duration-300">
                🔍
              </div>
            </div>
          </div>
        </div>
        
        {/* 示例榜单卡片 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* 示例卡片 1 */}
          <div className="bg-slate-800/30 backdrop-blur-md rounded-2xl p-6 border border-purple-500/10 hover:border-purple-500/40 hover:bg-slate-800/50 transition-all duration-300 transform hover:-translate-y-2 relative group">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="relative z-10">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="text-sm font-bold text-yellow-400 mb-1">#1</div>
                  <h3 className="text-xl font-bold text-white group-hover:text-purple-300 transition-colors duration-300">
                    AI 助手 Pro
                  </h3>
                </div>
                <div className="bg-green-500/20 text-green-300 px-3 py-1 rounded-full text-sm font-medium border border-green-500/30">
                  🔥 热门
                </div>
              </div>
              <p className="text-slate-400 text-sm mb-4 line-clamp-2 leading-relaxed">
                功能强大的 AI 助手，提供智能对话、代码生成、数据分析等多种功能。
              </p>
              <div className="flex flex-wrap gap-2 mb-4">
                <span className="bg-blue-500/10 text-blue-300 px-3 py-1 rounded-full text-xs border border-blue-500/20">
                  代码生成
                </span>
                <span className="bg-purple-500/10 text-purple-300 px-3 py-1 rounded-full text-xs border border-purple-500/20">
                  数据分析
                </span>
                <span className="bg-pink-500/10 text-pink-300 px-3 py-1 rounded-full text-xs border border-pink-500/20">
                  智能对话
                </span>
              </div>
              <div className="flex items-center justify-between pt-4 border-t border-purple-500/10">
                <div className="text-sm text-slate-400 flex items-center space-x-1">
                  <span>📊</span>
                  <span>价值指数: 98.5</span>
                </div>
                <Link 
                  href="/agents/ai-assistant-pro" 
                  className="text-purple-400 hover:text-purple-300 font-medium text-sm transition-colors flex items-center space-x-1 group-hover:space-x-2 transition-all duration-300"
                >
                  <span>查看详情</span>
                  <span>→</span>
                </Link>
              </div>
            </div>
          </div>
          
          {/* 示例卡片 2 */}
          <div className="bg-slate-800/30 backdrop-blur-md rounded-2xl p-6 border border-purple-500/10 hover:border-purple-500/40 hover:bg-slate-800/50 transition-all duration-300 transform hover:-translate-y-2 relative group">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="relative z-10">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="text-sm font-bold text-gray-400 mb-1">#2</div>
                  <h3 className="text-xl font-bold text-white group-hover:text-blue-300 transition-colors duration-300">
                    创意写作 AI
                  </h3>
                </div>
                <div className="bg-purple-500/20 text-purple-300 px-3 py-1 rounded-full text-sm font-medium border border-purple-500/30">
                  ✨ 创意
                </div>
              </div>
              <p className="text-slate-400 text-sm mb-4 line-clamp-2 leading-relaxed">
                专为作家和内容创作者设计的 AI 工具，提供创意灵感、文章生成和编辑建议。
              </p>
              <div className="flex flex-wrap gap-2 mb-4">
                <span className="bg-purple-500/10 text-purple-300 px-3 py-1 rounded-full text-xs border border-purple-500/20">
                  创意写作
                </span>
                <span className="bg-pink-500/10 text-pink-300 px-3 py-1 rounded-full text-xs border border-pink-500/20">
                  内容生成
                </span>
                <span className="bg-blue-500/10 text-blue-300 px-3 py-1 rounded-full text-xs border border-blue-500/20">
                  编辑建议
                </span>
              </div>
              <div className="flex items-center justify-between pt-4 border-t border-blue-500/10">
                <div className="text-sm text-slate-400 flex items-center space-x-1">
                  <span>📊</span>
                  <span>价值指数: 96.2</span>
                </div>
                <Link 
                  href="/agents/creative-writing-ai" 
                  className="text-blue-400 hover:text-blue-300 font-medium text-sm transition-colors flex items-center space-x-1 group-hover:space-x-2 transition-all duration-300"
                >
                  <span>查看详情</span>
                  <span>→</span>
                </Link>
              </div>
            </div>
          </div>
          
          {/* 示例卡片 3 */}
          <div className="bg-slate-800/30 backdrop-blur-md rounded-2xl p-6 border border-purple-500/10 hover:border-purple-500/40 hover:bg-slate-800/50 transition-all duration-300 transform hover:-translate-y-2 relative group">
            <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="relative z-10">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="text-sm font-bold text-amber-600 mb-1">#3</div>
                  <h3 className="text-xl font-bold text-white group-hover:text-green-300 transition-colors duration-300">
                    数据分析专家
                  </h3>
                </div>
                <div className="bg-blue-500/20 text-blue-300 px-3 py-1 rounded-full text-sm font-medium border border-blue-500/30">
                  📈 数据
                </div>
              </div>
              <p className="text-slate-400 text-sm mb-4 line-clamp-2 leading-relaxed">
                专业的数据分析 AI，帮助用户处理复杂数据、生成可视化报告和提供商业洞察。
              </p>
              <div className="flex flex-wrap gap-2 mb-4">
                <span className="bg-blue-500/10 text-blue-300 px-3 py-1 rounded-full text-xs border border-blue-500/20">
                  数据分析
                </span>
                <span className="bg-green-500/10 text-green-300 px-3 py-1 rounded-full text-xs border border-green-500/20">
                  可视化报告
                </span>
                <span className="bg-purple-500/10 text-purple-300 px-3 py-1 rounded-full text-xs border border-purple-500/20">
                  商业洞察
                </span>
              </div>
              <div className="flex items-center justify-between pt-4 border-t border-green-500/10">
                <div className="text-sm text-slate-400 flex items-center space-x-1">
                  <span>📊</span>
                  <span>价值指数: 94.8</span>
                </div>
                <Link 
                  href="/agents/data-analysis-expert" 
                  className="text-green-400 hover:text-green-300 font-medium text-sm transition-colors flex items-center space-x-1 group-hover:space-x-2 transition-all duration-300"
                >
                  <span>查看详情</span>
                  <span>→</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
        
        {/* 加载更多按钮 */}
        <div className="text-center mt-12">
          <button className="bg-slate-800/50 backdrop-blur-md border border-purple-500/10 text-white px-8 py-4 rounded-xl font-semibold hover:bg-slate-800 hover:border-purple-500/40 transition-all duration-300 transform hover:scale-105">
            加载更多 →
          </button>
        </div>
      </section>
      
      {/* 页脚（保持与现有项目一致） */}
      <footer className="bg-slate-900/50 backdrop-blur-md text-white mt-20 border-t border-purple-500/10 z-10">
        <div className="container mx-auto px-4 py-12">
          <div className="grid md:grid-cols-3 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4 group">
                <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center font-bold shadow-lg shadow-purple-500/30 group-hover:shadow-xl group-hover:shadow-purple-500/50 transition-all duration-300">
                  G
                </div>
                <span className="font-bold text-lg bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent">GEO 框组</span>
              </div>
              <p className="text-slate-400 text-sm leading-relaxed">
                AI 数字资产价值索引平台。
                链接 AI 时代的数字资产，提供实时数据和深度分析。
              </p>
            </div>
            
            <div>
              <h3 className="font-bold mb-4 text-white">关于</h3>
              <ul className="space-y-2 text-sm text-slate-400">
                <li className="hover:text-purple-400 transition-colors cursor-pointer">🤖 AI 数字资产索引</li>
                <li className="hover:text-purple-400 transition-colors cursor-pointer">🔄 实时数据更新</li>
                <li className="hover:text-purple-400 transition-colors cursor-pointer">📊 深度分析对比</li>
                <li className="hover:text-purple-400 transition-colors cursor-pointer">💯 完全免费使用</li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-bold mb-4 text-white">技术栈</h3>
              <ul className="space-y-2 text-sm text-slate-400">
                <li className="hover:text-purple-400 transition-colors cursor-pointer">Next.js 14 + TypeScript</li>
                <li className="hover:text-purple-400 transition-colors cursor-pointer">Tailwind CSS</li>
                <li className="hover:text-purple-400 transition-colors cursor-pointer">数据可视化</li>
                <li className="hover:text-purple-400 transition-colors cursor-pointer">实时分析</li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-purple-500/10 pt-8 text-center text-sm text-slate-400">
            <p className="bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent">© 2025 GEO 框组. AI 数字资产价值索引平台</p>
            <p className="mt-2">
              Built with ❤️ for the AI community
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
