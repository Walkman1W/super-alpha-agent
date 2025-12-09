import { describe, it, expect, vi, beforeEach } from 'vitest'
import { POST } from './route'
import { NextRequest } from 'next/server'

// Mock dependencies
vi.mock('@/lib/supabase', () => ({
  supabaseAdmin: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          single: vi.fn(() => Promise.resolve({ data: null, error: null })),
          gte: vi.fn(() => Promise.resolve({ data: [], error: null }))
        }))
      })),
      upsert: vi.fn(() => Promise.resolve({ error: null })),
      insert: vi.fn(() => Promise.resolve({ error: null })),
      delete: vi.fn(() => ({
        eq: vi.fn(() => ({
          eq: vi.fn(() => Promise.resolve({ error: null })),
          lt: vi.fn(() => Promise.resolve({ error: null }))
        }))
      }))
    }))
  }
}))

vi.mock('@/lib/url-analyzer', () => ({
  validateURL: vi.fn((url: string) => ({
    isValid: url.startsWith('http'),
    url: url,
    error: url.startsWith('http') ? null : '无效的URL'
  }))
}))

vi.mock('@/lib/email', () => ({
  generateVerificationCode: vi.fn(() => '123456'),
  sendVerificationEmail: vi.fn(() => Promise.resolve({ success: true }))
}))

describe('POST /api/send-verification', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('应该验证URL和邮箱格式', async () => {
    const request = new NextRequest('http://localhost:3000/api/send-verification', {
      method: 'POST',
      body: JSON.stringify({
        url: 'invalid-url',
        email: 'test@example.com'
      })
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toBeTruthy()
  })

  it('应该验证邮箱格式', async () => {
    const request = new NextRequest('http://localhost:3000/api/send-verification', {
      method: 'POST',
      body: JSON.stringify({
        url: 'https://example.com',
        email: 'invalid-email'
      })
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toContain('邮箱')
  })

  it('应该成功发送验证码（不做AI分析）', async () => {
    const request = new NextRequest('http://localhost:3000/api/send-verification', {
      method: 'POST',
      body: JSON.stringify({
        url: 'https://chat.openai.com/g/test',
        email: 'test@example.com'
      })
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.success).toBe(true)
    expect(data.message).toContain('验证码')
  })
})
