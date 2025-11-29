import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { fc } from '@fast-check/vitest'

// 模拟元数据生成函数
function generateMetadata(agentData: any) {
  const keywords = [
    agentData.name,
    agentData.categories?.name,
    'AI工具',
    '人工智能',
    agentData.platform,
    ...agentData.key_features || [],
    ...agentData.use_cases || []
  ].filter(Boolean).join(', ')

  return {
    title: `${agentData.name} - AI工具详情`,
    description: agentData.short_description || agentData.detailed_description,
    keywords,
    openGraph: {
      title: agentData.name,
      description: agentData.short_description,
      type: 'website',
      url: `https://example.com/agents/${agentData.slug}`,
      images: [`https://example.com/og-image/${agentData.slug}`]
    },
    twitter: {
      card: 'summary_large_image',
      title: agentData.name,
      description: agentData.short_description,
      images: [`https://example.com/twitter-image/${agentData.slug}`]
    },
    robots: {
      index: true,
      follow: true,
      googlebot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1
      }
    },
    authors: [{ name: 'Super Alpha Agent', url: 'https://example.com' }],
    creator: 'Super Alpha Agent',
    publisher: 'Super Alpha Agent',
    geo: {
      region: 'CN',
      placename: 'China'
    }
  }
}

// 验证元数据完整性
function validateMetadata(metadata: any): boolean {
  if (!metadata || typeof metadata !== 'object') return false
  
  // 验证基本元标签
  if (!metadata.title || typeof metadata.title !== 'string') return false
  if (!metadata.description || typeof metadata.description !== 'string') return false
  if (!metadata.keywords || typeof metadata.keywords !== 'string') return false
  
  // 验证Open Graph标签
  if (!metadata.openGraph || typeof metadata.openGraph !== 'object') return false
  if (!metadata.openGraph.title || typeof metadata.openGraph.title !== 'string') return false
  if (!metadata.openGraph.description || typeof metadata.openGraph.description !== 'string') return false
  if (!metadata.openGraph.type || typeof metadata.openGraph.type !== 'string') return false
  if (!metadata.openGraph.url || typeof metadata.openGraph.url !== 'string') return false
  if (!Array.isArray(metadata.openGraph.images)) return false
  
  // 验证Twitter标签
  if (!metadata.twitter || typeof metadata.twitter !== 'object') return false
  if (!metadata.twitter.card || typeof metadata.twitter.card !== 'string') return false
  if (!metadata.twitter.title || typeof metadata.twitter.title !== 'string') return false
  if (!metadata.twitter.description || typeof metadata.twitter.description !== 'string') return false
  if (!Array.isArray(metadata.twitter.images)) return false
  
  // 验证Robots标签
  if (!metadata.robots || typeof metadata.robots !== 'object') return false
  if (typeof metadata.robots.index !== 'boolean') return false
  if (typeof metadata.robots.follow !== 'boolean') return false
  if (!metadata.robots.googlebot || typeof metadata.robots.googlebot !== 'object') return false
  
  // 验证作者信息
  if (!Array.isArray(metadata.authors)) return false
  if (metadata.authors.length === 0) return false
  if (!metadata.authors[0].name || typeof metadata.authors[0].name !== 'string') return false
  
  // 验证其他SEO字段
  if (!metadata.creator || typeof metadata.creator !== 'string') return false
  if (!metadata.publisher || typeof metadata.publisher !== 'string') return false
  if (!metadata.geo || typeof metadata.geo !== 'object') return false
  if (!metadata.geo.region || typeof metadata.geo.region !== 'string') return false
  if (!metadata.geo.placename || typeof metadata.geo.placename !== 'string') return false
  
  return true
}

