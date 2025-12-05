import * as cheerio from 'cheerio'
import { CrawlResult } from './crawler'

/**
 * HTML解析结果
 */
export interface ParseResult {
  title: string
  description?: string
  keywords?: string
  content: string
  url: string
}

/**
 * 解析HTML内容
 * @param crawlResult 网页抓取结果
 * @returns 解析后的结构化数据
 * @需求: 6.2
 */
export function parseHTML(crawlResult: CrawlResult): ParseResult | null {
  if (crawlResult.status !== 'success' || !crawlResult.html) {
    return null
  }

  try {
    // 使用cheerio解析HTML
    const $ = cheerio.load(crawlResult.html)

    // 提取标题
    const title = $('title').text() || crawlResult.title || ''

    // 提取元描述
    const description = $('meta[name="description"]').attr('content')

    // 提取关键词
    const keywords = $('meta[name="keywords"]').attr('content')

    // 提取主要内容（选择main标签或body标签）
    let content = ''
    const mainContent = $('main, [role="main"], .main-content, article').first()
    
    if (mainContent.length > 0) {
      content = mainContent.text().trim()
    } else {
      // 回退到body内容
      content = $('body').text().trim()
    }

    // 清理内容：移除多余空格和换行
    content = content.replace(/\s+/g, ' ')

    return {
      title,
      description,
      keywords,
      content,
      url: crawlResult.url
    }
  } catch (error) {
    console.error('HTML解析错误:', error)
    return null
  }
}
