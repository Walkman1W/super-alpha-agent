'use client'

import { Command } from 'lucide-react'
import { useCallback, useRef, useEffect } from 'react'

interface OmnibarProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
}

export function Omnibar({ value, onChange, placeholder = 'Search agents...' }: OmnibarProps) {
  const inputRef = useRef<HTMLInputElement>(null)

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
      e.preventDefault()
      inputRef.current?.focus()
    }
  }, [])

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])

  return (
    <div className="relative w-full max-w-2xl">
      <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
        <span className="font-mono text-sm text-purple-400 font-semibold select-none">&gt;_</span>
      </div>
      
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full py-3 pl-12 pr-20 bg-zinc-900/80 border border-zinc-800 rounded-lg font-mono text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/20 transition-all"
      />
      
      <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none">
        <kbd className="hidden sm:inline-flex items-center gap-1 px-2 py-1 bg-zinc-800 border border-zinc-700 rounded text-xs text-zinc-400 font-mono">
          <Command className="w-3 h-3" />
          <span>K</span>
        </kbd>
      </div>
    </div>
  )
}
