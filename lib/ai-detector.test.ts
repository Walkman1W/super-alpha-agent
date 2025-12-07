import { describe, it, expect } from 'vitest'
import fc from 'fast-check'
import {
  detectAIBot,
  detectBotFromUserAgent,
  detectBotFromReferer,
  AI_BOTS,
  getSupportedAIBots,
  isKnownAIBot,
  validateAIVisit,
  getClientIP,
  AIBotConfig,
  isBot,
  isSearchEngineBot,
  shouldRedirectToHome,
} from './ai-detector'

// 生成已知AI机器人的User-Agent
const knownBotUserAgentArbitrary = fc.constantFrom(...AI_BOTS).chain((bot: AIBotConfig) =>
  fc.constantFrom(...bot.userAgentPatterns).map((pattern) => ({
    botName: bot.name,
    userAgent: `Mozilla/5.0 (compatible; ${pattern}/1.0)`,
    pattern,
  }))
)

// 生成已知AI机器人的Referer
const knownBotRefererArbitrary = fc.constantFrom(...AI_BOTS).chain((bot: AIBotConfig) =>
  fc.constantFrom(...bot.refererDomains).map((domain) => ({
    botName: bot.name,
    referer: `https://${domain}/search?q=test`,
    domain,
  }))
)

// 生成普通用户的User-Agent
const normalUserAgentArbitrary = fc.constantFrom(
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 Safari/605.1.15',
  'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 Safari/604.1',
  'Mozilla/5.0 (Linux; Android 14) AppleWebKit/537.36 Chrome/120.0.0.0 Mobile Safari/537.36',
  'Mozilla/5.0 (X11; Linux x86_64; rv:120.0) Gecko/20100101 Firefox/120.0'
)

// 生成普通网站的Referer
const normalRefererArbitrary = fc.constantFrom(
  'https://www.google.com/search?q=ai+agent',
  'https://duckduckgo.com/?q=ai+assistant',
  'https://www.reddit.com/r/artificial/',
  'https://news.ycombinator.com/',
  ''
)

// 生成IP地址
const ipAddressArbitrary = fc
  .tuple(
    fc.integer({ min: 1, max: 255 }),
    fc.integer({ min: 0, max: 255 }),
    fc.integer({ min: 0, max: 255 }),
    fc.integer({ min: 1, max: 254 })
  )
  .map(([a, b, c, d]) => `${a}.${b}.${c}.${d}`)


/**
 * Feature: agent-brand-showcase, Property 29: 机器人检测和增量
 * Validates: Requirements 8.3
 */
describe('Property 29: 机器人检测和增量', () => {
  it('should detect AI bot from User-Agent for any known bot pattern', () => {
    fc.assert(
      fc.property(knownBotUserAgentArbitrary, ({ botName, userAgent }) => {
        const result = detectAIBot(userAgent)
        expect(result).not.toBeNull()
        expect(result?.detected).toBe(true)
        expect(result?.name).toBe(botName)
        return true
      }),
      { numRuns: 100 }
    )
  })

  it('should detect AI bot from Referer for any known bot domain', () => {
    fc.assert(
      fc.property(knownBotRefererArbitrary, ({ botName, referer }) => {
        const result = detectAIBot('', referer)
        expect(result).not.toBeNull()
        expect(result?.detected).toBe(true)
        expect(result?.name).toBe(botName)
        expect(result?.detectionMethod).toBe('referer')
        return true
      }),
      { numRuns: 100 }
    )
  })

  it('should not detect AI bot for normal user agents', () => {
    fc.assert(
      fc.property(normalUserAgentArbitrary, normalRefererArbitrary, (userAgent, referer) => {
        const result = detectAIBot(userAgent, referer)
        expect(result).toBeNull()
        return true
      }),
      { numRuns: 100 }
    )
  })

  it('should prioritize User-Agent detection over Referer', () => {
    fc.assert(
      fc.property(knownBotUserAgentArbitrary, knownBotRefererArbitrary, ({ userAgent, botName: uaBotName }, { referer }) => {
        const result = detectAIBot(userAgent, referer)
        expect(result).not.toBeNull()
        expect(result?.name).toBe(uaBotName)
        expect(['both', 'user_agent']).toContain(result?.detectionMethod)
        return true
      }),
      { numRuns: 100 }
    )
  })
})

