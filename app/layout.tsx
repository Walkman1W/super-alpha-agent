import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'
import './performance.css'
import { ToastProvider } from '@/components/toast-provider'

// 优化字体加载：使用 display: 'swap' 避免阻塞渲染
// 预加载字体以减少 CLS
const inter = Inter({ 
  subsets: ['latin'],
  display: 'swap', // 立即显示后备字体，字体加载完成后切换
  preload: true, // 预加载字体文件
  variable: '--font-inter', // CSS 变量
  fallback: ['system-ui', 'arial'], // 后备字体
})

export const metadata: Metadata = {
  title: 'Super Alpha Agent - 发现最强大的 AI Agents | AI 智能助手整合平台',
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
    'AI 应用'
  ],
  authors: [{ name: 'Super Alpha Agent' }],
  creator: 'Super Alpha Agent',
  publisher: 'Super Alpha Agent',
  openGraph: {
    title: 'Super Alpha Agent - 发现最强大的 AI Agents',
    description: '精选 100+ AI 智能助手，深度分析 · 实时更新 · 为 AI 搜索优化',
    type: 'website',
    locale: 'zh_CN',
    url: 'https://www.superalphaagent.com',
    images: [{
      url: 'https://www.superalphaagent.com/og-image.png',
      width: 1200,
      height: 630,
      alt: 'Super Alpha Agent - 发现最强大的 AI Agents',
    }],
    siteName: 'Super Alpha Agent',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Super Alpha Agent - 发现最强大的 AI Agents',
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
    <html lang="zh-CN">
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
      <body className={inter.className}>
        <ToastProvider>
        <nav className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50 shadow-sm">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <a href="/" className="flex items-center gap-3 group">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold text-xl group-hover:scale-110 transition-transform">
                  S
                </div>
                <div>
                  <div className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                    Super Alpha Agent
                  </div>
                  <div className="text-xs text-gray-500">
                    AI Agent 发现平台
                  </div>
                </div>
              </a>
              <div className="flex gap-6 items-center">
                <a href="/#agents" className="text-gray-700 hover:text-blue-600 font-medium transition-colors">
                  Agents
                </a>
                <a 
                  href="https://github.com/yourusername/super-alpha-agent" 
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-700 hover:text-blue-600 font-medium transition-colors flex items-center gap-1"
                >
                  <span>🐱</span>
                  <span className="hidden sm:inline">GitHub</span>
                </a>
              </div>
            </div>
          </div>
        </nav>
        <main>{children}</main>
        <footer className="bg-gray-900 text-white mt-20">
          <div className="container mx-auto px-4 py-12">
            <div className="grid md:grid-cols-3 gap-8 mb-8">
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center font-bold">
                    S
                  </div>
                  <span className="font-bold text-lg">Super Alpha Agent</span>
                </div>
                <p className="text-gray-400 text-sm leading-relaxed">
                  专为 AI 搜索引擎优化的 Agent 聚合平台。
                  发现、分析、对比最好的 AI Agents。
                </p>
              </div>
              
              <div>
                <h3 className="font-bold mb-4">关于</h3>
                <ul className="space-y-2 text-sm text-gray-400">
                  <li>🚀 AI 优先设计</li>
                  <li>⏱️ 每日自动更新</li>
                  <li>📊 深度分析对比</li>
                  <li>💯 完全免费使用</li>
                </ul>
              </div>
              
              <div>
                <h3 className="font-bold mb-4">技术栈</h3>
                <ul className="space-y-2 text-sm text-gray-400">
                  <li>Next.js 14 + TypeScript</li>
                  <li>Supabase + PostgreSQL</li>
                  <li>OpenRouter AI</li>
                  <li>Playwright 抓取</li>
                </ul>
              </div>
            </div>
            
            <div className="border-t border-gray-800 pt-8 text-center text-sm text-gray-400">
              <p>© 2025 Super Alpha Agent. 面向 AI 搜索引擎优化 · 开源项目</p>
              <p className="mt-2">
                Built with ❤️ for the AI community
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
