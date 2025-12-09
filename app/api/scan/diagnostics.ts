/**
 * 诊断生成逻辑
 * 
 * 为每个指标生成红/绿状态和可操作的建议
 * Requirements: 5.2, 5.4
 */

import type {
  DiagnosticItem,
  DiagnosticStatus,
  GitHubScanResult,
  SaaSScanResult,
  SRScoreBreakdown
} from '@/lib/types/scanner'

// ============================================
// 诊断建议映射
// ============================================

const DIAGNOSTIC_SUGGESTIONS: Record<string, string> = {
  // Track A (GitHub) 建议
  stars: '增加项目曝光度：在社交媒体分享、提交到 Awesome 列表、撰写技术博客介绍项目',
  forks: '鼓励社区贡献：完善 CONTRIBUTING.md、添加 good first issue 标签、积极回应 PR',
  commits: '保持项目活跃：定期提交更新、修复 issues、发布新版本',
  license: '添加开源许可证：在仓库根目录创建 LICENSE 文件，推荐 MIT 或 Apache 2.0',
  openapi: '添加 API 文档：创建 openapi.json 或 swagger.yaml 文件描述 API 接口',
  dockerfile: '添加容器支持：创建 Dockerfile 方便用户部署和使用',
  readme: '完善 README：添加详细的使用说明、代码示例、安装步骤，建议超过 200 行',
  mcp: '支持 MCP 协议：实现 Model Context Protocol 接口，提升 AI Agent 互操作性',
  
  // Track B (SaaS) 建议
  https: '启用 HTTPS：配置 SSL 证书确保网站安全访问',
  social: '添加社交链接：在网站添加 Twitter、GitHub、Discord 等社交媒体链接',
  jsonld: '添加 JSON-LD：在页面 <head> 中添加 SoftwareApplication 结构化数据',
  meta: '完善 Meta 标签：确保 title、description 和 H1 标签都存在且有意义',
  og: '添加 Open Graph：添加 og:title 和 og:image 标签优化社交分享',
  apidocs: '提供 API 文档：创建 /docs 或 /api 页面展示 API 使用方法',
  integration: '展示集成能力：在网站提及 SDK、Webhook、Zapier 等集成方式',
  login: '提供用户入口：添加登录/注册按钮方便用户使用服务'
}

// ============================================
// 诊断生成函数
// ============================================

/**
 * 根据分数确定状态
 */
function getStatus(score: number, maxScore: number, threshold?: number): DiagnosticStatus {
  const ratio = score / maxScore
  const effectiveThreshold = threshold ?? 0.5
  
  if (ratio >= 1) return 'pass'
  if (ratio >= effectiveThreshold) return 'warning'
  return 'fail'
}

/**
 * 生成 Track A (GitHub) 诊断
 */
