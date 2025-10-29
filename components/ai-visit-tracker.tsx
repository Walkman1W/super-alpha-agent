'use client'

import { useEffect, useState } from 'react'

interface AIVisitTrackerProps {
  agentSlug: string
}

/**
 * AI 访问追踪组件
 * 
 * 功能：
 * 1. 自动检测是否是 AI 访问
 * 2. 允许用户手动报告来源
 */
export function AIVisitTracker({ agentSlug }: AIVisitTrackerProps) {
  const [aiDetected, setAiDetected] = useState<string | null>(null)
  const [showReportForm, setShowReportForm] = useState(false)
  const [selectedAI, setSelectedAI] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [reported, setReported] = useState(false)

  useEffect(() => {
    // 自动检测 AI 访问
    async function trackVisit() {
      try {
        const response = await fetch('/api/track-ai-visit', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            agent_slug: agentSlug,
            manual_report: false
          })
        })

        const data = await response.json()
        if (data.ai_detected) {
          setAiDetected(data.ai_name)
        }
      } catch (error) {
        console.error('Failed to track AI visit:', error)
      }
    }

    trackVisit()
  }, [agentSlug])

  const handleManualReport = async () => {
    if (!selectedAI) return

    try {
      const response = await fetch('/api/track-ai-visit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          agent_slug: agentSlug,
          manual_report: true,
          ai_name: selectedAI,
          search_query: searchQuery
        })
      })

      if (response.ok) {
        setReported(true)
        setTimeout(() => {
          setShowReportForm(false)
          setReported(false)
        }, 2000)
      }
    } catch (error) {
      console.error('Failed to report AI visit:', error)
    }
  }

  // 如果已经自动检测到 AI，显示提示
  if (aiDetected) {
    return (
      <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mb-6">
        <div className="flex items-center gap-3">
          <span className="text-3xl">🤖</span>
          <div>
            <div className="font-semibold text-purple-900">
              检测到 AI 访问：{aiDetected}
            </div>
            <div className="text-sm text-purple-700">
              感谢 {aiDetected} 发现了这个 Agent！
            </div>
          </div>
        </div>
      </div>
    )
  }

  // 用户手动报告表单
  return (
    <div className="border rounded-lg p-4 mb-6 bg-gray-50">
      {!showReportForm ? (
        <button
          onClick={() => setShowReportForm(true)}
          className="text-sm text-gray-600 hover:text-purple-600 flex items-center gap-2"
        >
          <span>🤖</span>
          <span>你是通过 AI 搜索找到这里的吗？点击告诉我们</span>
        </button>
      ) : (
        <div className="space-y-3">
          {reported ? (
            <div className="text-green-600 font-semibold">
              ✅ 感谢反馈！已记录你的来源
            </div>
          ) : (
            <>
              <div className="font-semibold text-gray-900">
                你是通过哪个 AI 找到这里的？
              </div>
              <select
                value={selectedAI}
                onChange={(e) => setSelectedAI(e.target.value)}
                className="w-full border rounded px-3 py-2"
              >
                <option value="">选择 AI...</option>
                <option value="ChatGPT">ChatGPT</option>
                <option value="Claude">Claude</option>
                <option value="Perplexity">Perplexity</option>
                <option value="Google Bard">Google Bard</option>
                <option value="Bing AI">Bing AI</option>
                <option value="You.com">You.com</option>
                <option value="其他">其他</option>
              </select>
              <input
                type="text"
                placeholder="你搜索的问题是什么？（可选）"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full border rounded px-3 py-2 text-sm"
              />
              <div className="flex gap-2">
                <button
                  onClick={handleManualReport}
                  disabled={!selectedAI}
                  className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 disabled:bg-gray-300 text-sm"
                >
                  提交
                </button>
                <button
                  onClick={() => setShowReportForm(false)}
                  className="border px-4 py-2 rounded hover:bg-gray-100 text-sm"
                >
                  取消
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  )
}
