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
// Track B (SaaS) 评分函数
// ============================================

/**
 * 计算信任分数 (Trust Score)
 * HTTPS = 1.0, 社交链接 >= 2 = 1.0, 已认领 = 1.0
 * Requirements: 3.1, 3.2
 * 
 * @param httpsValid HTTPS 是否有效
 * @param socialLinksCount 社交链接数量
 * @param isClaimed 是否已认领
 * @returns 信任分数 (0-3.0)
 */
export function calculateTrustScore(
  httpsValid: boolean,
  socialLinksCount: number,
  isClaimed: boolean
): number {
  let score = 0
  
  // HTTPS 有效 +1.0
  if (httpsValid) {
    score += 1.0
  }
  
  // 社交链接 >= 2 +1.0
  if (socialLinksCount >= 2) {
    score += 1.0
  }
  
  // 已认领 +1.0
  if (isClaimed) {
    score += 1.0
  }
  
  return score
}

/**
 * 计算 AEO 可见性分数 (AEO Score)
 * Meta 标签完整 = 1.0, JSON-LD = 2.0, OG 标签 = 1.0
 * Requirements: 3.3, 3.4, 3.5
 * 
 * @param hasBasicMeta 是否有完整的基础 Meta 标签
 * @param hasJsonLd 是否有 JSON-LD
 * @param hasOgTags 是否有 OG 标签
 * @returns AEO 分数 (0-4.0)
 */
export function calculateAeoScore(
  hasBasicMeta: boolean,
  hasJsonLd: boolean,
  hasOgTags: boolean
): number {
  let score = 0
  
  // Meta 标签完整 +1.0
  if (hasBasicMeta) {
    score += 1.0
  }
  
  // JSON-LD +2.0
  if (hasJsonLd) {
    score += 2.0
  }
  
  // OG 标签 +1.0
  if (hasOgTags) {
    score += 1.0
  }
  
  return score
}

/**
 * 计算互操作性分数 (Interop Score)
 * API 文档 = 1.5, 集成关键词 = 1.0, 登录按钮 = 0.5
 * Requirements: 3.6, 3.7
 * 
 * @param hasApiDocsPath 是否有 API 文档路径
 * @param hasIntegrationKeywords 是否有集成关键词
 * @param hasLoginButton 是否有登录按钮
 * @returns 互操作性分数 (0-3.0)
 */
export function calculateInteropScore(
  hasApiDocsPath: boolean,
  hasIntegrationKeywords: boolean,
  hasLoginButton: boolean
): number {
  let score = 0
  
  // API 文档 +1.5
  if (hasApiDocsPath) {
    score += 1.5
  }
  
  // 集成关键词 +1.0
  if (hasIntegrationKeywords) {
    score += 1.0
  }
  
  // 登录按钮 +0.5
  if (hasLoginButton) {
    score += 0.5
  }
  
  return score
}

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
  const trustScore = calculateTrustScore(
    scanResult.httpsValid,
    scanResult.socialLinks.length,
    isClaimed
  )
  
  const aeoScore = calculateAeoScore(
    scanResult.hasBasicMeta,
    scanResult.hasJsonLd,
    scanResult.hasOgTags
  )
  
  const interopScore = calculateInteropScore(
    scanResult.hasApiDocsPath,
    scanResult.hasIntegrationKeywords,
    scanResult.hasLoginButton
  )
  
  const totalScore = trustScore + aeoScore + interopScore
  
  return {
    score: totalScore,
    breakdown: {
      trustScore,
      aeoScore,
      interopScore
    }
  }
}

// ============================================
// 混合评分和最终计算
// Requirements: 4.1-4.5
// ============================================

/**
 * 根据分数获取 SR 等级
 * S: 9.0-10.0, A: 7.5-8.9, B: 5.0-7.4, C: <5.0
 * Requirements: 4.5
 * 
 * @param score 分数 (0.0 - 10.0)
 * @returns SR 等级
 */
export function getTier(score: number): SRTier {
  // 处理边界情况：负数或 NaN 返回 C
  if (!Number.isFinite(score) || score < 0) return 'C'
  
  if (score >= SR_TIER_THRESHOLDS.S) return 'S'
  if (score >= SR_TIER_THRESHOLDS.A) return 'A'
  if (score >= SR_TIER_THRESHOLDS.B) return 'B'
  return 'C'
}

