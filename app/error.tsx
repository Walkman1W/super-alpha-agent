'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { AlertTriangle, Home, RefreshCw } from 'lucide-react'

/**
 * 全局错误边界组件
 * 捕获应用中的运行时错误并显示友好的错误页面
 */
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // 记录错误到控制台
    console.error('Application error:', error)
    
    // 生产环境可以发送到错误监控服务
    if (process.env.NODE_ENV === 'production') {
      // 例如: Sentry.captureException(error)
    }
  }, [error])

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50">
      <div className="max-w-2xl w-full">
        {/* 主卡片 */}
        <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12 text-center">
          {/* 错误图标 */}
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-red-500 to-orange-600 rounded-full mb-6">
            <AlertTriangle className="w-10 h-10 text-white" />
          </div>
          
          {/* 标题 */}
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            出错了
          </h1>
          
          {/* 描述 */}
          <div className="space-y-3 text-gray-600 mb-8">
            <p className="text-lg">
              抱歉，页面加载时遇到了问题
            </p>
            <p className="text-sm">
              我们已经记录了这个错误，团队会尽快处理
            </p>
          </div>

          {/* 错误详情（仅开发环境） */}
          {process.env.NODE_ENV === 'development' && (
            <div className="bg-gray-50 rounded-lg p-4 mb-8 text-left">
              <h2 className="font-semibold text-gray-900 mb-2 text-sm">错误详情：</h2>
              <pre className="text-xs text-red-600 overflow-auto max-h-40">
                {error.message}
              </pre>
              {error.digest && (
                <p className="text-xs text-gray-500 mt-2">
                  错误ID: {error.digest}
                </p>
              )}
            </div>
          )}

          {/* 操作按钮 */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={reset}
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-red-600 to-orange-600 text-white rounded-lg hover:from-red-700 hover:to-orange-700 transition-all shadow-md hover:shadow-lg font-medium"
            >
              <RefreshCw className="w-5 h-5" />
              重试
            </button>
            <Link
              href="/"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:border-gray-400 hover:bg-gray-50 transition-all font-medium"
            >
              <Home className="w-5 h-5" />
              返回首页
            </Link>
          </div>

          {/* 提示信息 */}
          <div className="mt-8 pt-8 border-t border-gray-200">
            <p className="text-sm text-gray-500 mb-2">
              如果问题持续存在，请联系我们
            </p>
            <a
              href="mailto:support@agentsignals.ai"
              className="text-blue-600 hover:text-blue-700 font-medium text-sm"
            >
              support@agentsignals.ai
            </a>
          </div>
        </div>

        {/* 底部提示 */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            💡 <strong>小提示</strong>：刷新页面或清除浏览器缓存可能会解决问题
          </p>
        </div>
      </div>
    </div>
  )
}
