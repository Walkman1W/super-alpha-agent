import OpenAI from 'openai'

export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  baseURL: process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1',
})

// OpenRouter API 客户端 (qwen模型)
export const openrouter = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  baseURL: 'https://openrouter.ai/api/v1',
})

// AI 分析 Agent 信息 (OpenAI)
export async function analyzeAgent(rawData: {
  name: string
  description?: string
  url?: string
  platform?: string
}) {
  const prompt = `
分析这个 AI Agent 并提取结构化信息：

名称: ${rawData.name}
描述: ${rawData.description || '无'}
平台: ${rawData.platform || '未知'}
链接: ${rawData.url || '无'}

请返回 JSON 格式（必须是有效的 JSON）：
{
  "category": "分类（从以下选择：开发工具/内容创作/数据分析/设计/营销/客服/教育/研究/生产力/其他）",
  "short_description": "一句话描述（20-50字）",
  "detailed_description": "详细介绍（100-200字）",
  "key_features": ["核心功能1", "核心功能2", "核心功能3"],
  "use_cases": ["适用场景1", "适用场景2", "适用场景3"],
  "pros": ["优点1", "优点2", "优点3"],
  "cons": ["缺点1", "缺点2"],
  "how_to_use": "使用方法（步骤说明，50-100字）",
  "best_for": "最适合的用户类型",
  "pricing": "免费/付费/Freemium",
  "keywords": ["关键词1", "关键词2", "关键词3"],
  "search_terms": ["常见搜索词1", "常见搜索词2"]
}

要求：
1. 客观准确
2. 适合 AI 搜索引擎阅读
3. 突出核心价值
4. 如果信息不足，合理推测但标注"推测"
`

  try {
    const model = process.env.OPENAI_MODEL || 'gpt-4-turbo-preview'
    const response = await openai.chat.completions.create({
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
      temperature: 0.7,
    })

    const content = response.choices[0].message.content
    if (!content) throw new Error('No response from OpenAI')

    return JSON.parse(content)
  } catch (error) {
    console.error('OpenAI analysis error:', error)
    throw error
  }
}

// AI 分析 Agent 信息 (OpenRouter qwen模型，带重试逻辑)
export async function analyzeAgentWithQwen(rawData: {
  name: string
  description?: string
  url?: string
  platform?: string
  htmlContent?: string
}, maxRetries: number = 3): Promise<any> {
  const prompt = `
分析这个 AI Agent 并提取结构化信息：

名称: ${rawData.name}
描述: ${rawData.description || '无'}
平台: ${rawData.platform || '未知'}
链接: ${rawData.url || '无'}
网页内容摘要: ${rawData.htmlContent || '无'}

请返回 JSON 格式（必须是有效的 JSON）：
{
  "category": "分类（从以下选择：开发工具/内容创作/数据分析/设计/营销/客服/教育/研究/生产力/其他）",
  "short_description": "一句话描述（20-50字）",
  "detailed_description": "详细介绍（100-200字）",
  "key_features": ["核心功能1", "核心功能2", "核心功能3"],
  "use_cases": ["适用场景1", "适用场景2", "适用场景3"],
  "pros": ["优点1", "优点2", "优点3"],
  "cons": ["缺点1", "缺点2"],
  "how_to_use": "使用方法（步骤说明，50-100字）",
  "best_for": "最适合的用户类型",
  "pricing": "免费/付费/Freemium",
  "keywords": ["关键词1", "关键词2", "关键词3"],
  "search_terms": ["常见搜索词1", "常见搜索词2"]
}

要求：
1. 客观准确
2. 适合 AI 搜索引擎阅读
3. 突出核心价值
4. 如果信息不足，合理推测但标注"推测"
`

  let retryCount = 0
  while (retryCount < maxRetries) {
    try {
      const response = await openrouter.chat.completions.create({
        model: 'qwen/qwen-max',
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
      if (!content) throw new Error('No response from OpenRouter')

      return JSON.parse(content)
    } catch (error) {
      retryCount++
      console.error(`OpenRouter analysis error (attempt ${retryCount} of ${maxRetries}):`, error)
      if (retryCount >= maxRetries) {
        throw new Error(`Failed to analyze agent after ${maxRetries} retries`)
      }
      // 重试前等待一段时间
      await new Promise(resolve => setTimeout(resolve, 1000 * retryCount))
    }
  }

  throw new Error('Max retries exceeded')
}

// 生成对比内容
export async function generateComparison(agents: Array<{
  name: string
  short_description: string
  key_features: string[]
  pros: string[]
  cons: string[]
  pricing: string | null
}>) {
  const prompt = `
对比以下 AI Agents：

${agents.map((a, i) => `
Agent ${i + 1}: ${a.name}
描述: ${a.short_description}
功能: ${a.key_features.join(', ')}
优点: ${a.pros.join(', ')}
缺点: ${a.cons.join(', ')}
定价: ${a.pricing || '未知'}
`).join('\n')}

生成一篇 600-800 字的对比分析文章，包括：

1. 概述（各自的定位）
2. 功能对比（使用 Markdown 表格）
3. 适用场景
4. 选择建议（什么情况选哪个）

要求：
- 使用 Markdown 格式
- 客观中立
- 结论明确
- 适合 AI 阅读和引用
- 包含清晰的表格对比
`

  try {
    const model = process.env.OPENAI_MODEL || 'gpt-4-turbo-preview'
    const response = await openai.chat.completions.create({
      model,
      messages: [
        {
          role: 'system',
          content: 'You are an expert at comparing AI agents. Write clear, structured comparisons in Markdown format.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.7,
    })

    return response.choices[0].message.content || ''
  } catch (error) {
    console.error('OpenAI comparison error:', error)
    throw error
  }
}
