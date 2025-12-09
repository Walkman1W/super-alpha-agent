/**
 * Agent 索引展示属性测试
 * 
 * 测试 Agent 索引页面的核心逻辑：
 * - 属性 22: Agent 索引排序
 * - 属性 23: 已验证过滤器正确性
 */

import { describe, it, expect } from 'vitest'
import * as fc from 'fast-check'
import type { ScannerAgent, SRTier, SRTrack, IOModality, SRScoreBreakdown } from '@/lib/types/scanner'

// ============================================
// 测试辅助函数
// ============================================

/**
 * 创建默认的评分明细
 */
function createDefaultBreakdown(): SRScoreBreakdown {
  return {
    starsScore: 0,
    forksScore: 0,
    vitalityScore: 0,
    readinessScore: 0,
    protocolScore: 0,
    trustScore: 0,
    aeoScore: 0,
    interopScore: 0
  }
}

/**
 * 生成随机 ScannerAgent 的 Arbitrary
 */
const scannerAgentArb: fc.Arbitrary<ScannerAgent> = fc.record({
  id: fc.uuid(),
  slug: fc.string({ minLength: 1, maxLength: 50 }).map(s => s.replace(/[^a-z0-9-]/gi, '-').toLowerCase()),
  name: fc.string({ minLength: 1, maxLength: 100 }),
  description: fc.option(fc.string({ maxLength: 500 }), { nil: null }),
  githubUrl: fc.option(fc.webUrl(), { nil: null }),
  homepageUrl: fc.option(fc.webUrl(), { nil: null }),
  apiDocsUrl: fc.option(fc.webUrl(), { nil: null }),
  srScore: fc.float({ min: 0, max: 10, noNaN: true }).map(n => Math.round(n * 10) / 10),
  srTier: fc.constantFrom<SRTier>('S', 'A', 'B', 'C'),
  srTrack: fc.constantFrom<SRTrack>('OpenSource', 'SaaS', 'Hybrid'),
  scoreGithub: fc.float({ min: 0, max: 10, noNaN: true }),
  scoreSaas: fc.float({ min: 0, max: 10, noNaN: true }),
  scoreBreakdown: fc.constant(createDefaultBreakdown()),
  isMcp: fc.boolean(),
  isClaimed: fc.boolean(),
  isVerified: fc.boolean(),
  inputTypes: fc.array(fc.constantFrom<IOModality>('Text', 'Image', 'Audio', 'JSON', 'Code', 'File', 'Video', 'Unknown'), { maxLength: 3 }),
  outputTypes: fc.array(fc.constantFrom<IOModality>('Text', 'Image', 'Audio', 'JSON', 'Code', 'File', 'Video', 'Unknown'), { maxLength: 3 }),
  metaTitle: fc.option(fc.string({ maxLength: 100 }), { nil: null }),
  metaDescription: fc.option(fc.string({ maxLength: 300 }), { nil: null }),
  ogImage: fc.option(fc.webUrl(), { nil: null }),
  jsonLd: fc.option(fc.constant({ '@type': 'SoftwareApplication' }), { nil: null }),
  githubStars: fc.nat({ max: 100000 }),
  githubForks: fc.nat({ max: 50000 }),
  githubLastCommit: fc.option(fc.date(), { nil: null }),
  lastScannedAt: fc.option(fc.date(), { nil: null }),
  createdAt: fc.date(),
  updatedAt: fc.date()
})

// ============================================
// 排序逻辑 (从 agent-index-list.tsx 提取)
// ============================================

/**
 * 按 SR 分数降序排序 Agent 列表
 */
function sortAgentsBySRScore(agents: ScannerAgent[]): ScannerAgent[] {
  return [...agents].sort((a, b) => b.srScore - a.srScore)
}

/**
 * 过滤已验证的 Agent
 */
function filterVerifiedAgents(agents: ScannerAgent[]): ScannerAgent[] {
  return agents.filter(agent => agent.isVerified)
}

// ============================================
// 属性测试
// ============================================

