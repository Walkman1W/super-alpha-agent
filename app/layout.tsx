import type { Metadata } from 'next'
import { Inter, JetBrains_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'
import './performance.css'
import { ToastProvider } from '@/components/toast-provider'

// 优化字体加载：使用 display: 'swap' 避免阻塞渲染
// 预加载字体以减少 CLS
const inter = Inter({ 
  subsets: ['latin'],
  display: 'swap',
  preload: true,
  variable: '--font-inter',
  fallback: ['system-ui', 'arial'],
})

// JetBrains Mono 等宽字体 - Terminal 主题核心字体
const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  display: 'swap',
  preload: true,
  variable: '--font-mono',
  fallback: ['Fira Code', 'Consolas', 'monospace'],
})

export const metadata: Metadata = {
  title: 'Agent Signals - The GEO Engine for AI Agents | AI 智能助手发现平台',
  description: '精选 100+ AI Agents，深度分析功能、优缺点与使用门槛。专为 AI 搜索引擎优化，每日自动更新，完全免费。',
  keywords: [
    'AI Agent',
    'AI 智能助手',
    'GPT Store',
    'ChatGPT Agent',
    'Claude Agent',
    'AI 工具',
    'Agent 对比',
    'AI 搜索',
    '智能助手推荐',
    'AI 应用',
    'GEO',
    'Agent Signals'
  ],
  authors: [{ name: 'Agent Signals' }],
  creator: 'Agent Signals',
  publisher: 'Agent Signals',
  openGraph: {
    title: 'Agent Signals - The GEO Engine for AI Agents',
    description: '精选 100+ AI 智能助手，深度分析 · 实时更新 · 为 AI 搜索优化',
    type: 'website',
    locale: 'zh_CN',
    url: 'https://agentsignals.ai',
    images: [{
      url: 'https://agentsignals.ai/og-image.png',
      width: 1200,
      height: 630,
      alt: 'Agent Signals - The GEO Engine for AI Agents',
    }],
    siteName: 'Agent Signals',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Agent Signals - The GEO Engine for AI Agents',
    description: '精选 100+ AI 智能助手，深度分析 · 实时更新 · AI 搜索优化',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    // 添加你的 Google Search Console 验证码
    // google: 'your-verification-code',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-CN" className={`${inter.variable} ${jetbrainsMono.variable}`}>
      <head>
        {/* 预连接到关键域名以减少 DNS 查询和连接时间 */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {process.env.NEXT_PUBLIC_SUPABASE_URL && (
          <link rel="preconnect" href={process.env.NEXT_PUBLIC_SUPABASE_URL} />
        )}
        {/* DNS 预取 */}
        <link rel="dns-prefetch" href="https://fonts.googleapis.com" />
        <link rel="dns-prefetch" href="https://fonts.gstatic.com" />
      </head>
      <body className={`${inter.className} terminal-theme bg-terminal-bg min-h-screen`}>
        <ToastProvider>
        <nav className="bg-terminal-surface/80 backdrop-blur-md border-b border-terminal-border sticky top-0 z-50">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <a href="/" className="flex items-center gap-3 group">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-purple-400 rounded-xl flex items-center justify-center text-white font-bold text-xl group-hover:scale-110 transition-transform shadow-terminal-glow">
                  A
                </div>
                <div>
                  <div className="text-xl font-bold text-terminal-text group-hover:text-terminal-accent transition-colors">
                    Agent Signals
                  </div>
                  <div className="text-xs text-terminal-text-dim font-mono">
                    The GEO Engine for AI Agents
                  </div>
                </div>
              </a>
              <div className="flex gap-6 items-center">
                <a href="/#agents" className="text-terminal-text-muted hover:text-terminal-accent font-medium transition-colors font-mono text-sm">
                  Agents
                </a>
                <a 
                  href="https://github.com/yourusername/super-alpha-agent" 
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-terminal-text-muted hover:text-terminal-accent font-medium transition-colors flex items-center gap-1 font-mono text-sm"
                >
                  <span>🐱</span>
                  <span className="hidden sm:inline">GitHub</span>
                </a>
              </div>
            </div>
          </div>
        </nav>
        <main>{children}</main>
        <footer className="bg-terminal-surface border-t border-terminal-border mt-20">
          <div className="container mx-auto px-4 py-12">
            <div className="grid md:grid-cols-3 gap-8 mb-8">
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 bg-gradient-to-br from-purple-600 to-purple-400 rounded-lg flex items-center justify-center font-bold text-white shadow-terminal-glow">
                    A
                  </div>
                  <span className="font-bold text-lg text-terminal-text">Agent Signals</span>
                </div>
                <p className="text-terminal-text-muted text-sm leading-relaxed">
                  专为 AI 搜索引擎优化的 Agent 聚合平台。
                  发现、分析、对比最好的 AI Agents。
                </p>
              </div>
              
              <div>
                <h3 className="font-bold mb-4 text-terminal-text">关于</h3>
                <ul className="space-y-2 text-sm text-terminal-text-muted font-mono">
                  <li>🚀 AI 优先设计</li>
                  <li>⏱️ 每日自动更新</li>
                  <li>📊 深度分析对比</li>
                  <li>💯 完全免费使用</li>
                </ul>
              </div>
              
              <div>
                <h3 className="font-bold mb-4 text-terminal-text">技术栈</h3>
                <ul className="space-y-2 text-sm text-terminal-text-muted font-mono">
                  <li>Next.js 14 + TypeScript</li>
                  <li>Supabase + PostgreSQL</li>
                  <li>OpenRouter AI</li>
                  <li>Playwright 抓取</li>
                </ul>
              </div>
            </div>
            
            <div className="border-t border-terminal-border pt-8 text-center text-sm text-terminal-text-dim">
              <p className="font-mono">© 2025 Agent Signals. 面向 AI 搜索引擎优化 · 开源项目</p>
              <p className="mt-2">
                Built with <span className="text-terminal-accent">❤️</span> for the AI community
              </p>
            </div>
          </div>
        </footer>
        </ToastProvider>
        <Analytics />
      </body>
    </html>
  )
}
