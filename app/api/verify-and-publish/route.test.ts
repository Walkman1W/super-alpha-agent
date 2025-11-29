import { describe, it, expect, vi, beforeEach } from 'vitest'
import { POST } from './route'
import { NextRequest } from 'next/server'

// Mock dependencies
vi.mock('@/lib/supabase', () => ({
  supabaseAdmin: {
    from: vi.fn((table: string) => {
      if (table === 'agent_submissions') {
        return {
          select: vi.fn(() => ({
            eq: vi.fn(() => ({
              eq: vi.fn(() => ({
                eq: vi.fn(() => ({
                  single: vi.fn(() => Promise.resolve({
                    data: {
                      id: 'sub-123',
                      email: 'test@example.com',
                      url: 'https://example.com',
                      verification_code: '123456',
                      expires_at: new Date(Date.now() + 10 * 60 * 1000).toISOString(),
                      verified: false
                    },
                    error: null
                  }))
                }))
              }))
            }))
          })),
          update: vi.fn(() => ({
            eq: vi.fn(() => Promise.resolve({ error: null }))
          }))
        }
      }
      if (table === 'agents') {
        return {
          insert: vi.fn(() => ({
            select: vi.fn(() => ({
              single: vi.fn(() => Promise.resolve({
                data: {
                  id: 'agent-123',
                  slug: 'test-agent',
                  name: 'Test Agent'
                },
                error: null
              }))
            }))
          }))
        }
      }
      if (table === 'categories') {
        return {
          select: vi.fn(() => ({
            eq: vi.fn(() => ({
              single: vi.fn(() => Promise.resolve({ data: { id: 'cat-123' }, error: null }))
            }))
          }))
        }
      }
      return {}
    })
  }
}))

vi.mock('@/lib/url-analyzer', () => ({
  analyzeURL: vi.fn(() => Promise.resolve({
    success: true,
    data: {
      name: 'Test Agent',
      short_description: 'A test agent',
      category: '开发工具',
      key_features: ['Feature 1'],
      keywords: ['test']
    }
  }))
}))

vi.mock('@/lib/email', () => ({
  sendPublishSuccessEmail: vi.fn(() => Promise.resolve({ success: true }))
}))

describe('POST /api/verify-and-publish', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('应该验证验证码格式', async () => {
    const request = new NextRequest('http://localhost:3000/api/verify-and-publish', {
      method: 'POST',
      body: JSON.stringify({
        email: 'test@example.com',
        code: '123' // 不足6位
      })
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toContain('6位')
  })

  it('应该在验证通过后分析URL并创建Agent', async () => {
    const request = new NextRequest('http://localhost:3000/api/verify-and-publish', {
      method: 'POST',
      body: JSON.stringify({
        email: 'test@example.com',
        code: '123456'
      })
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.success).toBe(true)
    expect(data.agent).toBeDefined()
    expect(data.agent.name).toBe('Test Agent')
  })
})
