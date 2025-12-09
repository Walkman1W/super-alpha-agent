/**
 * Agent Repository - 数据访问层
 * 封装 Agent 相关的数据库操作
 * Requirements: 9.1, 9.3, 9.5
 */

import { supabaseAdmin } from '@/lib/supabase'
import type {
  ScannerAgent,
  SRTier,
  SRTrack,
  SRScoreBreakdown,
  IOModality,
  createDefaultScoreBreakdown
} from '@/lib/types/scanner'

// ============================================
// 数据库行类型 (snake_case)
// ============================================

interface AgentRow {
  id: string
  slug: string
  name: string
  short_description: string | null
  detailed_description: string | null
  official_url: string | null
  homepage_url: string | null
  api_docs_url: string | null
  sr_score: number
  sr_tier: string
  sr_track: string
  score_github: number
  score_saas: number
  score_breakdown: SRScoreBreakdown | null
  is_mcp: boolean
  is_claimed: boolean
  is_verified: boolean
  input_types: string[] | null
  output_types: string[] | null
  meta_title: string | null
  meta_description: string | null
  og_image: string | null
  json_ld: object | null
  view_count: number
  github_forks: number
  github_last_commit: string | null
  last_scanned_at: string | null
  created_at: string
  updated_at: string
}

// ============================================
// Upsert 输入类型
// ============================================

export interface UpsertAgentInput {
  slug: string
  name: string
  description?: string
  githubUrl?: string
  homepageUrl?: string
  apiDocsUrl?: string
  srScore: number
  srTier: SRTier
  srTrack: SRTrack
  scoreGithub: number
  scoreSaas: number
  scoreBreakdown: SRScoreBreakdown
  isMcp: boolean
  isClaimed?: boolean
  isVerified?: boolean
  inputTypes: IOModality[]
  outputTypes: IOModality[]
  metaTitle?: string
  metaDescription?: string
  ogImage?: string
  jsonLd?: object
  githubStars?: number
  githubForks?: number
  githubLastCommit?: Date
}

// ============================================
// 查询过滤器类型
// ============================================

export interface AgentQueryFilter {
  isVerified?: boolean
  isMcp?: boolean
  srTier?: SRTier
  srTrack?: SRTrack
  limit?: number
  offset?: number
  orderBy?: 'sr_score' | 'created_at' | 'updated_at'
  orderDirection?: 'asc' | 'desc'
}

// ============================================
// 转换函数
// ============================================

/**
 * 将数据库行转换为 ScannerAgent 类型
 */
function rowToScannerAgent(row: AgentRow): ScannerAgent {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    description: row.short_description || row.detailed_description,
    githubUrl: row.official_url,
    homepageUrl: row.homepage_url,
    apiDocsUrl: row.api_docs_url,
    srScore: Number(row.sr_score) || 0,
    srTier: (row.sr_tier as SRTier) || 'C',
    srTrack: (row.sr_track as SRTrack) || 'SaaS',
    scoreGithub: Number(row.score_github) || 0,
    scoreSaas: Number(row.score_saas) || 0,
    scoreBreakdown: row.score_breakdown || {
      starsScore: 0,
      forksScore: 0,
      vitalityScore: 0,
      readinessScore: 0,
      protocolScore: 0,
      trustScore: 0,
      aeoScore: 0,
      interopScore: 0
    },
    isMcp: row.is_mcp || false,
    isClaimed: row.is_claimed || false,
    isVerified: row.is_verified || false,
    inputTypes: (row.input_types as IOModality[]) || ['Unknown'],
    outputTypes: (row.output_types as IOModality[]) || ['Unknown'],
    metaTitle: row.meta_title,
    metaDescription: row.meta_description,
    ogImage: row.og_image,
    jsonLd: row.json_ld,
    githubStars: row.view_count || 0,
    githubForks: row.github_forks || 0,
    githubLastCommit: row.github_last_commit ? new Date(row.github_last_commit) : null,
    lastScannedAt: row.last_scanned_at ? new Date(row.last_scanned_at) : null,
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at)
  }
}

// ============================================
// Repository 函数
// ============================================

/**
 * 创建或更新 Agent 记录
 * Requirements: 9.1
 */
export async function upsertAgent(input: UpsertAgentInput): Promise<ScannerAgent> {
  const now = new Date().toISOString()
  
  const upsertData = {
    slug: input.slug,
    name: input.name,
    short_description: input.description || '',
    official_url: input.githubUrl || null,
    homepage_url: input.homepageUrl || null,
    api_docs_url: input.apiDocsUrl || null,
    sr_score: input.srScore,
    sr_tier: input.srTier,
    sr_track: input.srTrack,
    score_github: input.scoreGithub,
    score_saas: input.scoreSaas,
    score_breakdown: input.scoreBreakdown,
    is_mcp: input.isMcp,
    is_claimed: input.isClaimed ?? false,
    is_verified: input.isVerified ?? false,
    input_types: input.inputTypes,
    output_types: input.outputTypes,
    meta_title: input.metaTitle || null,
    meta_description: input.metaDescription || null,
    og_image: input.ogImage || null,
    json_ld: input.jsonLd || null,
    view_count: input.githubStars || 0,
    github_forks: input.githubForks || 0,
    github_last_commit: input.githubLastCommit?.toISOString() || null,
    last_scanned_at: now,
    updated_at: now
  }

  const { data, error } = await supabaseAdmin
    .from('agents')
    .upsert(upsertData, { onConflict: 'slug' })
    .select()
    .single()

  if (error) {
    throw new Error(`Failed to upsert agent: ${error.message}`)
  }

  return rowToScannerAgent(data as AgentRow)
}

