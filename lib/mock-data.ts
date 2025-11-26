// 虚拟数据生成器
export const mockAgents = [
  {
    id: '1',
    slug: 'chatgpt',
    name: 'ChatGPT',
    category_id: '1',
    short_description: 'OpenAI开发的强大对话AI助手，支持多种任务',
    detailed_description: 'ChatGPT是OpenAI开发的先进对话AI模型，基于GPT架构。它能够理解和生成自然语言，支持问答、写作、编程、分析等多种任务。ChatGPT具有强大的上下文理解能力，能够进行多轮对话，并提供准确、有用的回答。',
    key_features: ['自然语言对话', '多轮对话支持', '代码生成', '文本创作', '知识问答', '逻辑推理'],
    use_cases: ['内容创作', '编程辅助', '学习辅导', '问题解答', '创意头脑风暴', '翻译服务'],
    pros: ['对话质量高', '知识面广', '响应速度快', '支持多种语言', '持续更新优化'],
    cons: ['偶尔会有幻觉', '知识有时效性', '需要网络连接', '某些专业领域深度有限'],
    how_to_use: '访问chat.openai.com，注册账号后即可开始对话。可以选择不同的模型版本，如GPT-3.5或GPT-4。通过清晰的提示词获得更好的回答效果。',
    platform: 'Web, iOS, Android',
    pricing: '免费版+付费版($20/月)',
    official_url: 'https://chat.openai.com',
    keywords: ['AI对话', '聊天机器人', 'GPT', 'OpenAI', '自然语言处理'],
    search_terms: ['AI助手', '智能对话', '聊天AI', '文本生成'],
    view_count: 15420,
    favorite_count: 892,
    ai_search_count: 3250,
    source: 'openai',
    source_id: 'chatgpt',
    last_crawled_at: '2025-01-01T00:00:00Z',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2025-01-01T00:00:00Z'
  },
  {
    id: '2',
    slug: 'claude',
    name: 'Claude',
    category_id: '1',
    short_description: 'Anthropic开发的AI助手，以安全性和推理能力著称',
    detailed_description: 'Claude是Anthropic公司开发的AI助手，专注于安全、有用和无害的AI交互。它在长文本处理、推理分析和代码生成方面表现出色，特别适合需要深度思考的任务。',
    key_features: ['长文本处理', '推理分析', '代码生成', '安全对话', '多语言支持', '文档分析'],
    use_cases: ['长文档分析', '复杂推理', '编程项目', '学术研究', '创意写作', '数据分析'],
    pros: ['推理能力强', '安全性高', '长文本处理优秀', '代码质量高', '响应准确'],
    cons: ['响应速度相对较慢', '可用性受限', '价格较高', '某些功能有限制'],
    how_to_use: '访问claude.ai，注册并申请使用权限。支持网页版和API调用。提供清晰的任务描述可获得更好的结果。',
    platform: 'Web, API',
    pricing: '免费试用+付费版',
    official_url: 'https://claude.ai',
    keywords: ['Anthropic', 'Claude', 'AI助手', '安全AI', '推理'],
    search_terms: ['AI分析', '智能助手', '安全AI', '推理AI'],
    view_count: 12380,
    favorite_count: 756,
    ai_search_count: 2890,
    source: 'anthropic',
    source_id: 'claude',
    last_crawled_at: '2025-01-01T00:00:00Z',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2025-01-01T00:00:00Z'
  },
  {
    id: '3',
    slug: 'midjourney',
    name: 'Midjourney',
    category_id: '2',
    short_description: '领先的AI图像生成工具，艺术创作能力出众',
    detailed_description: 'Midjourney是专业的AI图像生成平台，以其艺术性和创意性著称。它能够根据文本描述生成高质量的图像，在艺术风格、细节处理和创意表达方面表现卓越。',
    key_features: ['文本到图像', '多种艺术风格', '高分辨率输出', '风格混合', '图像编辑', '社区分享'],
    use_cases: ['艺术创作', '概念设计', '插画制作', '广告创意', '游戏美术', '产品设计'],
    pros: ['艺术质量高', '风格多样', '社区活跃', '持续更新', '易于使用'],
    cons: ['需要Discord使用', '生成时间不稳定', '版权争议', '价格相对较高'],
    how_to_use: '通过Discord加入Midjourney服务器，使用/imagine命令生成图像。可以调整参数控制生成效果。',
    platform: 'Discord, Web',
    pricing: '订阅制($10-120/月)',
    official_url: 'https://www.midjourney.com',
    keywords: ['AI绘画', '图像生成', '艺术创作', 'Midjourney', '设计'],
    search_terms: ['AI艺术', '图像生成', '绘画AI', '创意设计'],
    view_count: 18750,
    favorite_count: 1243,
    ai_search_count: 4120,
    source: 'midjourney',
    source_id: 'midjourney',
    last_crawled_at: '2025-01-01T00:00:00Z',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2025-01-01T00:00:00Z'
  }
]

export const mockCategories = [
  {
    id: '1',
    name: '对话AI',
    slug: 'chat-ai',
    description: '智能对话和聊天机器人',
    icon: '💬',
    parent_id: null,
    created_at: '2024-01-01T00:00:00Z'
  },
  {
    id: '2',
    name: '图像生成',
    slug: 'image-generation',
    description: 'AI图像生成和编辑工具',
    icon: '🎨',
    parent_id: null,
    created_at: '2024-01-01T00:00:00Z'
  },
  {
    id: '3',
    name: '代码助手',
    slug: 'code-assistant',
    description: '编程和开发辅助工具',
    icon: '💻',
    parent_id: null,
    created_at: '2024-01-01T00:00:00Z'
  }
]

// 生成相似Agents的函数
export function getSimilarAgents(currentAgentId: string, limit: number = 3) {
  return mockAgents
    .filter(agent => agent.id !== currentAgentId)
    .sort((a, b) => b.ai_search_count - a.ai_search_count)
    .slice(0, limit)
}

// 获取热门Agents
export function getPopularAgents(limit: number = 10) {
  return mockAgents
    .sort((a, b) => b.view_count - a.view_count)
    .slice(0, limit)
}

// 搜索Agents
export function searchAgents(query: string) {
  const lowercaseQuery = query.toLowerCase()
  return mockAgents.filter(agent => 
    agent.name.toLowerCase().includes(lowercaseQuery) ||
    agent.short_description.toLowerCase().includes(lowercaseQuery) ||
    agent.keywords.some(keyword => keyword.toLowerCase().includes(lowercaseQuery))
  )
}