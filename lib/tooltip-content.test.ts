import { describe, it, expect } from 'vitest'
import * as fc from 'fast-check'
import {
  autonomyLevels,
  getAutonomyTooltipContent,
  formatAutonomyTooltip,
  isValidAutonomyLevel,
  getAllAutonomyLevels,
  geoScoreTooltip,
  formatGeoTooltip,
  type AutonomyLevelDefinition,
} from './tooltip-content'

describe('Tooltip Content', () => {
  describe('Autonomy Levels Definition', () => {
    /**
     * **Feature: brand-content-ux-upgrade, Property 1: 自主等级 Tooltip 一致性**
     * **Validates: Requirements 1.4**
     * 
     * 对于任意自主等级 (L1-L5)，Tooltip 内容应包含有效的标签、描述和行业参考，
     * 且与预定义的自主等级定义匹配。
     */
    it('Property 1: 所有自主等级应包含完整的定义信息', () => {
      // 定义有效的自主等级
      const validLevels = ['L1', 'L2', 'L3', 'L4', 'L5'] as const
      
      fc.assert(
        fc.property(
          fc.constantFrom(...validLevels),
          (level) => {
            const definition = autonomyLevels[level]
            
            // 验证定义存在
            expect(definition).toBeDefined()
            
            // 验证 level 字段匹配
            expect(definition.level).toBe(level)
            
            // 验证标签非空
            expect(definition.label).toBeTruthy()
            expect(definition.label.length).toBeGreaterThan(0)
            
            // 验证英文标签非空
            expect(definition.labelEn).toBeTruthy()
            expect(definition.labelEn.length).toBeGreaterThan(0)
            
            // 验证描述非空且有意义
            expect(definition.description).toBeTruthy()
            expect(definition.description.length).toBeGreaterThan(10)
            
            // 验证行业参考非空
            expect(definition.industryRef).toBeTruthy()
            expect(definition.industryRef.length).toBeGreaterThan(0)
            
            // 验证示例数组非空
            expect(definition.examples).toBeDefined()
            expect(Array.isArray(definition.examples)).toBe(true)
            expect(definition.examples.length).toBeGreaterThan(0)
            
            return true
          }
        ),
        { numRuns: 100 }
      )
    })

    /**
     * **Feature: brand-content-ux-upgrade, Property 1: 自主等级 Tooltip 一致性**
     * **Validates: Requirements 1.4**
     * 
     * getAutonomyTooltipContent 函数应对有效等级返回正确定义，对无效等级返回 null
     */
    it('Property 1: getAutonomyTooltipContent 对有效等级返回正确定义', () => {
      const validLevels = ['L1', 'L2', 'L3', 'L4', 'L5', 'l1', 'l2', 'l3', 'l4', 'l5']
      
      fc.assert(
        fc.property(
          fc.constantFrom(...validLevels),
          (level) => {
            const result = getAutonomyTooltipContent(level)
            
            expect(result).not.toBeNull()
            expect(result?.level).toBe(level.toUpperCase())
            
            return true
          }
        ),
        { numRuns: 100 }
      )
    })

    /**
     * **Feature: brand-content-ux-upgrade, Property 1: 自主等级 Tooltip 一致性**
     * **Validates: Requirements 1.4**
     * 
     * getAutonomyTooltipContent 对无效等级应返回 null
     */
    it('Property 1: getAutonomyTooltipContent 对无效等级返回 null', () => {
      fc.assert(
        fc.property(
          fc.string().filter(s => !['L1', 'L2', 'L3', 'L4', 'L5'].includes(s.toUpperCase())),
          (invalidLevel) => {
            const result = getAutonomyTooltipContent(invalidLevel)
            expect(result).toBeNull()
            return true
          }
        ),
        { numRuns: 100 }
      )
    })

    /**
     * **Feature: brand-content-ux-upgrade, Property 1: 自主等级 Tooltip 一致性**
     * **Validates: Requirements 1.4**
     * 
     * formatAutonomyTooltip 应返回包含标签、描述和参考的格式化字符串
     */
    it('Property 1: formatAutonomyTooltip 返回包含所有必要信息的字符串', () => {
      const validLevels = ['L1', 'L2', 'L3', 'L4', 'L5'] as const
      
      fc.assert(
        fc.property(
          fc.constantFrom(...validLevels),
          (level) => {
            const formatted = formatAutonomyTooltip(level)
            const definition = autonomyLevels[level]
            
            // 验证格式化字符串包含标签
            expect(formatted).toContain(definition.label)
            
            // 验证格式化字符串包含英文标签
            expect(formatted).toContain(definition.labelEn)
            
            // 验证格式化字符串包含描述
            expect(formatted).toContain(definition.description)
            
            // 验证格式化字符串包含行业参考
            expect(formatted).toContain(definition.industryRef)
            
            return true
          }
        ),
        { numRuns: 100 }
      )
    })

    /**
     * **Feature: brand-content-ux-upgrade, Property 1: 自主等级 Tooltip 一致性**
     * **Validates: Requirements 1.4**
     * 
     * isValidAutonomyLevel 应正确识别有效和无效等级
     */
    it('Property 1: isValidAutonomyLevel 正确验证等级', () => {
      const validLevels = ['L1', 'L2', 'L3', 'L4', 'L5', 'l1', 'l2', 'l3', 'l4', 'l5']
      
      // 测试有效等级
      fc.assert(
        fc.property(
          fc.constantFrom(...validLevels),
          (level) => {
            expect(isValidAutonomyLevel(level)).toBe(true)
            return true
          }
        ),
        { numRuns: 100 }
      )
    })

    it('Property 1: isValidAutonomyLevel 对无效等级返回 false', () => {
      fc.assert(
        fc.property(
          fc.string().filter(s => !['L1', 'L2', 'L3', 'L4', 'L5'].includes(s.toUpperCase())),
          (invalidLevel) => {
            expect(isValidAutonomyLevel(invalidLevel)).toBe(false)
            return true
          }
        ),
        { numRuns: 100 }
      )
    })

    it('getAllAutonomyLevels 返回所有 5 个等级', () => {
      const levels = getAllAutonomyLevels()
      
      expect(levels).toHaveLength(5)
      expect(levels.map(l => l.level).sort()).toEqual(['L1', 'L2', 'L3', 'L4', 'L5'])
    })
  })

  describe('GEO Score Tooltip', () => {
    it('GEO 评分 Tooltip 包含完整信息', () => {
      expect(geoScoreTooltip.title).toBeTruthy()
      expect(geoScoreTooltip.description).toBeTruthy()
      expect(geoScoreTooltip.formula).toBeTruthy()
      expect(geoScoreTooltip.components).toBeDefined()
      expect(geoScoreTooltip.components.length).toBeGreaterThan(0)
    })

    it('GEO 评分组件权重总和为 100', () => {
      const totalWeight = geoScoreTooltip.components.reduce(
        (sum, comp) => sum + comp.weight,
        0
      )
      expect(totalWeight).toBe(100)
    })

    it('formatGeoTooltip 返回包含标题和公式的字符串', () => {
      const formatted = formatGeoTooltip()
      
      expect(formatted).toContain(geoScoreTooltip.title)
      expect(formatted).toContain(geoScoreTooltip.description)
      expect(formatted).toContain(geoScoreTooltip.formula)
    })
  })
})
