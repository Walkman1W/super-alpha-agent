/**
 * 发布页面
 * 允许用户提交新的 Agent 到平台
 * 
 * **Validates: Requirements 8.1, 8.2, 8.3, 8.4, 8.5**
 */

import { Metadata } from 'next'
import { PublisherForm } from '@/components/publish/publisher-form'

export const metadata: Metadata = {
  title: 'Publish Agent | Agent Signals',
  description: '提交你的 AI Agent 到 Agent Signals 平台，获得更多曝光和 AI 搜索引擎收录',
  openGraph: {
    title: 'Publish Agent | Agent Signals',
    description: '提交你的 AI Agent 到 Agent Signals 平台',
    type: 'website'
  }
}

export default function PublishPage() {
  return (
    <main className="min-h-screen bg-zinc-950">
      {/* Header */}
      <div className="border-b border-zinc-800 bg-zinc-900/50">
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-2xl md:text-3xl font-mono font-bold text-zinc-100">
            <span className="text-purple-400">$</span> publish --agent
          </h1>
          <p className="mt-2 text-zinc-400 font-mono text-sm">
            提交你的 Agent 到 Agent Signals 平台，让更多人发现它
          </p>
        </div>
      </div>

      {/* Form Section */}
      <div className="container mx-auto px-4 py-8">
        <PublisherForm />
      </div>

      {/* Info Section */}
      <div className="border-t border-zinc-800 bg-zinc-900/30">
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-4 bg-zinc-900/50 border border-zinc-800 rounded-lg">
              <div className="text-2xl mb-2">🔍</div>
              <h3 className="font-mono text-zinc-100 font-medium mb-1">AI 搜索优化</h3>
              <p className="text-sm text-zinc-400">
                自动生成 JSON-LD 结构化数据，提升 AI 搜索引擎收录
              </p>
            </div>
            <div className="p-4 bg-zinc-900/50 border border-zinc-800 rounded-lg">
              <div className="text-2xl mb-2">📊</div>
              <h3 className="font-mono text-zinc-100 font-medium mb-1">数据分析</h3>
              <p className="text-sm text-zinc-400">
                追踪你的 Agent 被 AI 搜索引擎推荐的频率
              </p>
            </div>
            <div className="p-4 bg-zinc-900/50 border border-zinc-800 rounded-lg">
              <div className="text-2xl mb-2">🚀</div>
              <h3 className="font-mono text-zinc-100 font-medium mb-1">快速审核</h3>
              <p className="text-sm text-zinc-400">
                提交后 24 小时内完成审核并上线
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
