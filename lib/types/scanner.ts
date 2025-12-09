/**
 * Agent Scanner MVP 类型定义
 * Signal Rank (SR) 评分系统相关类型
 * Requirements: 9.2
 */

// ============================================
// SR 评分相关类型
// ============================================

/**
 * SR 等级: S(9.0-10.0), A(7.5-8.9), B(5.0-7.4), C(<5.0)
 */
export type SRTier = 'S' | 'A' | 'B' | 'C'

/**
 * SR 轨道类型
 * - OpenSource: GitHub 开源项目 (Track A)
 * - SaaS: 商业 SaaS 产品 (Track B)
 * - Hybrid: 同时拥有 GitHub 和官网的混合型
 */
export type SRTrack = 'OpenSource' | 'SaaS' | 'Hybrid'

/**
 * I/O 模态类型
 */
export type IOModality = 'Text' | 'Image' | 'Audio' | 'JSON' | 'Code' | 'File' | 'Video' | 'Unknown'

/**
 * SR 评分明细
 * Track A (GitHub) 和 Track B (SaaS) 的各项指标分数
 */
export interface SRScoreBreakdown {
  // Track A (GitHub) 指标
  starsScore: number       // 最高 2.0 - 星标阶梯分
  forksScore: number       // 最高 1.0 - Fork 比率分
  vitalityScore: number    // 最高 2.0 - 活跃度分 (提交+许可证)
  readinessScore: number   // 最高 3.0 - 机器就绪度 (openapi+dockerfile+readme)
  protocolScore: number    // 最高 2.0 - 协议支持 (MCP+标准接口)
  
  // Track B (SaaS) 指标
  trustScore: number       // 最高 3.0 - 身份信誉 (HTTPS+社交+认领)
  aeoScore: number         // 最高 4.0 - AEO 可见性 (meta+JSON-LD+OG)
  interopScore: number     // 最高 3.0 - 互操作性 (API文档+关键词+登录)
}

/**
 * SR 计算结果
 */
export interface SRResult {
  finalScore: number       // 最终分数 0.0 - 10.0
  tier: SRTier             // 等级 S/A/B/C
  track: SRTrack           // 轨道类型
  scoreA: number           // Track A 分数
  scoreB: number           // Track B 分数
  breakdown: SRScoreBreakdown  // 详细评分明细
  isMCP: boolean           // 是否支持 MCP
  isVerified: boolean      // 是否已验证
}

// ============================================
// URL 检测相关类型
// ============================================

/**
 * URL 类型
 */
export type URLType = 'github' | 'saas' | 'invalid'

/**
 * URL 检测结果
 */
export interface URLDetectorResult {
  type: URLType
  normalizedUrl: string
  githubOwner?: string
  githubRepo?: string
}

// ============================================
// GitHub 扫描相关类型
// ============================================

/**
 * GitHub 扫描结果
 */
export interface GitHubScanResult {
  stars: number
  forks: number
  lastCommitDate: Date | null
  hasLicense: boolean
  hasOpenAPI: boolean
  hasDockerfile: boolean
  hasManifest: boolean
  readmeLength: number
  hasUsageCodeBlock: boolean
  hasMCP: boolean
  hasStandardInterface: boolean  // LangChain, Vercel AI SDK 等
  homepage: string | null
  description: string
  topics: string[]
  owner: string
  repo: string
}

// ============================================
// SaaS 扫描相关类型
// ============================================

/**
 * SaaS 扫描结果
 */
export interface SaaSScanResult {
  httpsValid: boolean
  sslValidMonths: number
  socialLinks: string[]
  hasJsonLd: boolean
  jsonLdContent: object | null
  hasBasicMeta: boolean
  metaTitle: string | null
  metaDescription: string | null
  hasH1: boolean
  hasOgTags: boolean
  ogImage: string | null
  ogTitle: string | null
  hasApiDocsPath: boolean
  apiDocsUrl: string | null
  hasIntegrationKeywords: boolean
  integrationKeywords: string[]
  hasLoginButton: boolean
  pageContent: string
}

// ============================================
// I/O 提取相关类型
// ============================================

/**
 * I/O 提取结果
 */
export interface IOResult {
  inputs: IOModality[]
  outputs: IOModality[]
}

