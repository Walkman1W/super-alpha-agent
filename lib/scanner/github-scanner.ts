/**
 * GitHub Scanner - Track A 扫描器
 * 从 GitHub API 获取仓库数据并提取评分相关信息
 * Requirements: 2.1-2.9
 */

import { GitHubScanResult, MCP_KEYWORDS } from '@/lib/types/scanner'

// GitHub API 基础 URL
const GITHUB_API_BASE = 'https://api.github.com'

// 标准接口关键词 (LangChain, Vercel AI SDK 等)
const STANDARD_INTERFACE_KEYWORDS = [
  'langchain',
  'vercel ai',
  'ai sdk',
  'openai',
  'anthropic',
  'llama-index',
  'llamaindex',
  'autogen',
  'crewai',
  'semantic-kernel'
]

// 机器就绪文件列表
const MACHINE_READY_FILES = {
  openapi: ['openapi.json', 'openapi.yaml', 'openapi.yml', 'swagger.json', 'swagger.yaml', 'swagger.yml'],
  manifest: ['manifest.json', 'package.json'],
  dockerfile: ['Dockerfile', 'dockerfile', 'docker-compose.yml', 'docker-compose.yaml']
}

interface GitHubRepoResponse {
  stargazers_count: number
  forks_count: number
  license: { key: string; name: string } | null
  homepage: string | null
  description: string | null
  topics: string[]
  pushed_at: string
  default_branch: string
}

interface GitHubCommitResponse {
  sha: string
  commit: {
    committer: {
      date: string
    }
  }
}

interface GitHubContentItem {
  name: string
  type: 'file' | 'dir'
  path: string
}

/**
 * 获取 GitHub API Token
 */
function getGitHubToken(): string | null {
  return process.env.GITHUB_TOKEN || null
}

/**
 * 构建请求头
 */
function buildHeaders(): HeadersInit {
  const headers: HeadersInit = {
    'Accept': 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28'
  }
  
  const token = getGitHubToken()
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }
  
  return headers
}

/**
 * 带重试的 fetch 请求
 */
async function fetchWithRetry<T>(
  url: string,
  maxRetries = 3,
  baseDelay = 1000
): Promise<T | null> {
  const headers = buildHeaders()
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const response = await fetch(url, { headers })
      
      // 处理速率限制
      if (response.status === 403) {
        const remaining = response.headers.get('x-ratelimit-remaining')
        if (remaining === '0') {
          const resetTime = parseInt(response.headers.get('x-ratelimit-reset') || '0') * 1000
          const waitTime = Math.max(resetTime - Date.now(), baseDelay * Math.pow(2, attempt))
          console.warn(`GitHub API rate limit reached, waiting ${waitTime}ms`)
          await new Promise(resolve => setTimeout(resolve, waitTime))
          continue
        }
      }
      
      // 404 表示资源不存在，返回 null
      if (response.status === 404) {
        return null
      }
      
      if (!response.ok) {
        throw new Error(`GitHub API error: ${response.status} ${response.statusText}`)
      }
      
      return await response.json() as T
    } catch (error) {
      if (attempt === maxRetries) {
        console.error(`Failed to fetch ${url} after ${maxRetries} attempts:`, error)
        return null
      }
      
      // 指数退避
      const delay = baseDelay * Math.pow(2, attempt - 1)
      console.warn(`Fetch attempt ${attempt} failed, retrying in ${delay}ms`)
      await new Promise(resolve => setTimeout(resolve, delay))
    }
  }
  
  return null
}

/**
 * 获取仓库基本信息
 */
async function fetchRepoInfo(owner: string, repo: string): Promise<GitHubRepoResponse | null> {
  const url = `${GITHUB_API_BASE}/repos/${owner}/${repo}`
  return fetchWithRetry<GitHubRepoResponse>(url)
}

/**
 * 获取最新提交信息
 */
async function fetchLatestCommit(owner: string, repo: string, branch: string): Promise<Date | null> {
  const url = `${GITHUB_API_BASE}/repos/${owner}/${repo}/commits/${branch}`
  const data = await fetchWithRetry<GitHubCommitResponse>(url)
  
  if (data?.commit?.committer?.date) {
    return new Date(data.commit.committer.date)
  }
  return null
}

/**
 * 获取仓库根目录文件列表
 */
