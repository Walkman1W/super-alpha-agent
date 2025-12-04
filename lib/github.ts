/**
 * GitHub API Client
 * 用于搜索和获取 GitHub 仓库信息
 */

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

interface GitHubSearchResponse {
  total_count: number
  incomplete_results: boolean
  items: GitHubRepo[]
}

interface SearchReposOptions {
  topic?: string
  minStars?: number
  maxResults?: number
  sort?: 'stars' | 'updated'
  order?: 'desc' | 'asc'
}

interface RateLimitInfo {
  limit: number
  remaining: number
  reset: number
}

class GitHubAPIError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public rateLimitInfo?: RateLimitInfo
  ) {
    super(message)
    this.name = 'GitHubAPIError'
  }
}

/**
 * 获取 GitHub API Token
 */
function getGitHubToken(): string {
  const token = process.env.GITHUB_TOKEN
  if (!token) {
    throw new Error('GITHUB_TOKEN environment variable is not set')
  }
  return token
}

/**
 * 处理 API 速率限制
 */
async function handleRateLimit(response: Response): Promise<void> {
  const remaining = parseInt(response.headers.get('x-ratelimit-remaining') || '0')
  const reset = parseInt(response.headers.get('x-ratelimit-reset') || '0')
  
  if (remaining === 0) {
    const resetDate = new Date(reset * 1000)
    const waitTime = resetDate.getTime() - Date.now()
    
    console.warn(`⏳ GitHub API rate limit reached. Waiting until ${resetDate.toISOString()}`)
    
    if (waitTime > 0) {
      await new Promise(resolve => setTimeout(resolve, waitTime + 1000))
    }
  }
}

/**
 * 发送 GitHub API 请求
 */
async function fetchGitHub<T>(url: string, retries = 3): Promise<T> {
  const token = getGitHubToken()
  
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/vnd.github+json',
          'X-GitHub-Api-Version': '2022-11-28'
        }
      })
      
      // 处理速率限制
      if (response.status === 403) {
        const rateLimitInfo: RateLimitInfo = {
          limit: parseInt(response.headers.get('x-ratelimit-limit') || '0'),
          remaining: parseInt(response.headers.get('x-ratelimit-remaining') || '0'),
          reset: parseInt(response.headers.get('x-ratelimit-reset') || '0')
        }
        
        if (rateLimitInfo.remaining === 0) {
          await handleRateLimit(response)
          continue // 重试
        }
      }
      
      if (!response.ok) {
        throw new GitHubAPIError(
          `GitHub API error: ${response.statusText}`,
          response.status
        )
      }
      
      return await response.json() as T
    } catch (error) {
      if (attempt === retries) {
        throw error
      }
      
      // 指数退避
      const waitTime = Math.min(1000 * Math.pow(2, attempt - 1), 60000)
      console.warn(`⚠️  Request failed (attempt ${attempt}/${retries}), retrying in ${waitTime}ms...`)
      await new Promise(resolve => setTimeout(resolve, waitTime))
    }
  }
  
  throw new Error('Max retries exceeded')
}

/**
 * 搜索 GitHub 仓库
 * @param options 搜索选项
 * @returns 仓库列表
 */
export async function searchRepos(options: SearchReposOptions = {}): Promise<GitHubRepo[]> {
  const {
    topic = 'ai-agent',
    minStars = 0,
    maxResults = 100,
    sort = 'stars',
    order = 'desc'
  } = options
  
  // 构建搜索查询
  const queryParts: string[] = []
  
  if (topic) {
    queryParts.push(`topic:${topic}`)
  }
  
  if (minStars > 0) {
    queryParts.push(`stars:>=${minStars}`)
  }
  
  const query = queryParts.join(' ')
  
  // GitHub API 每页最多 100 条
  const perPage = Math.min(maxResults, 100)
  const pages = Math.ceil(maxResults / perPage)
  
  const allRepos: GitHubRepo[] = []
  
  for (let page = 1; page <= pages && allRepos.length < maxResults; page++) {
    const url = new URL('https://api.github.com/search/repositories')
    url.searchParams.set('q', query)
    url.searchParams.set('sort', sort)
    url.searchParams.set('order', order)
    url.searchParams.set('per_page', perPage.toString())
    url.searchParams.set('page', page.toString())
    
    console.log(`🔍 Searching GitHub: ${url.toString()}`)
    
    const response = await fetchGitHub<GitHubSearchResponse>(url.toString())
    
    allRepos.push(...response.items)
    
    console.log(`   Found ${response.items.length} repos (page ${page}/${pages})`)
    
    // 如果没有更多结果，提前退出
    if (response.items.length < perPage) {
      break
    }
    
    // 避免触发速率限制，页面之间延迟
    if (page < pages) {
      await new Promise(resolve => setTimeout(resolve, 1000))
    }
  }
  
  return allRepos.slice(0, maxResults)
}

/**
 * 获取仓库的 README 内容
 * @param owner 仓库所有者
 * @param repo 仓库名称
 * @returns README 内容（Markdown 格式）
 */
export async function fetchReadme(owner: string, repo: string): Promise<string | null> {
  try {
    const url = `https://api.github.com/repos/${owner}/${repo}/readme`
    
    const response = await fetchGitHub<{ content: string; encoding: string }>(url)
    
    // GitHub API 返回 base64 编码的内容
    if (response.encoding === 'base64') {
      const decoded = Buffer.from(response.content, 'base64').toString('utf-8')
      return decoded
    }
    
    return response.content
  } catch (error) {
    if (error instanceof GitHubAPIError && error.statusCode === 404) {
      console.warn(`⚠️  No README found for ${owner}/${repo}`)
      return null
    }
    throw error
  }
}

/**
 * 获取 API 速率限制状态
 */
export async function getRateLimitStatus(): Promise<RateLimitInfo> {
  const url = 'https://api.github.com/rate_limit'
  const response = await fetchGitHub<{
    resources: {
      core: RateLimitInfo
      search: RateLimitInfo
    }
  }>(url)
  
  return response.resources.search
}
