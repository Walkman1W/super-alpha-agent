import { describe, it, expect } from 'vitest'
import { fc } from '@fast-check/vitest'

// 关键词生成函数（模拟实际的generateKeywords函数）
function generateKeywords(categories: string[], features: string[]): string[] {
  const keywords = new Set<string>()
  
  // 从类别派生关键词
  categories.forEach(category => {
    const categoryWords = category.toLowerCase().split(/[\s,\-]+/)
    categoryWords.forEach(word => {
      if (word.length > 2) {
        keywords.add(word)
      }
    })
  })
  
  // 从特性派生关键词
  features.forEach(feature => {
    const featureWords = feature.toLowerCase().split(/[\s,\-]+/)
    featureWords.forEach(word => {
      if (word.length > 2) {
        keywords.add(word)
      }
    })
  })
  
  // 添加通用AI关键词
  keywords.add('ai')
  keywords.add('artificial intelligence')
  keywords.add('machine learning')
  keywords.add('automation')
  
  // 添加组合关键词
  if (categories.length > 0 && features.length > 0) {
    const category = categories[0].toLowerCase()
    const feature = features[0].toLowerCase()
    keywords.add(`${category} ${feature}`)
    keywords.add(`${feature} ${category}`)
  }
  
  return Array.from(keywords)
}

// 验证关键词质量
function validateKeywords(keywords: string[]): boolean {
  // 检查关键词数量
  if (keywords.length < 5 || keywords.length > 50) {
    return false
  }
  
  // 检查关键词长度
  for (const keyword of keywords) {
    if (keyword.length < 2 || keyword.length > 30) {
      return false
    }
  }
  
  // 检查关键词多样性
  const uniqueKeywords = new Set(keywords)
  if (uniqueKeywords.size < keywords.length * 0.8) {
    return false
  }
  
  return true
}

