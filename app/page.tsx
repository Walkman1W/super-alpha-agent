import { Suspense } from 'react'
import dynamic from 'next/dynamic'
import { getHomePageData } from '@/lib/data-fetcher'
import { AnimatedGrid } from '@/components/ui/animated-grid'
import { GradientText } from '@/components/ui/gradient-text'
import { EnhancedButton } from '@/components/ui/enhanced-button'
import { GlassCard } from '@/components/ui/glass-card'
import { AgentGridSkeleton } from '@/components/agent-card-skeleton'

// 动态导入重型组件以实现代码分割 - 需求: 9.1
const ModeSwitcher = dynamic(() => import('@/components/mode-switcher').then(mod => ({ default: mod.ModeSwitcher })), {
  loading: () => (
    <div className="inline-flex items-center gap-1 p-1 bg-white/20 backdrop-blur-sm rounded-xl border border-white/30 h-[52px] w-[200px] animate-pulse" />
  ),
  ssr: false, // 客户端组件，不需要 SSR
})

const AgentMarketGrid = dynamic(() => import('@/components/agent-market-grid').then(mod => ({ default: mod.AgentMarketGrid })), {
  loading: () => <AgentGridSkeleton count={12} />,
  ssr: true, // 保留 SSR 以优化 SEO
})

const PublishAgentSection = dynamic(() => import('@/components/publish-agent-section').then(mod => ({ default: mod.PublishAgentSection })), {
  loading: () => (
    <section className="container mx-auto px-4 py-16">
      <div className="max-w-2xl mx-auto bg-white/80 backdrop-blur-sm rounded-2xl p-8 border border-gray-200/50 animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-1/2 mb-4"></div>
        <div className="h-4 bg-gray-200 rounded w-3/4 mb-8"></div>
        <div className="h-12 bg-gray-200 rounded mb-4"></div>
        <div className="h-12 bg-gray-200 rounded"></div>
      </div>
    </section>
  ),
  ssr: false, // 发布表单不需要 SSR
})

// ISR 重新验证时间：5分钟 - 需求: 9.4
export const revalidate = 300

// 预渲染页面以减少首次加载时间
export const fetchCache = 'force-cache'

export default async function HomePage() {
  // 使用优化的数据获取层，带内存缓存
  const { agents: allAgents, agentCount, categories } = await getHomePageData()
  
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
          
          {/* Mode Switcher - Tab navigation for Market/Publish modes */}
          <div className="mt-8 flex justify-center animate-fade-in">
            <Suspense fallback={
              <div className="inline-flex items-center gap-1 p-1 bg-white/20 backdrop-blur-sm rounded-xl border border-white/30 h-[52px] w-[200px] animate-pulse" />
            }>
              <ModeSwitcher />
            </Suspense>
          </div>
          
          <div className="mt-6 text-white/60 text-xs md:text-sm animate-fade-in">
            ⚡ 每日自动更新 · 完全免费 · AI 搜索引擎友好
          </div>
        </div>
        
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
            <path d="M0 120L60 105C120 90 240 60 360 45C480 30 600 30 720 37.5C840 45 960 60 1080 67.5C1200 75 1320 75 1380 75L1440 75V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z" fill="rgb(248 250 252)"/>
          </svg>
        </div>
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
        <div className="flex items-center gap-3 mb-8">
          <div className="w-1 h-8 bg-gradient-to-b from-blue-600 to-purple-600 rounded-full"></div>
          <h2 className="text-3xl font-bold text-gray-900">全部 AI Agents</h2>
        </div>
        
        <Suspense fallback={<AgentGridSkeleton count={12} />}>
          <AgentMarketGrid 
            initialAgents={allAgents.map((agent) => ({
              id: agent.id,
              slug: agent.slug,
              name: agent.name,
              short_description: agent.short_description,
              platform: agent.platform,
              pricing: agent.pricing,
              ai_search_count: agent.ai_search_count ?? 0
            }))}
            initialSortBy="ai_search_count"
            pageSize={12}
            showAIStats={true}
          />
        </Suspense>
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
      <PublishAgentSection />

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
