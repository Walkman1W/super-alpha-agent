import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { supabaseAdmin } from '@/lib/supabase'
import { analyzeURL } from '@/lib/url-analyzer'
import { sendPublishSuccessEmail } from '@/lib/email'
import { notifyAgentPublished } from '@/lib/indexnow'

/**
 * 检查是否为管理员邮箱
 */
function isAdminEmail(email: string): boolean {
  const adminEmails = process.env.ADMIN_EMAILS?.split(',').map(e => e.trim().toLowerCase()) || []
  return adminEmails.includes(email.toLowerCase())
}

const RequestSchema = z.object({
  email: z.string().email('无效的邮箱'),
  code: z.string().length(6, '验证码为6位数字')
})

/**
 * 生成唯一slug
 */
function generateSlug(name: string): string {
  const baseSlug = name
    .toLowerCase()
    .replace(/[^a-z0-9\u4e00-\u9fa5]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .substring(0, 100)
  
  const timestamp = Date.now().toString(36)
  return `${baseSlug}-${timestamp}`
}

/**
 * 查找或创建分类
 */
async function findOrCreateCategory(categoryName: string | undefined): Promise<string | null> {
  if (!categoryName) return null
  
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
  
  const { data: existing } = await (supabaseAdmin as any)
    .from('categories')
    .select('id')
    .eq('slug', slug)
    .single()
  
  if (existing) return (existing as { id: string }).id
  
  const { data: newCategory } = await (supabaseAdmin as any)
    .from('categories')
    .insert({ name: categoryName, slug, description: `${categoryName}类别的AI Agent` })
    .select('id')
    .single()
  
  return (newCategory as { id: string } | null)?.id || null
}

/**
 * POST /api/verify-and-publish
 * 
 * 新流程：验证邮箱 → 分析URL → 上架
 * 步骤2: 验证验证码，然后分析URL，最后创建Agent
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    const validation = RequestSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.errors[0].message },
        { status: 400 }
      )
    }
    
    const { email, code } = validation.data
    
    // 查找待验证的提交
    const { data: submissionRaw, error: fetchError } = await (supabaseAdmin as any)
      .from('agent_submissions')
      .select('*')
      .eq('email', email)
      .eq('verification_code', code)
      .eq('verified', false)
      .single()
    
    if (fetchError || !submissionRaw) {
      return NextResponse.json(
        { error: '验证码无效或已过期' },
        { status: 400 }
      )
    }
    
    const submission = submissionRaw as { 
      id: string
      url: string
      expires_at: string
      email: string
    }
    
    // 检查是否过期
    if (new Date(submission.expires_at) < new Date()) {
      return NextResponse.json(
        { error: '验证码已过期，请重新获取' },
        { status: 400 }
      )
    }
    
    // 邮箱验证通过，现在开始分析URL
    const analysisResult = await analyzeURL(submission.url)
    
    if (!analysisResult.success || !analysisResult.data) {
      // 更新提交状态，记录分析失败
      await (supabaseAdmin as any)
        .from('agent_submissions')
        .update({ 
          verified: true, 
          agent_data: { error: analysisResult.error } 
        })
        .eq('id', submission.id)
      
      return NextResponse.json(
        { error: analysisResult.error || '分析URL失败，请检查链接是否正确' },
        { status: 422 }
      )
    }
    
    const agentData = analysisResult.data
    const slug = generateSlug(agentData.name)
    const categoryId = await findOrCreateCategory(agentData.category)
    
    // 创建Agent
    const { data: agentResult, error: createError } = await (supabaseAdmin as any)
      .from('agents')
      .insert({
        slug,
        name: agentData.name,
        category_id: categoryId,
        short_description: agentData.short_description,
        detailed_description: agentData.detailed_description || null,
        key_features: agentData.key_features || [],
        use_cases: agentData.use_cases || [],
        pros: agentData.pros || [],
        cons: agentData.cons || [],
        how_to_use: agentData.how_to_use || null,
        platform: agentData.platform || null,
        pricing: agentData.pricing || null,
        official_url: submission.url,
        keywords: agentData.keywords || [],
        search_terms: [...(agentData.keywords || []), agentData.name.toLowerCase()],
        source: 'user_submission',
        submitter_email: email,
        last_crawled_at: new Date().toISOString()
      })
      .select('id, slug, name')
      .single()
    
    const agent = agentResult as { id: string; slug: string; name: string } | null
    
    if (createError || !agent) {
      console.error('Create agent error:', createError)
      return NextResponse.json(
        { error: '创建Agent失败，请重试' },
        { status: 500 }
      )
    }
    
    // 更新提交记录
    await (supabaseAdmin as any)
      .from('agent_submissions')
      .update({ 
        verified: true, 
        agent_id: agent.id,
        agent_data: agentData
      })
      .eq('id', submission.id)
    
    // 管理员立即清除缓存，普通用户等待ISR
    const isAdmin = isAdminEmail(email)
    if (isAdmin) {
      try {
        revalidatePath(`/agents/${agent.slug}`)
        revalidatePath('/agents')
        revalidatePath('/')
        console.log('Admin submission: cache cleared immediately for', agent.slug)
      } catch (error) {
        console.error('Revalidate path error:', error)
      }
    }
    
    // 发送成功通知邮件（异步）
    sendPublishSuccessEmail(email, agent.name, agent.slug).catch(err => {
      console.error('Send success email failed:', err)
    })
    
    // 通知 IndexNow (异步，不阻塞主流程) - 需求 4.1, 4.2
    notifyAgentPublished(agent.slug).catch(err => {
      console.error('IndexNow notification failed:', err)
      // 错误不影响主流程
    })
    
    return NextResponse.json({
      success: true,
      message: isAdmin 
        ? '🎉 Agent已成功上架！（管理员实时上线）' 
        : '🎉 Agent已成功上架！',
      agent: {
        id: agent.id,
        name: agent.name,
        slug: agent.slug,
        url: `/agents/${agent.slug}`
      },
      isAdmin,
      note: isAdmin 
        ? '管理员提交，立即可访问' 
        : '约1小时后可正常访问（首页已显示）'
    })
    
  } catch (error) {
    console.error('Verify and publish error:', error)
    return NextResponse.json(
      { error: '服务器错误，请稍后重试' },
      { status: 500 }
    )
  }
}
