import type { Metadata } from 'next'
import { Inter, JetBrains_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'
import './performance.css'
import { ToastProvider } from '@/components/toast-provider'

const inter = Inter({ 
  subsets: ['latin'],
  display: 'swap',
  preload: true,
  variable: '--font-inter',
  fallback: ['system-ui', 'arial'],
})

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  display: 'swap',
  preload: true,
  variable: '--font-mono',
  fallback: ['Fira Code', 'Consolas', 'monospace'],
})

export const metadata: Metadata = {
  title: 'Agent Signals | Index the Intelligence Economy',
  description: 'The CoinMarketCap for AI Agents. Discover, scan, and connect with AI agents using Signal Rank (SR) visibility scores.',
  keywords: [
    'AI Agent',
    'Signal Rank',
    'MCP',
    'JSON-LD',
    'AI Tools',
    'Agent Discovery',
    'AI Search',
    'Agent Signals'
  ],
  authors: [{ name: 'Agent Signals' }],
  creator: 'Agent Signals',
  publisher: 'Agent Signals',
  openGraph: {
    title: 'Agent Signals | Index the Intelligence Economy',
    description: 'The CoinMarketCap for AI Agents. Discover and connect with verified AI agents.',
    type: 'website',
    locale: 'en_US',
    url: 'https://agentsignals.ai',
    images: [{
      url: 'https://agentsignals.ai/og-image.png',
      width: 1200,
      height: 630,
      alt: 'Agent Signals - Index the Intelligence Economy',
    }],
    siteName: 'Agent Signals',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Agent Signals | Index the Intelligence Economy',
    description: 'The CoinMarketCap for AI Agents. Discover and connect with verified AI agents.',
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
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${inter.variable} ${jetbrainsMono.variable}`} suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {process.env.NEXT_PUBLIC_SUPABASE_URL && (
          <link rel="preconnect" href={process.env.NEXT_PUBLIC_SUPABASE_URL} />
        )}
      </head>
      <body className={`${inter.className} min-h-screen antialiased`} style={{ backgroundColor: '#050505', color: '#ffffff' }}>
        <ToastProvider>
          {children}
        </ToastProvider>
        <Analytics />
      </body>
    </html>
  )
}
