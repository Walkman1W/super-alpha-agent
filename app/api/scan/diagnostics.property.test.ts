/**
 * 诊断建议属性测试
 * 
 * **功能: agent-scanner-mvp, 属性 19: 诊断建议**
 * 对于任意状态为 'fail' 的指标，结果展示应提供针对该指标的非空建议字符串
 * **验证: 需求 5.4**
 */

import { describe, it, expect } from 'vitest'
import * as fc from 'fast-check'
import { 
  generateDiagnostics, 
  getDiagnosticSuggestion,
  getDiagnosticsSummary 
} from './diagnostics'
import type { 
  GitHubScanResult, 
  SaaSScanResult, 
  SRScoreBreakdown,
  DiagnosticStatus 
} from '@/lib/types/scanner'

// ============================================
// 生成器
// ============================================

/**
 * 生成随机 GitHub 扫描结果
 */
const githubScanResultArb = fc.record({
  stars: fc.nat(50000),
  forks: fc.nat(10000),
  lastCommitDate: fc.option(fc.date({ min: new Date('2020-01-01'), max: new Date() }), { nil: null }),
  hasLicense: fc.boolean(),
  hasOpenAPI: fc.boolean(),
  hasDockerfile: fc.boolean(),
  hasManifest: fc.boolean(),
  readmeLength: fc.nat(500),
  hasUsageCodeBlock: fc.boolean(),
  hasMCP: fc.boolean(),
  hasStandardInterface: fc.boolean(),
  homepage: fc.option(fc.webUrl(), { nil: null }),
  description: fc.string({ maxLength: 200 }),
  topics: fc.array(fc.string({ maxLength: 20 }), { maxLength: 5 }),
  owner: fc.string({ minLength: 1, maxLength: 39 }),
  repo: fc.string({ minLength: 1, maxLength: 100 })
})

/**
 * 生成随机 SaaS 扫描结果
 */
const saasScanResultArb = fc.record({
  httpsValid: fc.boolean(),
  sslValidMonths: fc.nat(24),
  socialLinks: fc.array(fc.webUrl(), { maxLength: 5 }),
  hasJsonLd: fc.boolean(),
  jsonLdContent: fc.constant(null),
  hasBasicMeta: fc.boolean(),
  metaTitle: fc.option(fc.string({ maxLength: 100 }), { nil: null }),
  metaDescription: fc.option(fc.string({ maxLength: 200 }), { nil: null }),
  hasH1: fc.boolean(),
  hasOgTags: fc.boolean(),
  ogImage: fc.option(fc.webUrl(), { nil: null }),
  ogTitle: fc.option(fc.string({ maxLength: 100 }), { nil: null }),
  hasApiDocsPath: fc.boolean(),
  apiDocsUrl: fc.option(fc.webUrl(), { nil: null }),
  hasIntegrationKeywords: fc.boolean(),
  integrationKeywords: fc.array(fc.constantFrom('sdk', 'webhook', 'zapier', 'plugin'), { maxLength: 4 }),
  hasLoginButton: fc.boolean(),
  pageContent: fc.string({ maxLength: 1000 })
})

/**
 * 生成随机评分明细
 */
