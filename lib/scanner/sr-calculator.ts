/**
 * SR Calculator - Signal Rank 评分计算器
 * 实现 Track A (GitHub) 和 Track B (SaaS) 的评分逻辑
 * Requirements: 2.1-2.7, 3.1-3.7, 4.1-4.5
 */

import {
  GitHubScanResult,
  SaaSScanResult,
  SRResult,
  SRScoreBreakdown,
  SRTier,
  SRTrack,
  STARS_SCORE_TIERS,
  SR_TIER_THRESHOLDS,
  createDefaultScoreBreakdown
} from '@/lib/types/scanner'

// ============================================
// Track A (GitHub) 评分函数
// ============================================

/**
 * 计算星标阶梯分数
 * >20k=2.0, >10k=1.5, >5k=1.0, >1k=0.5, 否则=0
 * Requirements: 2.1
 * 
 * @param stars 星标数量
 * @returns 星标分数 (0-2.0)
 */
export function calculateStarsScore(stars: number): number {
  if (stars < 0) return 0
  
  if (stars >= STARS_SCORE_TIERS.TIER_20K.threshold) return STARS_SCORE_TIERS.TIER_20K.score
  if (stars >= STARS_SCORE_TIERS.TIER_10K.threshold) return STARS_SCORE_TIERS.TIER_10K.score
  if (stars >= STARS_SCORE_TIERS.TIER_5K.threshold) return STARS_SCORE_TIERS.TIER_5K.score
  if (stars >= STARS_SCORE_TIERS.TIER_1K.threshold) return STARS_SCORE_TIERS.TIER_1K.score
  
  return STARS_SCORE_TIERS.TIER_0.score
}

/**
 * 计算 Fork 比率分数
 * 如果 forks > stars * 0.1 则奖励 1.0 分
 * Requirements: 2.2
 * 
 * @param forks Fork 数量
 * @param stars 星标数量
 * @returns Fork 比率分数 (0 或 1.0)
 */
export function calculateForksScore(forks: number, stars: number): number {
  if (forks < 0 || stars < 0) return 0
  if (stars === 0) return forks > 0 ? 1.0 : 0
  
  return forks > stars * 0.1 ? 1.0 : 0
}

/**
 * 计算活跃度分数
 * 30天内有提交 = 1.0, 有 license = 1.0
 * Requirements: 2.3
 * 
 * @param lastCommitDate 最后提交日期
 * @param hasLicense 是否有许可证
 * @returns 活跃度分数 (0-2.0)
 */
export function calculateVitalityScore(
  lastCommitDate: Date | null,
  hasLicense: boolean
): number {
  let score = 0
  
  // 30天内有提交 +1.0
  if (lastCommitDate) {
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
    
    if (lastCommitDate >= thirtyDaysAgo) {
      score += 1.0
    }
  }
  
  // 有许可证 +1.0
  if (hasLicense) {
    score += 1.0
  }
  
  return score
}

/**
 * 计算机器就绪度分数
 * openapi/swagger/manifest = 1.5, dockerfile = 0.5, readme质量 = 1.0
 * Requirements: 2.4, 2.6, 2.7
 * 
 * @param hasOpenAPI 是否有 OpenAPI/Swagger 文件
 * @param hasDockerfile 是否有 Dockerfile
 * @param readmeLength README 行数
 * @param hasUsageCodeBlock 是否有使用示例代码块
 * @returns 就绪度分数 (0-3.0)
 */
export function calculateReadinessScore(
  hasOpenAPI: boolean,
  hasDockerfile: boolean,
  readmeLength: number,
  hasUsageCodeBlock: boolean
): number {
  let score = 0
  
  // OpenAPI/Swagger/Manifest +1.5
  if (hasOpenAPI) {
    score += 1.5
  }
  
  // Dockerfile +0.5
  if (hasDockerfile) {
    score += 0.5
  }
  
  // README 质量: >200行且有代码块 +1.0
  if (readmeLength > 200 && hasUsageCodeBlock) {
    score += 1.0
  }
  
  return score
}

/**
 * 计算协议支持分数
 * MCP = 2.0, 标准接口 = 1.0
 * Requirements: 2.5
 * 
 * @param hasMCP 是否支持 MCP
 * @param hasStandardInterface 是否有标准接口
 * @returns 协议分数 (0-2.0)
 */
export function calculateProtocolScore(
  hasMCP: boolean,
  hasStandardInterface: boolean
): number {
  // MCP 优先级最高
  if (hasMCP) {
    return 2.0
  }
  
  // 标准接口次之
  if (hasStandardInterface) {
    return 1.0
  }
  
  return 0
}

/**
 * 计算 Track A (GitHub) 总分
 * Requirements: 2.1-2.7
 * 
 * @param scanResult GitHub 扫描结果
 * @returns Track A 分数和明细
 */
