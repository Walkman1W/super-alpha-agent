#!/usr/bin/env node

// 简单的 JavaScript 爬虫入口
// 使用种子数据快速测试

require('dotenv').config({ path: '.env' })
const { createClient } = require('@supabase/supabase-js')
const OpenAI = require('openai').default

// 种子数据
const seedData = [
  {
    name: 'Code Reviewer Pro',
    description: '专业的代码审查助手，分析代码质量、发现潜在问题、提供优化建议',
    url: 'https://chatgpt.com/g/code-reviewer-pro',
    platform: 'GPT Store',
    category: '开发工具'
  },
  {
    name: 'Content Writer AI',
    description: '智能内容创作助手，帮助撰写博客、文章、营销文案和社交媒体内容',
    url: 'https://chatgpt.com/g/content-writer-ai',
    platform: 'GPT Store',
    category: '内容创作'
  },
  {
    name: 'Data Analyst Expert',
    description: '数据分析专家，处理数据、创建可视化图表、生成深度洞察报告',
    url: 'https://chatgpt.com/g/data-analyst-expert',
    platform: 'GPT Store',
    category: '数据分析'
  },
  {
    name: 'UI/UX Designer',
    description: '用户界面和体验设计助手，提供设计建议、原型制作和用户研究支持',
    url: 'https://chatgpt.com/g/ui-ux-designer',
    platform: 'GPT Store',
    category: '设计'
  },
  {
    name: 'Marketing Strategist',
    description: '营销策略专家，制定营销计划、分析市场趋势、优化广告投放',
    url: 'https://chatgpt.com/g/marketing-strategist',
    platform: 'GPT Store',
    category: '营销'
  },
  {
    name: 'Customer Support Bot',
    description: '智能客服助手，24/7 回答客户问题、处理投诉、提供技术支持',
    url: 'https://chatgpt.com/g/customer-support-bot',
    platform: 'GPT Store',
    category: '客服'
  },
  {
    name: 'Language Tutor',
    description: '语言学习导师，提供个性化语言课程、练习对话、纠正发音',
    url: 'https://chatgpt.com/g/language-tutor',
    platform: 'GPT Store',
    category: '教育'
  },
  {
    name: 'Research Assistant',
    description: '学术研究助手，帮助文献综述、数据收集、论文撰写和引用管理',
    url: 'https://chatgpt.com/g/research-assistant',
    platform: 'GPT Store',
    category: '研究'
  },
  {
    name: 'Productivity Coach',
    description: '生产力教练，时间管理、任务规划、习惯养成和目标追踪',
    url: 'https://chatgpt.com/g/productivity-coach',
    platform: 'GPT Store',
    category: '生产力'
  },
  {
    name: 'SQL Query Helper',
    description: 'SQL 查询助手，编写复杂查询、优化数据库性能、调试 SQL 语句',
    url: 'https://chatgpt.com/g/sql-query-helper',
    platform: 'GPT Store',
    category: '开发工具'
  }
]

// 分类映射
const categoryMap = {
  '开发工具': 'development',
  '内容创作': 'content',
  '数据分析': 'data-analysis',
  '设计': 'design',
  '营销': 'marketing',
  '客服': 'customer-service',
  '教育': 'education',
  '研究': 'research',
  '生产力': 'productivity',
  '其他': 'other'
}

async function analyzeAgent(rawData) {
  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
    baseURL: process.env.OPENAI_BASE_URL,
  })

  const prompt = `
分析这个 AI Agent 并提取结构化信息：

名称: ${rawData.name}
描述: ${rawData.description || '无'}
平台: ${rawData.platform || '未知'}

请返回 JSON 格式（必须是有效的 JSON）：
{
  "category": "${rawData.category || '其他'}",
  "short_description": "一句话描述（20-50字）",
  "detailed_description": "详细介绍（100-200字）",
  "key_features": ["核心功能1", "核心功能2", "核心功能3"],
  "use_cases": ["适用场景1", "适用场景2", "适用场景3"],
  "pros": ["优点1", "优点2", "优点3"],
  "cons": ["缺点1", "缺点2"],
  "how_to_use": "使用方法（步骤说明，50-100字）",
  "pricing": "免费/付费/Freemium",
  "keywords": ["关键词1", "关键词2", "关键词3"],
  "search_terms": ["常见搜索词1", "常见搜索词2"]
}
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
    return JSON.parse(content)
  } catch (error) {
    console.error('AI analysis error:', error.message)
    throw error
  }
}

async function enrichAndSaveAgent(supabase, rawData) {
  try {
    console.log(`📝 Analyzing: ${rawData.name}`)
    
    // 使用 AI 分析
    const analyzed = await analyzeAgent(rawData)
    
    // 获取分类 ID
    const categorySlug = categoryMap[analyzed.category] || 'other'
    const { data: category, error: catError } = await supabase
      .from('categories')
      .select('id')
      .eq('slug', categorySlug)
      .single()
    
    if (catError || !category) {
      console.error(`Category not found: ${categorySlug}`)
      return
    }
    
    // 生成 slug
    const slug = rawData.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
    
    // 检查是否已存在
    const { data: existing } = await supabase
      .from('agents')
      .select('id')
      .eq('slug', slug)
      .single()
    
    const agentData = {
      slug,
      name: rawData.name,
      category_id: category.id,
      short_description: analyzed.short_description,
      detailed_description: analyzed.detailed_description,
      key_features: analyzed.key_features,
      use_cases: analyzed.use_cases,
      pros: analyzed.pros,
      cons: analyzed.cons,
      how_to_use: analyzed.how_to_use,
      platform: rawData.platform,
      pricing: analyzed.pricing,
      official_url: rawData.url,
      keywords: analyzed.keywords,
      search_terms: analyzed.search_terms,
      source: rawData.platform,
      source_id: rawData.url,
      last_crawled_at: new Date().toISOString()
    }
    
    if (existing) {
      // 更新现有记录
      const { error } = await supabase
        .from('agents')
        .update(agentData)
        .eq('id', existing.id)
      
      if (error) throw error
      console.log(`✅ Updated: ${rawData.name}`)
    } else {
      // 插入新记录
      const { error } = await supabase
        .from('agents')
        .insert(agentData)
      
      if (error) throw error
      console.log(`✅ Created: ${rawData.name}`)
    }
    
    // 避免 API 限流
    await new Promise(resolve => setTimeout(resolve, 2000))
    
  } catch (error) {
    console.error(`❌ Error processing ${rawData.name}:`, error.message)
  }
}

async function main() {
  console.log('🤖 Super Alpha Agent Crawler\n')
  
  // 创建 Supabase 客户端
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  )
  
  console.log(`📊 Processing ${seedData.length} agents...\n`)
  
  let successCount = 0
  let errorCount = 0
  
  for (const agent of seedData) {
    try {
      await enrichAndSaveAgent(supabase, agent)
      successCount++
    } catch (error) {
      errorCount++
    }
  }
  
  console.log(`\n✨ Crawler completed!`)
  console.log(`   ✅ Success: ${successCount}`)
  console.log(`   ❌ Errors: ${errorCount}`)
  console.log(`   📊 Total: ${seedData.length}\n`)
  
  console.log('🎉 Done! Visit http://localhost:3000 to see the results.')
}

main().catch(error => {
  console.error('💥 Crawler failed:', error)
  process.exit(1)
})
