// URL分析服务
import { chromium, Browser, Page } from 'playwright';
import OpenAI from 'openai';
import { z } from 'zod';

// 初始化OpenAI客户端
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  baseURL: 'https://openrouter.ai/api/v1',
  dangerouslyAllowBrowser: true
});

// AI分析结果的Zod schema
const AIAnalysisSchema = z.object({
  name: z.string().min(1),
  description: z.string().min(1),
  features: z.array(z.string()).nonempty(),
  useCases: z.array(z.string()).nonempty(),
  strengths: z.array(z.string()).nonempty(),
  weaknesses: z.array(z.string()).nonempty(),
  category: z.string().min(1)
});

/**
 * 验证和清理URL
 * @param url - 输入的URL字符串
 * @returns 清理后的URL或null（如果验证失败）
 */
export function validateURL(url: string): string | null {
  try {
    // 尝试解析URL
    const parsedUrl = new URL(url);
    
    // 只允许http/https协议
    if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
      return null;
    }
    
    // 清理URL：移除片段标识符、统一协议、规范化路径
    const cleanedUrl = new URL(parsedUrl.href);
    cleanedUrl.hash = ''; // 移除片段标识符
    
    return cleanedUrl.href;
  } catch (error) {
    // 如果URL格式无效，返回null
    return null;
  }
}

/**
 * 规范化URL
 * @param url - 输入的URL字符串
 * @returns 规范化后的URL或null
 */
export function normalizeURL(url: string): string | null {
  const validUrl = validateURL(url);
  if (!validUrl) {
    return null;
  }
  
  const parsedUrl = new URL(validUrl);
  
  // 统一协议为https（如果可能）
  if (parsedUrl.protocol === 'http:') {
    parsedUrl.protocol = 'https:';
  }
  
  // 移除尾部斜杠（根路径除外）
  if (parsedUrl.pathname.endsWith('/') && parsedUrl.pathname !== '/') {
    parsedUrl.pathname = parsedUrl.pathname.slice(0, -1);
  }
  
  // 确保根路径不返回斜杠
  if (parsedUrl.pathname === '/' && parsedUrl.href.endsWith('/')) {
    return parsedUrl.href.slice(0, -1);
  }
  
  // 移除查询参数（可选）
  // parsedUrl.search = '';
  
  return parsedUrl.href;
}

/**
 * 网页抓取结果
 */
export interface CrawlResult {
  url: string;
  html: string;
  status: number;
  title?: string;
  metaDescription?: string;
}

/**
 * 使用Playwright抓取网页
 * @param url - 要抓取的URL
 * @param timeout - 超时时间（毫秒）
 * @returns 抓取结果或错误信息
 */
export async function crawlPage(url: string, timeout: number = 30000): Promise<CrawlResult | null> {
  let browser: Browser | null = null;
  let page: Page | null = null;
  
  try {
    // 验证URL
    const validUrl = validateURL(url);
    if (!validUrl) {
      throw new Error('Invalid URL');
    }
    
    // 启动浏览器
    browser = await chromium.launch({ headless: true });
    page = await browser.newPage();
    
    // 设置超时
    await page.setDefaultTimeout(timeout);
    
    // 导航到页面
    const response = await page.goto(validUrl);
    if (!response) {
      throw new Error('No response from server');
    }
    
    // 等待页面加载完成
    await page.waitForLoadState('networkidle');
    
    // 获取页面内容
    const html = await page.content();
    const title = await page.title();
    const metaDescription = await page.$eval('meta[name="description"]', el => el.getAttribute('content'));
    
    return {
      url: validUrl,
      html,
      status: response.status(),
      title,
      metaDescription
    };
  } catch (error) {
    console.error('Crawl failed:', error);
    return null;
  } finally {
    // 关闭浏览器
    if (page) await page.close();
    if (browser) await browser.close();
  }
}

/**
 * HTML解析结果
 */
export interface ParseResult {
  title: string;
  metaDescription: string;
  content: string;
  keywords: string[];
}

/**
 * 解析HTML内容
 * @param html - 要解析的HTML字符串
 * @returns 解析结果
 */
export function parseHTML(html: string): ParseResult | null {
  try {
    // 创建一个临时DOM解析器
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    
    // 提取title
    const title = doc.title || '';
    
    // 提取meta description
    const metaDescription = doc.querySelector('meta[name="description"]')?.getAttribute('content') || '';
    
    // 提取meta keywords
    const metaKeywords = doc.querySelector('meta[name="keywords"]')?.getAttribute('content') || '';
    const keywords = metaKeywords.split(',').map(keyword => keyword.trim()).filter(Boolean);
    
    // 提取主要内容（尝试常见的内容选择器）
    let content = '';
    const contentSelectors = [
      'article',
      '#content',
      '.content',
      'main',
      'body'
    ];
    
    for (const selector of contentSelectors) {
      const element = doc.querySelector(selector);
      if (element) {
        content = element.textContent || '';
        break;
      }
    }
    
    // 清理和格式化文本
    const cleanedContent = content
      .replace(/\s+/g, ' ') // 替换多个空格为单个空格
      .trim(); // 修剪前后空格
    
    return {
      title,
      metaDescription,
      content: cleanedContent,
      keywords
    };
  } catch (error) {
    console.error('HTML parsing failed:', error);
    return null;
  }
}

/**
 * AI分析结果
 */
export interface AIAnalysisResult {
  name: string;
  description: string;
  features: string[];
  useCases: string[];
  strengths: string[];
  weaknesses: string[];
  category: string;
}

/**
 * 使用OpenRouter API进行AI分析
 * @param html - 要分析的HTML内容
 * @param url - 原始URL
 * @returns AI分析结果
 */
export async function analyzeWithAI(html: string, url: string): Promise<AIAnalysisResult | null> {
  try {
    // 解析HTML获取基本信息
    const parseResult = parseHTML(html);
    if (!parseResult) {
      throw new Error('Failed to parse HTML');
    }
    
    // 构建提示词
    const prompt = `
    分析以下网页内容，提取关于AI Agent的结构化信息：
    
    网页URL: ${url}
    网页标题: ${parseResult.title}
    网页描述: ${parseResult.metaDescription}
    主要内容: ${parseResult.content.substring(0, 2000)} // 限制内容长度
    
    请按照以下格式返回JSON：
    {
      "name": "Agent名称",
      "description": "Agent的详细描述",
      "features": ["特性1", "特性2", "特性3"],
      "useCases": ["使用场景1", "使用场景2", "使用场景3"],
      "strengths": ["优点1", "优点2", "优点3"],
      "weaknesses": ["缺点1", "缺点2", "缺点3"],
      "category": "分类（如：生产力、创意、教育等）"
    }
    `;
    
    // 调用OpenRouter API
    const response = await openai.chat.completions.create({
      model: 'qwen/qwen-2-72b-instruct',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
      max_tokens: 2000
    });
    
    // 解析响应
    const result = response.choices[0]?.message?.content;
    if (!result) {
      throw new Error('No AI analysis result');
    }
    
    // 提取JSON部分（去除可能的markdown格式）
    const jsonMatch = result.match(/```json\n(.*)\n```/s);
    const jsonContent = jsonMatch ? jsonMatch[1] : result;
    
    // 解析JSON
    const analysis = JSON.parse(jsonContent) as AIAnalysisResult;
    
    // 使用Zod验证数据
    const validatedAnalysis = AIAnalysisSchema.parse(analysis);
    
    return validatedAnalysis;
  } catch (error) {
    console.error('AI analysis failed:', error);
    return null;
  }
}
