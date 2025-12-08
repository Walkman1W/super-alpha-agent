import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowLeft, ExternalLink, FileText, Activity, TrendingUp, Database, Sparkles } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Signal Score (SSS v2.0) 评分算法解密 | Agent Signals',
  description: '了解 Signal Score 的计算方法：基于机器可读性与可靠性的 SSS v2.0 评分系统。',
  openGraph: {
    title: 'Signal Score (SSS v2.0) 评分算法解密 | Agent Signals',
    description: '了解 Signal Score 的计算方法：基于机器可读性与可靠性的 SSS v2.0 评分系统。',
    type: 'article',
  },
}

const scoreDimensions = [
  {
    name: 'Vitality (生命力)',
    weight: '最高 3.0 分',
    icon: Activity,
    color: 'from-green-500 to-green-400',
    bgColor: 'bg-green-500/10',
    borderColor: 'border-green-500/30',
    basis: 'Agent 是否存活且可安全调用？',
    logic: 'AI 模型倾向于信任活跃且安全的服务。如果 API 延迟超过 2秒或证书无效，它在 AI 眼里就是"不可靠"。',
    factors: [
      'Active Endpoint (+1.0): 200 OK & Latency < 2s',
      'Freshness (+1.0): Last Commit < 30 days',
      'Security (+1.0): Valid HTTPS & No malware'
    ],
  },
  {
    name: 'Semantic Readiness (语义就绪)',
    weight: '最高 4.0 分',
    icon: Database,
    color: 'from-blue-500 to-blue-400',
    bgColor: 'bg-blue-500/10',
    borderColor: 'border-blue-500/30',
    basis: 'LLM 能否无需人工帮助就理解如何使用这个 Agent？',
    logic: '这是最关键的维度。我们检测 Agent 是否提供了结构化数据、文档和规范文件，这是 AI 读懂你的关键。',
    factors: [
      'Basic Meta (+1.0): <title>, <meta description>',
      'Documentation (+1.0): /docs, README.md, Wiki',
      'Structured Data (+1.0): application/ld+json',
      'Manifest/Spec (+1.0): openapi.yaml, agent.json'
    ],
  },
  {
    name: 'Interoperability (互操作性)',
    weight: '最高 3.0 分',
    icon: TrendingUp,
    color: 'from-purple-500 to-purple-400',
    bgColor: 'bg-purple-500/10',
    borderColor: 'border-purple-500/30',
    basis: '这个 Agent 是否属于开放生态系统？',
    logic: '开源和标准协议支持让 Agent 更容易被集成和信任。MCP 协议支持是未来 AI Agent 互操作的关键。',
    factors: [
      'Open Source (+1.0): Public Repo + OSI License',
      'Protocol Ready (+2.0): Supports MCP or standard APIs'
    ],
  },
]

const citations = [
  {
    id: 1,
    source: 'Anthropic',
    title: 'Model Context Protocol (MCP)',
    url: 'https://modelcontextprotocol.io/',
    date: '2024',
    highlight: true,
  },
  {
    id: 2,
    source: 'Schema.org',
    title: 'Structured Data Standards',
    url: 'https://schema.org/',
  },
  {
    id: 3,
    source: 'OpenAPI Initiative',
    title: 'OpenAPI Specification',
    url: 'https://www.openapis.org/',
  },
  {
    id: 4,
    source: 'Open Source Initiative',
    title: 'OSI Approved Licenses',
    url: 'https://opensource.org/licenses/',
  },
]

