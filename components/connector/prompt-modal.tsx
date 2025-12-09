'use client'

import { useState, useCallback, useEffect, useRef } from 'react'
import { cn } from '@/lib/utils'

interface PromptModalProps {
  isOpen: boolean
  onClose: () => void
  agentName: string
  prompt: string
  hasApiKeyPlaceholder: boolean
  apiEndpoint?: string
}

/**
 * 复制成功 Toast
 */
function CopyToast({ show }: { show: boolean }) {
  return (
    <div
      className={cn(
        'fixed bottom-6 left-1/2 -translate-x-1/2 z-[60]',
        'bg-[#00FF94] text-zinc-900 px-4 py-2 rounded-lg',
        'font-mono text-sm font-medium shadow-lg',
        'transition-all duration-300',
        show ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'
      )}
    >
      ✓ Copied to clipboard
    </div>
  )
}

/**
 * Prompt 模态框组件
 * 展示生成的 Interface Prompt，支持复制到剪贴板
 * 
 * **Validates: Requirements 8.2, 8.3, 8.4**
 */
export function PromptModal({
  isOpen,
  onClose,
  agentName,
  prompt,
  hasApiKeyPlaceholder,
  apiEndpoint
}: PromptModalProps) {
  const [showCopyToast, setShowCopyToast] = useState(false)
  const modalRef = useRef<HTMLDivElement>(null)
  const codeRef = useRef<HTMLPreElement>(null)

  // ESC 键关闭
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  // 点击背景关闭
  const handleBackdropClick = useCallback((e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }, [onClose])

  // 复制到剪贴板
  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(prompt)
      setShowCopyToast(true)
      setTimeout(() => setShowCopyToast(false), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }, [prompt])

  if (!isOpen) return null

  return (
    <>
      {/* 背景遮罩 */}
      <div
        className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm"
        onClick={handleBackdropClick}
        aria-hidden="true"
      />

      {/* 模态框 */}
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="prompt-modal-title"
        className={cn(
          'fixed z-50 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2',
          'w-[90vw] max-w-3xl max-h-[85vh]',
          'bg-zinc-900 border border-zinc-700 rounded-lg',
          'shadow-2xl shadow-black/50',
          'flex flex-col overflow-hidden'
        )}
      >
        {/* 标题栏 */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-800 bg-zinc-900/80">
          <div className="flex items-center gap-3">
            {/* 终端风格窗口按钮 */}
            <div className="flex gap-1.5">
              <button
                onClick={onClose}
                className="w-3 h-3 rounded-full bg-red-500/80 hover:bg-red-500 transition-colors"
                aria-label="Close"
              />
              <span className="w-3 h-3 rounded-full bg-yellow-500/80" />
              <span className="w-3 h-3 rounded-full bg-green-500/80" />
            </div>
            <h2
              id="prompt-modal-title"
              className="text-sm font-mono text-zinc-300"
            >
              interface-prompt.txt — {agentName}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-zinc-500 hover:text-zinc-300 transition-colors p-1"
            aria-label="Close modal"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* API 密钥提示 */}
        {hasApiKeyPlaceholder && (
          <div className="px-4 py-2 bg-yellow-500/10 border-b border-yellow-500/20">
            <div className="flex items-center gap-2 text-yellow-400 text-xs font-mono">
              <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <span>
                This agent requires an API key. Replace <code className="bg-yellow-500/20 px-1 rounded">&lt;PASTE_YOUR_KEY_HERE&gt;</code> with your actual key.
              </span>
            </div>
          </div>
        )}

        {/* API 端点信息 */}
        {apiEndpoint && (
          <div className="px-4 py-2 bg-zinc-800/50 border-b border-zinc-800">
            <div className="flex items-center gap-2 text-zinc-400 text-xs font-mono">
              <span className="text-zinc-500">📡 Endpoint:</span>
              <a
                href={apiEndpoint}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#00FF94] hover:underline truncate"
              >
                {apiEndpoint}
              </a>
            </div>
          </div>
        )}

        {/* Prompt 代码块 */}
        <div className="flex-1 overflow-auto p-4 bg-zinc-950">
          <pre
            ref={codeRef}
            className="text-sm font-mono text-zinc-300 whitespace-pre-wrap break-words leading-relaxed"
          >
            {prompt}
          </pre>
        </div>

        {/* 底部操作栏 */}
        <div className="flex items-center justify-between px-4 py-3 border-t border-zinc-800 bg-zinc-900/80">
          <div className="text-xs text-zinc-500 font-mono">
            {prompt.length} characters
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-mono text-zinc-400 hover:text-zinc-200 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleCopy}
              className={cn(
                'flex items-center gap-2 px-4 py-2',
                'bg-[#00FF94] text-zinc-900 rounded-md',
                'text-sm font-mono font-medium',
                'hover:bg-[#00FF94]/90 transition-colors',
                'focus:outline-none focus:ring-2 focus:ring-[#00FF94]/50'
              )}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              Copy Prompt
            </button>
          </div>
        </div>
      </div>

      {/* 复制成功 Toast */}
      <CopyToast show={showCopyToast} />
    </>
  )
}

export default PromptModal