// ============================================
// 诊断相关类型
// ============================================

/**
 * 诊断状态
 */
export type DiagnosticStatus = 'pass' | 'fail' | 'warning'

/**
 * 诊断项
 */
export interface DiagnosticItem {
  metric: string           // 指标名称
  status: DiagnosticStatus // 状态
  score: number            // 得分
  maxScore: number         // 最高分
  suggestion?: string      // 改进建议 (失败时提供)
}

// ============================================
// API 请求/响应类型
// ============================================

/**
 * 扫描请求
 */
export interface ScanRequest {
  url: string
  forceRescan?: boolean
}

/**
 * 扫描响应
 */
export interface ScanResponse {
  agent: ScannerAgent
  isNew: boolean
  isCached: boolean
  cacheAge?: number        // 缓存时长 (分钟)
  diagnostics: DiagnosticItem[]
}

/**
 * Scanner 专用的 Agent 类型
 * 包含 SR 评分相关的所有字段
 */
export interface ScannerAgent {
  id: string
  slug: string
  name: string
  description: string | null
  
  // URLs
  githubUrl: string | null
  homepageUrl: string | null
  apiDocsUrl: string | null
  
  // SR 评分
  srScore: number
  srTier: SRTier
  srTrack: SRTrack
  scoreGithub: number
  scoreSaas: number
  scoreBreakdown: SRScoreBreakdown
  
  // 标志位
  isMcp: boolean
  isClaimed: boolean
  isVerified: boolean
  
  // I/O 模态
  inputTypes: IOModality[]
  outputTypes: IOModality[]
  
  // 元数据
  metaTitle: string | null
  metaDescription: string | null
  ogImage: string | null
  jsonLd: object | null
  
  // GitHub 特定字段
  githubStars: number
  githubForks: number
  githubLastCommit: Date | null
  
  // 时间戳
  lastScannedAt: Date | null
  createdAt: Date
  updatedAt: Date
}

// ============================================
// 生成器相关类型
// ============================================

/**
 * JSON-LD 生成输出
 */
export interface JSONLDOutput {
  jsonLd: object
  jsonLdString: string
  deploymentInstructions: string
}

/**
 * 徽章生成输出
 */
export interface BadgeOutput {
  svgUrl: string
  embedCode: string
  tier: SRTier
  color: string
}

/**
 * 提示词生成输出
 */
export interface PromptOutput {
  systemPrompt: string
  hasStructuredAPI: boolean
  apiEndpoint?: string
}

/**
 * 生成器请求类型
 */
export type GeneratorType = 'jsonld' | 'badge' | 'prompt'

/**
 * 生成器请求
 */
export interface GeneratorRequest {
  agentSlug: string
  type: GeneratorType
}

// ============================================
// 扫描历史类型
// ============================================

/**
 * 扫描类型
 */
export type ScanType = 'manual' | 'scheduled' | 'api'

/**
 * 扫描历史记录
 */
export interface ScanHistoryRecord {
  id: string
  agentId: string
  srScore: number
  srTier: SRTier
  srTrack: SRTrack
  scoreGithub: number
  scoreSaas: number
  scoreBreakdown: SRScoreBreakdown
  scanType: ScanType
  scannedAt: Date
}

// ============================================
// 速率限制类型
// ============================================

/**
 * 速率限制检查结果
 */
export interface RateLimitResult {
  allowed: boolean
  currentCount: number
  maxCount: number
  resetAt: Date
}

/**
 * 速率限制记录
 */
export interface RateLimitRecord {
  ipAddress: string
  scanCount: number
  windowStart: Date
  userId: string | null
  isAuthenticated: boolean
  lastRequestAt: Date
}

// ============================================
// 常量定义
// ============================================

/**
 * SR 等级阈值
 */
export const SR_TIER_THRESHOLDS = {
  S: 9.0,   // >= 9.0
  A: 7.5,   // >= 7.5
  B: 5.0,   // >= 5.0
  C: 0.0    // < 5.0
} as const

/**
 * 星标阶梯分数
 */
export const STARS_SCORE_TIERS = {
  TIER_20K: { threshold: 20000, score: 2.0 },
  TIER_10K: { threshold: 10000, score: 1.5 },
  TIER_5K: { threshold: 5000, score: 1.0 },
  TIER_1K: { threshold: 1000, score: 0.5 },
  TIER_0: { threshold: 0, score: 0.0 }
} as const

