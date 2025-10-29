// AI 搜索引擎检测器

export interface AIBotInfo {
  name: string
  detected: boolean
  userAgent?: string
  referer?: string
}

// 已知的 AI 搜索引擎 User-Agent
const AI_BOTS = [
  { name: 'ChatGPT', patterns: ['ChatGPT-User', 'GPTBot', 'OpenAI'] },
  { name: 'Claude', patterns: ['Claude-Web', 'ClaudeBot', 'Anthropic'] },
  { name: 'Perplexity', patterns: ['PerplexityBot', 'Perplexity'] },
  { name: 'Google Bard', patterns: ['Google-Extended', 'Bard'] },
  { name: 'Bing AI', patterns: ['BingPreview', 'Bing AI'] },
  { name: 'You.com', patterns: ['YouBot'] },
  { name: 'Phind', patterns: ['PhindBot'] },
]

/**
 * 检测访问者是否是 AI 搜索引擎
 */
export function detectAIBot(userAgent: string, referer?: string): AIBotInfo | null {
  if (!userAgent) return null

  // 检查 User-Agent
  for (const bot of AI_BOTS) {
    for (const pattern of bot.patterns) {
      if (userAgent.includes(pattern)) {
        return {
          name: bot.name,
          detected: true,
          userAgent,
          referer
        }
      }
    }
  }

  // 检查 Referer（有些 AI 会在 referer 中留下痕迹）
  if (referer) {
    if (referer.includes('chat.openai.com')) {
      return { name: 'ChatGPT', detected: true, userAgent, referer }
    }
    if (referer.includes('claude.ai')) {
      return { name: 'Claude', detected: true, userAgent, referer }
    }
    if (referer.includes('perplexity.ai')) {
      return { name: 'Perplexity', detected: true, userAgent, referer }
    }
    if (referer.includes('you.com')) {
      return { name: 'You.com', detected: true, userAgent, referer }
    }
  }

  return null
}

/**
 * 从请求头中提取 AI Bot 信息
 */
export function extractAIBotFromHeaders(headers: Headers): AIBotInfo | null {
  const userAgent = headers.get('user-agent') || ''
  const referer = headers.get('referer') || ''
  
  return detectAIBot(userAgent, referer)
}

/**
 * 获取客户端 IP（考虑代理）
 */
export function getClientIP(headers: Headers): string | null {
  return (
    headers.get('x-forwarded-for')?.split(',')[0] ||
    headers.get('x-real-ip') ||
    null
  )
}

/**
 * 验证 AI 访问的合法性（防止刷量）
 */
export function validateAIVisit(
  aiName: string,
  ipAddress: string | null,
  recentVisits: Array<{ ai_name: string; ip_address: string; visited_at: string }>
): boolean {
  if (!ipAddress) return true // 无法验证，允许通过

  // 检查同一 IP 在 1 分钟内是否有重复访问
  const oneMinuteAgo = new Date(Date.now() - 60 * 1000)
  const recentFromSameIP = recentVisits.filter(
    v => v.ip_address === ipAddress && 
         v.ai_name === aiName &&
         new Date(v.visited_at) > oneMinuteAgo
  )

  return recentFromSameIP.length === 0
}
