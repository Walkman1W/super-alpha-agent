/**
 * JSON-LD 生成器属性测试
 * 使用 fast-check 进行属性测试
 * 
 * **功能: agent-scanner-mvp, 属性 20: JSON-LD 生成完整性**
 * 对于任意 Agent 数据，生成的 JSON-LD 应是包含所有必需字段的有效 JSON：
 * @type、name、description、url 和 provider。
 * **验证: 需求 6.1, 6.2, 6.3**
 */

import { describe, it, expect } from 'vitest'
import * as fc from 'fast-check'
import { 
  generateJSONLD, 
  validateJSONLDFields, 
  isValidJSONLDString 
} from './json-ld-generator'
import type { ScannerAgent, SRTier, SRTrack, IOModality } from '@/lib/types/scanner'

// ============================================
// 测试数据生成器
// ============================================

/**
 * 生成有效的 SR 等级
 */
const srTierArb = fc.constantFrom<SRTier>('S', 'A', 'B', 'C')

/**
 * 生成有效的 SR 轨道
 */
const srTrackArb = fc.constantFrom<SRTrack>('OpenSource', 'SaaS', 'Hybrid')

/**
 * 生成有效的 I/O 模态
 */
const ioModalityArb = fc.constantFrom<IOModality>(
  'Text', 'Image', 'Audio', 'JSON', 'Code', 'File', 'Video', 'Unknown'
)

/**
 * 生成有效的 slug (URL 友好的字符串)
 */
const slugArb = fc.stringMatching(/^[a-z0-9][a-z0-9-]{2,48}[a-z0-9]$/)

/**
 * 生成有效的 Agent 名称
 */
const nameArb = fc.string({ minLength: 1, maxLength: 100 })
  .filter(s => s.trim().length > 0)

/**
 * 生成有效的描述
 */
const descriptionArb = fc.option(
  fc.string({ minLength: 10, maxLength: 500 }),
  { nil: null }
)

/**
 * 生成有效的 GitHub URL
 */
const githubUrlArb = fc.option(
  fc.tuple(
    fc.stringMatching(/^[a-zA-Z0-9_-]{1,39}$/),
    fc.stringMatching(/^[a-zA-Z0-9_.-]{1,100}$/)
  ).map(([owner, repo]) => `https://github.com/${owner}/${repo}`),
  { nil: null }
)

/**
 * 生成有效的 Homepage URL
 */
const homepageUrlArb = fc.option(
  fc.webUrl({ validSchemes: ['https'] }),
  { nil: null }
)

/**
 * 生成有效的 SR 分数 (0.0 - 10.0)
 */
const srScoreArb = fc.float({ min: 0, max: 10, noNaN: true })
  .map(n => Math.round(n * 10) / 10)

/**
 * 生成有效的评分明细
 */
const scoreBreakdownArb = fc.record({
  starsScore: fc.float({ min: 0, max: 2, noNaN: true }),
  forksScore: fc.float({ min: 0, max: 1, noNaN: true }),
  vitalityScore: fc.float({ min: 0, max: 2, noNaN: true }),
  readinessScore: fc.float({ min: 0, max: 3, noNaN: true }),
  protocolScore: fc.float({ min: 0, max: 2, noNaN: true }),
  trustScore: fc.float({ min: 0, max: 3, noNaN: true }),
  aeoScore: fc.float({ min: 0, max: 4, noNaN: true }),
  interopScore: fc.float({ min: 0, max: 3, noNaN: true })
})

/**
 * 生成有效的日期 (避免 Invalid Date)
 */
const validDateArb = fc.date({ 
  min: new Date('2020-01-01'), 
  max: new Date('2030-12-31') 
})

/**
 * 生成完整的 ScannerAgent 对象
 */
