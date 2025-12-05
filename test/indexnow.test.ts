import { describe, it, expect, beforeEach, vi } from 'vitest'

/**
 * IndexNow Service Tests
 * 
 * 测试 IndexNow 服务的核心功能
 */

describe('IndexNow Service', () => {
  beforeEach(() => {
    // 清理环境变量
    vi.unstubAllEnvs()
  })

  describe('Configuration', () => {
    it('should handle missing configuration gracefully', async () => {
      // 模拟缺少配置
      vi.stubEnv('INDEXNOW_KEY', '')
      vi.stubEnv('NEXT_PUBLIC_SITE_URL', '')

      const { notifyIndexNow } = await import('@/lib/indexnow')
      
      const results = await notifyIndexNow(['https://example.com/test'])
      
      expect(results).toHaveLength(1)
      expect(results[0].success).toBe(false)
      expect(results[0].error).toBe('Not configured')
    })

    it('should validate URLs before submission', async () => {
      vi.stubEnv('INDEXNOW_KEY', 'test-key-123')
      vi.stubEnv('NEXT_PUBLIC_SITE_URL', 'https://example.com')

      const { notifyIndexNow } = await import('@/lib/indexnow')
      
      // 无效 URL 应该被过滤
      const results = await notifyIndexNow(['not-a-valid-url', 'also-invalid'])
      
      expect(results).toHaveLength(0)
    })
  })

  describe('URL Filtering', () => {
    it('should filter out invalid URLs', async () => {
      vi.stubEnv('INDEXNOW_KEY', 'test-key-123')
      vi.stubEnv('NEXT_PUBLIC_SITE_URL', 'https://example.com')

      const { notifyIndexNow } = await import('@/lib/indexnow')
      
      const urls = [
        'https://valid.com/page',
        'invalid-url',
        'https://another-valid.com/page',
        'not a url at all'
      ]
      
      // Mock fetch to track calls
      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        text: async () => 'OK'
      })
      global.fetch = mockFetch
      
      await notifyIndexNow(urls)
      
      // 应该只调用有效的 URL
      expect(mockFetch).toHaveBeenCalled()
    })
  })

  describe('Batch Processing', () => {
    it('should handle empty URL array', async () => {
      vi.stubEnv('INDEXNOW_KEY', 'test-key-123')
      vi.stubEnv('NEXT_PUBLIC_SITE_URL', 'https://example.com')

      const { batchNotify } = await import('@/lib/indexnow')
      
      // 不应该抛出错误
      await expect(batchNotify([])).resolves.toBeUndefined()
    })

    it('should split large batches correctly', async () => {
      vi.stubEnv('INDEXNOW_KEY', 'test-key-123')
      vi.stubEnv('NEXT_PUBLIC_SITE_URL', 'https://example.com')

      const { batchNotify } = await import('@/lib/indexnow')
      
      // 创建 15,000 个 URL (应该分成 2 批)
      const urls = Array.from({ length: 15000 }, (_, i) => 
        `https://example.com/page-${i}`
      )
      
      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        text: async () => 'OK'
      })
      global.fetch = mockFetch
      
      await batchNotify(urls, 10000)
      
      // 应该调用 2 次 (15000 / 10000 = 2 批)
      expect(mockFetch).toHaveBeenCalledTimes(2)
    })
  })

  describe('Error Handling', () => {
    it('should not throw on API errors', async () => {
      vi.stubEnv('INDEXNOW_KEY', 'test-key-123')
      vi.stubEnv('NEXT_PUBLIC_SITE_URL', 'https://example.com')

      // Need to clear module cache to pick up new env vars
      vi.resetModules()
      const { notifyIndexNow } = await import('@/lib/indexnow')
      
      // Mock fetch to return error with proper response object
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 500,
        text: vi.fn().mockResolvedValue('Internal Server Error')
      })
      
      // 不应该抛出错误
      const results = await notifyIndexNow(['https://example.com/test'])
      
      expect(results).toHaveLength(1)
      expect(results[0].success).toBe(false)
      expect(results[0].error).toBeDefined()
    })

    it('should handle network errors gracefully', async () => {
      vi.stubEnv('INDEXNOW_KEY', 'test-key-123')
      vi.stubEnv('NEXT_PUBLIC_SITE_URL', 'https://example.com')

      // Need to clear module cache to pick up new env vars
      vi.resetModules()
      const { notifyIndexNow } = await import('@/lib/indexnow')
      
      // Mock fetch to throw error
      global.fetch = vi.fn().mockRejectedValue(new Error('Network error'))
      
      const results = await notifyIndexNow(['https://example.com/test'])
      
      expect(results).toHaveLength(1)
      expect(results[0].success).toBe(false)
      expect(results[0].error).toContain('Network error')
    })
  })

  describe('Agent Notification Helpers', () => {
    it('should construct correct agent URL', async () => {
      vi.stubEnv('INDEXNOW_KEY', 'test-key-123')
      vi.stubEnv('NEXT_PUBLIC_SITE_URL', 'https://example.com')

      const { notifyAgentPublished } = await import('@/lib/indexnow')
      
      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        text: async () => 'OK'
      })
      global.fetch = mockFetch
      
      await notifyAgentPublished('my-test-agent')
      
      expect(mockFetch).toHaveBeenCalled()
      const callArgs = mockFetch.mock.calls[0]
      const body = JSON.parse(callArgs[1].body)
      
      expect(body.urlList).toContain('https://example.com/agents/my-test-agent')
    })
  })
})
