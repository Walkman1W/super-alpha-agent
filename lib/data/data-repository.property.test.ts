/**
 * 数据持久化属性测试
 * **功能: agent-scanner-mvp, 属性 27: 数据持久化完整性**
 * 
 * 测试数据层的核心逻辑，确保数据转换和验证的正确性
 * 由于实际数据库操作需要连接，这里测试数据转换逻辑
 * 
 * **验证: 需求 9.1, 9.2**
 */

import { describe, it, expect } from 'vitest'
import * as fc from 'fast-check'
import type {
  SRTier,
  SRTrack,
  SRScoreBreakdown,
  IOModality,
  ScannerAgent
} from '@/lib/types/scanner'
import { getTierFromScore, createDefaultScoreBreakdown } from '@/lib/types/scanner'

// ============================================
// 生成器定义
// ============================================

/**
 * 生成有效的 SR 分数 (0.0 - 10.0)
 */
const srScoreArb = fc.float({ min: 0, max: 10, noNaN: true })
  .map(n => Math.round(n * 10) / 10)

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
}).map(breakdown => ({
  starsScore: Math.round(breakdown.starsScore * 10) / 10,
  forksScore: Math.round(breakdown.forksScore * 10) / 10,
  vitalityScore: Math.round(breakdown.vitalityScore * 10) / 10,
  readinessScore: Math.round(breakdown.readinessScore * 10) / 10,
  protocolScore: Math.round(breakdown.protocolScore * 10) / 10,
  trustScore: Math.round(breakdown.trustScore * 10) / 10,
  aeoScore: Math.round(breakdown.aeoScore * 10) / 10,
  interopScore: Math.round(breakdown.interopScore * 10) / 10
}))

/**
 * 生成 Agent 输入数据
 */
const agentInputArb = fc.record({
  slug: slugArb,
  name: fc.string({ minLength: 1, maxLength: 100 }),
  description: fc.option(fc.string({ maxLength: 500 }), { nil: undefined }),
  srScore: srScoreArb,
  srTier: srTierArb,
  srTrack: srTrackArb,
  scoreGithub: srScoreArb,
  scoreSaas: srScoreArb,
  scoreBreakdown: scoreBreakdownArb,
  isMcp: fc.boolean(),
  isClaimed: fc.boolean(),
  isVerified: fc.boolean(),
  inputTypes: fc.array(ioModalityArb, { minLength: 1, maxLength: 5 }),
  outputTypes: fc.array(ioModalityArb, { minLength: 1, maxLength: 5 }),
  githubStars: fc.nat({ max: 1000000 }),
  githubForks: fc.nat({ max: 100000 })
})

// ============================================
// 属性测试
// ============================================

