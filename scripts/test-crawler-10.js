#!/usr/bin/env node

/**
 * 测试爬虫流程 - 抓取10个agent
 * 验证数据清理和Supabase存储
 */

import { config } from 'dotenv'
config()

// 临时设置环境变量
process.env.CRAWLER_MAX_AGENTS_PER_RUN = '10'
process.env.CRAWLER_SOURCE = 'github' // 使用GitHub源，更稳定

console.log('🧪 测试爬虫流程 (10个agent)\n')
console.log('配置:')
console.log(`  - 数据源: ${process.env.CRAWLER_SOURCE}`)
console.log(`  - 最大数量: ${process.env.CRAWLER_MAX_AGENTS_PER_RUN}`)
console.log(`  - Supabase URL: ${process.env.NEXT_PUBLIC_SUPABASE_URL}`)
console.log(`  - OpenAI Model: ${process.env.OPENAI_MODEL || 'default'}`)
console.log('')

// 导入并运行爬虫
import('../crawler/run.js').then(() => {
  console.log('\n✅ 测试完成！')
  console.log('\n请检查:')
  console.log('1. 数据是否正确存储到 Supabase agents 表')
  console.log('2. 字段是否完整（name, description, features, pros, cons等）')
  console.log('3. category_id 是否正确映射')
  console.log('4. slug 是否唯一且格式正确')
  console.log('5. github_stars, github_url 等GitHub字段是否存在')
}).catch(error => {
  console.error('\n❌ 测试失败:', error)
  process.exit(1)
})