/**
 * 速率限制配置
 */
export const RATE_LIMIT_CONFIG = {
  ANONYMOUS_MAX: 5,      // 匿名用户每小时最大请求数
  AUTHENTICATED_MAX: 20, // 已认证用户每小时最大请求数
  WINDOW_HOURS: 1        // 时间窗口 (小时)
} as const

/**
 * 缓存配置
 */
export const CACHE_CONFIG = {
  TTL_HOURS: 24          // 缓存有效期 (小时)
} as const

/**
 * 徽章颜色映射
 */
export const BADGE_COLORS: Record<SRTier, string> = {
  S: '#00FF94',  // 绿色
  A: '#3B82F6',  // 蓝色
  B: '#EAB308',  // 黄色
  C: '#6B7280'   // 灰色
} as const

/**
 * I/O 模态关键词映射
 */
export const IO_MODALITY_KEYWORDS: Record<IOModality, string[]> = {
  Text: ['text', 'string', 'message', 'prompt', 'query', 'chat'],
  Image: ['image', 'picture', 'photo', 'png', 'jpg', 'jpeg', 'gif', 'svg', 'vision'],
  Audio: ['audio', 'sound', 'voice', 'speech', 'mp3', 'wav', 'music'],
  JSON: ['json', 'object', 'structured', 'data', 'api'],
  Code: ['code', 'script', 'program', 'function', 'snippet'],
  File: ['file', 'document', 'pdf', 'upload', 'download', 'attachment'],
  Video: ['video', 'movie', 'mp4', 'stream'],
  Unknown: []
} as const

/**
 * MCP 检测关键词
 */
export const MCP_KEYWORDS = [
  'mcp',
  'model context protocol',
  'mcp server',
  'mcp-server',
  'modelcontextprotocol'
] as const

/**
 * 集成关键词
 */
export const INTEGRATION_KEYWORDS = [
  'sdk',
  'webhook',
  'zapier',
  'plugin',
  'integration',
  'api'
] as const

/**
 * 社交平台域名
 */
export const SOCIAL_DOMAINS = [
  'twitter.com',
  'x.com',
  'github.com',
  'discord.com',
  'discord.gg',
  'linkedin.com'
] as const

// ============================================
// 类型守卫函数
// ============================================

/**
 * 验证 SR 等级
 */
export function isValidSRTier(value: unknown): value is SRTier {
  return typeof value === 'string' && ['S', 'A', 'B', 'C'].includes(value)
}

/**
 * 验证 SR 轨道
 */
export function isValidSRTrack(value: unknown): value is SRTrack {
  return typeof value === 'string' && ['OpenSource', 'SaaS', 'Hybrid'].includes(value)
}

/**
 * 验证 I/O 模态
 */
export function isValidIOModality(value: unknown): value is IOModality {
  return typeof value === 'string' && 
    ['Text', 'Image', 'Audio', 'JSON', 'Code', 'File', 'Video', 'Unknown'].includes(value)
}

/**
 * 验证 URL 类型
 */
export function isValidURLType(value: unknown): value is URLType {
  return typeof value === 'string' && ['github', 'saas', 'invalid'].includes(value)
}

/**
 * 验证诊断状态
 */
export function isValidDiagnosticStatus(value: unknown): value is DiagnosticStatus {
  return typeof value === 'string' && ['pass', 'fail', 'warning'].includes(value)
}

/**
 * 验证扫描类型
 */
export function isValidScanType(value: unknown): value is ScanType {
  return typeof value === 'string' && ['manual', 'scheduled', 'api'].includes(value)
}

/**
 * 根据分数获取 SR 等级
 */
export function getTierFromScore(score: number): SRTier {
  if (score >= SR_TIER_THRESHOLDS.S) return 'S'
  if (score >= SR_TIER_THRESHOLDS.A) return 'A'
  if (score >= SR_TIER_THRESHOLDS.B) return 'B'
  return 'C'
}

/**
 * 创建默认的评分明细
 */
export function createDefaultScoreBreakdown(): SRScoreBreakdown {
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
