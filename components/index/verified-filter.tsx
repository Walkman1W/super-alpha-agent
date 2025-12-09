'use client'

import { useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { cn } from '@/lib/utils'

interface VerifiedFilterProps {
  initialValue: boolean
}

/**
 * 已验证过滤器切换开关
 * 按 is_verified 状态过滤 Agent
 * 
 * **Validates: Requirements 7.4**
 */
export function VerifiedFilter({ initialValue }: VerifiedFilterProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const handleToggle = useCallback(() => {
    const params = new URLSearchParams(searchParams.toString())
    
    if (initialValue) {
      params.delete('verified')
    } else {
      params.set('verified', 'true')
    }

    const newUrl = params.toString() ? `?${params.toString()}` : ''
    router.push(`/agents${newUrl}`)
  }, [initialValue, router, searchParams])

  return (
    <label 
      className="flex items-center gap-3 cursor-pointer select-none"
      data-testid="verified-filter"
    >
      <span className="text-sm text-zinc-400 font-mono">
        Verified Only
      </span>
      
      {/* 切换开关 */}
      <button
        role="switch"
        aria-checked={initialValue}
        onClick={handleToggle}
        className={cn(
          'relative w-11 h-6 rounded-full transition-colors duration-200',
          'focus:outline-none focus:ring-2 focus:ring-purple-500/50',
          initialValue ? 'bg-[#00FF94]' : 'bg-zinc-700'
        )}
      >
        <span
          className={cn(
            'absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow-sm',
            'transition-transform duration-200',
            initialValue && 'translate-x-5'
          )}
        />
      </button>
    </label>
  )
}

export default VerifiedFilter