const scannerAgentArb: fc.Arbitrary<ScannerAgent> = fc.record({
  id: fc.uuid(),
  slug: slugArb,
  name: nameArb,
  description: descriptionArb,
  githubUrl: githubUrlArb,
  homepageUrl: homepageUrlArb,
  apiDocsUrl: fc.option(fc.webUrl({ validSchemes: ['https'] }), { nil: null }),
  srScore: srScoreArb,
  srTier: srTierArb,
  srTrack: srTrackArb,
  scoreGithub: srScoreArb,
  scoreSaas: srScoreArb,
  scoreBreakdown: scoreBreakdownArb,
  isMcp: fc.boolean(),
  isClaimed: fc.boolean(),
  isVerified: fc.boolean(),
  inputTypes: fc.array(ioModalityArb, { minLength: 0, maxLength: 5 }),
  outputTypes: fc.array(ioModalityArb, { minLength: 0, maxLength: 5 }),
  metaTitle: fc.option(fc.string({ minLength: 1, maxLength: 100 }), { nil: null }),
  metaDescription: fc.option(fc.string({ minLength: 1, maxLength: 300 }), { nil: null }),
  ogImage: fc.option(fc.webUrl({ validSchemes: ['https'] }), { nil: null }),
  jsonLd: fc.option(fc.constant({}), { nil: null }),
  githubStars: fc.nat({ max: 100000 }),
  githubForks: fc.nat({ max: 50000 }),
  githubLastCommit: fc.option(validDateArb, { nil: null }),
  lastScannedAt: fc.option(validDateArb, { nil: null }),
  createdAt: validDateArb,
  updatedAt: validDateArb
})

// ============================================
// 属性测试
// ============================================

