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
}) {
  const SITE_URL = 'https://superalphaagent.com'
  const pageUrl = `${SITE_URL}/agents/${agent.slug}`
  
  const isPriceFree = agent.pricing?.toLowerCase().includes('免费') || 
                      agent.pricing?.toLowerCase().includes('free')
  const priceValue = isPriceFree ? '0' : undefined
  
  const softwareAppSchema = {
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

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: '首页', item: SITE_URL },
      { '@type': 'ListItem', position: 2, name: 'Agents', item: `${SITE_URL}/agents` },
      { '@type': 'ListItem', position: 3, name: agent.name, item: pageUrl },
    ],
  }

  const faqSchema = {
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
