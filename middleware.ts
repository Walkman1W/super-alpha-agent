/**
 * Next.js 中间件
 * 添加全局缓存头和安全头
 * 需求: 9.3, 15.3
 */

import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { CACHE_STRATEGIES } from './lib/cache-utils'
import { generateCSPHeader, DEFAULT_CSP_DIRECTIVES, DEFAULT_SECURITY_HEADERS } from './lib/security'

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
  
  // 添加安全响应头（需求 15.3）
  Object.entries(DEFAULT_SECURITY_HEADERS).forEach(([key, value]) => {
    response.headers.set(key, value)
  })
  
  // 添加内容安全策略（CSP）头部（需求 15.3）
  const cspHeader = generateCSPHeader(DEFAULT_CSP_DIRECTIVES)
  response.headers.set('Content-Security-Policy', cspHeader)
  
  // 仅在生产环境添加 HSTS（Strict-Transport-Security）
  if (process.env.NODE_ENV === 'production') {
    response.headers.set(
      'Strict-Transport-Security',
      'max-age=31536000; includeSubDomains; preload'
    )
  }
  
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
