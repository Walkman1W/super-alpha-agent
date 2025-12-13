import { load } from 'cheerio';

// HTML解析结果
interface HTMLParseResult {
  title: string;
  meta: Record<string, string>;
  content: string;
  cleanContent: string;
}

export function parseHTML(html: string): HTMLParseResult {
  const $ = load(html);

  // 提取title
  const title = $('title').text().trim() || '';

  // 提取meta标签
  const meta: Record<string, string> = {};
  $('meta').each((_, el) => {
    const name = $(el).attr('name') || $(el).attr('property') || $(el).attr('http-equiv') || '';
    const content = $(el).attr('content') || '';
    if (name && content) {
      meta[name.toLowerCase()] = content;
    }
  });

  // 提取主要内容
  let content = '';
  // 尝试提取常见的内容容器
  const contentSelectors = [
    'article',
    'main',
    '.content',
    '.post-content',
    '#content',
    'body'
  ];

  for (const selector of contentSelectors) {
    const el = $(selector).first();
    if (el.length) {
      content = el.text().trim();
      break;
    }
  }

  // 清理和格式化文本
  const cleanContent = content
    .replace(/\s+/g, ' ') // 替换多个空白字符为单个空格
    .trim();

  return {
    title,
    meta,
    content,
    cleanContent
  };
}
