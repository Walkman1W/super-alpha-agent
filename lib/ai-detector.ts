// AI 搜索引擎检测器
// 验证: 需求 8.3

export interface AIBotInfo {
  name: string
  detected: boolean
  userAgent?: string
  referer?: string
  detectionMethod: 'user_agent' | 'referer' | 'both'
}

/**
 * AI机器人配置
 * 包含User-Agent模式和Referer域名
 */
export interface AIBotConfig {
  name: string
  userAgentPatterns: string[]
  refererDomains: string[]
}

// 已知的 AI 搜索引擎配置
export const AI_BOTS: AIBotConfig[] = [
  { 
    name: 'ChatGPT', 
    userAgentPatterns: ['ChatGPT-User', 'GPTBot', 'OpenAI', 'OAI-SearchBot'],
    refererDomains: ['chat.openai.com', 'chatgpt.com', 'openai.com']
  },
  { 
    name: 'Claude', 
    userAgentPatterns: ['Claude-Web', 'ClaudeBot', 'Anthropic', 'anthropic-ai'],
    refererDomains: ['claude.ai', 'anthropic.com']
  },
  { 
    name: 'Perplexity', 
    userAgentPatterns: ['PerplexityBot', 'Perplexity'],
    refererDomains: ['perplexity.ai']
  },
  { 
    name: 'Google Bard', 
    userAgentPatterns: ['Google-Extended', 'Bard', 'Gemini'],
    refererDomains: ['bard.google.com', 'gemini.google.com']
  },
  { 
    name: 'Bing AI', 
    userAgentPatterns: ['BingPreview', 'bingbot', 'Bing AI', 'MicrosoftPreview'],
    refererDomains: ['bing.com', 'copilot.microsoft.com']
  },
  { 
    name: 'You.com', 
    userAgentPatterns: ['YouBot', 'youchat'],
    refererDomains: ['you.com']
  },
  { 
    name: 'Phind', 
    userAgentPatterns: ['PhindBot', 'Phind'],
    refererDomains: ['phind.com']
  },
  {
    name: 'Kagi',
    userAgentPatterns: ['KagiBot'],
    refererDomains: ['kagi.com']
  },
  {
    name: 'Cohere',
    userAgentPatterns: ['cohere-ai', 'CohereBot'],
    refererDomains: ['cohere.com', 'coral.cohere.com']
  },
  {
    name: 'Meta AI',
    userAgentPatterns: ['Meta-ExternalAgent', 'FacebookBot'],
    refererDomains: ['meta.ai', 'ai.meta.com']
  },
]

/**
 * 检测User-Agent中的AI机器人
 * @param userAgent User-Agent字符串
 * @returns 匹配的AI机器人名称，如果没有匹配则返回null
 */
export function detectBotFromUserAgent(userAgent: string): string | null {
  if (!userAgent) return null
  
  const normalizedUA = userAgent.toLowerCase()
  
  for (const bot of AI_BOTS) {
    for (const pattern of bot.userAgentPatterns) {
      if (normalizedUA.includes(pattern.toLowerCase())) {
        return bot.name
      }
    }
  }
  
  return null
}

/**
 * 检测Referer中的AI来源
 * @param referer Referer字符串
 * @returns 匹配的AI机器人名称，如果没有匹配则返回null
 */
export function detectBotFromReferer(referer: string): string | null {
  if (!referer) return null
  
  const normalizedReferer = referer.toLowerCase()
  
  for (const bot of AI_BOTS) {
    for (const domain of bot.refererDomains) {
      if (normalizedReferer.includes(domain.toLowerCase())) {
        return bot.name
      }
    }
  }
  
  return null
}

/**
 * 检测访问者是否是 AI 搜索引擎
 * 验证: 需求 8.3
 * 
 * @param userAgent User-Agent字符串
 * @param referer Referer字符串（可选）
 * @returns AI机器人信息，如果没有检测到则返回null
 */
export function detectAIBot(userAgent: string, referer?: string): AIBotInfo | null {
  if (!userAgent && !referer) return null

  const botFromUA = detectBotFromUserAgent(userAgent)
  const botFromReferer = detectBotFromReferer(referer || '')
  
  // 优先使用User-Agent检测结果
  if (botFromUA) {
    return {
      name: botFromUA,
      detected: true,
      userAgent,
      referer,
      detectionMethod: botFromReferer ? 'both' : 'user_agent'
    }
  }
  
  // 如果User-Agent没有检测到，使用Referer
  if (botFromReferer) {
    return {
      name: botFromReferer,
      detected: true,
      userAgent,
      referer,
      detectionMethod: 'referer'
    }
  }

  return null
}

/**
 * 从请求头中提取 AI Bot 信息
 * @param headers 请求头
 * @returns AI机器人信息，如果没有检测到则返回null
 */
