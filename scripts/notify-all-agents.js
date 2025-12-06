#!/usr/bin/env node

/**
 * 批量通知所有现有 Agent 到 IndexNow
 * 
 * 用于首次配置 IndexNow 后，将所有已存在的 Agent 通知给搜索引擎
 * 
 * 使用方法:
 * node scripts/notify-all-agents.js
 */

require('dotenv').config()
const { createClient } = require('@supabase/supabase-js')

const INDEXNOW_KEY = process.env.INDEXNOW_KEY
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!INDEXNOW_KEY || !SITE_URL) {
  console.error('❌ 错误: 缺少 INDEXNOW_KEY 或 NEXT_PUBLIC_SITE_URL 环境变量')
  process.exit(1)
}

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('❌ 错误: 缺少 Supabase 配置')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

async function notifyIndexNow(urls) {
  const host = new URL(SITE_URL).hostname
  const keyLocation = `${SITE_URL}/${INDEXNOW_KEY}.txt`
  
  const apiUrl = 'https://api.indexnow.org/indexnow'
  
  const payload = {
    host,
    key: INDEXNOW_KEY,
    keyLocation,
    urlList: urls
  }
  
  const response = await fetch(apiUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json; charset=utf-8'
    },
    body: JSON.stringify(payload)
  })
  
  if (response.ok) {
    return { success: true, count: urls.length }
  } else {
    const errorText = await response.text().catch(() => 'Unknown error')
    throw new Error(`HTTP ${response.status}: ${errorText}`)
  }
}

async function main() {
  console.log('🚀 开始批量通知 IndexNow...\n')
  
  // 获取所有 Agent
  const { data: agents, error } = await supabase
    .from('agents')
    .select('slug')
    .order('created_at', { ascending: false })
  
  if (error) {
    console.error('❌ 获取 Agent 列表失败:', error)
    process.exit(1)
  }
  
  if (!agents || agents.length === 0) {
    console.log('⚠️  没有找到任何 Agent')
    return
  }
  
  console.log(`📊 找到 ${agents.length} 个 Agent\n`)
  
  // 构建 URL 列表
  const urls = agents.map(agent => `${SITE_URL}/agents/${agent.slug}`)
  
  // IndexNow 支持单次最多 10,000 个 URL，分批处理
  const batchSize = 10000
  const batches = []
  
  for (let i = 0; i < urls.length; i += batchSize) {
    batches.push(urls.slice(i, i + batchSize))
  }
  
  console.log(`📦 分为 ${batches.length} 批次处理\n`)
  
  let successCount = 0
  let failCount = 0
  
  for (let i = 0; i < batches.length; i++) {
    const batch = batches[i]
    console.log(`📤 正在发送第 ${i + 1}/${batches.length} 批次 (${batch.length} 个 URL)...`)
    
    try {
      await notifyIndexNow(batch)
      successCount += batch.length
      console.log(`✅ 第 ${i + 1} 批次成功\n`)
    } catch (error) {
      failCount += batch.length
      console.error(`❌ 第 ${i + 1} 批次失败:`, error.message, '\n')
    }
    
    // 添加延迟避免速率限制
    if (i < batches.length - 1) {
      console.log('⏳ 等待 2 秒...\n')
      await new Promise(resolve => setTimeout(resolve, 2000))
    }
  }
  
  console.log('🎉 批量通知完成!')
  console.log(`   ✅ 成功: ${successCount}`)
  console.log(`   ❌ 失败: ${failCount}`)
  console.log(`   📊 总计: ${urls.length}\n`)
  
  console.log('💡 提示:')
  console.log('   - 搜索引擎收到通知后会安排爬虫来访问')
  console.log('   - 索引速度取决于搜索引擎的处理队列')
  console.log('   - 可以在 Bing Webmaster Tools 查看提交历史\n')
}

main().catch(error => {
  console.error('💥 脚本执行失败:', error)
  process.exit(1)
})
