/**
 * Scan History Repository - 扫描历史数据访问层
 * 封装扫描历史相关的数据库操作
 * Requirements: 9.4
 */

import { supabaseAdmin } from '@/lib/supabase'
import type {
  ScanHistoryRecord,
  SRTier,
  SRTrack,
  SRScoreBreakdown,
  ScanType
} from '@/lib/types/scanner'

// ============================================
// 数据库行类型 (snake_case)
// ============================================

interface ScanHistoryRow {
  id: string
  agent_id: string
  sr_score: number
  sr_tier: string
  sr_track: string
  score_github: number
  score_saas: number
  score_breakdown: SRScoreBreakdown | null
  scan_type: string
  scanned_at: string
}

// ============================================
// 创建扫描历史输入类型
// ============================================

export interface CreateScanHistoryInput {
  agentId: string
  srScore: number
  srTier: SRTier
  srTrack: SRTrack
  scoreGithub: number
  scoreSaas: number
  scoreBreakdown: SRScoreBreakdown
  scanType?: ScanType
}

// ============================================
// 查询过滤器类型
// ============================================

export interface ScanHistoryQueryFilter {
  agentId?: string
  startDate?: Date
  endDate?: Date
  scanType?: ScanType
  limit?: number
  offset?: number
}

// ============================================
// 趋势数据类型
// ============================================

export interface ScoreTrendPoint {
  date: Date
  srScore: number
  srTier: SRTier
  scoreGithub: number
  scoreSaas: number
}

// ============================================
// 转换函数
// ============================================

/**
 * 将数据库行转换为 ScanHistoryRecord 类型
 */
function rowToScanHistoryRecord(row: ScanHistoryRow): ScanHistoryRecord {
  return {
    id: row.id,
    agentId: row.agent_id,
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
    scanType: (row.scan_type as ScanType) || 'manual',
    scannedAt: new Date(row.scanned_at)
  }
}

// ============================================
// Repository 函数
// ============================================

/**
 * 创建扫描历史记录
 * Requirements: 9.4
 */
export async function createScanHistory(input: CreateScanHistoryInput): Promise<ScanHistoryRecord> {
  const insertData = {
    agent_id: input.agentId,
    sr_score: input.srScore,
    sr_tier: input.srTier,
    sr_track: input.srTrack,
    score_github: input.scoreGithub,
    score_saas: input.scoreSaas,
    score_breakdown: input.scoreBreakdown,
    scan_type: input.scanType || 'manual',
    scanned_at: new Date().toISOString()
  }

  const { data, error } = await supabaseAdmin
    .from('scan_history')
    .insert(insertData)
    .select()
    .single()

  if (error) {
    throw new Error(`Failed to create scan history: ${error.message}`)
  }

  return rowToScanHistoryRecord(data as ScanHistoryRow)
}

/**
 * 获取 Agent 的分数历史 (用于趋势展示)
 * Requirements: 9.4
 */
export async function getScoreHistory(
  agentId: string,
  limit: number = 30
): Promise<ScoreTrendPoint[]> {
  const { data, error } = await supabaseAdmin
    .from('scan_history')
    .select('sr_score, sr_tier, score_github, score_saas, scanned_at')
    .eq('agent_id', agentId)
    .order('scanned_at', { ascending: false })
    .limit(limit)

  if (error) {
    throw new Error(`Failed to get score history: ${error.message}`)
  }

  // 按时间正序返回 (最早的在前)
  return (data as Pick<ScanHistoryRow, 'sr_score' | 'sr_tier' | 'score_github' | 'score_saas' | 'scanned_at'>[])
    .reverse()
    .map(row => ({
      date: new Date(row.scanned_at),
      srScore: Number(row.sr_score) || 0,
      srTier: (row.sr_tier as SRTier) || 'C',
      scoreGithub: Number(row.score_github) || 0,
      scoreSaas: Number(row.score_saas) || 0
    }))
}

/**
 * 获取扫描历史记录列表
 */
export async function getScanHistory(filter?: ScanHistoryQueryFilter): Promise<ScanHistoryRecord[]> {
  let query = supabaseAdmin.from('scan_history').select('*')

  // 应用过滤条件
  if (filter?.agentId) {
    query = query.eq('agent_id', filter.agentId)
  }
  
  if (filter?.scanType) {
    query = query.eq('scan_type', filter.scanType)
  }
  
  if (filter?.startDate) {
    query = query.gte('scanned_at', filter.startDate.toISOString())
  }
  
  if (filter?.endDate) {
    query = query.lte('scanned_at', filter.endDate.toISOString())
  }

  // 按时间降序排列
  query = query.order('scanned_at', { ascending: false })

  // 应用分页
  if (filter?.limit) {
    query = query.limit(filter.limit)
  }
  
  if (filter?.offset) {
    query = query.range(filter.offset, filter.offset + (filter.limit || 10) - 1)
  }

  const { data, error } = await query

  if (error) {
    throw new Error(`Failed to get scan history: ${error.message}`)
  }

  return (data as ScanHistoryRow[]).map(rowToScanHistoryRecord)
}

