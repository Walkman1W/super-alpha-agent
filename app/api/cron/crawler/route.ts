import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  // 验证 Cron Secret（安全性）
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    console.log('🤖 Cron job triggered')
    
    // 注意：实际的爬虫逻辑需要在服务器端运行
    // 这里只是一个占位符，实际爬虫应该通过其他方式触发
    // 例如：GitHub Actions、本地运行等
    
    return NextResponse.json({ 
      success: true, 
      message: 'Cron job received. Run crawler locally with: npm run crawler',
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('❌ Cron error:', error)
    return NextResponse.json({ 
      error: 'Cron failed',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