export function calculateTrackAScore(scanResult: GitHubScanResult): {
  score: number
  breakdown: Partial<SRScoreBreakdown>
} {
  const starsScore = calculateStarsScore(scanResult.stars)
  const forksScore = calculateForksScore(scanResult.forks, scanResult.stars)
  const vitalityScore = calculateVitalityScore(scanResult.lastCommitDate, scanResult.hasLicense)
  const readinessScore = calculateReadinessScore(
    scanResult.hasOpenAPI,
    scanResult.hasDockerfile,
    scanResult.readmeLength,
    scanResult.hasUsageCodeBlock
  )
  const protocolScore = calculateProtocolScore(scanResult.hasMCP, scanResult.hasStandardInterface)
  
  const totalScore = starsScore + forksScore + vitalityScore + readinessScore + protocolScore
  
  return {
    score: totalScore,
    breakdown: {
      starsScore,
      forksScore,
      vitalityScore,
      readinessScore,
      protocolScore
    }
  }
}

// ============================================
// Track B (SaaS) 评分函数 - 占位，后续实现
// ============================================

/**
 * 计算 Track B (SaaS) 总分
 * Requirements: 3.1-3.7
 * 
 * @param scanResult SaaS 扫描结果
 * @param isClaimed 是否已认领
 * @returns Track B 分数和明细
 */
export function calculateTrackBScore(
  scanResult: SaaSScanResult,
  isClaimed: boolean = false
): {
  score: number
  breakdown: Partial<SRScoreBreakdown>
} {
  // TODO: Task 5 实现
  return {
    score: 0,
    breakdown: {
      trustScore: 0,
      aeoScore: 0,
      interopScore: 0
    }
  }
}

// ============================================
// 混合评分和最终计算
// ============================================

/**
 * 根据分数获取 SR 等级
 * S: 9.0-10.0, A: 7.5-8.9, B: 5.0-7.4, C: <5.0
 * Requirements: 4.5
 * 
 * @param score 分数
 * @returns SR 等级
 */
export function getTier(score: number): SRTier {
  if (score >= SR_TIER_THRESHOLDS.S) return 'S'
  if (score >= SR_TIER_THRESHOLDS.A) return 'A'
  if (score >= SR_TIER_THRESHOLDS.B) return 'B'
  return 'C'
}

/**
 * 四舍五入到一位小数
 * Requirements: 4.4
 * 
 * @param score 原始分数
 * @returns 四舍五入后的分数
 */
export function roundScore(score: number): number {
  return Math.round(score * 10) / 10
}

/**
 * 计算混合分数
 * 公式: Max(Score_A, Score_B) + 0.5, 封顶 10.0
 * Requirements: 4.1-4.3
 * 
 * @param scoreA Track A 分数
 * @param scoreB Track B 分数
 * @returns 混合分数
 */
export function calculateHybridScore(scoreA: number, scoreB: number): number {
  const maxScore = Math.max(scoreA, scoreB)
  const hybridScore = maxScore + 0.5
  return Math.min(hybridScore, 10.0)
}

/**
 * 确定轨道类型
 * 
 * @param hasGitHub 是否有 GitHub 数据
 * @param hasSaaS 是否有 SaaS 数据
 * @returns 轨道类型
 */
export function determineTrack(hasGitHub: boolean, hasSaaS: boolean): SRTrack {
  if (hasGitHub && hasSaaS) return 'Hybrid'
  if (hasGitHub) return 'OpenSource'
  return 'SaaS'
}

/**
 * 计算最终 SR 分数
 * Requirements: 2.1-2.7, 3.1-3.7, 4.1-4.5
 * 
 * @param github GitHub 扫描结果 (可选)
 * @param saas SaaS 扫描结果 (可选)
 * @param isClaimed 是否已认领
 * @returns SR 计算结果
 */
export function calculateSRScore(
  github?: GitHubScanResult | null,
  saas?: SaaSScanResult | null,
  isClaimed: boolean = false
): SRResult {
  const breakdown = createDefaultScoreBreakdown()
  let scoreA = 0
  let scoreB = 0
  let isMCP = false
  
  // 计算 Track A 分数
  if (github) {
    const trackAResult = calculateTrackAScore(github)
    scoreA = trackAResult.score
    isMCP = github.hasMCP
    
    // 合并 breakdown
    Object.assign(breakdown, trackAResult.breakdown)
  }
  
  // 计算 Track B 分数
  if (saas) {
    const trackBResult = calculateTrackBScore(saas, isClaimed)
    scoreB = trackBResult.score
    
    // 合并 breakdown
    Object.assign(breakdown, trackBResult.breakdown)
  }
  
  // 确定轨道类型
  const track = determineTrack(!!github, !!saas)
  
  // 计算最终分数
  let finalScore: number
  if (track === 'Hybrid') {
    finalScore = calculateHybridScore(scoreA, scoreB)
  } else if (track === 'OpenSource') {
    finalScore = scoreA
  } else {
    finalScore = scoreB
  }
  
  // 四舍五入并封顶
  finalScore = roundScore(Math.min(finalScore, 10.0))
  
  // 确定等级
  const tier = getTier(finalScore)
  
  return {
    finalScore,
    tier,
    track,
    scoreA: roundScore(scoreA),
    scoreB: roundScore(scoreB),
    breakdown,
    isMCP,
    isVerified: isClaimed
  }
}
