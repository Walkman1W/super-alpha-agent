import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  metadataBase: new URL('https://superalphaagent.com'),
  title: {
    default: 'Super Alpha Agent - 发现最强大的 AI Agents | AI 智能助手聚合平台',
    template: '%s | Super Alpha Agent'
  },
  description: '精选 100+ AI Agents，深度分析功能、优缺点和使用场景。专为 AI 搜索引擎优化，帮助你快速找到最适合的 AI 智能助手。每日自动更新，完全免费。',
  keywords: [
    'AI Agent', 'AI 智能助手', 'GPT Store', 'ChatGPT Agent', 'Claude Agent', 
    'AI 工具', 'Agent 对比', 'AI 搜索', '智能助手推荐', 'AI 应用'
  ],
  authors: [{ name: 'Super Alpha Agent Team' }],
  creator: 'Super Alpha Agent',
  publisher: 'Super Alpha Agent',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    title: 'Super Alpha Agent - 发现最强大的 AI Agents',
    description: '精选 100+ AI 智能助手，深度分析、实时更新、为 AI 搜索优化',
    type: 'website',
    locale: 'zh_CN',
    url: 'https://superalphaagent.com',
    siteName: 'Super Alpha Agent',
    images: [{
      url: '/og-image.png',
      width: 1200,
      height: 630,
      alt: 'Super Alpha Agent - 发现最强大的 AI Agents',
    }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Super Alpha Agent - 发现最强大的 AI Agents',
    description: '精选 100+ AI 智能助手，深度分析、实时更新',
    images: ['/og-image.png'],
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
    // google: 'your-verification-code',
  },
  alternates: {
    canonical: 'https://superalphaagent.com',
  },
  other: {
    'application-name': 'Super Alpha Agent',
    'apple-mobile-web-app-title': 'Super Alpha Agent',
    'apple-mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-status-bar-style': 'black-translucent',
  }
}


export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-CN">
      <body className={inter.className}>
        <nav className="bg-black/20 backdrop-blur-md border-b border-white/10 sticky top-0 z-50">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <a href="/" className="flex items-center gap-3 group">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-500 rounded-xl flex items-center justify-center text-white font-bold text-xl group-hover:scale-110 transition-transform shadow-lg shadow-purple-500/25">
                  SA
                </div>
                <div>
                  <div className="text-xl font-bold text-white group-hover:text-purple-300 transition-colors">
                    Super Alpha Agent
                  </div>
                  <div className="text-xs text-gray-400">
                    AI Agent 发现平台
                  </div>
                </div>
              </a>
              <div className="flex gap-6 items-center">
                <a href="/market" className="text-white hover:text-purple-300 font-medium transition-colors px-4 py-2 rounded-lg hover:bg-white/10">
                  Agent市场
                </a>
                <a href="/hero" className="text-white hover:text-purple-300 font-medium transition-colors px-4 py-2 rounded-lg hover:bg-white/10">
                  首页
                </a>
                <a href="/submit" className="bg-gradient-to-r from-purple-600 to-blue-600 text-white font-medium transition-all px-4 py-2 rounded-lg hover:from-purple-700 hover:to-blue-700 shadow-lg shadow-purple-500/25">
                  发布Agent
                </a>
                <a 
                  href="https://github.com/yourusername/super-alpha-agent" 
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white hover:text-purple-300 font-medium transition-colors flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-white/10"
                >
                  <span className="text-yellow-400">⭐</span>
                  <span className="hidden sm:inline">GitHub</span>
                </a>
              </div>
            </div>
          </div>
        </nav>
        <main>{children}</main>
        <footer className="bg-gradient-to-br from-slate-900 via-blue-900 to-purple-900 text-white mt-20">
          <div className="container mx-auto px-4 py-12">
            <div className="grid md:grid-cols-3 gap-8 mb-8">
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-blue-500 rounded-lg flex items-center justify-center font-bold shadow-lg shadow-purple-500/25">
                    SA
                  </div>
                  <span className="font-bold text-lg">Super Alpha Agent</span>
                </div>
                <p className="text-gray-300 text-sm leading-relaxed">
                  专为 AI 搜索引擎优化的 Agent 聚合平台。
                  发现、分析、对比最好的 AI Agents。
                </p>
              </div>
              
              <div>
                <h3 className="font-bold mb-4 text-purple-300">关于</h3>
                <ul className="space-y-2 text-sm text-gray-300">
                  <li className="flex items-center gap-2"><span>🤖</span> AI 优先设计</li>
                  <li className="flex items-center gap-2"><span>🔄</span> 每日自动更新</li>
                  <li className="flex items-center gap-2"><span>📊</span> 深度分析对比</li>
                  <li className="flex items-center gap-2"><span>💯</span> 完全免费使用</li>
                </ul>
              </div>
              
              <div>
                <h3 className="font-bold mb-4 text-purple-300">技术栈</h3>
                <ul className="space-y-2 text-sm text-gray-300">
                  <li>Next.js 14 + TypeScript</li>
                  <li>Supabase + PostgreSQL</li>
                  <li>OpenRouter AI</li>
                  <li>Playwright 爬虫</li>
                </ul>
              </div>
            </div>
            
            <div className="border-t border-white/20 pt-8 text-center text-sm text-gray-300">
              <p>© 2025 Super Alpha Agent. 为 AI 搜索引擎优化 · 开源项目</p>
              <p className="mt-2">
                Built with <span className="text-red-400">❤️</span> for the AI community
              </p>
            </div>
          </div>
        </footer>
      </body>
    </html>
  )
}
