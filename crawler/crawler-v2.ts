#!/usr/bin/env node

/**
 * 爬虫 V2 - 优化版本
 * 
 * 特性:
 * 1. 数据库去重 - 搜索前检查已存在的agents
 * 2. 并行处理 - 使用队列并行处理多个agents
 * 3. 实时存储 - 处理完一个立即存储，前端可实时看到
 * 4. 多Topic支持 - 可配置多个topic轮换抓取
 * 5. 容错机制 - 中断后可继续，已处理的数据不丢失
 */

import { config } from 'dotenv'
config()

import { searchRepos } from '@/lib/github'
import { supabaseAdmin } from '@/lib/supabase'
import { enrichAndSaveAgent } from './enricher'
import type { ExtendedRawAgentData } from './enricher'

// 配置接口
interface CrawlerConfig {
  topics: string[]           // 要抓取的topics列表
  minStars: number          // 最小星标数
  maxAgentsPerTopic: number // 每个topic最多抓取数量
  concurrency: number       // 并发处理数量
  delayBetweenBatches: number // 批次间延迟(ms)
}

// 统计信息
interface CrawlerStats {
  totalFound: number
  filtered: number
  queued: number
  processed: number
  created: number
  updated: number
  failed: number
  skipped: number
}

// 从环境变量读取配置
function getConfig(): CrawlerConfig {
  const topicsStr = process.env.CRAWLER_TOPICS || process.env.GITHUB_TOPIC || 'ai-agent'
  const topics = topicsStr.split(',').map(t => t.trim())
  
  return {
    topics,
    minStars: parseInt(process.env.GITHUB_MIN_STARS || '100'),
    maxAgentsPerTopic: parseInt(process.env.CRAWLER_MAX_AGENTS_PER_RUN || '50'),
    concurrency: parseInt(process.env.CRAWLER_CONCURRENCY || '3'),
    delayBetweenBatches: parseInt(process.env.CRAWLER_BATCH_DELAY || '2000')
  }
}

/**
 * 从数据库获取已存在的GitHub URLs
 */
async function getExistingGitHubUrls(): Promise<Set<string>> {
  console.log('📊 检查数据库中已存在的agents...')
  
  const { data, error } = await supabaseAdmin
    .from('agents')
    .select('github_url, source_id')
    .or('source.eq.GitHub,source.eq.github')
  
  if (error) {
    console.error('❌ 获取已存在agents失败:', error)
    return new Set()
  }
  
  const urls = new Set<string>()
  data?.forEach(agent => {
    if (agent.github_url) urls.add(agent.github_url)
    if (agent.source_id) urls.add(agent.source_id)
  })
  
  console.log(`   找到 ${urls.size} 个已存在的agents`)
  return urls
}

/**
 * 搜索并过滤GitHub仓库
 */
async function searchAndFilter(
  topic: string,
  minStars: number,
  maxResults: number,
  existingUrls: Set<string>
): Promise<ExtendedRawAgentData[]> {
  console.log(`\n🔍 搜索Topic: ${topic} (>= ${minStars} stars)`)
  
  // 搜索GitHub
  const repos = await searchRepos({
    topic,
    minStars,
    maxResults,
    sort: 'stars',
    order: 'desc'
  })
  
  console.log(`   找到 ${repos.length} 个仓库`)
  
  // 过滤已存在的
  const newRepos = repos.filter(repo => {
    const url = repo.html_url
    return !existingUrls.has(url)
  })
  
  console.log(`   过滤后剩余 ${newRepos.length} 个新仓库`)
  
  // 转换为RawAgentData格式
  const rawAgents: ExtendedRawAgentData[] = newRepos.map(repo => ({
    name: repo.name,
    description: repo.description || '',
    url: repo.html_url,
    platform: 'GitHub',
    author: repo.owner.login,
    github_stars: repo.stargazers_count,
    github_url: repo.html_url,
    github_owner: repo.owner.login,
    github_topics: repo.topics
  }))
  
  return rawAgents
}

/**
 * 并行处理队列
 */
