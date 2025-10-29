import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { extractAIBotFromHeaders, getClientIP } from '@/lib/ai-detector'

/**
 * API 端点：追踪 AI 访问
 * 
 * 自动调用：当页面加载时，自动检测是否是 AI 访问
 * 手动调用：用户可以报告"我是从 AI 来的"
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { agent_slug, manual_report, ai_name: reportedAIName, search_query } = body

    if (!agent_slug) {
      return NextResponse.json({ error: 'agent_slug is required' }, { status: 400 })
    }

    // 获取 Agent ID
    const { data: agent, error: agentError } = await supabaseAdmin
      .from('agents')
      .select('id')
      .eq('slug', agent_slug)
      .single()

    if (agentError || !agent) {
      return NextResponse.json({ error: 'Agent not found' }, { status: 404 })
    }

    const headers = request.headers
    const ipAddress = getClientIP(headers)

    // 情况 1：自动检测 AI Bot
    if (!manual_report) {
      const aiBot = extractAIBotFromHeaders(headers)
      
      if (aiBot) {
        // 检查是否重复（防刷）
        const { data: recentVisits } = await supabaseAdmin
          .from('ai_visits')
          .select('ai_name, ip_address, visited_at')
          .eq('agent_id', agent.id)
          .gte('visited_at', new Date(Date.now() - 60 * 1000).toISOString())

        const isDuplicate = recentVisits?.some(
          v => v.ip_address === ipAddress && v.ai_name === aiBot.name
        )

        if (!isDuplicate) {
          // 记录 AI 访问
          await supabaseAdmin.from('ai_visits').insert({
            agent_id: agent.id,
            ai_name: aiBot.name,
            user_agent: aiBot.userAgent,
            referer: aiBot.referer,
            ip_address: ipAddress,
            verified: true,
            verification_method: 'user_agent'
          })

          // 更新 Agent 的 AI 搜索计数
          await supabaseAdmin.rpc('increment_ai_search_count', {
            agent_id: agent.id
          })

          return NextResponse.json({
            success: true,
            ai_detected: true,
            ai_name: aiBot.name
          })
        }
      }

      return NextResponse.json({
        success: true,
        ai_detected: false
      })
    }

    // 情况 2：用户手动报告
    if (manual_report && reportedAIName) {
      // 记录用户报告
      await supabaseAdmin.from('user_ai_reports').insert({
        agent_id: agent.id,
        ai_name: reportedAIName,
        search_query: search_query || null,
        ip_address: ipAddress
      })

      // 更新 Agent 的 AI 搜索计数
      await supabaseAdmin.rpc('increment_ai_search_count', {
        agent_id: agent.id
      })

      return NextResponse.json({
        success: true,
        reported: true
      })
    }

    return NextResponse.json({ success: false }, { status: 400 })

  } catch (error) {
    console.error('Track AI visit error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
