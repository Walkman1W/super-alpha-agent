/**
 * Next.js 中间件
 * 添加全局缓存头和安全头
 * 需求: 9.3
 */

import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { CACHE_STRATEGIES } from './lib/cache-utils'

export function middleware(request: NextRequest) {
  const response = NextResponse.next()
  
  const { pathname } = request.nextUrl
  
  // 为静态资源添加长期缓存
  if (
    pathname.startsWith('/_next/static/') ||
    pathname.startsWith('/images/') ||
    pathname.startsWith('/fonts/') ||
    pathname.match(/\.(ico|png|jpg|jpeg|gif|svg|webp|woff|woff2|ttf|eot)$/)
  ) {
    response.headers.set('Cache-Control', CACHE_STRATEGIES.static)
  }
  
  // 为 API 路由添加默认缓存策略
  if (pathname.startsWith('/api/')) {
    // API 路由默认使用短期缓存，除非在路由中覆盖
    if (!response.headers.has('Cache-Control')) {
      response.headers.set('Cache-Control', CACHE_STRATEGIES.short)
    }
  }
  
  // 添加安全头
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('X-XSS-Protection', '1; mode=block')
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  
  // 添加 Permissions-Policy
  response.headers.set(
    'Permissions-Policy',
    'camera=(), microphone=(), geolocation=()'
  )
  
  return response
}

// 配置中间件匹配路径
export const config = {
  matcher: [
    /*
     * 匹配所有路径，除了：
     * - _next/static (静态文件)
     * - _next/image (图片优化文件)
     * - favicon.ico (网站图标)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}
