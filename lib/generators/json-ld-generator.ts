/**
 * JSON-LD 生成器
 * 为 Agent 生成 Schema.org 结构化数据标记
 * 
 * Requirements: 6.1-6.5
 * - 生成 SoftwareApplication schema
 * - 包含 @type, name, description, url, provider 字段
 * - 格式化为有效的 JSON 字符串
 * - 生成部署说明
 */

import type { ScannerAgent, JSONLDOutput, SRTier } from '@/lib/types/scanner'

/**
 * JSON-LD Schema 类型定义
 */
interface SoftwareApplicationSchema {
  '@context': string
  '@type': string
  name: string
  description: string
  url: string
  provider?: {
    '@type': string
    name: string
    url?: string
  }
  applicationCategory?: string
  operatingSystem?: string
  offers?: {
    '@type': string
    price: string
    priceCurrency: string
  }
  aggregateRating?: {
    '@type': string
    ratingValue: string
    bestRating: string
    worstRating: string
  }
  softwareVersion?: string
  datePublished?: string
  dateModified?: string
  image?: string
  screenshot?: string
  featureList?: string[]
  keywords?: string
  isAccessibleForFree?: boolean
  license?: string
  codeRepository?: string
  programmingLanguage?: string[]
}

/**
 * 从 Agent 数据生成 JSON-LD 结构化数据
 * 
 * @param agent - Agent 数据
 * @returns JSON-LD 输出，包含对象、字符串和部署说明
 * 
 * **验证: 需求 6.1, 6.2, 6.3**
 */
export function generateJSONLD(agent: ScannerAgent): JSONLDOutput {
  const jsonLd = buildJSONLDSchema(agent)
  const jsonLdString = formatJSONLDString(jsonLd)
  const deploymentInstructions = generateDeploymentInstructions(agent)

  return {
    jsonLd,
    jsonLdString,
    deploymentInstructions
  }
}

/**
 * 构建 JSON-LD Schema 对象
 * 
 * @param agent - Agent 数据
 * @returns SoftwareApplication schema 对象
 */
function buildJSONLDSchema(agent: ScannerAgent): SoftwareApplicationSchema {
  const schema: SoftwareApplicationSchema = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: agent.name,
    description: agent.description || `${agent.name} - AI Agent`,
    url: getAgentUrl(agent)
  }

  // 添加 provider 信息
  schema.provider = buildProviderInfo(agent)

  // 添加应用类别
  schema.applicationCategory = 'AI Agent'

  // 添加操作系统 (Web-based)
  schema.operatingSystem = 'Web'

  // 添加免费标识
  schema.offers = {
    '@type': 'Offer',
    price: '0',
    priceCurrency: 'USD'
  }

  // 添加 SR 评分作为 aggregateRating
  if (agent.srScore > 0) {
    schema.aggregateRating = {
      '@type': 'AggregateRating',
      ratingValue: agent.srScore.toFixed(1),
      bestRating: '10',
      worstRating: '0'
    }
  }

  // 添加图片 (如果有 OG image)
  if (agent.ogImage) {
    schema.image = agent.ogImage
    schema.screenshot = agent.ogImage
  }

  // 添加功能列表 (基于 I/O 模态)
  const features = buildFeatureList(agent)
  if (features.length > 0) {
    schema.featureList = features
  }

  // 添加关键词
  const keywords = buildKeywords(agent)
  if (keywords) {
    schema.keywords = keywords
  }

  // 添加 GitHub 相关信息
  if (agent.githubUrl) {
    schema.codeRepository = agent.githubUrl
    schema.isAccessibleForFree = true
  }

  // 添加最后更新时间 (安全处理无效日期)
  if (agent.updatedAt && isValidDate(agent.updatedAt)) {
    schema.dateModified = new Date(agent.updatedAt).toISOString().split('T')[0]
  }

  if (agent.createdAt && isValidDate(agent.createdAt)) {
    schema.datePublished = new Date(agent.createdAt).toISOString().split('T')[0]
  }

  return schema
}

/**
 * 构建 Provider 信息
 */
function buildProviderInfo(agent: ScannerAgent): SoftwareApplicationSchema['provider'] {
  // 从 GitHub URL 提取 owner 作为 provider name
  if (agent.githubUrl) {
    const match = agent.githubUrl.match(/github\.com\/([^/]+)/)
    if (match) {
      return {
        '@type': 'Organization',
        name: match[1],
        url: `https://github.com/${match[1]}`
      }
    }
  }

  // 从 homepage URL 提取域名作为 provider
  if (agent.homepageUrl) {
    try {
      const url = new URL(agent.homepageUrl)
      return {
        '@type': 'Organization',
        name: url.hostname.replace('www.', ''),
        url: agent.homepageUrl
      }
    } catch {
      // URL 解析失败，使用默认值
    }
  }

  // 默认 provider
  return {
    '@type': 'Organization',
    name: agent.name
  }
}

/**
 * 获取 Agent 的主要 URL
 */
function getAgentUrl(agent: ScannerAgent): string {
  // 优先使用 homepage，其次 GitHub
  return agent.homepageUrl || agent.githubUrl || `https://agentsignals.ai/agents/${agent.slug}`
}

/**
 * 构建功能列表
 */
