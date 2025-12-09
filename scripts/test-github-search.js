#!/usr/bin/env node

/**
 * 测试GitHub API搜索真实数据
 */

import { config } from 'dotenv'
config()

const GITHUB_TOKEN = process.env.GITHUB_TOKEN

async function searchGitHub(query, minStars = 100) {
  const url = new URL('https://api.github.com/search/repositories')
  url.searchParams.set('q', `${query} stars:>=${minStars}`)
  url.searchParams.set('sort', 'stars')
  url.searchParams.set('order', 'desc')
  url.searchParams.set('per_page', '10')
  
  console.log(`🔍 搜索: ${query} (>= ${minStars} stars)`)
  console.log(`   URL: ${url.toString()}\n`)
  
  const response = await fetch(url.toString(), {
    headers: {
      'Authorization': `Bearer ${GITHUB_TOKEN}`,
      'Accept': 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28'
    }
  })
  
  if (!response.ok) {
    throw new Error(`GitHub API error: ${response.status} ${response.statusText}`)
  }
  
  const data = await response.json()
  return data
}

async function main() {
  console.log('🚀 测试GitHub API真实搜索\n')
  console.log('='.repeat(60))
  
  try {
    // 测试1: AI Agent
    console.log('\n📦 测试1: topic:ai-agent')
    const result1 = await searchGitHub('topic:ai-agent', 100)
    console.log(`   ✅ 找到 ${result1.total_count} 个仓库`)
    console.log(`   返回 ${result1.items.length} 个结果\n`)
    
    if (result1.items.length > 0) {
      console.log('   前5个:')
      result1.items.slice(0, 5).forEach((repo, i) => {
        console.log(`   ${i + 1}. ${repo.full_name}`)
        console.log(`      ⭐ ${repo.stargazers_count} stars`)
        console.log(`      📝 ${repo.description || '无描述'}`)
        console.log('')
      })
    }
    
    await new Promise(r => setTimeout(r, 2000))
    
    // 测试2: LLM
    console.log('\n📦 测试2: topic:llm')
    const result2 = await searchGitHub('topic:llm', 500)
    console.log(`   ✅ 找到 ${result2.total_count} 个仓库`)
    console.log(`   返回 ${result2.items.length} 个结果\n`)
    
    if (result2.items.length > 0) {
      console.log('   前5个:')
      result2.items.slice(0, 5).forEach((repo, i) => {
        console.log(`   ${i + 1}. ${repo.full_name}`)
        console.log(`      ⭐ ${repo.stargazers_count} stars`)
        console.log(`      📝 ${repo.description || '无描述'}`)
        console.log('')
      })
    }
    
    await new Promise(r => setTimeout(r, 2000))
    
    // 测试3: ChatGPT
    console.log('\n📦 测试3: topic:chatgpt')
    const result3 = await searchGitHub('topic:chatgpt', 200)
    console.log(`   ✅ 找到 ${result3.total_count} 个仓库`)
    console.log(`   返回 ${result3.items.length} 个结果\n`)
    
    if (result3.items.length > 0) {
      console.log('   前5个:')
      result3.items.slice(0, 5).forEach((repo, i) => {
        console.log(`   ${i + 1}. ${repo.full_name}`)
        console.log(`      ⭐ ${repo.stargazers_count} stars`)
        console.log(`      📝 ${repo.description || '无描述'}`)
        console.log('')
      })
    }
    
    // 推荐策略
    console.log('\n' + '='.repeat(60))
    console.log('💡 推荐的爬虫配置:')
    console.log('='.repeat(60))
    console.log('')
    console.log('高质量AI应用的Topic组合:')
    console.log('  1. topic:ai-agent (AI代理) - 最相关')
    console.log('  2. topic:llm (大语言模型)')
    console.log('  3. topic:chatgpt (ChatGPT相关)')
    console.log('  4. topic:langchain (LangChain框架)')
    console.log('  5. topic:autonomous-agent (自主代理)')
    console.log('  6. topic:gpt (GPT相关)')
    console.log('')
    console.log('建议的星标阈值:')
    console.log('  - 高质量项目: >= 500 stars')
    console.log('  - 优质项目: >= 200 stars')
    console.log('  - 新兴项目: >= 100 stars')
    console.log('')
    console.log('环境变量配置:')
    console.log('  GITHUB_TOPIC=ai-agent')
    console.log('  GITHUB_MIN_STARS=100')
    console.log('  CRAWLER_MAX_AGENTS_PER_RUN=50')
    console.log('')
    
  } catch (error) {
    console.error('❌ 测试失败:', error.message)
    process.exit(1)
  }
}

main()
