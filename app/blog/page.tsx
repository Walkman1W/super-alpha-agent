import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowLeft, ExternalLink, FileText, Activity, TrendingUp, Database, Sparkles } from 'lucide-react'

export const metadata: Metadata = {
  title: 'GEO 评分算法解密 | Agent Signals',
  description: '了解 Signal Score 的计算方法：基于普林斯顿 GEO 研究的生成式引擎优化评分算法。',
  openGraph: {
    title: 'GEO 评分算法解密 | Agent Signals',
    description: '了解 Signal Score 的计算方法：基于普林斯顿 GEO 研究的生成式引擎优化评分算法。',
    type: 'article',
  },
}

const scoreDimensions = [
  {
    name: 'Vitality (生命力)',
    weight: '20%',
    icon: Activity,
    color: 'from-green-500 to-green-400',
    bgColor: 'bg-green-500/10',
    borderColor: 'border-green-500/30',
    basis: 'Google SEO 的 "Freshness Algorithm"',
    logic: 'AI 模型倾向于信任最新的数据。如果一个 Repo 3个月没 commit，或者 API 延迟超过 2秒，它在 AI 眼里就是"死链"。',
    factors: ['最近更新时间', 'Commit 频率', 'API 响应速度', '文档更新状态'],
  },
  {
    name: 'Influence (影响力)',
    weight: '10%',
    icon: TrendingUp,
    color: 'from-blue-500 to-blue-400',
    bgColor: 'bg-blue-500/10',
    borderColor: 'border-blue-500/30',
    basis: 'PageRank 算法与 Social Proof (社会认同)',
    logic: 'GitHub Stars 和 Fork 数量是开发者社区投票的结果，代表了代码的鲁棒性。',
    factors: ['GitHub Stars', 'Fork 数量', '社区活跃度', '引用次数'],
  },
  {
    name: 'Metadata (元数据/GEO核心)',
    weight: '10%',
    icon: Database,
    color: 'from-purple-500 to-purple-400',
    bgColor: 'bg-purple-500/10',
    borderColor: 'border-purple-500/30',
    basis: 'Schema.org 标准与 Princeton GEO 论文',
    logic: '这是最关键的。我们检测 Agent 是否提供了 JSON-LD？是否有清晰的 Capabilities 列表？这是 AI 读懂你的关键。',
    factors: ['JSON-LD 结构化数据', 'Capabilities 列表', 'API 文档完整度', '语义化标记'],
  },
  {
    name: 'Autonomy (自主性加权)',
    weight: '0-10 加分',
    icon: Sparkles,
    color: 'from-orange-500 to-orange-400',
    bgColor: 'bg-orange-500/10',
    borderColor: 'border-orange-500/30',
    basis: '技术复杂度',
    logic: '构建一个 L5 Swarm 系统的难度远高于 L1 Script。我们给予高阶 Agent 更高的初始权重，以鼓励技术创新。',
    factors: ['L1: +0', 'L2: +2', 'L3: +4', 'L4: +7', 'L5: +10'],
  },
]

const citations = [
  {
    id: 1,
    source: 'Princeton University, Georgia Tech, Allen AI',
    title: 'GEO: Generative Engine Optimization',
    url: 'https://arxiv.org/abs/2311.09735',
    date: 'Nov 2023',
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
    source: 'Google',
    title: 'Search Quality Evaluator Guidelines',
    url: 'https://developers.google.com/search/docs/fundamentals/creating-helpful-content',
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
                基于 GEO 的量化算法
              </span>
            </h1>
            <p className="text-lg text-terminal-text-muted max-w-2xl">
              Decoding the Signal Score: The Mathematics of GEO (Generative Engine Optimization)
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
                  理论依据与学术引用
                </h2>
                <p className="text-terminal-text-muted leading-relaxed mb-4">
                  <strong className="text-terminal-text">GEO (Generative Engine Optimization)</strong> 这个词本身有学术出处，这非常重要！
                </p>
                <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-lg mb-6">
                  <p className="text-sm text-terminal-text-muted mb-2">
                    <strong className="text-green-400">核心引用：</strong>
                  </p>
                  <p className="text-terminal-text">
                    普林斯顿大学、乔治亚理工学院、艾伦人工智能研究所联合发布的论文 <strong>《GEO: Generative Engine Optimization》 (Nov 2023)</strong>
                  </p>
                </div>
                <div className="space-y-3 text-terminal-text-muted">
                  <p><strong className="text-terminal-text">论文核心发现：</strong></p>
                  <ul className="space-y-2 ml-4">
                    <li className="flex items-start gap-3">
                      <span className="text-green-400 mt-1">▸</span>
                      <span>在 LLM 的回答中，<strong className="text-terminal-text">引用源（Citations）</strong>能显著增加内容被 AI 推荐的概率</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-green-400 mt-1">▸</span>
                      <span><strong className="text-terminal-text">统计数据（Statistics）</strong>让 AI 更容易理解和引用你的内容</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-green-400 mt-1">▸</span>
                      <span><strong className="text-terminal-text">权威性（Quotations）</strong>是 AI 判断信息可信度的关键因素</span>
                    </li>
                  </ul>
                </div>
                <div className="mt-6 p-4 bg-terminal-border/30 rounded-lg">
                  <p className="text-sm text-terminal-text-muted">
                    <strong className="text-green-400">我们的应用：</strong> Signal Score 本质上就是检测一个 Agent 是否具备这些&ldquo;容易被 AI 理解&rdquo;的特征。
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
                  <span className="text-green-400">Signal Score</span> = 
                </p>
                <p className="text-sm md:text-base text-terminal-text-muted">
                  <span className="text-blue-400">基础分(50)</span> + 
                  <span className="text-green-400"> 生命力(20)</span> + 
                  <span className="text-blue-400"> 影响力(10)</span> + 
                  <span className="text-purple-400"> 元数据(10)</span> + 
                  <span className="text-orange-400"> 自主性(0-10)</span>
                </p>
              </div>
              <p className="text-sm text-terminal-text-dim mt-4 text-center">
                满分 100 分，基础分确保所有收录的 Agent 都有一个合理的起点
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
                Signal Score 不仅仅是一个分数，它是你的 Agent 在 AI 时代的<strong className="text-terminal-text">可见度指数 (Visibility Index)</strong>。在 ChatGPT、Claude、Perplexity 等 AI 搜索引擎主导信息获取的时代，GEO 优化将成为每个 AI 产品的必修课。
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
                想要提升你的 Agent 的 Signal Score？
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
