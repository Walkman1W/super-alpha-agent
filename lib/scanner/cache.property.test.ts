/**
 * Scanner 缓存层属性测试
 * 
 * **功能: agent-scanner-mvp, 属性 29: 缓存命中逻辑**
 * 对于任意有现有扫描结果的 URL，如果扫描时间戳不到 24 小时，
 * 缓存层应返回缓存数据。
 * **验证: 需求 10.3, 10.4**
 */

import { describe, it, expect } from 'vitest'
import * as fc from 'fast-check'
import { CACHE_CONFIG, type ScannerAgent, type SRScoreBreakdown } from '@/lib/types/scanner'

// ============================================
// 纯函数实现用于测试
// ============================================

const TTL_MS = CACHE_CONFIG.TTL_HOURS * 60 * 60 * 1000

/**
 * 检查缓存是否有效
 */
function isCacheValid(lastScannedAt: Date | null, now: Date): boolean {
  if (!lastScannedAt) return false
  
  const age = now.getTime() - lastScannedAt.getTime()
  return age < TTL_MS
}

/**
 * 计算缓存年龄 (分钟)
 */
function getCacheAgeMinutes(lastScannedAt: Date, now: Date): number {
  const ageMs = now.getTime() - lastScannedAt.getTime()
  return Math.floor(ageMs / (60 * 1000))
}

/**
 * 计算剩余 TTL (分钟)
 */
function getRemainingTTLMinutes(lastScannedAt: Date, now: Date): number {
  const expiresAt = lastScannedAt.getTime() + TTL_MS
  const remaining = expiresAt - now.getTime()
  return Math.max(0, Math.floor(remaining / (60 * 1000)))
}

/**
 * 模拟缓存检查结果
 */
interface MockCacheCheckResult {
  hit: boolean
  cacheAgeMinutes: number | null
  remainingTTLMinutes: number | null
}

function checkCache(
  lastScannedAt: Date | null,
  now: Date,
  forceRescan: boolean
): MockCacheCheckResult {
  // 强制重新扫描时跳过缓存
  if (forceRescan) {
    return {
      hit: false,
      cacheAgeMinutes: null,
      remainingTTLMinutes: null
    }
  }

  // 无扫描记录
  if (!lastScannedAt) {
    return {
      hit: false,
      cacheAgeMinutes: null,
      remainingTTLMinutes: null
    }
  }

  // 检查缓存是否有效
  if (isCacheValid(lastScannedAt, now)) {
    return {
      hit: true,
      cacheAgeMinutes: getCacheAgeMinutes(lastScannedAt, now),
      remainingTTLMinutes: getRemainingTTLMinutes(lastScannedAt, now)
    }
  }

  return {
    hit: false,
    cacheAgeMinutes: null,
    remainingTTLMinutes: null
  }
}

// ============================================
// 生成器
// ============================================

/**
 * 生成有效的缓存时间戳 (24 小时内)
 */
const validCacheTimestamp = (now: Date) => 
  fc.integer({ min: 1, max: TTL_MS - 1 }).map(
    offset => new Date(now.getTime() - offset)
  )

/**
 * 生成过期的缓存时间戳 (超过 24 小时)
 */
const expiredCacheTimestamp = (now: Date) =>
  fc.integer({ min: TTL_MS + 1, max: TTL_MS * 2 }).map(
    offset => new Date(now.getTime() - offset)
  )

/**
 * 生成任意缓存时间戳
 */
const anyCacheTimestamp = (now: Date) =>
  fc.oneof(
    validCacheTimestamp(now),
    expiredCacheTimestamp(now)
  )

// ============================================
// 属性测试
// ============================================

