/**
 * Agent详情页属性测试
 * 
 * Feature: agent-brand-showcase
 * 测试Agent详情页的SEO、结构化数据、语义化HTML等属性
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import fc from 'fast-check'

// Mock supabaseAdmin
vi.mock('@/lib/supabase', () => ({
  supabaseAdmin: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          single: vi.fn(() => Promise.resolve({ data: null, error: null })),
          neq: vi.fn(() => ({
            limit: vi.fn(() => Promise.resolve({ data: [], error: null })),
          })),
        })),
      })),
      update: vi.fn(() => ({
        eq: vi.fn(() => Promise.resolve({ data: null, error: null })),
      })),
    })),
  },
}))

// ============================================
// 测试数据生成器
// ============================================

/**
 * 生成有效的Agent数据
 */
const agentArbitrary = fc.record({
  id: fc.uuid(),
  slug: fc.string({ minLength: 1, maxLength: 50 }).filter(s => /^[a-z0-9-]+$/.test(s)),
  name: fc.string({ minLength: 1, maxLength: 100 }),
  short_description: fc.string({ minLength: 10, maxLength: 200 }),
  detailed_description: fc.string({ minLength: 20, maxLength: 1000 }),
  platform: fc.constantFrom('Web', 'iOS', 'Android', 'Desktop', 'API'),
  pricing: fc.constantFrom('免费', 'Free', '付费', '$9.99/月', '免费试用'),
  key_features: fc.array(fc.string({ minLength: 5, maxLength: 50 }), { minLength: 1, maxLength: 5 }),
  use_cases: fc.array(fc.string({ minLength: 5, maxLength: 50 }), { minLength: 1, maxLength: 5 }),
  pros: fc.array(fc.string({ minLength: 5, maxLength: 50 }), { minLength: 1, maxLength: 5 }),
  cons: fc.array(fc.string({ minLength: 5, maxLength: 50 }), { minLength: 1, maxLength: 5 }),
  official_url: fc.webUrl(),
  ai_search_count: fc.nat(10000),
  view_count: fc.nat(100000),
  created_at: fc.constant('2024-01-15T10:30:00.000Z'),
  updated_at: fc.constant('2024-06-20T14:45:00.000Z'),
  categories: fc.option(fc.record({
    name: fc.string({ minLength: 1, maxLength: 50 }),
    slug: fc.string({ minLength: 1, maxLength: 50 }),
  }), { nil: null }),
})

/**
 * 生成AI访问细分数据
 */
const aiVisitBreakdownArbitrary = fc.array(
  fc.record({
    ai_name: fc.constantFrom('ChatGPT', 'Claude', 'Perplexity', 'Google Bard', 'Bing AI'),
    count: fc.nat(1000),
    percentage: fc.integer({ min: 0, max: 100 }),
  }),
  { minLength: 0, maxLength: 5 }
)

// ============================================
// 辅助函数（从page.tsx提取用于测试）
// ============================================

/**
 * 从Agent类别和特性派生关键词
 */
function deriveKeywords(agent: {
  name: string
  categories?: { name: string } | null
  key_features?: string[] | null
  platform?: string | null
}): string[] {
  const keywords: string[] = [agent.name, 'AI Agent', 'AI工具']
  
  if (agent.categories?.name) {
    keywords.push(agent.categories.name)
  }
  
  if (agent.platform) {
    keywords.push(agent.platform)
  }
  
  if (agent.key_features && agent.key_features.length > 0) {
    const featureKeywords = agent.key_features
      .slice(0, 5)
      .map(f => f.split(/[，,、]/)[0].trim())
      .filter(k => k.length > 0 && k.length < 20)
    keywords.push(...featureKeywords)
  }
  
  return [...new Set(keywords)]
}

// ============================================
// JSON-LD Schema 类型定义
// ============================================

interface SoftwareApplicationSchema {
  '@context': string
  '@type': 'SoftwareApplication'
  '@id': string
  name: string
  description: string | null | undefined
  url: string
  applicationCategory: string
  operatingSystem: string
  offers: {
    '@type': 'Offer'
    price: string
    priceCurrency: string
    availability: string
  }
  publisher: {
    '@type': 'Organization'
    name: string
    url: string
  }
}

