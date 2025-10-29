// 初始化分类数据
require('dotenv').config({ path: '.env' })
const { createClient } = require('@supabase/supabase-js')

const categories = [
  {
    name: '开发工具',
    slug: 'development',
    description: '代码审查、调试、测试、API 开发等开发相关的 AI 助手',
    icon: '💻'
  },
  {
    name: '内容创作',
    slug: 'content',
    description: '写作、编辑、翻译、文案创作等内容相关的 AI 助手',
    icon: '✍️'
  },
  {
    name: '数据分析',
    slug: 'data-analysis',
    description: '数据处理、可视化、统计分析、商业智能等数据相关的 AI 助手',
    icon: '📊'
  },
  {
    name: '设计',
    slug: 'design',
    description: 'UI/UX 设计、图形设计、原型制作等设计相关的 AI 助手',
    icon: '🎨'
  },
  {
    name: '营销',
    slug: 'marketing',
    description: '市场策略、广告投放、SEO、社交媒体等营销相关的 AI 助手',
    icon: '📈'
  },
  {
    name: '客服',
    slug: 'customer-service',
    description: '客户支持、问题解答、投诉处理等客服相关的 AI 助手',
    icon: '💬'
  },
  {
    name: '教育',
    slug: 'education',
    description: '语言学习、课程辅导、知识问答等教育相关的 AI 助手',
    icon: '📚'
  },
  {
    name: '研究',
    slug: 'research',
    description: '学术研究、文献综述、数据收集等研究相关的 AI 助手',
    icon: '🔬'
  },
  {
    name: '生产力',
    slug: 'productivity',
    description: '时间管理、任务规划、笔记整理等生产力相关的 AI 助手',
    icon: '⚡'
  },
  {
    name: '其他',
    slug: 'other',
    description: '其他类型的 AI 助手',
    icon: '📦'
  }
]

async function initCategories() {
  console.log('🗂️  Initializing categories...\n')
  
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  )
  
  let successCount = 0
  let errorCount = 0
  
  for (const category of categories) {
    try {
      // 检查是否已存在
      const { data: existing } = await supabase
        .from('categories')
        .select('id')
        .eq('slug', category.slug)
        .single()
      
      if (existing) {
        // 更新
        const { error } = await supabase
          .from('categories')
          .update(category)
          .eq('slug', category.slug)
        
        if (error) throw error
        console.log(`✅ Updated: ${category.name}`)
      } else {
        // 插入
        const { error } = await supabase
          .from('categories')
          .insert(category)
        
        if (error) throw error
        console.log(`✅ Created: ${category.name}`)
      }
      
      successCount++
    } catch (error) {
      console.error(`❌ Error with ${category.name}:`, error.message)
      errorCount++
    }
  }
  
  console.log(`\n✨ Categories initialized!`)
  console.log(`   ✅ Success: ${successCount}`)
  console.log(`   ❌ Errors: ${errorCount}`)
  console.log(`   📊 Total: ${categories.length}\n`)
}

initCategories().catch(error => {
  console.error('💥 Failed:', error)
  process.exit(1)
})
