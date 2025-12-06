/**
 * Vercel Cron API端点
 * 用于定时触发爬虫任务
 * 
 * 配置在 vercel.json 中
 */

import { NextRequest, NextResponse } from 'next/server'
import { runSchedule } from '@/crawler/scheduler'

export const maxDuration = 300 // 5分钟超时
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  // 验证Cron密钥（安全性）
  const authHeader = request.headers.get('authorization')
  const cronSecret = process.env.CRON_SECRET
  
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    )
  }
  
  // 获取调度任务名称
  const schedule = request.nextUrl.searchParams.get('schedule') || 'daily_premium'
  
  console.log(`🕐 Cron触发: ${schedule}`)
  
  try {
    // 运行爬虫（异步，不阻塞响应）
    runSchedule(schedule).catch(error => {
      console.error('爬虫执行失败:', error)
    })
    
    return NextResponse.json({
      success: true,
      message: `Crawler started: ${schedule}`,
      timestamp: new Date().toISOString()
    })
    
  } catch (error) {
    console.error('Cron执行失败:', error)
    return NextResponse.json(
      { 
        error: 'Crawler failed',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