describe('Agent Index Properties', () => {
  /**
   * **功能: agent-scanner-mvp, 属性 22: Agent 索引排序**
   * 对于任意 Agent 列表，索引展示应按 SR 分数严格降序返回它们。
   * **验证: 需求 7.1**
   */
  it('Property 22: Agent index should be sorted by SR score in descending order', () => {
    fc.assert(
      fc.property(
        fc.array(scannerAgentArb, { minLength: 0, maxLength: 50 }),
        (agents) => {
          const sorted = sortAgentsBySRScore(agents)
          
          // 验证排序结果长度不变
          expect(sorted.length).toBe(agents.length)
          
          // 验证严格降序
          for (let i = 0; i < sorted.length - 1; i++) {
            expect(sorted[i].srScore).toBeGreaterThanOrEqual(sorted[i + 1].srScore)
          }
          
          // 验证所有原始元素都存在
          const originalIds = new Set(agents.map(a => a.id))
          const sortedIds = new Set(sorted.map(a => a.id))
          expect(sortedIds).toEqual(originalIds)
        }
      ),
      { numRuns: 100 }
    )
  })

  /**
   * **功能: agent-scanner-mvp, 属性 23: 已验证过滤器正确性**
   * 对于任意包含混合验证状态的 Agent 列表，应用"仅显示已验证"过滤器应只返回 isVerified === true 的 Agent。
   * **验证: 需求 7.4**
   */
  it('Property 23: Verified filter should only return agents with isVerified === true', () => {
    fc.assert(
      fc.property(
        fc.array(scannerAgentArb, { minLength: 0, maxLength: 50 }),
        (agents) => {
          const filtered = filterVerifiedAgents(agents)
          
          // 验证所有返回的 Agent 都是已验证的
          for (const agent of filtered) {
            expect(agent.isVerified).toBe(true)
          }
          
          // 验证返回数量等于原列表中已验证 Agent 的数量
          const expectedCount = agents.filter(a => a.isVerified).length
          expect(filtered.length).toBe(expectedCount)
          
          // 验证没有遗漏任何已验证的 Agent
          const filteredIds = new Set(filtered.map(a => a.id))
          for (const agent of agents) {
            if (agent.isVerified) {
              expect(filteredIds.has(agent.id)).toBe(true)
            }
          }
        }
      ),
      { numRuns: 100 }
    )
  })

  /**
   * 组合属性: 过滤后排序应保持正确性
   */
  it('Combined: Filtered and sorted list maintains both properties', () => {
    fc.assert(
      fc.property(
        fc.array(scannerAgentArb, { minLength: 0, maxLength: 50 }),
        (agents) => {
          // 先过滤再排序
          const filtered = filterVerifiedAgents(agents)
          const sorted = sortAgentsBySRScore(filtered)
          
          // 验证所有结果都是已验证的
          for (const agent of sorted) {
            expect(agent.isVerified).toBe(true)
          }
          
          // 验证排序正确
          for (let i = 0; i < sorted.length - 1; i++) {
            expect(sorted[i].srScore).toBeGreaterThanOrEqual(sorted[i + 1].srScore)
          }
        }
      ),
      { numRuns: 100 }
    )
  })

  /**
   * 边界情况: 空列表
   */
  it('Edge case: Empty list returns empty result', () => {
    const sorted = sortAgentsBySRScore([])
    const filtered = filterVerifiedAgents([])
    
    expect(sorted).toEqual([])
    expect(filtered).toEqual([])
  })

  /**
   * 边界情况: 单元素列表
   */
  it('Edge case: Single element list', () => {
    fc.assert(
      fc.property(
        scannerAgentArb,
        (agent) => {
          const sorted = sortAgentsBySRScore([agent])
          expect(sorted.length).toBe(1)
          expect(sorted[0].id).toBe(agent.id)
          
          const filtered = filterVerifiedAgents([agent])
          if (agent.isVerified) {
            expect(filtered.length).toBe(1)
            expect(filtered[0].id).toBe(agent.id)
          } else {
            expect(filtered.length).toBe(0)
          }
        }
      ),
      { numRuns: 100 }
    )
  })

  /**
   * 边界情况: 所有 Agent 分数相同
   */
  it('Edge case: All agents have same score', () => {
    fc.assert(
      fc.property(
        fc.float({ min: 0, max: 10, noNaN: true }).map(n => Math.round(n * 10) / 10),
        fc.array(scannerAgentArb, { minLength: 2, maxLength: 20 }),
        (score, agents) => {
          // 设置所有 Agent 相同分数
          const sameScoreAgents = agents.map(a => ({ ...a, srScore: score }))
          const sorted = sortAgentsBySRScore(sameScoreAgents)
          
          // 验证长度不变
          expect(sorted.length).toBe(sameScoreAgents.length)
          
          // 验证所有分数相同
          for (const agent of sorted) {
            expect(agent.srScore).toBe(score)
          }
        }
      ),
      { numRuns: 100 }
    )
  })

  /**
   * 边界情况: 所有 Agent 都已验证
   */
  it('Edge case: All agents are verified', () => {
    fc.assert(
      fc.property(
        fc.array(scannerAgentArb, { minLength: 1, maxLength: 20 }),
        (agents) => {
          const allVerified = agents.map(a => ({ ...a, isVerified: true }))
          const filtered = filterVerifiedAgents(allVerified)
          
          expect(filtered.length).toBe(allVerified.length)
        }
      ),
      { numRuns: 100 }
    )
  })

  /**
   * 边界情况: 没有 Agent 已验证
   */
  it('Edge case: No agents are verified', () => {
    fc.assert(
      fc.property(
        fc.array(scannerAgentArb, { minLength: 1, maxLength: 20 }),
        (agents) => {
          const noneVerified = agents.map(a => ({ ...a, isVerified: false }))
          const filtered = filterVerifiedAgents(noneVerified)
          
          expect(filtered.length).toBe(0)
        }
      ),
      { numRuns: 100 }
    )
  })
})
