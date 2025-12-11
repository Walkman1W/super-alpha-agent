'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Logo } from '@/components/ui/logo'

interface NavItem {
  label: string
  href: string
  external?: boolean
}

const navItems: NavItem[] = [
  { label: 'About', href: '/about' },
  { label: 'API', href: '/api-docs' },
  { label: 'GitHub', href: 'https://github.com/agent-signals', external: true },
]

function SiteHeader() {
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

  const toggleMobileMenu = useCallback(() => setIsMobileMenuOpen(prev => !prev), [])
  const closeMobileMenu = useCallback(() => setIsMobileMenuOpen(false), [])
  const isActive = (href: string) => pathname === href || pathname.startsWith(href + '/')

  return (
    <>
      <header className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
        isScrolled 
          ? 'bg-[#050505]/95 backdrop-blur-md border-b border-[#1F1F1F]' 
          : 'bg-transparent'
      )}>
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Left: Logo + Brand */}
            <Link href="/" className="flex items-center gap-3 group">
              <Logo size={32} className="text-white group-hover:scale-105 transition-transform" />
              <span className="text-lg font-bold text-white tracking-tight">
                SIGNALS
              </span>
            </Link>

            {/* Right: Navigation */}
            <nav className="hidden md:flex items-center gap-6">
              {navItems.map((item) => (
                item.external ? (
                  <a
                    key={item.href}
                    href={item.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm font-medium text-[#888] hover:text-white transition-colors flex items-center gap-1"
                  >
                    {item.label}
                    <span className="text-xs">↗</span>
                  </a>
                ) : (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      'text-sm font-medium transition-colors',
                      isActive(item.href) ? 'text-white' : 'text-[#888] hover:text-white'
                    )}
                  >
                    {item.label}
                  </Link>
                )
              ))}
              
              {/* Sign In Button */}
              <button className="px-4 py-2 text-sm font-medium text-white bg-transparent border border-[#333] rounded-lg hover:bg-[#111] hover:border-[#444] transition-all">
                Sign In
              </button>
            </nav>

            {/* Mobile Menu Button */}
            <button
              onClick={toggleMobileMenu}
              aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={isMobileMenuOpen}
              className="md:hidden w-10 h-10 flex items-center justify-center text-[#888] hover:text-white transition-colors"
            >
              <div className="relative w-5 h-4 flex flex-col justify-between">
                <span className={cn(
                  'block h-0.5 bg-current rounded transition-transform duration-200',
                  isMobileMenuOpen && 'translate-y-[7px] rotate-45'
                )} />
                <span className={cn(
                  'block h-0.5 bg-current rounded transition-opacity duration-200',
                  isMobileMenuOpen && 'opacity-0'
                )} />
                <span className={cn(
                  'block h-0.5 bg-current rounded transition-transform duration-200',
                  isMobileMenuOpen && '-translate-y-[7px] -rotate-45'
                )} />
              </div>
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      <div
        className={cn(
          'md:hidden fixed inset-0 z-40 bg-black/60 backdrop-blur-sm transition-opacity duration-300',
          isMobileMenuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        )}
        onClick={closeMobileMenu}
        aria-hidden="true"
      />

      {/* Mobile Menu Panel */}
      <aside
        className={cn(
          'md:hidden fixed top-0 right-0 z-40 w-[80vw] max-w-xs h-full bg-[#0A0A0A] border-l border-[#1F1F1F] transition-transform duration-300 ease-out',
          isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
        )}
        aria-label="Navigation menu"
      >
        <div className="p-6 pt-20 space-y-2">
          {navItems.map((item) => (
            item.external ? (
              <a
                key={item.href}
                href={item.href}
                target="_blank"
                rel="noopener noreferrer"
                onClick={closeMobileMenu}
                className="flex items-center gap-2 px-4 py-3 rounded-lg text-sm font-medium text-[#888] hover:text-white hover:bg-[#1F1F1F] transition-colors"
              >
                {item.label}
                <span className="text-xs">↗</span>
              </a>
            ) : (
              <Link
                key={item.href}
                href={item.href}
                onClick={closeMobileMenu}
                className={cn(
                  'block px-4 py-3 rounded-lg text-sm font-medium transition-colors',
                  isActive(item.href)
                    ? 'text-white bg-[#1F1F1F]'
                    : 'text-[#888] hover:text-white hover:bg-[#1F1F1F]'
                )}
              >
                {item.label}
              </Link>
            )
          ))}
          
          <div className="pt-4 border-t border-[#1F1F1F]">
            <button className="w-full px-4 py-3 text-sm font-medium text-white bg-transparent border border-[#333] rounded-lg hover:bg-[#111] transition-all">
              Sign In
            </button>
          </div>
        </div>
      </aside>
    </>
  )
}

export default SiteHeader
