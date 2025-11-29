import Link from 'next/link'
import { FileQuestion, Home, Search } from 'lucide-react'

/**
 * 全局404页面
 * 当用户访问不存在的页面时显示
 */
export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="max-w-2xl w-full">
        {/* 主卡片 */}
        <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12 text-center">
          {/* 404图标 */}
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full mb-6">
            <FileQuestion className="w-10 h-10 text-white" />
          </div>
          
          {/* 404标题 */}
          <div className="mb-6">
            <h1 className="text-6xl md:text-7xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 mb-2">
              404
            </h1>
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
              页面未找到
            </h2>
          </div>
          
          {/* 描述 */}
          <div className="space-y-3 text-gray-600 mb-8">
            <p className="text-lg">
              抱歉，您访问的页面不存在
            </p>
            <p className="text-sm">
              页面可能已被移动、删除，或者您输入的网址有误
            </p>
          </div>

          {/* 建议操作 */}
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 mb-8">
            <h3 className="font-semibold text-gray-900 mb-4">您可以尝试：</h3>
            <ul className="text-sm text-gray-700 space-y-2 text-left max-w-md mx-auto">
              <li className="flex items-start gap-2">
                <span className="text-blue-600 mt-0.5">•</span>
                <span>检查网址是否输入正确</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 mt-0.5">•</span>
                <span>返回首页重新开始</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 mt-0.5">•</span>
                <span>浏览Agent市场发现更多内容</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 mt-0.5">•</span>
                <span>使用搜索功能查找您需要的内容</span>
              </li>
            </ul>
          </div>

          {/* 操作按钮 */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all shadow-md hover:shadow-lg font-medium"
            >
              <Home className="w-5 h-5" />
              返回首页
            </Link>
            <Link
              href="/?mode=market"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:border-gray-400 hover:bg-gray-50 transition-all font-medium"
            >
              <Search className="w-5 h-5" />
              浏览Agent市场
            </Link>
          </div>

          {/* 提示信息 */}
          <div className="mt-8 pt-8 border-t border-gray-200">
            <p className="text-sm text-gray-500 mb-2">
              如果您认为这是一个错误，请联系我们
            </p>
            <a
              href="mailto:support@superalphaagent.com"
              className="text-blue-600 hover:text-blue-700 font-medium text-sm"
            >
              support@superalphaagent.com
            </a>
          </div>
        </div>

        {/* 底部装饰 */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            🚀 探索超过 <strong>1000+</strong> 个优质AI Agent
          </p>
        </div>
      </div>
    </div>
  )
}
