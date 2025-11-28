'use client'

import { PublishAgentForm } from '@/components/publish-agent-form'

/**
 * 发布Agent区域组件
 * 包含表单和说明信息
 */
export function PublishAgentSection() {
  return (
    <section id="publish" className="container mx-auto px-4 py-16">
      <div className="max-w-4xl mx-auto">
        <div className="relative bg-gradient-to-br from-purple-600 via-indigo-600 to-blue-600 rounded-3xl p-8 md:p-12 text-white shadow-2xl overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.1),transparent_50%)]"></div>
          <div className="absolute top-10 right-10 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
          <div className="absolute bottom-10 left-10 w-40 h-40 bg-cyan-400/20 rounded-full blur-2xl"></div>
          
          <div className="relative z-10">
            <div className="text-center mb-8">
              <div className="text-5xl md:text-6xl mb-6 animate-float">🚀</div>
              <h2 className="text-3xl md:text-4xl font-bold mb-4">发布你的 AI Agent</h2>
              <p className="text-base md:text-lg lg:text-xl text-white/80 max-w-2xl mx-auto leading-relaxed">
                让更多人发现你的 AI 智能助手！我们会自动分析你的 Agent 并生成专业的展示页面，优化 AI 搜索引擎收录。
              </p>
            </div>
            
            {/* 提交流程说明 */}
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 md:p-8 mb-8 text-left max-w-2xl mx-auto border border-white/20">
              <h3 className="text-lg md:text-xl font-bold mb-4 text-center">📑 提交流程</h3>
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-white/20 rounded-full flex items-center justify-center font-bold text-sm border border-white/30">1</div>
                  <div>
                    <div className="font-semibold mb-1">提交 Agent URL</div>
                    <div className="text-sm text-white/70">提供你的 Agent 链接（支持 GPT Store、Poe、GitHub 等平台）</div>
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
            
            {/* 表单区域 */}
            <div className="bg-white rounded-2xl p-6 md:p-8 max-w-2xl mx-auto shadow-xl">
              <PublishAgentForm />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default PublishAgentSection
