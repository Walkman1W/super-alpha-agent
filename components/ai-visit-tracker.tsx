'use client'

import { useEffect, useState } from 'react'

interface AIVisitTrackerProps {
  agentSlug: string
}

interface TrackingResult {
  ai_detected: boolean
  ai_name?: string
  visit_type?: 'bot_crawl' | 'ai_referral' | 'organic'
  detection_method?: string
}

/**
 * 智能 AI 访问追踪组件
 * 
 * 功能：
 * 1. 自动检测 AI Bot 爬取 (User-Agent)
 * 2. 自动检测用户从 AI 跳转 (Referer)
 * 3. 静默记录，不打扰用户
 * 
 * 访问类型：
 * - bot_crawl: AI Bot 在索引内容 (GPTBot, ClaudeBot 等)
 * - ai_referral: 用户从 AI 对话跳转过来 (chat.openai.com 等)
 * - organic: 普通访问
 */
export function AIVisitTracker({ agentSlug }: AIVisitTrackerProps) {
  const [trackingResult, setTrackingResult] = useState<TrackingResult | null>(null)

  useEffect(() => {
    async function trackVisit() {
      try {
        const response = await fetch('/api/track-ai-visit', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            agent_slug: agentSlug,
            referrer: document.referrer || null
          })
        })

        const data = await response.json()
        if (data.ai_detected) {
          setTrackingResult({
            ai_detected: true,
            ai_name: data.ai_name,
            visit_type: data.visit_type,
            detection_method: data.detection_method
          })
        }
      } catch (error) {
        // 静默失败，不影响用户体验
        console.error('Failed to track visit:', error)
      }
    }

    trackVisit()
  }, [agentSlug])

  // 如果检测到 AI 引荐访问，显示友好提示
  if (trackingResult?.visit_type === 'ai_referral' && trackingResult.ai_name) {
    return (
      <div className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-lg p-4 mb-6">
        <div className="flex items-center gap-3">
          <span className="text-2xl" aria-hidden="true">🤖</span>
          <div>
            <div className="font-medium text-purple-900">
              欢迎！你是从 {trackingResult.ai_name} 跳转过来的
            </div>
            <div className="text-sm text-purple-700">
              感谢 AI 的推荐，希望这个 Agent 对你有帮助
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Bot 爬取和普通访问不显示任何 UI
  return null
}