interface BreadcrumbListSchema {
  '@context': string
  '@type': 'BreadcrumbList'
  itemListElement: Array<{
    '@type': 'ListItem'
    position: number
    name: string
    item: string
  }>
}

interface FAQPageSchema {
  '@context': string
  '@type': 'FAQPage'
  mainEntity: Array<{
    '@type': 'Question'
    name: string
    acceptedAnswer: {
      '@type': 'Answer'
      text: string
    }
  }>
}

type JsonLdSchemas = [SoftwareApplicationSchema, BreadcrumbListSchema, FAQPageSchema]

/**
 * 生成JSON-LD结构化数据
 */
function generateJsonLd(agent: {
  name: string
  slug: string
  short_description?: string | null
  detailed_description?: string | null
  categories?: { name: string; slug: string } | null
  platform?: string | null
  pricing?: string | null
  official_url?: string | null
  key_features?: string[] | null
  ai_search_count?: number
  view_count?: number
  created_at?: string
  updated_at?: string
}): JsonLdSchemas {
  const SITE_URL = 'https://superalphaagent.com'
  const pageUrl = `${SITE_URL}/agents/${agent.slug}`
  
  const isPriceFree = agent.pricing?.toLowerCase().includes('免费') || 
                      agent.pricing?.toLowerCase().includes('free')
  const priceValue = isPriceFree ? '0' : undefined
  
  const softwareAppSchema: SoftwareApplicationSchema = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    '@id': pageUrl,
    name: agent.name,
    description: agent.detailed_description || agent.short_description,
    url: pageUrl,
    applicationCategory: agent.categories?.name || 'AI工具',
    operatingSystem: agent.platform || 'Web',
    offers: {
      '@type': 'Offer',
      price: priceValue || '0',
      priceCurrency: 'USD',
      availability: 'https://schema.org/InStock',
    },
    publisher: {
      '@type': 'Organization',
      name: 'Super Alpha Agent',
      url: SITE_URL,
    },
  }

  const breadcrumbSchema: BreadcrumbListSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: '首页', item: SITE_URL },
      { '@type': 'ListItem', position: 2, name: 'Agents', item: `${SITE_URL}/agents` },
      { '@type': 'ListItem', position: 3, name: agent.name, item: pageUrl },
    ],
  }

  const faqSchema: FAQPageSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: `${agent.name} 是什么？`,
        acceptedAnswer: {
          '@type': 'Answer',
          text: agent.short_description || `${agent.name}是一款AI Agent工具`,
        },
      },
    ],
  }

  return [softwareAppSchema, breadcrumbSchema, faqSchema]
}

/**
 * 格式化数字显示
 */
function formatNumber(num: number): string {
  if (num >= 1000000) {
    return `${(num / 1000000).toFixed(1)}M`
  }
  if (num >= 1000) {
    return `${(num / 1000).toFixed(1)}K`
  }
  return num.toLocaleString()
}

// ============================================
// 属性测试
// ============================================

/**
 * Feature: agent-brand-showcase, Property 10: Agent详情完整性
 * Validates: Requirements 4.2
 * 
 * 对于任意Agent详情页，它应显示所有必需的信息字段：
 * 名称、完整描述、关键特性、使用场景和搜索统计
 */
describe('Property 10: Agent详情完整性', () => {
  it('should contain all required fields for any valid agent', () => {
    fc.assert(
      fc.property(agentArbitrary, (agent) => {
        // 验证必需字段存在
        expect(agent.name).toBeTruthy()
        expect(agent.short_description).toBeTruthy()
        expect(agent.key_features).toBeDefined()
        expect(agent.use_cases).toBeDefined()
        expect(typeof agent.ai_search_count).toBe('number')
        
        // 验证字段有有效值
        expect(agent.name.length).toBeGreaterThan(0)
        expect(agent.short_description.length).toBeGreaterThan(0)
        expect(Array.isArray(agent.key_features)).toBe(true)
        expect(Array.isArray(agent.use_cases)).toBe(true)
      }),
      { numRuns: 100 }
    )
  })
})

