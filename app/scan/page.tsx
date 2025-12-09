'use client'

import { useState, useCallback, FormEvent } from 'react'
import { cn } from '@/lib/utils'
import ScanResults from '@/components/scanner/scan-results'
import ClaimOptimize from '@/components/scanner/claim-optimize'
import type { ScanResponse } from '@/lib/types/scanner'

/**
 * 扫描页面 - The Scanner
 * 
 * 用户输入 URL，系统自动扫描并计算 SR 评分
 * Requirements: 1.1, 1.4, 1.5, 5.1-5.5
 */
export default function ScanPage() {
  const [url, setUrl] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [scanResult, setScanResult] = useState<ScanResponse | null>(null)

  // 验证 URL 格式
  const validateUrl = useCallback((input: string): boolean => {
    if (!input.trim()) return false
    try {
      const parsed = new URL(input.startsWith('http') ? input : `https://${input}`)
      return ['http:', 'https:'].includes(parsed.protocol)
    } catch {
      return false
    }
  }, [])

  // 处理扫描提交
  const handleSubmit = useCallback(async (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    
    // 规范化 URL
    const normalizedUrl = url.startsWith('http') ? url : `https://${url}`
    
    if (!validateUrl(normalizedUrl)) {
      setError('请输入有效的 URL，例如 github.com/owner/repo 或 example.com')
      return
    }

    setIsLoading(true)
    setScanResult(null)

    try {
      const response = await fetch('/api/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: normalizedUrl })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || '扫描失败，请稍后重试')
      }

      setScanResult(data as ScanResponse)
    } catch (err) {
      setError(err instanceof Error ? err.message : '扫描失败，请稍后重试')
    } finally {
      setIsLoading(false)
    }
  }, [url, validateUrl])

  // 处理重新扫描
  const handleRescan = useCallback(async () => {
    if (!scanResult?.agent) return
    
    const targetUrl = scanResult.agent.githubUrl || scanResult.agent.homepageUrl
    if (!targetUrl) return

    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: targetUrl, forceRescan: true })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || '重新扫描失败')
      }

      setScanResult(data as ScanResponse)
    } catch (err) {
      setError(err instanceof Error ? err.message : '重新扫描失败')
    } finally {
      setIsLoading(false)
    }
  }, [scanResult])

  return (
    <div className="min-h-screen bg-[#050505]">
      {/* Hero Section */}
      <section className="relative py-16 md:py-24">
        <div className="container mx-auto px-4">
          {/* 标题 */}
          <div className="text-center mb-12">
            <h1 className="text-3xl md:text-5xl font-bold text-white mb-4">
              <span className="text-[#00FF94]">Signal</span> Scanner
            </h1>
            <p className="text-zinc-400 text-lg md:text-xl max-w-2xl mx-auto">
              输入 GitHub 仓库或网站 URL，获取 AI 可见性诊断报告
            </p>
          </div>

          {/* URL 输入表单 */}
          <form onSubmit={handleSubmit} className="max-w-3xl mx-auto">
            <div className="relative">
              {/* 输入框容器 */}
              <div className={cn(
                'flex items-center gap-2 p-2 rounded-xl',
                'bg-zinc-900/80 backdrop-blur-sm',
                'border-2 transition-all duration-200',
                error 
                  ? 'border-red-500/50' 
                  : 'border-zinc-800 focus-within:border-[#00FF94]/50'
              )}>
                {/* URL 图标 */}
                <div className="pl-4 text-zinc-500">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                      d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                  </svg>
                </div>

                {/* 输入框 */}
                <input
                  type="text"
                  value={url}
                  onChange={(e) => {
                    setUrl(e.target.value)
                    if (error) setError(null)
                  }}
                  placeholder="github.com/owner/repo 或 example.com"
                  className={cn(
                    'flex-1 bg-transparent py-3 px-2',
                    'text-white text-lg font-mono',
                    'placeholder:text-zinc-600',
                    'focus:outline-none'
                  )}
                  disabled={isLoading}
                  autoFocus
                />

                {/* 扫描按钮 */}
                <button
                  type="submit"
                  disabled={isLoading || !url.trim()}
                  className={cn(
                    'px-6 py-3 rounded-lg font-semibold text-sm',
                    'transition-all duration-200',
                    'disabled:opacity-50 disabled:cursor-not-allowed',
                    isLoading
                      ? 'bg-zinc-700 text-zinc-300'
                      : 'bg-[#00FF94] text-black hover:bg-[#00FF94]/90 hover:shadow-lg hover:shadow-[#00FF94]/20'
                  )}
                >
                  {isLoading ? (
                    <span className="flex items-center gap-2">
                      <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      扫描中...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                      扫描
                    </span>
                  )}
                </button>
              </div>

              {/* 错误消息 */}
              {error && (
                <div className="mt-3 flex items-center gap-2 text-red-400 text-sm">
                  <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>{error}</span>
                </div>
              )}
            </div>

            {/* 提示文字 */}
            <div className="mt-4 text-center text-zinc-500 text-sm">
              支持 GitHub 仓库 URL 和 SaaS 网站 URL
            </div>
          </form>
        </div>
      </section>

      {/* 扫描结果区域 */}
      {scanResult && (
        <section className="pb-16">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto space-y-8">
              {/* 扫描结果展示 */}
              <ScanResults 
                result={scanResult} 
                onRescan={handleRescan}
                isRescanning={isLoading}
              />

              {/* 认领优化面板 - 仅对未认领的 Agent 显示 */}
              {!scanResult.agent.isClaimed && (
                <ClaimOptimize 
                  agent={scanResult.agent}
                  onVerifyDeployment={handleRescan}
                />
              )}
            </div>
          </div>
        </section>
      )}

      {/* 空状态提示 */}
      {!scanResult && !isLoading && (
        <section className="pb-16">
          <div className="container mx-auto px-4">
            <div className="max-w-2xl mx-auto">
              {/* 功能说明卡片 */}
              <div className="grid md:grid-cols-3 gap-4">
                <FeatureCard
                  icon="🔍"
                  title="自动检测"
                  description="智能识别 GitHub 仓库或 SaaS 网站"
                />
                <FeatureCard
                  icon="📊"
                  title="SR 评分"
                  description="基于 AI 可见性和互操作性计算评分"
                />
                <FeatureCard
                  icon="🚀"
                  title="优化建议"
                  description="获取可操作的改进建议提升排名"
                />
              </div>
            </div>
          </div>
        </section>
      )}
    </div>
  )
}

/**
 * 功能说明卡片组件
 */
function FeatureCard({ icon, title, description }: { 
  icon: string
  title: string
  description: string 
}) {
  return (
    <div className={cn(
      'p-6 rounded-xl',
      'bg-zinc-900/50 border border-zinc-800',
      'text-center'
    )}>
      <div className="text-3xl mb-3">{icon}</div>
      <h3 className="text-white font-semibold mb-2">{title}</h3>
      <p className="text-zinc-500 text-sm">{description}</p>
    </div>
  )
}
