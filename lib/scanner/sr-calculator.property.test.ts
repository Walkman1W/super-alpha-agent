/**
 * SR Calculator 属性测试
 * 使用 fast-check 进行基于属性的测试
 * Requirements: 2.1-2.7
 */

import { describe, it, expect } from 'vitest'
import * as fc from 'fast-check'
import {
  calculateStarsScore,
  calculateForksScore,
  calculateVitalityScore,
  calculateReadinessScore,
  calculateProtocolScore,
  getTier,
  roundScore,
  calculateHybridScore
} from './sr-calculator'
import { detectMCP, hasUsageCodeBlock } from './github-scanner'

describe('SR Calculator - Track A 属性测试', () => {
  /**
   * **功能: agent-scanner-mvp, 属性 3: 星标分数计算**
   * 对于任意非负整数星标数量，SR 计算器应根据阶梯系统返回正确的社区信任分数。
   * **验证: 需求 2.1**
   */
  describe('属性 3: 星标分数计算', () => {
    it('应根据阶梯系统返回正确分数', () => {
      fc.assert(
        fc.property(fc.nat(100000), (stars) => {
          const score = calculateStarsScore(stars)
          
          // 验证分数在有效范围内
          expect(score).toBeGreaterThanOrEqual(0)
          expect(score).toBeLessThanOrEqual(2.0)
          
          // 验证阶梯逻辑
          if (stars >= 20000) {
            expect(score).toBe(2.0)
          } else if (stars >= 10000) {
            expect(score).toBe(1.5)
          } else if (stars >= 5000) {
            expect(score).toBe(1.0)
          } else if (stars >= 1000) {
            expect(score).toBe(0.5)
          } else {
            expect(score).toBe(0)
          }
        }),
        { numRuns: 100 }
      )
    })

    it('负数星标应返回 0 分', () => {
      fc.assert(
        fc.property(fc.integer({ min: -10000, max: -1 }), (stars) => {
          expect(calculateStarsScore(stars)).toBe(0)
        }),
        { numRuns: 100 }
      )
    })
  })

  /**
   * **功能: agent-scanner-mvp, 属性 4: Fork 比率分数计算**
   * 对于任意非负整数的 forks 和 stars，SR 计算器应当且仅当 forks > stars * 0.1 时奖励 1.0 分。
   * **验证: 需求 2.2**
   */
  describe('属性 4: Fork 比率分数计算', () => {
    it('forks > stars * 0.1 时应返回 1.0 分', () => {
      fc.assert(
        fc.property(
          fc.nat(100000),
          fc.nat(100000),
          (stars, forks) => {
            const score = calculateForksScore(forks, stars)
            
            // 验证分数在有效范围内
            expect(score).toBeGreaterThanOrEqual(0)
            expect(score).toBeLessThanOrEqual(1.0)
            
            // 验证比率逻辑
            if (stars === 0) {
              expect(score).toBe(forks > 0 ? 1.0 : 0)
            } else if (forks > stars * 0.1) {
              expect(score).toBe(1.0)
            } else {
              expect(score).toBe(0)
            }
          }
        ),
        { numRuns: 100 }
      )
    })
  })

  /**
   * **功能: agent-scanner-mvp, 属性 5: 活跃度分数计算**
   * 对于任意表示最后提交的日期，SR 计算器应当且仅当该日期在当前日期 30 天内时奖励 1.0 分。
   * **验证: 需求 2.3**
   */
  describe('属性 5: 活跃度分数计算', () => {
    it('30天内提交应得 1.0 分，有许可证应得 1.0 分', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 0, max: 365 }), // 天数偏移
          fc.boolean(), // 是否有许可证
          (daysAgo, hasLicense) => {
            const commitDate = new Date()
            commitDate.setDate(commitDate.getDate() - daysAgo)
            
            const score = calculateVitalityScore(commitDate, hasLicense)
            
            // 验证分数在有效范围内
            expect(score).toBeGreaterThanOrEqual(0)
            expect(score).toBeLessThanOrEqual(2.0)
            
            // 验证活跃度逻辑
            let expectedScore = 0
            if (daysAgo <= 30) {
              expectedScore += 1.0
            }
            if (hasLicense) {
              expectedScore += 1.0
            }
            
            expect(score).toBe(expectedScore)
          }
        ),
        { numRuns: 100 }
      )
    })

    it('null 日期应不得活跃分', () => {
      fc.assert(
        fc.property(fc.boolean(), (hasLicense) => {
          const score = calculateVitalityScore(null, hasLicense)
          expect(score).toBe(hasLicense ? 1.0 : 0)
        }),
        { numRuns: 100 }
      )
    })
  })

  /**
   * **功能: agent-scanner-mvp, 属性 6: 文件检测评分**
   * 对于任意仓库中的文件名列表，SR 计算器应正确检测并评分 openapi.json、swagger.yaml、manifest.json（+1.5）和 Dockerfile（+0.5）的存在。
   * **验证: 需求 2.4, 2.6**
   */
  describe('属性 6: 文件检测评分', () => {
    it('应根据文件存在性正确评分', () => {
      fc.assert(
        fc.property(
          fc.boolean(), // hasOpenAPI
          fc.boolean(), // hasDockerfile
          fc.integer({ min: 0, max: 500 }), // readmeLength
          fc.boolean(), // hasUsageCodeBlock
          (hasOpenAPI, hasDockerfile, readmeLength, hasUsageBlock) => {
            const score = calculateReadinessScore(hasOpenAPI, hasDockerfile, readmeLength, hasUsageBlock)
            
            // 验证分数在有效范围内
            expect(score).toBeGreaterThanOrEqual(0)
            expect(score).toBeLessThanOrEqual(3.0)
            
            // 验证评分逻辑
            let expectedScore = 0
            if (hasOpenAPI) expectedScore += 1.5
            if (hasDockerfile) expectedScore += 0.5
            if (readmeLength > 200 && hasUsageBlock) expectedScore += 1.0
            
            expect(score).toBe(expectedScore)
          }
        ),
        { numRuns: 100 }
      )
    })
  })

  /**
   * **功能: agent-scanner-mvp, 属性 7: MCP 关键词检测**
   * 对于任意文本内容，SR 计算器应当且仅当内容包含 'mcp'、'model context protocol' 或 'mcp server'（不区分大小写）时检测到 MCP 支持。
   * **验证: 需求 2.5**
   */
  describe('属性 7: MCP 关键词检测', () => {
    const mcpKeywords = ['mcp', 'model context protocol', 'mcp server', 'mcp-server', 'modelcontextprotocol']
    
    it('包含 MCP 关键词时应检测到', () => {
      fc.assert(
        fc.property(
          fc.constantFrom(...mcpKeywords),
          fc.string({ minLength: 0, maxLength: 100 }),
          fc.string({ minLength: 0, maxLength: 100 }),
          (keyword, prefix, suffix) => {
            const content = `${prefix} ${keyword} ${suffix}`
            expect(detectMCP(content)).toBe(true)
          }
        ),
        { numRuns: 100 }
      )
    })

    it('不包含 MCP 关键词时应返回 false', () => {
      const nonMcpContent = [
        'This is a regular project',
        'API documentation',
        'Machine learning model',
        'Context aware system'
      ]
      
      nonMcpContent.forEach(content => {
        expect(detectMCP(content)).toBe(false)
      })
    })

    it('大小写不敏感', () => {
      fc.assert(
        fc.property(
          fc.constantFrom('MCP', 'Mcp', 'mCp', 'MODEL CONTEXT PROTOCOL', 'Model Context Protocol'),
          (keyword) => {
            expect(detectMCP(keyword)).toBe(true)
          }
        ),
        { numRuns: 100 }
      )
    })
  })

  /**
   * **功能: agent-scanner-mvp, 属性 8: README 质量评分**
   * 对于任意 README 内容，SR 计算器应当且仅当内容超过 200 行且包含至少一个带有使用相关关键词的代码块时奖励 1.0 分。
   * **验证: 需求 2.7**
   */
  describe('属性 8: README 质量评分', () => {
    it('有代码块和 usage 关键词时应返回 true', () => {
      const readmeWithUsage = `
# My Project

## Usage

Here is how to use it:

\`\`\`javascript
const client = new MyClient()
client.run()
\`\`\`

More content here...
`
      expect(hasUsageCodeBlock(readmeWithUsage)).toBe(true)
    })

    it('没有代码块时应返回 false', () => {
      const readmeWithoutCode = `
# My Project

## Usage

Here is how to use it without code examples.
`
      expect(hasUsageCodeBlock(readmeWithoutCode)).toBe(false)
    })

    it('有代码块但没有 usage 关键词时应返回 false', () => {
      const readmeWithoutUsage = `
# My Project

## License

MIT

\`\`\`
Some random code
\`\`\`
`
      expect(hasUsageCodeBlock(readmeWithoutUsage)).toBe(false)
    })
  })

  /**
   * **功能: agent-scanner-mvp, 属性 18: 等级分配**
   * 对于任意范围在 [0.0, 10.0] 的分数，等级分配应为：S 对应 [9.0-10.0]，A 对应 [7.5-8.9]，B 对应 [5.0-7.4]，C 对应 [0.0-5.0)。
   * **验证: 需求 4.5**
   */
  describe('属性 18: 等级分配', () => {
    it('应根据分数正确分配等级', () => {
      fc.assert(
        fc.property(
          fc.float({ min: 0, max: 10, noNaN: true }),
          (score) => {
            const tier = getTier(score)
            
            if (score >= 9.0) {
              expect(tier).toBe('S')
            } else if (score >= 7.5) {
              expect(tier).toBe('A')
            } else if (score >= 5.0) {
              expect(tier).toBe('B')
            } else {
              expect(tier).toBe('C')
            }
          }
        ),
        { numRuns: 100 }
      )
    })
  })

  /**
   * **功能: agent-scanner-mvp, 属性 17: 分数四舍五入**
   * 对于任意计算出的分数，最终分数应使用标准四舍五入规则精确到一位小数。
   * **验证: 需求 4.4**
   */
  describe('属性 17: 分数四舍五入', () => {
    it('应正确四舍五入到一位小数', () => {
      fc.assert(
        fc.property(
          fc.float({ min: 0, max: 10, noNaN: true }),
          (score) => {
            const rounded = roundScore(score)
            
            // 验证结果是一位小数
            const decimalPlaces = (rounded.toString().split('.')[1] || '').length
            expect(decimalPlaces).toBeLessThanOrEqual(1)
            
            // 验证四舍五入正确性
            const expected = Math.round(score * 10) / 10
            expect(rounded).toBe(expected)
          }
        ),
        { numRuns: 100 }
      )
    })
  })

  /**
   * **功能: agent-scanner-mvp, 属性 16: 混合分数公式**
   * 对于任意两个分数（scoreA, scoreB），其中两者都是非负数，混合计算应返回 Max(scoreA, scoreB) + 0.5，封顶为 10.0。
   * **验证: 需求 4.1, 4.2, 4.3**
   */
  describe('属性 16: 混合分数公式', () => {
    it('应返回 Max(A, B) + 0.5，封顶 10.0', () => {
      fc.assert(
        fc.property(
          fc.float({ min: 0, max: 10, noNaN: true }),
          fc.float({ min: 0, max: 10, noNaN: true }),
          (scoreA, scoreB) => {
            const hybrid = calculateHybridScore(scoreA, scoreB)
            
            const expected = Math.min(Math.max(scoreA, scoreB) + 0.5, 10.0)
            expect(hybrid).toBe(expected)
            
            // 验证封顶
            expect(hybrid).toBeLessThanOrEqual(10.0)
          }
        ),
        { numRuns: 100 }
      )
    })
  })

  /**
   * 协议分数计算测试
   */
  describe('协议分数计算', () => {
    it('MCP 应得 2.0 分，标准接口应得 1.0 分', () => {
      fc.assert(
        fc.property(
          fc.boolean(),
          fc.boolean(),
          (hasMCP, hasStandardInterface) => {
            const score = calculateProtocolScore(hasMCP, hasStandardInterface)
            
            if (hasMCP) {
              expect(score).toBe(2.0)
            } else if (hasStandardInterface) {
              expect(score).toBe(1.0)
            } else {
              expect(score).toBe(0)
            }
          }
        ),
        { numRuns: 100 }
      )
    })
  })
})
