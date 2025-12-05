#!/usr/bin/env node

/**
 * 测试真实的GitHub API搜索
 * 验证能否搜索到高星标的AI应用
 */

import { config } from 'dotenv'
import { searchRepos, getRateLimitStatus } from '../lib/github.js'

config()

async function testGitHubAPI() {
  console.log('🔍 测试GitHub API真实搜索\n')
  
  try {
    // 1. 检查速率限制
    console.log('📊 检查API速率限制...')
    const rateLimit = await getRateLimitStatus()
    console.log(`   剩余请求: ${rateLimit.remaining}/${rateLimit.limit}`)
    console.log(`   重置时间: ${new Date(rateLimit.reset * 1000).toLocaleString()}\n`)
    
    if (rateLimit.remaining === 0) {
      console.log('⚠️  API速率限制已用完，请等待重置')
      return
    }
    
    // 2. 测试不同的搜索条件
    const testCases = [
      {
        name: '高星标AI Agent',
        topic: 'ai-agent',
        minStars: 100,
        maxResults: 10
      },
      {
        name: 'AI工具',
        topic: 'ai',
        minStars: 500,
        maxResults: 10
      },
      {
        name: 'LLM应用',
        topic: 'llm',
        minStars: 100,
        maxResults: 10
      },
      {
        name: 'ChatGPT插件',
        topic: 'chatgpt',
        minStars: 200,
        maxResults: 10
      }
    ]
    
    for (const testCase of testCases) {
      console.log(`\n🔎 测试: ${testCase.name}`)
      console.log(`   Topic: ${testCase.topic}`)
      console.log(`   Min Stars: ${testCase.minStars}`)
      
      try {
        const repos = await searchRepos({
          topic: testCase.topic,
          minStars: testCase.minStars,
          maxResults: testCase.maxResults
        })
        
        console.log(`   ✅ 找到 ${repos.length} 个仓库\n`)
        
        if (repos.length > 0) {
          console.log('   前5个仓库:')
          repos.slice(0, 5).forEach((repo, index) => {
            console.log(`   ${index + 1}. ${repo.full_name}`)
            console.log(`      ⭐ ${repo.stargazers_count} stars`)
            console.log(`      📝 ${repo.description || '无描述'}`)
            console.log(`      🏷️  Topics: ${repo.topics.join(', ') || '无'}`)
            console.log('')
          })
        } else {
          console.log('   ⚠️  没有找到符合条件的仓库')
        }
        
        // 避免触发速率限制
        await new Promise(resolve => setTimeout(resolve, 2000))
        
      } catch (error) {
        console.error(`   ❌ 搜索失败:`, error.message)
      }
    }
    
    // 3. 推荐最佳搜索策略
    console.log('\n' + '='.repeat(60))
    console.log('💡 推荐的搜索策略:')
    console.log('='.repeat(60))
    console.log('')
    console.log('1. 多Topic组合搜索:')
    console.log('   - ai-agent (AI代理)')
    console.log('   - llm (大语言模型)')
    console.log('   - chatgpt (ChatGPT相关)')
    console.log('   - gpt (GPT相关)')
    console.log('   - langchain (LangChain)')
    console.log('   - autonomous-agent (自主代理)')
    console.log('')
    console.log('2. 星标阈值建议:')
    console.log('   - 高质量: >= 500 stars')
    console.log('   - 中等质量: >= 100 stars')
    console.log('   - 新项目: >= 50 stars')
    console.log('')
    console.log('3. 搜索关键词建议:')
    console.log('   - "ai agent" (带引号精确搜索)')
    console.log('   - "autonomous agent"')
    console.log('   - "llm application"')
    console.log('   - "chatgpt plugin"')
    console.log('')
    
  } catch (error) {
    console.error('❌ 测试失败:', error)
    process.exit(1)
  }
}

testGitHubAPI()
