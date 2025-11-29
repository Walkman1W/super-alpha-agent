/**
 * Rate Limiting Utilities
 * 
 * Provides rate limiting functionality for API endpoints:
 * - In-memory rate limiting (development/fallback)
 * - Redis-based rate limiting (production with Upstash)
 * - Configurable limits and windows
 * - IP-based and identifier-based limiting
 */

// ============================================================================
// Types and Interfaces
// ============================================================================

/**
 * Rate limit configuration
 */
export interface RateLimitConfig {
  /**
   * Time window in milliseconds
   */
  windowMs: number
  
  /**
   * Maximum number of requests allowed in the window
   */
  maxRequests: number
  
  /**
   * Optional message to return when rate limit is exceeded
   */
  message?: string
}

/**
 * Rate limit result
 */
export interface RateLimitResult {
  /**
   * Whether the request is allowed
   */
  allowed: boolean
  
  /**
   * Number of requests remaining in the current window
   */
  remaining: number
  
  /**
   * Time in seconds until the rate limit resets
   */
  retryAfter?: number
  
  /**
   * Total limit for the window
   */
  limit: number
  
  /**
   * Timestamp when the window resets
   */
  resetTime: number
}

// ============================================================================
// In-Memory Rate Limiter (Development/Fallback)
// ============================================================================

interface RateLimitRecord {
  count: number
  resetTime: number
}

/**
 * In-memory rate limiter using Map
 * Suitable for development or single-instance deployments
 */
export class InMemoryRateLimiter {
  private store: Map<string, RateLimitRecord>
  private config: RateLimitConfig
  private cleanupInterval: NodeJS.Timeout | null = null
  
  constructor(config: RateLimitConfig) {
    this.store = new Map()
    this.config = config
    
    // Clean up expired entries every minute
    this.cleanupInterval = setInterval(() => {
      this.cleanup()
    }, 60000)
  }
  
  /**
   * Check if a request is allowed
   * 
   * @param identifier - Unique identifier (e.g., IP address, user ID)
   * @returns Rate limit result
   */
  check(identifier: string): RateLimitResult {
    const now = Date.now()
    const record = this.store.get(identifier)
    
    // No record or expired record - allow and create new
    if (!record || now > record.resetTime) {
      const resetTime = now + this.config.windowMs
      this.store.set(identifier, { count: 1, resetTime })
      
      return {
        allowed: true,
        remaining: this.config.maxRequests - 1,
        limit: this.config.maxRequests,
        resetTime
      }
    }
    
    // Record exists and not expired
    if (record.count >= this.config.maxRequests) {
      // Rate limit exceeded
      const retryAfter = Math.ceil((record.resetTime - now) / 1000)
      
      return {
        allowed: false,
        remaining: 0,
        retryAfter,
        limit: this.config.maxRequests,
        resetTime: record.resetTime
      }
    }
    
    // Increment count and allow
    record.count++
    
    return {
      allowed: true,
      remaining: this.config.maxRequests - record.count,
      limit: this.config.maxRequests,
      resetTime: record.resetTime
    }
  }
  
  /**
   * Reset rate limit for an identifier
   * 
   * @param identifier - Unique identifier
   */
  reset(identifier: string): void {
    this.store.delete(identifier)
  }
  
  /**
   * Clean up expired entries
   */
  private cleanup(): void {
    const now = Date.now()
    
    for (const [key, record] of this.store.entries()) {
      if (now > record.resetTime) {
        this.store.delete(key)
      }
    }
  }
  
  /**
   * Destroy the rate limiter and clean up resources
   */
  destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval)
      this.cleanupInterval = null
    }
    this.store.clear()
  }
}

// ============================================================================
// Redis Rate Limiter (Production with Upstash)
// ============================================================================

/**
 * Redis-based rate limiter using Upstash
 * Suitable for production and multi-instance deployments
 * 
 * Note: Requires @upstash/redis package and environment variables:
 * - UPSTASH_REDIS_REST_URL
 * - UPSTASH_REDIS_REST_TOKEN
 */
export class RedisRateLimiter {
  private config: RateLimitConfig
  private redis: any // Type will be Redis from @upstash/redis
  
  constructor(config: RateLimitConfig) {
    this.config = config
    
    // Lazy load Redis to avoid errors if not configured
    try {
      const { Redis } = require('@upstash/redis')
      
      this.redis = new Redis({
        url: process.env.UPSTASH_REDIS_REST_URL,
        token: process.env.UPSTASH_REDIS_REST_TOKEN,
      })
    } catch (error) {
      console.warn('Upstash Redis not configured, falling back to in-memory rate limiting')
      this.redis = null
    }
  }
  
