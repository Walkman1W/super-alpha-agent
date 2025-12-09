/**
 * URL 检测器服务
 * 
 * 功能:
 * - URL 格式验证
 * - URL 类型检测 (GitHub / SaaS)
 * - GitHub owner/repo 提取
 * - URL 规范化
 * 
 * Requirements: 1.1, 1.2, 1.3
 */

import { URLDetectorResult, URLType } from '@/lib/types/scanner'

// ============================================
// 常量定义
// ============================================

/**
 * GitHub URL 正则表达式
 * 匹配格式: github.com/owner/repo
 * 支持 http/https，可选 www 前缀，可选尾部斜杠和路径
 */
const GITHUB_URL_PATTERN = /^https?:\/\/(?:www\.)?github\.com\/([a-zA-Z0-9](?:[a-zA-Z0-9]|-(?=[a-zA-Z0-9])){0,38})\/([a-zA-Z0-9._-]+)\/?.*$/i

/**
 * 有效的 URL 协议
 */
const VALID_PROTOCOLS = ['http:', 'https:']

// ============================================
// URL 验证函数
// ============================================

/**
 * 验证 URL 格式是否有效
 * 
 * @param url - 待验证的 URL 字符串
 * @returns 是否为有效 URL
 */
export function isValidURL(url: string): boolean {
  if (!url || typeof url !== 'string') {
    return false
  }

  const trimmed = url.trim()
  if (!trimmed) {
    return false
  }

  try {
    const parsed = new URL(trimmed)
    
    // 只允许 http 和 https 协议
    if (!VALID_PROTOCOLS.includes(parsed.protocol)) {
      return false
    }

    // 检查主机名是否存在
    if (!parsed.hostname || parsed.hostname.length === 0) {
      return false
    }

    // 检查主机名是否包含至少一个点（排除 localhost 等）
    // 但允许 localhost 用于开发测试
    if (!parsed.hostname.includes('.') && parsed.hostname !== 'localhost') {
      return false
    }

    return true
  } catch {
    return false
  }
}

// ============================================
// URL 规范化函数
// ============================================

/**
 * 规范化 URL
 * - 移除尾部斜杠
 * - 确保使用 https（如果原始是 http 且不是 localhost）
 * - 移除多余的路径参数（对于 GitHub URL）
 * 
 * @param url - 待规范化的 URL
 * @returns 规范化后的 URL
 */
export function normalizeURL(url: string): string {
  const trimmed = url.trim()
  
  try {
    const parsed = new URL(trimmed)
    
    // 对于非 localhost，升级到 https
    if (parsed.protocol === 'http:' && parsed.hostname !== 'localhost') {
      parsed.protocol = 'https:'
    }

    // 构建规范化 URL
    let normalized = `${parsed.protocol}//${parsed.hostname}`
    
    // 添加端口（如果不是默认端口）
    if (parsed.port) {
      normalized += `:${parsed.port}`
    }

    // 添加路径（移除所有尾部斜杠，包括根路径的斜杠）
    let pathname = parsed.pathname
    // 移除所有尾部斜杠
    while (pathname.endsWith('/') && pathname.length > 1) {
      pathname = pathname.slice(0, -1)
    }
    // 如果路径只是 "/"，则不添加
    if (pathname !== '/') {
      normalized += pathname
    }

    return normalized
  } catch {
    return trimmed
  }
}

// ============================================
// GitHub URL 检测函数
// ============================================

/**
 * 检测是否为 GitHub URL
 * 
 * @param url - 待检测的 URL
 * @returns 是否为 GitHub URL
 */
export function isGitHubURL(url: string): boolean {
  if (!url || typeof url !== 'string') {
    return false
  }

  const trimmed = url.trim()
  
  try {
    const parsed = new URL(trimmed)
    const hostname = parsed.hostname.toLowerCase()
    
    // 检查是否为 github.com 域名
    if (hostname !== 'github.com' && hostname !== 'www.github.com') {
      return false
    }

    // 检查路径是否包含 owner/repo 格式
    const pathParts = parsed.pathname.split('/').filter(Boolean)
    
    // 至少需要 owner 和 repo 两部分
    if (pathParts.length < 2) {
      return false
    }

    // 验证 owner 和 repo 格式
    const owner = pathParts[0]
    const repo = pathParts[1]

    // owner 不能是 GitHub 保留路径（不区分大小写）
    const reservedPaths = new Set([
      'settings', 'explore', 'topics', 'trending', 'collections',
      'events', 'sponsors', 'login', 'signup', 'pricing',
      'features', 'enterprise', 'team', 'marketplace', 'pulls',
      'issues', 'notifications', 'new', 'organizations', 'orgs',
      'about', 'security', 'contact', 'support', 'blog', 'apps',
      'codespaces', 'copilot', 'actions', 'packages', 'discussions'
    ])
    
    if (reservedPaths.has(owner.toLowerCase())) {
      return false
    }

    // 验证 owner 格式 (GitHub 用户名规则)
    const ownerPattern = /^[a-zA-Z0-9](?:[a-zA-Z0-9]|-(?=[a-zA-Z0-9])){0,38}$/
    if (!ownerPattern.test(owner)) {
      return false
    }

    // 验证 repo 格式
    const repoPattern = /^[a-zA-Z0-9._-]+$/
    if (!repoPattern.test(repo)) {
      return false
    }

    return true
  } catch {
    return false
  }
}

