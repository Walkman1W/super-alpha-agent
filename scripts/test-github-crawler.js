#!/usr/bin/env node

/**
 * GitHub Crawler Integration Test
 * 测试 GitHub 爬虫的完整流程：抓取 → 处理 → 入库
 */

require('dotenv').config()
const { createClient } = require('@supabase/supabase-js')

async function testGitHubCrawler() {
  console.log('🧪 GitHub Crawler Integration Test\n')
  console.log('='.repeat(60))
  
  // 检查环境变量
  console.log('\n📋 Environment Check:')
  console.log(`   GITHUB_TOKEN: ${process.env.GITHUB_TOKEN ? '✓ Set' : '✗ Not set (will use unauthenticated API)'}`)
  console.log(`   SUPABASE_URL: ${process.env.NEXT_PUBLIC_SUPABASE_URL ? '✓ Set' : '✗ Not set'}`)
  console.log(`   SUPABASE_KEY: ${process.env.SUPABASE_SERVICE_ROLE_KEY ? '✓ Set' : '✗ Not set'}`)
  console.log(`   OPENAI_API_KEY: ${process.env.OPENAI_API_KEY ? '✓ Set' : '✗ Not set'}`)
  
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.error('\n❌ Missing required Supabase credentials')
    process.exit(1)
  }
  
  // 初始化 Supabase 客户端
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  )
  
  // 记录爬取前的数据库状态
  console.log('\n📊 Database State (Before):')
  const { data: beforeAgents, error: beforeError } = await supabase
    .from('agents')
    .select('id, name, source, github_stars')
    .eq('source', 'GitHub')
  
  if (beforeError) {
    console.error('❌ Failed to query database:', beforeError)
    process.exit(1)
  }
  
  const beforeCount = beforeAgents?.length || 0
  console.log(`   GitHub Agents: ${beforeCount}`)
  
  // 运行爬虫（限制为 10 个项目以加快测试）
  console.log('\n🚀 Running GitHub Crawler...')
  console.log('   (Crawling 10 projects for testing)\n')
  
  const maxResults = parseInt(process.env.TEST_MAX_RESULTS || '10')
  
  // 设置环境变量并运行爬虫
  process.env.CRAWLER_SOURCE = 'github'
  process.env.CRAWLER_MAX_AGENTS_PER_RUN = maxResults.toString()
  process.env.GITHUB_MIN_STARS = '50' // 提高 stars 要求以获取高质量项目
  
  try {
    // 动态导入爬虫模块
    const { crawlAndExport } = require('../crawler/sources/github')
    const { batchEnrichAgents } = require('../crawler/enricher')
    
    // 爬取数据
    const rawAgents = await crawlAndExport({
      topic: process.env.GITHUB_TOPIC || 'ai-agent',
      minStars: parseInt(process.env.GITHUB_MIN_STARS || '50'),
      maxResults
    })
    
    console.log(`\n✅ Crawled ${rawAgents.length} repositories`)
    
    if (rawAgents.length === 0) {
      console.log('\n⚠️  No repositories found. This might be due to:')
      console.log('   - GitHub API rate limiting (try setting GITHUB_TOKEN)')
      console.log('   - No repositories matching the criteria')
      console.log('\n✓ Test completed (no data to process)')
      return
    }
    
    // 显示前 3 个项目的信息
    console.log('\n📦 Sample Projects:')
    rawAgents.slice(0, 3).forEach((agent, i) => {
      console.log(`   ${i + 1}. ${agent.name}`)
      console.log(`      URL: ${agent.url}`)
      console.log(`      Stars: ${agent.github_stars || 0}`)
      console.log(`      Topics: ${agent.github_topics?.join(', ') || 'none'}`)
    })
    
    // AI 分析并保存到数据库
    console.log('\n🤖 Enriching with AI analysis...')
    const result = await batchEnrichAgents(rawAgents)
    
    console.log('\n📊 Enrichment Results:')
    console.log(`   Created: ${result.created}`)
    console.log(`   Updated: ${result.updated}`)
    console.log(`   Failed: ${result.failed}`)
    
    // 验证数据库状态
    console.log('\n📊 Database State (After):')
    const { data: afterAgents, error: afterError } = await supabase
      .from('agents')
      .select('id, name, source, github_stars, github_url, github_topics')
      .eq('source', 'GitHub')
      .order('github_stars', { ascending: false })
      .limit(5)
    
    if (afterError) {
      console.error('❌ Failed to query database:', afterError)
      process.exit(1)
    }
    
    const afterCount = afterAgents?.length || 0
    console.log(`   GitHub Agents: ${afterCount} (${afterCount - beforeCount > 0 ? '+' : ''}${afterCount - beforeCount})`)
    
    // 显示前 5 个 GitHub agents
    if (afterAgents && afterAgents.length > 0) {
      console.log('\n🏆 Top GitHub Agents (by stars):')
      afterAgents.forEach((agent, i) => {
        console.log(`   ${i + 1}. ${agent.name}`)
        console.log(`      Stars: ${agent.github_stars || 0}`)
        console.log(`      URL: ${agent.github_url || 'N/A'}`)
        console.log(`      Topics: ${agent.github_topics?.join(', ') || 'none'}`)
      })
    }
    
    // 验证数据完整性
    console.log('\n✅ Data Integrity Check:')
    const { data: integrityCheck } = await supabase
      .from('agents')
      .select('id, name, github_stars, github_url, github_owner')
      .eq('source', 'GitHub')
      .is('github_url', null)
    
    if (integrityCheck && integrityCheck.length > 0) {
      console.log(`   ⚠️  Found ${integrityCheck.length} GitHub agents without github_url`)
    } else {
      console.log('   ✓ All GitHub agents have required fields')
    }
    
    console.log('\n' + '='.repeat(60))
    console.log('✅ GitHub Crawler Test Completed Successfully!')
    console.log('='.repeat(60))
    
  } catch (error) {
    console.error('\n❌ Test failed:', error)
    console.error('\nStack trace:', error.stack)
    process.exit(1)
  }
}

// 运行测试
testGitHubCrawler()
