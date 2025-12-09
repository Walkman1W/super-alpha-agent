/**
 * 提示词生成器属性测试
 * 使用 fast-check 进行基于属性的测试
 * 
 * 测试属性:
 * - 属性 24: Interface Prompt 生成
 * - 属性 25: API 密钥占位符
 * - 属性 26: 自然语言回退
 * 
 * 验证: 需求 8.1-8.6
 */

import { describe, it, expect } from 'vitest'
import * as fc from 'fast-check'
import {
  generatePrompt,
  detectRequiresApiKey,
  hasStructuredAPI,
  validatePromptContent,
  hasApiKeyPlaceholder,
  isValidNaturalLanguageFallback
} from './prompt-generator'
import type { ScannerAgent, SRTier, SRTrack, IOModality, SRScoreBreakdown } from '@/lib/types/scanner'

// ============================================
// 测试数据生成器
// ============================================

/**
 * 生成有效的 SR 等级
 */
const tierArb = fc.constantFrom<SRTier>('S', 'A', 'B', 'C')

/**
 * 生成有效的 SR 轨道
 */
const trackArb = fc.constantFrom<SRTrack>('OpenSource', 'SaaS', 'Hybrid')

/**
 * 生成有效的 I/O 模态
 */
const modalityArb = fc.constantFrom<IOModality>(
  'Text', 'Image', 'Audio', 'JSON', 'Code', 'File', 'Video', 'Unknown'
)

/**
 * 生成有效的 Agent 名称 (非空字符串)
 */
const agentNameArb = fc.string({ minLength: 1, maxLength: 50 })
  .filter(s => s.trim().length > 0)
  .map(s => s.trim())

/**
 * 生成有效的 slug
 */
