/**
 * SaaS Scanner - Track B 网站扫描器
 * 使用 Playwright 抓取 SaaS 网站并提取评分指标
 * Requirements: 3.1-3.8
 */

import {
  SaaSScanResult,
  SOCIAL_DOMAINS,
  INTEGRATION_KEYWORDS
} from '@/lib/types/scanner'

// ============================================
// 常量定义
// ============================================

/**
 * API 文档路径模式
 */
export const API_DOCS_PATHS = ['/docs', '/api', '/developers', '/documentation', '/api-docs'] as const

/**
 * 登录按钮关键词
 */
export const LOGIN_KEYWORDS = ['login', 'sign in', 'signin', 'log in', 'get started', 'sign up', 'signup'] as const

// ============================================
// 辅助函数 - 可独立测试
// ============================================

/**
 * 验证 HTTPS URL
 * Requirements: 3.1
 */
export function isHttpsUrl(url: string): boolean {
  try {
    const parsed = new URL(url)
    return parsed.protocol === 'https:'
  } catch {
    return false
  }
}

/**
 * 从 HTML 中提取社交链接
 * Requirements: 3.2
 */
export function extractSocialLinks(html: string): string[] {
  const links: string[] = []
  
  // 匹配 href 属性中的 URL
  const hrefRegex = /href=["']([^"']+)["']/gi
  let match
  
  while ((match = hrefRegex.exec(html)) !== null) {
    const url = match[1]
    for (const domain of SOCIAL_DOMAINS) {
      if (url.includes(domain)) {
        links.push(url)
        break
      }
    }
  }
  
  // 去重
  return [...new Set(links)]
}

/**
 * 检测 JSON-LD 结构化数据
 * Requirements: 3.3
 */
export function detectJsonLd(html: string): { hasJsonLd: boolean; content: object | null } {
  const jsonLdRegex = /<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi
  const match = jsonLdRegex.exec(html)
  
  if (!match) {
    return { hasJsonLd: false, content: null }
  }
  
  try {
    const content = JSON.parse(match[1].trim())
    return { hasJsonLd: true, content }
  } catch {
    return { hasJsonLd: false, content: null }
  }
}

/**
 * 提取 Meta 标签
 * Requirements: 3.4
 */
