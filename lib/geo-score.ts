/**
 * GEO Score 计算模块
 * 基于活跃度、影响力、元数据完整度和自主等级计算 Agent 评分
 * 
 * 评分公式: Base(50) + Vitality(0-20) + Influence(0-10) + Metadata(0-10) + Autonomy(0-10)
 * 总分范围: 0-100
 */

import type { ExtendedAgent, AutonomyLevel, AgentMetrics } from './types/agent'

// 自主等级对应的加分
const AUTONOMY_BONUS: Record<AutonomyLevel, number> = {
  L1: 0,
  L2: 2,
  L3: 5,
  L4: 8,
  L5: 10
}

/**
 * 计算距离指定日期的天数
 */
function getDaysSince(dateString: string): number {
  const date = new Date(dateString)
  const now = new Date()
  const diffTime = now.getTime() - date.getTime()
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))
  return Math.max(0, diffDays)
}

/**
 * 计算活跃度分数 (0-20)
 * - SaaS: 基于 uptime 百分比
 * - Repo: 基于最后提交时间
 * - App: 基于最后 ping 时间
 */
export function calculateVitalityScore(
  entityType: string,
  metrics: AgentMetrics
): number {
  if (entityType === 'saas' && metrics.uptime !== undefined) {
    // uptime 100% = 20分, 0% = 0分
    return Math.min(20, Math.max(0, metrics.uptime / 5))
  }
  
  if (entityType === 'repo' && metrics.lastCommit) {
    // 今天提交 = 20分, 20天前 = 0分
    const daysSinceCommit = getDaysSince(metrics.lastCommit)
    return Math.max(0, 20 - daysSinceCommit)
  }
  
  if (entityType === 'app' && metrics.lastPing) {
    // 简单处理: 有 lastPing 给 10 分
    return 10
  }
  
  // 默认给基础分
  return 5
}

/**
 * 计算影响力分数 (0-10)
 * 基于 GitHub stars 数量 (对数计算)
 */
export function calculateInfluenceScore(metrics: AgentMetrics): number {
  if (metrics.stars !== undefined && metrics.stars > 0) {
    // log10(1) = 0, log10(10) = 1, log10(100) = 2, log10(1000) = 3, log10(10000) = 4, log10(100000) = 5
    // 乘以 2 得到: 0, 2, 4, 6, 8, 10
    return Math.min(10, Math.log10(metrics.stars) * 2)
  }
  return 0
}

/**
 * 计算元数据完整度分数 (0-10)
 * 每个完整字段 2.5 分
 */
export function calculateMetadataScore(agent: Partial<ExtendedAgent>): number {
  const fields = [
    agent.detailed_description,
    agent.tags && agent.tags.length > 0,
    agent.official_url,
    agent.framework
  ]
  
  const completedFields = fields.filter(Boolean).length
  return completedFields * 2.5
}

/**
 * 计算自主等级加分 (0-10)
 */
export function calculateAutonomyBonus(autonomyLevel: AutonomyLevel): number {
  return AUTONOMY_BONUS[autonomyLevel] ?? 0
}

/**
 * 计算 GEO Score 总分
 * 
 * @param agent - Agent 数据对象
 * @returns 0-100 的整数评分
 * 
 * 评分组成:
 * - Base: 50 分 (基础分)
 * - Vitality: 0-20 分 (活跃度)
 * - Influence: 0-10 分 (影响力)
 * - Metadata: 0-10 分 (元数据完整度)
 * - Autonomy: 0-10 分 (自主等级)
 */
export function calculateGeoScore(agent: Partial<ExtendedAgent>): number {
  const BASE_SCORE = 50
  
  // 获取必要字段，使用默认值
  const entityType = agent.entity_type ?? 'saas'
  const metrics = agent.metrics ?? {}
  const autonomyLevel = agent.autonomy_level ?? 'L2'
  
  // 计算各项分数
  const vitalityScore = calculateVitalityScore(entityType, metrics)
  const influenceScore = calculateInfluenceScore(metrics)
  const metadataScore = calculateMetadataScore(agent)
  const autonomyBonus = calculateAutonomyBonus(autonomyLevel)
  
  // 计算总分
  const totalScore = BASE_SCORE + vitalityScore + influenceScore + metadataScore + autonomyBonus
  
  // 确保分数在 0-100 范围内
  return Math.min(100, Math.max(0, Math.round(totalScore)))
}

/**
 * 批量计算 GEO Score
 */
export function calculateGeoScores(agents: Partial<ExtendedAgent>[]): Map<string, number> {
  const scores = new Map<string, number>()
  
  for (const agent of agents) {
    if (agent.id) {
      scores.set(agent.id, calculateGeoScore(agent))
    }
  }
  
  return scores
}

/**
 * 获取 GEO Score 等级描述
 */
export function getGeoScoreGrade(score: number): { grade: string; label: string; color: string } {
  if (score >= 90) return { grade: 'S', label: '顶级', color: 'text-purple-400' }
  if (score >= 80) return { grade: 'A', label: '优秀', color: 'text-green-400' }
  if (score >= 70) return { grade: 'B', label: '良好', color: 'text-blue-400' }
  if (score >= 60) return { grade: 'C', label: '一般', color: 'text-yellow-400' }
  if (score >= 50) return { grade: 'D', label: '及格', color: 'text-orange-400' }
  return { grade: 'F', label: '待改进', color: 'text-red-400' }
}
