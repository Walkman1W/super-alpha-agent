/**
 * Security Utilities
 * 
 * Provides security functions for:
 * - Input validation and sanitization
 * - XSS prevention
 * - CSRF protection helpers
 * - Content Security Policy utilities
 */

import { z } from 'zod'

// ============================================================================
// Input Sanitization (防止XSS攻击)
// ============================================================================

/**
 * HTML特殊字符映射表
 */
const HTML_ESCAPE_MAP: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#x27;',
  '/': '&#x2F;',
}

/**
 * 转义HTML特殊字符以防止XSS攻击
 * 
 * @param text - 需要转义的文本
 * @returns 转义后的安全文本
 */
export function escapeHTML(text: string): string {
  return text.replace(/[&<>"'/]/g, (char) => HTML_ESCAPE_MAP[char] || char)
}

/**
 * 清理用户输入，移除潜在的危险内容
 * - 移除HTML标签
 * - 转义特殊字符
 * - 移除脚本内容
 * 
 * @param input - 用户输入的字符串
 * @returns 清理后的安全字符串
 */
export function sanitizeInput(input: string): string {
  if (!input) return ''
  
  // 移除HTML标签
  let cleaned = input.replace(/<[^>]*>/g, '')
  
  // 移除潜在的脚本内容
  cleaned = cleaned.replace(/javascript:/gi, '')
  cleaned = cleaned.replace(/on\w+\s*=/gi, '')
  
  // 转义HTML特殊字符
  cleaned = escapeHTML(cleaned)
  
  // 移除多余的空白字符
  cleaned = cleaned.replace(/\s+/g, ' ').trim()
  
  return cleaned
}

/**
 * 清理URL，确保安全性
 * - 只允许http和https协议
 * - 移除javascript:和data:协议
 * 
 * @param url - 需要清理的URL
 * @returns 清理后的安全URL或null
 */
export function sanitizeURL(url: string): string | null {
  if (!url) return null
  
  const trimmed = url.trim()
  
  // 检查危险协议
  const dangerousProtocols = ['javascript:', 'data:', 'vbscript:', 'file:']
  const lowerURL = trimmed.toLowerCase()
  
  for (const protocol of dangerousProtocols) {
    if (lowerURL.startsWith(protocol)) {
      return null
    }
  }
  
  // 验证URL格式
  try {
    const parsed = new URL(trimmed)
    
    // 只允许http和https
    if (!['http:', 'https:'].includes(parsed.protocol)) {
      return null
    }
    
    return parsed.toString()
  } catch {
    return null
  }
}

/**
 * 清理对象中的所有字符串字段
 * 
 * @param obj - 需要清理的对象
 * @returns 清理后的对象
 */
export function sanitizeObject<T extends Record<string, any>>(obj: T): T {
  const sanitized = { ...obj }
  
  for (const key in sanitized) {
    const value = sanitized[key]
    
    if (typeof value === 'string') {
      sanitized[key] = sanitizeInput(value) as any
    } else if (Array.isArray(value)) {
      sanitized[key] = value.map((item: any) =>
        typeof item === 'string' ? sanitizeInput(item) : item
      ) as any
    } else if (value && typeof value === 'object') {
      sanitized[key] = sanitizeObject(value)
    }
  }
  
  return sanitized
}

// ============================================================================
// Zod Schema Validators (增强的验证器)
// ============================================================================

/**
 * 安全的字符串验证器
 * - 限制长度
 * - 清理输入
 */
export const safeString = (maxLength: number = 1000) =>
  z.string()
    .transform(sanitizeInput)
    .pipe(z.string().max(maxLength, `字符串长度不能超过${maxLength}`))

/**
 * 安全的URL验证器
 * - 验证URL格式
 * - 只允许http/https
 * - 清理危险协议
 */
export const safeURL = z.string()
  .url('无效的URL格式')
  .refine(
    (url) => {
      const sanitized = sanitizeURL(url)
      return sanitized !== null
    },
    { message: '不允许的URL协议' }
  )
  .transform((url) => sanitizeURL(url) || '')

/**
 * 安全的邮箱验证器
 */
export const safeEmail = z.string()
  .email('无效的邮箱格式')
  .max(255, '邮箱长度不能超过255个字符')
  .transform((email) => email.toLowerCase().trim())

/**
 * 安全的文本数组验证器
 */
export const safeStringArray = (maxItems: number = 100, maxLength: number = 500) =>
  z.array(
    z.string()
      .max(maxLength, `每项长度不能超过${maxLength}`)
      .transform(sanitizeInput)
  )
  .max(maxItems, `数组项数不能超过${maxItems}`)

// ============================================================================
// Agent提交表单验证Schema (增强版)
// ============================================================================

/**
 * Agent提交请求的安全验证Schema
 */
export const SafeAgentSubmissionSchema = z.object({
  url: safeURL,
  email: z.union([
    safeEmail,
    z.literal('')
  ]).optional(),
  notes: safeString(1000).optional()
})

export type SafeAgentSubmission = z.infer<typeof SafeAgentSubmissionSchema>

/**
 * Agent数据的安全验证Schema
 */
export const SafeAgentDataSchema = z.object({
  name: z.string().min(1, 'Agent名称不能为空').transform(sanitizeInput).pipe(z.string().max(200)),
  short_description: z.string().min(10, '简短描述至少需要10个字符').transform(sanitizeInput).pipe(z.string().max(500)),
  detailed_description: z.string().transform(sanitizeInput).pipe(z.string().max(5000)).optional(),
  key_features: z.array(z.string().transform(sanitizeInput).pipe(z.string().max(500))).min(1, '至少需要一个核心功能').max(20),
  use_cases: z.array(z.string().transform(sanitizeInput).pipe(z.string().max(500))).max(20).optional().default([]),
  pros: z.array(z.string().transform(sanitizeInput).pipe(z.string().max(500))).max(20).optional().default([]),
  cons: z.array(z.string().transform(sanitizeInput).pipe(z.string().max(500))).max(20).optional().default([]),
  platform: z.string().transform(sanitizeInput).pipe(z.string().max(100)).optional(),
  pricing: z.string().transform(sanitizeInput).pipe(z.string().max(200)).optional(),
  category: z.string().transform(sanitizeInput).pipe(z.string().max(100)).optional(),
  keywords: z.array(z.string().transform(sanitizeInput).pipe(z.string().max(100))).max(50).optional().default([]),
  how_to_use: z.string().transform(sanitizeInput).pipe(z.string().max(2000)).optional()
})

export type SafeAgentData = z.infer<typeof SafeAgentDataSchema>

// ============================================================================
// CSRF Protection Helpers
// ============================================================================

/**
 * 生成CSRF令牌
 * 
 * @returns 随机生成的CSRF令牌
 */
export function generateCSRFToken(): string {
  const array = new Uint8Array(32)
  crypto.getRandomValues(array)
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('')
}

/**
 * 验证CSRF令牌
 * 
 * @param token - 需要验证的令牌
 * @param expectedToken - 期望的令牌
 * @returns 是否匹配
 */
export function verifyCSRFToken(token: string, expectedToken: string): boolean {
  if (!token || !expectedToken) return false
  return token === expectedToken
}

// ============================================================================
// Content Security Policy Helpers
// ============================================================================

/**
 * CSP指令配置
 */
export interface CSPDirectives {
  'default-src'?: string[]
  'script-src'?: string[]
  'style-src'?: string[]
  'img-src'?: string[]
  'font-src'?: string[]
  'connect-src'?: string[]
  'frame-src'?: string[]
  'object-src'?: string[]
  'base-uri'?: string[]
  'form-action'?: string[]
  'frame-ancestors'?: string[]
  'upgrade-insecure-requests'?: boolean
}

/**
 * 生成CSP头部字符串
 * 
 * @param directives - CSP指令配置
 * @returns CSP头部字符串
 */
export function generateCSPHeader(directives: CSPDirectives): string {
  const parts: string[] = []
  
  for (const [key, value] of Object.entries(directives)) {
    if (value === true) {
      parts.push(key)
    } else if (Array.isArray(value) && value.length > 0) {
      parts.push(`${key} ${value.join(' ')}`)
    }
  }
  
  return parts.join('; ')
}

/**
 * 默认的CSP配置（适用于本项目）
 */
export const DEFAULT_CSP_DIRECTIVES: CSPDirectives = {
  'default-src': ["'self'"],
  'script-src': ["'self'", "'unsafe-eval'", "'unsafe-inline'"],
  'style-src': ["'self'", "'unsafe-inline'"],
  'img-src': ["'self'", 'data:', 'https:', 'blob:'],
  'font-src': ["'self'", 'data:'],
  'connect-src': ["'self'", 'https://api.openai.com', 'https://*.supabase.co'],
  'frame-src': ["'none'"],
  'object-src': ["'none'"],
  'base-uri': ["'self'"],
  'form-action': ["'self'"],
  'frame-ancestors': ["'none'"],
  'upgrade-insecure-requests': true
}

// ============================================================================
// Security Headers
// ============================================================================

/**
 * 安全响应头配置
 */
export interface SecurityHeaders {
  'X-Frame-Options'?: string
  'X-Content-Type-Options'?: string
  'X-XSS-Protection'?: string
  'Referrer-Policy'?: string
  'Permissions-Policy'?: string
  'Strict-Transport-Security'?: string
}

/**
 * 默认的安全响应头
 */
export const DEFAULT_SECURITY_HEADERS: SecurityHeaders = {
  'X-Frame-Options': 'DENY',
  'X-Content-Type-Options': 'nosniff',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains'
}

/**
 * 将安全头部对象转换为Headers对象
 * 
 * @param headers - 安全头部配置
 * @returns Headers对象
 */
export function createSecurityHeaders(headers: SecurityHeaders = DEFAULT_SECURITY_HEADERS): Headers {
  const headersObj = new Headers()
  
  for (const [key, value] of Object.entries(headers)) {
    if (value) {
      headersObj.set(key, value)
    }
  }
  
  return headersObj
}

// ============================================================================
// Input Validation Helpers
// ============================================================================

/**
 * 验证字符串是否只包含安全字符
 * 
 * @param input - 需要验证的字符串
 * @param allowedPattern - 允许的字符模式（正则表达式）
 * @returns 是否安全
 */
export function isSafeString(input: string, allowedPattern?: RegExp): boolean {
  if (!input) return true
  
  // 默认允许字母、数字、空格和常见标点
  const pattern = allowedPattern || /^[a-zA-Z0-9\s\u4e00-\u9fa5.,!?;:()\-_'"]+$/
  
  return pattern.test(input)
}

/**
 * 验证并清理文件名
 * 
 * @param filename - 文件名
 * @returns 清理后的安全文件名
 */
export function sanitizeFilename(filename: string): string {
  if (!filename) return ''
  
  // 移除路径分隔符和特殊字符
  let cleaned = filename.replace(/[\/\\]/g, '')
  cleaned = cleaned.replace(/[<>:"|?*]/g, '')
  
  // 限制长度
  if (cleaned.length > 255) {
    const ext = cleaned.split('.').pop()
    const name = cleaned.substring(0, 250 - (ext?.length || 0))
    cleaned = ext ? `${name}.${ext}` : name
  }
  
  return cleaned
}

/**
 * 验证数字是否在安全范围内
 * 
 * @param value - 需要验证的数字
 * @param min - 最小值
 * @param max - 最大值
 * @returns 是否在范围内
 */
export function isNumberInRange(value: number, min: number, max: number): boolean {
  return !isNaN(value) && value >= min && value <= max
}
