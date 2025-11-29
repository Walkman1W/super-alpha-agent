import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { validateURL, analyzeURL, AgentData } from '@/lib/url-analyzer'
import { 
  SafeAgentSubmissionSchema, 
  type SafeAgentSubmission,
  DEFAULT_SECURITY_HEADERS
} from '@/lib/security'
import { 
  agentSubmissionLimiter,
  getClientIP,
  createRateLimitHeaders
} from '@/lib/rate-limiter'

/**
 * 提交Agent请求的Schema验证（使用安全增强版本）
 */
const SubmitAgentSchema = SafeAgentSubmissionSchema

export type SubmitAgentRequest = SafeAgentSubmission

/**
 * 生成唯一的slug
 */
function generateSlug(name: string): string {
  const baseSlug = name
    .toLowerCase()
    .replace(/[^a-z0-9\u4e00-\u9fa5]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .substring(0, 100)
  
  // 添加时间戳确保唯一性
  const timestamp = Date.now().toString(36)
  return `${baseSlug}-${timestamp}`
}

/**
 * 查找或创建分类
 */
async function findOrCreateCategory(categoryName: string | undefined): Promise<string | null> {
  if (!categoryName) return null
  
  // 分类映射
  const categoryMap: Record<string, string> = {
    '开发工具': 'development',
    '内容创作': 'content-creation',
    '数据分析': 'data-analysis',
    '设计': 'design',
    '营销': 'marketing',
    '客服': 'customer-service',
    '教育': 'education',
    '研究': 'research',
    '生产力': 'productivity',
    '其他': 'other'
  }
  
  const slug = categoryMap[categoryName] || 'other'
  
  // 查找现有分类
  const { data: existing } = await supabaseAdmin
    .from('categories')
    .select('id')
    .eq('slug', slug)
    .single()
  
  if (existing) {
    return existing.id
  }
  
  // 创建新分类
  const { data: newCategory, error } = await supabaseAdmin
    .from('categories')
    .insert({
      name: categoryName,
      slug,
      description: `${categoryName}类别的AI Agent`
    })
    .select('id')
    .single()
  
  if (error) {
    console.error('Failed to create category:', error)
    return null
  }
  
  return newCategory?.id || null
}

/**
 * 创建Agent记录
 */
async function createAgent(
  data: AgentData & { source_url: string },
  email?: string,
  notes?: string
): Promise<{ id: string; slug: string } | null> {
  // 数据已经通过Zod schema验证和清理，可以安全使用
  const slug = generateSlug(data.name)
  const categoryId = await findOrCreateCategory(data.category)
  
  const agentData = {
    slug,
    name: data.name,
    category_id: categoryId,
    short_description: data.short_description,
    detailed_description: data.detailed_description || null,
    key_features: data.key_features,
    use_cases: data.use_cases || [],
    pros: data.pros || [],
    cons: data.cons || [],
    how_to_use: data.how_to_use || null,
    platform: data.platform || null,
    pricing: data.pricing || null,
    official_url: data.source_url,
    keywords: data.keywords || [],
    search_terms: [...(data.keywords || []), data.name.toLowerCase()],
    source: 'user_submission',
    last_crawled_at: new Date().toISOString()
  }
  
  const { data: agent, error } = await supabaseAdmin
    .from('agents')
    .insert(agentData)
    .select('id, slug')
    .single()
  
  if (error) {
    console.error('Failed to create agent:', error)
    throw new Error(`数据库存储失败: ${error.message}`)
  }
  
  // 如果有email或notes，记录到提交表（可选）
  if (email || notes) {
    // 这里可以存储到单独的提交记录表
    console.log('Submission metadata:', { email, notes, agentId: agent?.id })
  }
  
  return agent
}


/**
 * POST /api/submit-agent
 * 
 * 提交新的AI Agent到平台
 * 
 * 流程:
 * 1. 验证请求数据
 * 2. 检查速率限制
 * 3. 验证URL格式
 * 4. 调用URL分析服务
 * 5. 存储到数据库
 * 6. 返回结果
 * 
 * 需求: 5.2, 5.3, 5.4, 5.5, 6.5
 */
export async function POST(request: NextRequest) {
  try {
    // Step 1: 解析请求体
    let body: unknown
    try {
      body = await request.json()
    } catch {
      return NextResponse.json(
        { error: '无效的JSON格式' },
        { status: 400 }
      )
    }
    
    // Step 2: 验证请求数据 - 需求 5.2
    const validation = SubmitAgentSchema.safeParse(body)
    if (!validation.success) {
      const errors = validation.error.errors.map(e => e.message)
      return NextResponse.json(
        { error: '请求数据验证失败', details: errors },
        { status: 400 }
      )
    }
    
    const { url, email, notes } = validation.data
    
    // Step 3: 检查速率限制 - 需求 5.3, 9.5
    const clientIP = getClientIP(request)
    
    // Check rate limit (handle both sync and async limiters)
    let rateLimitResult
    if ('check' in agentSubmissionLimiter) {
      const checkResult = agentSubmissionLimiter.check(clientIP)
      rateLimitResult = checkResult instanceof Promise ? await checkResult : checkResult
    } else {
      throw new Error('Invalid rate limiter')
    }
    
    if (!rateLimitResult.allowed) {
      const rateLimitHeaders = createRateLimitHeaders(rateLimitResult)
      
      return NextResponse.json(
        { 
          error: '请求过于频繁，请稍后重试',
          retryAfter: rateLimitResult.retryAfter,
          limit: rateLimitResult.limit,
          remaining: rateLimitResult.remaining
        },
        { 
          status: 429,
          headers: rateLimitHeaders
        }
      )
    }
    
    // Step 4: 验证URL格式 - 需求 5.2
    const urlValidation = validateURL(url)
    if (!urlValidation.isValid) {
      return NextResponse.json(
        { error: urlValidation.error || '无效的URL' },
        { status: 400 }
      )
    }
    
    // Step 5: 检查URL是否已存在
    const { data: existingAgent } = await supabaseAdmin
      .from('agents')
      .select('id, slug, name')
      .eq('official_url', urlValidation.url)
      .single()
    
    if (existingAgent) {
      return NextResponse.json(
        { 
          error: '该Agent已存在',
          existing: {
            id: existingAgent.id,
            slug: existingAgent.slug,
            name: existingAgent.name
          }
        },
        { status: 409 }
      )
    }
    
    // Step 6: 调用URL分析服务 - 需求 5.3, 5.4
    const analysisResult = await analyzeURL(url)
    
    if (!analysisResult.success || !analysisResult.data) {
      return NextResponse.json(
        { error: analysisResult.error || '分析失败' },
        { status: 422 }
      )
    }
    
    // Step 7: 存储到数据库 - 需求 5.5, 6.5
    const agent = await createAgent(
      analysisResult.data,
      email || undefined,
      notes || undefined
    )
    
    if (!agent) {
      return NextResponse.json(
        { error: '创建Agent失败' },
        { status: 500 }
      )
    }
    
    // Step 8: 返回成功结果（添加安全头部和速率限制头部）
    const response = NextResponse.json({
      success: true,
      message: 'Agent提交成功',
      agent: {
        id: agent.id,
        slug: agent.slug,
        name: analysisResult.data.name,
        url: `/agents/${agent.slug}`
      }
    }, { status: 201 })
    
    // 添加安全响应头
    Object.entries(DEFAULT_SECURITY_HEADERS).forEach(([key, value]) => {
      response.headers.set(key, value)
    })
    
    // 添加速率限制头部
    const rateLimitHeaders = createRateLimitHeaders(rateLimitResult)
    Object.entries(rateLimitHeaders).forEach(([key, value]) => {
      response.headers.set(key, value)
    })
    
    return response
    
  } catch (error) {
    console.error('Submit agent error:', error)
    
    // 区分不同类型的错误
    if (error instanceof Error) {
      if (error.message.includes('数据库')) {
        return NextResponse.json(
          { error: error.message },
          { status: 500 }
        )
      }
    }
    
    return NextResponse.json(
      { error: '服务器内部错误，请稍后重试' },
      { status: 500 }
    )
  }
}

/**
 * GET /api/submit-agent
 * 
 * 获取提交状态或检查URL是否已存在
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const url = searchParams.get('url')
    
    if (!url) {
      return NextResponse.json(
        { error: 'url参数是必需的' },
        { status: 400 }
      )
    }
    
    // 验证URL格式
    const urlValidation = validateURL(url)
    if (!urlValidation.isValid) {
      return NextResponse.json(
        { error: urlValidation.error || '无效的URL' },
        { status: 400 }
      )
    }
    
    // 检查是否已存在
    const { data: existingAgent } = await supabaseAdmin
      .from('agents')
      .select('id, slug, name, created_at')
      .eq('official_url', urlValidation.url)
      .single()
    
    if (existingAgent) {
      return NextResponse.json({
        exists: true,
        agent: {
          id: existingAgent.id,
          slug: existingAgent.slug,
          name: existingAgent.name,
          url: `/agents/${existingAgent.slug}`,
          created_at: existingAgent.created_at
        }
      })
    }
    
    return NextResponse.json({
      exists: false
    })
    
  } catch (error) {
    console.error('Check agent error:', error)
    return NextResponse.json(
      { error: '服务器内部错误' },
      { status: 500 }
    )
  }
}
