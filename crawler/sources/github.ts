/**
 * GitHub Crawler Source
 * 从 GitHub 抓取 AI Agent 项目
 */

import { searchRepos, fetchReadme } from '@/lib/github'
import type { RawAgentData } from './gpt-store'

interface GitHubRepo {
  id: number
  name: string
  full_name: string
  description: string | null
  html_url: string
  stargazers_count: number
  topics: string[]
  owner: {
    login: string
    avatar_url: string
  }
  created_at: string
  updated_at: string
}

export interface CrawlResult {
  success: boolean
  total: number
  created: number
  updated: number
  failed: number
  errors: Array<{ repo: string; error: string }>
}

/**
 * 将 GitHub 仓库转换为 RawAgentData 格式
 */
export async function processGitHubRepo(repo: GitHubRepo): Promise<RawAgentData> {
  console.log(`📦 Processing: ${repo.full_name}`)
  
  // 获取 README 内容
  let readmeContent: string | null = null
  try {
    readmeContent = await fetchReadme(repo.owner.login, repo.name)
  } catch (error) {
    console.warn(`⚠️  Failed to fetch README for ${repo.full_name}:`, error)
  }
  
  // 构建描述：优先使用 README 的前几段，否则使用仓库描述
  let description = repo.description || ''
  
  if (readmeContent) {
    // 提取 README 的前 500 个字符作为初始描述
    const cleanReadme = readmeContent
      .replace(/^#.*$/gm, '') // 移除标题
      .replace(/!\[.*?\]\(.*?\)/g, '') // 移除图片
      .replace(/\[([^\]]+)\]\([^\)]+\)/g, '$1') // 移除链接但保留文本
      .trim()
    
    if (cleanReadme.length > 0) {
      description = cleanReadme.substring(0, 500)
    }
  }
  
  return {
    name: repo.name,
    description,
    url: repo.html_url,
    platform: 'GitHub',
    author: repo.owner.login,
    category: inferCategoryFromTopics(repo.topics),
    // GitHub 特有字段（将在 enricher 中处理）
    github_stars: repo.stargazers_count,
    github_url: repo.html_url,
    github_owner: repo.owner.login,
    github_topics: repo.topics,
    readme_content: readmeContent
  } as RawAgentData & {
    github_stars?: number
    github_url?: string
    github_owner?: string
    github_topics?: string[]
    readme_content?: string | null
  }
}

/**
 * 从 GitHub topics 推断分类
 */
function inferCategoryFromTopics(topics: string[]): string {
  const topicMap: Record<string, string[]> = {
    'development': ['development', 'developer-tools', 'coding', 'programming'],
    'content': ['content', 'writing', 'blog', 'documentation'],
    'data-analysis': ['data', 'analytics', 'data-science', 'visualization'],
    'design': ['design', 'ui', 'ux', 'graphics'],
    'marketing': ['marketing', 'seo', 'advertising'],
    'customer-service': ['customer-service', 'support', 'chatbot'],
    'education': ['education', 'learning', 'tutorial'],
    'research': ['research', 'academic', 'science'],
    'productivity': ['productivity', 'automation', 'workflow']
  }
  
  for (const [category, keywords] of Object.entries(topicMap)) {
    if (topics.some(topic => keywords.includes(topic.toLowerCase()))) {
      return category
    }
  }
  
  return 'other'
}

/**
 * 爬取 GitHub 仓库
 * @param options 爬取选项
 * @returns 爬取结果
 */
export async function crawlGitHub(options: {
  topic?: string
  minStars?: number
  maxResults?: number
} = {}): Promise<CrawlResult> {
  const {
    topic = 'ai-agent',
    minStars = 10,
    maxResults = 50
  } = options
  
  console.log('\n🚀 Starting GitHub crawler...')
  console.log(`   Topic: ${topic}`)
  console.log(`   Min Stars: ${minStars}`)
  console.log(`   Max Results: ${maxResults}\n`)
  
  const result: CrawlResult = {
    success: true,
    total: 0,
    created: 0,
    updated: 0,
    failed: 0,
    errors: []
  }
  
  try {
    // 搜索仓库
    const repos = await searchRepos({
      topic,
      minStars,
      maxResults,
      sort: 'stars',
      order: 'desc'
    })
    
    result.total = repos.length
    console.log(`\n✅ Found ${repos.length} repositories\n`)
    
    // 处理每个仓库
    const processedRepos: RawAgentData[] = []
    
    for (const repo of repos) {
      try {
        const rawData = await processGitHubRepo(repo)
        processedRepos.push(rawData)
        result.created++ // 注意：实际的 created/updated 计数将在 enricher 中确定
        
        // 避免触发速率限制
        await new Promise(resolve => setTimeout(resolve, 1000))
      } catch (error) {
        result.failed++
        result.errors.push({
          repo: repo.full_name,
          error: error instanceof Error ? error.message : String(error)
        })
        console.error(`❌ Failed to process ${repo.full_name}:`, error)
      }
    }
    
    // 生成爬取报告
    console.log('\n' + '='.repeat(60))
    console.log('📊 GitHub Crawler Report')
    console.log('='.repeat(60))
    console.log(`Total Repositories Found: ${result.total}`)
    console.log(`Successfully Processed:   ${result.created}`)
    console.log(`Failed:                   ${result.failed}`)
    
    if (result.errors.length > 0) {
      console.log('\n❌ Errors:')
      result.errors.forEach(({ repo, error }) => {
        console.log(`   - ${repo}: ${error}`)
      })
    }
    
    console.log('='.repeat(60) + '\n')
    
    return result
    
  } catch (error) {
    result.success = false
    console.error('❌ GitHub crawler failed:', error)
    throw error
  }
}

/**
 * 导出处理后的数据供 enricher 使用
 */
export async function crawlAndExport(options: {
  topic?: string
  minStars?: number
  maxResults?: number
} = {}): Promise<RawAgentData[]> {
  const {
    topic = 'ai-agent',
    minStars = 10,
    maxResults = 50
  } = options
  
  console.log('\n🚀 Starting GitHub crawler (export mode)...\n')
  
  const repos = await searchRepos({
    topic,
    minStars,
    maxResults,
    sort: 'stars',
    order: 'desc'
  })
  
  const processedRepos: RawAgentData[] = []
  
  for (const repo of repos) {
    try {
      const rawData = await processGitHubRepo(repo)
      processedRepos.push(rawData)
      
      // 避免触发速率限制
      await new Promise(resolve => setTimeout(resolve, 1000))
    } catch (error) {
      console.error(`❌ Failed to process ${repo.full_name}:`, error)
    }
  }
  
  console.log(`\n✅ Processed ${processedRepos.length} repositories\n`)
  
  return processedRepos
}