/**
 * 从 GitHub URL 提取 owner 和 repo
 * 
 * @param url - GitHub URL
 * @returns { owner, repo } 或 null
 */
export function extractGitHubInfo(url: string): { owner: string; repo: string } | null {
  if (!isGitHubURL(url)) {
    return null
  }

  try {
    const parsed = new URL(url.trim())
    const pathParts = parsed.pathname.split('/').filter(Boolean)

    if (pathParts.length < 2) {
      return null
    }

    const owner = pathParts[0]
    let repo = pathParts[1]

    // 移除 .git 后缀（如果存在）
    if (repo.endsWith('.git')) {
      repo = repo.slice(0, -4)
    }

    return { owner, repo }
  } catch {
    return null
  }
}

/**
 * 规范化 GitHub URL
 * 只保留 github.com/owner/repo 格式
 * 
 * @param url - GitHub URL
 * @returns 规范化的 GitHub URL
 */
export function normalizeGitHubURL(url: string): string {
  const info = extractGitHubInfo(url)
  if (!info) {
    return normalizeURL(url)
  }

  return `https://github.com/${info.owner}/${info.repo}`
}

// ============================================
// URL 类型检测函数
// ============================================

/**
 * 检测 URL 类型
 * 
 * @param url - 待检测的 URL
 * @returns URL 类型: 'github' | 'saas' | 'invalid'
 */
export function detectURLType(url: string): URLType {
  if (!isValidURL(url)) {
    return 'invalid'
  }

  if (isGitHubURL(url)) {
    return 'github'
  }

  return 'saas'
}

// ============================================
// 主检测函数
// ============================================

/**
 * URL 检测器主函数
 * 验证 URL 并检测其类型
 * 
 * @param url - 待检测的 URL 字符串
 * @returns URLDetectorResult
 */
export function detectURL(url: string): URLDetectorResult {
  // 空值检查
  if (!url || typeof url !== 'string') {
    return {
      type: 'invalid',
      normalizedUrl: ''
    }
  }

  const trimmed = url.trim()
  if (!trimmed) {
    return {
      type: 'invalid',
      normalizedUrl: ''
    }
  }

  // 验证 URL 格式
  if (!isValidURL(trimmed)) {
    return {
      type: 'invalid',
      normalizedUrl: ''
    }
  }

  // 检测 URL 类型
  const type = detectURLType(trimmed)

  // GitHub URL 处理
  if (type === 'github') {
    const githubInfo = extractGitHubInfo(trimmed)
    const normalizedUrl = normalizeGitHubURL(trimmed)

    return {
      type: 'github',
      normalizedUrl,
      githubOwner: githubInfo?.owner,
      githubRepo: githubInfo?.repo
    }
  }

  // SaaS URL 处理
  return {
    type: 'saas',
    normalizedUrl: normalizeURL(trimmed)
  }
}

// ============================================
// 导出接口
// ============================================

export interface IURLDetector {
  detect(url: string): URLDetectorResult
  isValid(url: string): boolean
  isGitHub(url: string): boolean
  normalize(url: string): string
  extractGitHubInfo(url: string): { owner: string; repo: string } | null
}

/**
 * URL 检测器类
 * 提供面向对象的接口
 */
export class URLDetector implements IURLDetector {
  detect(url: string): URLDetectorResult {
    return detectURL(url)
  }

  isValid(url: string): boolean {
    return isValidURL(url)
  }

  isGitHub(url: string): boolean {
    return isGitHubURL(url)
  }

  normalize(url: string): string {
    return normalizeURL(url)
  }

  extractGitHubInfo(url: string): { owner: string; repo: string } | null {
    return extractGitHubInfo(url)
  }
}

// 默认导出单例实例
export const urlDetector = new URLDetector()
