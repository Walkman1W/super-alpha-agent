/**
 * 生成器 API 路由
 * 提供 JSON-LD、徽章、提示词生成服务
 * 
 * POST /api/generate
 * Body: { agentSlug: string, type: 'jsonld' | 'badge' | 'prompt' }
 * 
 * 验证: 需求 6.4, 6.8, 8.5
 */

import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { generateJSONLD } from '@/lib/generators/json-ld-generator'
import { generateBadge, generateMarkdownEmbed } from '@/lib/generators/badge-generator'
import { generatePrompt } from '@/lib/generators/prompt-generator'
import type { 
  ScannerAgent, 
  GeneratorType, 
  SRScoreBreakdown,
  SRTier,
  SRTrack,
  IOModality
} from '@/lib/types/scanner'

/**
 * 请求体类型
 */
interface GenerateRequestBody {
  agentSlug: string
  type: GeneratorType
}

/**
 * 验证请求体
 */
function validateRequest(body: unknown): { valid: true; data: GenerateRequestBody } | { valid: false; error: string } {
  if (!body || typeof body !== 'object') {
    return { valid: false, error: '请求体必须是 JSON 对象' }
  }

  const { agentSlug, type } = body as Record<string, unknown>

  if (!agentSlug || typeof agentSlug !== 'string') {
    return { valid: false, error: 'agentSlug 是必需的字符串参数' }
  }

  if (!type || typeof type !== 'string') {
    return { valid: false, error: 'type 是必需的参数' }
  }

  const validTypes: GeneratorType[] = ['jsonld', 'badge', 'prompt']
  if (!validTypes.includes(type as GeneratorType)) {
    return { valid: false, error: `type 必须是以下之一: ${validTypes.join(', ')}` }
  }

  return { 
    valid: true, 
    data: { agentSlug: agentSlug.trim(), type: type as GeneratorType } 
  }
}

/**
 * 从数据库获取 Agent 数据
 */
async function getAgentBySlug(slug: string): Promise<ScannerAgent | null> {
  const { data, error } = await supabaseAdmin
    .from('agents')
    .select('*')
    .eq('slug', slug)
    .single()

  if (error || !data) {
    return null
  }

  // 转换数据库记录为 ScannerAgent 类型
  return transformToScannerAgent(data)
}

/**
 * 转换数据库记录为 ScannerAgent 类型
 */
function transformToScannerAgent(dbRecord: Record<string, unknown>): ScannerAgent {
  // 解析 score_breakdown，提供默认值
  const defaultBreakdown: SRScoreBreakdown = {
    starsScore: 0,
    forksScore: 0,
    vitalityScore: 0,
    readinessScore: 0,
    protocolScore: 0,
    trustScore: 0,
    aeoScore: 0,
    interopScore: 0
  }

  let scoreBreakdown = defaultBreakdown
  if (dbRecord.score_breakdown && typeof dbRecord.score_breakdown === 'object') {
    scoreBreakdown = {
      ...defaultBreakdown,
      ...(dbRecord.score_breakdown as Partial<SRScoreBreakdown>)
    }
  }

  // 解析 I/O 类型
  const inputTypes = parseIOTypes(dbRecord.input_types)
  const outputTypes = parseIOTypes(dbRecord.output_types)

  return {
    id: String(dbRecord.id || ''),
    slug: String(dbRecord.slug || ''),
    name: String(dbRecord.name || ''),
    description: dbRecord.short_description as string | null || dbRecord.detailed_description as string | null,
    
    // URLs
    githubUrl: dbRecord.github_url as string | null,
    homepageUrl: dbRecord.homepage_url as string | null || dbRecord.official_url as string | null,
    apiDocsUrl: dbRecord.api_docs_url as string | null,
    
    // SR 评分
    srScore: Number(dbRecord.sr_score) || 0,
    srTier: (dbRecord.sr_tier as SRTier) || 'C',
    srTrack: (dbRecord.sr_track as SRTrack) || 'SaaS',
    scoreGithub: Number(dbRecord.score_github) || 0,
    scoreSaas: Number(dbRecord.score_saas) || 0,
    scoreBreakdown,
    
    // 标志位
    isMcp: Boolean(dbRecord.is_mcp),
    isClaimed: Boolean(dbRecord.is_claimed),
    isVerified: Boolean(dbRecord.is_verified),
    
    // I/O 模态
    inputTypes,
    outputTypes,
    
    // 元数据
    metaTitle: dbRecord.meta_title as string | null,
    metaDescription: dbRecord.meta_description as string | null,
    ogImage: dbRecord.og_image as string | null,
    jsonLd: dbRecord.json_ld as object | null,
    
    // GitHub 特定字段
    githubStars: Number(dbRecord.github_stars) || 0,
    githubForks: Number(dbRecord.github_forks) || 0,
    githubLastCommit: dbRecord.github_last_commit ? new Date(dbRecord.github_last_commit as string) : null,
    
    // 时间戳
    lastScannedAt: dbRecord.last_scanned_at ? new Date(dbRecord.last_scanned_at as string) : null,
    createdAt: new Date(dbRecord.created_at as string || Date.now()),
    updatedAt: new Date(dbRecord.updated_at as string || Date.now())
  }
}

