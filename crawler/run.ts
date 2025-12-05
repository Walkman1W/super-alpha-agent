#!/usr/bin/env node

import { crawlGPTStore, getGPTStoreSeedData } from './sources/gpt-store'
import { crawlAndExport } from './sources/github'
import { batchEnrichAgents } from './enricher'

async function main() {
  console.log('🤖 Super Alpha Agent Crawler\n')
  
  const maxAgents = parseInt(process.env.CRAWLER_MAX_AGENTS_PER_RUN || '50')
  const source = process.env.CRAWLER_SOURCE || 'gpt-store' // 'gpt-store' | 'github' | 'all'
  
  try {
    let rawAgents: any[] = []
    
    if (source === 'github' || source === 'all') {
      console.log('📦 Crawling GitHub...\n')
      const githubAgents = await crawlAndExport({
        topic: process.env.GITHUB_TOPIC || 'ai-agent',
        minStars: parseInt(process.env.GITHUB_MIN_STARS || '10'),
        maxResults: maxAgents
      })
      rawAgents.push(...githubAgents)
    }
    
    if (source === 'gpt-store' || source === 'all') {
      console.log('🏪 Crawling GPT Store...\n')
      let gptAgents = await crawlGPTStore(maxAgents)
      
      // 如果爬取失败或数据太少，使用种子数据
      if (gptAgents.length < 5) {
        console.log('⚠️  Crawler returned few results, using seed data...')
        gptAgents = getGPTStoreSeedData()
      }
      
      rawAgents.push(...gptAgents)
    }
    
    if (rawAgents.length === 0) {
      console.log('⚠️  No agents found to process')
      return
    }
    
    // AI 分析并保存
    const result = await batchEnrichAgents(rawAgents)
    
    console.log('🎉 Crawler completed successfully!')
    console.log(`   Created: ${result.created}`)
    console.log(`   Updated: ${result.updated}`)
    console.log(`   Failed: ${result.failed}`)
    
  } catch (error) {
    console.error('💥 Crawler failed:', error)
    process.exit(1)
  }
}

main()
