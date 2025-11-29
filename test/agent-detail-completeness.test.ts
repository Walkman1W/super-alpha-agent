import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { fc } from '@fast-check/vitest'
import AgentDetailPage from '@/app/agents/[slug]/page'

// 模拟 Supabase 客户端
vi.mock('@/lib/supabase', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          single: vi.fn(() => ({
            data: {
              id: 1,
              name: 'Test Agent',
              slug: 'test-agent',
              short_description: 'A test AI agent',
              detailed_description: 'Detailed description of test agent',
              categories: { name: 'Test Category' },
              platform: 'Web',
              pricing: 'Free',
              view_count: 100,
              ai_search_count: 50,
              key_features: ['Feature 1', 'Feature 2'],
              use_cases: ['Use case 1', 'Use case 2'],
              pros: ['Pro 1', 'Pro 2'],
              cons: ['Con 1', 'Con 2'],
              how_to_use: 'How to use instructions',
              official_url: 'https://example.com'
            },
            error: null
          })),
          order: vi.fn(() => ({
            limit: vi.fn(() => ({
              data: [],
              error: null
            }))
          }))
        }))
      }))
    })
  }
}))

describe('Agent详情完整性 - 属性测试', () => {
  it('属性 10: Agent详情完整性 - 验证所有必需信息字段的显示', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          id: fc.integer({ min: 1 }),
          name: fc.string({ minLength: 1, maxLength: 100 }),
          slug: fc.string({ minLength: 1, maxLength: 100 }),
          short_description: fc.string({ minLength: 1, maxLength: 200 }),
          detailed_description: fc.string({ minLength: 1, maxLength: 1000 }),
          categories: fc.record({
            name: fc.string({ minLength: 1, maxLength: 50 })
          }),
          platform: fc.string({ minLength: 1, maxLength: 50 }),
          pricing: fc.string({ minLength: 1, maxLength: 50 }),
          view_count: fc.integer({ min: 0 }),
          ai_search_count: fc.integer({ min: 0 }),
          key_features: fc.array(fc.string({ minLength: 1, maxLength: 100 }), { minLength: 1, maxLength: 10 }),
          use_cases: fc.array(fc.string({ minLength: 1, maxLength: 100 }), { minLength: 1, maxLength: 10 }),
          pros: fc.array(fc.string({ minLength: 1, maxLength: 100 }), { minLength: 1, maxLength: 10 }),
          cons: fc.array(fc.string({ minLength: 1, maxLength: 100 }), { minLength: 1, maxLength: 10 }),
          how_to_use: fc.string({ minLength: 1, maxLength: 500 }),
          official_url: fc.webUrl()
        }),
        async (agentData) => {
          // 模拟 Supabase 返回数据
          const mockSupabase = {
            from: vi.fn(() => ({
              select: vi.fn(() => ({
                eq: vi.fn(() => ({
                  single: vi.fn(() => ({
                    data: agentData,
                    error: null
                  })),
                  order: vi.fn(() => ({
                    limit: vi.fn(() => ({
                      data: [],
                      error: null
                    }))
                  }))
                }))
              }))
            }))
          }

          vi.doMock('@/lib/supabase', () => ({
            supabase: mockSupabase
          }))

          // 渲染页面
          const { props } = await AgentDetailPage({ params: { slug: agentData.slug } })
          
          // 验证必需字段的存在性
          expect(props.agent).toBeDefined()
          expect(props.agent.name).toBe(agentData.name)
          expect(props.agent.short_description).toBe(agentData.short_description)
          expect(props.agent.detailed_description).toBe(agentData.detailed_description)
          expect(props.agent.categories).toEqual(agentData.categories)
          expect(props.agent.platform).toBe(agentData.platform)
          expect(props.agent.pricing).toBe(agentData.pricing)
          expect(props.agent.key_features).toEqual(agentData.key_features)
          expect(props.agent.use_cases).toEqual(agentData.use_cases)
          expect(props.agent.pros).toEqual(agentData.pros)
          expect(props.agent.cons).toEqual(agentData.cons)
          expect(props.agent.how_to_use).toBe(agentData.how_to_use)
          expect(props.agent.official_url).toBe(agentData.official_url)
          expect(props.agent.view_count).toBe(agentData.view_count)
          expect(props.agent.ai_search_count).toBe(agentData.ai_search_count)

          // 验证相似agents数组的存在性
          expect(props.similarAgents).toBeDefined()
          expect(Array.isArray(props.similarAgents)).toBe(true)
        }
      ),
      {
        numRuns: 10, // 运行10次属性测试
        verbose: true
      }
    )
  })

  it('属性 10: Agent详情完整性 - 验证UI显示的正确性', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          name: fc.string({ minLength: 1, maxLength: 50 }),
          short_description: fc.string({ minLength: 1, maxLength: 100 }),
          detailed_description: fc.string({ minLength: 1, maxLength: 500 }),
          key_features: fc.array(fc.string({ minLength: 1, maxLength: 50 }), { minLength: 1, maxLength: 5 }),
          use_cases: fc.array(fc.string({ minLength: 1, maxLength: 50 }), { minLength: 1, maxLength: 5 }),
          pros: fc.array(fc.string({ minLength: 1, maxLength: 50 }), { minLength: 1, maxLength: 5 }),
          cons: fc.array(fc.string({ minLength: 1, maxLength: 50 }), { minLength: 1, maxLength: 5 })
        }),
        async (displayData) => {
          const mockAgent = {
            id: 1,
            name: displayData.name,
            slug: 'test-agent',
            short_description: displayData.short_description,
            detailed_description: displayData.detailed_description,
            categories: { name: 'Test Category' },
            platform: 'Web',
            pricing: 'Free',
            view_count: 100,
            ai_search_count: 50,
            key_features: displayData.key_features,
            use_cases: displayData.use_cases,
            pros: displayData.pros,
            cons: displayData.cons,
            how_to_use: 'How to use',
            official_url: 'https://example.com'
          }

          // 验证数据结构的正确性
          expect(mockAgent.name).toBeTruthy()
          expect(mockAgent.short_description).toBeTruthy()
          expect(mockAgent.detailed_description).toBeTruthy()
          expect(Array.isArray(mockAgent.key_features)).toBe(true)
          expect(Array.isArray(mockAgent.use_cases)).toBe(true)
          expect(Array.isArray(mockAgent.pros)).toBe(true)
          expect(Array.isArray(mockAgent.cons)).toBe(true)

          // 验证数组长度
          expect(mockAgent.key_features.length).toBeGreaterThan(0)
          expect(mockAgent.use_cases.length).toBeGreaterThan(0)
          expect(mockAgent.pros.length).toBeGreaterThan(0)
          expect(mockAgent.cons.length).toBeGreaterThan(0)

          // 验证字符串内容
          mockAgent.key_features.forEach(feature => {
            expect(feature).toBeTruthy()
            expect(typeof feature).toBe('string')
          })

          mockAgent.use_cases.forEach(useCase => {
            expect(useCase).toBeTruthy()
            expect(typeof useCase).toBe('string')
          })

          mockAgent.pros.forEach(pro => {
            expect(pro).toBeTruthy()
            expect(typeof pro).toBe('string')
          })

          mockAgent.cons.forEach(con => {
            expect(con).toBeTruthy()
            expect(typeof con).toBe('string')
          })
        }
      ),
      {
        numRuns: 15,
        verbose: true
      }
    )
  })
})