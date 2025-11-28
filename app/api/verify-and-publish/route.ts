import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { supabaseAdmin } from '@/lib/supabase'
import { sendPublishSuccessEmail } from '@/lib/email'

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
  
  const { data: existing } = await supabaseAdmin
    .from('categories')
    .select('id')
    .eq('slug', slug)
    .single()
  
  if (existing) return existing.id
  
  const { data: newCategory } = await supabaseAdmin
    .from('categories')
    .insert({ name: categoryName, slug, description: `${categoryName}类别的AI Agent` })
    .select('id')
    .single()
  
  return newCategory?.id || null
}

/**
 * POST /api/verify-and-publish
 * 
 * 步骤2: 验证验证码，创建Agent，发送成功通知
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
    const { data: submission, error: fetchError } = await supabaseAdmin
      .from('agent_submissions')
      .select('*')
      .eq('email', email)
      .eq('verification_code', code)
      .eq('verified', false)
      .single()
    
    if (fetchError || !submission) {
      return NextResponse.json(
        { error: '验证码无效或已过期' },
        { status: 400 }
      )
    }
    
    // 检查是否过期
    if (new Date(submission.expires_at) < new Date()) {
      return NextResponse.json(
        { error: '验证码已过期，请重新获取' },
        { status: 400 }
      )
    }
    
    const agentData = submission.agent_data
    const slug = generateSlug(agentData.name)
    const categoryId = await findOrCreateCategory(agentData.category)
    
    // 创建Agent
    const { data: agent, error: createError } = await supabaseAdmin
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
    
    if (createError || !agent) {
      console.error('Create agent error:', createError)
      return NextResponse.json(
        { error: '创建Agent失败，请重试' },
        { status: 500 }
      )
    }
    
    // 标记提交为已验证
    await supabaseAdmin
      .from('agent_submissions')
      .update({ verified: true, agent_id: agent.id })
      .eq('id', submission.id)
    
    // 发送成功通知邮件（异步，不阻塞响应）
    sendPublishSuccessEmail(email, agent.name, agent.slug).catch(err => {
      console.error('Send success email failed:', err)
    })
    
    return NextResponse.json({
      success: true,
      message: '🎉 Agent已成功上架！',
      agent: {
        id: agent.id,
        name: agent.name,
        slug: agent.slug,
        url: `/agents/${agent.slug}`
      }
    })
    
  } catch (error) {
    console.error('Verify and publish error:', error)
    return NextResponse.json(
      { error: '服务器错误，请稍后重试' },
      { status: 500 }
    )
  }
}
