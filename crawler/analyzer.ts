import { OpenAI } from 'openai'
import { ParseResult } from './parser'

// 配置OpenRouter客户端
const openrouter = new OpenAI({
  apiKey: process.env.OPENROUTER_API_KEY || process.env.OPENAI_API_KEY,
  baseURL: 'https://openrouter.ai/api/v1',
})

/**
 * AI分析结果
 */
export interface AIAnalysisResult {
  name: string
  category: string
  short_description: string
  detailed_description: string
  key_features: string[]
  use_cases: string[]
  pros: string[]
  cons: string[]
  how_to_use: string
  best_for: string
  pricing: string
  keywords: string[]
  search_terms: string[]
}

/**
 * 分析解析后的网页内容
 * @param parseResult HTML解析结果
 * @returns AI分析结果
 * @需求: 6.3
 */
export async function analyzeContent(parseResult: ParseResult): Promise<AIAnalysisResult | null> {
  if (!parseResult || !parseResult.content) {
    return null
  }

  const prompt = `
分析这个网页内容，提取关于AI Agent的结构化信息：

网页标题: ${parseResult.title}
网页URL: ${parseResult.url}
网页描述: ${parseResult.description || '无'}
网页关键词: ${parseResult.keywords || '无'}
主要内容: ${parseResult.content.substring(0, 5000)} // 限制内容长度以避免API错误

请返回 JSON 格式（必须是有效的 JSON）：
{
  "name": "Agent名称",
  "category": "分类（从以下选择：开发工具/内容创作/数据分析/设计/营销/客服/教育/研究/生产力/其他）",
  "short_description": "一句话描述（20-50字）",
  "detailed_description": "详细介绍（100-200字）",
  "key_features": ["核心功能1", "核心功能2", "核心功能3"],
  "use_cases": ["适用场景1", "适用场景2", "适用场景3"],
  "pros": ["优点1", "优点2", "优点3"],
  "cons": ["缺点1", "缺点2"],
  "how_to_use": "使用方法（步骤说明，50-100字）",
  "best_for": "最适合的用户类型",
  "pricing": "免费/付费/Freemium/未知",
  "keywords": ["关键词1", "关键词2", "关键词3"],
  "search_terms": ["常见搜索词1", "常见搜索词2"]
}

要求：
1. 客观准确
2. 适合 AI 搜索引擎阅读
3. 突出核心价值
4. 如果信息不足，合理推测但标注"推测"
5. 必须返回严格有效的JSON，不能有任何额外文本
`

  try {
    // 实现重试逻辑（最多3次尝试）
    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        const response = await openrouter.chat.completions.create({
          model: 'qwen/qwen-2-72b-instruct',
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
          temperature: 0.7,
        })

        const content = response.choices[0].message.content
        if (!content) throw new Error('No response from AI model')

        return JSON.parse(content)
      } catch (error) {
        if (attempt === 3) {
          // 最后一次尝试失败，抛出错误
          throw error
        }
        // 等待1秒后重试
        await new Promise(resolve => setTimeout(resolve, 1000))
      }
    }

    return null
  } catch (error) {
    console.error('AI分析错误:', error)
    return null
  }
}
