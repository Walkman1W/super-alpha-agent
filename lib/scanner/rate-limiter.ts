/**
 * Scanner 速率限制器
 * 
 * 基于 Supabase 的速率限制实现，支持：
 * - 匿名用户: 5 次/小时/IP
 * - 已认证用户: 20 次/小时
 * - 超过限制返回 429 带 retry-after
 * 
 * Requirements: 10.1, 10.2, 10.6
 */

import { supabaseAdmin } from '@/lib/supabase'
import { RATE_LIMIT_CONFIG } from '@/lib/types/scanner'

/**
 * 速率限制检查结果
 */
export interface ScannerRateLimitResult {
  allowed: boolean
  currentCount: number
  maxCount: number
  resetAt: Date
  retryAfterSeconds?: number
}

/**
 * 速率限制错误
 */
export class RateLimitExceededError extends Error {
  public readonly retryAfterSeconds: number
  public readonly resetAt: Date
  public readonly currentCount: number
  public readonly maxCount: number

  constructor(result: ScannerRateLimitResult) {
    const message = `Rate limit exceeded. Try again in ${result.retryAfterSeconds} seconds.`
    super(message)
    this.name = 'RateLimitExceededError'
    this.retryAfterSeconds = result.retryAfterSeconds || 0
    this.resetAt = result.resetAt
    this.currentCount = result.currentCount
    this.maxCount = result.maxCount
  }
}

/**
 * Scanner 速率限制器类
 * 使用 Supabase rate_limits 表进行持久化存储
 */
export class ScannerRateLimiter {
  private readonly windowMs: number

  constructor() {
    this.windowMs = RATE_LIMIT_CONFIG.WINDOW_HOURS * 60 * 60 * 1000
  }

  /**
   * 获取最大请求数
   */
  getMaxRequests(isAuthenticated: boolean): number {
    return isAuthenticated 
      ? RATE_LIMIT_CONFIG.AUTHENTICATED_MAX 
      : RATE_LIMIT_CONFIG.ANONYMOUS_MAX
  }

  /**
   * 检查并更新速率限制
   * 
   * @param ipAddress - 客户端 IP 地址
   * @param userId - 用户 ID (如果已认证)
   * @param isAuthenticated - 是否已认证
   * @returns 速率限制检查结果
   */
  async checkAndUpdate(
    ipAddress: string,
    userId?: string,
    isAuthenticated: boolean = false
  ): Promise<ScannerRateLimitResult> {
    const maxCount = this.getMaxRequests(isAuthenticated)
    const now = new Date()
    const windowStart = new Date(now.getTime() - this.windowMs)

    try {
      // 使用 Supabase 存储过程检查速率限制
      const { data, error } = await supabaseAdmin.rpc('check_rate_limit', {
        p_ip_address: ipAddress,
        p_user_id: userId || null,
        p_is_authenticated: isAuthenticated
      })

      if (error) {
        console.error('Rate limit check error:', error)
        // 出错时使用内存回退，允许请求
        return this.fallbackCheck(ipAddress, isAuthenticated)
      }

      if (data && data.length > 0) {
        const result = data[0]
        const resetAt = new Date(result.reset_at)
        const retryAfterSeconds = result.allowed 
          ? undefined 
          : Math.ceil((resetAt.getTime() - now.getTime()) / 1000)

        return {
          allowed: result.allowed,
          currentCount: result.current_count,
          maxCount: result.max_count,
          resetAt,
          retryAfterSeconds
        }
      }

      // 无数据返回，允许请求
      return {
        allowed: true,
        currentCount: 1,
        maxCount,
        resetAt: new Date(now.getTime() + this.windowMs)
      }
    } catch (err) {
      console.error('Rate limiter error:', err)
      return this.fallbackCheck(ipAddress, isAuthenticated)
    }
  }

  /**
   * 内存回退检查 (当数据库不可用时)
   */
  private fallbackMemory = new Map<string, { count: number; resetAt: number }>()