async function fetchRepoContents(owner: string, repo: string): Promise<GitHubContentItem[]> {
  const url = `${GITHUB_API_BASE}/repos/${owner}/${repo}/contents`
  const data = await fetchWithRetry<GitHubContentItem[]>(url)
  return data || []
}

/**
 * 获取 README 内容
 */
async function fetchReadme(owner: string, repo: string): Promise<string> {
  const url = `${GITHUB_API_BASE}/repos/${owner}/${repo}/readme`
  const data = await fetchWithRetry<{ content: string; encoding: string }>(url)
  
  if (data?.content && data.encoding === 'base64') {
    try {
      return Buffer.from(data.content, 'base64').toString('utf-8')
    } catch {
      return ''
    }
  }
  return ''
}

/**
 * 检测 MCP 关键词
 */
export function detectMCP(content: string): boolean {
  const lowerContent = content.toLowerCase()
  return MCP_KEYWORDS.some(keyword => lowerContent.includes(keyword.toLowerCase()))
}

/**
 * 检测标准接口关键词
 */
export function detectStandardInterface(content: string): boolean {
  const lowerContent = content.toLowerCase()
  return STANDARD_INTERFACE_KEYWORDS.some(keyword => lowerContent.includes(keyword))
}

/**
 * 检测 README 中是否包含 Usage 代码块
 */
export function hasUsageCodeBlock(readme: string): boolean {
  // 检查是否有代码块
  const codeBlockPattern = /```[\s\S]*?```/g
  const codeBlocks = readme.match(codeBlockPattern)
  
  if (!codeBlocks || codeBlocks.length === 0) {
    return false
  }
  
  // 检查是否有 usage 相关的标题或内容
  const usageKeywords = ['usage', 'example', 'getting started', 'quick start', 'how to use', 'installation']
  const lowerReadme = readme.toLowerCase()
  
  return usageKeywords.some(keyword => lowerReadme.includes(keyword))
}

/**
 * 检测文件是否存在
 */
function checkFilesExist(
  contents: GitHubContentItem[],
  targetFiles: string[]
): boolean {
  const fileNames = contents
    .filter(item => item.type === 'file')
    .map(item => item.name.toLowerCase())
  
  return targetFiles.some(target => fileNames.includes(target.toLowerCase()))
}

/**
 * 扫描 GitHub 仓库
 * @param owner 仓库所有者
 * @param repo 仓库名称
 * @returns GitHub 扫描结果
 */
export async function scanGitHubRepo(owner: string, repo: string): Promise<GitHubScanResult | null> {
  // 获取仓库基本信息
  const repoInfo = await fetchRepoInfo(owner, repo)
  if (!repoInfo) {
    return null
  }
  
  // 并行获取其他信息
  const [latestCommit, contents, readme] = await Promise.all([
    fetchLatestCommit(owner, repo, repoInfo.default_branch),
    fetchRepoContents(owner, repo),
    fetchReadme(owner, repo)
  ])
  
  // 检测文件存在性
  const hasOpenAPI = checkFilesExist(contents, MACHINE_READY_FILES.openapi)
  const hasDockerfile = checkFilesExist(contents, MACHINE_READY_FILES.dockerfile)
  const hasManifest = checkFilesExist(contents, MACHINE_READY_FILES.manifest)
  
  // 合并内容用于关键词检测
  const combinedContent = [
    repoInfo.description || '',
    readme,
    repoInfo.topics.join(' ')
  ].join(' ')
  
  // 检测 MCP 和标准接口
  const hasMCP = detectMCP(combinedContent)
  const hasStandardInterface = detectStandardInterface(combinedContent)
  
  // 计算 README 行数
  const readmeLines = readme.split('\n').length
  
  return {
    stars: repoInfo.stargazers_count,
    forks: repoInfo.forks_count,
    lastCommitDate: latestCommit,
    hasLicense: repoInfo.license !== null,
    hasOpenAPI,
    hasDockerfile,
    hasManifest,
    readmeLength: readmeLines,
    hasUsageCodeBlock: hasUsageCodeBlock(readme),
    hasMCP,
    hasStandardInterface,
    homepage: repoInfo.homepage || null,
    description: repoInfo.description || '',
    topics: repoInfo.topics,
    owner,
    repo
  }
}

export type { GitHubScanResult }
