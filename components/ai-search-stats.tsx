/**
 * AI搜索统计组件
 * 显示AI搜索统计细分，实现简单条形图可视化，显示百分比和趋势
 * 验证: 需求 4.5, 8.2
 */

import { supabaseAdmin } from '@/lib/supabase'

interface AISearchStatsProps {
  agentId: string
  totalCount: number
  showChart?: boolean
}

interface AIVisitBreakdown {
  ai_name: string
  count: number
  percentage: number
}

/**
 * 获取AI搜索统计细分数据
 */
async function getAISearchBreakdown(agentId: string): Promise<AIVisitBreakdown[]> {
  const { data, error } = await supabaseAdmin
    .from('ai_visits')
    .select('ai_name')
    .eq('agent_id', agentId)

  if (error || !data) {
    return []
  }

  // 统计每个AI引擎的访问次数
  const countMap = new Map<string, number>()
  data.forEach((visit) => {
    const count = countMap.get(visit.ai_name) || 0
    countMap.set(visit.ai_name, count + 1)
  })

  const total = data.length
  
  // 转换为数组并计算百分比
  const breakdown: AIVisitBreakdown[] = Array.from(countMap.entries())
    .map(([ai_name, count]) => ({
      ai_name,
      count,
      percentage: total > 0 ? Math.round((count / total) * 100) : 0,
    }))
    .sort((a, b) => b.count - a.count) // 按数量降序排列

  return breakdown
}

/**
 * 格式化数字显示
 * 验证: 需求 8.5
 */
function formatNumber(num: number): string {
  if (num >= 1000000) {
    return `${(num / 1000000).toFixed(1)}M`
  }
  if (num >= 1000) {
    return `${(num / 1000).toFixed(1)}K`
  }
  return num.toLocaleString()
}

/**
 * 获取AI引擎的颜色
 */
function getAIColor(aiName: string): string {
  const colors: Record<string, string> = {
    'ChatGPT': 'bg-green-500',
    'Claude': 'bg-orange-500',
    'Perplexity': 'bg-blue-500',
    'Google Bard': 'bg-yellow-500',
    'Bing AI': 'bg-cyan-500',
    'You.com': 'bg-purple-500',
  }
  return colors[aiName] || 'bg-gray-500'
}

/**
 * 获取AI引擎的图标
 */
function getAIIcon(aiName: string): string {
  const icons: Record<string, string> = {
    'ChatGPT': '🤖',
    'Claude': '🧠',
    'Perplexity': '🔍',
    'Google Bard': '✨',
    'Bing AI': '🔷',
    'You.com': '👤',
  }
  return icons[aiName] || '🤖'
}

