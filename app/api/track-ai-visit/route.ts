import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { extractAIBotFromHeaders, getClientIP, validateAIVisit, detectBotFromReferer } from '@/lib/ai-detector'
import { addCacheHeaders, CACHE_STRATEGIES } from '@/lib/cache-utils'

/**
 * 访问类型
 * - bot_crawl: AI Bot 在索引内容 (GPTBot, ClaudeBot 等 User-Agent)
 * - ai_referral: 用户从 AI 对话跳转过来 (Referer 来自 chat.openai.com 等)
 * - organic: 普通访问
 */
type VisitType = 'bot_crawl' | 'ai_referral' | 'organic'

/**
 * API 端点：智能追踪 AI 访问
 * 
 * 自动检测两种 AI 相关访问：
 * 1. Bot 爬取 - AI 搜索引擎在索引你的内容
 * 2. AI 引荐 - 用户从 AI 对话界面跳转过来
 * 
 * 关键特性：
 * - 检测 ChatGPT、Claude、Perplexity 等机器人 (User-Agent)
 * - 检测用户从 AI 跳转 (Referer)
 * - 分别记录两种访问类型
 * - 防刷机制
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { agent_slug, referrer: clientReferrer } = body

    if (!agent_slug) {
      return NextResponse.json({ error: 'agent_slug is required' }, { status: 400 })
    }

    // 获取 Agent ID
    const { data: agent, error: agentError } = await supabaseAdmin
      .from('agents')
      .select('id, ai_search_count')
      .eq('slug', agent_slug)
      .single()

    if (agentError || !agent) {
      return NextResponse.json({ error: 'Agent not found' }, { status: 404 })
    }

    const headers = request.headers
    const ipAddress = getClientIP(headers)
    const serverReferer = headers.get('referer') || ''
    
    // 优先使用客户端传来的 referrer (document.referrer)，因为更准确
    const effectiveReferer = clientReferrer || serverReferer

    // 检测 AI Bot (通过 User-Agent)
    const aiBot = extractAIBotFromHeaders(headers)
    
    // 检测 AI 引荐 (通过 Referer)
    const aiFromReferer = detectBotFromReferer(effectiveReferer)

    let visitType: VisitType = 'organic'
    let aiName: string | null = null
    let detectionMethod: string | null = null

    // 优先级：Bot 爬取 > AI 引荐 > 普通访问
    if (aiBot) {
      visitType = 'bot_crawl'
      aiName = aiBot.name
      detectionMethod = 'user_agent'
    } else if (aiFromReferer) {
      visitType = 'ai_referral'
      aiName = aiFromReferer
      detectionMethod = 'referer'
    }

    // 如果检测到 AI 相关访问，记录并更新计数
    if (aiName && visitType !== 'organic') {
      // 获取最近的访问记录用于防刷验证
      const { data: recentVisits } = await supabaseAdmin
        .from('ai_visits')
        .select('ai_name, ip_address, visited_at')
        .eq('agent_id', agent.id)
        .gte('visited_at', new Date(Date.now() - 60 * 1000).toISOString())

      // 验证访问合法性
      const isValidVisit = validateAIVisit(
        aiName,
        ipAddress,
        recentVisits || []
      )

      if (isValidVisit) {
        // 记录 AI 访问
        await supabaseAdmin.from('ai_visits').insert({
          agent_id: agent.id,
          ai_name: aiName,
          user_agent: headers.get('user-agent') || null,
          referer: effectiveReferer || null,
          ip_address: ipAddress,
          verified: true,
          verification_method: `${detectionMethod}:${visitType}`,
          visit_type: visitType
        })

        // 更新 Agent 的 AI 搜索计数
        const { error: rpcError } = await supabaseAdmin.rpc('increment_ai_search_count', {
          agent_id: agent.id
        })

        if (rpcError) {
          await supabaseAdmin
            .from('agents')
            .update({ ai_search_count: (agent.ai_search_count || 0) + 1 })
            .eq('id', agent.id)
        }

        return NextResponse.json({
          success: true,
          ai_detected: true,
          ai_name: aiName,
          visit_type: visitType,
          detection_method: detectionMethod
        })
      }

      // 重复访问，不增加计数但仍返回检测结果
      return NextResponse.json({
        success: true,
        ai_detected: true,
        ai_name: aiName,
        visit_type: visitType,
        duplicate: true
      })
    }

    // 普通访问
    return NextResponse.json({
      success: true,
      ai_detected: false,
      visit_type: 'organic'
    })

  } catch (error) {
    console.error('Track AI visit error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * GET 端点：获取Agent的AI访问统计
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const agentSlug = searchParams.get('agent_slug')

    if (!agentSlug) {
      return NextResponse.json({ error: 'agent_slug is required' }, { status: 400 })
    }

    // 获取Agent信息
    const { data: agent, error: agentError } = await supabaseAdmin
      .from('agents')
      .select('id, ai_search_count')
      .eq('slug', agentSlug)
      .single()

    if (agentError || !agent) {
      return NextResponse.json({ error: 'Agent not found' }, { status: 404 })
    }

    // 获取AI访问细分统计
    const { data: breakdown, error: breakdownError } = await supabaseAdmin
      .from('ai_visits')
      .select('ai_name')
      .eq('agent_id', agent.id)

    if (breakdownError) {
      console.error('Failed to get AI visit breakdown:', breakdownError)
    }

    // 计算各AI的访问次数
    const countByAI: Record<string, number> = {}
    if (breakdown) {
      for (const visit of breakdown) {
        countByAI[visit.ai_name] = (countByAI[visit.ai_name] || 0) + 1
      }
    }

    // 创建响应并添加缓存头 - 验证: 需求 9.3
    const response = NextResponse.json({
      success: true,
      total_count: agent.ai_search_count || 0,
      breakdown: countByAI
    })
    
    // 添加短期缓存（5分钟），因为统计数据会频繁更新
    addCacheHeaders(response.headers, CACHE_STRATEGIES.short)
    
    return response

  } catch (error) {
    console.error('Get AI stats error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
