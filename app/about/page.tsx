import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowLeft, ExternalLink, BookOpen, Cpu, Users, Zap, Brain, Network } from 'lucide-react'

export const metadata: Metadata = {
  title: 'AI 自主性分级框架 L1-L5 | Agent Signals',
  description: '了解 AgentSignals 标准：基于 SAE J3016 和 DeepMind AGI 研究的 AI 智能体自主性 L1-L5 分级框架。',
  openGraph: {
    title: 'AI 自主性分级框架 L1-L5 | Agent Signals',
    description: '了解 AgentSignals 标准：基于 SAE J3016 和 DeepMind AGI 研究的 AI 智能体自主性 L1-L5 分级框架。',
    type: 'article',
  },
}

const autonomyLevels = [
  {
    level: 'L1',
    label: 'Assisted (辅助型)',
    icon: Cpu,
    color: 'from-blue-500 to-blue-400',
    bgColor: 'bg-blue-500/10',
    borderColor: 'border-blue-500/30',
    definition: 'AI 作为工具，完全依赖人类的 Prompt 触发。',
    industryRef: 'DeepMind "Emerging"; SAE L1 (脚不离踏板)',
    examples: ['ChatGPT 网页版', 'Midjourney', 'DALL-E'],
    characteristics: ['单次交互', '无记忆', '人类主导'],
  },
  {
    level: 'L2',
    label: 'Copilot (副驾驶型)',
    icon: Users,
    color: 'from-green-500 to-green-400',
    bgColor: 'bg-green-500/10',
    borderColor: 'border-green-500/30',
    definition: 'AI 主动提供建议，人类拥有最终否决权（Human-in-the-loop）。',
    industryRef: 'Microsoft "Copilot Stack"',
    examples: ['GitHub Copilot', 'Notion AI', 'Cursor'],
    characteristics: ['上下文感知', '建议驱动', '人类决策'],
  },
  {
    level: 'L3',
    label: 'Chained (链式工作流)',
    icon: Zap,
    color: 'from-yellow-500 to-yellow-400',
    bgColor: 'bg-yellow-500/10',
    borderColor: 'border-yellow-500/30',
    definition: 'AI 可以拆解任务，在一个限定的线性流程中自动执行多步操作。',
    industryRef: 'LangChain "Chains"',
    examples: ['BabyAGI (早期版本)', 'Zapier AI Actions', 'Make.com'],
    characteristics: ['多步执行', '线性流程', '预定义路径'],
  },
  {
    level: 'L4',
    label: 'Autonomous (自主闭环)',
    icon: Brain,
    color: 'from-orange-500 to-orange-400',
    bgColor: 'bg-orange-500/10',
    borderColor: 'border-orange-500/30',
    definition: 'AI 具备自我反思（Reflection）、纠错、利用工具的能力，可以处理非线性任务。人类只看结果。',
    industryRef: 'Andrew Ng "Agentic Workflow"; SAE L4 (特定场景无人驾驶)',
    examples: ['Devin', 'AutoGPT', 'OpenInterpreter', 'Manus'],
    characteristics: ['自我纠错', '工具使用', '目标导向'],
  },
  {
    level: 'L5',
    label: 'Swarm (蜂群/组织级)',
    icon: Network,
    color: 'from-purple-500 to-purple-400',
    bgColor: 'bg-purple-500/10',
    borderColor: 'border-purple-500/30',
    definition: '多智能体协作（Multi-Agent Collaboration），具备类似公司的组织架构（经理、员工、质检）。',
    industryRef: 'OpenAI "Multi-Agent Systems"; MetaGPT 论文',
    examples: ['MetaGPT', 'ChatDev', 'CrewAI'],
    characteristics: ['多智能体', '角色分工', '协作决策'],
  },
]

