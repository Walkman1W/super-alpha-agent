#!/usr/bin/env node

import { crawlGPTStore, getGPTStoreSeedData } from './sources/gpt-store'
import { batchEnrichAgents } from './enricher'

async function main() {
  console.log('🤖 Shopo Alpha Agent Crawler\n')
  
  const maxAgents = parseInt(process.env.CRAWLER_MAX_AGENTS_PER_RUN || '50')
  
  try {
    // 尝试爬取
    let rawAgents = await crawlGPTStore(maxAgents)
    
    // 如果爬取失败或数据太少，使用种子数据
    if (rawAgents.length < 5) {
      console.log('⚠️  Crawler returned few results, using seed data...')
      rawAgents = getGPTStoreSeedData()
    }
    
    // AI 分析并保存
    await batchEnrichAgents(rawAgents)
    
    console.log('🎉 Crawler completed successfully!')
    
  } catch (error) {
    console.error('💥 Crawler failed:', error)
    process.exit(1)
  }
}

main()
