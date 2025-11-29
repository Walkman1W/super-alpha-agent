/**
 * Agent 列表 API
 * 支持分页加载
 */

import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { CACHE_STRATEGIES } from '@/lib/cache-utils'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const offset = parseInt(searchParams.get('offset') || '0')
    const limit = parseInt(searchParams.get('limit') || '12')
    const sortBy = searchParams.get('sortBy') || 'ai_search_count'
    
    // 验证参数
    if (offset < 0 || limit < 1 || limit > 50) {
      return NextResponse.json(
        { error: '无效的分页参数' },
        { status: 400 }
      )
    }
    
    // 查询数据
    const { data, error } = await supabaseAdmin
      .from('agents')
      .select('id, slug, name, short_description, platform, pricing, ai_search_count')
      .order(sortBy, { ascending: false, nullsFirst: false })
      .range(offset, offset + limit - 1)
    
    if (error) {
      console.error('Failed to fetch agents:', error)
      return NextResponse.json(
        { error: '获取数据失败' },
        { status: 500 }
      )
    }
    
    // 返回数据，添加缓存头
    return NextResponse.json(data || [], {
      headers: {
        'Cache-Control': CACHE_STRATEGIES.medium,
      },
    })
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { error: '服务器错误' },
      { status: 500 }
    )
  }
}