async function processQueue(
  queue: ExtendedRawAgentData[],
  concurrency: number,
  stats: CrawlerStats
): Promise<void> {
  console.log(`\n🚀 开始并行处理 (并发数: ${concurrency})`)
  console.log(`   队列长度: ${queue.length}`)
  
  const processing: Promise<void>[] = []
  let index = 0
  
  async function processNext() {
    while (index < queue.length) {
      const currentIndex = index++
      const agent = queue[currentIndex]
      
      try {
        console.log(`\n[${currentIndex + 1}/${queue.length}] 📝 处理: ${agent.name}`)
        
        // 处理并立即存储
        const result = await enrichAndSaveAgent(agent)
        
        stats.processed++
        if (result?.action === 'created') {
          stats.created++
          console.log(`   ✅ 已创建`)
        } else if (result?.action === 'updated') {
          stats.updated++
          console.log(`   🔄 已更新`)
        }
        
      } catch (error) {
        stats.failed++
        console.error(`   ❌ 处理失败:`, error instanceof Error ? error.message : error)
      }
    }
  }
  
  // 启动并发worker
  for (let i = 0; i < concurrency; i++) {
    processing.push(processNext())
  }
  
  // 等待所有worker完成
  await Promise.all(processing)
}

/**
 * 显示实时进度
 */
function printProgress(stats: CrawlerStats) {
  const total = stats.queued
  const processed = stats.processed
  const percentage = total > 0 ? ((processed / total) * 100).toFixed(1) : '0.0'
  
  console.log(`\n📊 实时进度: ${processed}/${total} (${percentage}%)`)
  console.log(`   ✅ 创建: ${stats.created}`)
  console.log(`   🔄 更新: ${stats.updated}`)
  console.log(`   ❌ 失败: ${stats.failed}`)
}

/**
 * 主函数
 */
async function main() {
  console.log('🤖 Super Alpha Agent Crawler V2\n')
  console.log('='.repeat(60))
  
  const config = getConfig()
  const stats: CrawlerStats = {
    totalFound: 0,
    filtered: 0,
    queued: 0,
    processed: 0,
    created: 0,
    updated: 0,
    failed: 0,
    skipped: 0
  }
  
  console.log('⚙️  配置:')
  console.log(`   Topics: ${config.topics.join(', ')}`)
  console.log(`   最小Stars: ${config.minStars}`)
  console.log(`   每Topic最多: ${config.maxAgentsPerTopic}`)
  console.log(`   并发数: ${config.concurrency}`)
  console.log('='.repeat(60))
  
  try {
    // 1. 获取已存在的agents
    const existingUrls = await getExistingGitHubUrls()
    
    // 2. 搜索所有topics
    const allAgents: ExtendedRawAgentData[] = []
    
    for (const topic of config.topics) {
      const agents = await searchAndFilter(
        topic,
        config.minStars,
        config.maxAgentsPerTopic,
        existingUrls
      )
      
      stats.totalFound += agents.length
      allAgents.push(...agents)
      
      // Topic间延迟，避免API限流
      if (config.topics.length > 1) {
        await new Promise(resolve => setTimeout(resolve, config.delayBetweenBatches))
      }
    }
    
    stats.queued = allAgents.length
    
    if (allAgents.length === 0) {
      console.log('\n⚠️  没有找到新的agents需要处理')
      return
    }
    
    console.log(`\n📦 总计找到 ${allAgents.length} 个新agents待处理`)
    
    // 3. 并行处理队列
    await processQueue(allAgents, config.concurrency, stats)
    
    // 4. 显示最终统计
    console.log('\n' + '='.repeat(60))
    console.log('🎉 爬虫完成！')
    console.log('='.repeat(60))
    console.log(`📊 统计信息:`)
    console.log(`   搜索到: ${stats.totalFound}`)
    console.log(`   队列中: ${stats.queued}`)
    console.log(`   已处理: ${stats.processed}`)
    console.log(`   ✅ 创建: ${stats.created}`)
    console.log(`   🔄 更新: ${stats.updated}`)
    console.log(`   ❌ 失败: ${stats.failed}`)
    console.log(`   成功率: ${stats.queued > 0 ? ((stats.processed / stats.queued) * 100).toFixed(1) : 0}%`)
    console.log('='.repeat(60))
    
  } catch (error) {
    console.error('\n💥 爬虫失败:', error)
    process.exit(1)
  }
}

// 运行
if (require.main === module) {
  main()
}

export { main as runCrawlerV2 }
