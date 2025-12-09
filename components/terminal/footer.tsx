import Link from 'next/link'
import { Logo } from '@/components/ui/logo'

/**
 * 简洁单行 Footer
 */
export function Footer() {
  return (
    <footer className="bg-zinc-900/50 border-t border-zinc-800 py-4">
      <div className="container mx-auto px-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          {/* Logo + 名称 */}
          <Link href="/" className="flex items-center gap-2 group">
            <Logo size={28} className="text-zinc-300" />
            <span className="font-semibold text-sm text-zinc-300">
              <span className="text-[#00C853]">A</span>gent <span className="text-[#00C853]">S</span>ignals
            </span>
          </Link>

          {/* 导航链接 */}
          <nav className="flex items-center gap-4 text-xs font-mono">
            <Link href="/#agents" className="text-zinc-500 hover:text-purple-400 transition-colors">
              Agents
            </Link>
            <Link href="/about" className="text-zinc-500 hover:text-purple-400 transition-colors">
              About
            </Link>
            <Link href="/blog" className="text-zinc-500 hover:text-purple-400 transition-colors">
              Blog
            </Link>
            <Link href="/publish" className="text-zinc-500 hover:text-purple-400 transition-colors">
              Publish
            </Link>
            <a
              href="https://github.com/yourusername/super-alpha-agent"
              target="_blank"
              rel="noopener noreferrer"
              className="text-zinc-500 hover:text-purple-400 transition-colors"
            >
              GitHub
            </a>
          </nav>

          {/* 版权 */}
          <span className="text-xs text-zinc-600 font-mono">
            © {new Date().getFullYear()}
          </span>
        </div>
      </div>
    </footer>
  )
}

export default Footer