  /**
   * Check if a request is allowed
   * 
   * @param identifier - Unique identifier (e.g., IP address, user ID)
   * @returns Rate limit result
   */
  async check(identifier: string): Promise<RateLimitResult> {
    if (!this.redis) {
      throw new Error('Redis not configured')
    }
    
    const key = `ratelimit:${identifier}`
    const now = Date.now()
    const windowStart = now - this.config.windowMs
    
    try {
      // Use Redis sorted set to track requests in the time window
      // Score is the timestamp, value is a unique ID
      
      // Remove old entries outside the window
      await this.redis.zremrangebyscore(key, 0, windowStart)
      
      // Count current requests in the window
      const count = await this.redis.zcard(key)
      
      if (count >= this.config.maxRequests) {
        // Rate limit exceeded
        // Get the oldest request to calculate retry time
        const oldest = await this.redis.zrange(key, 0, 0, { withScores: true })
        const oldestTime = oldest.length > 0 ? oldest[1] : now
        const resetTime = oldestTime + this.config.windowMs
        const retryAfter = Math.ceil((resetTime - now) / 1000)
        
        return {
          allowed: false,
          remaining: 0,
          retryAfter,
          limit: this.config.maxRequests,
          resetTime
        }
      }
      
      // Add current request
      const requestId = `${now}:${Math.random()}`
      await this.redis.zadd(key, { score: now, member: requestId })
      
      // Set expiration on the key
      await this.redis.expire(key, Math.ceil(this.config.windowMs / 1000))
      
      const resetTime = now + this.config.windowMs
      
      return {
        allowed: true,
        remaining: this.config.maxRequests - count - 1,
        limit: this.config.maxRequests,
        resetTime
      }
    } catch (error) {
      console.error('Redis rate limiter error:', error)
      // On error, allow the request (fail open)
      return {
        allowed: true,
        remaining: this.config.maxRequests,
        limit: this.config.maxRequests,
        resetTime: now + this.config.windowMs
      }
    }
  }
  
  /**
   * Reset rate limit for an identifier
   * 
   * @param identifier - Unique identifier
   */
  async reset(identifier: string): Promise<void> {
    if (!this.redis) return
    
    const key = `ratelimit:${identifier}`
    await this.redis.del(key)
  }
}

// ============================================================================
// Rate Limiter Factory
// ============================================================================

/**
 * Create a rate limiter instance
 * - Uses Redis if configured (production)
 * - Falls back to in-memory (development)
 * 
 * @param config - Rate limit configuration
 * @returns Rate limiter instance
 */
export function createRateLimiter(config: RateLimitConfig): InMemoryRateLimiter | RedisRateLimiter {
  // Check if Redis is configured
  const hasRedis = process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
  
  if (hasRedis && process.env.NODE_ENV === 'production') {
    try {
      return new RedisRateLimiter(config)
    } catch (error) {
      console.warn('Failed to create Redis rate limiter, using in-memory:', error)
      return new InMemoryRateLimiter(config)
    }
  }
  
  return new InMemoryRateLimiter(config)
}

// ============================================================================
// Predefined Rate Limit Configurations
// ============================================================================

/**
 * Strict rate limit for sensitive operations (e.g., authentication)
 * 5 requests per minute
 */
export const STRICT_RATE_LIMIT: RateLimitConfig = {
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 5,
  message: '请求过于频繁，请稍后重试'
}

/**
 * Standard rate limit for API endpoints
 * 20 requests per minute
 */
export const STANDARD_RATE_LIMIT: RateLimitConfig = {
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 20,
  message: '请求过于频繁，请稍后重试'
}

/**
 * Relaxed rate limit for read operations
 * 100 requests per minute
 */
export const RELAXED_RATE_LIMIT: RateLimitConfig = {
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 100,
  message: '请求过于频繁，请稍后重试'
}

/**
 * Hourly rate limit for resource-intensive operations
 * 10 requests per hour
 */
export const HOURLY_RATE_LIMIT: RateLimitConfig = {
  windowMs: 60 * 60 * 1000, // 1 hour
  maxRequests: 10,
  message: '已达到每小时请求限制，请稍后重试'
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Extract client IP from Next.js request
 * 
 * @param request - Next.js request object
 * @returns Client IP address
 */
export function getClientIP(request: Request): string {
  // Try to get IP from headers (when behind proxy)
  const headers = request.headers
  
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
  
  // Fallback
  return '127.0.0.1'
}

/**
 * Create rate limit headers for response
 * 
 * @param result - Rate limit result
 * @returns Headers object
 */
export function createRateLimitHeaders(result: RateLimitResult): Record<string, string> {
  const headers: Record<string, string> = {
    'X-RateLimit-Limit': String(result.limit),
    'X-RateLimit-Remaining': String(result.remaining),
    'X-RateLimit-Reset': String(Math.floor(result.resetTime / 1000))
  }
  
  if (result.retryAfter !== undefined) {
    headers['Retry-After'] = String(result.retryAfter)
  }
  
  return headers
}

// ============================================================================
// Global Rate Limiter Instances
// ============================================================================

/**
 * Global rate limiter for agent submission
 */
export const agentSubmissionLimiter = createRateLimiter(STRICT_RATE_LIMIT)

/**
 * Global rate limiter for API endpoints
 */
export const apiLimiter = createRateLimiter(STANDARD_RATE_LIMIT)

/**
 * Global rate limiter for read operations
 */
export const readLimiter = createRateLimiter(RELAXED_RATE_LIMIT)
