import { supabaseAdmin } from '@/lib/supabase'

export const revalidate = 3600 // 每小时重新生成

export default async function HomePage() {
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
      {/* Hero Section - 增强的渐变背景和视觉效果 */}
      <section className="relative overflow-hidden min-h-[600px] md:min-h-[700px]">
        {/* 多层渐变背景 */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700"></div>
        
        {/* 动画渐变叠加层 */}
        <div className="absolute inset-0 bg-gradient-to-tr from-purple-600/50 via-transparent to-blue-600/50 animate-pulse"></div>
        
        {/* SVG 图案叠加层 - 圆点网格 */}
        <div className="absolute inset-0 opacity-20">
          <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="dots" x="0" y="0" width="60" height="60" patternUnits="userSpaceOnUse">
                <circle cx="30" cy="30" r="2" fill="white" opacity="0.3"/>
                <circle cx="30" cy="10" r="1.5" fill="white" opacity="0.2"/>
                <circle cx="10" cy="30" r="1.5" fill="white" opacity="0.2"/>
                <circle cx="50" cy="30" r="1.5" fill="white" opacity="0.2"/>
                <circle cx="30" cy="50" r="1.5" fill="white" opacity="0.2"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#dots)"/>
          </svg>
        </div>
        
        {/* 浮动装饰元素 - 响应式尺寸 */}
        <div className="absolute top-20 left-5 md:left-10 w-48 h-48 md:w-72 md:h-72 bg-white/10 rounded-full blur-3xl animate-blob"></div>
        <div className="absolute top-40 right-5 md:right-10 w-64 h-64 md:w-96 md:h-96 bg-purple-300/10 rounded-full blur-3xl animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-20 left-1/4 md:left-1/3 w-56 h-56 md:w-80 md:h-80 bg-indigo-300/10 rounded-full blur-3xl animate-blob animation-delay-4000"></div>
        
        <div className="relative container mx-auto px-4 py-20 md:py-28 text-center text-white">
          <div className="inline-block mb-6 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-sm font-medium animate-fade-in-down">
            🤖 AI 搜索引擎优化平台
          </div>
          
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-black mb-6 leading-tight animate-fade-in-up">
            发现最强大的
            <br />
            <span className="bg-gradient-to-r from-yellow-300 via-pink-300 to-purple-300 bg-clip-text text-transparent animate-gradient">
              AI Agents
            </span>
          </h1>
          
          <p className="text-base md:text-lg lg:text-xl xl:text-2xl mb-10 max-w-3xl mx-auto text-blue-100 leading-relaxed animate-fade-in">
            精选 <span className="font-bold text-white">{agentCount || 0}+</span> 个 AI 智能助手
            <br />
            深度分析 · 实时更新 · 为 AI 搜索优化
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-fade-in-up animation-delay-300">
            <a 
              href="#agents" 
              className="w-full sm:w-auto bg-white text-blue-600 px-6 md:px-8 py-3 md:py-4 rounded-xl font-bold text-base md:text-lg hover:bg-blue-50 transition-all duration-300 shadow-2xl hover:shadow-3xl hover:scale-105 transform text-center"
            >
              🚀 浏览 Agent 市场
            </a>
            <a 
              href="#publish" 
              className="w-full sm:w-auto bg-purple-500 text-white px-6 md:px-8 py-3 md:py-4 rounded-xl font-bold text-base md:text-lg hover:bg-purple-600 transition-all duration-300 shadow-2xl hover:shadow-3xl hover:scale-105 transform border-2 border-white/30 text-center"
            >
              ✨ 发布你的 Agent
            </a>
          </div>
          
          <div className="mt-6 text-blue-100 text-xs md:text-sm animate-fade-in animation-delay-500">
            ⚡ 每日自动更新 · 完全免费 · AI 搜索引擎友好
          </div>
        </div>
        
        {/* 波浪分隔 - 增强动画效果 */}
        <div className="absolute bottom-0 left-0 right-0 animate-wave">
          <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
            <path d="M0 120L60 105C120 90 240 60 360 45C480 30 600 30 720 37.5C840 45 960 60 1080 67.5C1200 75 1320 75 1380 75L1440 75V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z" fill="rgb(248 250 252)"/>
          </svg>
        </div>
      </section>

      {/* 分类快速导航 */}
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

      {/* 主要 Agents 展示区 - 结构化数据 */}
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

      {/* AI 搜索优化的 FAQ 区域 */}
      <section className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-1 h-8 bg-gradient-to-b from-blue-600 to-purple-600 rounded-full"></div>
            <h2 className="text-3xl font-bold text-gray-900">关于 AI Agents</h2>
          </div>
          
          <div className="space-y-6">
            <div 
              className="bg-white rounded-2xl p-8 shadow-lg"
              itemScope
              itemType="https://schema.org/Question"
            >
              <h3 className="text-xl font-bold text-gray-900 mb-3" itemProp="name">
                什么是 AI Agent？
              </h3>
              <div 
                className="text-gray-600 leading-relaxed"
                itemScope
                itemType="https://schema.org/Answer"
                itemProp="acceptedAnswer"
              >
                <p itemProp="text">
                  AI Agent 是基于大语言模型（如 GPT-4、Claude、Qwen）构建的智能助手，能够自主完成特定任务。
                  它们可以理解自然语言指令，执行复杂的工作流程，并提供专业的解决方案。
                  Super Alpha Agent 平台聚合了来自 GPT Store、Poe 等平台的优质 AI Agents，
                  提供深度分析、功能对比和使用建议。
                </p>
              </div>
            </div>
            
            <div 
              className="bg-white rounded-2xl p-8 shadow-lg"
              itemScope
              itemType="https://schema.org/Question"
            >
              <h3 className="text-xl font-bold text-gray-900 mb-3" itemProp="name">
                如何选择合适的 AI Agent？
              </h3>
              <div 
                className="text-gray-600 leading-relaxed"
                itemScope
                itemType="https://schema.org/Answer"
                itemProp="acceptedAnswer"
              >
                <p itemProp="text">
                  选择 AI Agent 时需要考虑以下因素：
                </p>
                <ul className="list-disc list-inside mt-3 space-y-2">
                  <li><strong>功能匹配度</strong>：Agent 的核心功能是否符合你的需求</li>
                  <li><strong>易用性</strong>：界面友好度和学习成本</li>
                  <li><strong>价格</strong>：免费、付费或 Freemium 模式</li>
                  <li><strong>平台兼容性</strong>：支持的平台和集成方式</li>
                  <li><strong>更新频率</strong>：是否持续优化和添加新功能</li>
                </ul>
                <p className="mt-3">
                  我们的平台为每个 Agent 提供详细的功能分析、优缺点对比和适用场景建议，
                  帮助你快速找到最适合的 AI 助手。
                </p>
              </div>
            </div>
            
            <div 
              className="bg-white rounded-2xl p-8 shadow-lg"
              itemScope
              itemType="https://schema.org/Question"
            >
              <h3 className="text-xl font-bold text-gray-900 mb-3" itemProp="name">
                这个平台有什么特色？
              </h3>
              <div 
                className="text-gray-600 leading-relaxed"
                itemScope
                itemType="https://schema.org/Answer"
                itemProp="acceptedAnswer"
              >
                <div itemProp="text">
                  <p className="mb-3">Super Alpha Agent 是专为 AI 搜索引擎优化的 Agent 聚合平台：</p>
                  <ul className="list-disc list-inside space-y-2">
                    <li><strong>AI 优先设计</strong>：结构化数据，便于 ChatGPT、Claude、Perplexity 等 AI 搜索引擎理解和引用</li>
                    <li><strong>深度分析</strong>：不只是简单列表，提供详细的功能分析、优缺点和使用场景</li>
                    <li><strong>自动更新</strong>：爬虫系统每日自动抓取和分析最新的 AI Agents</li>
                    <li><strong>完全免费</strong>：所有信息公开透明，无需注册即可浏览</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 发布 Agent 区域 */}
      <section id="publish" className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <div className="bg-gradient-to-br from-purple-600 via-indigo-600 to-blue-600 rounded-3xl p-8 md:p-12 text-center text-white shadow-2xl">
            <div className="text-5xl md:text-6xl mb-6">🚀</div>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              发布你的 AI Agent
            </h2>
            <p className="text-base md:text-lg lg:text-xl text-blue-100 mb-8 max-w-2xl mx-auto leading-relaxed">
              让更多人发现你的 AI 智能助手！我们会自动分析你的 Agent 并生成专业的展示页面，
              帮助你获得更多曝光和用户。
            </p>
            
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 md:p-8 mb-8 text-left max-w-2xl mx-auto">
              <h3 className="text-lg md:text-xl font-bold mb-4 text-center">📝 提交流程</h3>
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-white/20 rounded-full flex items-center justify-center font-bold text-sm">1</div>
                  <div>
                    <div className="font-semibold mb-1">提交 Agent URL</div>
                    <div className="text-sm text-blue-100">提供你的 Agent 链接（支持 GPT Store、Poe 等平台）</div>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-white/20 rounded-full flex items-center justify-center font-bold text-sm">2</div>
                  <div>
                    <div className="font-semibold mb-1">自动分析</div>
                    <div className="text-sm text-blue-100">我们的 AI 系统会自动抓取和分析你的 Agent 信息</div>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-white/20 rounded-full flex items-center justify-center font-bold text-sm">3</div>
                  <div>
                    <div className="font-semibold mb-1">生成展示页</div>
                    <div className="text-sm text-blue-100">自动生成专业的 Agent 详情页，优化 AI 搜索引擎收录</div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="text-sm md:text-base text-blue-100 mb-6">
              🎯 即将推出提交功能，敬请期待！
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a 
                href="#agents"
                className="bg-white text-purple-600 px-6 md:px-8 py-3 md:py-4 rounded-xl font-bold text-base md:text-lg hover:bg-blue-50 transition-all inline-block"
              >
                先浏览现有 Agents
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* 底部 CTA */}
      <section className="container mx-auto px-4 py-16">
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl p-8 md:p-12 text-center text-white shadow-2xl">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            发现更多 AI Agents
          </h2>
          <p className="text-base md:text-lg lg:text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            我们持续收录和分析最新的 AI 智能助手，帮助你找到最适合的工具
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a 
              href="#agents"
              className="w-full sm:w-auto bg-white text-blue-600 px-6 md:px-8 py-3 md:py-4 rounded-xl font-bold text-base md:text-lg hover:bg-blue-50 transition-all inline-block"
            >
              浏览全部 Agents
            </a>
          </div>
        </div>
      </section>
    </div>
  )
}