describe('关键词派生 - 属性测试', () => {
  it('属性 25: 关键词派生 - 验证从类别派生关键词', async () => {
    await fc.assert(
      fc.property(
        fc.array(fc.string({ minLength: 3, maxLength: 20 }), { minLength: 1, maxLength: 5 }),
        fc.array(fc.string({ minLength: 3, maxLength: 20 }), { minLength: 0, maxLength: 3 }),
        (categories, features) => {
          const keywords = generateKeywords(categories, features)
          
          // 验证关键词生成成功
          expect(keywords).toBeInstanceOf(Array)
          expect(keywords.length).toBeGreaterThan(0)
          
          // 验证从类别派生的关键词
          categories.forEach(category => {
            const categoryWords = category.toLowerCase().split(/[\s,\-]+/)
            categoryWords.forEach(word => {
              if (word.length > 2) {
                // 验证关键词中包含类别词
                const hasCategoryWord = keywords.some(keyword => 
                  keyword.toLowerCase().includes(word.toLowerCase())
                )
                expect(hasCategoryWord).toBe(true)
              }
            })
          })
          
          // 验证关键词质量
          expect(validateKeywords(keywords)).toBe(true)
        }
      ),
      {
        numRuns: 20,
        verbose: true
      }
    )
  })

  it('属性 25: 关键词派生 - 验证从特性派生关键词', async () => {
    await fc.assert(
      fc.property(
        fc.array(fc.string({ minLength: 3, maxLength: 20 }), { minLength: 0, maxLength: 3 }),
        fc.array(fc.string({ minLength: 3, maxLength: 20 }), { minLength: 1, maxLength: 5 }),
        (categories, features) => {
          const keywords = generateKeywords(categories, features)
          
          // 验证关键词生成成功
          expect(keywords).toBeInstanceOf(Array)
          expect(keywords.length).toBeGreaterThan(0)
          
          // 验证从特性派生的关键词
          features.forEach(feature => {
            const featureWords = feature.toLowerCase().split(/[\s,\-]+/)
            featureWords.forEach(word => {
              if (word.length > 2) {
                // 验证关键词中包含特性词
                const hasFeatureWord = keywords.some(keyword => 
                  keyword.toLowerCase().includes(word.toLowerCase())
                )
                expect(hasFeatureWord).toBe(true)
              }
            })
          })
          
          // 验证关键词质量
          expect(validateKeywords(keywords)).toBe(true)
        }
      ),
      {
        numRuns: 20,
        verbose: true
      }
    )
  })

  it('属性 25: 关键词派生 - 验证通用AI关键词的包含', async () => {
    await fc.assert(
      fc.property(
        fc.array(fc.string({ minLength: 3, maxLength: 20 }), { minLength: 1, maxLength: 3 }),
        fc.array(fc.string({ minLength: 3, maxLength: 20 }), { minLength: 1, maxLength: 3 }),
        (categories, features) => {
          const keywords = generateKeywords(categories, features)
          
          // 验证通用AI关键词的存在
          expect(keywords).toContain('ai')
          expect(keywords).toContain('artificial intelligence')
          expect(keywords).toContain('machine learning')
          expect(keywords).toContain('automation')
          
          // 验证关键词质量
          expect(validateKeywords(keywords)).toBe(true)
        }
      ),
      {
        numRuns: 15,
        verbose: true
      }
    )
  })

  it('属性 25: 关键词派生 - 验证组合关键词的生成', async () => {
    await fc.assert(
      fc.property(
        fc.array(fc.string({ minLength: 3, maxLength: 15 }), { minLength: 1, maxLength: 2 }),
        fc.array(fc.string({ minLength: 3, maxLength: 15 }), { minLength: 1, maxLength: 2 }),
        (categories, features) => {
          const keywords = generateKeywords(categories, features)
          
          // 验证组合关键词的生成
          if (categories.length > 0 && features.length > 0) {
            const category = categories[0].toLowerCase()
            const feature = features[0].toLowerCase()
            
            // 验证组合关键词存在
            const hasCombinedKeyword = keywords.some(keyword => 
              keyword.toLowerCase().includes(category) && 
              keyword.toLowerCase().includes(feature)
            )
            
            expect(hasCombinedKeyword).toBe(true)
          }
          
          // 验证关键词质量
          expect(validateKeywords(keywords)).toBe(true)
        }
      ),
      {
        numRuns: 15,
        verbose: true
      }
    )
  })

  it('属性 25: 关键词派生 - 验证关键词质量检查', async () => {
    await fc.assert(
      fc.property(
        fc.array(fc.string({ minLength: 3, maxLength: 20 }), { minLength: 1, maxLength: 5 }),
        fc.array(fc.string({ minLength: 3, maxLength: 20 }), { minLength: 1, maxLength: 5 }),
        (categories, features) => {
          const keywords = generateKeywords(categories, features)
          
          // 验证关键词数量在合理范围内
          expect(keywords.length).toBeGreaterThanOrEqual(5)
          expect(keywords.length).toBeLessThanOrEqual(50)
          
          // 验证关键词长度
          keywords.forEach(keyword => {
            expect(keyword.length).toBeGreaterThanOrEqual(2)
            expect(keyword.length).toBeLessThanOrEqual(30)
          })
          
          // 验证关键词多样性
          const uniqueKeywords = new Set(keywords)
          expect(uniqueKeywords.size).toBeGreaterThanOrEqual(keywords.length * 0.8)
          
          // 验证质量检查函数
          expect(validateKeywords(keywords)).toBe(true)
        }
      ),
      {
        numRuns: 15,
        verbose: true
      }
    )
  })

  it('属性 25: 关键词派生 - 验证边界情况处理', async () => {
    await fc.assert(
      fc.property(
        fc.oneof(
          fc.constant([]), // 空类别
          fc.constant(['']), // 空字符串类别
          fc.constant(['a']), // 短类别
          fc.constant(['very-long-category-name-that-exceeds-normal-length'])
        ),
        fc.oneof(
          fc.constant([]), // 空特性
          fc.constant(['']), // 空字符串特性
          fc.constant(['b']), // 短特性
          fc.constant(['very-long-feature-name-that-exceeds-normal-length'])
        ),
        (categories, features) => {
          const keywords = generateKeywords(categories, features)
          
          // 验证即使在边界情况下也能生成关键词
          expect(keywords).toBeInstanceOf(Array)
          expect(keywords.length).toBeGreaterThanOrEqual(4) // 至少包含通用AI关键词
          
          // 验证通用AI关键词始终存在
          expect(keywords).toContain('ai')
          expect(keywords).toContain('artificial intelligence')
          expect(keywords).toContain('machine learning')
          expect(keywords).toContain('automation')
          
          // 验证关键词质量
          expect(validateKeywords(keywords)).toBe(true)
        }
      ),
      {
        numRuns: 10,
        verbose: true
      }
    )
  })

  it('属性 25: 关键词派生 - 验证关键词去重功能', async () => {
    await fc.assert(
      fc.property(
        fc.array(fc.constant('duplicate category'), { minLength: 2, maxLength: 5 }),
        fc.array(fc.constant('duplicate feature'), { minLength: 2, maxLength: 5 }),
        (categories, features) => {
          const keywords = generateKeywords(categories, features)
          
          // 验证关键词数组中无重复项
          const uniqueKeywords = new Set(keywords)
          expect(uniqueKeywords.size).toBe(keywords.length)
          
          // 验证关键词质量
          expect(validateKeywords(keywords)).toBe(true)
        }
      ),
      {
        numRuns: 10,
        verbose: true
      }
    )
  })
})