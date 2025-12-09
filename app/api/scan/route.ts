/**
 * 扫描 API 路由
 * 
 * POST /api/scan
 * 接受 URL 并返回 SR 评分结果
 * 
 * Requirements: 1.1-1.5, 9.1, 10.1-10.4
 */

import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { supabaseAdmin } from '@/lib/supabase'
import { detectURL } from '@/lib/scanner/url-detector'
import { scanGitHubRepo } from '@/lib/scanner/github-scanner'
import { scanSaaSWebsite } from '@/lib/scanner/saas-scanner'
import { calculateSRScore } from '@/lib/scanner/sr-calculator'
import { extractIOModalities } from '@/lib/scanner/io-extractor'
import { 
  scannerRateLimiter, 
  getClientIPFromRequest, 
  createRateLimitResponse,
  createRateLimitHeaders 
} from '@/lib/scanner/rate-limiter'
import { checkCacheWithMemory } from '@/lib/scanner/cache'
import { generateDiagnostics } from './diagnostics'
import type { 
  ScanRequest, 
  ScanResponse, 
  ScannerAgent,
  GitHubScanResult,
  SaaSScanResult,
  SRResult,
  IOResult
} from '@/lib/types/scanner'

// ============================================
// 请求验证 Schema
// ============================================

const ScanRequestSchema = z.object({
  url: z.string().min(1, 'URL 不能为空'),
  forceRescan: z.boolean().optional().default(false)
})

// ============================================
// 辅助函数
// ============================================

/**
 * 从 URL 生成 slug
 */
function generateSlugFromUrl(url: string, githubOwner?: string, githubRepo?: string): string {
  if (githubOwner && githubRepo) {
    return `${githubOwner}-${githubRepo}`.toLowerCase()
  }
  
  try {
    const parsed = new URL(url)
    // 使用域名作为 slug 基础
    const domain = parsed.hostname.replace(/^www\./, '').replace(/\./g, '-')
    return domain.toLowerCase()
  } catch {
    // 回退到时间戳
    return `agent-${Date.now()}`
  }
}

/**
 * 从 URL 生成名称
 */
function generateNameFromUrl(
  url: string, 
  githubOwner?: string, 
  githubRepo?: string,
  githubDescription?: string
): string {
  if (githubRepo) {
    return githubRepo
  }
  
  try {
    const parsed = new URL(url)
    return parsed.hostname.replace(/^www\./, '')
  } catch {
    return 'Unknown Agent'
  }
}

/**
 * 将扫描结果持久化到数据库
 */
async function persistScanResult(
  url: string,
  urlType: 'github' | 'saas',
  githubOwner: string | undefined,
  githubRepo: string | undefined,
  githubResult: GitHubScanResult | null,
  saasResult: SaaSScanResult | null,
  srResult: SRResult,
  ioResult: IOResult
): Promise<ScannerAgent> {
  const slug = generateSlugFromUrl(url, githubOwner, githubRepo)
  const name = generateNameFromUrl(
    url, 
    githubOwner, 
    githubRepo, 
    githubResult?.description
  )
  
  const now = new Date().toISOString()
  
  // 构建 Agent 数据
  const agentData = {
    slug,
    name,
    description: githubResult?.description || saasResult?.metaDescription || null,
    github_url: urlType === 'github' ? url : (githubResult?.homepage ? null : null),
    homepage_url: urlType === 'saas' ? url : githubResult?.homepage || null,
    api_docs_url: saasResult?.apiDocsUrl || null,
    sr_score: srResult.finalScore,
    sr_tier: srResult.tier,
    sr_track: srResult.track,
    score_github: srResult.scoreA,
    score_saas: srResult.scoreB,
    score_breakdown: srResult.breakdown,
    is_mcp: srResult.isMCP,
    is_claimed: false,
    is_verified: srResult.isVerified,
    input_types: ioResult.inputs,
    output_types: ioResult.outputs,
    meta_title: saasResult?.metaTitle || null,
    meta_description: saasResult?.metaDescription || githubResult?.description || null,
    og_image: saasResult?.ogImage || null,
    json_ld: saasResult?.jsonLdContent || null,
    github_stars: githubResult?.stars || 0,
    github_forks: githubResult?.forks || 0,
    github_last_commit: githubResult?.lastCommitDate?.toISOString() || null,
    last_scanned_at: now,
    updated_at: now
  }
  
  // Upsert: 如果 slug 存在则更新，否则插入
  const { data, error } = await supabaseAdmin
    .from('agents')
    .upsert(agentData, { 
      onConflict: 'slug',
      ignoreDuplicates: false 
    })
    .select()
    .single()
  
  if (error) {
    console.error('Failed to persist scan result:', error)
    throw new Error(`数据库错误: ${error.message}`)
  }
  
  // 记录扫描历史
  await supabaseAdmin
    .from('scan_history')
    .insert({
      agent_id: data.id,
      sr_score: srResult.finalScore,
      sr_tier: srResult.tier,
      sr_track: srResult.track,
      score_github: srResult.scoreA,
      score_saas: srResult.scoreB,
      score_breakdown: srResult.breakdown,
      scan_type: 'manual'
    })
    .catch(err => console.warn('Failed to record scan history:', err))
  
  // 转换为 ScannerAgent 类型
  return {
    id: data.id,
    slug: data.slug,
    name: data.name,
    description: data.description,
    githubUrl: data.github_url,
    homepageUrl: data.homepage_url,
    apiDocsUrl: data.api_docs_url,
    srScore: parseFloat(data.sr_score) || 0,
    srTier: data.sr_tier,
    srTrack: data.sr_track,
    scoreGithub: parseFloat(data.score_github) || 0,
    scoreSaas: parseFloat(data.score_saas) || 0,
    scoreBreakdown: data.score_breakdown,
    isMcp: data.is_mcp,
    isClaimed: data.is_claimed,
    isVerified: data.is_verified,
    inputTypes: data.input_types || [],
    outputTypes: data.output_types || [],
    metaTitle: data.meta_title,
    metaDescription: data.meta_description,
    ogImage: data.og_image,
    jsonLd: data.json_ld,
    githubStars: data.github_stars || 0,
    githubForks: data.github_forks || 0,
    githubLastCommit: data.github_last_commit ? new Date(data.github_last_commit) : null,
    lastScannedAt: data.last_scanned_at ? new Date(data.last_scanned_at) : null,
    createdAt: new Date(data.created_at),
    updatedAt: new Date(data.updated_at)
  }
}

