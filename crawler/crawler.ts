import { chromium, Browser, Page } from 'playwright'
import { validateURL } from '../lib/utils'

/**
 * 网页抓取结果
 */
export interface CrawlResult {
  url: string
  html: string
  title?: string
  status: 'success' | 'error'
  error?: string
}

/**
 * 通用网页抓取工具
 * @需求: 6.1
 */
class WebCrawler {
  private browser?: Browser
  private page?: Page

  /**
   * 初始化浏览器
   */
  private async initBrowser() {
    if (!this.browser) {
      this.browser = await chromium.launch({ headless: true })
      this.page = await this.browser.newPage()
      
      // 设置超时
      this.page.setDefaultTimeout(30000)
      this.page.setDefaultNavigationTimeout(30000)
    }
  }

  /**
   * 关闭浏览器
   */
  private async closeBrowser() {
    if (this.browser) {
      await this.browser.close()
      this.browser = undefined
      this.page = undefined
    }
  }

  /**
   * 抓取网页内容
   * @param url 要抓取的URL
   * @returns 抓取结果
   */
  async crawl(url: string): Promise<CrawlResult> {
    // 验证URL
    const cleanedUrl = validateURL(url)
    if (!cleanedUrl) {
      return {
        url,
        html: '',
        status: 'error',
        error: 'Invalid URL or protocol (only http/https allowed)'
      }
    }

    try {
      await this.initBrowser()
      
      if (!this.page) {
        throw new Error('Browser not initialized')
      }

      // 访问页面
      await this.page.goto(cleanedUrl, { 
        waitUntil: 'networkidle',
        timeout: 30000 
      })

      // 提取页面标题
      const title = await this.page.title()

      // 提取HTML内容
      const html = await this.page.content()

      return {
        url: cleanedUrl,
        html,
        title,
        status: 'success'
      }
    } catch (error) {
      return {
        url: cleanedUrl || url,
        html: '',
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    } finally {
      await this.closeBrowser()
    }
  }
}

/**
 * 创建网页抓取实例
 */
export function createWebCrawler(): WebCrawler {
  return new WebCrawler()
}
