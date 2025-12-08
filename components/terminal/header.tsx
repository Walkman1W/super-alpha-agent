'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Logo } from '@/components/ui/logo'

interface NavItem {
  label: string
  href: string
  highlight?: boolean
  external?: boolean
}

const navItems: NavItem[] = [
  { label: 'Agents', href: '/#agents' },
  { label: 'About', href: '/about' },
  { label: 'Blog', href: '/blog' },
  { label: 'Publish', href: '/publish', highlight: true },
  { label: 'GitHub', href: 'https://github.com/yourusername/super-alpha-agent', external: true },
]

// 提取到组件外部，避免每次渲染重新创建
const GitHubIcon = () => (
  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
  </svg>
)

function Header() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10)
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    document.body.style.overflow = isMobileMenuOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [isMobileMenuOpen])

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsMobileMenuOpen(false)
    }
    window.addEventListener('keydown', handleEsc)
    return () => window.removeEventListener('keydown', handleEsc)
  }, [])

  const toggleMobileMenu = useCallback(() => setIsMobileMenuOpen(prev => !prev), [])
  const closeMobileMenu = useCallback(() => setIsMobileMenuOpen(false), [])
  const isActive = (href: string) => href === '/#agents' ? pathname === '/' : pathname === href || pathname.startsWith(href + '/')

  return (
    <>
      <header className={cn(
        'sticky top-0 z-50 transition-all duration-300 border-b border-terminal-border',
        isScrolled ? 'bg-terminal-surface/95 backdrop-blur-md shadow-lg shadow-black/20' : 'bg-terminal-surface/80 backdrop-blur-sm'
      )}>
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-3 group">
              <Logo size={40} className="text-terminal-text group-hover:scale-110 transition-transform" />
              <span className="text-xl font-bold text-terminal-text">
                <span className="text-[#00C853]">A</span>gent <span className="text-[#00C853]">S</span>ignals
              </span>
            </Link>

            <nav className="hidden md:flex items-center gap-1">
              {navItems.map((item) => item.external ? (
                <a key={item.href} href={item.href} target="_blank" rel="noopener noreferrer"
                  className="px-4 py-2 rounded-lg font-mono text-sm transition-all duration-200 text-terminal-text-muted hover:text-terminal-text hover:bg-terminal-border/50 flex items-center gap-2">
                  <GitHubIcon />
                  <span>{item.label}</span>
                </a>
              ) : (
                <Link key={item.href} href={item.href}
                  className={cn('px-4 py-2 rounded-lg font-mono text-sm transition-all duration-200',
                    item.highlight ? 'bg-gradient-to-r from-purple-600 to-purple-500 text-white hover:from-purple-500 hover:to-purple-400 shadow-lg shadow-purple-500/25'
                    : isActive(item.href) ? 'text-terminal-accent bg-terminal-accent/10' : 'text-terminal-text-muted hover:text-terminal-text hover:bg-terminal-border/50'
                  )}>{item.label}</Link>
              ))}
            </nav>

            <button onClick={toggleMobileMenu} aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'} aria-expanded={isMobileMenuOpen}
              className="md:hidden w-10 h-10 flex items-center justify-center bg-terminal-surface border border-terminal-border rounded-lg text-terminal-text-muted hover:text-terminal-text hover:border-terminal-border-hover transition-colors">
              <div className="relative w-5 h-4 flex flex-col justify-between">
                <span className={cn('block h-0.5 bg-current rounded transition-transform duration-200', isMobileMenuOpen && 'translate-y-[7px] rotate-45')} />
                <span className={cn('block h-0.5 bg-current rounded transition-opacity duration-200', isMobileMenuOpen && 'opacity-0')} />
                <span className={cn('block h-0.5 bg-current rounded transition-transform duration-200', isMobileMenuOpen && '-translate-y-[7px] -rotate-45')} />
              </div>
            </button>
          </div>
        </div>
      </header>


      <div className={cn('md:hidden fixed inset-0 z-40 bg-black/60 backdrop-blur-sm transition-opacity duration-300', isMobileMenuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none')} onClick={closeMobileMenu} aria-hidden="true" />

      <aside className={cn('md:hidden fixed top-0 right-0 z-40 w-[80vw] max-w-xs h-full bg-terminal-surface/98 backdrop-blur-md border-l border-terminal-border transition-transform duration-300 ease-out', isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full')} aria-label="Navigation menu">
        <div className="p-6 pt-20 space-y-2">
          {navItems.map((item) => item.external ? (
            <a key={item.href} href={item.href} target="_blank" rel="noopener noreferrer" onClick={closeMobileMenu}
              className="flex items-center gap-3 px-4 py-3 rounded-lg font-mono text-sm text-terminal-text-muted hover:text-terminal-text hover:bg-terminal-border/50 transition-colors">
              <GitHubIcon />
              <span>{item.label}</span>
            </a>
          ) : (
            <Link key={item.href} href={item.href} onClick={closeMobileMenu}
              className={cn('block px-4 py-3 rounded-lg font-mono text-sm transition-colors',
                item.highlight ? 'bg-gradient-to-r from-purple-600 to-purple-500 text-white text-center'
                : isActive(item.href) ? 'text-terminal-accent bg-terminal-accent/10' : 'text-terminal-text-muted hover:text-terminal-text hover:bg-terminal-border/50'
              )}>{item.label}</Link>
          ))}
        </div>
      </aside>
    </>
  )
}

export default Header
