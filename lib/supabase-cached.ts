/**
 * 带缓存的 Supabase 客户端
 * 为 Supabase 查询添加内存缓存层
 * 需求: 9.3
 */

import { supabaseAdmin } from './supabase'
import { getCachedData, cacheKeys, CACHE_TIMES } from './cache-utils'
import type { Agent } from './supabase'

/**
 * 获取所有 Agent（带缓存）
 * @param sortBy 排序方式
 * @param limit 限制数量
 * @returns Agent 列表
 */
export async function getCachedAgents(
  sortBy: 'ai_search_count' | 'created_at' = 'ai_search_count',
  limit: number = 100
) {
  const cacheKey = cacheKeys.agentList(sortBy)
  
  return getCachedData(
    cacheKey,
    async () => {
      const { data, error } = await supabaseAdmin
        .from('agents')
        .select('id, slug, name, short_description, platform, key_features, pros, cons, use_cases, pricing, official_url, ai_search_count, created_at')
        .order(sortBy, { ascending: false, nullsFirst: false })
        .limit(limit)
      
      if (error) throw error
      return data || []
    },
    CACHE_TIMES.ONE_HOUR
  )
}

/**
 * 获取 Agent 详情（带缓存）
 * @param slug Agent slug
 * @returns Agent 详情
 */
export async function getCachedAgentDetail(slug: string) {
  const cacheKey = cacheKeys.agentDetail(slug)
  
  return getCachedData(
    cacheKey,
    async () => {
      const { data, error } = await supabaseAdmin
        .from('agents')
        .select('*, categories(name, slug, icon)')
        .eq('slug', slug)
        .single()
      
      if (error) throw error
      return data
    },
    CACHE_TIMES.ONE_HOUR
  )
}

/**
 * 获取分类列表（带缓存）
 * @returns 分类列表
 */
export async function getCachedCategories() {
  const cacheKey = cacheKeys.categoryList()
  
  return getCachedData(
    cacheKey,
    async () => {
      const { data, error } = await supabaseAdmin
        .from('categories')
        .select('*')
        .order('name')
      
      if (error) throw error
      return data || []
    },
    CACHE_TIMES.SIX_HOURS
  )
}

/**
 * 获取 Agent 数量（带缓存）
 * @returns Agent 总数
 */
export async function getCachedAgentCount() {
  const cacheKey = 'agents:count'
  
  return getCachedData(
    cacheKey,
    async () => {
      const { count, error } = await supabaseAdmin
        .from('agents')
        .select('*', { count: 'exact', head: true })
      
      if (error) throw error
      return count || 0
    },
    CACHE_TIMES.ONE_HOUR
  )
}

/**
 * 获取 AI 访问统计（带缓存）
 * @param agentId Agent ID
 * @returns AI 访问统计
 */
export async function getCachedAIVisitStats(agentId: string) {
  const cacheKey = cacheKeys.aiVisitStats(agentId)
  
  return getCachedData(
    cacheKey,
    async () => {
      const { data: dataRaw, error } = await (supabaseAdmin as any)
        .from('ai_visits')
        .select('ai_name, visited_at')
        .eq('agent_id', agentId)
        .order('visited_at', { ascending: false })
        .limit(100)
      
      if (error) throw error
      
      const data = (dataRaw || []) as Array<{ ai_name: string; visited_at: string }>
      
      // 聚合统计
      const breakdown: Record<string, number> = {}
      data.forEach((visit) => {
        breakdown[visit.ai_name] = (breakdown[visit.ai_name] || 0) + 1
      })
      
      return {
        total: data.length,
        breakdown,
        recentVisits: data.slice(0, 10),
      }
    },
    CACHE_TIMES.FIFTEEN_MINUTES
  )
}

/**
 * 获取相似 Agent（带缓存）
 * @param categoryId 分类 ID
 * @param excludeId 排除的 Agent ID
 * @param limit 限制数量
 * @returns 相似 Agent 列表
 */
export async function getCachedSimilarAgents(
  categoryId: string,
  excludeId: string,
  limit: number = 3
) {
  const cacheKey = `agents:similar:${categoryId}:${excludeId}`
  
  return getCachedData(
    cacheKey,
    async () => {
      const { data, error } = await supabaseAdmin
        .from('agents')
        .select('id, slug, name, short_description, platform')
        .eq('category_id', categoryId)
        .neq('id', excludeId)
        .limit(limit)
      
      if (error) throw error
      return data || []
    },
    CACHE_TIMES.SIX_HOURS
  )
}

/**
 * 使缓存失效
 * @param pattern 缓存键模式（可选）
 */
export function invalidateCache(pattern?: string) {
  // 这里可以实现更复杂的缓存失效逻辑
  // 例如：根据模式匹配删除特定缓存
  console.log(`Invalidating cache${pattern ? ` for pattern: ${pattern}` : ''}`)
}
