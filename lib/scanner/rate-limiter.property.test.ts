/**
 * Scanner 速率限制器属性测试
 * 
 * **功能: agent-scanner-mvp, 属性 28: 速率限制执行**
 * 对于任意在当前小时窗口内有 N 次扫描请求的 IP 地址，
 * 速率限制器应在 N < 5（匿名）或 N < 20（已认证）时允许请求，否则拒绝。
 * **验证: 需求 10.1, 10.6**
 */

import { describe, it, expect, beforeEach } from 'vitest'
import * as fc from 'fast-check'
import { RATE_LIMIT_CONFIG } from '@/lib/types/scanner'

// ============================================
// 纯函数实现用于测试
// ============================================

interface RateLimitState {
  count: number
  windowStart: number
}

interface RateLimitCheckResult {
  allowed: boolean
  currentCount: number
  maxCount: number
  resetAt: number
}

/**
 * 纯函数：检查速率限制
 * 这是速率限制器核心逻辑的纯函数版本，用于属性测试
 */
function checkRateLimit(
  state: RateLimitState | null,
  now: number,
  windowMs: number,
  isAuthenticated: boolean
): RateLimitCheckResult {
  const maxCount = isAuthenticated 
    ? RATE_LIMIT_CONFIG.AUTHENTICATED_MAX 
    : RATE_LIMIT_CONFIG.ANONYMOUS_MAX

  // 无状态或窗口已过期
  if (!state || now > state.windowStart + windowMs) {
    return {
      allowed: true,
      currentCount: 1,
      maxCount,
      resetAt: now + windowMs
    }
  }

  // 检查是否超限
  if (state.count >= maxCount) {
    return {
      allowed: false,
      currentCount: state.count,
      maxCount,
      resetAt: state.windowStart + windowMs
    }
  }

  // 允许并增加计数
  return {
    allowed: true,
    currentCount: state.count + 1,
    maxCount,
    resetAt: state.windowStart + windowMs
  }
}

/**
 * 纯函数：更新状态
 */
function updateState(
  state: RateLimitState | null,
  now: number,
  windowMs: number
): RateLimitState {
  // 无状态或窗口已过期，创建新状态
  if (!state || now > state.windowStart + windowMs) {
    return { count: 1, windowStart: now }
  }

  // 增加计数
  return { count: state.count + 1, windowStart: state.windowStart }
}

/**
 * 模拟多次请求
 */
function simulateRequests(
  requestCount: number,
  isAuthenticated: boolean,
  windowMs: number = 3600000
): RateLimitCheckResult[] {
  const results: RateLimitCheckResult[] = []
  let state: RateLimitState | null = null
  const now = Date.now()

  for (let i = 0; i < requestCount; i++) {
    const result = checkRateLimit(state, now, windowMs, isAuthenticated)
    results.push(result)
    
    if (result.allowed) {
      state = updateState(state, now, windowMs)
    }
  }

  return results
}

// ============================================
// 属性测试
// ============================================

