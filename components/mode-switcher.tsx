'use client'

import { useSearchParams, useRouter, usePathname } from 'next/navigation'
import { useCallback, useEffect, useRef } from 'react'
import { cn } from '@/lib/utils'

export type Mode = 'market' | 'publish'

interface ModeSwitcherProps {
  currentMode?: Mode
  onModeChange?: (mode: Mode) => void
  className?: string
}

/**
 * ModeSwitcher Component
 * Tab-style navigation for switching between Agent Market and Publish Agent modes
 * Uses URL search params for state management
 * 
 * Requirements: 2.1, 2.5
 */
export function ModeSwitcher({ 
  currentMode: controlledMode,
  onModeChange,
  className 
}: ModeSwitcherProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const previousModeRef = useRef<Mode | null>(null)
  
  // Get mode from URL or use controlled prop or default to 'market'
  const mode: Mode = controlledMode ?? (searchParams.get('mode') as Mode) ?? 'market'
  
  // Store previous mode for scroll position management
  useEffect(() => {
    previousModeRef.current = mode
  }, [mode])

  const handleModeChange = useCallback((newMode: Mode) => {
    if (newMode === mode) return
    
    // Store current scroll position before navigation
    const currentScrollY = window.scrollY
    
    // Create new URL with updated mode parameter
    const params = new URLSearchParams(searchParams.toString())
    params.set('mode', newMode)
    
    // Use router.push for client-side navigation (no page reload)
    router.push(`${pathname}?${params.toString()}`, { scroll: false })
    
    // Call external handler if provided
    onModeChange?.(newMode)
    
    // Manage scroll position based on context
    // If switching to publish mode, scroll to the publish section
    // If switching to market mode, scroll to the agents section
    requestAnimationFrame(() => {
      if (newMode === 'publish') {
        const publishSection = document.getElementById('publish')
        if (publishSection) {
          publishSection.scrollIntoView({ behavior: 'smooth' })
        }
      } else if (newMode === 'market') {
        const agentsSection = document.getElementById('agents')
        if (agentsSection) {
          agentsSection.scrollIntoView({ behavior: 'smooth' })
        }
      }
    })
  }, [mode, pathname, router, searchParams, onModeChange])

  const tabs = [
    { id: 'market' as Mode, label: 'Agent 市场', icon: '🏪', ariaLabel: '切换到Agent市场视图' },
    { id: 'publish' as Mode, label: '发布 Agent', icon: '✍️', ariaLabel: '切换到发布Agent视图' },
  ]

  return (
    <nav 
      className={cn(
        'inline-flex items-center gap-1 p-1 bg-white/20 backdrop-blur-sm rounded-xl border border-white/30',
        className
      )}
      role="tablist"
      aria-label="主导航"
    >
      {tabs.map((tab) => {
        const isActive = mode === tab.id
        
        return (
          <button
            key={tab.id}
            role="tab"
            aria-selected={isActive}
            aria-controls={`${tab.id}-panel`}
            aria-label={tab.ariaLabel}
            tabIndex={isActive ? 0 : -1}
            onClick={() => handleModeChange(tab.id)}
            className={cn(
              // Base styles - ensuring 44x44px minimum touch target
              'relative flex items-center gap-2 px-4 py-2.5 min-h-[44px] min-w-[44px]',
              'rounded-lg font-medium text-sm transition-all duration-300',
              'focus:outline-none focus-visible:ring-2 focus-visible:ring-white/50 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent',
              // Active state
              isActive && [
                'bg-white text-blue-600 shadow-lg',
                'before:absolute before:inset-0 before:rounded-lg before:bg-gradient-to-r before:from-blue-500/10 before:to-purple-500/10',
              ],
              // Inactive state
              !isActive && [
                'text-white/80 hover:text-white hover:bg-white/10',
              ]
            )}
            data-active={isActive}
            data-mode={tab.id}
          >
            <span className={cn(
              'text-lg transition-transform duration-300',
              isActive && 'scale-110'
            )}>
              {tab.icon}
            </span>
            <span className="hidden sm:inline">{tab.label}</span>
          </button>
        )
      })}
    </nav>
  )
}

/**
 * Hook to get current mode from URL
 */
export function useMode(): Mode {
  const searchParams = useSearchParams()
  return (searchParams.get('mode') as Mode) ?? 'market'
}
