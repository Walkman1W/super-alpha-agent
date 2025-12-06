/**
 * JSON-LD 生成工具函数
 * 用于生成 Schema.org 结构化数据
 * 
 * **Property 12: JSON-LD Preview Generation**
 * **Validates: Requirements 8.3**
 */

import type { EntityType, AutonomyLevel } from './types/agent'

/**
 * Agent 提交数据
 */
export interface AgentJsonLdInput {
  name: string
  description: string
  url: string
  category: string
  entityType: EntityType
  autonomyLevel: AutonomyLevel
  framework?: string
  tags?: string[]
  author?: string
  dateCreated?: string
}

/**
 * JSON-LD SoftwareApplication 结构
 */
export interface SoftwareApplicationJsonLd {
  '@context': 'https://schema.org'
  '@type': 'SoftwareApplication'
  name: string
  description: string
  url: string
  applicationCategory: string
  applicationSubCategory?: string
  operatingSystem?: string
  softwareVersion?: string
  author?: {
    '@type': 'Organization' | 'Person'
    name: string
  }
  dateCreated?: string
  keywords?: string
  additionalProperty?: Array<{
    '@type': 'PropertyValue'
    name: string
    value: string
  }>
}

/**
 * 实体类型到操作系统的映射
 */
function getOperatingSystem(entityType: EntityType): string {
  const osMap: Record<EntityType, string> = {
    repo: 'Cross-platform',
    saas: 'Web Browser',
    app: 'Windows, macOS, Linux'
  }
  return osMap[entityType]
}

/**
 * 实体类型到应用子类别的映射
 */
function getApplicationSubCategory(entityType: EntityType): string {
  const subCategoryMap: Record<EntityType, string> = {
    repo: 'Source Code Repository',
    saas: 'Web Application',
    app: 'Desktop Application'
  }
  return subCategoryMap[entityType]
}

/**
 * 自主等级描述
 */
function getAutonomyDescription(level: AutonomyLevel): string {
  const descriptions: Record<AutonomyLevel, string> = {
    L1: 'Basic Automation - Requires constant human guidance',
    L2: 'Assisted Decision Making - Provides suggestions for human approval',
    L3: 'Limited Autonomy - Can execute predefined tasks independently',
    L4: 'High Autonomy - Can handle complex tasks with minimal supervision',
    L5: 'Full Autonomy - Operates independently with self-correction capabilities'
  }
  return descriptions[level]
}

/**
 * 生成 JSON-LD 结构化数据
 * 
 * **Property 12: JSON-LD Preview Generation**
 * **Validates: Requirements 8.3**
 * 
 * 对于任意有效的表单数据对象，生成的 JSON-LD 应包含所有输入字段值，
 * 并且可以解析回原始值（round-trip）
 * 
 * @param input - Agent 数据输入
 * @returns JSON-LD 对象
 */
export function generateJsonLd(input: AgentJsonLdInput): SoftwareApplicationJsonLd {
  const jsonLd: SoftwareApplicationJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: input.name,
    description: input.description,
    url: input.url,
    applicationCategory: `AI Agent - ${input.category}`,
    applicationSubCategory: getApplicationSubCategory(input.entityType),
    operatingSystem: getOperatingSystem(input.entityType),
    additionalProperty: [
      {
        '@type': 'PropertyValue',
        name: 'entityType',
        value: input.entityType
      },
      {
        '@type': 'PropertyValue',
        name: 'autonomyLevel',
        value: input.autonomyLevel
      },
      {
        '@type': 'PropertyValue',
        name: 'autonomyDescription',
        value: getAutonomyDescription(input.autonomyLevel)
      }
    ]
  }

  // 添加框架信息
  if (input.framework) {
    jsonLd.additionalProperty?.push({
      '@type': 'PropertyValue',
      name: 'framework',
      value: input.framework
    })
  }

  // 添加标签作为关键词
  if (input.tags && input.tags.length > 0) {
    jsonLd.keywords = input.tags.join(', ')
  }

  // 添加作者信息
  if (input.author) {
    jsonLd.author = {
      '@type': 'Organization',
      name: input.author
    }
  }

  // 添加创建日期
  if (input.dateCreated) {
    jsonLd.dateCreated = input.dateCreated
  }

  return jsonLd
}

/**
 * 将 JSON-LD 转换为格式化的 JSON 字符串
 * 
 * @param jsonLd - JSON-LD 对象
 * @returns 格式化的 JSON 字符串
 */
export function stringifyJsonLd(jsonLd: SoftwareApplicationJsonLd): string {
  return JSON.stringify(jsonLd, null, 2)
}

/**
 * 从 JSON-LD 中提取原始输入值
 * 用于验证 round-trip 属性
 * 
 * @param jsonLd - JSON-LD 对象
 * @returns 提取的输入值
 */
export function extractFromJsonLd(jsonLd: SoftwareApplicationJsonLd): Partial<AgentJsonLdInput> {
  const result: Partial<AgentJsonLdInput> = {
    name: jsonLd.name,
    description: jsonLd.description,
    url: jsonLd.url
  }

  // 从 applicationCategory 提取 category
  if (jsonLd.applicationCategory) {
    const match = jsonLd.applicationCategory.match(/^AI Agent - (.+)$/)
    if (match) {
      result.category = match[1]
    }
  }

  // 从 additionalProperty 提取其他字段
  if (jsonLd.additionalProperty) {
    for (const prop of jsonLd.additionalProperty) {
      if (prop.name === 'entityType') {
        result.entityType = prop.value as EntityType
      } else if (prop.name === 'autonomyLevel') {
        result.autonomyLevel = prop.value as AutonomyLevel
      } else if (prop.name === 'framework') {
        result.framework = prop.value
      }
    }
  }

  // 从 keywords 提取 tags
  if (jsonLd.keywords) {
    result.tags = jsonLd.keywords.split(', ').filter(t => t.length > 0)
  }

  // 提取作者
  if (jsonLd.author) {
    result.author = jsonLd.author.name
  }

  // 提取创建日期
  if (jsonLd.dateCreated) {
    result.dateCreated = jsonLd.dateCreated
  }

  return result
}

/**
 * 生成用于 HTML head 的 JSON-LD script 标签内容
 * 
 * @param input - Agent 数据输入
 * @returns HTML script 标签字符串
 */
export function generateJsonLdScript(input: AgentJsonLdInput): string {
  const jsonLd = generateJsonLd(input)
  return `<script type="application/ld+json">
${stringifyJsonLd(jsonLd)}
</script>`
}