const scoreBreakdownArb = fc.record({
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
 * 生成诊断状态
 */
const diagnosticStatusArb = fc.constantFrom<DiagnosticStatus>('pass', 'fail', 'warning')

/**
 * 生成指标名称
 */
const metricNameArb = fc.constantFrom(
  'GitHub Stars',
  'Fork Ratio',
  'Recent Commits',
  'License',
  'OpenAPI/Swagger',
  'Dockerfile',
  'README Quality',
  'MCP Support',
  'HTTPS',
  'Social Links',
  'JSON-LD',
  'Meta Tags',
  'Open Graph',
  'API Documentation',
  'Integration Keywords',
  'Login Button'
)

// ============================================
// 属性测试
// ============================================

describe('诊断建议属性测试', () => {
  /**
   * **功能: agent-scanner-mvp, 属性 19: 诊断建议**
   * 对于任意状态为 'fail' 的指标，结果展示应提供针对该指标的非空建议字符串
   * **验证: 需求 5.4**
   */
  it('属性 19: 失败状态的指标应提供非空建议', () => {
    fc.assert(
      fc.property(
        metricNameArb,
        (metric) => {
          const suggestion = getDiagnosticSuggestion(metric, 'fail')
          
          // 失败状态必须返回非空建议
          expect(suggestion).toBeDefined()
          expect(typeof suggestion).toBe('string')
          expect(suggestion!.length).toBeGreaterThan(0)
        }
      ),
      { numRuns: 100 }
    )
  })

  it('属性 19 扩展: 通过状态的指标不应提供建议', () => {
    fc.assert(
      fc.property(
        metricNameArb,
        (metric) => {
          const suggestion = getDiagnosticSuggestion(metric, 'pass')
          
          // 通过状态不应返回建议
          expect(suggestion).toBeUndefined()
        }
      ),
      { numRuns: 100 }
    )
  })

  it('生成的诊断中失败项都有建议', () => {
    fc.assert(
      fc.property(
        fc.option(githubScanResultArb, { nil: null }),
        fc.option(saasScanResultArb, { nil: null }),
        scoreBreakdownArb,
        (github, saas, breakdown) => {
          // 至少需要一个扫描结果
          if (!github && !saas) return true
          
          const diagnostics = generateDiagnostics(
            github as GitHubScanResult | null,
            saas as SaaSScanResult | null,
            breakdown as SRScoreBreakdown
          )
          
          // 检查所有失败的诊断项都有建议
          for (const diagnostic of diagnostics) {
            if (diagnostic.status === 'fail') {
              expect(diagnostic.suggestion).toBeDefined()
              expect(typeof diagnostic.suggestion).toBe('string')
              expect(diagnostic.suggestion!.length).toBeGreaterThan(0)
            }
          }
          
          return true
        }
      ),
      { numRuns: 100 }
    )
  })

  it('诊断摘要计算正确', () => {
    fc.assert(
      fc.property(
        fc.option(githubScanResultArb, { nil: null }),
        fc.option(saasScanResultArb, { nil: null }),
        scoreBreakdownArb,
        (github, saas, breakdown) => {
          if (!github && !saas) return true
          
          const diagnostics = generateDiagnostics(
            github as GitHubScanResult | null,
            saas as SaaSScanResult | null,
            breakdown as SRScoreBreakdown
          )
          
          const summary = getDiagnosticsSummary(diagnostics)
          
          // 验证摘要计算
          expect(summary.total).toBe(diagnostics.length)
          expect(summary.passed + summary.failed + summary.warnings).toBe(summary.total)
          expect(summary.passRate).toBeGreaterThanOrEqual(0)
          expect(summary.passRate).toBeLessThanOrEqual(100)
          
          return true
        }
      ),
      { numRuns: 100 }
    )
  })

  it('GitHub 扫描结果生成正确数量的诊断项', () => {
    fc.assert(
      fc.property(
        githubScanResultArb,
        scoreBreakdownArb,
        (github, breakdown) => {
          const diagnostics = generateDiagnostics(
            github as GitHubScanResult,
            null,
            breakdown as SRScoreBreakdown
          )
          
          // GitHub 扫描应生成 8 个诊断项
          expect(diagnostics.length).toBe(8)
          
          // 验证所有诊断项都有必需字段
          for (const d of diagnostics) {
            expect(d.metric).toBeDefined()
            expect(d.status).toBeDefined()
            expect(typeof d.score).toBe('number')
            expect(typeof d.maxScore).toBe('number')
            expect(d.score).toBeGreaterThanOrEqual(0)
            expect(d.maxScore).toBeGreaterThan(0)
          }
          
          return true
        }
      ),
      { numRuns: 100 }
    )
  })

  it('SaaS 扫描结果生成正确数量的诊断项', () => {
    fc.assert(
      fc.property(
        saasScanResultArb,
        scoreBreakdownArb,
        (saas, breakdown) => {
          const diagnostics = generateDiagnostics(
            null,
            saas as SaaSScanResult,
            breakdown as SRScoreBreakdown
          )
          
          // SaaS 扫描应生成 8 个诊断项
          expect(diagnostics.length).toBe(8)
          
          // 验证所有诊断项都有必需字段
          for (const d of diagnostics) {
            expect(d.metric).toBeDefined()
            expect(d.status).toBeDefined()
            expect(typeof d.score).toBe('number')
            expect(typeof d.maxScore).toBe('number')
          }
          
          return true
        }
      ),
      { numRuns: 100 }
    )
  })

  it('混合扫描结果生成正确数量的诊断项', () => {
    fc.assert(
      fc.property(
        githubScanResultArb,
        saasScanResultArb,
        scoreBreakdownArb,
        (github, saas, breakdown) => {
          const diagnostics = generateDiagnostics(
            github as GitHubScanResult,
            saas as SaaSScanResult,
            breakdown as SRScoreBreakdown
          )
          
          // 混合扫描应生成 16 个诊断项 (8 + 8)
          expect(diagnostics.length).toBe(16)
          
          return true
        }
      ),
      { numRuns: 100 }
    )
  })

  it('诊断状态与分数一致', () => {
    fc.assert(
      fc.property(
        fc.option(githubScanResultArb, { nil: null }),
        fc.option(saasScanResultArb, { nil: null }),
        scoreBreakdownArb,
        (github, saas, breakdown) => {
          if (!github && !saas) return true
          
          const diagnostics = generateDiagnostics(
            github as GitHubScanResult | null,
            saas as SaaSScanResult | null,
            breakdown as SRScoreBreakdown
          )
          
          for (const d of diagnostics) {
            const ratio = d.score / d.maxScore
            
            // 满分应该是 pass
            if (ratio >= 1) {
              expect(d.status).toBe('pass')
            }
            // 0 分应该是 fail
            if (d.score === 0) {
              expect(d.status).toBe('fail')
            }
          }
          
          return true
        }
      ),
      { numRuns: 100 }
    )
  })
})
