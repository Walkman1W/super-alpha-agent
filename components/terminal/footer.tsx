import Link from 'next/link'

/**
 * Footer 组件
 * 简洁专业的页脚，包含品牌信息、导航链接和技术栈
 * 
 * **Validates: Requirements 3.1, 3.2, 3.3, 3.4, 3.5**
 */
export function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-terminal-surface border-t border-terminal-border mt-20">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* 品牌区域 */}
          <div className="md:col-span-2">
            <Link href="/" className="flex items-center gap-3 group mb-4">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-600 to-purple-400 rounded-lg blur-sm opacity-50 group-hover:opacity-75 transition-opacity" />
                <div className="relative w-9 h-9 bg-gradient-to-br from-purple-600 via-purple-500 to-purple-400 rounded-lg flex items-center justify-center font-bold text-white shadow-lg">
                  A
                </div>
              </div>
              <span className="font-bold text-lg text-terminal-text group-hover:text-terminal-accent transition-colors">
                Agent Signals
              </span>
            </Link>
            <p className="text-terminal-text-muted text-sm leading-relaxed mb-4 max-w-md">
              The GEO Engine for AI Agents. 专为 AI 搜索引擎优化的 Agent 发现平台，
              帮助你发现、分析、对比最优秀的 AI Agents。
            </p>
            <div className="flex items-center gap-4">
              <a
                href="https://github.com/yourusername/super-alpha-agent"
                target="_blank"
                rel="noopener noreferrer"
                className="text-terminal-text-dim hover:text-terminal-accent transition-colors"
                aria-label="GitHub"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                </svg>
              </a>
            </div>
          </div>


          {/* 链接区域 */}
          <div>
            <h3 className="font-bold mb-4 text-terminal-text text-sm uppercase tracking-wider font-mono">
              导航
            </h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link 
                  href="/#agents" 
                  className="text-terminal-text-muted hover:text-terminal-accent transition-colors font-mono"
                >
                  Agents
                </Link>
              </li>
              <li>
                <Link 
                  href="/about" 
                  className="text-terminal-text-muted hover:text-terminal-accent transition-colors font-mono"
                >
                  About
                </Link>
              </li>
              <li>
                <Link 
                  href="/blog" 
                  className="text-terminal-text-muted hover:text-terminal-accent transition-colors font-mono"
                >
                  Blog
                </Link>
              </li>
              <li>
                <Link 
                  href="/publish" 
                  className="text-terminal-text-muted hover:text-terminal-accent transition-colors font-mono"
                >
                  Publish Agent
                </Link>
              </li>
            </ul>
          </div>

          {/* 技术栈区域 */}
          <div>
            <h3 className="font-bold mb-4 text-terminal-text text-sm uppercase tracking-wider font-mono">
              技术栈
            </h3>
            <ul className="space-y-2 text-sm text-terminal-text-dim font-mono">
              <li className="flex items-center gap-2">
                <span className="text-terminal-accent">▸</span>
                Next.js 14
              </li>
              <li className="flex items-center gap-2">
                <span className="text-terminal-accent">▸</span>
                TypeScript
              </li>
              <li className="flex items-center gap-2">
                <span className="text-terminal-accent">▸</span>
                Supabase
              </li>
              <li className="flex items-center gap-2">
                <span className="text-terminal-accent">▸</span>
                OpenRouter AI
              </li>
            </ul>
          </div>
        </div>

        {/* 底部版权区域 */}
        <div className="border-t border-terminal-border pt-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-terminal-text-dim font-mono">
              © {currentYear} Agent Signals. 面向 AI 搜索引擎优化 · 开源项目
            </p>
            <p className="text-sm text-terminal-text-dim">
              Built with <span className="text-terminal-accent">❤️</span> for the AI community
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
