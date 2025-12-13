import { chromium, Browser, Page } from 'playwright';

// 网页抓取功能
interface CrawlResult {
  html: string;
  url: string;
  title: string;
  statusCode: number;
}

export async function crawlPage(url: string): Promise<CrawlResult | null> {
  let browser: Browser | null = null;
  let page: Page | null = null;

  try {
    // 启动浏览器
    browser = await chromium.launch({ headless: true });
    page = await browser.newPage();

    // 设置超时
    await page.setDefaultTimeout(30000);

    // 访问页面
    const response = await page.goto(url, { waitUntil: 'networkidle' });

    if (!response) {
      throw new Error('Failed to load page');
    }

    // 获取状态码
    const statusCode = response.status();

    if (statusCode >= 400) {
      throw new Error(`Page returned status code ${statusCode}`);
    }

    // 获取页面标题
    const title = await page.title();

    // 获取HTML内容
    const html = await page.content();

    return {
      html,
      url,
      title,
      statusCode
    };
  } catch (error) {
    console.error('Page crawl error:', error);
    return null;
  } finally {
    // 确保浏览器关闭
    if (page) {
      await page.close();
    }
    if (browser) {
      await browser.close();
    }
  }
}
