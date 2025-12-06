/**
 * 表单验证工具函数
 * 提供 URL 验证、表单验证等功能
 * 
 * **Validates: Requirements 8.2, 8.4, 8.5**
 */

import type { EntityType, AutonomyLevel } from './types/agent'

/**
 * URL 验证结果
 */
export interface UrlValidationResult {
  isValid: boolean
  url?: string
  error?: string
}

/**
 * 验证 URL 格式
 * 
 * **Property 11: URL Validation**
 * **Validates: Requirements 8.2**
 * 
 * @param url - 待验证的 URL 字符串
 * @returns 验证结果对象
 */
export function validateUrl(url: string): UrlValidationResult {
  // 空值检查
  if (!url || typeof url !== 'string') {
    return { isValid: false, error: 'URL 不能为空' }
  }

  const trimmedUrl = url.trim()
  
  if (trimmedUrl.length === 0) {
    return { isValid: false, error: 'URL 不能为空' }
  }

  // 长度限制
  if (trimmedUrl.length > 2048) {
    return { isValid: false, error: 'URL 长度不能超过 2048 字符' }
  }

  try {
    const parsed = new URL(trimmedUrl)
    
    // 只允许 http 和 https 协议
    if (!['http:', 'https:'].includes(parsed.protocol)) {
      return { isValid: false, error: '只支持 HTTP 或 HTTPS 协议' }
    }

    // 检查主机名
    if (!parsed.hostname || parsed.hostname.length === 0) {
      return { isValid: false, error: '无效的主机名' }
    }

    // 检查是否为 localhost 或 IP 地址（生产环境可能需要禁止）
    // 这里允许，但可以根据需求调整

    return { isValid: true, url: trimmedUrl }
  } catch {
    return { isValid: false, error: '请输入有效的 URL 格式' }
  }
}

/**
 * 发布表单数据
 */
export interface PublishFormData {
  url: string
  name: string
  description: string
  category: string
  entityType: EntityType
  autonomyLevel: AutonomyLevel
  email?: string
  framework?: string
  tags?: string[]
}

/**
 * 表单验证错误
 */
export interface PublishFormErrors {
  url?: string
  name?: string
  description?: string
  category?: string
  entityType?: string
  autonomyLevel?: string
  email?: string
  framework?: string
  tags?: string
}

/**
 * 验证邮箱格式
 */
export function validateEmail(email: string): string | undefined {
  if (!email || email.trim().length === 0) {
    return undefined // 邮箱是可选的
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email.trim())) {
    return '请输入有效的邮箱地址'
  }

  if (email.length > 254) {
    return '邮箱地址过长'
  }

  return undefined
}

/**
 * 验证名称
 */
export function validateName(name: string): string | undefined {
  if (!name || name.trim().length === 0) {
    return '名称不能为空'
  }

  if (name.trim().length < 2) {
    return '名称至少需要 2 个字符'
  }

  if (name.trim().length > 100) {
    return '名称不能超过 100 个字符'
  }

  return undefined
}

/**
 * 验证描述
 */
export function validateDescription(description: string): string | undefined {
  if (!description || description.trim().length === 0) {
    return '描述不能为空'
  }

  if (description.trim().length < 10) {
    return '描述至少需要 10 个字符'
  }

  if (description.trim().length > 500) {
    return '描述不能超过 500 个字符'
  }

  return undefined
}

/**
 * 验证分类
 */
export function validateCategory(category: string): string | undefined {
  if (!category || category.trim().length === 0) {
    return '请选择分类'
  }

  return undefined
}

/**
 * 有效的实体类型
 */
const VALID_ENTITY_TYPES: EntityType[] = ['repo', 'saas', 'app']

/**
 * 验证实体类型
 */
export function validateEntityType(entityType: string): string | undefined {
  if (!entityType) {
    return '请选择实体类型'
  }

  if (!VALID_ENTITY_TYPES.includes(entityType as EntityType)) {
    return '无效的实体类型'
  }

  return undefined
}

/**
 * 有效的自主等级
 */
const VALID_AUTONOMY_LEVELS: AutonomyLevel[] = ['L1', 'L2', 'L3', 'L4', 'L5']

/**
 * 验证自主等级
 */
export function validateAutonomyLevel(level: string): string | undefined {
  if (!level) {
    return '请选择自主等级'
  }

  if (!VALID_AUTONOMY_LEVELS.includes(level as AutonomyLevel)) {
    return '无效的自主等级'
  }

  return undefined
}

/**
 * 验证发布表单
 * 
 * **Property 13: Form Validation Completeness**
 * **Validates: Requirements 8.4, 8.5**
 * 
 * @param data - 表单数据
 * @returns 验证错误对象，如果没有错误则返回空对象
 */
export function validatePublishForm(data: Partial<PublishFormData>): PublishFormErrors {
  const errors: PublishFormErrors = {}

  // URL 验证
  const urlResult = validateUrl(data.url || '')
  if (!urlResult.isValid) {
    errors.url = urlResult.error
  }

  // 名称验证
  const nameError = validateName(data.name || '')
  if (nameError) {
    errors.name = nameError
  }

  // 描述验证
  const descError = validateDescription(data.description || '')
  if (descError) {
    errors.description = descError
  }

  // 分类验证
  const categoryError = validateCategory(data.category || '')
  if (categoryError) {
    errors.category = categoryError
  }

  // 实体类型验证
  const entityTypeError = validateEntityType(data.entityType || '')
  if (entityTypeError) {
    errors.entityType = entityTypeError
  }

  // 自主等级验证
  const autonomyError = validateAutonomyLevel(data.autonomyLevel || '')
  if (autonomyError) {
    errors.autonomyLevel = autonomyError
  }

  // 邮箱验证（可选字段）
  if (data.email) {
    const emailError = validateEmail(data.email)
    if (emailError) {
      errors.email = emailError
    }
  }

  return errors
}

/**
 * 检查表单是否有效
 */
export function isFormValid(errors: PublishFormErrors): boolean {
  return Object.keys(errors).length === 0
}
