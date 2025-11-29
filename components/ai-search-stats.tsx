'use client'

import { useState, useEffect } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

interface AIVisitsData {
  ai_type: string
  visit_count: number
  percentage: number
  color: string
}

interface AISearchStatsProps {
  agentSlug: string
  totalCount: number
}

const AI_COLORS: Record<string, string> = {
  'ChatGPT': 'bg-green-500',
  'Claude': 'bg-orange-500',
  'Perplexity': 'bg-purple-500',
  'Gemini': 'bg-blue-500',
  'Bing': 'bg-cyan-500',
  'Bard': 'bg-red-500',
  'Other': 'bg-gray-500'
}

export default function AISearchStats({ agentSlug, totalCount }: AISearchStatsProps) {
  const [aiStats, setAiStats] = useState<AIVisitsData[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchAIVisits()
  }, [agentSlug])

  const fetchAIVisits = async () => {
    const supabase = createClientComponentClient()

    try {
      const { data, error } = await supabase
        .from('ai_visits')
        .select('ai_type, visit_count')
        .eq('agent_slug', agentSlug)
        .order('visit_count', { ascending: false })

      if (error) {
        console.error('获取AI统计失败:', error)
        return
      }

      if (data && data.length > 0) {
        const stats = data.map((item) => ({
          ai_type: item.ai_type,
          visit_count: item.visit_count,
          percentage: totalCount > 0 ? Math.round((item.visit_count / totalCount) * 100) : 0,
          color: AI_COLORS[item.ai_type] || AI_COLORS['Other']
        }))
        setAiStats(stats)
      } else {
        // 如果没有数据，显示默认的AI类型
        const defaultStats = [
          { ai_type: 'ChatGPT', visit_count: 0, percentage: 0, color: AI_COLORS['ChatGPT'] },
          { ai_type: 'Claude', visit_count: 0, percentage: 0, color: AI_COLORS['Claude'] },
          { ai_type: 'Perplexity', visit_count: 0, percentage: 0, color: AI_COLORS['Perplexity'] },
          { ai_type: 'Gemini', visit_count: 0, percentage: 0, color: AI_COLORS['Gemini'] }
        ]
        setAiStats(defaultStats)
      }
    } catch (error) {
      console.error('获取AI统计出错:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="bg-white border rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4">AI 搜索统计</h3>
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded mb-2"></div>
          <div className="h-4 bg-gray-200 rounded mb-2"></div>
          <div className="h-4 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  if (totalCount === 0) {
    return (
      <div className="bg-white border rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4">AI 搜索统计</h3>
        <p className="text-gray-500 text-sm">暂无AI搜索数据</p>
      </div>
    )
  }

  return (
    <div className="bg-white border rounded-lg p-6">
      <h3 className="text-lg font-semibold mb-4">AI 搜索统计</h3>
      
      <div className="space-y-4">
        {aiStats.map((stat) => (
          <div key={stat.ai_type} className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-700">{stat.ai_type}</span>
              <div className="text-right">
                <span className="text-sm font-semibold">{stat.visit_count}</span>
                <span className="text-xs text-gray-500 ml-1">({stat.percentage}%)</span>
              </div>
            </div>
            
            {/* 条形图 */}
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all duration-300 ${stat.color}`}
                style={{ width: `${stat.percentage}%` }}
                role="progressbar"
                aria-valuenow={stat.percentage}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label={`${stat.ai_type} 占比 ${stat.percentage}%`}
              />
            </div>
          </div>
        ))}
      </div>
      
      {/* 总计 */}
      <div className="mt-6 pt-4 border-t">
        <div className="flex justify-between items-center">
          <span className="text-sm font-semibold text-gray-700">总计</span>
          <span className="text-lg font-bold text-purple-600">{totalCount}</span>
        </div>
      </div>
      
      {/* 趋势指示器 */}
      <div className="mt-4 text-center">
        <div className="inline-flex items-center gap-2 text-sm text-gray-600">
          <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" aria-hidden="true"></span>
          <span>实时更新</span>
        </div>
      </div>
    </div>
  )
}