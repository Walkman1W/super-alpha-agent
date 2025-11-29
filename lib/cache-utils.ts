/**
 * 缓存工具
 * 提供数据缓存、缓存头生成和缓存策略管理
 * 需求: 9.3, 9.4
 */

/**
 * 缓存时间常量（秒）
 */
export const CACHE_TIMES = {
  /** 1 分钟 */
  ONE_MINUTE: 60,
  /** 5 分钟 */
  FIVE_MINUTES: 60 * 5,
  /** 15 分钟 */
  FIFTEEN_MINUTES: 60 * 15,
  /** 30 分钟 */
  THIRTY_MINUTES: 60 * 30,
  /** 1 小时 */
  ONE_HOUR: 60 * 60,
  /** 6 小时 */
  SIX_HOURS: 60 * 60 * 6,
  /** 12 小时 */
  TWELVE_HOURS: 60 * 60 * 12,
  /** 1 天 */
  ONE_DAY: 60 * 60 * 24,
  /** 1 周 */
  ONE_WEEK: 60 * 60 * 24 * 7,
  /** 1 个月 */
  ONE_MONTH: 60 * 60 * 24 * 30,
} as const

/**
 * ISR 重新验证时间配置
 * 用于 Next.js 页面的 revalidate 导出
 */
export const ISR_REVALIDATE = {
  /** 主页 - 1 小时 */
  homepage: CACHE_TIMES.ONE_HOUR,
  /** Agent 列表 - 1 小时 */
  agentList: CACHE_TIMES.ONE_HOUR,
  /** Agent 详情 - 1 小时 */
  agentDetail: CACHE_TIMES.ONE_HOUR,
  /** 分类页 - 6 小时 */
  category: CACHE_TIMES.SIX_HOURS,
  /** 静态内容 - 1 天 */
  static: CACHE_TIMES.ONE_DAY,
} as const

/**
 * 生成 Cache-Control 头
 * @param maxAge 最大缓存时间（秒）
 * @param sMaxAge CDN 缓存时间（秒），默认与 maxAge 相同
 * @param staleWhileRevalidate 过期后仍可使用的时间（秒）
 * @returns Cache-Control 头字符串
 */
export function generateCacheControl(
  maxAge: number,
  sMaxAge?: number,
  staleWhileRevalidate?: number
): string {
  const parts: string[] = []
  
  // 公共缓存
  parts.push('public')
  
  // 浏览器缓存时间
  parts.push(`max-age=${maxAge}`)
  
  // CDN 缓存时间
  if (sMaxAge !== undefined) {
    parts.push(`s-maxage=${sMaxAge}`)
  }
  
  // 过期后仍可使用的时间（stale-while-revalidate）
  if (staleWhileRevalidate !== undefined) {
    parts.push(`stale-while-revalidate=${staleWhileRevalidate}`)
  }
  
  return parts.join(', ')
}

/**
 * 预设的缓存策略
 */
export const CACHE_STRATEGIES = {
  /** 短期缓存 - 5 分钟 */
  short: generateCacheControl(
    CACHE_TIMES.FIVE_MINUTES,
    CACHE_TIMES.FIVE_MINUTES,
    CACHE_TIMES.THIRTY_MINUTES
  ),
  /** 中期缓存 - 1 小时 */
  medium: generateCacheControl(
    CACHE_TIMES.ONE_HOUR,
    CACHE_TIMES.ONE_HOUR,
    CACHE_TIMES.SIX_HOURS
  ),
  /** 长期缓存 - 1 天 */
  long: generateCacheControl(
    CACHE_TIMES.ONE_DAY,
    CACHE_TIMES.ONE_DAY,
    CACHE_TIMES.ONE_WEEK
  ),
  /** 静态资源 - 1 个月 */
  static: generateCacheControl(
    CACHE_TIMES.ONE_MONTH,
    CACHE_TIMES.ONE_MONTH,
    CACHE_TIMES.ONE_WEEK
  ),
  /** 不缓存 */
  noCache: 'no-cache, no-store, must-revalidate',
} as const

/**
 * 为 API 响应添加缓存头
 * @param headers Headers 对象
 * @param strategy 缓存策略
 * @returns 更新后的 Headers 对象
 */
