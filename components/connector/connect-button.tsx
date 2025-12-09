'use client'

import { useState, useCallback, memo } from 'react'
import { cn } from '@/lib/utils'
import { PromptModal } from './prompt-modal'
import { generatePrompt, hasApiKeyPlaceholder } from '@/lib/generators/prompt-generator'
import type { ScannerAgent } from '@/lib/types/scanner'

interface ConnectButtonProps {
  agent: ScannerAgent
  variant?: 'default' | 'compact' | 'icon'
  className?: string
}

/**
 * 连接按钮组件
 * Agent 卡片/详情页上的"连接"按钮，点击打开 Interface Prompt 模态框
 * 
 * **Validates: Requirements 8.1, 8.4**
 */
function ConnectButtonComponent({ agent, variant = 'default', className }: ConnectButtonProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [promptData, setPromptData] = useState<{
    prompt: string
    hasApiKey: boolean
    apiEndpoint?: string
  } | null>(null)

  // 打开模态框并生成 Prompt
  const handleConnect = useCallback(() => {
    const result = generatePrompt(agent)
    setPromptData({
      prompt: result.systemPrompt,
      hasApiKey: hasApiKeyPlaceholder(result.systemPrompt),
      apiEndpoint: result.apiEndpoint
    })
    setIsModalOpen(true)
  }, [agent])

  // 关闭模态框
  const handleClose = useCallback(() => {
    setIsModalOpen(false)
  }, [])

  // 根据 variant 渲染不同样式的按钮
  const renderButton = () => {
    switch (variant) {
      case 'compact':
        return (
          <button
            onClick={handleConnect}
            className={cn(
              'flex items-center gap-1.5 px-3 py-1.5',
              'bg-[#00FF94]/10 border border-[#00FF94]/30 rounded-md',
              'text-[#00FF94] text-xs font-mono',
              'hover:bg-[#00FF94]/20 hover:border-[#00FF94]/50',
              'transition-all duration-200',
              'focus:outline-none focus:ring-2 focus:ring-[#00FF94]/30',
              className
            )}
            aria-label={`Connect to ${agent.name}`}
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            Connect
          </button>
        )

      case 'icon':
        return (
          <button
            onClick={handleConnect}
            className={cn(
              'flex items-center justify-center w-8 h-8',
              'bg-[#00FF94]/10 border border-[#00FF94]/30 rounded-md',
              'text-[#00FF94]',
              'hover:bg-[#00FF94]/20 hover:border-[#00FF94]/50',
              'transition-all duration-200',
              'focus:outline-none focus:ring-2 focus:ring-[#00FF94]/30',
              className
            )}
            aria-label={`Connect to ${agent.name}`}
            title="Connect"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </button>
        )

      default:
        return (
          <button
            onClick={handleConnect}
            className={cn(
              'flex items-center gap-2 px-4 py-2',
              'bg-[#00FF94] text-zinc-900 rounded-md',
              'text-sm font-mono font-medium',
              'hover:bg-[#00FF94]/90 hover:shadow-lg hover:shadow-[#00FF94]/20',
              'transition-all duration-200',
              'focus:outline-none focus:ring-2 focus:ring-[#00FF94]/50',
              className
            )}
            aria-label={`Connect to ${agent.name}`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            Connect
          </button>
        )
    }
  }

  return (
    <>
      {renderButton()}

      {/* Prompt 模态框 */}
      {promptData && (
        <PromptModal
          isOpen={isModalOpen}
          onClose={handleClose}
          agentName={agent.name}
          prompt={promptData.prompt}
          hasApiKeyPlaceholder={promptData.hasApiKey}
          apiEndpoint={promptData.apiEndpoint}
        />
      )}
    </>
  )
}

export const ConnectButton = memo(ConnectButtonComponent)
ConnectButton.displayName = 'ConnectButton'

export default ConnectButton