function generateGitHubDiagnostics(
  result: GitHubScanResult,
  breakdown: SRScoreBreakdown
): DiagnosticItem[] {
  const diagnostics: DiagnosticItem[] = []
  
  // 星标诊断
  diagnostics.push({
    metric: 'GitHub Stars',
    status: getStatus(breakdown.starsScore, 2.0),
    score: breakdown.starsScore,
    maxScore: 2.0,
    suggestion: breakdown.starsScore < 2.0 ? DIAGNOSTIC_SUGGESTIONS.stars : undefined
  })
  
  // Fork 比率诊断
  diagnostics.push({
    metric: 'Fork Ratio',
    status: getStatus(breakdown.forksScore, 1.0),
    score: breakdown.forksScore,
    maxScore: 1.0,
    suggestion: breakdown.forksScore < 1.0 ? DIAGNOSTIC_SUGGESTIONS.forks : undefined
  })
  
  // 活跃度诊断 - 提交
  const commitScore = result.lastCommitDate && 
    (new Date().getTime() - result.lastCommitDate.getTime()) < 30 * 24 * 60 * 60 * 1000 
    ? 1.0 : 0
  diagnostics.push({
    metric: 'Recent Commits',
    status: getStatus(commitScore, 1.0),
    score: commitScore,
    maxScore: 1.0,
    suggestion: commitScore < 1.0 ? DIAGNOSTIC_SUGGESTIONS.commits : undefined
  })
  
  // 活跃度诊断 - 许可证
  const licenseScore = result.hasLicense ? 1.0 : 0
  diagnostics.push({
    metric: 'License',
    status: getStatus(licenseScore, 1.0),
    score: licenseScore,
    maxScore: 1.0,
    suggestion: licenseScore < 1.0 ? DIAGNOSTIC_SUGGESTIONS.license : undefined
  })
  
  // 机器就绪度 - OpenAPI
  const openapiScore = result.hasOpenAPI ? 1.5 : 0
  diagnostics.push({
    metric: 'OpenAPI/Swagger',
    status: getStatus(openapiScore, 1.5),
    score: openapiScore,
    maxScore: 1.5,
    suggestion: openapiScore < 1.5 ? DIAGNOSTIC_SUGGESTIONS.openapi : undefined
  })
  
  // 机器就绪度 - Dockerfile
  const dockerScore = result.hasDockerfile ? 0.5 : 0
  diagnostics.push({
    metric: 'Dockerfile',
    status: getStatus(dockerScore, 0.5),
    score: dockerScore,
    maxScore: 0.5,
    suggestion: dockerScore < 0.5 ? DIAGNOSTIC_SUGGESTIONS.dockerfile : undefined
  })
  
  // 机器就绪度 - README
  const readmeScore = result.readmeLength > 200 && result.hasUsageCodeBlock ? 1.0 : 0
  diagnostics.push({
    metric: 'README Quality',
    status: getStatus(readmeScore, 1.0),
    score: readmeScore,
    maxScore: 1.0,
    suggestion: readmeScore < 1.0 ? DIAGNOSTIC_SUGGESTIONS.readme : undefined
  })
  
  // 协议支持 - MCP
  const mcpScore = result.hasMCP ? 2.0 : (result.hasStandardInterface ? 1.0 : 0)
  diagnostics.push({
    metric: 'MCP Support',
    status: getStatus(mcpScore, 2.0),
    score: mcpScore,
    maxScore: 2.0,
    suggestion: mcpScore < 2.0 ? DIAGNOSTIC_SUGGESTIONS.mcp : undefined
  })
  
  return diagnostics
}

/**
 * 生成 Track B (SaaS) 诊断
 */
function generateSaaSDiagnostics(
  result: SaaSScanResult,
  breakdown: SRScoreBreakdown
): DiagnosticItem[] {
  const diagnostics: DiagnosticItem[] = []
  
  // HTTPS 诊断
  const httpsScore = result.httpsValid ? 1.0 : 0
  diagnostics.push({
    metric: 'HTTPS',
    status: getStatus(httpsScore, 1.0),
    score: httpsScore,
    maxScore: 1.0,
    suggestion: httpsScore < 1.0 ? DIAGNOSTIC_SUGGESTIONS.https : undefined
  })
  
  // 社交链接诊断
  const socialScore = result.socialLinks.length >= 2 ? 1.0 : 0
  diagnostics.push({
    metric: 'Social Links',
    status: getStatus(socialScore, 1.0),
    score: socialScore,
    maxScore: 1.0,
    suggestion: socialScore < 1.0 ? DIAGNOSTIC_SUGGESTIONS.social : undefined
  })
  
  // JSON-LD 诊断
  const jsonldScore = result.hasJsonLd ? 2.0 : 0
  diagnostics.push({
    metric: 'JSON-LD',
    status: getStatus(jsonldScore, 2.0),
    score: jsonldScore,
    maxScore: 2.0,
    suggestion: jsonldScore < 2.0 ? DIAGNOSTIC_SUGGESTIONS.jsonld : undefined
  })
  
  // Meta 标签诊断
  const metaScore = result.hasBasicMeta ? 1.0 : 0
  diagnostics.push({
    metric: 'Meta Tags',
    status: getStatus(metaScore, 1.0),
    score: metaScore,
    maxScore: 1.0,
    suggestion: metaScore < 1.0 ? DIAGNOSTIC_SUGGESTIONS.meta : undefined
  })
  
  // Open Graph 诊断
  const ogScore = result.hasOgTags ? 1.0 : 0
  diagnostics.push({
    metric: 'Open Graph',
    status: getStatus(ogScore, 1.0),
    score: ogScore,
    maxScore: 1.0,
    suggestion: ogScore < 1.0 ? DIAGNOSTIC_SUGGESTIONS.og : undefined
  })
  
  // API 文档诊断
  const apiDocsScore = result.hasApiDocsPath ? 1.5 : 0
  diagnostics.push({
    metric: 'API Documentation',
    status: getStatus(apiDocsScore, 1.5),
    score: apiDocsScore,
    maxScore: 1.5,
    suggestion: apiDocsScore < 1.5 ? DIAGNOSTIC_SUGGESTIONS.apidocs : undefined
  })
  
  // 集成关键词诊断
  const integrationScore = result.hasIntegrationKeywords ? 1.0 : 0
  diagnostics.push({
    metric: 'Integration Keywords',
    status: getStatus(integrationScore, 1.0),
    score: integrationScore,
    maxScore: 1.0,
    suggestion: integrationScore < 1.0 ? DIAGNOSTIC_SUGGESTIONS.integration : undefined
  })
  
  // 登录按钮诊断
  const loginScore = result.hasLoginButton ? 0.5 : 0
  diagnostics.push({
    metric: 'Login Button',
    status: getStatus(loginScore, 0.5),
    score: loginScore,
    maxScore: 0.5,
    suggestion: loginScore < 0.5 ? DIAGNOSTIC_SUGGESTIONS.login : undefined
  })
  
  return diagnostics
}

