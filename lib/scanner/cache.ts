/**
 * Scanner 缓存层
 * 
 * 基于 Supabase 的扫描结果缓存实现：
 * - 检查是否存在不到 24 小时的扫描结果
 * - 返回缓存数据及缓存时长
 * - 支持强制重新扫描选项
 * 
 * Requirements: 10.3, 10.4
 */

import { supabaseAdmin } from '@/lib/supabase'
import { CACHE_CONFIG, type ScannerAgent, type SRScoreBreakdown } from '@/lib/types/scanner'

/**
 * 缓存检查结果
 */
export interface CacheCheckResult {
  /** 是否命中缓存 */
  hit: boolean
  /** 缓存的 Agent 数据 */
  agent: ScannerAgent | null
  /** 缓存时长 (分钟) */
  cacheAgeMinutes: number | null
  /** 缓存时间戳 */
  cachedAt: Date | null
}

/**
 * 数据库记录到 ScannerAgent 的转换
 */
function dbRecordToScannerAgent(record: any): ScannerAgent {
  return {
    id: record.id,
    slug: record.slug,
    name: record.name,
    description: record.description,
    githubUrl: record.github_url,
    homepageUrl: record.homepage_url,
    apiDocsUrl: record.api_docs_url,
    srScore: parseFloat(record.sr_score) || 0,
    srTier: record.sr_tier || 'C',
    srTrack: record.sr_track || 'SaaS',
    scoreGithub: parseFloat(record.score_github) || 0,
    scoreSaas: parseFloat(record.score_saas) || 0,
    scoreBreakdown: record.score_breakdown || createDefaultBreakdown(),
    isMcp: record.is_mcp || false,
    isClaimed: record.is_claimed || false,
    isVerified: record.is_verified || false,
    inputTypes: record.input_types || [],
    outputTypes: record.output_types || [],
    metaTitle: record.meta_title,
    metaDescription: record.meta_description,
    ogImage: record.og_image,
    jsonLd: record.json_ld,
    githubStars: record.github_stars || 0,
    githubForks: record.github_forks || 0,
    githubLastCommit: record.github_last_commit ? new Date(record.github_last_commit) : null,
    lastScannedAt: record.last_scanned_at ? new Date(record.last_scanned_at) : null,
    createdAt: new Date(record.created_at),
    updatedAt: new Date(record.updated_at)
  }
}

/**
 * 创建默认评分明细
 */
function createDefaultBreakdown(): SRScoreBreakdown {
  return {
    starsScore: 0,
    forksScore: 0,
    vitalityScore: 0,
    readinessScore: 0,
    protocolScore: 0,
    trustScore: 0,
    aeoScore: 0,
    interopScore: 0
  }
}

/**
 * Scanner 缓存类
 */
export class ScannerCache {
  private readonly ttlMs: number

  constructor() {
    this.ttlMs = CACHE_CONFIG.TTL_HOURS * 60 * 60 * 1000
  }

  /**
   * 检查 URL 是否有有效缓存
   * 
   * @param url - 规范化后的 URL
   * @param forceRescan - 是否强制重新扫描
   * @returns 缓存检查结果
   */
  async check(url: string, forceRescan: boolean = false): Promise<CacheCheckResult> {
    // 强制重新扫描时跳过缓存
    if (forceRescan) {
      return {
        hit: false,
        agent: null,
        cacheAgeMinutes: null,
        cachedAt: null
      }
    }

    try {
      const now = new Date()
      const cacheThreshold = new Date(now.getTime() - this.ttlMs)

      // 查询匹配 URL 且在缓存有效期内的 Agent
      const { data, error } = await supabaseAdmin
        .from('agents')
        .select('*')
        .or(`github_url.eq.${url},homepage_url.eq.${url}`)
        .gte('last_scanned_at', cacheThreshold.toISOString())
        .order('last_scanned_at', { ascending: false })
        .limit(1)
        .single()

      if (error || !data) {
        return {
          hit: false,
          agent: null,
          cacheAgeMinutes: null,
          cachedAt: null
        }
      }

      const cachedAt = new Date(data.last_scanned_at)
      const cacheAgeMinutes = Math.floor((now.getTime() - cachedAt.getTime()) / (60 * 1000))

      return {
        hit: true,
        agent: dbRecordToScannerAgent(data),
        cacheAgeMinutes,
        cachedAt
      }
    } catch (err) {
      console.error('Cache check error:', err)
      return {
        hit: false,
        agent: null,
        cacheAgeMinutes: null,
        cachedAt: null
      }
    }
  }