describe('Scanner Rate Limiter Property Tests', () => {
  const windowMs = RATE_LIMIT_CONFIG.WINDOW_HOURS * 60 * 60 * 1000

  /**
   * **功能: agent-scanner-mvp, 属性 28: 速率限制执行**
   * 对于任意在当前小时窗口内有 N 次扫描请求的 IP 地址，
   * 速率限制器应在 N < 5（匿名）或 N < 20（已认证）时允许请求，否则拒绝。
   * **验证: 需求 10.1, 10.6**
   */
  describe('Property 28: Rate Limit Enforcement', () => {
    it('should allow requests within limit for anonymous users (max 5)', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 1, max: 100 }),
          (requestCount) => {
            const results = simulateRequests(requestCount, false, windowMs)
            const maxAllowed = RATE_LIMIT_CONFIG.ANONYMOUS_MAX

            // 前 maxAllowed 次请求应该被允许
            for (let i = 0; i < Math.min(requestCount, maxAllowed); i++) {
              expect(results[i].allowed).toBe(true)
              expect(results[i].currentCount).toBe(i + 1)
            }

            // 超过限制的请求应该被拒绝
            for (let i = maxAllowed; i < requestCount; i++) {
              expect(results[i].allowed).toBe(false)
              expect(results[i].currentCount).toBe(maxAllowed)
            }
          }
        ),
        { numRuns: 100 }
      )
    })

    it('should allow requests within limit for authenticated users (max 20)', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 1, max: 100 }),
          (requestCount) => {
            const results = simulateRequests(requestCount, true, windowMs)
            const maxAllowed = RATE_LIMIT_CONFIG.AUTHENTICATED_MAX

            // 前 maxAllowed 次请求应该被允许
            for (let i = 0; i < Math.min(requestCount, maxAllowed); i++) {
              expect(results[i].allowed).toBe(true)
              expect(results[i].currentCount).toBe(i + 1)
            }

            // 超过限制的请求应该被拒绝
            for (let i = maxAllowed; i < requestCount; i++) {
              expect(results[i].allowed).toBe(false)
              expect(results[i].currentCount).toBe(maxAllowed)
            }
          }
        ),
        { numRuns: 100 }
      )
    })

    it('should return correct maxCount based on authentication status', () => {
      fc.assert(
        fc.property(
          fc.boolean(),
          (isAuthenticated) => {
            const result = checkRateLimit(null, Date.now(), windowMs, isAuthenticated)
            
            const expectedMax = isAuthenticated 
              ? RATE_LIMIT_CONFIG.AUTHENTICATED_MAX 
              : RATE_LIMIT_CONFIG.ANONYMOUS_MAX
            
            expect(result.maxCount).toBe(expectedMax)
          }
        ),
        { numRuns: 100 }
      )
    })

    it('should reset window after expiration', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 1, max: 10 }),
          fc.boolean(),
          (initialCount, isAuthenticated) => {
            const now = Date.now()
            const oldWindowStart = now - windowMs - 1000 // 窗口已过期
            
            const state: RateLimitState = {
              count: initialCount,
              windowStart: oldWindowStart
            }

            const result = checkRateLimit(state, now, windowMs, isAuthenticated)
            
            // 窗口过期后应该重置，允许请求
            expect(result.allowed).toBe(true)
            expect(result.currentCount).toBe(1)
          }
        ),
        { numRuns: 100 }
      )
    })

    it('should maintain count within same window', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 1, max: 4 }), // 保持在匿名限制内
          (initialCount) => {
            const now = Date.now()
            const windowStart = now - 1000 // 窗口刚开始
            
            const state: RateLimitState = {
              count: initialCount,
              windowStart
            }

            const result = checkRateLimit(state, now, windowMs, false)
            
            if (initialCount < RATE_LIMIT_CONFIG.ANONYMOUS_MAX) {
              expect(result.allowed).toBe(true)
              expect(result.currentCount).toBe(initialCount + 1)
            } else {
              expect(result.allowed).toBe(false)
              expect(result.currentCount).toBe(initialCount)
            }
          }
        ),
        { numRuns: 100 }
      )
    })
  })

  describe('Rate Limit Boundary Tests', () => {
    it('should reject exactly at the limit boundary', () => {
      // 匿名用户：第 6 次请求应该被拒绝
      const anonymousResults = simulateRequests(6, false, windowMs)
      expect(anonymousResults[4].allowed).toBe(true)  // 第 5 次
      expect(anonymousResults[5].allowed).toBe(false) // 第 6 次

      // 已认证用户：第 21 次请求应该被拒绝
      const authResults = simulateRequests(21, true, windowMs)
      expect(authResults[19].allowed).toBe(true)  // 第 20 次
      expect(authResults[20].allowed).toBe(false) // 第 21 次
    })

    it('should provide correct retry-after information', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 6, max: 20 }),
          (requestCount) => {
            const results = simulateRequests(requestCount, false, windowMs)
            const lastResult = results[results.length - 1]
            
            if (!lastResult.allowed) {
              // resetAt 应该在未来
              expect(lastResult.resetAt).toBeGreaterThan(Date.now())
            }
          }
        ),
        { numRuns: 100 }
      )
    })
  })

  describe('Authenticated vs Anonymous Comparison', () => {
    it('should always allow more requests for authenticated users', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 1, max: 50 }),
          (requestCount) => {
            const anonymousResults = simulateRequests(requestCount, false, windowMs)
            const authResults = simulateRequests(requestCount, true, windowMs)

            const anonymousAllowed = anonymousResults.filter(r => r.allowed).length
            const authAllowed = authResults.filter(r => r.allowed).length

            // 已认证用户允许的请求数应该 >= 匿名用户
            expect(authAllowed).toBeGreaterThanOrEqual(anonymousAllowed)
          }
        ),
        { numRuns: 100 }
      )
    })
  })
})
