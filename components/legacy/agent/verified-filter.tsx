'use client'

import { cn } from '@/lib/utils'

interface VerifiedFilterProps {
  checked: boolean
  onChange: (checked: boolean) => void
}

/**
 * 已验证过滤器切换开关
 * 按 is_verified 状态过滤 Agent
 * 
 * **Validates: Requirements 7.4**
 */
export function VerifiedFilter({ checked, onChange }: VerifiedFilterProps) {
  const handleToggle = () => {
    onChange(!checked)
  }

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
        aria-checked={checked}
        onClick={handleToggle}
        className={cn(
          'relative w-11 h-6 rounded-full transition-colors duration-200',
          'focus:outline-none focus:ring-2 focus:ring-purple-500/50',
          checked ? 'bg-[#00FF94]' : 'bg-zinc-700'
        )}
      >
        <span
          className={cn(
            'absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow-sm',
            'transition-transform duration-200',
            checked && 'translate-x-5'
          )}
        />
      </button>
    </label>
  )
}

export default VerifiedFilter
