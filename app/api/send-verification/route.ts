import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { supabaseAdmin } from '@/lib/supabase'
import { validateURL, analyzeURL } from '@/lib/url-analyzer'
import { generateVerificationCode, sendVerificationEmail } from '@/lib/email'

const RequestSchema = z.object({
  url: z.string().min(1, 'URL不能为空'),
  email: z.string().email('请输入有效的邮箱地址')
})

// 简单速率限制
const rateLimitMap = new Map<string, { count: number; resetTime: number }>()

function checkRateLimit(key: string, maxRequests = 3, windowMs = 60000): boolean {
  const now = Date.now()
  const record = rateLimitMap.get(key)
  
  if (!record || now > record.resetTime) {
    rateLimitMap.set(key, { count: 1, resetTime: now + windowMs })
    return true
  }
  
  if (record.count >= maxRequests) return false
  record.count++
  return true
}

/**
 * POST /api/send-verification
 * 
 * 步骤1: 验证URL和邮箱，分析Agent，发送验证码
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // 验证请求
    const validation = RequestSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.errors[0].message },
        { status: 400 }
      )
    }
    
    const { url, email } = validation.data
    
    // 速率限制（每邮箱每分钟3次）
    if (!checkRateLimit(email)) {
      return NextResponse.json(
        { error: '请求过于频繁，请稍后重试' },
        { status: 429 }
      )
    }
    
    // 验证URL格式
    const urlValidation = validateURL(url)
    if (!urlValidation.isValid) {
      return NextResponse.json(
        { error: urlValidation.error },
        { status: 400 }
      )
    }
    
    // 检查URL是否已存在
    const { data: existingAgent } = await supabaseAdmin
      .from('agents')
      .select('id, name, status')
      .eq('official_url', urlValidation.url)
      .single()
    
    if (existingAgent) {
      return NextResponse.json(
        { error: '该Agent已存在于平台' },
        { status: 409 }
      )
    }
    
    // 分析URL获取Agent信息
    const analysisResult = await analyzeURL(url)
    if (!analysisResult.success || !analysisResult.data) {
      return NextResponse.json(
        { error: analysisResult.error || '无法分析该URL' },
        { status: 422 }
      )
    }
    
    // 生成验证码
    const code = generateVerificationCode()
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000) // 10分钟后过期
    
    // 存储待验证的提交（使用临时表或直接存储）
    const { data: submission, error: insertError } = await supabaseAdmin
      .from('agent_submissions')
      .upsert({
        email,
        url: urlValidation.url,
        agent_data: analysisResult.data,
        verification_code: code,
        expires_at: expiresAt.toISOString(),
        verified: false
      }, {
        onConflict: 'email,url'
      })
      .select('id')
      .single()
    
    if (insertError) {
      console.error('Insert submission error:', insertError)
      // 如果表不存在，返回友好提示
      if (insertError.code === '42P01') {
        return NextResponse.json(
          { error: '系统配置中，请稍后重试' },
          { status: 500 }
        )
      }
      return NextResponse.json(
        { error: '保存失败，请重试' },
        { status: 500 }
      )
    }
    
    // 发送验证邮件
    const emailResult = await sendVerificationEmail(
      email, 
      code, 
      analysisResult.data.name
    )
    
    if (!emailResult.success) {
      return NextResponse.json(
        { error: emailResult.error || '发送验证邮件失败' },
        { status: 500 }
      )
    }
    
    return NextResponse.json({
      success: true,
      message: '验证码已发送到你的邮箱',
      agentName: analysisResult.data.name,
      submissionId: submission?.id
    })
    
  } catch (error) {
    console.error('Send verification error:', error)
    return NextResponse.json(
      { error: '服务器错误，请稍后重试' },
      { status: 500 }
    )
  }
}