function buildFeatureList(agent: ScannerAgent): string[] {
  const features: string[] = []

  // 添加输入模态
  if (agent.inputTypes.length > 0) {
    const inputs = agent.inputTypes.filter(t => t !== 'Unknown')
    if (inputs.length > 0) {
      features.push(`Accepts: ${inputs.join(', ')}`)
    }
  }

  // 添加输出模态
  if (agent.outputTypes.length > 0) {
    const outputs = agent.outputTypes.filter(t => t !== 'Unknown')
    if (outputs.length > 0) {
      features.push(`Outputs: ${outputs.join(', ')}`)
    }
  }

  // 添加 MCP 支持
  if (agent.isMcp) {
    features.push('MCP (Model Context Protocol) Support')
  }

  // 添加 API 文档
  if (agent.apiDocsUrl) {
    features.push('API Documentation Available')
  }

  // 添加 SR 等级描述
  features.push(`Signal Rank: ${agent.srTier} (${agent.srScore.toFixed(1)}/10)`)

  return features
}

/**
 * 构建关键词
 */
function buildKeywords(agent: ScannerAgent): string {
  const keywords: string[] = ['AI Agent', 'AI Tool']

  // 添加轨道类型
  if (agent.srTrack === 'OpenSource') {
    keywords.push('Open Source', 'GitHub')
  } else if (agent.srTrack === 'SaaS') {
    keywords.push('SaaS', 'Cloud Service')
  } else {
    keywords.push('Hybrid', 'Open Source', 'SaaS')
  }

  // 添加 MCP
  if (agent.isMcp) {
    keywords.push('MCP', 'Model Context Protocol')
  }

  // 添加 I/O 模态作为关键词
  const modalities = [...new Set([...agent.inputTypes, ...agent.outputTypes])]
    .filter(m => m !== 'Unknown')
  keywords.push(...modalities)

  return keywords.join(', ')
}

/**
 * 格式化 JSON-LD 为可嵌入的 HTML 字符串
 * 
 * @param jsonLd - JSON-LD 对象
 * @returns 格式化的 HTML script 标签字符串
 */
function formatJSONLDString(jsonLd: SoftwareApplicationSchema): string {
  const jsonString = JSON.stringify(jsonLd, null, 2)
  return `<script type="application/ld+json">
${jsonString}
</script>`
}

/**
 * 生成部署说明
 * 
 * @param agent - Agent 数据
 * @returns 部署说明文本
 * 
 * **验证: 需求 6.4**
 */
function generateDeploymentInstructions(agent: ScannerAgent): string {
  const tierEmoji = getTierEmoji(agent.srTier)
  
  return `## 部署 JSON-LD 结构化数据

${tierEmoji} 您的 Agent "${agent.name}" 当前 Signal Rank: ${agent.srTier} (${agent.srScore.toFixed(1)}/10)

### 步骤 1: 复制代码
复制上方的 JSON-LD 代码块。

### 步骤 2: 添加到网站
将代码粘贴到您网站的 \`<head>\` 标签内：

\`\`\`html
<head>
  <!-- 其他 meta 标签 -->
  
  <!-- Agent Signals JSON-LD -->
  <script type="application/ld+json">
    { ... }
  </script>
</head>
\`\`\`

### 步骤 3: 验证部署
1. 部署更新后的网站
2. 返回 Agent Signals 点击"验证部署"按钮
3. 系统将重新扫描并更新您的 SR 评分

### 提示
- JSON-LD 部署后，您的 AEO 分数将提升 2.0 分
- 确保 JSON-LD 中的 URL 与实际网站 URL 一致
- 使用 Google 的 [Rich Results Test](https://search.google.com/test/rich-results) 验证结构化数据

### 需要帮助？
访问 [Agent Signals 文档](https://agentsignals.ai/docs) 获取更多信息。`
}

/**
 * 获取等级对应的 emoji
 */
function getTierEmoji(tier: SRTier): string {
  switch (tier) {
    case 'S': return '🏆'
    case 'A': return '⭐'
    case 'B': return '📊'
    case 'C': return '📈'
    default: return '📊'
  }
}

/**
 * 检查日期是否有效
 */
function isValidDate(date: Date | null | undefined): boolean {
  if (!date) return false
  const d = new Date(date)
  return !isNaN(d.getTime())
}

/**
 * 验证 JSON-LD 是否包含所有必需字段
 * 用于属性测试
 * 
 * @param jsonLd - JSON-LD 对象
 * @returns 是否包含所有必需字段
 */
export function validateJSONLDFields(jsonLd: object): boolean {
  const required = ['@context', '@type', 'name', 'description', 'url', 'provider']
  return required.every(field => field in jsonLd && (jsonLd as Record<string, unknown>)[field] !== undefined)
}

/**
 * 验证 JSON-LD 字符串是否为有效 JSON
 * 
 * @param jsonLdString - JSON-LD HTML 字符串
 * @returns 是否为有效 JSON
 */
export function isValidJSONLDString(jsonLdString: string): boolean {
  try {
    // 提取 script 标签内的 JSON
    const match = jsonLdString.match(/<script[^>]*>([\s\S]*?)<\/script>/)
    if (!match) return false
    
    JSON.parse(match[1])
    return true
  } catch {
    return false
  }
}
