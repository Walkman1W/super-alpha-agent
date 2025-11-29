/**
 * 优化的数据获取层
 * 实施激进的缓存策略和并行获取
 */

import { supabaseAdmin } from './supabase'

// 内存缓存
const memoryCache = new Map<string, { data: any; timestamp: number }>()

// 缓存时间配置（毫秒）
const CACHE_DURATION = {
  AGENTS: 5 * 60 * 1000, // 5 分钟
  CATEGORIES: 30 * 60 * 1000, // 30 分钟
  COUNT: 10 * 60 * 1000, // 10 分钟
}

/**
 * 从缓存获取数据，如果缓存过期则重新获取
 */
async function getCached<T>(
  key: string,
  fetcher: () => Promise<T>,
  duration: number
): Promise<T> {
  const cached = memoryCache.get(key)
  const now = Date.now()
  
  // 如果缓存存在且未过期，直接返回
  if (cached && now - cached.timestamp < duration) {
    return cached.data as T
  }
  
  // 否则重新获取
  const data = await fetcher()
  memoryCache.set(key, { data, timestamp: now })
  
  return data
}

/**
 * 获取首页 Agent 列表（优化版）
 * 只获取首屏必需的字段，减少数据传输
 */
export async function getHomePageAgents() {
  return getCached(
    'homepage:agents',
    async () => {
      const { data, error } = await supabaseAdmin
        .from('agents')
        .select('id, slug, name, short_description, platform, pricing, ai_search_count')
        .order('ai_search_count', { ascending: false, nullsFirst: false })
        .limit(12) // 首屏只需要 12 个
      
      if (error) {
        console.error('Error fetching agents:', error)
        return []
      }
      
      return data || []
    },
    CACHE_DURATION.AGENTS
  )
}

/**
 * 获取 Agent 总数（优化版）
 * 使用 count 查询，不获取数据
 */
export async function getAgentCount() {
  return getCached(
    'agents:count',
    async () => {
      const { count, error } = await supabaseAdmin
        .from('agents')
        .select('*', { count: 'exact', head: true })
      
      if (error) {
        console.error('Error counting agents:', error)
        return 0
      }
      
      return count || 0
    },
    CACHE_DURATION.COUNT
  )
}

/**
 * 获取分类列表（优化版）
 * 只获取必需字段
 */
export async function getCategories() {
  return getCached(
    'categories:list',
    async () => {
      const { data, error } = await supabaseAdmin
        .from('categories')
        .select('id, name, icon, description')
        .order('name')
        .limit(6) // 首页只显示 6 个分类
      
      if (error) {
        console.error('Error fetching categories:', error)
        return []
      }
      
      return data || []
    },
    CACHE_DURATION.CATEGORIES
  )
}

/**
 * 并行获取首页所有数据
 * 使用 Promise.allSettled 确保单个失败不影响整体
 */
export async function getHomePageData() {
  const [agentsResult, countResult, categoriesResult] = await Promise.allSettled([
    getHomePageAgents(),
    getAgentCount(),
    getCategories(),
  ])
  
  return {
    agents: agentsResult.status === 'fulfilled' ? agentsResult.value : [],
    agentCount: countResult.status === 'fulfilled' ? countResult.value : 0,
    categories: categoriesResult.status === 'fulfilled' ? categoriesResult.value : [],
  }
}

/**
 * 清除缓存
 */
export function clearCache(pattern?: string) {
  if (pattern) {
    // 清除匹配模式的缓存
    for (const key of memoryCache.keys()) {
      if (key.includes(pattern)) {
        memoryCache.delete(key)
      }
    }
  } else {
    // 清除所有缓存
    memoryCache.clear()
  }
}

/**
 * 预热缓存 - 在后台预先加载数据
 */
export async function warmupCache() {
  try {
    await Promise.all([
      getHomePageAgents(),
      getAgentCount(),
      getCategories(),
    ])
    console.log('[Cache] Warmup completed')
  } catch (error) {
    console.error('[Cache] Warmup failed:', error)
  }
}