describe('JSON-LD Generator Property Tests', () => {
  /**
   * **功能: agent-scanner-mvp, 属性 20: JSON-LD 生成完整性**
   * 对于任意 Agent 数据，生成的 JSON-LD 应是包含所有必需字段的有效 JSON：
   * @type、name、description、url 和 provider。
   * **验证: 需求 6.1, 6.2, 6.3**
   */
  describe('Property 20: JSON-LD Generation Completeness', () => {
    it('should generate JSON-LD with all required fields for any valid agent', () => {
      fc.assert(
        fc.property(scannerAgentArb, (agent) => {
          const result = generateJSONLD(agent)
          
          // 验证返回结构
          expect(result).toHaveProperty('jsonLd')
          expect(result).toHaveProperty('jsonLdString')
          expect(result).toHaveProperty('deploymentInstructions')
          
          // 验证必需字段存在
          const jsonLd = result.jsonLd as Record<string, unknown>
          expect(jsonLd['@context']).toBe('https://schema.org')
          expect(jsonLd['@type']).toBe('SoftwareApplication')
          expect(jsonLd['name']).toBe(agent.name)
          expect(jsonLd['description']).toBeDefined()
          expect(jsonLd['url']).toBeDefined()
          expect(jsonLd['provider']).toBeDefined()
          
          // 验证 provider 结构
          const provider = jsonLd['provider'] as Record<string, unknown>
          expect(provider['@type']).toBe('Organization')
          expect(provider['name']).toBeDefined()
        }),
        { numRuns: 100 }
      )
    })

    it('should always produce valid JSON in jsonLdString', () => {
      fc.assert(
        fc.property(scannerAgentArb, (agent) => {
          const result = generateJSONLD(agent)
          
          // 验证 jsonLdString 是有效的 JSON
          expect(isValidJSONLDString(result.jsonLdString)).toBe(true)
        }),
        { numRuns: 100 }
      )
    })

    it('should pass validateJSONLDFields for all generated JSON-LD', () => {
      fc.assert(
        fc.property(scannerAgentArb, (agent) => {
          const result = generateJSONLD(agent)
          
          // 验证所有必需字段存在
          expect(validateJSONLDFields(result.jsonLd)).toBe(true)
        }),
        { numRuns: 100 }
      )
    })
  })

  describe('JSON-LD Content Correctness', () => {
    it('should use agent name as JSON-LD name', () => {
      fc.assert(
        fc.property(scannerAgentArb, (agent) => {
          const result = generateJSONLD(agent)
          const jsonLd = result.jsonLd as Record<string, unknown>
          
          expect(jsonLd['name']).toBe(agent.name)
        }),
        { numRuns: 100 }
      )
    })

    it('should include description or fallback', () => {
      fc.assert(
        fc.property(scannerAgentArb, (agent) => {
          const result = generateJSONLD(agent)
          const jsonLd = result.jsonLd as Record<string, unknown>
          
          if (agent.description) {
            expect(jsonLd['description']).toBe(agent.description)
          } else {
            expect(jsonLd['description']).toContain(agent.name)
          }
        }),
        { numRuns: 100 }
      )
    })

    it('should prefer homepage URL over GitHub URL', () => {
      fc.assert(
        fc.property(scannerAgentArb, (agent) => {
          const result = generateJSONLD(agent)
          const jsonLd = result.jsonLd as Record<string, unknown>
          
          if (agent.homepageUrl) {
            expect(jsonLd['url']).toBe(agent.homepageUrl)
          } else if (agent.githubUrl) {
            expect(jsonLd['url']).toBe(agent.githubUrl)
          } else {
            expect(jsonLd['url']).toContain(agent.slug)
          }
        }),
        { numRuns: 100 }
      )
    })

    it('should include codeRepository when GitHub URL exists', () => {
      fc.assert(
        fc.property(scannerAgentArb, (agent) => {
          const result = generateJSONLD(agent)
          const jsonLd = result.jsonLd as Record<string, unknown>
          
          if (agent.githubUrl) {
            expect(jsonLd['codeRepository']).toBe(agent.githubUrl)
          }
        }),
        { numRuns: 100 }
      )
    })

    it('should include aggregateRating when SR score > 0', () => {
      fc.assert(
        fc.property(scannerAgentArb, (agent) => {
          const result = generateJSONLD(agent)
          const jsonLd = result.jsonLd as Record<string, unknown>
          
          if (agent.srScore > 0) {
            expect(jsonLd['aggregateRating']).toBeDefined()
            const rating = jsonLd['aggregateRating'] as Record<string, unknown>
            expect(rating['ratingValue']).toBe(agent.srScore.toFixed(1))
            expect(rating['bestRating']).toBe('10')
            expect(rating['worstRating']).toBe('0')
          }
        }),
        { numRuns: 100 }
      )
    })

    it('should include image when ogImage exists', () => {
      fc.assert(
        fc.property(scannerAgentArb, (agent) => {
          const result = generateJSONLD(agent)
          const jsonLd = result.jsonLd as Record<string, unknown>
          
          if (agent.ogImage) {
            expect(jsonLd['image']).toBe(agent.ogImage)
            expect(jsonLd['screenshot']).toBe(agent.ogImage)
          }
        }),
        { numRuns: 100 }
      )
    })
  })

  describe('Deployment Instructions', () => {
    it('should always generate non-empty deployment instructions', () => {
      fc.assert(
        fc.property(scannerAgentArb, (agent) => {
          const result = generateJSONLD(agent)
          
          expect(result.deploymentInstructions).toBeDefined()
          expect(result.deploymentInstructions.length).toBeGreaterThan(0)
        }),
        { numRuns: 100 }
      )
    })

    it('should include agent name in deployment instructions', () => {
      fc.assert(
        fc.property(scannerAgentArb, (agent) => {
          const result = generateJSONLD(agent)
          
          expect(result.deploymentInstructions).toContain(agent.name)
        }),
        { numRuns: 100 }
      )
    })

    it('should include SR score in deployment instructions', () => {
      fc.assert(
        fc.property(scannerAgentArb, (agent) => {
          const result = generateJSONLD(agent)
          
          expect(result.deploymentInstructions).toContain(agent.srScore.toFixed(1))
        }),
        { numRuns: 100 }
      )
    })

    it('should include tier in deployment instructions', () => {
      fc.assert(
        fc.property(scannerAgentArb, (agent) => {
          const result = generateJSONLD(agent)
          
          expect(result.deploymentInstructions).toContain(agent.srTier)
        }),
        { numRuns: 100 }
      )
    })
  })

  describe('Feature List Generation', () => {
    it('should include MCP in features when isMcp is true', () => {
      fc.assert(
        fc.property(
          scannerAgentArb.filter(a => a.isMcp),
          (agent) => {
            const result = generateJSONLD(agent)
            const jsonLd = result.jsonLd as Record<string, unknown>
            const features = jsonLd['featureList'] as string[] | undefined
            
            expect(features).toBeDefined()
            expect(features?.some(f => f.includes('MCP'))).toBe(true)
          }
        ),
        { numRuns: 50 }
      )
    })

    it('should include Signal Rank in features', () => {
      fc.assert(
        fc.property(scannerAgentArb, (agent) => {
          const result = generateJSONLD(agent)
          const jsonLd = result.jsonLd as Record<string, unknown>
          const features = jsonLd['featureList'] as string[] | undefined
          
          expect(features).toBeDefined()
          expect(features?.some(f => f.includes('Signal Rank'))).toBe(true)
        }),
        { numRuns: 100 }
      )
    })
  })

  describe('Keywords Generation', () => {
    it('should always include AI Agent in keywords', () => {
      fc.assert(
        fc.property(scannerAgentArb, (agent) => {
          const result = generateJSONLD(agent)
          const jsonLd = result.jsonLd as Record<string, unknown>
          
          expect(jsonLd['keywords']).toBeDefined()
          expect(jsonLd['keywords']).toContain('AI Agent')
        }),
        { numRuns: 100 }
      )
    })

    it('should include MCP in keywords when isMcp is true', () => {
      fc.assert(
        fc.property(
          scannerAgentArb.filter(a => a.isMcp),
          (agent) => {
            const result = generateJSONLD(agent)
            const jsonLd = result.jsonLd as Record<string, unknown>
            
            expect(jsonLd['keywords']).toContain('MCP')
          }
        ),
        { numRuns: 50 }
      )
    })

    it('should include track-specific keywords', () => {
      fc.assert(
        fc.property(scannerAgentArb, (agent) => {
          const result = generateJSONLD(agent)
          const jsonLd = result.jsonLd as Record<string, unknown>
          const keywords = jsonLd['keywords'] as string
          
          if (agent.srTrack === 'OpenSource') {
            expect(keywords).toContain('Open Source')
          } else if (agent.srTrack === 'SaaS') {
            expect(keywords).toContain('SaaS')
          } else {
            expect(keywords).toContain('Hybrid')
          }
        }),
        { numRuns: 100 }
      )
    })
  })
})