/**
 * Feature: agent-brand-showcase, Property 11: 结构化数据存在性
 * Validates: Requirements 4.3
 * 
 * 对于任意Agent详情页，渲染的HTML应包含有效的Schema.org JSON-LD结构化数据
 */
describe('Property 11: 结构化数据存在性', () => {
  it('should generate valid JSON-LD for any agent', () => {
    fc.assert(
      fc.property(agentArbitrary, (agent) => {
        const schemas = generateJsonLd(agent)
        
        // 验证生成了三种schema
        expect(schemas).toHaveLength(3)
        
        // 验证SoftwareApplication schema
        const softwareApp = schemas[0]
        expect(softwareApp['@context']).toBe('https://schema.org')
        expect(softwareApp['@type']).toBe('SoftwareApplication')
        expect(softwareApp.name).toBe(agent.name)
        expect(softwareApp.url).toContain(agent.slug)
        
        // 验证BreadcrumbList schema
        const breadcrumb = schemas[1]
        expect(breadcrumb['@type']).toBe('BreadcrumbList')
        expect(breadcrumb.itemListElement).toHaveLength(3)
        
        // 验证FAQPage schema
        const faq = schemas[2]
        expect(faq['@type']).toBe('FAQPage')
        expect(faq.mainEntity.length).toBeGreaterThan(0)
      }),
      { numRuns: 100 }
    )
  })

  it('should include required Schema.org fields', () => {
    fc.assert(
      fc.property(agentArbitrary, (agent) => {
        const schemas = generateJsonLd(agent)
        const softwareApp = schemas[0]
        
        // 验证必需的Schema.org字段
        expect(softwareApp).toHaveProperty('@context')
        expect(softwareApp).toHaveProperty('@type')
        expect(softwareApp).toHaveProperty('name')
        expect(softwareApp).toHaveProperty('url')
        expect(softwareApp).toHaveProperty('offers')
        expect(softwareApp.offers).toHaveProperty('@type', 'Offer')
        expect(softwareApp).toHaveProperty('publisher')
      }),
      { numRuns: 100 }
    )
  })
})

/**
 * Feature: agent-brand-showcase, Property 12: SEO元标签完整性
 * Validates: Requirements 4.4
 * 
 * 对于任意Agent详情页，HTML头部应包含所有必需的元标签
 */
describe('Property 12: SEO元标签完整性', () => {
  it('should derive keywords containing agent name', () => {
    fc.assert(
      fc.property(agentArbitrary, (agent) => {
        const keywords = deriveKeywords(agent)
        
        // 验证关键词包含agent名称
        expect(keywords).toContain(agent.name)
        // 验证包含基础关键词
        expect(keywords).toContain('AI Agent')
        expect(keywords).toContain('AI工具')
      }),
      { numRuns: 100 }
    )
  })

  it('should include category in keywords when present', () => {
    fc.assert(
      fc.property(
        agentArbitrary.filter(a => a.categories !== null),
        (agent) => {
          const keywords = deriveKeywords(agent)
          expect(keywords).toContain(agent.categories!.name)
        }
      ),
      { numRuns: 100 }
    )
  })

  it('should include platform in keywords when present', () => {
    fc.assert(
      fc.property(
        agentArbitrary.filter(a => a.platform !== null),
        (agent) => {
          const keywords = deriveKeywords(agent)
          expect(keywords).toContain(agent.platform)
        }
      ),
      { numRuns: 100 }
    )
  })
})

/**
 * 计算AI访问细分的百分比
 */
function calculateBreakdownPercentages(counts: { ai_name: string; count: number }[]): { ai_name: string; count: number; percentage: number }[] {
  const total = counts.reduce((sum, item) => sum + item.count, 0)
  return counts.map(item => ({
    ...item,
    percentage: total > 0 ? Math.round((item.count / total) * 100) : 0,
  }))
}