export function addCacheHeaders(
  headers: Headers,
  strategy: keyof typeof CACHE_STRATEGIES | string
): Headers {
  const cacheControl = typeof strategy === 'string' && strategy in CACHE_STRATEGIES
    ? CACHE_STRATEGIES[strategy as keyof typeof CACHE_STRATEGIES]
    : strategy
  
  headers.set('Cache-Control', cacheControl)
  return headers
}

/**
 * 创建带缓存头的 Response
 * @param data 响应数据
 * @param options 选项
 * @returns Response 对象
 */
export function createCachedResponse(
  data: any,
  options: {
    status?: number
    strategy?: keyof typeof CACHE_STRATEGIES | string
    headers?: Record<string, string>
  } = {}
): Response {
  const {
    status = 200,
    strategy = 'medium',
    headers: customHeaders = {},
  } = options
  
  const headers = new Headers(customHeaders)
  headers.set('Content-Type', 'application/json')
  
  addCacheHeaders(headers, strategy)
  
  return new Response(JSON.stringify(data), {
    status,
    headers,
  })
}

/**
 * Supabase 查询缓存配置
 * 用于客户端查询的缓存选项
 */
export interface SupabaseCacheOptions {
  /** 缓存键 */
  key: string
  /** 缓存时间（毫秒） */
  ttl: number
  /** 是否启用缓存 */
  enabled?: boolean
}

/**
 * 内存缓存实现（简单版本）
 * 用于服务端数据缓存
 */
class MemoryCache {
  private cache: Map<string, { data: any; expires: number }> = new Map()
  
  /**
   * 获取缓存数据
   * @param key 缓存键
   * @returns 缓存的数据，如果不存在或已过期则返回 null
   */
  get<T>(key: string): T | null {
    const item = this.cache.get(key)
    
    if (!item) return null
    
    // 检查是否过期
    if (Date.now() > item.expires) {
      this.cache.delete(key)
      return null
    }
    
    return item.data as T
  }
  
  /**
   * 设置缓存数据
   * @param key 缓存键
   * @param data 要缓存的数据
   * @param ttl 缓存时间（秒）
   */
  set<T>(key: string, data: T, ttl: number): void {
    const expires = Date.now() + ttl * 1000
    this.cache.set(key, { data, expires })
  }
  
  /**
   * 删除缓存数据
   * @param key 缓存键
   */
  delete(key: string): void {
    this.cache.delete(key)
  }
  
  /**
   * 清空所有缓存
   */
  clear(): void {
    this.cache.clear()
  }
  
  /**
   * 获取缓存大小
   */
  size(): number {
    return this.cache.size
  }
}

/**
 * 全局内存缓存实例
 */
export const memoryCache = new MemoryCache()

/**
 * 带缓存的数据获取函数
 * @param key 缓存键
 * @param fetcher 数据获取函数
 * @param ttl 缓存时间（秒）
 * @returns 数据
 */
export async function getCachedData<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttl: number = CACHE_TIMES.ONE_HOUR
): Promise<T> {
  // 尝试从缓存获取
  const cached = memoryCache.get<T>(key)
  if (cached !== null) {
    return cached
  }
  
  // 获取新数据
  const data = await fetcher()
  
  // 存入缓存
  memoryCache.set(key, data, ttl)
  
  return data
}

/**
 * 缓存键生成器
 */
export const cacheKeys = {
  /** Agent 列表 */
  agentList: (sortBy?: string, category?: string) =>
    `agents:list:${sortBy || 'default'}:${category || 'all'}`,
  
  /** Agent 详情 */
  agentDetail: (slug: string) => `agents:detail:${slug}`,
  
  /** Agent 统计 */
  agentStats: (agentId: string) => `agents:stats:${agentId}`,
  
  /** 分类列表 */
  categoryList: () => 'categories:list',
  
  /** 分类详情 */
  categoryDetail: (slug: string) => `categories:detail:${slug}`,
  
  /** AI 访问统计 */
  aiVisitStats: (agentId: string) => `ai-visits:stats:${agentId}`,
} as const

/**
 * 缓存预热函数
 * 在应用启动时预加载常用数据
 */
export async function warmupCache() {
  // 这里可以添加预热逻辑
  // 例如：预加载热门 Agent、分类列表等
  console.log('Cache warmup started...')
  
  // 实现预热逻辑...
  
  console.log('Cache warmup completed')
}