/**
 * 根据 slug 获取单个 Agent
 * Requirements: 9.3
 */
export async function getAgentBySlug(slug: string): Promise<ScannerAgent | null> {
  const { data, error } = await supabaseAdmin
    .from('agents')
    .select('*')
    .eq('slug', slug)
    .single()

  if (error) {
    if (error.code === 'PGRST116') {
      // No rows returned
      return null
    }
    throw new Error(`Failed to get agent: ${error.message}`)
  }

  return rowToScannerAgent(data as AgentRow)
}

/**
 * 根据 URL 获取 Agent (支持 GitHub URL 或 Homepage URL)
 */
export async function getAgentByUrl(url: string): Promise<ScannerAgent | null> {
  // 尝试通过 official_url (GitHub URL) 查找
  let { data, error } = await supabaseAdmin
    .from('agents')
    .select('*')
    .eq('official_url', url)
    .single()

  if (!data && !error) {
    // 尝试通过 homepage_url 查找
    const result = await supabaseAdmin
      .from('agents')
      .select('*')
      .eq('homepage_url', url)
      .single()
    
    data = result.data
    error = result.error
  }

  if (error) {
    if (error.code === 'PGRST116') {
      return null
    }
    throw new Error(`Failed to get agent by URL: ${error.message}`)
  }

  return data ? rowToScannerAgent(data as AgentRow) : null
}

/**
 * 获取 Agent 列表，支持过滤和排序
 * Requirements: 9.5
 */
export async function getAgents(filter?: AgentQueryFilter): Promise<ScannerAgent[]> {
  let query = supabaseAdmin.from('agents').select('*')

  // 应用过滤条件
  if (filter?.isVerified !== undefined) {
    query = query.eq('is_verified', filter.isVerified)
  }
  
  if (filter?.isMcp !== undefined) {
    query = query.eq('is_mcp', filter.isMcp)
  }
  
  if (filter?.srTier) {
    query = query.eq('sr_tier', filter.srTier)
  }
  
  if (filter?.srTrack) {
    query = query.eq('sr_track', filter.srTrack)
  }

  // 应用排序
  const orderBy = filter?.orderBy || 'sr_score'
  const orderDirection = filter?.orderDirection || 'desc'
  query = query.order(orderBy, { ascending: orderDirection === 'asc' })

  // 应用分页
  if (filter?.limit) {
    query = query.limit(filter.limit)
  }
  
  if (filter?.offset) {
    query = query.range(filter.offset, filter.offset + (filter.limit || 10) - 1)
  }

  const { data, error } = await query

  if (error) {
    throw new Error(`Failed to get agents: ${error.message}`)
  }

  return (data as AgentRow[]).map(rowToScannerAgent)
}

/**
 * 更新 Agent 的认领状态
 * Requirements: 9.3
 */
export async function updateClaimStatus(
  slug: string,
  isClaimed: boolean,
  isVerified?: boolean
): Promise<ScannerAgent | null> {
  const updateData: Record<string, unknown> = {
    is_claimed: isClaimed,
    updated_at: new Date().toISOString()
  }
  
  if (isVerified !== undefined) {
    updateData.is_verified = isVerified
  }

  const { data, error } = await supabaseAdmin
    .from('agents')
    .update(updateData)
    .eq('slug', slug)
    .select()
    .single()

  if (error) {
    if (error.code === 'PGRST116') {
      return null
    }
    throw new Error(`Failed to update claim status: ${error.message}`)
  }

  return rowToScannerAgent(data as AgentRow)
}

/**
 * 更新 Agent 的 JSON-LD 数据
 */
export async function updateJsonLd(
  slug: string,
  jsonLd: object
): Promise<ScannerAgent | null> {
  const { data, error } = await supabaseAdmin
    .from('agents')
    .update({
      json_ld: jsonLd,
      updated_at: new Date().toISOString()
    })
    .eq('slug', slug)
    .select()
    .single()

  if (error) {
    if (error.code === 'PGRST116') {
      return null
    }
    throw new Error(`Failed to update JSON-LD: ${error.message}`)
  }

  return rowToScannerAgent(data as AgentRow)
}

/**
 * 获取 Agent 总数
 */
export async function getAgentCount(filter?: Pick<AgentQueryFilter, 'isVerified' | 'isMcp' | 'srTier' | 'srTrack'>): Promise<number> {
  let query = supabaseAdmin.from('agents').select('id', { count: 'exact', head: true })

  if (filter?.isVerified !== undefined) {
    query = query.eq('is_verified', filter.isVerified)
  }
  
  if (filter?.isMcp !== undefined) {
    query = query.eq('is_mcp', filter.isMcp)
  }
  
  if (filter?.srTier) {
    query = query.eq('sr_tier', filter.srTier)
  }
  
  if (filter?.srTrack) {
    query = query.eq('sr_track', filter.srTrack)
  }

  const { count, error } = await query

  if (error) {
    throw new Error(`Failed to get agent count: ${error.message}`)
  }

  return count || 0
}

/**
 * 检查 Agent 是否存在
 */
export async function agentExists(slug: string): Promise<boolean> {
  const { count, error } = await supabaseAdmin
    .from('agents')
    .select('id', { count: 'exact', head: true })
    .eq('slug', slug)

  if (error) {
    throw new Error(`Failed to check agent existence: ${error.message}`)
  }

  return (count || 0) > 0
}

/**
 * 删除 Agent (仅用于测试)
 */
export async function deleteAgent(slug: string): Promise<boolean> {
  const { error } = await supabaseAdmin
    .from('agents')
    .delete()
    .eq('slug', slug)

  if (error) {
    throw new Error(`Failed to delete agent: ${error.message}`)
  }

  return true
}
