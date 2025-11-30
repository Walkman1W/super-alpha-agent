import { PublishAgentForm } from '@/components/publish-agent-form'
import { GradientText } from '@/components/ui/gradient-text'

export default function PublishPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      {/* 头部 */}
      <header className="py-12 md:py-20">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
              <GradientText>发布你的Agent</GradientText>
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              分享你的AI Agent，让更多人发现它的价值
            </p>
          </div>
        </div>
      </header>
      
      {/* 表单内容 */}
      <main className="pb-20">
        <PublishAgentForm />
      </main>
    </div>
  )
}