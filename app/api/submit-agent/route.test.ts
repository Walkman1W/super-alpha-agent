/**
 * Submit Agent API 属性测试
 * 
 * 测试覆盖:
 * - 属性 15: 分析启动 (需求 5.3)
 * - 属性 17: 提取后的数据库持久化 (需求 5.5)
 * - 属性 22: 数据库存储 (需求 6.5)
 * - 集成测试: 完整提交流程 (需求 5.1-5.5)
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { NextRequest } from 'next/server'

// Mock Supabase
const mockSupabaseFrom = vi.fn()
const mockSupabaseRpc = vi.fn()

vi.mock('@/lib/supabase', () => ({
  supabaseAdmin: {
    from: (...args: unknown[]) => mockSupabaseFrom(...args),
    rpc: (...args: unknown[]) => mockSupabaseRpc(...args)
  }
}))

// Mock URL Analyzer
const mockValidateURL = vi.fn()
const mockAnalyzeURL = vi.fn()

vi.mock('@/lib/url-analyzer', () => ({
  validateURL: (...args: unknown[]) => mockValidateURL(...args),
  analyzeURL: (...args: unknown[]) => mockAnalyzeURL(...args)
}))

// 动态导入以确保mock生效
const importRoute = async () => {
  const routeModule = await import('./route')
  return routeModule
}

describe('Submit Agent API', () => {
  // 用于生成唯一IP的计数器，避免速率限制
  let testCounter = 0
  
  beforeEach(() => {
    vi.clearAllMocks()
    testCounter++
    
    // 默认mock设置
    mockValidateURL.mockReturnValue({
      isValid: true,
      url: 'https://example.com/agent'
    })
  })

  afterEach(() => {
    vi.resetAllMocks()
  })

  /**
   * 创建模拟的NextRequest
   * 每个测试使用不同的IP避免速率限制
   */
  function createMockRequest(
    body: unknown,
    method: string = 'POST',
    headers: Record<string, string> = {}
  ): NextRequest {
    const url = 'http://localhost:3000/api/submit-agent'
    const uniqueIP = `10.0.${Math.floor(testCounter / 256)}.${testCounter % 256}`
    return new NextRequest(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        'x-forwarded-for': uniqueIP,
        ...headers
      },
      body: JSON.stringify(body)
    })
  }

  describe('请求验证', () => {
    it('应该拒绝空的请求体', async () => {
      const { POST } = await importRoute()
      const request = new NextRequest('http://localhost:3000/api/submit-agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: '{}'
      })
      
      const response = await POST(request)
      const data = await response.json()
      
      expect(response.status).toBe(400)
      expect(data.error).toBeDefined()
    })

    it('应该拒绝缺少URL的请求', async () => {
      const { POST } = await importRoute()
      const request = createMockRequest({ email: 'test@example.com' })
      
      const response = await POST(request)
      const data = await response.json()
      
      expect(response.status).toBe(400)
      expect(data.error).toContain('验证失败')
    })

    it('应该拒绝无效的邮箱格式', async () => {
      const { POST } = await importRoute()
      const request = createMockRequest({
        url: 'https://example.com/agent',
        email: 'invalid-email'
      })
      
      const response = await POST(request)
      const data = await response.json()
      
      expect(response.status).toBe(400)
      expect(data.details).toContain('无效的邮箱格式')
    })

    it('应该拒绝超长的备注', async () => {
      const { POST } = await importRoute()
      const request = createMockRequest({
        url: 'https://example.com/agent',
        notes: 'a'.repeat(1001)
      })
      
      const response = await POST(request)
      const data = await response.json()
      
      expect(response.status).toBe(400)
      expect(data.details).toContain('备注不能超过1000个字符')
    })
  })

  describe('URL验证', () => {
    it('应该拒绝无效的URL格式', async () => {
      mockValidateURL.mockReturnValue({
        isValid: false,
        error: '无效的URL格式'
      })
      
      const { POST } = await importRoute()
      const request = createMockRequest({ url: 'not-a-url' })
      
      const response = await POST(request)
      const data = await response.json()
      
      expect(response.status).toBe(400)
      expect(data.error).toBe('无效的URL格式')
    })

    it('应该拒绝非http/https协议', async () => {
      mockValidateURL.mockReturnValue({
        isValid: false,
        error: '只允许http或https协议'
      })
      
      const { POST } = await importRoute()
      const request = createMockRequest({ url: 'ftp://example.com' })
      
      const response = await POST(request)
      const data = await response.json()
      
      expect(response.status).toBe(400)
      expect(data.error).toBe('只允许http或https协议')
    })
  })


  describe('属性 15: 分析启动 - 需求 5.3', () => {
    it('有效URL提交应该触发分析', async () => {
      // 设置mock
      mockSupabaseFrom.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({ data: null, error: null })
          })
        }),
        insert: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: { id: 'test-id', slug: 'test-agent' },
              error: null
            })
          })
        })
      })
      
      mockAnalyzeURL.mockResolvedValue({
        success: true,
        data: {
          name: 'Test Agent',
          short_description: 'A test agent for testing',
          key_features: ['Feature 1', 'Feature 2'],
          source_url: 'https://example.com/agent'
        }
      })
      
      const { POST } = await importRoute()
      const request = createMockRequest({ url: 'https://example.com/agent' })
      
      await POST(request)
      
      // 验证analyzeURL被调用
      expect(mockAnalyzeURL).toHaveBeenCalledWith('https://example.com/agent')
    })

    it('分析失败应该返回错误', async () => {
      mockSupabaseFrom.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({ data: null, error: null })
          })
        })
      })
      
      mockAnalyzeURL.mockResolvedValue({
        success: false,
        error: '页面加载超时'
      })
      
      const { POST } = await importRoute()
      const request = createMockRequest({ url: 'https://example.com/agent' })
      
      const response = await POST(request)
      const data = await response.json()
      
      expect(response.status).toBe(422)
      expect(data.error).toBe('页面加载超时')
    })
  })

  describe('属性 17 & 22: 数据库持久化 - 需求 5.5, 6.5', () => {
    it('成功分析后应该创建数据库记录', async () => {
      const mockInsert = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: { id: 'new-agent-id', slug: 'test-agent-abc123' },
            error: null
          })
        })
      })
      
      mockSupabaseFrom.mockImplementation((table: string) => {
        if (table === 'agents') {
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                single: vi.fn().mockResolvedValue({ data: null, error: null })
              })
            }),
            insert: mockInsert
          }
        }
        if (table === 'categories') {
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                single: vi.fn().mockResolvedValue({
                  data: { id: 'category-id' },
                  error: null
                })
              })
            })
          }
        }
        return {}
      })
      
      mockAnalyzeURL.mockResolvedValue({
        success: true,
        data: {
          name: 'Test Agent',
          short_description: 'A test agent for testing purposes',
          key_features: ['Feature 1', 'Feature 2'],
          use_cases: ['Use case 1'],
          pros: ['Pro 1'],
          cons: ['Con 1'],
          platform: 'Web',
          pricing: 'Free',
          category: '开发工具',
          keywords: ['test', 'agent'],
          source_url: 'https://example.com/agent'
        }
      })
      
      const { POST } = await importRoute()
      const request = createMockRequest({ url: 'https://example.com/agent' })
      
      const response = await POST(request)
      const data = await response.json()
      
      expect(response.status).toBe(201)
      expect(data.success).toBe(true)
      expect(data.agent).toBeDefined()
      expect(data.agent.id).toBe('new-agent-id')
      
      // 验证insert被调用
      expect(mockInsert).toHaveBeenCalled()
    })

    it('数据库存储失败应该返回错误', async () => {
      mockSupabaseFrom.mockImplementation((table: string) => {
        if (table === 'agents') {
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                single: vi.fn().mockResolvedValue({ data: null, error: null })
              })
            }),
            insert: vi.fn().mockReturnValue({
              select: vi.fn().mockReturnValue({
                single: vi.fn().mockResolvedValue({
                  data: null,
                  error: { message: 'Database error' }
                })
              })
            })
          }
        }
        if (table === 'categories') {
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                single: vi.fn().mockResolvedValue({
                  data: { id: 'category-id' },
                  error: null
                })
              })
            })
          }
        }
        return {}
      })
      
      mockAnalyzeURL.mockResolvedValue({
        success: true,
        data: {
          name: 'Test Agent',
          short_description: 'A test agent for testing',
          key_features: ['Feature 1'],
          source_url: 'https://example.com/agent'
        }
      })
      
      const { POST } = await importRoute()
      const request = createMockRequest({ url: 'https://example.com/agent' })
      
      const response = await POST(request)
      const data = await response.json()
      
      expect(response.status).toBe(500)
      expect(data.error).toContain('数据库')
    })
  })

  describe('重复检测', () => {
    it('已存在的URL应该返回409冲突', async () => {
      mockSupabaseFrom.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: {
                id: 'existing-id',
                slug: 'existing-agent',
                name: 'Existing Agent'
              },
              error: null
            })
          })
        })
      })
      
      const { POST } = await importRoute()
      const request = createMockRequest({ url: 'https://example.com/agent' })
      
      const response = await POST(request)
      const data = await response.json()
      
      expect(response.status).toBe(409)
      expect(data.error).toBe('该Agent已存在')
      expect(data.existing).toBeDefined()
      expect(data.existing.name).toBe('Existing Agent')
    })
  })


  describe('GET 端点 - 检查URL是否存在', () => {
    it('应该返回URL不存在', async () => {
      mockSupabaseFrom.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({ data: null, error: null })
          })
        })
      })
      
      const { GET } = await importRoute()
      const request = new NextRequest(
        'http://localhost:3000/api/submit-agent?url=https://example.com/new-agent'
      )
      
      const response = await GET(request)
      const data = await response.json()
      
      expect(response.status).toBe(200)
      expect(data.exists).toBe(false)
    })

    it('应该返回URL已存在', async () => {
      mockSupabaseFrom.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: {
                id: 'existing-id',
                slug: 'existing-agent',
                name: 'Existing Agent',
                created_at: '2024-01-01T00:00:00Z'
              },
              error: null
            })
          })
        })
      })
      
      const { GET } = await importRoute()
      const request = new NextRequest(
        'http://localhost:3000/api/submit-agent?url=https://example.com/existing-agent'
      )
      
      const response = await GET(request)
      const data = await response.json()
      
      expect(response.status).toBe(200)
      expect(data.exists).toBe(true)
      expect(data.agent.name).toBe('Existing Agent')
    })

    it('缺少url参数应该返回400', async () => {
      const { GET } = await importRoute()
      const request = new NextRequest('http://localhost:3000/api/submit-agent')
      
      const response = await GET(request)
      const data = await response.json()
      
      expect(response.status).toBe(400)
      expect(data.error).toBe('url参数是必需的')
    })
  })

  describe('集成测试: 完整提交流程', () => {
    it('应该完成从URL提交到Agent创建的完整流程', async () => {
      // 模拟完整流程
      mockSupabaseFrom.mockImplementation((table: string) => {
        if (table === 'agents') {
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                single: vi.fn().mockResolvedValue({ data: null, error: null })
              })
            }),
            insert: vi.fn().mockReturnValue({
              select: vi.fn().mockReturnValue({
                single: vi.fn().mockResolvedValue({
                  data: { id: 'new-agent-id', slug: 'my-awesome-agent-abc123' },
                  error: null
                })
              })
            })
          }
        }
        if (table === 'categories') {
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                single: vi.fn().mockResolvedValue({
                  data: { id: 'dev-tools-category' },
                  error: null
                })
              })
            })
          }
        }
        return {}
      })
      
      mockAnalyzeURL.mockResolvedValue({
        success: true,
        data: {
          name: 'My Awesome Agent',
          short_description: 'An awesome AI agent that helps with development tasks',
          detailed_description: 'This is a detailed description of the agent...',
          key_features: ['Code generation', 'Bug fixing', 'Documentation'],
          use_cases: ['Software development', 'Code review'],
          pros: ['Fast', 'Accurate', 'Easy to use'],
          cons: ['Requires API key'],
          platform: 'Web',
          pricing: 'Freemium',
          category: '开发工具',
          keywords: ['ai', 'coding', 'development'],
          how_to_use: 'Simply paste your code and ask questions',
          source_url: 'https://example.com/my-awesome-agent'
        }
      })
      
      const { POST } = await importRoute()
      const request = createMockRequest({
        url: 'https://example.com/my-awesome-agent',
        email: 'developer@example.com',
        notes: 'This is my new AI agent for developers'
      })
      
      const response = await POST(request)
      const data = await response.json()
      
      // 验证完整流程
      expect(response.status).toBe(201)
      expect(data.success).toBe(true)
      expect(data.message).toBe('Agent提交成功')
      expect(data.agent).toMatchObject({
        id: 'new-agent-id',
        name: 'My Awesome Agent',
        url: '/agents/my-awesome-agent-abc123'
      })
      
      // 验证分析被调用
      expect(mockAnalyzeURL).toHaveBeenCalledTimes(1)
      expect(mockAnalyzeURL).toHaveBeenCalledWith('https://example.com/my-awesome-agent')
    })

    it('应该正确处理分析超时错误', async () => {
      mockSupabaseFrom.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({ data: null, error: null })
          })
        })
      })
      
      mockAnalyzeURL.mockResolvedValue({
        success: false,
        error: '页面加载超时，请检查URL是否正确'
      })
      
      const { POST } = await importRoute()
      const request = createMockRequest({ url: 'https://slow-website.com/agent' })
      
      const response = await POST(request)
      const data = await response.json()
      
      expect(response.status).toBe(422)
      expect(data.error).toContain('超时')
    })

    it('应该正确处理AI分析失败', async () => {
      mockSupabaseFrom.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({ data: null, error: null })
          })
        })
      })
      
      mockAnalyzeURL.mockResolvedValue({
        success: false,
        error: 'AI分析失败: 无法解析页面内容'
      })
      
      const { POST } = await importRoute()
      const request = createMockRequest({ url: 'https://example.com/complex-page' })
      
      const response = await POST(request)
      const data = await response.json()
      
      expect(response.status).toBe(422)
      expect(data.error).toContain('AI分析失败')
    })
  })
})