const slugArb = fc.string({ minLength: 1, maxLength: 30 })
  .filter(s => /^[a-z0-9-]+$/.test(s) || s.trim().length > 0)
  .map(s => s.toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-'))

/**
 * 生成可选的 URL
 */
const optionalUrlArb = fc.option(
  fc.webUrl({ validSchemes: ['https'] }),
  { nil: null }
)

/**
 * 生成可选的描述
 */
const optionalDescriptionArb = fc.option(
  fc.string({ minLength: 10, maxLength: 200 }),
  { nil: null }
)

/**
 * 生成评分明细
 */
const scoreBreakdownArb: fc.Arbitrary<SRScoreBreakdown> = fc.record({
  starsScore: fc.double({ min: 0, max: 2, noNaN: true }),
  forksScore: fc.double({ min: 0, max: 1, noNaN: true }),
  vitalityScore: fc.double({ min: 0, max: 2, noNaN: true }),
  readinessScore: fc.double({ min: 0, max: 3, noNaN: true }),
  protocolScore: fc.double({ min: 0, max: 2, noNaN: true }),
  trustScore: fc.double({ min: 0, max: 3, noNaN: true }),
  aeoScore: fc.double({ min: 0, max: 4, noNaN: true }),
  interopScore: fc.double({ min: 0, max: 3, noNaN: true })
})

/**
 * 生成完整的 ScannerAgent
 */
const scannerAgentArb: fc.Arbitrary<ScannerAgent> = fc.record({
  id: fc.uuid(),
  slug: slugArb,
  name: agentNameArb,
  description: optionalDescriptionArb,
  githubUrl: optionalUrlArb,
  homepageUrl: optionalUrlArb,
  apiDocsUrl: optionalUrlArb,
  srScore: fc.double({ min: 0, max: 10, noNaN: true }),
  srTier: tierArb,
  srTrack: trackArb,
  scoreGithub: fc.double({ min: 0, max: 10, noNaN: true }),
  scoreSaas: fc.double({ min: 0, max: 10, noNaN: true }),
  scoreBreakdown: scoreBreakdownArb,
  isMcp: fc.boolean(),
  isClaimed: fc.boolean(),
  isVerified: fc.boolean(),
  inputTypes: fc.array(modalityArb, { minLength: 0, maxLength: 4 }),
  outputTypes: fc.array(modalityArb, { minLength: 0, maxLength: 4 }),
  metaTitle: fc.option(fc.string({ minLength: 1, maxLength: 100 }), { nil: null }),
  metaDescription: fc.option(fc.string({ minLength: 1, maxLength: 200 }), { nil: null }),
  ogImage: optionalUrlArb,
  jsonLd: fc.option(fc.constant({ '@type': 'SoftwareApplication' }), { nil: null }),
  githubStars: fc.nat({ max: 100000 }),
  githubForks: fc.nat({ max: 50000 }),
  githubLastCommit: fc.option(fc.date(), { nil: null }),
  lastScannedAt: fc.option(fc.date(), { nil: null }),
  createdAt: fc.date(),
  updatedAt: fc.date()
})

/**
 * 生成需要 API 密钥的 Agent (描述中包含 API 关键词)
 */
const agentRequiringApiKeyArb: fc.Arbitrary<ScannerAgent> = scannerAgentArb.map(agent => ({
  ...agent,
  description: `${agent.description || ''} This service requires an API key for authentication.`
}))

/**
 * 生成没有结构化 API 的 Track B Agent
 */
const trackBAgentWithoutApiArb: fc.Arbitrary<ScannerAgent> = scannerAgentArb.map(agent => ({
  ...agent,
  srTrack: 'SaaS' as SRTrack,
  apiDocsUrl: null,
  githubUrl: null,
  isMcp: false,
  scoreBreakdown: {
    ...agent.scoreBreakdown,
    readinessScore: 0 // 没有 OpenAPI 文件
  }
}))

// ============================================
// 属性测试
// ============================================

describe('Prompt Generator Property Tests', () => {
  /**
   * **功能: agent-scanner-mvp, 属性 24: Interface Prompt 生成**
   * 对于任意 Agent 数据，提示词生成器应生成包含 Agent 名称和能力描述的非空提示词。
   * **验证: 需求 8.1, 8.2**
   */
  describe('Property 24: Interface Prompt Generation', () => {
    it('should generate non-empty prompt containing agent name for any agent', () => {
      fc.assert(
        fc.property(scannerAgentArb, (agent) => {
          const result = generatePrompt(agent)
          
          // 提示词必须非空
          expect(result.systemPrompt.trim().length).toBeGreaterThan(0)
          
          // 提示词必须包含 Agent 名称
          expect(result.systemPrompt).toContain(agent.name)
          
          // 验证函数也应该返回 true
          expect(validatePromptContent(result.systemPrompt, agent.name)).toBe(true)
        }),
        { numRuns: 100 }
      )
    })

    it('should include capabilities description in the prompt', () => {
      fc.assert(
        fc.property(scannerAgentArb, (agent) => {
          const result = generatePrompt(agent)
          
          // 提示词应该包含能力相关的内容
          const hasCapabilities = 
            result.systemPrompt.includes('Capabilities') ||
            result.systemPrompt.includes('capabilities') ||
            result.systemPrompt.includes('What This Agent Does')
          
          expect(hasCapabilities).toBe(true)
        }),
        { numRuns: 100 }
      )
    })

    it('should include Signal Rank information', () => {
      fc.assert(
        fc.property(scannerAgentArb, (agent) => {
          const result = generatePrompt(agent)
          
          // 提示词应该包含 Signal Rank 信息
          expect(result.systemPrompt).toContain('Signal Rank')
          expect(result.systemPrompt).toContain(agent.srTier)
        }),
        { numRuns: 100 }
      )
    })
  })

  /**
   * **功能: agent-scanner-mvp, 属性 25: API 密钥占位符**
   * 对于任意需要 API 密钥的 Agent，生成的提示词应包含确切的占位符文本"<PASTE_YOUR_KEY_HERE>"。
   * **验证: 需求 8.3**
   */
  describe('Property 25: API Key Placeholder', () => {
    it('should include API key placeholder for agents requiring authentication', () => {
      fc.assert(
        fc.property(agentRequiringApiKeyArb, (agent) => {
          const result = generatePrompt(agent)
          
          // 检测到需要 API 密钥
          const requiresKey = detectRequiresApiKey(agent)
          expect(requiresKey).toBe(true)
          
          // 提示词应该包含占位符
          expect(hasApiKeyPlaceholder(result.systemPrompt)).toBe(true)
          expect(result.systemPrompt).toContain('<PASTE_YOUR_KEY_HERE>')
        }),
        { numRuns: 100 }
      )
    })

    it('should detect API key requirement from description keywords', () => {
      const apiKeyKeywords = [
        'api key',
        'API_KEY',
        'authentication required',
        'access token',
        'bearer token'
      ]

      apiKeyKeywords.forEach(keyword => {
        const agent: ScannerAgent = {
          id: 'test-id',
          slug: 'test-agent',
          name: 'Test Agent',
          description: `This agent requires ${keyword} for access`,
          githubUrl: null,
          homepageUrl: 'https://example.com',
          apiDocsUrl: null,
          srScore: 5.0,
          srTier: 'B',
          srTrack: 'SaaS',
          scoreGithub: 0,
          scoreSaas: 5.0,
          scoreBreakdown: {
            starsScore: 0, forksScore: 0, vitalityScore: 0,
            readinessScore: 0, protocolScore: 0,
            trustScore: 1, aeoScore: 2, interopScore: 2
          },
          isMcp: false,
          isClaimed: false,
          isVerified: false,
          inputTypes: ['Text'],
          outputTypes: ['JSON'],
          metaTitle: null,
          metaDescription: null,
          ogImage: null,
          jsonLd: null,
          githubStars: 0,
          githubForks: 0,
          githubLastCommit: null,
          lastScannedAt: null,
          createdAt: new Date(),
          updatedAt: new Date()
        }

        expect(detectRequiresApiKey(agent)).toBe(true)
      })
    })
  })

  /**
   * **功能: agent-scanner-mvp, 属性 26: 自然语言回退**
   * 对于任意没有结构化 API 定义的 Track B Agent，提示词生成器应生成自然语言描述，而不是空的或错误的响应。
   * **验证: 需求 8.6**
   */
  describe('Property 26: Natural Language Fallback', () => {
    it('should generate valid natural language fallback for Track B agents without API', () => {
      fc.assert(
        fc.property(trackBAgentWithoutApiArb, (agent) => {
          const result = generatePrompt(agent)
          
          // 应该检测到没有结构化 API
          expect(hasStructuredAPI(agent)).toBe(false)
          expect(result.hasStructuredAPI).toBe(false)
          
          // 提示词必须非空
          expect(result.systemPrompt.trim().length).toBeGreaterThan(0)
          
          // 提示词必须包含 Agent 名称
          expect(result.systemPrompt).toContain(agent.name)
          
          // 验证自然语言回退有效
          expect(isValidNaturalLanguageFallback(result.systemPrompt)).toBe(true)
        }),
        { numRuns: 100 }
      )
    })

    it('should include usage instructions in natural language fallback', () => {
      fc.assert(
        fc.property(trackBAgentWithoutApiArb, (agent) => {
          const result = generatePrompt(agent)
          
          // 自然语言回退应该包含使用说明
          const hasInstructions = 
            result.systemPrompt.includes('How to Use') ||
            result.systemPrompt.includes('Usage') ||
            result.systemPrompt.includes('Instructions')
          
          expect(hasInstructions).toBe(true)
        }),
        { numRuns: 100 }
      )
    })

    it('should never return empty prompt for any agent type', () => {
      fc.assert(
        fc.property(scannerAgentArb, (agent) => {
          const result = generatePrompt(agent)
          
          // 永远不应该返回空提示词
          expect(result.systemPrompt).toBeDefined()
          expect(result.systemPrompt.trim().length).toBeGreaterThan(0)
        }),
        { numRuns: 100 }
      )
    })
  })

  // ============================================
  // 辅助功能测试
  // ============================================

  describe('Helper Functions', () => {
    it('should correctly detect structured API presence', () => {
      // 有 API 文档 URL
      const agentWithApiDocs: ScannerAgent = {
        ...createMinimalAgent(),
        apiDocsUrl: 'https://example.com/docs'
      }
      expect(hasStructuredAPI(agentWithApiDocs)).toBe(true)

      // MCP 项目
      const mcpAgent: ScannerAgent = {
        ...createMinimalAgent(),
        isMcp: true
      }
      expect(hasStructuredAPI(mcpAgent)).toBe(true)

      // 有 OpenAPI 文件 (readinessScore >= 1.5)
      const agentWithOpenAPI: ScannerAgent = {
        ...createMinimalAgent(),
        scoreBreakdown: {
          ...createMinimalAgent().scoreBreakdown,
          readinessScore: 1.5
        }
      }
      expect(hasStructuredAPI(agentWithOpenAPI)).toBe(true)

      // 没有结构化 API
      const agentWithoutAPI: ScannerAgent = {
        ...createMinimalAgent(),
        apiDocsUrl: null,
        isMcp: false,
        scoreBreakdown: {
          ...createMinimalAgent().scoreBreakdown,
          readinessScore: 0
        }
      }
      expect(hasStructuredAPI(agentWithoutAPI)).toBe(false)
    })

    it('should generate MCP-specific prompt for MCP agents', () => {
      const mcpAgent: ScannerAgent = {
        ...createMinimalAgent(),
        isMcp: true,
        name: 'MCP Test Agent'
      }

      const result = generatePrompt(mcpAgent)
      
      // MCP 提示词应该包含 MCP 相关内容
      expect(result.systemPrompt).toContain('MCP')
      expect(result.systemPrompt).toContain('Model Context Protocol')
    })
  })
})

// ============================================
// 辅助函数
// ============================================

/**
 * 创建最小化的 Agent 对象用于测试
 */
function createMinimalAgent(): ScannerAgent {
  return {
    id: 'test-id',
    slug: 'test-agent',
    name: 'Test Agent',
    description: 'A test agent for property testing',
    githubUrl: null,
    homepageUrl: 'https://example.com',
    apiDocsUrl: null,
    srScore: 5.0,
    srTier: 'B',
    srTrack: 'SaaS',
    scoreGithub: 0,
    scoreSaas: 5.0,
    scoreBreakdown: {
      starsScore: 0,
      forksScore: 0,
      vitalityScore: 0,
      readinessScore: 0,
      protocolScore: 0,
      trustScore: 1,
      aeoScore: 2,
      interopScore: 2
    },
    isMcp: false,
    isClaimed: false,
    isVerified: false,
    inputTypes: ['Text'],
    outputTypes: ['JSON'],
    metaTitle: null,
    metaDescription: null,
    ogImage: null,
    jsonLd: null,
    githubStars: 0,
    githubForks: 0,
    githubLastCommit: null,
    lastScannedAt: null,
    createdAt: new Date(),
    updatedAt: new Date()
  }
}
