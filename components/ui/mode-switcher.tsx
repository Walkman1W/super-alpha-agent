'use client'

import React from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'

interface ModeSwitcherProps {
  modes: {
    value: string
    label: string
    icon?: React.ReactNode
  }[]
  defaultValue?: string
  className?: string
}

export function ModeSwitcher({ modes, defaultValue = 'all', className }: ModeSwitcherProps) {
  const searchParams = useSearchParams()
  const router = useRouter()
  const currentMode = searchParams.get('mode') || defaultValue

  const handleModeChange = (mode: string) => {
    const params = new URLSearchParams(searchParams)
    if (mode === defaultValue) {
      params.delete('mode')
    } else {
      params.set('mode', mode)
    }
    
    // 保存当前滚动位置
    const scrollPosition = window.scrollY
    sessionStorage.setItem('scrollPosition', scrollPosition.toString())
    
    // 导航到新的URL
    router.push(`?${params.toString()}`)
  }

  // 恢复滚动位置
  React.useEffect(() => {
    const savedPosition = sessionStorage.getItem('scrollPosition')
    if (savedPosition) {
      window.scrollTo(0, parseInt(savedPosition))
      sessionStorage.removeItem('scrollPosition')
    }
  }, [currentMode])

  return (
    <div className={cn(
      'inline-flex items-center justify-center rounded-lg bg-white/10 backdrop-blur-sm p-1 border border-white/20',
      className
    )}>
      {modes.map((mode) => (
        <button
          key={mode.value}
          onClick={() => handleModeChange(mode.value)}
          className={cn(
            'relative inline-flex items-center justify-center px-4 py-2 text-sm font-medium transition-all duration-200 rounded-md',
            currentMode === mode.value
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-white hover:text-gray-200'
          )}
        >
          {mode.icon && <span className="mr-2">{mode.icon}</span>}
          {mode.label}
          {currentMode === mode.value && (
            <span className="absolute inset-0 rounded-md ring-2 ring-blue-400 ring-offset-2"></span>
          )}
        </button>
      ))}
    </div>
  )
}