// ============================================
// 辅助函数测试
// ============================================

describe('JSON-LD Validation Functions', () => {
  describe('validateJSONLDFields', () => {
    it('should return true for valid JSON-LD objects', () => {
      const validJsonLd = {
        '@context': 'https://schema.org',
        '@type': 'SoftwareApplication',
        name: 'Test Agent',
        description: 'A test agent',
        url: 'https://example.com',
        provider: { '@type': 'Organization', name: 'Test' }
      }
      
      expect(validateJSONLDFields(validJsonLd)).toBe(true)
    })

    it('should return false for missing required fields', () => {
      const invalidJsonLd = {
        '@context': 'https://schema.org',
        '@type': 'SoftwareApplication',
        name: 'Test Agent'
        // missing description, url, provider
      }
      
      expect(validateJSONLDFields(invalidJsonLd)).toBe(false)
    })
  })

  describe('isValidJSONLDString', () => {
    it('should return true for valid JSON-LD script tags', () => {
      const validString = `<script type="application/ld+json">
{"@context": "https://schema.org", "@type": "SoftwareApplication"}
</script>`
      
      expect(isValidJSONLDString(validString)).toBe(true)
    })

    it('should return false for invalid JSON', () => {
      const invalidString = `<script type="application/ld+json">
{invalid json}
</script>`
      
      expect(isValidJSONLDString(invalidString)).toBe(false)
    })

    it('should return false for non-script content', () => {
      expect(isValidJSONLDString('just some text')).toBe(false)
    })
  })
})