  private fallbackCheck(
    ipAddress: string,
    isAuthenticated: boolean
  ): ScannerRateLimitResult {
    const maxCount = this.getMaxRequests(isAuthenticated)
    const now = Date.now()
    const record = this.fallbackMemory.get(ipAddress)

    // 无记录或已过期
    if (!record || now > record.resetAt) {
      const resetAt = now + this.windowMs
      this.fallbackMemory.set(ipAddress, { count: 1, resetAt })
      return {
        allowed: true,
        currentCount: 1,
        maxCount,
        resetAt: new Date(resetAt)
      }
    }

    // 检查是否超限
    if (record.count >= maxCount) {
      const retryAfterSeconds = Math.ceil((record.resetAt - now) / 1000)
      return {
        allowed: false,
        currentCount: record.count,
        maxCount,
        resetAt: new Date(record.resetAt),
        retryAfterSeconds
      }
    }

    // 增加计数
    record.count++
    return {
      allowed: true,
      currentCount: record.count,
      maxCount,
      resetAt: new Date(record.resetAt)
    }
  }

  /**
   * 重置指定 IP 的速率限制
   */
  async reset(ipAddress: string): Promise<void> {
    try {
      await supabaseAdmin
        .from('rate_limits')
        .delete()
        .eq('ip_address', ipAddress)
      
      this.fallbackMemory.delete(ipAddress)
    } catch (err) {
      console.error('Rate limit reset error:', err)
    }
  }

  /**
   * 清理过期记录
   */
  async cleanup(): Promise<number> {
    try {
      const { data, error } = await supabaseAdmin.rpc('cleanup_expired_rate_limits')
      
      if (error) {
        console.error('Rate limit cleanup error:', error)
        return 0
      }

      // 清理内存回退
      const now = Date.now()
      for (const [key, record] of this.fallbackMemory.entries()) {
        if (now > record.resetAt) {
          this.fallbackMemory.delete(key)
        }
      }

      return data || 0
    } catch (err) {
      console.error('Rate limit cleanup error:', err)
      return 0
    }
  }
}

/**
 * 全局 Scanner 速率限制器实例
 */
export const scannerRateLimiter = new ScannerRateLimiter()

/**
 * 从请求中提取客户端 IP
 */
export function getClientIPFromRequest(request: Request): string {
  const headers = request.headers

  // Vercel / Cloudflare 代理头
  const forwarded = headers.get('x-forwarded-for')
  if (forwarded) {
    return forwarded.split(',')[0].trim()
  }

  const realIP = headers.get('x-real-ip')
  if (realIP) {
    return realIP
  }

  const cfConnectingIP = headers.get('cf-connecting-ip')
  if (cfConnectingIP) {
    return cfConnectingIP
  }

  return '127.0.0.1'
}

/**
 * 创建速率限制响应头
 */
export function createRateLimitHeaders(result: ScannerRateLimitResult): Record<string, string> {
  const headers: Record<string, string> = {
    'X-RateLimit-Limit': String(result.maxCount),
    'X-RateLimit-Remaining': String(Math.max(0, result.maxCount - result.currentCount)),
    'X-RateLimit-Reset': String(Math.floor(result.resetAt.getTime() / 1000))
  }

  if (result.retryAfterSeconds !== undefined) {
    headers['Retry-After'] = String(result.retryAfterSeconds)
  }

  return headers
}

/**
 * 创建 429 速率限制响应
 */
export function createRateLimitResponse(result: ScannerRateLimitResult): Response {
  const headers = createRateLimitHeaders(result)
  
  return new Response(
    JSON.stringify({
      error: 'Rate limit exceeded',
      message: `已达到每小时扫描限制 (${result.maxCount} 次)，请稍后重试`,
      retryAfter: result.retryAfterSeconds,
      resetAt: result.resetAt.toISOString()
    }),
    {
      status: 429,
      headers: {
        'Content-Type': 'application/json',
        ...headers
      }
    }
  )
}
