/**
 * URL Analysis Service
 * 
 * Provides functionality for:
 * - URL validation and sanitization
 * - Web page scraping using Playwright
 * - HTML parsing and content extraction
 * - AI-powered analysis for Agent data generation
 * - Data validation using Zod schemas
 */

import { z } from 'zod'
import { chromium, Browser, Page } from 'playwright'
import { openai } from './openai'

// ============================================================================
// URL Validation (Task 10.1)
// ============================================================================

/**
 * Result of URL validation
 */
export interface URLValidationResult {
  isValid: boolean
  url?: string
  error?: string
}

/**
 * Validates and sanitizes a URL string
 * - Only allows http and https protocols
 * - Normalizes the URL format
 * - Returns cleaned URL or error message
 * 
 * @param urlString - The URL string to validate
 * @returns URLValidationResult with validation status and cleaned URL or error
 */
export function validateURL(urlString: string): URLValidationResult {
  // Trim whitespace
  const trimmed = urlString.trim()
  
  // Check for empty input
  if (!trimmed) {
    return {
      isValid: false,
      error: 'URL不能为空'
    }
  }
  
  try {
    // Parse the URL
    const parsed = new URL(trimmed)
    
    // Only allow http and https protocols
    if (!['http:', 'https:'].includes(parsed.protocol)) {
      return {
        isValid: false,
        error: '只允许http或https协议'
      }
    }
    
    // Check for valid hostname
    if (!parsed.hostname || parsed.hostname.length === 0) {
      return {
        isValid: false,
        error: '无效的主机名'
      }
    }
    
    // Return normalized URL
    return {
      isValid: true,
      url: parsed.toString()
    }
  } catch {
    return {
      isValid: false,
      error: '无效的URL格式'
    }
  }
}

/**
 * Sanitizes a URL by removing potentially dangerous elements
 * and normalizing the format
 * 
 * @param url - The URL to sanitize
 * @returns Sanitized URL string
 */
export function sanitizeURL(url: string): string {
  const validation = validateURL(url)
  if (!validation.isValid || !validation.url) {
    throw new Error(validation.error || '无效的URL')
  }
  return validation.url
}


// ============================================================================
// Web Scraping (Task 10.3)
// ============================================================================

/**
 * Configuration for web scraping
 */
export interface ScrapingConfig {
  timeout?: number
  waitUntil?: 'load' | 'domcontentloaded' | 'networkidle'
}

/**
 * Result of web scraping operation
 */
export interface ScrapingResult {
  success: boolean
  html?: string
  url?: string
  error?: string
}

const DEFAULT_SCRAPING_CONFIG: ScrapingConfig = {
  timeout: 30000,
  waitUntil: 'networkidle'
}

/**
 * Scrapes a web page using Playwright
 * - Handles timeouts and errors gracefully
 * - Returns HTML content on success
 * 
 * @param url - The URL to scrape
 * @param config - Optional scraping configuration
 * @returns ScrapingResult with HTML content or error
 */