export async function AISearchStats({ 
  agentId, 
  totalCount, 
  showChart = true 
}: AISearchStatsProps) {
  const breakdown = await getAISearchBreakdown(agentId)

  // 如果没有数据，显示空状态
  if (breakdown.length === 0 && totalCount === 0) {
    return (
      <section 
        className="border rounded-lg p-6 bg-gray-50"
        aria-labelledby="ai-stats-heading"
      >
        <h3 id="ai-stats-heading" className="text-lg font-semibold mb-4 flex items-center gap-2">
          <span aria-hidden="true">🤖</span>
          AI 搜索统计
        </h3>
        <p className="text-gray-500 text-sm">
          暂无AI搜索数据。当AI搜索引擎发现此Agent时，统计数据将在此显示。
        </p>
      </section>
    )
  }

  const maxCount = Math.max(...breakdown.map(b => b.count), 1)

  return (
    <section 
      className="border rounded-lg p-6"
      aria-labelledby="ai-stats-heading"
      role="region"
    >
      <h3 id="ai-stats-heading" className="text-lg font-semibold mb-4 flex items-center gap-2">
        <span aria-hidden="true">🤖</span>
        AI 搜索统计
      </h3>

      {/* 总计数显示 */}
      <div 
        className="mb-6 p-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg border border-purple-200"
        role="status"
        aria-label={`总AI搜索量: ${totalCount}次`}
      >
        <div className="text-sm text-gray-600 mb-1">总 AI 搜索量</div>
        <div className="text-3xl font-bold text-purple-600">
          {formatNumber(totalCount)}
        </div>
        <div className="text-xs text-gray-500 mt-1">
          来自 {breakdown.length} 个不同的 AI 搜索引擎
        </div>
      </div>

      {/* 细分统计 - 条形图可视化 */}
      {showChart && breakdown.length > 0 && (
        <div 
          className="space-y-4"
          role="list"
          aria-label="AI搜索引擎细分统计"
        >
          <h4 className="text-sm font-medium text-gray-700 mb-3">搜索来源细分</h4>
          {breakdown.map((item) => (
            <div 
              key={item.ai_name} 
              className="space-y-1"
              role="listitem"
            >
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <span aria-hidden="true">{getAIIcon(item.ai_name)}</span>
                  <span className="font-medium">{item.ai_name}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <span>{formatNumber(item.count)} 次</span>
                  <span className="text-xs text-gray-400">({item.percentage}%)</span>
                </div>
              </div>
              {/* 条形图 */}
              <div 
                className="h-3 bg-gray-100 rounded-full overflow-hidden"
                role="progressbar"
                aria-valuenow={item.percentage}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label={`${item.ai_name}: ${item.percentage}%`}
              >
                <div
                  className={`h-full ${getAIColor(item.ai_name)} rounded-full transition-all duration-500`}
                  style={{ width: `${(item.count / maxCount) * 100}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 简化列表视图（当showChart为false时） */}
      {!showChart && breakdown.length > 0 && (
        <ul className="space-y-2" role="list">
          {breakdown.map((item) => (
            <li 
              key={item.ai_name}
              className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0"
            >
              <div className="flex items-center gap-2">
                <span aria-hidden="true">{getAIIcon(item.ai_name)}</span>
                <span>{item.ai_name}</span>
              </div>
              <div className="text-sm">
                <span className="font-semibold">{formatNumber(item.count)}</span>
                <span className="text-gray-400 ml-1">({item.percentage}%)</span>
              </div>
            </li>
          ))}
        </ul>
      )}

      {/* 趋势提示 */}
      {totalCount > 10 && (
        <div className="mt-4 pt-4 border-t border-gray-100">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <span aria-hidden="true">📈</span>
            <span>
              此 Agent 正在被 AI 搜索引擎积极推荐
            </span>
          </div>
        </div>
      )}
    </section>
  )
}

/**
 * 客户端版本的AISearchStats组件（用于动态更新）
 */
export function AISearchStatsClient({ 
  breakdown,
  totalCount,
  showChart = true 
}: {
  breakdown: AIVisitBreakdown[]
  totalCount: number
  showChart?: boolean
}) {
  // 如果没有数据，显示空状态
  if (breakdown.length === 0 && totalCount === 0) {
    return (
      <section 
        className="border rounded-lg p-6 bg-gray-50"
        aria-labelledby="ai-stats-heading-client"
      >
        <h3 id="ai-stats-heading-client" className="text-lg font-semibold mb-4 flex items-center gap-2">
          <span aria-hidden="true">🤖</span>
          AI 搜索统计
        </h3>
        <p className="text-gray-500 text-sm">
          暂无AI搜索数据。
        </p>
      </section>
    )
  }

  const maxCount = Math.max(...breakdown.map(b => b.count), 1)

  return (
    <section 
      className="border rounded-lg p-6"
      aria-labelledby="ai-stats-heading-client"
      role="region"
    >
      <h3 id="ai-stats-heading-client" className="text-lg font-semibold mb-4 flex items-center gap-2">
        <span aria-hidden="true">🤖</span>
        AI 搜索统计
      </h3>

      {/* 总计数显示 */}
      <div 
        className="mb-6 p-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg border border-purple-200"
        role="status"
        aria-label={`总AI搜索量: ${totalCount}次`}
      >
        <div className="text-sm text-gray-600 mb-1">总 AI 搜索量</div>
        <div className="text-3xl font-bold text-purple-600">
          {formatNumber(totalCount)}
        </div>
      </div>

      {/* 细分统计 */}
      {showChart && breakdown.length > 0 && (
        <div className="space-y-4" role="list" aria-label="AI搜索引擎细分统计">
          <h4 className="text-sm font-medium text-gray-700 mb-3">搜索来源细分</h4>
          {breakdown.map((item) => (
            <div key={item.ai_name} className="space-y-1" role="listitem">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <span aria-hidden="true">{getAIIcon(item.ai_name)}</span>
                  <span className="font-medium">{item.ai_name}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <span>{formatNumber(item.count)} 次</span>
                  <span className="text-xs text-gray-400">({item.percentage}%)</span>
                </div>
              </div>
              <div 
                className="h-3 bg-gray-100 rounded-full overflow-hidden"
                role="progressbar"
                aria-valuenow={item.percentage}
                aria-valuemin={0}
                aria-valuemax={100}
              >
                <div
                  className={`h-full ${getAIColor(item.ai_name)} rounded-full transition-all duration-500`}
                  style={{ width: `${(item.count / maxCount) * 100}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  )
}

export type { AIVisitBreakdown }