  /**
   * 通过 slug 检查缓存
   */
  async checkBySlug(slug: string, forceRescan: boolean = false): Promise<CacheCheckResult> {
    if (forceRescan) {
      return {
        hit: false,
        agent: null,
        cacheAgeMinutes: null,
        cachedAt: null
      }
    }

    try {
      const now = new Date()
      const cacheThreshold = new Date(now.getTime() - this.ttlMs)

      const { data, error } = await supabaseAdmin
        .from('agents')
        .select('*')
        .eq('slug', slug)
        .gte('last_scanned_at', cacheThreshold.toISOString())
        .single()

      if (error || !data) {
        return {
          hit: false,
          agent: null,
          cacheAgeMinutes: null,
          cachedAt: null
        }
      }

      const cachedAt = new Date(data.last_scanned_at)
      const cacheAgeMinutes = Math.floor((now.getTime() - cachedAt.getTime()) / (60 * 1000))

      return {
        hit: true,
        agent: dbRecordToScannerAgent(data),
        cacheAgeMinutes,
        cachedAt
      }
    } catch (err) {
      console.error('Cache check by slug error:', err)
      return {
        hit: false,
        agent: null,
        cacheAgeMinutes: null,
        cachedAt: null
      }
    }
  }

  /**
   * 检查缓存是否过期
   */
  isExpired(lastScannedAt: Date | null): boolean {
    if (!lastScannedAt) return true
    
    const now = new Date()
    const age = now.getTime() - lastScannedAt.getTime()
    return age > this.ttlMs
  }

  /**
   * 获取缓存剩余有效时间 (分钟)
   */
  getRemainingTTL(lastScannedAt: Date | null): number {
    if (!lastScannedAt) return 0
    
    const now = new Date()
    const expiresAt = lastScannedAt.getTime() + this.ttlMs
    const remaining = expiresAt - now.getTime()
    
    return Math.max(0, Math.floor(remaining / (60 * 1000)))
  }

  /**
   * 使缓存失效 (通过更新 last_scanned_at 为 null)
   */
  async invalidate(slug: string): Promise<boolean> {
    try {
      const { error } = await supabaseAdmin
        .from('agents')
        .update({ last_scanned_at: null })
        .eq('slug', slug)

      return !error
    } catch (err) {
      console.error('Cache invalidate error:', err)
      return false
    }
  }

  /**
   * 批量使缓存失效
   */
  async invalidateMany(slugs: string[]): Promise<number> {
    if (slugs.length === 0) return 0

    try {
      const { data, error } = await supabaseAdmin
        .from('agents')
        .update({ last_scanned_at: null })
        .in('slug', slugs)
        .select('id')

      if (error) {
        console.error('Batch cache invalidate error:', error)
        return 0
      }

      return data?.length || 0
    } catch (err) {
      console.error('Batch cache invalidate error:', err)
      return 0
    }
  }
}

/**
 * 全局 Scanner 缓存实例
 */
export const scannerCache = new ScannerCache()

/**
 * 内存缓存 (用于高频访问的临时缓存)
 */
class MemoryScanCache {
  private cache = new Map<string, { data: CacheCheckResult; expiresAt: number }>()
  private readonly shortTTL = 5 * 60 * 1000 // 5 分钟内存缓存

  get(key: string): CacheCheckResult | null {
    const item = this.cache.get(key)
    if (!item) return null
    
    if (Date.now() > item.expiresAt) {
      this.cache.delete(key)
      return null
    }
    
    return item.data
  }

  set(key: string, data: CacheCheckResult): void {
    this.cache.set(key, {
      data,
      expiresAt: Date.now() + this.shortTTL
    })
  }

  delete(key: string): void {
    this.cache.delete(key)
  }

  clear(): void {
    this.cache.clear()
  }

  /**
   * 清理过期条目
   */
  cleanup(): number {
    const now = Date.now()
    let count = 0
    
    for (const [key, item] of this.cache.entries()) {
      if (now > item.expiresAt) {
        this.cache.delete(key)
        count++
      }
    }
    
    return count
  }
}

/**
 * 全局内存缓存实例
 */
export const memoryScanCache = new MemoryScanCache()

/**
 * 带内存缓存的检查函数
 * 先检查内存缓存，再检查数据库缓存
 */
export async function checkCacheWithMemory(
  url: string,
  forceRescan: boolean = false
): Promise<CacheCheckResult> {
  // 强制重新扫描时跳过所有缓存
  if (forceRescan) {
    memoryScanCache.delete(url)
    return scannerCache.check(url, true)
  }

  // 检查内存缓存
  const memoryResult = memoryScanCache.get(url)
  if (memoryResult && memoryResult.hit) {
    return memoryResult
  }

  // 检查数据库缓存
  const dbResult = await scannerCache.check(url, false)
  
  // 如果命中，存入内存缓存
  if (dbResult.hit) {
    memoryScanCache.set(url, dbResult)
  }

  return dbResult
}