/**
 * 四舍五入到一位小数
 * 使用标准四舍五入规则 (银行家舍入的简化版)
 * Requirements: 4.4
 * 
 * @param score 原始分数
 * @returns 四舍五入后的分数
 */
export function roundScore(score: number): number {
  // 处理边界情况
  if (!Number.isFinite(score)) return 0
  if (score < 0) return 0
  
  return Math.round(score * 10) / 10
}

/**
 * 计算混合分数
 * 公式: Max(Score_A, Score_B) + 0.5 (混合奖励)
 * 封顶为 10.0
 * Requirements: 4.1, 4.2, 4.3
 * 
 * @param scoreA Track A (GitHub) 分数
 * @param scoreB Track B (SaaS) 分数
 * @returns 混合分数 (0.0 - 10.0)
 */
export function calculateHybridScore(scoreA: number, scoreB: number): number {
  // 处理边界情况：确保输入为有效数字
  const safeScoreA = Number.isFinite(scoreA) && scoreA >= 0 ? scoreA : 0
  const safeScoreB = Number.isFinite(scoreB) && scoreB >= 0 ? scoreB : 0
  
  // 取两个轨道的最高分
  const maxScore = Math.max(safeScoreA, safeScoreB)
  
  // 添加混合奖励 +0.5
  const hybridScore = maxScore + 0.5
  
  // 封顶为 10.0
  return Math.min(hybridScore, 10.0)
}

/**
 * 确定轨道类型
 * - Hybrid: 同时有 GitHub 和 SaaS 数据
 * - OpenSource: 仅有 GitHub 数据
 * - SaaS: 仅有 SaaS 数据或无数据
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
 * 验证分数是否在有效范围内
 * 
 * @param score 分数
 * @returns 是否有效
 */
export function isValidScore(score: number): boolean {
  return Number.isFinite(score) && score >= 0 && score <= 10
}

/**
 * 规范化分数到有效范围 [0, 10]
 * 
 * @param score 原始分数
 * @returns 规范化后的分数
 */
export function normalizeScore(score: number): number {
  if (!Number.isFinite(score)) return 0
  return Math.max(0, Math.min(score, 10))
}

/**
 * 计算最终 SR 分数
 * 综合 Track A (GitHub) 和 Track B (SaaS) 的评分
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
  
  // 计算 Track A 分数 (GitHub)
  if (github) {
    const trackAResult = calculateTrackAScore(github)
    scoreA = trackAResult.score
    isMCP = github.hasMCP
    
    // 合并 breakdown
    Object.assign(breakdown, trackAResult.breakdown)
  }
  
  // 计算 Track B 分数 (SaaS)
  if (saas) {
    const trackBResult = calculateTrackBScore(saas, isClaimed)
    scoreB = trackBResult.score
    
    // 合并 breakdown
    Object.assign(breakdown, trackBResult.breakdown)
  }
  
  // 确定轨道类型
  const track = determineTrack(!!github, !!saas)
  
  // 计算最终分数
  // Requirements: 4.1-4.3
  let finalScore: number
  if (track === 'Hybrid') {
    // 混合型: Max(A, B) + 0.5 奖励
    finalScore = calculateHybridScore(scoreA, scoreB)
  } else if (track === 'OpenSource') {
    // 纯开源: 使用 Track A 分数
    finalScore = scoreA
  } else {
    // 纯 SaaS: 使用 Track B 分数
    finalScore = scoreB
  }
  
  // 规范化分数到 [0, 10] 范围
  finalScore = normalizeScore(finalScore)
  
  // 四舍五入到一位小数 (Requirements: 4.4)
  finalScore = roundScore(finalScore)
  
  // 确定等级 (Requirements: 4.5)
  const tier = getTier(finalScore)
  
  return {
    finalScore,
    tier,
    track,
    scoreA: roundScore(normalizeScore(scoreA)),
    scoreB: roundScore(normalizeScore(scoreB)),
    breakdown,
    isMCP,
    isVerified: isClaimed
  }
}