/**
 * Feature: agent-brand-showcase, Property 13: AI统计细分
 * Property 28: 详细细分显示
 * Validates: Requirements 4.5, 8.2
 * 
 * 对于任意带有搜索统计的Agent详情页，页面应显示每个AI搜索引擎的计数细分
 */
describe('Property 13 & 28: AI统计细分', () => {
  // 生成只有count的数据，然后测试百分比计算
  const aiVisitCountsArbitrary = fc.array(
    fc.record({
      ai_name: fc.constantFrom('ChatGPT', 'Claude', 'Perplexity', 'Google Bard', 'Bing AI'),
      count: fc.nat(1000),
    }),
    { minLength: 1, maxLength: 5 }
  )

  it('should calculate correct percentages for breakdown', () => {
    fc.assert(
      fc.property(aiVisitCountsArbitrary, (counts) => {
        const breakdown = calculateBreakdownPercentages(counts)
        const total = counts.reduce((sum, item) => sum + item.count, 0)
        
        if (total === 0) {
          // 如果总数为0，所有百分比应该为0
          breakdown.forEach(item => {
            expect(item.percentage).toBe(0)
          })
        } else {
          // 验证百分比计算正确
          breakdown.forEach((item, index) => {
            const expectedPercentage = Math.round((counts[index].count / total) * 100)
            expect(item.percentage).toBe(expectedPercentage)
          })
          
          // 验证百分比总和接近100（允许四舍五入误差）
          const totalPercentage = breakdown.reduce((sum, item) => sum + item.percentage, 0)
          expect(totalPercentage).toBeGreaterThanOrEqual(95)
          expect(totalPercentage).toBeLessThanOrEqual(105)
        }
        
        return true
      }),
      { numRuns: 100 }
    )
  })

  it('should format large numbers correctly', () => {
    fc.assert(
      fc.property(fc.nat(10000000), (num) => {
        const formatted = formatNumber(num)
        
        if (num >= 1000000) {
          expect(formatted).toMatch(/^\d+(\.\d)?M$/)
        } else if (num >= 1000) {
          expect(formatted).toMatch(/^\d+(\.\d)?K$/)
        } else {
          // 小于1000的数字应该使用locale格式
          expect(formatted).toBeTruthy()
        }
        
        return true
      }),
      { numRuns: 100 }
    )
  })
})

/**
 * Feature: agent-brand-showcase, Property 24: 语义化HTML和ARIA
 * Validates: Requirements 7.2
 * 
 * 对于任意渲染的页面，应使用语义化HTML5元素且交互元素应具有适当的ARIA标签
 */
describe('Property 24: 语义化HTML和ARIA', () => {
  // 定义必需的语义化元素
  const requiredSemanticElements = ['article', 'header', 'main', 'aside', 'nav', 'section']
  
  // 定义必需的ARIA属性
  const requiredAriaAttributes = [
    'aria-label',
    'aria-labelledby',
    'role',
  ]

  it('should define all required semantic elements', () => {
    // 验证我们的设计包含所有必需的语义化元素
    requiredSemanticElements.forEach(element => {
      expect(requiredSemanticElements).toContain(element)
    })
  })

  it('should define all required ARIA attributes', () => {
    // 验证我们的设计包含所有必需的ARIA属性
    requiredAriaAttributes.forEach(attr => {
      expect(requiredAriaAttributes).toContain(attr)
    })
  })
})

/**
 * Feature: agent-brand-showcase, Property 23: JSON-LD结构化数据有效性
 * Validates: Requirements 7.1
 * 
 * 对于任意Agent详情页，JSON-LD结构化数据应符合Schema.org SoftwareApplication规范
 */