export async function scrapeWebPage(
  url: string,
  config: ScrapingConfig = {}
): Promise<ScrapingResult> {
  // Validate URL first
  const validation = validateURL(url)
  if (!validation.isValid || !validation.url) {
    return {
      success: false,
      error: validation.error || '无效的URL'
    }
  }
  
  const mergedConfig = { ...DEFAULT_SCRAPING_CONFIG, ...config }
  let browser: Browser | null = null
  
  try {
    browser = await chromium.launch({ headless: true })
    const page: Page = await browser.newPage()
    
    // Set a reasonable user agent
    await page.setExtraHTTPHeaders({
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    })
    
    // Navigate to the page
    await page.goto(validation.url, {
      timeout: mergedConfig.timeout,
      waitUntil: mergedConfig.waitUntil
    })
    
    // Get the HTML content
    const html = await page.content()
    
    return {
      success: true,
      html,
      url: validation.url
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    
    // Handle specific error types
    if (errorMessage.includes('Timeout') || errorMessage.includes('timeout')) {
      return {
        success: false,
        error: '页面加载超时，请检查URL是否正确'
      }
    }
    
    if (errorMessage.includes('net::ERR_NAME_NOT_RESOLVED')) {
      return {
        success: false,
        error: '无法访问该URL，请检查网址是否正确'
      }
    }
    
    if (errorMessage.includes('net::ERR_CONNECTION_REFUSED')) {
      return {
        success: false,
        error: '连接被拒绝，服务器可能不可用'
      }
    }
    
    if (errorMessage.includes('net::ERR_SSL')) {
      return {
        success: false,
        error: 'SSL证书问题，请检查网站安全性'
      }
    }
    
    return {
      success: false,
      error: `抓取页面时发生错误: ${errorMessage}`
    }
  } finally {
    if (browser) {
      await browser.close()
    }
  }
}


// ============================================================================
// HTML Parsing (Task 10.5)
// ============================================================================

/**
 * Extracted content from HTML
 */
export interface ExtractedContent {
  title: string
  metaDescription: string
  metaKeywords: string[]
  ogTitle: string
  ogDescription: string
  ogImage: string
  headings: string[]
  mainContent: string
  links: string[]
}

/**
 * Parses HTML and extracts relevant content
 * - Extracts title, meta tags, Open Graph data
 * - Extracts headings and main content
 * - Cleans and formats text
 * 
 * @param html - The HTML string to parse
 * @returns ExtractedContent with parsed data
 */
export function parseHTML(html: string): ExtractedContent {
  // Helper function to extract content between tags
  const extractBetweenTags = (
    html: string,
    startTag: string,
    endTag: string
  ): string => {
    const startIndex = html.indexOf(startTag)
    if (startIndex === -1) return ''
    const contentStart = startIndex + startTag.length
    const endIndex = html.indexOf(endTag, contentStart)
    if (endIndex === -1) return ''
    return html.substring(contentStart, endIndex)
  }
  
  // Helper function to extract attribute value
  const extractAttribute = (
    tag: string,
    attribute: string
  ): string => {
    const patterns = [
      new RegExp(`${attribute}="([^"]*)"`, 'i'),
      new RegExp(`${attribute}='([^']*)'`, 'i'),
      new RegExp(`${attribute}=([^\\s>]*)`, 'i')
    ]
    
    for (const pattern of patterns) {
      const match = tag.match(pattern)
      if (match) return match[1]
    }
    return ''
  }
  
  // Helper function to clean text
  const cleanText = (text: string): string => {
    return text
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
      .replace(/<[^>]+>/g, ' ')
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/\s+/g, ' ')
      .trim()
  }
  
  // Extract title
  const titleMatch = html.match(/<title[^>]*>([^<]*)<\/title>/i)
  const title = titleMatch ? cleanText(titleMatch[1]) : ''
  
  // Extract meta description
  const metaDescMatch = html.match(
    /<meta[^>]*name=["']description["'][^>]*content=["']([^"']*)["'][^>]*>/i
  ) || html.match(
    /<meta[^>]*content=["']([^"']*)["'][^>]*name=["']description["'][^>]*>/i
  )
  const metaDescription = metaDescMatch ? cleanText(metaDescMatch[1]) : ''
  
  // Extract meta keywords
  const metaKeywordsMatch = html.match(
    /<meta[^>]*name=["']keywords["'][^>]*content=["']([^"']*)["'][^>]*>/i
  ) || html.match(
    /<meta[^>]*content=["']([^"']*)["'][^>]*name=["']keywords["'][^>]*>/i
  )
  const metaKeywords = metaKeywordsMatch
    ? metaKeywordsMatch[1].split(',').map(k => k.trim()).filter(Boolean)
    : []
  
  // Extract Open Graph data
  const ogTitleMatch = html.match(
    /<meta[^>]*property=["']og:title["'][^>]*content=["']([^"']*)["'][^>]*>/i
  ) || html.match(
    /<meta[^>]*content=["']([^"']*)["'][^>]*property=["']og:title["'][^>]*>/i
  )
  const ogTitle = ogTitleMatch ? cleanText(ogTitleMatch[1]) : ''
  
  const ogDescMatch = html.match(
    /<meta[^>]*property=["']og:description["'][^>]*content=["']([^"']*)["'][^>]*>/i
  ) || html.match(
    /<meta[^>]*content=["']([^"']*)["'][^>]*property=["']og:description["'][^>]*>/i
  )
  const ogDescription = ogDescMatch ? cleanText(ogDescMatch[1]) : ''
  
  const ogImageMatch = html.match(
    /<meta[^>]*property=["']og:image["'][^>]*content=["']([^"']*)["'][^>]*>/i
  ) || html.match(
    /<meta[^>]*content=["']([^"']*)["'][^>]*property=["']og:image["'][^>]*>/i
  )
  const ogImage = ogImageMatch ? ogImageMatch[1] : ''
  
  // Extract headings (h1-h3)
  const headingMatches = html.matchAll(/<h[1-3][^>]*>([^<]*)<\/h[1-3]>/gi)
  const headings: string[] = []
  for (const match of headingMatches) {
    const heading = cleanText(match[1])
    if (heading) headings.push(heading)
  }
  
  // Extract main content (body or main tag)
  let mainContent = ''
  const mainMatch = html.match(/<main[^>]*>([\s\S]*?)<\/main>/i)
  if (mainMatch) {
    mainContent = cleanText(mainMatch[1])
  } else {
    const bodyMatch = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i)
    if (bodyMatch) {
      mainContent = cleanText(bodyMatch[1])
    }
  }
  
  // Limit main content length
  if (mainContent.length > 5000) {
    mainContent = mainContent.substring(0, 5000) + '...'
  }
  
  // Extract links
  const linkMatches = html.matchAll(/<a[^>]*href=["']([^"']*)["'][^>]*>/gi)
  const links: string[] = []
  for (const match of linkMatches) {
    const href = match[1]
    if (href && !href.startsWith('#') && !href.startsWith('javascript:')) {
      links.push(href)
    }
  }
  
  return {
    title,
    metaDescription,
    metaKeywords,
    ogTitle,
    ogDescription,
    ogImage,
    headings,
    mainContent,
    links: [...new Set(links)].slice(0, 50) // Dedupe and limit
  }
}


// ============================================================================
// Data Validation Schema (Task 10.9)
// ============================================================================

import { SafeAgentDataSchema } from './security'

/**
 * Zod schema for validated Agent data (使用安全增强版本)
 */
export const AgentDataSchema = SafeAgentDataSchema

export type AgentData = z.infer<typeof AgentDataSchema>

/**
 * Result of data validation
 */
export interface ValidationResult {
  success: boolean
  data?: AgentData
  errors?: string[]
}

/**
 * Validates Agent data against the schema
 * 
 * @param data - The data to validate
 * @returns ValidationResult with validated data or errors
 */
export function validateAgentData(data: unknown): ValidationResult {
  const result = AgentDataSchema.safeParse(data)
  
  if (result.success) {
    return {
      success: true,
      data: result.data
    }
  }
  
  return {
    success: false,
    errors: result.error.errors.map(e => `${e.path.join('.')}: ${e.message}`)
  }
}

// ============================================================================
// AI Analysis Integration (Task 10.7)
// ============================================================================

/**
 * Result of AI analysis
 */
export interface AIAnalysisResult {
  success: boolean
  data?: AgentData
  error?: string
}

const AI_ANALYSIS_PROMPT = `
分析以下网页内容，提取AI Agent的结构化信息。

网页标题: {title}
网页描述: {description}
主要内容: {content}
页面标题列表: {headings}

请返回JSON格式（必须是有效的JSON）：
{
  "name": "Agent名称",
  "short_description": "一句话描述（20-50字）",
  "detailed_description": "详细介绍（100-200字）",
  "key_features": ["核心功能1", "核心功能2", "核心功能3"],
  "use_cases": ["适用场景1", "适用场景2", "适用场景3"],
  "pros": ["优点1", "优点2", "优点3"],
  "cons": ["缺点1", "缺点2"],
  "platform": "平台类型（Web/Desktop/Mobile/API等）",
  "pricing": "定价模式（免费/付费/Freemium）",
  "category": "分类（开发工具/内容创作/数据分析/设计/营销/客服/教育/研究/生产力/其他）",
  "keywords": ["关键词1", "关键词2", "关键词3"],
  "how_to_use": "使用方法简述"
}

要求：
1. 基于实际内容提取，不要编造
2. 如果某些信息无法确定，可以省略或标注"未知"
3. 描述要客观准确
4. 适合AI搜索引擎阅读
`

/**
 * Analyzes extracted content using AI to generate structured Agent data
 * - Uses OpenRouter API with qwen model
 * - Implements retry logic for resilience
 * 
 * @param content - The extracted content to analyze
 * @param maxRetries - Maximum number of retry attempts
 * @returns AIAnalysisResult with Agent data or error
 */
export async function analyzeWithAI(
  content: ExtractedContent,
  maxRetries: number = 3
): Promise<AIAnalysisResult> {
  const prompt = AI_ANALYSIS_PROMPT
    .replace('{title}', content.title || content.ogTitle || '未知')
    .replace('{description}', content.metaDescription || content.ogDescription || '无')
    .replace('{content}', content.mainContent.substring(0, 3000))
    .replace('{headings}', content.headings.join(', ') || '无')
  
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const model = process.env.OPENAI_MODEL || 'qwen/qwen-2.5-72b-instruct'
      
      const response = await openai.chat.completions.create(
        {
          model,
          messages: [
            {
              role: 'system',
              content: 'You are an AI agent analyst. Always respond with valid JSON only, no additional text.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          response_format: { type: 'json_object' },
          temperature: 0.7
        },
        {
          timeout: 60000
        }
      )
      
      const responseContent = response.choices[0].message.content
      if (!responseContent) {
        throw new Error('AI返回空响应')
      }
      
      // Parse AI response
      const parsed = JSON.parse(responseContent)
      
      // Validate the parsed data
      const validation = validateAgentData(parsed)
      if (!validation.success) {
        throw new Error(`数据验证失败: ${validation.errors?.join(', ')}`)
      }
      
      return {
        success: true,
        data: validation.data
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error)
      
      // If this is the last attempt, return the error
      if (attempt === maxRetries - 1) {
        return {
          success: false,
          error: `AI分析失败: ${errorMessage}`
        }
      }
      
      // Exponential backoff before retry
      const delay = 1000 * Math.pow(2, attempt)
      await new Promise(resolve => setTimeout(resolve, delay))
    }
  }
  
  return {
    success: false,
    error: 'AI分析失败：已达到最大重试次数'
  }
}


// ============================================================================
// Main Analysis Function
// ============================================================================

/**
 * Complete analysis result
 */
export interface AnalysisResult {
  success: boolean
  data?: AgentData & { source_url: string }
  error?: string
}

/**
 * Analyzes a URL to extract Agent information
 * - Validates and sanitizes the URL
 * - Scrapes the web page
 * - Parses HTML content
 * - Uses AI to generate structured data
 * - Validates the final result
 * 
 * @param url - The URL to analyze
 * @returns AnalysisResult with Agent data or error
 */
export async function analyzeURL(url: string): Promise<AnalysisResult> {
  // Step 1: Validate URL
  const urlValidation = validateURL(url)
  if (!urlValidation.isValid || !urlValidation.url) {
    return {
      success: false,
      error: urlValidation.error || '无效的URL'
    }
  }
  
  // Step 2: Scrape the web page
  const scrapingResult = await scrapeWebPage(urlValidation.url)
  if (!scrapingResult.success || !scrapingResult.html) {
    return {
      success: false,
      error: scrapingResult.error || '无法抓取页面内容'
    }
  }
  
  // Step 3: Parse HTML content
  const extractedContent = parseHTML(scrapingResult.html)
  
  // Check if we have enough content to analyze
  if (!extractedContent.title && !extractedContent.mainContent) {
    return {
      success: false,
      error: '页面内容不足，无法进行分析'
    }
  }
  
  // Step 4: AI analysis
  const aiResult = await analyzeWithAI(extractedContent)
  if (!aiResult.success || !aiResult.data) {
    return {
      success: false,
      error: aiResult.error || 'AI分析失败'
    }
  }
  
  // Step 5: Return validated result with source URL
  return {
    success: true,
    data: {
      ...aiResult.data,
      source_url: urlValidation.url
    }
  }
}
