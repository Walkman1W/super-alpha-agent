/**
 * SaaS Scanner 属性测试
 * 使用 fast-check 进行基于属性的测试
 * Requirements: 3.1-3.7
 */

import { describe, it, expect } from 'vitest'
import * as fc from 'fast-check'
import {
  isHttpsUrl,
  extractSocialLinks,
  detectJsonLd,
  extractMetaTags,
  extractOgTags,
  detectApiDocsPath,
  detectIntegrationKeywords,
  detectLoginButton,
  parseSaaSScanResult,
  API_DOCS_PATHS
} from './saas-scanner'
import {
  calculateTrustScore,
  calculateAeoScore,
  calculateInteropScore,
  calculateTrackBScore
} from './sr-calculator'
import { SOCIAL_DOMAINS, INTEGRATION_KEYWORDS } from '@/lib/types/scanner'

describe('SaaS Scanner - Track B 属性测试', () => {
  /**
   * **功能: agent-scanner-mvp, 属性 10: 社交链接检测**
   * 对于任意 HTML 内容，SaaS 扫描器应正确计数和提取社交链接（Twitter、GitHub、Discord、LinkedIn），如果数量 >= 2 则奖励 1.0 分。
   * **验证: 需求 3.2**
   */
  describe('属性 10: 社交链接检测', () => {
    it('应正确提取社交链接', () => {
      fc.assert(
        fc.property(
          fc.array(fc.constantFrom(...SOCIAL_DOMAINS), { minLength: 0, maxLength: 5 }),
          (domains) => {
            // 构建包含社交链接的 HTML，每个链接使用唯一路径
            const links = domains.map((domain, i) => `<a href="https://${domain}/user${i}">Link</a>`)
            const html = `<html><body>${links.join('')}</body></html>`
            
            const extracted = extractSocialLinks(html)
            
            // 验证提取的链接数量等于输入的域名数量 (每个链接路径唯一)
            expect(extracted.length).toBe(domains.length)
            
            // 验证每个提取的链接都包含社交域名
            extracted.forEach(link => {
              const hasSocialDomain = SOCIAL_DOMAINS.some(d => link.includes(d))
              expect(hasSocialDomain).toBe(true)
            })
          }
        ),
        { numRuns: 100 }
      )
    })

    it('社交链接 >= 2 时信任分数应 +1.0', () => {
      fc.assert(
        fc.property(
          fc.nat(10),
          fc.boolean(),
          fc.boolean(),
          (socialCount, httpsValid, isClaimed) => {
            const score = calculateTrustScore(httpsValid, socialCount, isClaimed)
            
            let expected = 0
            if (httpsValid) expected += 1.0
            if (socialCount >= 2) expected += 1.0
            if (isClaimed) expected += 1.0
            
            expect(score).toBe(expected)
          }
        ),
        { numRuns: 100 }
      )
    })
  })

  /**
   * **功能: agent-scanner-mvp, 属性 11: JSON-LD 检测**
   * 对于任意 HTML 内容，SaaS 扫描器应当且仅当内容包含有效的 `<script type="application/ld+json">` 标签时检测到 JSON-LD 存在。
   * **验证: 需求 3.3**
   */
  describe('属性 11: JSON-LD 检测', () => {
    it('有效 JSON-LD 应被检测到', () => {
      const validJsonLd = {
        '@context': 'https://schema.org',
        '@type': 'SoftwareApplication',
        name: 'Test App'
      }
      
      const html = `
        <html>
          <head>
            <script type="application/ld+json">${JSON.stringify(validJsonLd)}</script>
          </head>
        </html>
      `
      
      const result = detectJsonLd(html)
      expect(result.hasJsonLd).toBe(true)
      expect(result.content).toEqual(validJsonLd)
    })

    it('无效 JSON 应返回 false', () => {
      const html = `
        <html>
          <head>
            <script type="application/ld+json">{ invalid json }</script>
          </head>
        </html>
      `
      
      const result = detectJsonLd(html)
      expect(result.hasJsonLd).toBe(false)
      expect(result.content).toBeNull()
    })

    it('没有 JSON-LD 标签应返回 false', () => {
      const html = '<html><head></head><body></body></html>'
      
      const result = detectJsonLd(html)
      expect(result.hasJsonLd).toBe(false)
      expect(result.content).toBeNull()
    })

    it('JSON-LD 存在时 AEO 分数应 +2.0', () => {
      fc.assert(
        fc.property(
          fc.boolean(),
          fc.boolean(),
          fc.boolean(),
          (hasBasicMeta, hasJsonLd, hasOgTags) => {
            const score = calculateAeoScore(hasBasicMeta, hasJsonLd, hasOgTags)
            
            let expected = 0
            if (hasBasicMeta) expected += 1.0
            if (hasJsonLd) expected += 2.0
            if (hasOgTags) expected += 1.0
            
            expect(score).toBe(expected)
          }
        ),
        { numRuns: 100 }
      )
    })
  })

  /**
   * **功能: agent-scanner-mvp, 属性 12: Meta 标签完整性**
   * 对于任意 HTML 内容，SaaS 扫描器应当且仅当 title、meta description 和 H1 标签都存在且非空时奖励 1.0 分。
   * **验证: 需求 3.4**
   */
  describe('属性 12: Meta 标签完整性', () => {
    it('完整的 Meta 标签应被正确检测', () => {
      const html = `
        <html>
          <head>
            <title>Test Title</title>
            <meta name="description" content="Test description">
          </head>
          <body>
            <h1>Main Heading</h1>
          </body>
        </html>
      `
      
      const result = extractMetaTags(html)
      expect(result.title).toBe('Test Title')
      expect(result.description).toBe('Test description')
      expect(result.hasH1).toBe(true)
    })

    it('缺少任一标签应返回不完整', () => {
      // 缺少 title
      const html1 = `
        <html>
          <head>
            <meta name="description" content="Test">
          </head>
          <body><h1>Heading</h1></body>
        </html>
      `
      const result1 = extractMetaTags(html1)
      expect(result1.title).toBeNull()
      
      // 缺少 description
      const html2 = `
        <html>
          <head><title>Title</title></head>
          <body><h1>Heading</h1></body>
        </html>
      `
      const result2 = extractMetaTags(html2)
      expect(result2.description).toBeNull()
      
      // 缺少 H1
      const html3 = `
        <html>
          <head>
            <title>Title</title>
            <meta name="description" content="Test">
          </head>
          <body></body>
        </html>
      `
      const result3 = extractMetaTags(html3)
      expect(result3.hasH1).toBe(false)
    })
  })


  /**
   * **功能: agent-scanner-mvp, 属性 13: Open Graph 标签检测**
   * 对于任意 HTML 内容，SaaS 扫描器应当且仅当 og:image 和 og:title meta 标签都存在时奖励 1.0 分。
   * **验证: 需求 3.5**
   */
  describe('属性 13: Open Graph 标签检测', () => {
    it('完整的 OG 标签应被检测到', () => {
      const html = `
        <html>
          <head>
            <meta property="og:title" content="Test OG Title">
            <meta property="og:image" content="https://example.com/image.png">
          </head>
        </html>
      `
      
      const result = extractOgTags(html)
      expect(result.hasOgTags).toBe(true)
      expect(result.ogTitle).toBe('Test OG Title')
      expect(result.ogImage).toBe('https://example.com/image.png')
    })

    it('缺少任一 OG 标签应返回 false', () => {
      // 只有 og:title
      const html1 = `
        <html>
          <head>
            <meta property="og:title" content="Test">
          </head>
        </html>
      `
      const result1 = extractOgTags(html1)
      expect(result1.hasOgTags).toBe(false)
      
      // 只有 og:image
      const html2 = `
        <html>
          <head>
            <meta property="og:image" content="https://example.com/image.png">
          </head>
        </html>
      `
      const result2 = extractOgTags(html2)
      expect(result2.hasOgTags).toBe(false)
    })

    it('反向属性顺序也应被检测到', () => {
      const html = `
        <html>
          <head>
            <meta content="Test OG Title" property="og:title">
            <meta content="https://example.com/image.png" property="og:image">
          </head>
        </html>
      `
      
      const result = extractOgTags(html)
      expect(result.hasOgTags).toBe(true)
    })
  })

  /**
   * **功能: agent-scanner-mvp, 属性 14: API 文档路径检测**
   * 对于任意页面上的 URL/链接集合，SaaS 扫描器应在任何路径包含 '/docs'、'/api' 或 '/developers' 时检测到 API 文档。
   * **验证: 需求 3.6**
   */
  describe('属性 14: API 文档路径检测', () => {
    it('应检测到 API 文档路径', () => {
      fc.assert(
        fc.property(
          fc.constantFrom(...API_DOCS_PATHS),
          (path) => {
            const html = `<html><body><a href="${path}">Docs</a></body></html>`
            const result = detectApiDocsPath(html, 'https://example.com')
            
            expect(result.hasApiDocsPath).toBe(true)
            expect(result.apiDocsUrl).toContain(path)
          }
        ),
        { numRuns: 100 }
      )
    })

    it('没有 API 文档路径时应返回 false', () => {
      const html = '<html><body><a href="/about">About</a></body></html>'
      const result = detectApiDocsPath(html, 'https://example.com')
      
      expect(result.hasApiDocsPath).toBe(false)
      expect(result.apiDocsUrl).toBeNull()
    })

    it('API 文档存在时互操作性分数应 +1.5', () => {
      fc.assert(
        fc.property(
          fc.boolean(),
          fc.boolean(),
          fc.boolean(),
          (hasApiDocsPath, hasIntegrationKeywords, hasLoginButton) => {
            const score = calculateInteropScore(hasApiDocsPath, hasIntegrationKeywords, hasLoginButton)
            
            let expected = 0
            if (hasApiDocsPath) expected += 1.5
            if (hasIntegrationKeywords) expected += 1.0
            if (hasLoginButton) expected += 0.5
            
            expect(score).toBe(expected)
          }
        ),
        { numRuns: 100 }
      )
    })
  })

  /**
   * **功能: agent-scanner-mvp, 属性 15: 集成关键词检测**
   * 对于任意文本内容，SaaS 扫描器应在内容包含以下任一关键词时检测到集成能力：'sdk'、'webhook'、'zapier'、'plugin'（不区分大小写）。
   * **验证: 需求 3.7**
   */
  describe('属性 15: 集成关键词检测', () => {
    it('应检测到集成关键词', () => {
      fc.assert(
        fc.property(
          fc.constantFrom(...INTEGRATION_KEYWORDS),
          fc.string({ minLength: 0, maxLength: 50 }),
          fc.string({ minLength: 0, maxLength: 50 }),
          (keyword, prefix, suffix) => {
            const content = `${prefix} ${keyword} ${suffix}`
            const result = detectIntegrationKeywords(content)
            
            expect(result.hasIntegrationKeywords).toBe(true)
            expect(result.keywords).toContain(keyword)
          }
        ),
        { numRuns: 100 }
      )
    })

    it('大小写不敏感', () => {
      const variations = ['SDK', 'Sdk', 'sdk', 'WEBHOOK', 'Webhook', 'webhook']
      
      variations.forEach(keyword => {
        const result = detectIntegrationKeywords(keyword)
        expect(result.hasIntegrationKeywords).toBe(true)
      })
    })

    it('没有集成关键词时应返回 false', () => {
      const content = 'This is a simple website without any special features'
      const result = detectIntegrationKeywords(content)
      
      expect(result.hasIntegrationKeywords).toBe(false)
      expect(result.keywords).toHaveLength(0)
    })
  })

  /**
   * Track B 总分计算测试
   */
  describe('Track B 总分计算', () => {
    it('应正确计算 Track B 总分', () => {
      fc.assert(
        fc.property(
          fc.boolean(), // httpsValid
          fc.nat(5),    // socialLinksCount
          fc.boolean(), // hasBasicMeta
          fc.boolean(), // hasJsonLd
          fc.boolean(), // hasOgTags
          fc.boolean(), // hasApiDocsPath
          fc.boolean(), // hasIntegrationKeywords
          fc.boolean(), // hasLoginButton
          fc.boolean(), // isClaimed
          (httpsValid, socialLinksCount, hasBasicMeta, hasJsonLd, hasOgTags, hasApiDocsPath, hasIntegrationKeywords, hasLoginButton, isClaimed) => {
            const scanResult = {
              httpsValid,
              sslValidMonths: httpsValid ? 12 : 0,
              socialLinks: Array(socialLinksCount).fill('https://twitter.com/test'),
              hasJsonLd,
              jsonLdContent: hasJsonLd ? { '@type': 'Test' } : null,
              hasBasicMeta,
              metaTitle: hasBasicMeta ? 'Title' : null,
              metaDescription: hasBasicMeta ? 'Description' : null,
              hasH1: hasBasicMeta,
              hasOgTags,
              ogImage: hasOgTags ? 'https://example.com/image.png' : null,
              ogTitle: hasOgTags ? 'OG Title' : null,
              hasApiDocsPath,
              apiDocsUrl: hasApiDocsPath ? '/docs' : null,
              hasIntegrationKeywords,
              integrationKeywords: hasIntegrationKeywords ? ['sdk'] : [],
              hasLoginButton,
              pageContent: ''
            }
            
            const result = calculateTrackBScore(scanResult, isClaimed)
            
            // 验证分数在有效范围内
            expect(result.score).toBeGreaterThanOrEqual(0)
            expect(result.score).toBeLessThanOrEqual(10.0)
            
            // 验证 breakdown 存在
            expect(result.breakdown.trustScore).toBeDefined()
            expect(result.breakdown.aeoScore).toBeDefined()
            expect(result.breakdown.interopScore).toBeDefined()
            
            // 验证总分等于各项之和
            const expectedTotal = 
              (result.breakdown.trustScore || 0) + 
              (result.breakdown.aeoScore || 0) + 
              (result.breakdown.interopScore || 0)
            expect(result.score).toBe(expectedTotal)
          }
        ),
        { numRuns: 100 }
      )
    })
  })

  /**
   * HTTPS 验证测试
   */
  describe('HTTPS 验证', () => {
    it('HTTPS URL 应返回 true', () => {
      expect(isHttpsUrl('https://example.com')).toBe(true)
      expect(isHttpsUrl('https://example.com/path')).toBe(true)
    })

    it('HTTP URL 应返回 false', () => {
      expect(isHttpsUrl('http://example.com')).toBe(false)
    })

    it('无效 URL 应返回 false', () => {
      expect(isHttpsUrl('not-a-url')).toBe(false)
      expect(isHttpsUrl('')).toBe(false)
    })
  })

  /**
   * 登录按钮检测测试
   */
  describe('登录按钮检测', () => {
    it('应检测到登录按钮', () => {
      const htmlWithLogin = '<html><body><button>Login</button></body></html>'
      expect(detectLoginButton(htmlWithLogin)).toBe(true)
      
      const htmlWithSignIn = '<html><body><a href="/signin">Sign In</a></body></html>'
      expect(detectLoginButton(htmlWithSignIn)).toBe(true)
      
      const htmlWithGetStarted = '<html><body><button>Get Started</button></body></html>'
      expect(detectLoginButton(htmlWithGetStarted)).toBe(true)
    })

    it('没有登录按钮时应返回 false', () => {
      const html = '<html><body><button>Submit</button></body></html>'
      expect(detectLoginButton(html)).toBe(false)
    })
  })

  /**
   * parseSaaSScanResult 集成测试
   */
  describe('parseSaaSScanResult 集成测试', () => {
    it('应正确解析完整的 HTML', () => {
      const html = `
        <html>
          <head>
            <title>Test App</title>
            <meta name="description" content="A test application">
            <meta property="og:title" content="Test App OG">
            <meta property="og:image" content="https://example.com/og.png">
            <script type="application/ld+json">{"@type":"SoftwareApplication","name":"Test"}</script>
          </head>
          <body>
            <h1>Welcome to Test App</h1>
            <a href="https://twitter.com/testapp">Twitter</a>
            <a href="https://github.com/testapp">GitHub</a>
            <a href="/docs">Documentation</a>
            <button>Sign Up</button>
            <p>We offer SDK and webhook integrations.</p>
          </body>
        </html>
      `
      
      const result = parseSaaSScanResult(html, 'https://example.com', true, 12)
      
      expect(result.httpsValid).toBe(true)
      expect(result.socialLinks.length).toBeGreaterThanOrEqual(2)
      expect(result.hasJsonLd).toBe(true)
      expect(result.hasBasicMeta).toBe(true)
      expect(result.hasOgTags).toBe(true)
      expect(result.hasApiDocsPath).toBe(true)
      expect(result.hasIntegrationKeywords).toBe(true)
      expect(result.hasLoginButton).toBe(true)
    })
  })
})