/**
 * 解析 I/O 类型数组
 */
function parseIOTypes(value: unknown): IOModality[] {
  if (!value) return ['Unknown']
  if (Array.isArray(value)) {
    const validTypes: IOModality[] = ['Text', 'Image', 'Audio', 'JSON', 'Code', 'File', 'Video', 'Unknown']
    const parsed = value.filter(v => validTypes.includes(v as IOModality)) as IOModality[]
    return parsed.length > 0 ? parsed : ['Unknown']
  }
  return ['Unknown']
}

/**
 * 记录生成事件用于分析
 * 注意: 当前仅记录到控制台，未来可扩展到数据库
 */
async function trackGenerateEvent(
  agentSlug: string, 
  type: GeneratorType,
  success: boolean
): Promise<void> {
  // 记录到控制台用于调试和监控
  // 未来可扩展到专门的分析表或第三方服务
  console.log(`[Generate Event] ${type} for ${agentSlug}: ${success ? 'success' : 'failed'}`)
}

/**
 * POST /api/generate
 * 生成 JSON-LD、徽章或提示词
 */
export async function POST(request: NextRequest) {
  try {
    // 解析请求体
    let body: unknown
    try {
      body = await request.json()
    } catch {
      return NextResponse.json(
        { error: '无效的 JSON 请求体' },
        { status: 400 }
      )
    }

    // 验证请求
    const validation = validateRequest(body)
    if (!validation.valid) {
      return NextResponse.json(
        { error: validation.error },
        { status: 400 }
      )
    }

    const { agentSlug, type } = validation.data

    // 获取 Agent 数据
    const agent = await getAgentBySlug(agentSlug)
    if (!agent) {
      return NextResponse.json(
        { error: `未找到 Agent: ${agentSlug}` },
        { status: 404 }
      )
    }

    // 根据类型生成内容
    let result: unknown
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://agentsignals.ai'

    switch (type) {
      case 'jsonld': {
        const jsonldOutput = generateJSONLD(agent)
        result = {
          type: 'jsonld',
          agent: {
            slug: agent.slug,
            name: agent.name,
            srScore: agent.srScore,
            srTier: agent.srTier
          },
          jsonLd: jsonldOutput.jsonLd,
          jsonLdString: jsonldOutput.jsonLdString,
          deploymentInstructions: jsonldOutput.deploymentInstructions
        }
        break
      }

      case 'badge': {
        const badgeOutput = generateBadge(
          agent.slug,
          agent.srTier,
          agent.srScore,
          agent.name,
          baseUrl
        )
        const markdownEmbed = generateMarkdownEmbed(
          badgeOutput.svgUrl,
          `${baseUrl}/agents/${agent.slug}`,
          agent.srTier,
          agent.srScore
        )
        result = {
          type: 'badge',
          agent: {
            slug: agent.slug,
            name: agent.name,
            srScore: agent.srScore,
            srTier: agent.srTier
          },
          svgUrl: badgeOutput.svgUrl,
          svgContent: badgeOutput.svgContent,
          embedCode: badgeOutput.embedCode,
          markdownEmbed,
          tier: badgeOutput.tier,
          color: badgeOutput.color
        }
        break
      }

      case 'prompt': {
        const promptOutput = generatePrompt(agent)
        result = {
          type: 'prompt',
          agent: {
            slug: agent.slug,
            name: agent.name,
            srScore: agent.srScore,
            srTier: agent.srTier
          },
          systemPrompt: promptOutput.systemPrompt,
          hasStructuredAPI: promptOutput.hasStructuredAPI,
          apiEndpoint: promptOutput.apiEndpoint
        }
        break
      }

      default:
        return NextResponse.json(
          { error: `不支持的生成类型: ${type}` },
          { status: 400 }
        )
    }

    // 记录生成事件（异步，不阻塞响应）
    trackGenerateEvent(agentSlug, type, true).catch(() => {})

    return NextResponse.json({
      success: true,
      data: result
    })

  } catch (error) {
    console.error('Generate API error:', error)
    return NextResponse.json(
      { 
        error: '生成失败，请稍后重试',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

/**
 * GET /api/generate
 * 返回 API 使用说明
 */
export async function GET() {
  return NextResponse.json({
    name: 'Agent Signals Generator API',
    version: '1.0.0',
    description: '为 Agent 生成 JSON-LD、徽章和提示词',
    usage: {
      method: 'POST',
      contentType: 'application/json',
      body: {
        agentSlug: 'string (required) - Agent 的 slug 标识符',
        type: "string (required) - 生成类型: 'jsonld' | 'badge' | 'prompt'"
      },
      examples: [
        {
          description: '生成 JSON-LD',
          body: { agentSlug: 'my-agent', type: 'jsonld' }
        },
        {
          description: '生成徽章',
          body: { agentSlug: 'my-agent', type: 'badge' }
        },
        {
          description: '生成提示词',
          body: { agentSlug: 'my-agent', type: 'prompt' }
        }
      ]
    },
    responses: {
      200: '成功生成内容',
      400: '请求参数错误',
      404: 'Agent 未找到',
      500: '服务器内部错误'
    }
  })
}