export function extractAIBotFromHeaders(headers: Headers): AIBotInfo | null {
  const userAgent = headers.get('user-agent') || ''
  const referer = headers.get('referer') || ''
  
  return detectAIBot(userAgent, referer)
}

/**
 * 获取客户端 IP（考虑代理）
 * @param headers 请求头
 * @returns 客户端IP地址，如果无法获取则返回null
 */
export function getClientIP(headers: Headers): string | null {
  return (
    headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    headers.get('x-real-ip') ||
    headers.get('cf-connecting-ip') || // Cloudflare
    null
  )
}

/**
 * 验证 AI 访问的合法性（防止刷量）
 * @param aiName AI名称
 * @param ipAddress IP地址
 * @param recentVisits 最近的访问记录
 * @param cooldownMs 冷却时间（毫秒），默认60秒
 * @returns 是否是有效的访问
 */
export function validateAIVisit(
  aiName: string,
  ipAddress: string | null,
  recentVisits: Array<{ ai_name: string; ip_address: string; visited_at: string }>,
  cooldownMs: number = 60 * 1000
): boolean {
  if (!ipAddress) return true // 无法验证，允许通过

  // 检查同一 IP 在冷却时间内是否有重复访问
  const cooldownTime = new Date(Date.now() - cooldownMs)
  const recentFromSameIP = recentVisits.filter(
    v => v.ip_address === ipAddress && 
         v.ai_name === aiName &&
         new Date(v.visited_at) > cooldownTime
  )

  return recentFromSameIP.length === 0
}

/**
 * 获取所有支持的AI机器人名称列表
 * @returns AI机器人名称数组
 */
export function getSupportedAIBots(): string[] {
  return AI_BOTS.map(bot => bot.name)
}

/**
 * 检查给定的AI名称是否是已知的AI机器人
 * @param name AI名称
 * @returns 是否是已知的AI机器人
 */
export function isKnownAIBot(name: string): boolean {
  return AI_BOTS.some(bot => bot.name.toLowerCase() === name.toLowerCase())
}

/**
 * 常见的搜索引擎爬虫 User-Agent 模式
 * 这些爬虫应该获得完整页面内容用于索引
 */
const SEARCH_ENGINE_BOTS = [
  // Google
  'googlebot', 'google-inspectiontool', 'storebot-google', 'googleother',
  // Bing
  'bingbot', 'bingpreview', 'msnbot',
  // Yahoo
  'slurp',
  // Yandex
  'yandexbot',
  // Baidu
  'baiduspider',
  // DuckDuckGo
  'duckduckbot',
  // Other search engines
  'sogou', 'exabot', 'facebot', 'ia_archiver',
  // Social media crawlers
  'twitterbot', 'linkedinbot', 'pinterest', 'slackbot', 'telegrambot',
  'whatsapp', 'discordbot',
  // SEO tools
  'semrushbot', 'ahrefsbot', 'mj12bot', 'dotbot',
]

/**
 * 检测是否是搜索引擎爬虫
 * @param userAgent User-Agent 字符串
 * @returns 是否是搜索引擎爬虫
 */
export function isSearchEngineBot(userAgent: string): boolean {
  if (!userAgent) return false
  
  const normalizedUA = userAgent.toLowerCase()
  
  return SEARCH_ENGINE_BOTS.some(bot => normalizedUA.includes(bot))
}

/**
 * 检测是否是 AI Bot（包括 AI 搜索引擎和传统搜索引擎爬虫）
 * 用于决定是否应该提供完整页面内容
 * 
 * 验证: 需求 6.3
 * 
 * @param userAgent User-Agent 字符串
 * @returns 是否是 Bot
 */
export function isBot(userAgent: string): boolean {
  if (!userAgent) return false
  
  // 检查是否是 AI Bot
  const aiBot = detectBotFromUserAgent(userAgent)
  if (aiBot) return true
  
  // 检查是否是搜索引擎爬虫
  if (isSearchEngineBot(userAgent)) return true
  
  // 检查通用 Bot 标识
  const normalizedUA = userAgent.toLowerCase()
  const genericBotPatterns = ['bot', 'crawler', 'spider', 'scraper', 'fetch', 'http']
  
  return genericBotPatterns.some(pattern => normalizedUA.includes(pattern))
}

/**
 * 判断请求是否应该重定向到首页
 * 人类用户应该重定向，Bot 应该获得完整页面
 * 
 * 验证: 需求 6.1, 6.2, 6.3
 * 
 * @param userAgent User-Agent 字符串
 * @returns 是否应该重定向到首页
 */
export function shouldRedirectToHome(userAgent: string): boolean {
  // 如果是 Bot，不重定向，提供完整页面
  if (isBot(userAgent)) {
    return false
  }
  
  // 人类用户应该重定向到首页
  return true
}