export default function BlogPage() {
  return (
    <div className="min-h-screen bg-terminal-bg">
      {/* Hero Section */}
      <section className="relative py-16 md:py-24 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-green-900/20 via-transparent to-transparent" />
        <div className="container mx-auto px-4 relative">
          <Link 
            href="/" 
            className="inline-flex items-center gap-2 text-terminal-text-muted hover:text-terminal-accent transition-colors mb-8 font-mono text-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>返回首页</span>
          </Link>
          
          <div className="max-w-4xl">
            <div className="flex items-center gap-3 mb-4">
              <FileText className="w-8 h-8 text-green-400" />
              <span className="font-mono text-green-400 text-sm">TECHNICAL BLOG</span>
            </div>
            <h1 className="text-3xl md:text-5xl font-bold text-terminal-text mb-6 leading-tight">
              解密 Signal Score：
              <br />
              <span className="bg-gradient-to-r from-green-400 to-green-300 bg-clip-text text-transparent">
                SSS v2.0 评分系统
              </span>
            </h1>
            <p className="text-lg text-terminal-text-muted max-w-2xl">
              Signal Standard Score v2.0: Machine Readability & Reliability
            </p>
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="py-12 md:py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto space-y-16">
            
            {/* Theory */}
            <div className="prose prose-invert max-w-none">
              <div className="bg-terminal-surface border border-terminal-border rounded-xl p-6 md:p-8">
                <h2 className="text-2xl font-bold text-terminal-text mb-4 flex items-center gap-3">
                  <span className="text-green-400 font-mono">01</span>
                  评分理念
                </h2>
                <p className="text-terminal-text-muted leading-relaxed mb-4">
                  <strong className="text-terminal-text">SSS v2.0 (Signal Standard Score)</strong> 不基于流行度评分，而是基于<strong className="text-green-400">机器可读性与可靠性</strong>。
                </p>
                <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-lg mb-6">
                  <p className="text-sm text-terminal-text-muted mb-2">
                    <strong className="text-green-400">核心问题：</strong>
                  </p>
                  <p className="text-terminal-text">
                    LLM 能否在<strong>无需人工帮助</strong>的情况下理解并调用这个 Agent？
                  </p>
                </div>
                <div className="space-y-3 text-terminal-text-muted">
                  <p><strong className="text-terminal-text">三大评估维度：</strong></p>
                  <ul className="space-y-2 ml-4">
                    <li className="flex items-start gap-3">
                      <span className="text-green-400 mt-1">🟢</span>
                      <span><strong className="text-terminal-text">Vitality (生命力)</strong> - Agent 是否存活且可安全调用？</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-blue-400 mt-1">🔵</span>
                      <span><strong className="text-terminal-text">Semantic Readiness (语义就绪)</strong> - LLM 能否理解如何使用？</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-purple-400 mt-1">🟣</span>
                      <span><strong className="text-terminal-text">Interoperability (互操作性)</strong> - 是否属于开放生态？</span>
                    </li>
                  </ul>
                </div>
                <div className="mt-6 p-4 bg-terminal-border/30 rounded-lg">
                  <p className="text-sm text-terminal-text-muted">
                    <strong className="text-green-400">设计原则：</strong> Signal Score 检测 Agent 是否具备&ldquo;容易被 AI 理解和调用&rdquo;的特征，而非人类的主观评价。
                  </p>
                </div>
              </div>
            </div>

            {/* Formula Overview */}
            <div className="bg-gradient-to-r from-green-900/30 to-green-800/20 border border-green-500/30 rounded-xl p-6 md:p-8">
              <h2 className="text-2xl font-bold text-terminal-text mb-6 flex items-center gap-3">
                <span className="text-green-400 font-mono">02</span>
                评分公式
              </h2>
              <div className="bg-terminal-bg/50 rounded-lg p-6 font-mono text-center">
                <p className="text-lg md:text-xl text-terminal-text mb-4">
                  <span className="text-green-400">Signal Score</span> = <span className="text-zinc-400">0.0 - 10.0</span>
                </p>
                <p className="text-sm md:text-base text-terminal-text-muted">
                  <span className="text-green-400">🟢 Vitality (3.0)</span> + 
                  <span className="text-blue-400"> 🔵 Semantic Readiness (4.0)</span> + 
                  <span className="text-purple-400"> 🟣 Interoperability (3.0)</span>
                </p>
              </div>
              <p className="text-sm text-terminal-text-dim mt-4 text-center">
                满分 10.0 分，基于 10 个可量化的检测指标
              </p>
            </div>

            {/* Score Dimensions */}
            <div>
              <h2 className="text-2xl font-bold text-terminal-text mb-8 flex items-center gap-3">
                <span className="text-green-400 font-mono">03</span>
                评分维度详解
              </h2>
              <div className="space-y-6">
                {scoreDimensions.map((dimension) => {
                  const Icon = dimension.icon
                  return (
                    <div 
                      key={dimension.name}
                      className={`bg-terminal-surface border ${dimension.borderColor} rounded-xl p-6 md:p-8 transition-all hover:border-opacity-60`}
                    >
                      <div className="flex flex-col md:flex-row md:items-start gap-6">
                        <div className={`w-16 h-16 rounded-xl ${dimension.bgColor} flex items-center justify-center flex-shrink-0`}>
                          <Icon className="w-8 h-8" style={{ color: dimension.color.includes('green') ? '#22c55e' : dimension.color.includes('blue') ? '#3b82f6' : dimension.color.includes('purple') ? '#a855f7' : '#f97316' }} />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-3">
                            <h3 className="text-xl font-bold text-terminal-text">{dimension.name}</h3>
                            <span className={`px-3 py-1 ${dimension.bgColor} rounded-full text-xs font-mono font-bold`}>
                              {dimension.weight}
                            </span>
                          </div>
                          <div className="mb-4">
                            <p className="text-xs font-mono text-terminal-text-dim mb-1">理论依据</p>
                            <p className="text-sm text-terminal-text-muted">{dimension.basis}</p>
                          </div>
                          <p className="text-terminal-text-muted mb-4">{dimension.logic}</p>
                          <div>
                            <p className="text-xs font-mono text-terminal-text-dim mb-2">评估因素</p>
                            <div className="flex flex-wrap gap-2">
                              {dimension.factors.map((factor) => (
                                <span key={factor} className="px-3 py-1 bg-terminal-border/50 rounded text-xs text-terminal-text-muted">
                                  {factor}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Conclusion */}
            <div className="bg-gradient-to-r from-purple-900/30 to-green-800/20 border border-purple-500/30 rounded-xl p-6 md:p-8">
              <h2 className="text-2xl font-bold text-terminal-text mb-4 flex items-center gap-3">
                <span className="text-green-400 font-mono">04</span>
                结论
              </h2>
              <p className="text-lg text-terminal-text-muted leading-relaxed">
                Signal Score 不仅仅是一个分数，它是你的 Agent 在 AI 时代的<strong className="text-terminal-text">机器可读性指数</strong>。在 ChatGPT、Claude、Perplexity 等 AI 搜索引擎主导信息获取的时代，让你的 Agent 能被 LLM 理解和调用将成为每个 AI 产品的必修课。
              </p>
            </div>

            {/* Citations */}
            <div>
              <h2 className="text-2xl font-bold text-terminal-text mb-6 flex items-center gap-3">
                <span className="text-green-400 font-mono">05</span>
                参考文献
              </h2>
              <div className="space-y-3">
                {citations.map((citation) => (
                  <a
                    key={citation.id}
                    href={citation.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`flex items-start gap-4 p-4 bg-terminal-surface border rounded-lg hover:border-terminal-border-hover transition-colors group ${citation.highlight ? 'border-green-500/50' : 'border-terminal-border'}`}
                  >
                    <span className="text-terminal-text-dim font-mono text-sm">[{citation.id}]</span>
                    <div className="flex-1">
                      <p className="text-terminal-text group-hover:text-terminal-accent transition-colors">
                        {citation.title}
                      </p>
                      <p className="text-sm text-terminal-text-muted mt-1">
                        {citation.source} {citation.date && `• ${citation.date}`}
                      </p>
                    </div>
                    <ExternalLink className="w-4 h-4 text-terminal-text-dim group-hover:text-terminal-accent transition-colors flex-shrink-0 mt-1" />
                  </a>
                ))}
              </div>
            </div>

            {/* CTA */}
            <div className="text-center py-8">
              <p className="text-terminal-text-muted mb-6">
                想要提升你的 Agent 的 Signal Score？确保你的 Agent 具备完整的文档、结构化数据和 MCP 协议支持。
              </p>
              <Link
                href="/publish"
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-purple-500 text-white rounded-lg font-mono text-sm hover:from-purple-500 hover:to-purple-400 transition-all shadow-lg shadow-purple-500/25"
              >
                <Sparkles className="w-4 h-4" />
                发布你的 Agent
              </Link>
            </div>

          </div>
        </div>
      </section>
    </div>
  )
}
