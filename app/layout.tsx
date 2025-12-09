import type { Metadata } from 'next'
import { Inter, JetBrains_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'
import './performance.css'
import { ToastProvider } from '@/components/toast-provider'
import Header from '@/components/terminal/header'
import Footer from '@/components/terminal/footer'

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
    <html lang="zh-CN" className={`${inter.variable} ${jetbrainsMono.variable}`} suppressHydrationWarning>
      <head>
        {/* 预连接到关键域名以减少 DNS 查询和连接时间 */}
        <link rel="preconnect" href="https://fonts.googleapis.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {process.env.NEXT_PUBLIC_SUPABASE_URL && (
          <link rel="preconnect" href={process.env.NEXT_PUBLIC_SUPABASE_URL} />
        )}
        {/* DNS 预取 - 非 Google 域名 */}
      </head>
      <body className={`${inter.className} terminal-theme bg-terminal-bg min-h-screen`}>
        <ToastProvider>
          <Header />
          <main>{children}</main>
          <Footer />
        </ToastProvider>
        <Analytics />
      </body>
    </html>
  )
}