/**
 * 获取 Agent 的最新扫描记录
 */
export async function getLatestScan(agentId: string): Promise<ScanHistoryRecord | null> {
  const { data, error } = await supabaseAdmin
    .from('scan_history')
    .select('*')
    .eq('agent_id', agentId)
    .order('scanned_at', { ascending: false })
    .limit(1)
    .single()

  if (error) {
    if (error.code === 'PGRST116') {
      return null
    }
    throw new Error(`Failed to get latest scan: ${error.message}`)
  }

  return rowToScanHistoryRecord(data as ScanHistoryRow)
}

/**
 * 获取 Agent 的扫描次数
 */
export async function getScanCount(agentId: string): Promise<number> {
  const { count, error } = await supabaseAdmin
    .from('scan_history')
    .select('id', { count: 'exact', head: true })
    .eq('agent_id', agentId)

  if (error) {
    throw new Error(`Failed to get scan count: ${error.message}`)
  }

  return count || 0
}

/**
 * 计算 Agent 的分数变化
 */
export async function getScoreChange(agentId: string): Promise<{
  currentScore: number
  previousScore: number
  change: number
  changePercent: number
} | null> {
  const { data, error } = await supabaseAdmin
    .from('scan_history')
    .select('sr_score, scanned_at')
    .eq('agent_id', agentId)
    .order('scanned_at', { ascending: false })
    .limit(2)

  if (error) {
    throw new Error(`Failed to get score change: ${error.message}`)
  }

  if (!data || data.length === 0) {
    return null
  }

  const currentScore = Number(data[0].sr_score) || 0
  const previousScore = data.length > 1 ? Number(data[1].sr_score) || 0 : currentScore
  const change = currentScore - previousScore
  const changePercent = previousScore > 0 ? (change / previousScore) * 100 : 0

  return {
    currentScore,
    previousScore,
    change: Math.round(change * 10) / 10,
    changePercent: Math.round(changePercent * 10) / 10
  }
}

/**
 * 删除旧的扫描历史 (保留最近 N 条)
 */
export async function pruneOldHistory(agentId: string, keepCount: number = 100): Promise<number> {
  // 获取要保留的最后一条记录的时间
  const { data: keepData, error: keepError } = await supabaseAdmin
    .from('scan_history')
    .select('scanned_at')
    .eq('agent_id', agentId)
    .order('scanned_at', { ascending: false })
    .range(keepCount - 1, keepCount - 1)
    .single()

  if (keepError && keepError.code !== 'PGRST116') {
    throw new Error(`Failed to get cutoff date: ${keepError.message}`)
  }

  if (!keepData) {
    // 记录数不足 keepCount，无需删除
    return 0
  }

  // 删除比截止时间更早的记录
  const { error: deleteError, count } = await supabaseAdmin
    .from('scan_history')
    .delete({ count: 'exact' })
    .eq('agent_id', agentId)
    .lt('scanned_at', keepData.scanned_at)

  if (deleteError) {
    throw new Error(`Failed to prune old history: ${deleteError.message}`)
  }

  return count || 0
}

/**
 * 获取全局扫描统计
 */
export async function getGlobalScanStats(): Promise<{
  totalScans: number
  scansToday: number
  scansThisWeek: number
  averageScore: number
}> {
  const now = new Date()
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const weekStart = new Date(todayStart)
  weekStart.setDate(weekStart.getDate() - 7)

  // 总扫描数
  const { count: totalScans, error: totalError } = await supabaseAdmin
    .from('scan_history')
    .select('id', { count: 'exact', head: true })

  if (totalError) {
    throw new Error(`Failed to get total scans: ${totalError.message}`)
  }

  // 今日扫描数
  const { count: scansToday, error: todayError } = await supabaseAdmin
    .from('scan_history')
    .select('id', { count: 'exact', head: true })
    .gte('scanned_at', todayStart.toISOString())

  if (todayError) {
    throw new Error(`Failed to get today scans: ${todayError.message}`)
  }

  // 本周扫描数
  const { count: scansThisWeek, error: weekError } = await supabaseAdmin
    .from('scan_history')
    .select('id', { count: 'exact', head: true })
    .gte('scanned_at', weekStart.toISOString())

  if (weekError) {
    throw new Error(`Failed to get week scans: ${weekError.message}`)
  }

  // 平均分数 (从最新的 1000 条记录计算)
  const { data: scoreData, error: scoreError } = await supabaseAdmin
    .from('scan_history')
    .select('sr_score')
    .order('scanned_at', { ascending: false })
    .limit(1000)

  if (scoreError) {
    throw new Error(`Failed to get average score: ${scoreError.message}`)
  }

  const averageScore = scoreData && scoreData.length > 0
    ? scoreData.reduce((sum, row) => sum + Number(row.sr_score), 0) / scoreData.length
    : 0

  return {
    totalScans: totalScans || 0,
    scansToday: scansToday || 0,
    scansThisWeek: scansThisWeek || 0,
    averageScore: Math.round(averageScore * 10) / 10
  }
}