/**
 * Feature: agent-brand-showcase, Property 30: 立即持久化
 * Validates: Requirements 8.4
 */
describe('Property 30: 立即持久化（防刷验证）', () => {
  it('should reject duplicate visits from same IP within cooldown period', () => {
    fc.assert(
      fc.property(
        fc.constantFrom(...getSupportedAIBots()),
        ipAddressArbitrary,
        (aiName, ipAddress) => {
          const recentVisits = [
            {
              ai_name: aiName,
              ip_address: ipAddress,
              visited_at: new Date(Date.now() - 30000).toISOString(),
            },
          ]
          const isValid = validateAIVisit(aiName, ipAddress, recentVisits, 60000)
          expect(isValid).toBe(false)
          return true
        }
      ),
      { numRuns: 100 }
    )
  })

  it('should allow visits from same IP after cooldown period', () => {
    fc.assert(
      fc.property(
        fc.constantFrom(...getSupportedAIBots()),
        ipAddressArbitrary,
        (aiName, ipAddress) => {
          const recentVisits = [
            {
              ai_name: aiName,
              ip_address: ipAddress,
              visited_at: new Date(Date.now() - 120000).toISOString(),
            },
          ]
          const isValid = validateAIVisit(aiName, ipAddress, recentVisits, 60000)
          expect(isValid).toBe(true)
          return true
        }
      ),
      { numRuns: 100 }
    )
  })

  it('should allow visits from different IPs', () => {
    fc.assert(
      fc.property(
        fc.constantFrom(...getSupportedAIBots()),
        ipAddressArbitrary,
        ipAddressArbitrary,
        (aiName, ipAddress1, ipAddress2) => {
          if (ipAddress1 === ipAddress2) return true
          const recentVisits = [
            {
              ai_name: aiName,
              ip_address: ipAddress1,
              visited_at: new Date(Date.now() - 30000).toISOString(),
            },
          ]
          const isValid = validateAIVisit(aiName, ipAddress2, recentVisits, 60000)
          expect(isValid).toBe(true)
          return true
        }
      ),
      { numRuns: 100 }
    )
  })

  it('should allow visits when IP is null', () => {
    fc.assert(
      fc.property(fc.constantFrom(...getSupportedAIBots()), (aiName) => {
        const isValid = validateAIVisit(aiName, null, [], 60000)
        expect(isValid).toBe(true)
        return true
      }),
      { numRuns: 100 }
    )
  })
})


