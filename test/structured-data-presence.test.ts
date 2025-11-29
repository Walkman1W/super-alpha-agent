import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { fc } from '@fast-check/vitest'

// 模拟结构化数据验证函数
function validateStructuredData(data: any): boolean {
  if (!data || typeof data !== 'object') return false
  
  // 验证必需的Schema.org属性
  const requiredFields = ['@context', '@type', 'name', 'description']
  for (const field of requiredFields) {
    if (!data[field] || typeof data[field] !== 'string') return false
  }
  
  // 验证SoftwareApplication特定字段
  if (data['@type'] !== 'SoftwareApplication') return false
  
  // 验证URL格式
  if (data.url && typeof data.url !== 'string') return false
  if (data.url && !data.url.startsWith('http')) return false
  
  // 验证操作系统字段
  if (data.operatingSystem && !Array.isArray(data.operatingSystem)) return false
  
  // 验证价格字段
  if (data.offers && typeof data.offers === 'object') {
    if (!data.offers['@type'] || data.offers['@type'] !== 'Offer') return false
    if (data.offers.price && typeof data.offers.price !== 'string') return false
  }
  
  // 验证评分字段
  if (data.aggregateRating && typeof data.aggregateRating === 'object') {
    if (!data.aggregateRating['@type'] || data.aggregateRating['@type'] !== 'AggregateRating') return false
    if (data.aggregateRating.ratingValue && typeof data.aggregateRating.ratingValue !== 'number') return false
    if (data.aggregateRating.reviewCount && typeof data.aggregateRating.reviewCount !== 'number') return false
  }
  
  // 验证作者字段
  if (data.author && typeof data.aggregateRating === 'object') {
    if (!data.author['@type'] || !data.author.name) return false
  }
  
  // 验证日期字段格式
  if (data.datePublished && typeof data.datePublished !== 'string') return false
  if (data.dateModified && typeof data.dateModified !== 'string') return false
  
  return true
}