const citations = [
  {
    id: 1,
    source: 'SAE J3016',
    title: 'Taxonomy and Definitions for Terms Related to Driving Automation Systems',
    url: 'https://www.sae.org/standards/content/j3016_202104/',
  },
  {
    id: 2,
    source: 'Google DeepMind',
    title: 'Levels of AGI: Operationalizing Progress on the Path to AGI',
    url: 'https://arxiv.org/abs/2311.02462',
    date: 'Nov 2023',
  },
  {
    id: 3,
    source: 'Andrew Ng',
    title: 'Agentic Design Patterns',
    url: 'https://www.deeplearning.ai/the-batch/how-agents-can-improve-llm-performance/',
  },
  {
    id: 4,
    source: 'Microsoft',
    title: 'Copilot Stack Architecture',
    url: 'https://learn.microsoft.com/en-us/semantic-kernel/overview/',
  },
]

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-terminal-bg">
      {/* Hero Section */}
      <section className="relative py-16 md:py-24 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-purple-900/20 via-transparent to-transparent" />
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
              <BookOpen className="w-8 h-8 text-purple-400" />
              <span className="font-mono text-purple-400 text-sm">WHITEPAPER</span>
            </div>
            <h1 className="text-3xl md:text-5xl font-bold text-terminal-text mb-6 leading-tight">
              AgentSignals 标准：
              <br />
              <span className="bg-gradient-to-r from-purple-400 to-purple-300 bg-clip-text text-transparent">
                AI 智能体自主性的 L1-L5 分级框架
              </span>
            </h1>
            <p className="text-lg text-terminal-text-muted max-w-2xl">
              The AgentSignals Standard: The L1-L5 Framework for AI Autonomy
            </p>
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="py-12 md:py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto space-y-16">
            
            {/* Introduction */}
            <div className="prose prose-invert max-w-none">
              <div className="bg-terminal-surface border border-terminal-border rounded-xl p-6 md:p-8">
                <h2 className="text-2xl font-bold text-terminal-text mb-4 flex items-center gap-3">
                  <span className="text-purple-400 font-mono">01</span>
                  行业共识与权威引用
                </h2>
                <p className="text-terminal-text-muted leading-relaxed mb-4">
                  目前行业内最权威的两个参考系是：
                </p>
                <ul className="space-y-3 text-terminal-text-muted">
                  <li className="flex items-start gap-3">
                    <span className="text-purple-400 mt-1">▸</span>
                    <span><strong className="text-terminal-text">SAE J3016（自动驾驶分级）</strong>：这是所有分级的鼻祖（L0-L5），已成为全球自动驾驶行业的通用语言。</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-purple-400 mt-1">▸</span>
                    <span><strong className="text-terminal-text">Google DeepMind 的《Levels of AGI》论文 (Nov 2023)</strong>：DeepMind 将 AI 分为 "Emerging" (L1) 到 "Superhuman" (L5)。</span>
                  </li>
                </ul>
                <div className="mt-6 p-4 bg-purple-500/10 border border-purple-500/30 rounded-lg">
                  <p className="text-sm text-terminal-text-muted">
                    <strong className="text-purple-400">我们的差异化：</strong> DeepMind 侧重"智商（能力）"，我们侧重"<strong className="text-terminal-text">架构（结构）</strong>"。AgentSignals 参考了 SAE 的结构化定义与 DeepMind 的能力评估，提出了针对 B2B 工程落地的 <strong className="text-terminal-text">AAS (Agent Autonomy Standard)</strong>。
                  </p>
                </div>
              </div>
            </div>

            {/* Autonomy Levels */}
            <div>
              <h2 className="text-2xl font-bold text-terminal-text mb-8 flex items-center gap-3">
                <span className="text-purple-400 font-mono">02</span>
                自主性分级定义
              </h2>
              <div className="space-y-6">
                {autonomyLevels.map((level) => {
                  const Icon = level.icon
                  return (
                    <div 
                      key={level.level}
                      className={`bg-terminal-surface border ${level.borderColor} rounded-xl p-6 md:p-8 transition-all hover:border-opacity-60`}
                    >
                      <div className="flex flex-col md:flex-row md:items-start gap-6">
                        <div className={`w-16 h-16 rounded-xl ${level.bgColor} flex items-center justify-center flex-shrink-0`}>
                          <Icon className={`w-8 h-8 bg-gradient-to-r ${level.color} bg-clip-text`} style={{ color: level.color.includes('purple') ? '#a855f7' : level.color.includes('orange') ? '#f97316' : level.color.includes('yellow') ? '#eab308' : level.color.includes('green') ? '#22c55e' : '#3b82f6' }} />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-3">
                            <span className={`font-mono font-bold text-2xl bg-gradient-to-r ${level.color} bg-clip-text text-transparent`}>
                              {level.level}
                            </span>
                            <h3 className="text-xl font-bold text-terminal-text">{level.label}</h3>
                          </div>
                          <p className="text-terminal-text-muted mb-4">{level.definition}</p>
                          <div className="grid md:grid-cols-2 gap-4">
                            <div>
                              <p className="text-xs font-mono text-terminal-text-dim mb-2">行业对标</p>
                              <p className="text-sm text-terminal-text-muted">{level.industryRef}</p>
                            </div>
                            <div>
                              <p className="text-xs font-mono text-terminal-text-dim mb-2">典型案例</p>
                              <div className="flex flex-wrap gap-2">
                                {level.examples.map((example) => (
                                  <span key={example} className="px-2 py-1 bg-terminal-border/50 rounded text-xs text-terminal-text-muted">
                                    {example}
                                  </span>
                                ))}
                              </div>
                            </div>
                          </div>
                          <div className="mt-4 flex flex-wrap gap-2">
                            {level.characteristics.map((char) => (
                              <span key={char} className={`px-3 py-1 ${level.bgColor} rounded-full text-xs font-mono`}>
                                {char}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Conclusion */}
            <div className="bg-gradient-to-r from-purple-900/30 to-purple-800/20 border border-purple-500/30 rounded-xl p-6 md:p-8">
              <h2 className="text-2xl font-bold text-terminal-text mb-4 flex items-center gap-3">
                <span className="text-purple-400 font-mono">03</span>
                结论
              </h2>
              <p className="text-lg text-terminal-text-muted leading-relaxed">
                在 AgentSignals，我们不仅仅收录工具，我们为企业评估"<strong className="text-terminal-text">这位 AI 员工</strong>"的独立工作能力。通过 L1-L5 分级框架，开发者和企业可以快速判断一个 AI Agent 的技术架构和适用场景。
              </p>
            </div>

            {/* Citations */}
            <div>
              <h2 className="text-2xl font-bold text-terminal-text mb-6 flex items-center gap-3">
                <span className="text-purple-400 font-mono">04</span>
                参考文献
              </h2>
              <div className="space-y-3">
                {citations.map((citation) => (
                  <a
                    key={citation.id}
                    href={citation.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-start gap-4 p-4 bg-terminal-surface border border-terminal-border rounded-lg hover:border-terminal-border-hover transition-colors group"
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

          </div>
        </div>
      </section>
    </div>
  )
}
