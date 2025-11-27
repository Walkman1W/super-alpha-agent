'use client'

import * as React from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'

const ModeSwitcher = () => {
  const searchParams = useSearchParams()
  const router = useRouter()
  const currentMode = searchParams.get('mode') || 'marketplace'

  const modes = [
    { id: 'marketplace', label: 'Agent 市场', href: '/?mode=marketplace' },
    { id: 'publish', label: '发布 Agent', href: '/?mode=publish' },
  ]

  const handleModeChange = (modeId: string) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set('mode', modeId)
    router.push(`/?${params.toString()}`)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <div className="border-b border-gray-200 mb-6">
      <div className="flex space-x-8">
        {modes.map((mode) => (
          <button
            key={mode.id}
            onClick={() => handleModeChange(mode.id)}
            className={cn(
              'py-4 px-1 border-b-2 font-medium text-sm transition-all duration-200',
              currentMode === mode.id
                ? 'border-primary-600 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            )}
          >
            {mode.label}
          </button>
        ))}
      </div>
    </div>
  )
}

export default ModeSwitcher