describe('Scanner Cache Property Tests', () => {
  const now = new Date()

  /**
   * **功能: agent-scanner-mvp, 属性 29: 缓存命中逻辑**
   * 对于任意有现有扫描结果的 URL，如果扫描时间戳不到 24 小时，
   * 缓存层应返回缓存数据。
   * **验证: 需求 10.3, 10.4**
   */
  describe('Property 29: Cache Hit Logic', () => {
    it('should return cache hit for scans within 24 hours', () => {
      fc.assert(
        fc.property(
          validCacheTimestamp(now),
          (lastScannedAt) => {
            const result = checkCache(lastScannedAt, now, false)
            
            expect(result.hit).toBe(true)
            expect(result.cacheAgeMinutes).not.toBeNull()
            expect(result.cacheAgeMinutes).toBeGreaterThanOrEqual(0)
            expect(result.cacheAgeMinutes).toBeLessThan(CACHE_CONFIG.TTL_HOURS * 60)
          }
        ),
        { numRuns: 100 }
      )
    })

    it('should return cache miss for scans older than 24 hours', () => {
      fc.assert(
        fc.property(
          expiredCacheTimestamp(now),
          (lastScannedAt) => {
            const result = checkCache(lastScannedAt, now, false)
            
            expect(result.hit).toBe(false)
            expect(result.cacheAgeMinutes).toBeNull()
          }
        ),
        { numRuns: 100 }
      )
    })

    it('should return cache miss when lastScannedAt is null', () => {
      const result = checkCache(null, now, false)
      
      expect(result.hit).toBe(false)
      expect(result.cacheAgeMinutes).toBeNull()
    })

    it('should bypass cache when forceRescan is true', () => {
      fc.assert(
        fc.property(
          validCacheTimestamp(now),
          (lastScannedAt) => {
            const result = checkCache(lastScannedAt, now, true)
            
            // 即使有有效缓存，强制重新扫描也应该返回 miss
            expect(result.hit).toBe(false)
          }
        ),
        { numRuns: 100 }
      )
    })
  })

  describe('Cache Age Calculation', () => {
    it('should calculate correct cache age in minutes', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 1, max: 1440 }), // 1 分钟到 24 小时
          (ageMinutes) => {
            const lastScannedAt = new Date(now.getTime() - ageMinutes * 60 * 1000)
            const result = checkCache(lastScannedAt, now, false)
            
            if (result.hit) {
              // 允许 1 分钟的误差
              expect(Math.abs(result.cacheAgeMinutes! - ageMinutes)).toBeLessThanOrEqual(1)
            }
          }
        ),
        { numRuns: 100 }
      )
    })

    it('should calculate correct remaining TTL', () => {
      fc.assert(
        fc.property(
          validCacheTimestamp(now),
          (lastScannedAt) => {
            const result = checkCache(lastScannedAt, now, false)
            
            if (result.hit && result.remainingTTLMinutes !== null) {
              // 剩余 TTL + 缓存年龄 应该约等于总 TTL
              const totalMinutes = result.cacheAgeMinutes! + result.remainingTTLMinutes
              const expectedTotal = CACHE_CONFIG.TTL_HOURS * 60
              
              // 允许 2 分钟的误差
              expect(Math.abs(totalMinutes - expectedTotal)).toBeLessThanOrEqual(2)
            }
          }
        ),
        { numRuns: 100 }
      )
    })
  })

  describe('Cache Boundary Tests', () => {
    it('should handle exact 24-hour boundary correctly', () => {
      // 恰好 24 小时前 - 应该过期
      const exactlyExpired = new Date(now.getTime() - TTL_MS)
      const result = checkCache(exactlyExpired, now, false)
      expect(result.hit).toBe(false)

      // 23 小时 59 分钟前 - 应该有效
      const justValid = new Date(now.getTime() - TTL_MS + 60000)
      const validResult = checkCache(justValid, now, false)
      expect(validResult.hit).toBe(true)
    })

    it('should handle very recent scans', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 1, max: 60 }), // 1-60 秒前
          (secondsAgo) => {
            const recentScan = new Date(now.getTime() - secondsAgo * 1000)
            const result = checkCache(recentScan, now, false)
            
            expect(result.hit).toBe(true)
            expect(result.cacheAgeMinutes).toBeLessThanOrEqual(1)
          }
        ),
        { numRuns: 100 }
      )
    })
  })

  describe('Cache Validity Function', () => {
    it('should correctly identify valid cache timestamps', () => {
      fc.assert(
        fc.property(
          anyCacheTimestamp(now),
          (lastScannedAt) => {
            const isValid = isCacheValid(lastScannedAt, now)
            const age = now.getTime() - lastScannedAt.getTime()
            
            if (age < TTL_MS) {
              expect(isValid).toBe(true)
            } else {
              expect(isValid).toBe(false)
            }
          }
        ),
        { numRuns: 100 }
      )
    })

    it('should return false for null timestamps', () => {
      expect(isCacheValid(null, now)).toBe(false)
    })
  })

  describe('ForceRescan Behavior', () => {
    it('should always bypass cache when forceRescan is true regardless of cache state', () => {
      fc.assert(
        fc.property(
          fc.option(anyCacheTimestamp(now), { nil: undefined }),
          (lastScannedAt) => {
            const result = checkCache(lastScannedAt || null, now, true)
            expect(result.hit).toBe(false)
          }
        ),
        { numRuns: 100 }
      )
    })

    it('should respect cache when forceRescan is false and cache is valid', () => {
      fc.assert(
        fc.property(
          validCacheTimestamp(now),
          (lastScannedAt) => {
            const withForce = checkCache(lastScannedAt, now, true)
            const withoutForce = checkCache(lastScannedAt, now, false)
            
            expect(withForce.hit).toBe(false)
            expect(withoutForce.hit).toBe(true)
          }
        ),
        { numRuns: 100 }
      )
    })
  })
})
