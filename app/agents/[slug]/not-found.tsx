import Link from 'next/link'
import { Clock, Home, Search, Mail } from 'lucide-react'

/**
 * Agent详情页 - 自定义404页面
 * 当Agent不存在时显示友好的审核提示
 */
export default function AgentNotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      <div className="max-w-2xl w-full">
        {/* 主卡片 */}
        <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12 text-center">
          {/* 图标 */}
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full mb-6">
            <Clock className="w-10 h-10 text-white" />
          </div>
          
          {/* 标题 */}
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Agent 正在处理中
          </h1>
          
          {/* 描述 */}
          <div className="space-y-3 text-gray-600 mb-8">
            <p className="text-lg">
              🎉 您的 Agent 已成功提交！
            </p>
            <p>
              系统正在处理您的 Agent 信息，即将上架展示。
            </p>
            <p className="text-sm">
              由于缓存机制，新提交的 Agent 需要一点时间才能显示。
            </p>
          </div>

          {/* 处理流程 */}
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 mb-8">
            <h2 className="font-semibold text-gray-900 mb-4">处理流程</h2>
            <div className="grid md:grid-cols-3 gap-4 text-sm">
              <div className="flex flex-col items-center">
                <div className="w-10 h-10 bg-green-500 text-white rounded-full flex items-center justify-center font-bold mb-2">
                  ✓
                </div>
                <div className="font-medium">1. 提交成功</div>
                <div className="text-gray-500 text-xs mt-1">AI已分析完成</div>
              </div>
              <div className="flex flex-col items-center">
                <div className="w-10 h-10 bg-blue-500 text-white rounded-full flex items-center justify-center font-bold mb-2">
                  ⏳
                </div>
                <div className="font-medium">2. 缓存更新中</div>
                <div className="text-gray-500 text-xs mt-1">系统正在处理</div>
              </div>
              <div className="flex flex-col items-center">
                <div className="w-10 h-10 bg-gray-300 text-white rounded-full flex items-center justify-center font-bold mb-2">
                  3
                </div>
                <div className="font-medium">3. 自动上架</div>
                <div className="text-gray-500 text-xs mt-1">约1小时后可见</div>
              </div>
            </div>
          </div>

          {/* 预计时间 */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8">
            <div className="flex items-center justify-center gap-2 text-blue-800">
              <Clock className="w-5 h-5" />
              <span className="font-medium">预计等待时间：约1小时后自动上架</span>
            </div>
            <p className="text-center text-sm text-blue-600 mt-2">
              这是由于系统缓存机制，您的Agent已成功创建
            </p>
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
              href="/agents"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:border-gray-400 hover:bg-gray-50 transition-all font-medium"
            >
              <Search className="w-5 h-5" />
              浏览其他Agent
            </Link>
          </div>

          {/* 提示信息 */}
          <div className="mt-8 pt-8 border-t border-gray-200">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
              <p className="text-sm text-green-800 text-center">
                ✅ 您的Agent已成功创建并保存到数据库
              </p>
              <p className="text-xs text-green-600 text-center mt-1">
                约1小时后，缓存更新完成即可正常访问
              </p>
            </div>
            
            <p className="text-sm text-gray-500 mb-2 text-center">
              如有疑问，请联系我们
            </p>
            <div className="text-center">
              <a
                href="mailto:support@superalphaagent.com"
                className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium"
              >
                <Mail className="w-4 h-4" />
                support@superalphaagent.com
              </a>
            </div>
          </div>
        </div>

        {/* 底部提示 */}
        <div className="mt-6 text-center space-y-2">
          <p className="text-sm text-gray-600">
            💡 <strong>小提示</strong>：您可以收藏此页面，1小时后再访问
          </p>
          <p className="text-xs text-gray-500">
            或者我们会通过邮件通知您Agent已上架
          </p>
        </div>
      </div>
    </div>
  )
}
