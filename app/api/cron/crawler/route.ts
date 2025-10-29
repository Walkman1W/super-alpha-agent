import { NextResponse } from 'next/server'
import { batchEnrichAgents } from '@/crawler/enricher'
import { crawlGPTStore } from '@/crawler/sources/gpt-store'

export async function GET(request: Request) {
  // 验证 Cron Secret（安全性）
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    console.log('🤖 Starting scheduled crawl...')
    const rawAgents = await crawlGPTStore()
    await batchEnrichAgents(rawAgents)
    
    return NextResponse.json({ 
      success: true, 
      count: rawAgents.length,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('❌ Crawl error:', error)
    return NextResponse.json({ 
      error: 'Crawl failed',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
