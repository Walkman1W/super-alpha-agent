import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { extractAIBotFromHeaders, getClientIP, validateAIVisit, isKnownAIBot } from '@/lib/ai-detector'

/**
 * API 端点：追踪 AI 访问
 * 验证: 需求 8.3, 8.4
 * 
 * 自动调用：当页面加载时，自动检测是否是 AI 访问
 * 手动调用：用户可以报告"我是从 AI 来的"
 * 
 * 关键特性：
 * - 检测ChatGPT、Claude、Perplexity等机器人
 * - 解析User-Agent和Referer
 * - 在机器人访问时增加计数器
 * - 立即持久化到数据库（在响应前完成）
 */
export async function POST(request: NextRequest) {
  try {
    // 检查 supabaseAdmin 是否可用
    if (!supabaseAdmin) {
      return NextResponse.json({ error: 'Supabase not configured' }, { status: 503 })
    }

    const body = await request.json()
    const { agent_slug, manual_report, ai_name: reportedAIName, search_query } = body

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

    // 情况 1：自动检测 AI Bot
    if (!manual_report) {
      const aiBot = extractAIBotFromHeaders(headers)
      
      if (aiBot) {
        // 获取最近的访问记录用于防刷验证
        const { data: recentVisits } = await supabaseAdmin
          .from('ai_visits')
          .select('ai_name, ip_address, visited_at')
          .eq('agent_id', agent.id)
          .gte('visited_at', new Date(Date.now() - 60 * 1000).toISOString())

        // 验证访问合法性
        const isValidVisit = validateAIVisit(
          aiBot.name,
          ipAddress,
          recentVisits || []
        )

        if (isValidVisit) {
          // 记录 AI 访问 - 验证: 需求 8.3
          const { error: insertError } = await supabaseAdmin.from('ai_visits').insert({
            agent_id: agent.id,
            ai_name: aiBot.name,
            user_agent: aiBot.userAgent,
            referer: aiBot.referer,
            ip_address: ipAddress,
            verified: true,
            verification_method: aiBot.detectionMethod
          })

          if (insertError) {
            console.error('Failed to insert AI visit:', insertError)
          }

          // 更新 Agent 的 AI 搜索计数 - 验证: 需求 8.4
          // 使用RPC函数确保原子性操作
          const { error: rpcError } = await supabaseAdmin.rpc('increment_ai_search_count', {
            agent_id: agent.id
          })

          // 如果RPC不存在，使用直接更新
          if (rpcError) {
            const { error: updateError } = await supabaseAdmin
              .from('agents')
              .update({ ai_search_count: (agent.ai_search_count || 0) + 1 })
              .eq('id', agent.id)
            
            if (updateError) {
              console.error('Failed to update AI search count:', updateError)
            }
          }

          // 所有数据库操作完成后才返回响应 - 验证: 需求 8.4
          return NextResponse.json({
            success: true,
            ai_detected: true,
            ai_name: aiBot.name,
            detection_method: aiBot.detectionMethod
          })
        }

        // 重复访问，不增加计数但仍返回检测结果
        return NextResponse.json({
          success: true,
          ai_detected: true,
          ai_name: aiBot.name,
          duplicate: true
        })
      }

      return NextResponse.json({
        success: true,
        ai_detected: false
      })
    }

    // 情况 2：用户手动报告
    if (manual_report && reportedAIName) {
      // 验证AI名称是否有效
      if (!isKnownAIBot(reportedAIName) && reportedAIName !== '其他') {
        return NextResponse.json({ 
          error: 'Invalid AI name',
          valid_names: ['ChatGPT', 'Claude', 'Perplexity', 'Google Bard', 'Bing AI', 'You.com', '其他']
        }, { status: 400 })
      }

      // 记录用户报告
      const { error: reportError } = await supabaseAdmin.from('user_ai_reports').insert({
        agent_id: agent.id,
        ai_name: reportedAIName,
        search_query: search_query || null,
        ip_address: ipAddress
      })

      if (reportError) {
        console.error('Failed to insert user AI report:', reportError)
      }

      // 更新 Agent 的 AI 搜索计数 - 验证: 需求 8.4
      const { error: rpcError } = await supabaseAdmin.rpc('increment_ai_search_count', {
        agent_id: agent.id
      })

      if (rpcError) {
        const { error: updateError } = await supabaseAdmin
          .from('agents')
          .update({ ai_search_count: (agent.ai_search_count || 0) + 1 })
          .eq('id', agent.id)
        
        if (updateError) {
          console.error('Failed to update AI search count:', updateError)
        }
      }

      // 所有数据库操作完成后才返回响应 - 验证: 需求 8.4
      return NextResponse.json({
        success: true,
        reported: true,
        ai_name: reportedAIName
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

/**
 * GET 端点：获取Agent的AI访问统计
 */
export async function GET(request: NextRequest) {
  try {
    // 检查 supabaseAdmin 是否可用
    if (!supabaseAdmin) {
      return NextResponse.json({ error: 'Supabase not configured' }, { status: 503 })
    }

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

    return NextResponse.json({
      success: true,
      total_count: agent.ai_search_count || 0,
      breakdown: countByAI
    })

  } catch (error) {
    console.error('Get AI stats error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
