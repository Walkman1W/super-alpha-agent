import { BotVisitStats, getBotDisplayName, formatGrowthRate } from '@/lib/bot-stats'
import { GlassCard } from '@/components/ui/glass-card'

/**
 * Props for the AI Bot Homepage Stats component
 */
interface AIBotHomepageStatsProps {
  stats: BotVisitStats[]
}

/**
 * Skeleton loading state for bot statistics
 * Requirements: 2.4
 */
export function AIBotStatsLoading() {
  return (
    <section className="container mx-auto px-4 py-12">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-1 h-8 bg-gradient-to-b from-blue-600 to-purple-600 rounded-full"></div>
        <h2 className="text-3xl font-bold text-gray-900">AI 搜索引擎访问统计</h2>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <div 
            key={i}
            className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-200/50 animate-pulse"
          >
            <div className="h-6 bg-gray-200 rounded w-24 mb-4"></div>
            <div className="h-10 bg-gray-200 rounded w-16 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-20"></div>
          </div>
        ))}
      </div>
    </section>
  )
}

/**
 * AI Bot Homepage Statistics Component
 * 
 * Displays visit statistics for AI bots on the homepage, showing:
 * - Bot name with friendly display
 * - 7-day visit count
 * - Growth rate with trend indicator
 * 
 * Requirements: 2.1, 2.2, 2.4
 * 
 * @param stats - Array of bot visit statistics
 */
export function AIBotHomepageStats({ stats }: AIBotHomepageStatsProps) {
  // If no stats available, don't render the section
  if (!stats || stats.length === 0) {
    return null
  }

  // Get bot icon based on bot name
  const getBotIcon = (botName: string): string => {
    const icons: Record<string, string> = {
      'GPTBot': '🤖',
      'ChatGPT-User': '🤖',
      'ClaudeBot': '🧠',
      'anthropic-ai': '🧠',
      'PerplexityBot': '🔍',
      'GoogleBot': '🔎',
      'BingBot': '🔵'
    }
    return icons[botName] || '🤖'
  }

  // Get trend icon and color
  const getTrendDisplay = (trend: 'up' | 'down' | 'stable', growthRate: number) => {
    if (trend === 'up') {
      return {
        icon: '📈',
        color: 'text-green-600',
        bgColor: 'bg-green-50'
      }
    } else if (trend === 'down') {
      return {
        icon: '📉',
        color: 'text-red-600',
        bgColor: 'bg-red-50'
      }
    }
    return {
      icon: '➡️',
      color: 'text-gray-600',
      bgColor: 'bg-gray-50'
    }
  }

  return (
    <section className="container mx-auto px-4 py-12">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-1 h-8 bg-gradient-to-b from-blue-600 to-purple-600 rounded-full"></div>
        <h2 className="text-3xl font-bold text-gray-900">AI 搜索引擎访问统计</h2>
      </div>
      
      <p className="text-gray-600 mb-8 max-w-3xl">
        我们追踪主流 AI 搜索引擎对本平台的访问情况，展示过去 7 天的访问趋势。
        这些数据反映了 AI 搜索引擎对我们内容的认可程度。
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => {
          const trendDisplay = getTrendDisplay(stat.trend, stat.growth_rate)
          const displayName = getBotDisplayName(stat.bot_name)
          const icon = getBotIcon(stat.bot_name)

          return (
            <GlassCard key={stat.bot_name} hover={false}>
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-2">
                  <span className="text-3xl">{icon}</span>
                  <h3 className="font-bold text-gray-900">{displayName}</h3>
                </div>
                <span className="text-2xl">{trendDisplay.icon}</span>
              </div>

              <div className="mb-3">
                <div className="text-4xl font-black text-gray-900 mb-1">
                  {stat.visits_7d.toLocaleString()}
                </div>
                <div className="text-sm text-gray-500">过去 7 天访问</div>
              </div>

              <div className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${trendDisplay.bgColor} ${trendDisplay.color}`}>
                <span>{formatGrowthRate(stat.growth_rate)}</span>
                <span className="text-xs">vs 前 7 天</span>
              </div>
            </GlassCard>
          )
        })}
      </div>

      <div className="mt-8 text-center">
        <p className="text-sm text-gray-500">
          💡 数据每日更新 · 统计周期：过去 7 天 vs 前 7 天
        </p>
      </div>
    </section>
  )
}