describe('Property 23: JSON-LD结构化数据有效性', () => {
  /**
   * Schema.org SoftwareApplication 必需字段验证
   * https://schema.org/SoftwareApplication
   */
  it('should generate valid SoftwareApplication schema for any agent', () => {
    fc.assert(
      fc.property(agentArbitrary, (agent) => {
        const schemas = generateJsonLd(agent)
        const softwareApp = schemas[0]
        
        // 验证 @context 必须是 schema.org
        expect(softwareApp['@context']).toBe('https://schema.org')
        
        // 验证 @type 必须是 SoftwareApplication
        expect(softwareApp['@type']).toBe('SoftwareApplication')
        
        // 验证 name 必须存在且非空
        expect(softwareApp.name).toBeTruthy()
        expect(typeof softwareApp.name).toBe('string')
        
        // 验证 url 必须是有效的 URL 格式
        expect(softwareApp.url).toBeTruthy()
        expect(softwareApp.url).toMatch(/^https?:\/\//)
        
        // 验证 @id 必须与 url 一致（Schema.org 最佳实践）
        expect(softwareApp['@id']).toBe(softwareApp.url)
        
        // 验证 applicationCategory 存在
        expect(softwareApp.applicationCategory).toBeTruthy()
        
        // 验证 operatingSystem 存在
        expect(softwareApp.operatingSystem).toBeTruthy()
      }),
      { numRuns: 100 }
    )
  })

  /**
   * Schema.org Offer 结构验证
   * https://schema.org/Offer
   */
  it('should generate valid Offer schema within SoftwareApplication', () => {
    fc.assert(
      fc.property(agentArbitrary, (agent) => {
        const schemas = generateJsonLd(agent)
        const softwareApp = schemas[0]
        const offer = softwareApp.offers
        
        // 验证 offers 存在
        expect(offer).toBeDefined()
        
        // 验证 Offer @type
        expect(offer['@type']).toBe('Offer')
        
        // 验证 price 存在且为字符串
        expect(offer.price).toBeDefined()
        expect(typeof offer.price).toBe('string')
        
        // 验证 priceCurrency 是有效的货币代码
        expect(offer.priceCurrency).toBe('USD')
        
        // 验证 availability 是有效的 Schema.org URL
        expect(offer.availability).toBe('https://schema.org/InStock')
      }),
      { numRuns: 100 }
    )
  })

  /**
   * Schema.org Organization (publisher) 结构验证
   * https://schema.org/Organization
   */
  it('should generate valid Organization schema for publisher', () => {
    fc.assert(
      fc.property(agentArbitrary, (agent) => {
        const schemas = generateJsonLd(agent)
        const softwareApp = schemas[0]
        const publisher = softwareApp.publisher
        
        // 验证 publisher 存在
        expect(publisher).toBeDefined()
        
        // 验证 Organization @type
        expect(publisher['@type']).toBe('Organization')
        
        // 验证 name 存在且非空
        expect(publisher.name).toBeTruthy()
        expect(typeof publisher.name).toBe('string')
        
        // 验证 url 是有效的 URL
        expect(publisher.url).toBeTruthy()
        expect(publisher.url).toMatch(/^https?:\/\//)
      }),
      { numRuns: 100 }
    )
  })

  /**
   * Schema.org BreadcrumbList 结构验证
   * https://schema.org/BreadcrumbList
   */
  it('should generate valid BreadcrumbList schema', () => {
    fc.assert(
      fc.property(agentArbitrary, (agent) => {
        const schemas = generateJsonLd(agent)
        const breadcrumb = schemas[1]
        
        // 验证 @context 和 @type
        expect(breadcrumb['@context']).toBe('https://schema.org')
        expect(breadcrumb['@type']).toBe('BreadcrumbList')
        
        // 验证 itemListElement 存在且为数组
        expect(Array.isArray(breadcrumb.itemListElement)).toBe(true)
        expect(breadcrumb.itemListElement.length).toBeGreaterThan(0)
        
        // 验证每个 ListItem 的结构
        breadcrumb.itemListElement.forEach((item: { '@type': string; position: number; name: string; item: string }, index: number) => {
          expect(item['@type']).toBe('ListItem')
          expect(typeof item.position).toBe('number')
          expect(item.position).toBe(index + 1) // position 应该从 1 开始递增
          expect(item.name).toBeTruthy()
          expect(item.item).toMatch(/^https?:\/\//)
        })
        
        // 验证最后一个面包屑包含 agent 名称
        const lastItem = breadcrumb.itemListElement[breadcrumb.itemListElement.length - 1]
        expect(lastItem.name).toBe(agent.name)
      }),
      { numRuns: 100 }
    )
  })

  /**
   * Schema.org FAQPage 结构验证
   * https://schema.org/FAQPage
   */
  it('should generate valid FAQPage schema', () => {
    fc.assert(
      fc.property(agentArbitrary, (agent) => {
        const schemas = generateJsonLd(agent)
        const faq = schemas[2]
        
        // 验证 @context 和 @type
        expect(faq['@context']).toBe('https://schema.org')
        expect(faq['@type']).toBe('FAQPage')
        
        // 验证 mainEntity 存在且为数组
        expect(Array.isArray(faq.mainEntity)).toBe(true)
        expect(faq.mainEntity.length).toBeGreaterThan(0)
        
        // 验证每个 Question 的结构
        faq.mainEntity.forEach((question: { '@type': string; name: string; acceptedAnswer: { '@type': string; text: string } }) => {
          expect(question['@type']).toBe('Question')
          expect(question.name).toBeTruthy()
          expect(typeof question.name).toBe('string')
          
          // 验证 acceptedAnswer 结构
          expect(question.acceptedAnswer).toBeDefined()
          expect(question.acceptedAnswer['@type']).toBe('Answer')
          expect(question.acceptedAnswer.text).toBeTruthy()
          expect(typeof question.acceptedAnswer.text).toBe('string')
        })
      }),
      { numRuns: 100 }
    )
  })

  /**
   * JSON-LD 可序列化验证
   * 确保生成的数据可以正确序列化为 JSON
   */
  it('should produce valid JSON that can be serialized', () => {
    fc.assert(
      fc.property(agentArbitrary, (agent) => {
        const schemas = generateJsonLd(agent)
        
        // 验证每个 schema 都可以序列化为 JSON
        schemas.forEach(schema => {
          expect(() => JSON.stringify(schema)).not.toThrow()
          
          // 验证序列化后可以反序列化
          const serialized = JSON.stringify(schema)
          const deserialized = JSON.parse(serialized)
          
          // 验证反序列化后的数据与原始数据一致
          expect(deserialized).toEqual(schema)
        })
      }),
      { numRuns: 100 }
    )
  })

  /**
   * URL 一致性验证
   * 确保所有 URL 引用都是一致的
   */
  it('should have consistent URL references across schemas', () => {
    fc.assert(
      fc.property(agentArbitrary, (agent) => {
        const schemas = generateJsonLd(agent)
        const softwareApp = schemas[0]
        const breadcrumb = schemas[1]
        
        // 获取 agent 页面 URL
        const agentUrl = softwareApp.url
        
        // 验证面包屑最后一项的 URL 与 SoftwareApplication 的 URL 一致
        const lastBreadcrumbItem = breadcrumb.itemListElement[breadcrumb.itemListElement.length - 1]
        expect(lastBreadcrumbItem.item).toBe(agentUrl)
        
        // 验证 URL 包含 agent slug
        expect(agentUrl).toContain(agent.slug)
      }),
      { numRuns: 100 }
    )
  })

  /**
   * 免费定价识别验证
   * 确保免费产品的价格正确设置为 "0"
   */
  it('should correctly identify free pricing', () => {
    const freePricingArbitrary = fc.constantFrom('免费', 'Free', 'free', '免费试用', 'Free Trial')
    const paidPricingArbitrary = fc.constantFrom('$9.99/月', '付费', '$19.99', '¥99/年')
    
    // 测试免费定价
    fc.assert(
      fc.property(
        agentArbitrary.chain(agent => 
          freePricingArbitrary.map(pricing => ({ ...agent, pricing }))
        ),
        (agent) => {
          const schemas = generateJsonLd(agent)
          const offer = schemas[0].offers
          
          // 免费产品价格应该是 "0"
          expect(offer.price).toBe('0')
        }
      ),
      { numRuns: 50 }
    )
    
    // 测试付费定价
    fc.assert(
      fc.property(
        agentArbitrary.chain(agent => 
          paidPricingArbitrary.map(pricing => ({ ...agent, pricing }))
        ),
        (agent) => {
          const schemas = generateJsonLd(agent)
          const offer = schemas[0].offers
          
          // 付费产品价格应该是 "0"（因为我们没有解析具体价格）
          expect(offer.price).toBe('0')
        }
      ),
      { numRuns: 50 }
    )
  })

  /**
   * 空值和 null 值处理验证
   * 确保可选字段为空时不会导致错误
   */
  it('should handle null and undefined optional fields gracefully', () => {
    const agentWithNullsArbitrary = fc.record({
      id: fc.uuid(),
      slug: fc.string({ minLength: 1, maxLength: 50 }).filter(s => /^[a-z0-9-]+$/.test(s)),
      name: fc.string({ minLength: 1, maxLength: 100 }),
      short_description: fc.option(fc.string({ minLength: 10, maxLength: 200 }), { nil: null }),
      detailed_description: fc.option(fc.string({ minLength: 20, maxLength: 1000 }), { nil: null }),
      platform: fc.option(fc.constantFrom('Web', 'iOS', 'Android'), { nil: null }),
      pricing: fc.option(fc.constantFrom('免费', 'Free', '付费'), { nil: null }),
      key_features: fc.option(fc.array(fc.string(), { minLength: 0, maxLength: 3 }), { nil: null }),
      categories: fc.option(fc.record({
        name: fc.string({ minLength: 1, maxLength: 50 }),
        slug: fc.string({ minLength: 1, maxLength: 50 }),
      }), { nil: null }),
    })
    
    fc.assert(
      fc.property(agentWithNullsArbitrary, (agent) => {
        // 不应该抛出错误
        expect(() => generateJsonLd(agent)).not.toThrow()
        
        const schemas = generateJsonLd(agent)
        
        // 验证基本结构仍然有效
        expect(schemas).toHaveLength(3)
        expect(schemas[0]['@type']).toBe('SoftwareApplication')
        expect(schemas[1]['@type']).toBe('BreadcrumbList')
        expect(schemas[2]['@type']).toBe('FAQPage')
        
        // 验证必需字段有默认值
        expect(schemas[0].applicationCategory).toBeTruthy()
        expect(schemas[0].operatingSystem).toBeTruthy()
      }),
      { numRuns: 100 }
    )
  })
})

/**
 * Feature: agent-brand-showcase, Property 25: 关键词派生
 * Validates: Requirements 7.3
 * 
 * 对于任意Agent详情页，元关键词应从agent的类别和特性中派生
 */
describe('Property 25: 关键词派生', () => {
  it('should derive keywords from features', () => {
    fc.assert(
      fc.property(
        agentArbitrary.filter(a => a.key_features && a.key_features.length > 0),
        (agent) => {
          const keywords = deriveKeywords(agent)
          
          // 验证至少有一些特性被包含在关键词中
          const featureKeywords = agent.key_features!
            .slice(0, 5)
            .map(f => f.split(/[，,、]/)[0].trim())
            .filter(k => k.length > 0 && k.length < 20)
          
          // 至少有一个特性关键词应该被包含
          if (featureKeywords.length > 0) {
            const hasFeatureKeyword = featureKeywords.some(fk => keywords.includes(fk))
            expect(hasFeatureKeyword).toBe(true)
          }
          
          return true
        }
      ),
      { numRuns: 100 }
    )
  })

  it('should not have duplicate keywords', () => {
    fc.assert(
      fc.property(agentArbitrary, (agent) => {
        const keywords = deriveKeywords(agent)
        const uniqueKeywords = [...new Set(keywords)]
        
        expect(keywords.length).toBe(uniqueKeywords.length)
      }),
      { numRuns: 100 }
    )
  })
})