// ============================================
// POST 处理函数
// ============================================

export async function POST(request: NextRequest) {
  try {
    // 1. 解析请求体
    const body = await request.json()
    const parseResult = ScanRequestSchema.safeParse(body)
    
    if (!parseResult.success) {
      return NextResponse.json(
        { 
          error: 'Invalid request',
          message: parseResult.error.errors[0]?.message || '请求参数无效'
        },
        { status: 400 }
      )
    }
    
    const { url, forceRescan } = parseResult.data
    
    // 2. 检测 URL 类型
    const urlResult = detectURL(url)
    
    if (urlResult.type === 'invalid') {
      return NextResponse.json(
        { 
          error: 'Invalid URL',
          message: '无效的 URL 格式。请输入有效的 GitHub 仓库 URL 或网站 URL。'
        },
        { status: 400 }
      )
    }
    
    // 3. 速率限制检查
    const clientIP = getClientIPFromRequest(request)
    // TODO: 从认证中获取用户信息
    const isAuthenticated = false
    const userId = undefined
    
    const rateLimitResult = await scannerRateLimiter.checkAndUpdate(
      clientIP, 
      userId, 
      isAuthenticated
    )
    
    if (!rateLimitResult.allowed) {
      return createRateLimitResponse(rateLimitResult)
    }
    
    // 4. 检查缓存
    const cacheResult = await checkCacheWithMemory(urlResult.normalizedUrl, forceRescan)
    
    if (cacheResult.hit && cacheResult.agent) {
      // 返回缓存结果
      const diagnostics = generateDiagnostics(
        cacheResult.agent.srTrack === 'OpenSource' || cacheResult.agent.srTrack === 'Hybrid'
          ? {
              stars: cacheResult.agent.githubStars,
              forks: cacheResult.agent.githubForks,
              lastCommitDate: cacheResult.agent.githubLastCommit,
              hasLicense: true, // 从缓存无法获取，假设为 true
              hasOpenAPI: cacheResult.agent.scoreBreakdown.readinessScore >= 1.5,
              hasDockerfile: cacheResult.agent.scoreBreakdown.readinessScore >= 2.0,
              hasManifest: false,
              readmeLength: cacheResult.agent.scoreBreakdown.readinessScore >= 3.0 ? 250 : 100,
              hasUsageCodeBlock: cacheResult.agent.scoreBreakdown.readinessScore >= 3.0,
              hasMCP: cacheResult.agent.isMcp,
              hasStandardInterface: cacheResult.agent.scoreBreakdown.protocolScore >= 1.0,
              homepage: cacheResult.agent.homepageUrl,
              description: cacheResult.agent.description || '',
              topics: [],
              owner: '',
              repo: ''
            }
          : null,
        cacheResult.agent.srTrack === 'SaaS' || cacheResult.agent.srTrack === 'Hybrid'
          ? {
              httpsValid: cacheResult.agent.scoreBreakdown.trustScore >= 1.0,
              sslValidMonths: 12,
              socialLinks: cacheResult.agent.scoreBreakdown.trustScore >= 2.0 ? ['twitter', 'github'] : [],
              hasJsonLd: cacheResult.agent.scoreBreakdown.aeoScore >= 2.0,
              jsonLdContent: cacheResult.agent.jsonLd,
              hasBasicMeta: cacheResult.agent.scoreBreakdown.aeoScore >= 1.0,
              metaTitle: cacheResult.agent.metaTitle,
              metaDescription: cacheResult.agent.metaDescription,
              hasH1: true,
              hasOgTags: cacheResult.agent.scoreBreakdown.aeoScore >= 4.0,
              ogImage: cacheResult.agent.ogImage,
              ogTitle: cacheResult.agent.metaTitle,
              hasApiDocsPath: cacheResult.agent.scoreBreakdown.interopScore >= 1.5,
              apiDocsUrl: cacheResult.agent.apiDocsUrl,
              hasIntegrationKeywords: cacheResult.agent.scoreBreakdown.interopScore >= 2.5,
              integrationKeywords: [],
              hasLoginButton: cacheResult.agent.scoreBreakdown.interopScore >= 3.0,
              pageContent: ''
            }
          : null,
        cacheResult.agent.scoreBreakdown
      )
      
      const response: ScanResponse = {
        agent: cacheResult.agent,
        isNew: false,
        isCached: true,
        cacheAge: cacheResult.cacheAgeMinutes || 0,
        diagnostics
      }
      
      return NextResponse.json(response, {
        headers: createRateLimitHeaders(rateLimitResult)
      })
    }
    
    // 5. 执行扫描
    let githubResult: GitHubScanResult | null = null
    let saasResult: SaaSScanResult | null = null
    
    if (urlResult.type === 'github' && urlResult.githubOwner && urlResult.githubRepo) {
      // Track A: GitHub 扫描
      githubResult = await scanGitHubRepo(urlResult.githubOwner, urlResult.githubRepo)
      
      if (!githubResult) {
        return NextResponse.json(
          { 
            error: 'GitHub repository not found',
            message: 'GitHub 仓库未找到。请检查 URL 是否正确。'
          },
          { status: 404 }
        )
      }
      
      // 如果有 homepage，触发 Track B 扫描 (混合型)
      if (githubResult.homepage) {
        try {
          saasResult = await scanSaaSWebsite(githubResult.homepage)
        } catch (err) {
          console.warn('Failed to scan homepage:', err)
          // 继续处理，不阻塞
        }
      }
    } else {
      // Track B: SaaS 扫描
      try {
        saasResult = await scanSaaSWebsite(urlResult.normalizedUrl)
      } catch (err) {
        console.error('SaaS scan failed:', err)
        return NextResponse.json(
          { 
            error: 'Website scan failed',
            message: '无法访问指定的 URL。请检查网站是否可访问。'
          },
          { status: 502 }
        )
      }
    }
    
    // 6. 计算 SR 分数
    const srResult = calculateSRScore(githubResult, saasResult, false)
    
    // 7. 提取 I/O 模态
    const contentForIO = [
      githubResult?.description || '',
      saasResult?.metaDescription || '',
      saasResult?.pageContent?.slice(0, 5000) || '' // 限制内容长度
    ].join(' ')
    
    const ioResult = extractIOModalities(contentForIO)
    
    // 8. 持久化到数据库
    const agent = await persistScanResult(
      urlResult.normalizedUrl,
      urlResult.type as 'github' | 'saas',
      urlResult.githubOwner,
      urlResult.githubRepo,
      githubResult,
      saasResult,
      srResult,
      ioResult
    )
    
    // 9. 生成诊断信息
    const diagnostics = generateDiagnostics(githubResult, saasResult, srResult.breakdown)
    
    // 10. 返回响应
    const response: ScanResponse = {
      agent,
      isNew: true,
      isCached: false,
      diagnostics
    }
    
    return NextResponse.json(response, {
      headers: createRateLimitHeaders(rateLimitResult)
    })
    
  } catch (error) {
    console.error('Scan API error:', error)
    
    // 处理特定错误类型
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          error: 'Validation error',
          message: error.errors[0]?.message || '请求参数验证失败'
        },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { 
        error: 'Internal server error',
        message: '服务暂时不可用，请稍后重试'
      },
      { status: 500 }
    )
  }
}

// ============================================
// GET 处理函数 (用于健康检查)
// ============================================

export async function GET() {
  return NextResponse.json({
    status: 'ok',
    service: 'scan-api',
    timestamp: new Date().toISOString()
  })
}