// 单元测试
describe('detectBotFromUserAgent', () => {
  it('should detect ChatGPT bot', () => {
    expect(detectBotFromUserAgent('ChatGPT-User')).toBe('ChatGPT')
    expect(detectBotFromUserAgent('GPTBot/1.0')).toBe('ChatGPT')
    expect(detectBotFromUserAgent('Mozilla/5.0 (compatible; OAI-SearchBot/1.0)')).toBe('ChatGPT')
  })

  it('should detect Claude bot', () => {
    expect(detectBotFromUserAgent('ClaudeBot/1.0')).toBe('Claude')
    expect(detectBotFromUserAgent('anthropic-ai')).toBe('Claude')
  })

  it('should detect Perplexity bot', () => {
    expect(detectBotFromUserAgent('PerplexityBot')).toBe('Perplexity')
  })

  it('should return null for normal user agents', () => {
    expect(detectBotFromUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0')).toBeNull()
  })

  it('should return null for empty string', () => {
    expect(detectBotFromUserAgent('')).toBeNull()
  })
})

describe('detectBotFromReferer', () => {
  it('should detect ChatGPT from referer', () => {
    expect(detectBotFromReferer('https://chat.openai.com/')).toBe('ChatGPT')
    expect(detectBotFromReferer('https://chatgpt.com/c/123')).toBe('ChatGPT')
  })

  it('should detect Claude from referer', () => {
    expect(detectBotFromReferer('https://claude.ai/chat')).toBe('Claude')
  })

  it('should detect Perplexity from referer', () => {
    expect(detectBotFromReferer('https://perplexity.ai/search')).toBe('Perplexity')
  })

  it('should return null for normal referers', () => {
    expect(detectBotFromReferer('https://www.google.com/')).toBeNull()
  })

  it('should return null for empty string', () => {
    expect(detectBotFromReferer('')).toBeNull()
  })
})

describe('detectAIBot', () => {
  it('should detect bot from User-Agent only', () => {
    const result = detectAIBot('GPTBot/1.0', '')
    expect(result?.name).toBe('ChatGPT')
    expect(result?.detectionMethod).toBe('user_agent')
  })

  it('should detect bot from Referer only', () => {
    const result = detectAIBot('Mozilla/5.0 Chrome/120.0.0.0', 'https://claude.ai/')
    expect(result?.name).toBe('Claude')
    expect(result?.detectionMethod).toBe('referer')
  })

  it('should detect bot from both sources', () => {
    const result = detectAIBot('GPTBot/1.0', 'https://chat.openai.com/')
    expect(result?.name).toBe('ChatGPT')
    expect(result?.detectionMethod).toBe('both')
  })

  it('should return null when no bot detected', () => {
    const result = detectAIBot('Mozilla/5.0 Chrome/120.0.0.0', 'https://www.google.com/')
    expect(result).toBeNull()
  })
})

describe('getSupportedAIBots', () => {
  it('should return all supported AI bot names', () => {
    const bots = getSupportedAIBots()
    expect(bots).toContain('ChatGPT')
    expect(bots).toContain('Claude')
    expect(bots).toContain('Perplexity')
    expect(bots).toContain('Google Bard')
    expect(bots).toContain('Bing AI')
    expect(bots.length).toBe(AI_BOTS.length)
  })
})

describe('isKnownAIBot', () => {
  it('should return true for known bots', () => {
    expect(isKnownAIBot('ChatGPT')).toBe(true)
    expect(isKnownAIBot('claude')).toBe(true)
    expect(isKnownAIBot('PERPLEXITY')).toBe(true)
  })

  it('should return false for unknown bots', () => {
    expect(isKnownAIBot('UnknownBot')).toBe(false)
    expect(isKnownAIBot('')).toBe(false)
  })
})

describe('getClientIP', () => {
  it('should extract IP from x-forwarded-for header', () => {
    const headers = new Headers()
    headers.set('x-forwarded-for', '192.168.1.1, 10.0.0.1')
    expect(getClientIP(headers)).toBe('192.168.1.1')
  })

  it('should extract IP from x-real-ip header', () => {
    const headers = new Headers()
    headers.set('x-real-ip', '192.168.1.2')
    expect(getClientIP(headers)).toBe('192.168.1.2')
  })

  it('should extract IP from cf-connecting-ip header', () => {
    const headers = new Headers()
    headers.set('cf-connecting-ip', '192.168.1.3')
    expect(getClientIP(headers)).toBe('192.168.1.3')
  })

  it('should return null when no IP headers present', () => {
    const headers = new Headers()
    expect(getClientIP(headers)).toBeNull()
  })

  it('should prioritize x-forwarded-for over other headers', () => {
    const headers = new Headers()
    headers.set('x-forwarded-for', '192.168.1.1')
    headers.set('x-real-ip', '192.168.1.2')
    headers.set('cf-connecting-ip', '192.168.1.3')
    expect(getClientIP(headers)).toBe('192.168.1.1')
  })
})


// 生成搜索引擎爬虫的 User-Agent
const searchEngineBotUserAgentArbitrary = fc.constantFrom(
  'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)',
  'Mozilla/5.0 (compatible; bingbot/2.0; +http://www.bing.com/bingbot.htm)',
  'Mozilla/5.0 (compatible; YandexBot/3.0; +http://yandex.com/bots)',
  'Mozilla/5.0 (compatible; Baiduspider/2.0; +http://www.baidu.com/search/spider.html)',
  'DuckDuckBot/1.0; (+http://duckduckgo.com/duckduckbot.html)',
  'facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)',
  'Twitterbot/1.0',
  'LinkedInBot/1.0 (compatible; Mozilla/5.0; Apache-HttpClient +http://www.linkedin.com)',
  'Slackbot-LinkExpanding 1.0 (+https://api.slack.com/robots)',
  'Mozilla/5.0 (compatible; SemrushBot/7~bl; +http://www.semrush.com/bot.html)'
)

/**
 * Feature: brand-content-ux-upgrade, Property 4: 基于 User Agent 的路由
 * Validates: Requirements 6.1, 6.2, 6.3
 */
describe('Property 4: 基于 User Agent 的路由', () => {
  it('should not redirect AI bots (provide full page)', () => {
    fc.assert(
      fc.property(knownBotUserAgentArbitrary, ({ userAgent }) => {
        const shouldRedirect = shouldRedirectToHome(userAgent)
        expect(shouldRedirect).toBe(false)
        return true
      }),
      { numRuns: 100 }
    )
  })

  it('should not redirect search engine bots (provide full page)', () => {
    fc.assert(
      fc.property(searchEngineBotUserAgentArbitrary, (userAgent) => {
        const shouldRedirect = shouldRedirectToHome(userAgent)
        expect(shouldRedirect).toBe(false)
        return true
      }),
      { numRuns: 100 }
    )
  })

  it('should redirect normal human users to home page', () => {
    fc.assert(
      fc.property(normalUserAgentArbitrary, (userAgent) => {
        const shouldRedirect = shouldRedirectToHome(userAgent)
        expect(shouldRedirect).toBe(true)
        return true
      }),
      { numRuns: 100 }
    )
  })

  it('isBot should return true for AI bots', () => {
    fc.assert(
      fc.property(knownBotUserAgentArbitrary, ({ userAgent }) => {
        expect(isBot(userAgent)).toBe(true)
        return true
      }),
      { numRuns: 100 }
    )
  })

  it('isBot should return true for search engine bots', () => {
    fc.assert(
      fc.property(searchEngineBotUserAgentArbitrary, (userAgent) => {
        expect(isBot(userAgent)).toBe(true)
        return true
      }),
      { numRuns: 100 }
    )
  })

  it('isBot should return false for normal users', () => {
    fc.assert(
      fc.property(normalUserAgentArbitrary, (userAgent) => {
        expect(isBot(userAgent)).toBe(false)
        return true
      }),
      { numRuns: 100 }
    )
  })
})

// 单元测试 - isSearchEngineBot
describe('isSearchEngineBot', () => {
  it('should detect Googlebot', () => {
    expect(isSearchEngineBot('Mozilla/5.0 (compatible; Googlebot/2.1)')).toBe(true)
  })

  it('should detect Bingbot', () => {
    expect(isSearchEngineBot('Mozilla/5.0 (compatible; bingbot/2.0)')).toBe(true)
  })

  it('should detect social media bots', () => {
    expect(isSearchEngineBot('Twitterbot/1.0')).toBe(true)
    expect(isSearchEngineBot('LinkedInBot/1.0')).toBe(true)
    expect(isSearchEngineBot('Slackbot-LinkExpanding 1.0')).toBe(true)
  })

  it('should return false for normal browsers', () => {
    expect(isSearchEngineBot('Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0')).toBe(false)
  })

  it('should return false for empty string', () => {
    expect(isSearchEngineBot('')).toBe(false)
  })
})

// 单元测试 - shouldRedirectToHome
describe('shouldRedirectToHome', () => {
  it('should not redirect GPTBot', () => {
    expect(shouldRedirectToHome('GPTBot/1.0')).toBe(false)
  })

  it('should not redirect ClaudeBot', () => {
    expect(shouldRedirectToHome('ClaudeBot/1.0')).toBe(false)
  })

  it('should not redirect Googlebot', () => {
    expect(shouldRedirectToHome('Mozilla/5.0 (compatible; Googlebot/2.1)')).toBe(false)
  })

  it('should redirect Chrome browser', () => {
    expect(shouldRedirectToHome('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36')).toBe(true)
  })

  it('should redirect Safari browser', () => {
    expect(shouldRedirectToHome('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 Safari/605.1.15')).toBe(true)
  })

  it('should redirect Firefox browser', () => {
    expect(shouldRedirectToHome('Mozilla/5.0 (X11; Linux x86_64; rv:120.0) Gecko/20100101 Firefox/120.0')).toBe(true)
  })

  it('should redirect mobile browsers', () => {
    expect(shouldRedirectToHome('Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 Safari/604.1')).toBe(true)
  })
})