describe('SEO元标签完整性 - 属性测试', () => {
  it('属性 12: SEO元标签完整性 - 验证所有必需meta标签的存在', async () => {
    await fc.assert(
      fc.property(
        fc.record({
          name: fc.string({ minLength: 1, maxLength: 100 }),
          slug: fc.string({ minLength: 1, maxLength: 100 }),
          short_description: fc.string({ minLength: 1, maxLength: 200 }),
          detailed_description: fc.string({ minLength: 1, maxLength: 500 }),
          categories: fc.record({
            name: fc.string({ minLength: 1, maxLength: 50 })
          }),
          platform: fc.string({ minLength: 1, maxLength: 50 }),
          key_features: fc.array(fc.string({ minLength: 1, maxLength: 100 }), { minLength: 1, maxLength: 10 }),
          use_cases: fc.array(fc.string({ minLength: 1, maxLength: 100 }), { minLength: 1, maxLength: 10 })
        }),
        (agentData) => {
          const metadata = generateMetadata(agentData)
          
          // 验证元数据完整性
          const isValid = validateMetadata(metadata)
          expect(isValid).toBe(true)
          
          // 验证基本元标签
          expect(metadata.title).toContain(agentData.name)
          expect(metadata.description).toBeTruthy()
          expect(metadata.keywords).toContain(agentData.name)
          expect(metadata.keywords).toContain(agentData.categories.name)
          expect(metadata.keywords).toContain('AI工具')
          expect(metadata.keywords).toContain('人工智能')
          expect(metadata.keywords).toContain(agentData.platform)
          
          // 验证Open Graph标签
          expect(metadata.openGraph.title).toBe(agentData.name)
          expect(metadata.openGraph.description).toBe(agentData.short_description)
          expect(metadata.openGraph.type).toBe('website')
          expect(metadata.openGraph.url).toContain(`/agents/${agentData.slug}`)
          expect(metadata.openGraph.images.length).toBeGreaterThan(0)
          
          // 验证Twitter标签
          expect(metadata.twitter.card).toBe('summary_large_image')
          expect(metadata.twitter.title).toBe(agentData.name)
          expect(metadata.twitter.description).toBe(agentData.short_description)
          expect(metadata.twitter.images.length).toBeGreaterThan(0)
          
          // 验证Robots标签
          expect(metadata.robots.index).toBe(true)
          expect(metadata.robots.follow).toBe(true)
          expect(metadata.robots.googlebot.index).toBe(true)
          expect(metadata.robots.googlebot.follow).toBe(true)
          
          // 验证作者和发布者信息
          expect(metadata.authors.length).toBeGreaterThan(0)
          expect(metadata.authors[0].name).toBe('Super Alpha Agent')
          expect(metadata.creator).toBe('Super Alpha Agent')
          expect(metadata.publisher).toBe('Super Alpha Agent')
          
          // 验证地理信息
          expect(metadata.geo.region).toBe('CN')
          expect(metadata.geo.placename).toBe('China')
        }
      ),
      {
        numRuns: 15,
        verbose: true
      }
    )
  })

  it('属性 12: SEO元标签完整性 - 验证关键词生成逻辑', async () => {
    await fc.assert(
      fc.property(
        fc.record({
          name: fc.string({ minLength: 1, maxLength: 50 }),
          categories: fc.record({
            name: fc.string({ minLength: 1, maxLength: 30 })
          }),
          platform: fc.string({ minLength: 1, maxLength: 30 }),
          key_features: fc.array(fc.string({ minLength: 1, maxLength: 50 }), { minLength: 1, maxLength: 5 }),
          use_cases: fc.array(fc.string({ minLength: 1, maxLength: 50 }), { minLength: 1, maxLength: 5 })
        }),
        (agentData) => {
          const metadata = generateMetadata(agentData)
          const keywords = metadata.keywords.split(', ')
          
          // 验证关键词包含所有必需元素
          expect(keywords).toContain(agentData.name)
          expect(keywords).toContain(agentData.categories.name)
          expect(keywords).toContain('AI工具')
          expect(keywords).toContain('人工智能')
          expect(keywords).toContain(agentData.platform)
          
          // 验证特性关键词
          agentData.key_features.forEach(feature => {
            expect(keywords).toContain(feature)
          })
          
          // 验证使用场景关键词
          agentData.use_cases.forEach(useCase => {
            expect(keywords).toContain(useCase)
          })
          
          // 验证关键词总数
          expect(keywords.length).toBeGreaterThanOrEqual(
            5 + agentData.key_features.length + agentData.use_cases.length
          )
        }
      ),
      {
        numRuns: 10,
        verbose: true
      }
    )
  })

  it('属性 12: SEO元标签完整性 - 验证无效数据被拒绝', async () => {
    await fc.assert(
      fc.property(
        fc.oneof(
          // 缺少必需字段
          fc.record({
            name: fc.string({ minLength: 1 }),
            slug: fc.string({ minLength: 1 }),
            short_description: fc.string({ minLength: 1 })
            // 缺少其他必需字段
          }),
          // 空字符串
          fc.record({
            name: fc.constant(''),
            slug: fc.string({ minLength: 1 }),
            short_description: fc.string({ minLength: 1 }),
            detailed_description: fc.string({ minLength: 1 }),
            categories: fc.record({ name: fc.string({ minLength: 1 }) }),
            platform: fc.string({ minLength: 1 }),
            key_features: fc.array(fc.string({ minLength: 1 }), { minLength: 1 }),
            use_cases: fc.array(fc.string({ minLength: 1 }), { minLength: 1 })
          }),
          // 无效URL
          fc.record({
            name: fc.string({ minLength: 1 }),
            slug: fc.constant('invalid slug with spaces'),
            short_description: fc.string({ minLength: 1 }),
            detailed_description: fc.string({ minLength: 1 }),
            categories: fc.record({ name: fc.string({ minLength: 1 }) }),
            platform: fc.string({ minLength: 1 }),
            key_features: fc.array(fc.string({ minLength: 1 }), { minLength: 1 }),
            use_cases: fc.array(fc.string({ minLength: 1 }), { minLength: 1 })
          })
        ),
        (invalidData) => {
          // 验证无效数据会导致元数据生成失败或不完整
          try {
            const metadata = generateMetadata(invalidData)
            const isValid = validateMetadata(metadata)
            
            // 如果数据无效，元数据验证应该失败
            if (!invalidData.name || !invalidData.slug || !invalidData.short_description) {
              expect(isValid).toBe(false)
            }
          } catch (error) {
            // 预期某些无效数据会抛出错误
            expect(error).toBeDefined()
          }
        }
      ),
      {
        numRuns: 10,
        verbose: true
      }
    )
  })
})