export function extractMetaTags(html: string): {
  title: string | null
  description: string | null
  hasH1: boolean
} {
  // 提取 title
  const titleMatch = /<title[^>]*>([^<]*)<\/title>/i.exec(html)
  const title = titleMatch ? titleMatch[1].trim() : null
  
  // 提取 meta description
  const descMatch = /<meta[^>]*name=["']description["'][^>]*content=["']([^"']*)["']/i.exec(html)
    || /<meta[^>]*content=["']([^"']*)["'][^>]*name=["']description["']/i.exec(html)
  const description = descMatch ? descMatch[1].trim() : null
  
  // 检测 H1
  const hasH1 = /<h1[^>]*>[^<]+<\/h1>/i.test(html)
  
  return { title, description, hasH1 }
}

/**
 * 提取 Open Graph 标签
 * Requirements: 3.5
 */
export function extractOgTags(html: string): {
  hasOgTags: boolean
  ogImage: string | null
  ogTitle: string | null
} {
  // 提取 og:image
  const ogImageMatch = /<meta[^>]*property=["']og:image["'][^>]*content=["']([^"']*)["']/i.exec(html)
    || /<meta[^>]*content=["']([^"']*)["'][^>]*property=["']og:image["']/i.exec(html)
  const ogImage = ogImageMatch ? ogImageMatch[1].trim() : null
  
  // 提取 og:title
  const ogTitleMatch = /<meta[^>]*property=["']og:title["'][^>]*content=["']([^"']*)["']/i.exec(html)
    || /<meta[^>]*content=["']([^"']*)["'][^>]*property=["']og:title["']/i.exec(html)
  const ogTitle = ogTitleMatch ? ogTitleMatch[1].trim() : null
  
  const hasOgTags = !!(ogImage && ogTitle)
  
  return { hasOgTags, ogImage, ogTitle }
}

/**
 * 检测 API 文档路径
 * Requirements: 3.6
 */
export function detectApiDocsPath(html: string, baseUrl: string): {
  hasApiDocsPath: boolean
  apiDocsUrl: string | null
} {
  const hrefRegex = /href=["']([^"']+)["']/gi
  let match
  
  while ((match = hrefRegex.exec(html)) !== null) {
    const href = match[1]
    for (const path of API_DOCS_PATHS) {
      if (href.includes(path)) {
        // 构建完整 URL
        try {
          const fullUrl = href.startsWith('http') ? href : new URL(href, baseUrl).href
          return { hasApiDocsPath: true, apiDocsUrl: fullUrl }
        } catch {
          return { hasApiDocsPath: true, apiDocsUrl: href }
        }
      }
    }
  }
  
  return { hasApiDocsPath: false, apiDocsUrl: null }
}

/**
 * 检测集成关键词
 * Requirements: 3.7
 */
export function detectIntegrationKeywords(content: string): {
  hasIntegrationKeywords: boolean
  keywords: string[]
} {
  const lowerContent = content.toLowerCase()
  const foundKeywords: string[] = []
  
  for (const keyword of INTEGRATION_KEYWORDS) {
    if (lowerContent.includes(keyword.toLowerCase())) {
      foundKeywords.push(keyword)
    }
  }
  
  return {
    hasIntegrationKeywords: foundKeywords.length > 0,
    keywords: foundKeywords
  }
}

/**
 * 检测登录按钮
 */
export function detectLoginButton(html: string): boolean {
  const lowerHtml = html.toLowerCase()
  
  for (const keyword of LOGIN_KEYWORDS) {
    // 检查按钮或链接中是否包含登录关键词
    const buttonRegex = new RegExp(`<(button|a)[^>]*>[^<]*${keyword}[^<]*</(button|a)>`, 'i')
    if (buttonRegex.test(lowerHtml)) {
      return true
    }
  }
  
  return false
}


// ============================================
// 创建默认扫描结果
// ============================================

/**
 * 创建默认的 SaaS 扫描结果
 */
export function createDefaultSaaSScanResult(): SaaSScanResult {
  return {
    httpsValid: false,
    sslValidMonths: 0,
    socialLinks: [],
    hasJsonLd: false,
    jsonLdContent: null,
    hasBasicMeta: false,
    metaTitle: null,
    metaDescription: null,
    hasH1: false,
    hasOgTags: false,
    ogImage: null,
    ogTitle: null,
    hasApiDocsPath: false,
    apiDocsUrl: null,
    hasIntegrationKeywords: false,
    integrationKeywords: [],
    hasLoginButton: false,
    pageContent: ''
  }
}

// ============================================
// 从 HTML 解析扫描结果
// ============================================

/**
 * 从 HTML 内容解析 SaaS 扫描结果
 * 这是一个纯函数，便于测试
 */
export function parseSaaSScanResult(
  html: string,
  url: string,
  httpsValid: boolean = true,
  sslValidMonths: number = 12
): SaaSScanResult {
  const socialLinks = extractSocialLinks(html)
  const { hasJsonLd, content: jsonLdContent } = detectJsonLd(html)
  const { title, description, hasH1 } = extractMetaTags(html)
  const { hasOgTags, ogImage, ogTitle } = extractOgTags(html)
  const { hasApiDocsPath, apiDocsUrl } = detectApiDocsPath(html, url)
  const { hasIntegrationKeywords, keywords } = detectIntegrationKeywords(html)
  const hasLoginButton = detectLoginButton(html)
  
  // 判断基础 Meta 是否完整
  const hasBasicMeta = !!(title && description && hasH1)
  
  return {
    httpsValid,
    sslValidMonths,
    socialLinks,
    hasJsonLd,
    jsonLdContent,
    hasBasicMeta,
    metaTitle: title,
    metaDescription: description,
    hasH1,
    hasOgTags,
    ogImage,
    ogTitle,
    hasApiDocsPath,
    apiDocsUrl,
    hasIntegrationKeywords,
    integrationKeywords: keywords,
    hasLoginButton,
    pageContent: html
  }
}

// ============================================
// Playwright 扫描器 (实际网络请求)
// ============================================

/**
 * 使用 Playwright 扫描 SaaS 网站
 * 注意: 此函数需要 Playwright 运行时环境
 * Requirements: 3.1-3.8
 * 
 * @param url 要扫描的 URL
 * @returns SaaS 扫描结果
 */
export async function scanSaaSWebsite(url: string): Promise<SaaSScanResult> {
  // 验证 HTTPS
  const httpsValid = isHttpsUrl(url)
  
  // 动态导入 Playwright (仅在服务端使用)
  let html = ''
  let sslValidMonths = 0
  
  try {
    // 尝试使用 Playwright
    const { chromium } = await import('playwright')
    const browser = await chromium.launch({ headless: true })
    
    try {
      const context = await browser.newContext({
        userAgent: 'Mozilla/5.0 (compatible; AgentSignalsBot/1.0; +https://agentsignals.ai)'
      })
      const page = await context.newPage()
      
      // 设置超时
      page.setDefaultTimeout(10000)
      
      // 导航到页面
      const response = await page.goto(url, { waitUntil: 'networkidle' })
      
      // 检查 SSL 证书 (简化处理，假设有效期 12 个月)
      if (response && httpsValid) {
        sslValidMonths = 12
      }
      
      // 获取页面 HTML
      html = await page.content()
      
      await context.close()
    } finally {
      await browser.close()
    }
  } catch (error) {
    // Playwright 不可用时，使用 fetch 作为后备
    console.warn('Playwright not available, falling back to fetch:', error)
    
    try {
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; AgentSignalsBot/1.0; +https://agentsignals.ai)'
        }
      })
      html = await response.text()
      sslValidMonths = httpsValid ? 12 : 0
    } catch (fetchError) {
      console.error('Failed to fetch URL:', fetchError)
      return createDefaultSaaSScanResult()
    }
  }
  
  return parseSaaSScanResult(html, url, httpsValid, sslValidMonths)
}