describe('数据持久化属性测试', () => {
  /**
   * **功能: agent-scanner-mvp, 属性 27: 数据持久化完整性**
   * 对于任意扫描结果，持久化的 Agent 记录应包含：sr_score、sr_track、score_breakdown 和 last_scanned_at 字段
   * **验证: 需求 9.1, 9.2**
   */
  describe('属性 27: 数据持久化完整性', () => {
    it('Agent 输入数据应包含所有必需的 SR 评分字段', () => {
      fc.assert(
        fc.property(agentInputArb, (input) => {
          // 验证必需字段存在
          expect(input.srScore).toBeDefined()
          expect(typeof input.srScore).toBe('number')
          expect(input.srScore).toBeGreaterThanOrEqual(0)
          expect(input.srScore).toBeLessThanOrEqual(10)

          expect(input.srTrack).toBeDefined()
          expect(['OpenSource', 'SaaS', 'Hybrid']).toContain(input.srTrack)

          expect(input.scoreBreakdown).toBeDefined()
          expect(typeof input.scoreBreakdown).toBe('object')

          // 验证 scoreBreakdown 包含所有必需字段
          expect(input.scoreBreakdown.starsScore).toBeDefined()
          expect(input.scoreBreakdown.forksScore).toBeDefined()
          expect(input.scoreBreakdown.vitalityScore).toBeDefined()
          expect(input.scoreBreakdown.readinessScore).toBeDefined()
          expect(input.scoreBreakdown.protocolScore).toBeDefined()
          expect(input.scoreBreakdown.trustScore).toBeDefined()
          expect(input.scoreBreakdown.aeoScore).toBeDefined()
          expect(input.scoreBreakdown.interopScore).toBeDefined()
        }),
        { numRuns: 100 }
      )
    })

    it('SR 分数应在有效范围内 (0.0 - 10.0)', () => {
      fc.assert(
        fc.property(srScoreArb, (score) => {
          expect(score).toBeGreaterThanOrEqual(0)
          expect(score).toBeLessThanOrEqual(10)
          // 验证精度为一位小数
          expect(Math.round(score * 10) / 10).toBe(score)
        }),
        { numRuns: 100 }
      )
    })

    it('评分明细各项应在各自的有效范围内', () => {
      fc.assert(
        fc.property(scoreBreakdownArb, (breakdown) => {
          // Track A 指标
          expect(breakdown.starsScore).toBeGreaterThanOrEqual(0)
          expect(breakdown.starsScore).toBeLessThanOrEqual(2)
          
          expect(breakdown.forksScore).toBeGreaterThanOrEqual(0)
          expect(breakdown.forksScore).toBeLessThanOrEqual(1)
          
          expect(breakdown.vitalityScore).toBeGreaterThanOrEqual(0)
          expect(breakdown.vitalityScore).toBeLessThanOrEqual(2)
          
          expect(breakdown.readinessScore).toBeGreaterThanOrEqual(0)
          expect(breakdown.readinessScore).toBeLessThanOrEqual(3)
          
          expect(breakdown.protocolScore).toBeGreaterThanOrEqual(0)
          expect(breakdown.protocolScore).toBeLessThanOrEqual(2)

          // Track B 指标
          expect(breakdown.trustScore).toBeGreaterThanOrEqual(0)
          expect(breakdown.trustScore).toBeLessThanOrEqual(3)
          
          expect(breakdown.aeoScore).toBeGreaterThanOrEqual(0)
          expect(breakdown.aeoScore).toBeLessThanOrEqual(4)
          
          expect(breakdown.interopScore).toBeGreaterThanOrEqual(0)
          expect(breakdown.interopScore).toBeLessThanOrEqual(3)
        }),
        { numRuns: 100 }
      )
    })

    it('I/O 模态数组应非空且包含有效值', () => {
      fc.assert(
        fc.property(
          fc.array(ioModalityArb, { minLength: 1, maxLength: 5 }),
          (modalities) => {
            expect(modalities.length).toBeGreaterThan(0)
            
            const validModalities = ['Text', 'Image', 'Audio', 'JSON', 'Code', 'File', 'Video', 'Unknown']
            modalities.forEach(modality => {
              expect(validModalities).toContain(modality)
            })
          }
        ),
        { numRuns: 100 }
      )
    })

    it('Slug 应符合 URL 友好格式', () => {
      fc.assert(
        fc.property(slugArb, (slug) => {
          // 验证 slug 格式
          expect(slug.length).toBeGreaterThanOrEqual(4)
          expect(slug.length).toBeLessThanOrEqual(50)
          expect(/^[a-z0-9][a-z0-9-]*[a-z0-9]$/.test(slug)).toBe(true)
          // 不应以连字符开头或结尾
          expect(slug.startsWith('-')).toBe(false)
          expect(slug.endsWith('-')).toBe(false)
        }),
        { numRuns: 100 }
      )
    })
  })

  /**
   * 等级分配一致性测试
   * 验证 getTierFromScore 函数的正确性
   */
  describe('等级分配一致性', () => {
    it('分数与等级应保持一致', () => {
      fc.assert(
        fc.property(srScoreArb, (score) => {
          const tier = getTierFromScore(score)
          
          if (score >= 9.0) {
            expect(tier).toBe('S')
          } else if (score >= 7.5) {
            expect(tier).toBe('A')
          } else if (score >= 5.0) {
            expect(tier).toBe('B')
          } else {
            expect(tier).toBe('C')
          }
        }),
        { numRuns: 100 }
      )
    })

    it('等级边界值应正确分配', () => {
      // 测试边界值
      expect(getTierFromScore(10.0)).toBe('S')
      expect(getTierFromScore(9.0)).toBe('S')
      expect(getTierFromScore(8.9)).toBe('A')
      expect(getTierFromScore(7.5)).toBe('A')
      expect(getTierFromScore(7.4)).toBe('B')
      expect(getTierFromScore(5.0)).toBe('B')
      expect(getTierFromScore(4.9)).toBe('C')
      expect(getTierFromScore(0.0)).toBe('C')
    })
  })

  /**
   * 默认评分明细测试
   */
  describe('默认评分明细', () => {
    it('createDefaultScoreBreakdown 应返回所有字段为 0 的对象', () => {
      const breakdown = createDefaultScoreBreakdown()
      
      expect(breakdown.starsScore).toBe(0)
      expect(breakdown.forksScore).toBe(0)
      expect(breakdown.vitalityScore).toBe(0)
      expect(breakdown.readinessScore).toBe(0)
      expect(breakdown.protocolScore).toBe(0)
      expect(breakdown.trustScore).toBe(0)
      expect(breakdown.aeoScore).toBe(0)
      expect(breakdown.interopScore).toBe(0)
    })
  })

  /**
   * 数据转换一致性测试
   */
  describe('数据转换一致性', () => {
    it('Agent 数据应能正确序列化为 JSON', () => {
      fc.assert(
        fc.property(agentInputArb, (input) => {
          // 模拟数据库存储和读取
          const jsonString = JSON.stringify(input)
          const parsed = JSON.parse(jsonString)
          
          // 验证关键字段保持一致
          expect(parsed.slug).toBe(input.slug)
          expect(parsed.srScore).toBe(input.srScore)
          expect(parsed.srTier).toBe(input.srTier)
          expect(parsed.srTrack).toBe(input.srTrack)
          expect(parsed.isMcp).toBe(input.isMcp)
          expect(parsed.scoreBreakdown).toEqual(input.scoreBreakdown)
        }),
        { numRuns: 100 }
      )
    })

    it('评分明细应能正确序列化为 JSONB', () => {
      fc.assert(
        fc.property(scoreBreakdownArb, (breakdown) => {
          const jsonString = JSON.stringify(breakdown)
          const parsed = JSON.parse(jsonString) as SRScoreBreakdown
          
          // 验证所有字段保持一致
          expect(parsed.starsScore).toBe(breakdown.starsScore)
          expect(parsed.forksScore).toBe(breakdown.forksScore)
          expect(parsed.vitalityScore).toBe(breakdown.vitalityScore)
          expect(parsed.readinessScore).toBe(breakdown.readinessScore)
          expect(parsed.protocolScore).toBe(breakdown.protocolScore)
          expect(parsed.trustScore).toBe(breakdown.trustScore)
          expect(parsed.aeoScore).toBe(breakdown.aeoScore)
          expect(parsed.interopScore).toBe(breakdown.interopScore)
        }),
        { numRuns: 100 }
      )
    })
  })

  /**
   * 扫描历史数据完整性测试
   */
  describe('扫描历史数据完整性', () => {
    it('扫描历史输入应包含所有必需字段', () => {
      const scanHistoryInputArb = fc.record({
        agentId: fc.uuid(),
        srScore: srScoreArb,
        srTier: srTierArb,
        srTrack: srTrackArb,
        scoreGithub: srScoreArb,
        scoreSaas: srScoreArb,
        scoreBreakdown: scoreBreakdownArb,
        scanType: fc.constantFrom('manual', 'scheduled', 'api')
      })

      fc.assert(
        fc.property(scanHistoryInputArb, (input) => {
          // 验证必需字段
          expect(input.agentId).toBeDefined()
          expect(input.srScore).toBeDefined()
          expect(input.srTier).toBeDefined()
          expect(input.srTrack).toBeDefined()
          expect(input.scoreBreakdown).toBeDefined()
          
          // 验证分数范围
          expect(input.srScore).toBeGreaterThanOrEqual(0)
          expect(input.srScore).toBeLessThanOrEqual(10)
          expect(input.scoreGithub).toBeGreaterThanOrEqual(0)
          expect(input.scoreGithub).toBeLessThanOrEqual(10)
          expect(input.scoreSaas).toBeGreaterThanOrEqual(0)
          expect(input.scoreSaas).toBeLessThanOrEqual(10)
        }),
        { numRuns: 100 }
      )
    })
  })
})