/**
 * 生成完整诊断报告
 * Requirements: 5.2, 5.4
 * 
 * @param githubResult GitHub 扫描结果 (可选)
 * @param saasResult SaaS 扫描结果 (可选)
 * @param breakdown SR 评分明细
 * @returns 诊断项数组
 */
export function generateDiagnostics(
  githubResult: GitHubScanResult | null,
  saasResult: SaaSScanResult | null,
  breakdown: SRScoreBreakdown
): DiagnosticItem[] {
  const diagnostics: DiagnosticItem[] = []
  
  // 生成 Track A 诊断
  if (githubResult) {
    diagnostics.push(...generateGitHubDiagnostics(githubResult, breakdown))
  }
  
  // 生成 Track B 诊断
  if (saasResult) {
    diagnostics.push(...generateSaaSDiagnostics(saasResult, breakdown))
  }
  
  return diagnostics
}

/**
 * 获取诊断建议
 * 属性 19: 诊断建议
 * 对于任意状态为 'fail' 的指标，返回非空建议字符串
 * 
 * @param metric 指标名称
 * @param status 诊断状态
 * @returns 建议字符串或 undefined
 */
export function getDiagnosticSuggestion(
  metric: string,
  status: DiagnosticStatus
): string | undefined {
  if (status !== 'fail') {
    return undefined
  }
  
  // 根据 metric 名称映射到建议 key
  const metricToKey: Record<string, string> = {
    'GitHub Stars': 'stars',
    'Fork Ratio': 'forks',
    'Recent Commits': 'commits',
    'License': 'license',
    'OpenAPI/Swagger': 'openapi',
    'Dockerfile': 'dockerfile',
    'README Quality': 'readme',
    'MCP Support': 'mcp',
    'HTTPS': 'https',
    'Social Links': 'social',
    'JSON-LD': 'jsonld',
    'Meta Tags': 'meta',
    'Open Graph': 'og',
    'API Documentation': 'apidocs',
    'Integration Keywords': 'integration',
    'Login Button': 'login'
  }
  
  const key = metricToKey[metric]
  if (key && DIAGNOSTIC_SUGGESTIONS[key]) {
    return DIAGNOSTIC_SUGGESTIONS[key]
  }
  
  // 回退：返回通用建议
  return `改进 ${metric} 以提升 Signal Rank 评分`
}

/**
 * 计算诊断摘要
 */
export function getDiagnosticsSummary(diagnostics: DiagnosticItem[]): {
  total: number
  passed: number
  failed: number
  warnings: number
  passRate: number
} {
  const total = diagnostics.length
  const passed = diagnostics.filter(d => d.status === 'pass').length
  const failed = diagnostics.filter(d => d.status === 'fail').length
  const warnings = diagnostics.filter(d => d.status === 'warning').length
  const passRate = total > 0 ? Math.round((passed / total) * 100) : 0
  
  return { total, passed, failed, warnings, passRate }
}