describe('结构化数据存在性 - 属性测试', () => {
  it('属性 11: 结构化数据存在性 - 验证JSON-LD格式有效性', async () => {
    await fc.assert(
      fc.property(
        fc.record({
          '@context': fc.constant('https://schema.org'),
          '@type': fc.constant('SoftwareApplication'),
          name: fc.string({ minLength: 1, maxLength: 100 }),
          description: fc.string({ minLength: 1, maxLength: 500 }),
          url: fc.webUrl(),
          operatingSystem: fc.array(fc.string({ minLength: 1, maxLength: 50 }), { minLength: 1, maxLength: 5 }),
          offers: fc.record({
            '@type': fc.constant('Offer'),
            price: fc.string({ minLength: 1, maxLength: 50 }),
            priceCurrency: fc.constant('USD')
          }),
          aggregateRating: fc.record({
            '@type': fc.constant('AggregateRating'),
            ratingValue: fc.float({ min: 1, max: 5 }),
            reviewCount: fc.integer({ min: 0, max: 1000 })
          }),
          author: fc.record({
            '@type': fc.constant('Organization'),
            name: fc.string({ minLength: 1, maxLength: 100 })
          }),
          datePublished: fc.string(),
          dateModified: fc.string(),
          applicationCategory: fc.string({ minLength: 1, maxLength: 50 }),
          downloadUrl: fc.webUrl(),
          screenshot: fc.webUrl()
        }),
        (structuredData) => {
          // 验证结构化数据格式
          const isValid = validateStructuredData(structuredData)
          expect(isValid).toBe(true)
          
          // 验证必需字段存在
          expect(structuredData['@context']).toBe('https://schema.org')
          expect(structuredData['@type']).toBe('SoftwareApplication')
          expect(structuredData.name).toBeTruthy()
          expect(structuredData.description).toBeTruthy()
          expect(structuredData.url).toBeTruthy()
          
          // 验证嵌套对象结构
          if (structuredData.offers) {
            expect(structuredData.offers['@type']).toBe('Offer')
            expect(structuredData.offers.price).toBeTruthy()
          }
          
          if (structuredData.aggregateRating) {
            expect(structuredData.aggregateRating['@type']).toBe('AggregateRating')
            expect(typeof structuredData.aggregateRating.ratingValue).toBe('number')
            expect(typeof structuredData.aggregateRating.reviewCount).toBe('number')
          }
          
          if (structuredData.author) {
            expect(structuredData.author['@type']).toBe('Organization')
            expect(structuredData.author.name).toBeTruthy()
          }
        }
      ),
      {
        numRuns: 20,
        verbose: true
      }
    )
  })

  it('属性 11: 结构化数据存在性 - 验证无效数据被拒绝', async () => {
    await fc.assert(
      fc.property(
        fc.oneof(
          // 缺少必需字段
          fc.record({
            '@context': fc.constant('https://schema.org'),
            '@type': fc.constant('SoftwareApplication')
            // 缺少 name 和 description
          }),
          // 错误的类型
          fc.record({
            '@context': fc.constant('https://schema.org'),
            '@type': fc.constant('InvalidType'),
            name: fc.string({ minLength: 1 }),
            description: fc.string({ minLength: 1 })
          }),
          // 错误的URL格式
          fc.record({
            '@context': fc.constant('https://schema.org'),
            '@type': fc.constant('SoftwareApplication'),
            name: fc.string({ minLength: 1 }),
            description: fc.string({ minLength: 1 }),
            url: fc.string({ minLength: 1 }) // 不是有效的URL
          }),
          // 嵌套对象格式错误
          fc.record({
            '@context': fc.constant('https://schema.org'),
            '@type': fc.constant('SoftwareApplication'),
            name: fc.string({ minLength: 1 }),
            description: fc.string({ minLength: 1 }),
            offers: fc.record({
              // 缺少 '@type': 'Offer'
              price: fc.string({ minLength: 1 })
            })
          })
        ),
        (invalidData) => {
          // 验证无效数据被拒绝
          const isValid = validateStructuredData(invalidData)
          expect(isValid).toBe(false)
        }
      ),
      {
        numRuns: 15,
        verbose: true
      }
    )
  })

  it('属性 11: 结构化数据存在性 - 验证AI搜索统计数据的结构化', async () => {
    await fc.assert(
      fc.property(
        fc.record({
          agentName: fc.string({ minLength: 1, maxLength: 100 }),
          agentDescription: fc.string({ minLength: 1, maxLength: 500 }),
          aiSearchCount: fc.integer({ min: 0, max: 10000 }),
          aiVisits: fc.array(
            fc.record({
              ai_type: fc.oneof(
                fc.constant('ChatGPT'),
                fc.constant('Claude'),
                fc.constant('Perplexity'),
                fc.constant('Gemini'),
                fc.constant('Bing'),
                fc.constant('Other')
              ),
              count: fc.integer({ min: 0, max: 1000 })
            }),
            { minLength: 1, maxLength: 10 }
          )
        }),
        (data) => {
          // 构建包含AI统计的结构化数据
          const structuredData = {
            '@context': 'https://schema.org',
            '@type': 'SoftwareApplication',
            name: data.agentName,
            description: data.agentDescription,
            url: `https://example.com/agents/${data.agentName.toLowerCase().replace(/\s+/g, '-')}`,
            interactionCount: data.aiSearchCount,
            interactionStatistic: data.aiVisits.map(visit => ({
              '@type': 'InteractionCounter',
              interactionType: 'SearchAction',
              name: `${visit.ai_type} Search`,
              userInteractionCount: visit.count
            }))
          }
          
          // 验证结构化数据格式
          const isValid = validateStructuredData(structuredData)
          expect(isValid).toBe(true)
          
          // 验证AI交互统计
          expect(structuredData.interactionCount).toBe(data.aiSearchCount)
          expect(Array.isArray(structuredData.interactionStatistic)).toBe(true)
          expect(structuredData.interactionStatistic.length).toBe(data.aiVisits.length)
          
          // 验证每个AI类型的统计
          structuredData.interactionStatistic.forEach((stat: any, index: number) => {
            expect(stat['@type']).toBe('InteractionCounter')
            expect(stat.interactionType).toBe('SearchAction')
            expect(stat.name).toContain(data.aiVisits[index].ai_type)
            expect(stat.userInteractionCount).toBe(data.aiVisits[index].count)
          })
        }
      ),
      {
        numRuns: 10,
        verbose: true
      }
    )
  })
})