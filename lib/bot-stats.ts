import { supabaseAdmin } from '@/lib/supabase'

/**
 * Bot visit statistics interface
 * Represents aggregated visit data for AI bots over time periods
 */
export interface BotVisitStats {
  bot_name: string
  total_visits: number
  visits_7d: number
  visits_prev_7d: number
  growth_rate: number
  trend: 'up' | 'down' | 'stable'
}

/**
 * Fetches homepage bot statistics from the bot_stats_7d view
 * 
 * This function queries the database view that aggregates AI bot visits
 * over 7-day and 14-day periods, calculates growth rates, and determines trends.
 * 
 * Requirements: 2.1, 2.2, 2.3
 * 
 * @returns Promise<BotVisitStats[]> Array of bot statistics sorted by 7-day visits (descending)
 */
export async function getHomepageBotStats(): Promise<BotVisitStats[]> {
  try {
    // Query the bot_stats_7d view which already calculates growth_rate
    const { data: dataRaw, error } = await (supabaseAdmin as any)
      .from('bot_stats_7d')
      .select('*')
      .order('visits_7d', { ascending: false })

    if (error) {
      console.error('Error fetching bot stats:', error)
      return []
    }

    if (!dataRaw || dataRaw.length === 0) {
      return []
    }

    const data = dataRaw as Array<{
      bot_name: string
      total_visits: number
      visits_7d: number
      visits_prev_7d: number
      growth_rate: number
    }>

    // Transform data and add trend indicator
    const stats: BotVisitStats[] = data.map((row) => {
      const growthRate = row.growth_rate || 0
      
      // Determine trend based on growth rate
      let trend: 'up' | 'down' | 'stable' = 'stable'
      if (growthRate > 5) {
        trend = 'up'
      } else if (growthRate < -5) {
        trend = 'down'
      }

      return {
        bot_name: row.bot_name,
        total_visits: row.total_visits || 0,
        visits_7d: row.visits_7d || 0,
        visits_prev_7d: row.visits_prev_7d || 0,
        growth_rate: growthRate,
        trend
      }
    })

    return stats
  } catch (error) {
    console.error('Unexpected error in getHomepageBotStats:', error)
    return []
  }
}

/**
 * Formats growth rate for display
 * 
 * @param growthRate - The growth rate percentage
 * @returns Formatted string with + or - prefix
 */
export function formatGrowthRate(growthRate: number): string {
  if (growthRate > 0) {
    return `+${growthRate.toFixed(1)}%`
  } else if (growthRate < 0) {
    return `${growthRate.toFixed(1)}%`
  }
  return '0%'
}

/**
 * Gets a friendly display name for bot names
 * 
 * @param botName - The bot name from user agent
 * @returns Friendly display name
 */
export function getBotDisplayName(botName: string): string {
  const displayNames: Record<string, string> = {
    'GPTBot': 'ChatGPT',
    'ClaudeBot': 'Claude',
    'PerplexityBot': 'Perplexity',
    'GoogleBot': 'Google',
    'BingBot': 'Bing',
    'anthropic-ai': 'Claude',
    'ChatGPT-User': 'ChatGPT'
  }

  return displayNames[botName] || botName
}
