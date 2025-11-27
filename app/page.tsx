import { AnimatedGrid } from '@/components/ui/animated-grid'
import { GradientText } from '@/components/ui/gradient-text'
import { EnhancedButton } from '@/components/ui/enhanced-button'
import { GlassCard } from '@/components/ui/glass-card'
import ModeSwitcher from '@/components/ui/mode-switcher'

export const revalidate = 3600

export default async function HomePage() {
  // 模拟数据，暂时屏蔽Supabase数据获取
  const allAgents = [
    {
      id: '1',
      slug: 'code-assistant',
      name: '代码助手',
      short_description: '帮助你编写代码的AI助手',
      platform: 'ChatGPT',
      key_features: ['代码生成', '代码解释', '错误修复'],
      pros: ['准确率高', '支持多种语言', '实时反馈'],
      cons: ['需要网络连接', '有时会生成错误代码'],
      use_cases: ['开发新功能', '调试代码', '学习编程'],
      pricing: '免费',
      official_url: 'https://example.com',
      created_at: new Date().toISOString(),
    },
    {
      id: '2',
      slug: 'writing-assistant',
      name: '写作助手',
      short_description: '帮助你写作的AI助手',
      platform: 'Claude',
      key_features: ['文章生成', '内容优化', '语法检查'],
      pros: ['写作质量高', '支持长文本', '创意丰富'],
      cons: ['速度较慢', '有时会重复内容'],
      use_cases: ['写博客', '写论文', '写小说'],
      pricing: '免费',
      official_url: 'https://example.com',
      created_at: new Date().toISOString(),
    },
    {
      id: '3',
      slug: 'design-assistant',
      name: '设计助手',
      short_description: '帮助你设计的AI助手',
      platform: 'MidJourney',
      key_features: ['图片生成', '设计建议', '风格转换'],
      pros: ['图片质量高', '风格多样', '创意丰富'],
      cons: ['需要描述清楚', '有时会生成不符合要求的图片'],
      use_cases: ['设计logo', '设计海报', '设计产品'],
      pricing: '免费',
      official_url: 'https://example.com',
      created_at: new Date().toISOString(),
    },
  ]
  
  const agentCount = allAgents.length
  
  const categories = [
    {
      id: '1',
      name: '开发',
      description: '开发相关的AI助手',
      icon: '💻',
    },
    {
      id: '2',
      name: '写作',
      description: '写作相关的AI助手',
      icon: '✍️',
    },
    {
      id: '3',
      name: '设计',
      description: '设计相关的AI助手',
      icon: '🎨',
    },
    {
      id: '4',
      name: '学习',
      description: '学习相关的AI助手',
      icon: '📚',
    },
    {
      id: '5',
      name: '生活',
      description: '生活相关的AI助手',
      icon: '🏠',
    },
  ]
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Hero Section */}
      <section className="relative overflow-hidden min-h-[600px] md:min-h-[700px]">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(120,119,198,0.3),transparent_50%)]"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(59,130,246,0.3),transparent_50%)]"></div>
        
        <AnimatedGrid />
        
        <div className="absolute top-20 left-5 md:left-10 w-48 h-48 md:w-72 md:h-72 bg-white/10 rounded-full blur-3xl animate-blob"></div>
        <div className="absolute top-40 right-5 md:right-10 w-64 h-64 md:w-96 md:h-96 bg-cyan-300/10 rounded-full blur-3xl animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-20 left-1/4 md:left-1/3 w-56 h-56 md:w-80 md:h-80 bg-purple-300/10 rounded-full blur-3xl animate-blob animation-delay-4000"></div>

        <div className="relative container mx-auto px-4 py-20 md:py-28 text-center text-white">
          <div className="inline-block mb-6 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-sm font-medium animate-fade-in border border-white/20">
            🤖 AI 搜索引擎优化平台
          </div>
          
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-black mb-6 leading-tight animate-fade-in-up">
            <span className="block text-white/90 font-light tracking-tight">发现最强大的</span>
            <GradientText animate className="block mt-2">AI Agents</GradientText>
          </h1>
          
          <p className="text-base md:text-lg lg:text-xl xl:text-2xl mb-10 max-w-3xl mx-auto text-white/80 leading-relaxed animate-fade-in">
            精选 <span className="font-bold text-white">{agentCount || 0}+</span> 款 AI 智能助手
            <br />深度分析 · 实时更新 · AI 搜索优化
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-fade-in-up">
            <EnhancedButton href="#agents" variant="primary" icon="🚀">浏览 Agent 市场</EnhancedButton>
            <EnhancedButton href="#publish" variant="secondary" icon="✍️">发布你的 Agent</EnhancedButton>
          </div>
          
          <div className="mt-8 text-white/60 text-xs md:text-sm animate-fade-in">
            ⚡ 每日自动更新 · 完全免费 · AI 搜索引擎友好
          </div>
        </div>
        
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
            <path d="M0 120L60 105C120 90 240 60 360 45C480 30 600 30 720 37.5C840 45 960 60 1080 67.5C1200 75 1320 75 1380 75L1440 75V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z" fill="rgb(248 250 252)"/>
          </svg>
        </div>
      </section>

      {/* 模式切换器 */}
      <section className="container mx-auto px-4 py-6">
        <ModeSwitcher />
      </section>

      {/* 分类导航 */}
      {categories && categories.length > 0 && (
        <section className="container mx-auto px-4 py-12">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-1 h-8 bg-gradient-to-b from-blue-600 to-purple-600 rounded-full"></div>
            <h2 className="text-3xl font-bold text-gray-900">按分类浏览</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {categories.map((category) => (
              <GlassCard key={category.id} className="cursor-pointer">
                <div className="text-4xl mb-3 group-hover:scale-110 transition-transform">{category.icon || '📦'}</div>
                <h3 className="font-bold text-gray-900 group-hover:text-blue-600 transition-colors">{category.name}</h3>
                <p className="text-sm text-gray-500 mt-1 line-clamp-2">{category.description}</p>
              </GlassCard>
            ))}
          </div>
        </section>
      )}

      {/* Agents 展示区 */}
      <section id="agents" className="container mx-auto px-4 py-12">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-1 h-8 bg-gradient-to-b from-blue-600 to-purple-600 rounded-full"></div>
            <h2 className="text-3xl font-bold text-gray-900">全部 AI Agents</h2>
          </div>
          <div className="text-sm text-gray-500">共 {allAgents?.length || 0} 款</div>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {allAgents?.map((agent) => (
            <GlassCard key={agent.id}>
              <article itemScope itemType="https://schema.org/SoftwareApplication">
                <div className="flex items-start justify-between mb-4">
                  <h3 className="font-bold text-xl text-gray-900 group-hover:text-blue-600 transition-colors flex-1" itemProp="name">
                    {agent.name}
                  </h3>
                  {agent.platform && (
                    <span className="text-xs bg-blue-100 text-blue-700 px-3 py-1 rounded-full font-medium ml-2">
                      {agent.platform}
                    </span>
                  )}
                </div>
                
                <p className="text-gray-600 text-sm mb-4 line-clamp-2 leading-relaxed" itemProp="description">
                  {agent.short_description}
                </p>
                
                {agent.key_features && Array.isArray(agent.key_features) && agent.key_features.length > 0 && (
                  <div className="mb-4">
                    <div className="text-xs font-semibold text-gray-500 mb-2">✔ 核心功能</div>
                    <div className="flex flex-wrap gap-2">
                      {agent.key_features.slice(0, 3).map((feature, idx) => (
                        <span key={idx} className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded-lg" itemProp="featureList">
                          {feature}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                
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
                
                {agent.use_cases && Array.isArray(agent.use_cases) && agent.use_cases.length > 0 && (
                  <div className="mb-4">
                    <div className="text-xs font-semibold text-purple-600 mb-2">🎯 适用场景</div>
                    <div className="text-xs text-gray-600">{agent.use_cases.slice(0, 2).join(' · ')}</div>
                  </div>
                )}
                
                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                  {agent.pricing && (
                    <span className="text-xs font-semibold text-gray-700" itemProp="offers" itemScope itemType="https://schema.org/Offer">
                      <span itemProp="price">💰 {agent.pricing}</span>
                    </span>
                  )}
                  {agent.official_url && (
                    <a href={agent.official_url} target="_blank" rel="noopener noreferrer" 
                       className="text-xs text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1" itemProp="url">
                      访问 →
                    </a>
                  )}
                </div>
              </article>
            </GlassCard>
          ))}
        </div>
        
        {(!allAgents || allAgents.length === 0) && (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">🤖</div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">暂无 Agent 数据</h3>
            <p className="text-gray-600 mb-6">运行爬虫来获取 Agent 信息</p>
            <code className="bg-gray-100 px-4 py-2 rounded-lg text-sm font-mono">npm run crawler</code>
          </div>
        )}
      </section>


      {/* FAQ 区域 */}
      <section className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-1 h-8 bg-gradient-to-b from-blue-600 to-purple-600 rounded-full"></div>
            <h2 className="text-3xl font-bold text-gray-900">关于 AI Agents</h2>
          </div>
          
          <div className="space-y-6">
            <GlassCard hover={false}>
              <div itemScope itemType="https://schema.org/Question">
                <h3 className="text-xl font-bold text-gray-900 mb-3" itemProp="name">什么是 AI Agent？</h3>
                <div className="text-gray-600 leading-relaxed" itemScope itemType="https://schema.org/Answer" itemProp="acceptedAnswer">
                  <p itemProp="text">
                    AI Agent 是基于大语言模型（如 GPT-4、Claude、Qwen）构建的智能助手，能够自主完成特定任务。
                    它们可以理解自然语言指令，执行复杂工作流，并提供专业的解决方案。
                  </p>
                </div>
              </div>
            </GlassCard>
            
            <GlassCard hover={false}>
              <div itemScope itemType="https://schema.org/Question">
                <h3 className="text-xl font-bold text-gray-900 mb-3" itemProp="name">如何选择合适的 AI Agent？</h3>
                <div className="text-gray-600 leading-relaxed" itemScope itemType="https://schema.org/Answer" itemProp="acceptedAnswer">
                  <ul className="list-disc list-inside space-y-2" itemProp="text">
                    <li><strong>功能匹配度</strong>：Agent 的核心功能是否符合你的需求</li>
                    <li><strong>易用性</strong>：界面友好度和学习成本</li>
                    <li><strong>价格</strong>：免费、付费或 Freemium 模式</li>
                    <li><strong>平台兼容性</strong>：支持的平台和集成方式</li>
                  </ul>
                </div>
              </div>
            </GlassCard>
            
            <GlassCard hover={false}>
              <div itemScope itemType="https://schema.org/Question">
                <h3 className="text-xl font-bold text-gray-900 mb-3" itemProp="name">这个平台有什么特色？</h3>
                <div className="text-gray-600 leading-relaxed" itemScope itemType="https://schema.org/Answer" itemProp="acceptedAnswer">
                  <ul className="list-disc list-inside space-y-2" itemProp="text">
                    <li><strong>AI 优先设计</strong>：结构化数据，便于 AI 搜索引擎理解</li>
                    <li><strong>深度分析</strong>：详细的功能分析、优缺点和使用场景</li>
                    <li><strong>自动更新</strong>：爬虫系统每日自动抓取最新 AI Agents</li>
                    <li><strong>完全免费</strong>：所有信息公开透明</li>
                  </ul>
                </div>
              </div>
            </GlassCard>
          </div>
        </div>
      </section>

      {/* 发布 Agent 区域 */}
      <section id="publish" className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <div className="relative bg-gradient-to-br from-purple-600 via-indigo-600 to-blue-600 rounded-3xl p-8 md:p-12 text-center text-white shadow-2xl overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.1),transparent_50%)]"></div>
            <div className="absolute top-10 right-10 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
            <div className="absolute bottom-10 left-10 w-40 h-40 bg-cyan-400/20 rounded-full blur-2xl"></div>
            
            <div className="relative z-10">
              <div className="text-5xl md:text-6xl mb-6 animate-float">🚀</div>
              <h2 className="text-3xl md:text-4xl font-bold mb-4">发布你的 AI Agent</h2>
              <p className="text-base md:text-lg lg:text-xl text-white/80 mb-8 max-w-2xl mx-auto leading-relaxed">
                让更多人发现你的 AI 智能助手！我们会自动分析你的 Agent 并生成专业的展示页面，优化 AI 搜索引擎收录。
              </p>
              
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 md:p-8 mb-8 text-left max-w-2xl mx-auto border border-white/20">
                <h3 className="text-lg md:text-xl font-bold mb-4 text-center">📑 提交流程</h3>
                <div className="space-y-4">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-8 h-8 bg-white/20 rounded-full flex items-center justify-center font-bold text-sm border border-white/30">1</div>
                    <div>
                      <div className="font-semibold mb-1">提交 Agent URL</div>
                      <div className="text-sm text-white/70">提供你的 Agent 链接（支持 GPT Store、Poe 等平台）</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-8 h-8 bg-white/20 rounded-full flex items-center justify-center font-bold text-sm border border-white/30">2</div>
                    <div>
                      <div className="font-semibold mb-1">自动分析</div>
                      <div className="text-sm text-white/70">我们的 AI 系统会自动抓取和分析你的 Agent 信息</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-8 h-8 bg-white/20 rounded-full flex items-center justify-center font-bold text-sm border border-white/30">3</div>
                    <div>
                      <div className="font-semibold mb-1">生成展示页</div>
                      <div className="text-sm text-white/70">自动生成专业的 Agent 详情页，优化 AI 搜索引擎收录</div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="text-sm md:text-base text-white/60 mb-6">🎯 即将推出提交功能，敬请期待！</div>
              <EnhancedButton href="#agents" variant="primary" icon="👀">先浏览现有 Agents</EnhancedButton>
            </div>
          </div>
        </div>
      </section>

      {/* 底部 CTA */}
      <section className="container mx-auto px-4 py-16">
        <div className="relative bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl p-8 md:p-12 text-center text-white shadow-2xl overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_30%,rgba(255,255,255,0.1),transparent_50%)]"></div>
          <div className="relative z-10">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">发现更多 AI Agents</h2>
            <p className="text-base md:text-lg lg:text-xl text-white/80 mb-8 max-w-2xl mx-auto">
              我们持续收录和分析最新的 AI 智能助手，帮助你找到最适合的工具。
            </p>
            <EnhancedButton href="#agents" variant="primary" icon="🔍">浏览全部 Agents</EnhancedButton>
          </div>
        </div>
      </section>
    </div>
  )
}
