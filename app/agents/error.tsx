'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { AlertCircle, Home, Search, RefreshCw } from 'lucide-react'

/**
 * Agent页面错误边界
 * 处理Agent相关页面的错误
 */
export default function AgentError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // 记录错误
    console.error('Agent page error:', error)
    
    // 生产环境发送到监控服务
    if (process.env.NODE_ENV === 'production') {
      // 例如: Sentry.captureException(error)
    }
  }, [error])

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-gradient-to-br from-orange-50 via-red-50 to-pink-50">
      <div className="max-w-2xl w-full">
        {/* 主卡片 */}
        <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12 text-center">
          {/* 错误图标 */}
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-orange-500 to-red-600 rounded-full mb-6">
            <AlertCircle className="w-10 h-10 text-white" />
          </div>
          
          {/* 标题 */}
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            加载Agent时出错
          </h1>
          
          {/* 描述 */}
          <div className="space-y-3 text-gray-600 mb-8">
            <p className="text-lg">
              抱歉，无法加载Agent信息
            </p>
            <p className="text-sm">
              这可能是临时的网络问题或数据加载错误
            </p>
          </div>

          {/* 可能的原因 */}
          <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-xl p-6 mb-8">
            <h3 className="font-semibold text-gray-900 mb-4">可能的原因：</h3>
            <ul className="text-sm text-gray-700 space-y-2 text-left max-w-md mx-auto">
              <li className="flex items-start gap-2">
                <span className="text-orange-600 mt-0.5">•</span>
                <span>网络连接不稳定</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-orange-600 mt-0.5">•</span>
                <span>Agent数据暂时不可用</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-orange-600 mt-0.5">•</span>
                <span>服务器正在维护</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-orange-600 mt-0.5">•</span>
                <span>浏览器缓存问题</span>
              </li>
            </ul>
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
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-600 to-red-600 text-white rounded-lg hover:from-orange-700 hover:to-red-700 transition-all shadow-md hover:shadow-lg font-medium"
            >
              <RefreshCw className="w-5 h-5" />
              重新加载
            </button>
            <Link
              href="/?mode=market"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:border-gray-400 hover:bg-gray-50 transition-all font-medium"
            >
              <Search className="w-5 h-5" />
              浏览其他Agent
            </Link>
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
            💡 <strong>小提示</strong>：清除浏览器缓存后重试可能会解决问题
          </p>
        </div>
      </div>
    </div>
  )
}
