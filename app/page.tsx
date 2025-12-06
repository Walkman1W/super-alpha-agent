import { Suspense } from 'react'
import { getTerminalAgents, getAgentCount } from '@/lib/data-fetcher'
import { TerminalHomePage } from '@/components/terminal/terminal-home-page'

// ISR 重新验证时间：5分钟 - 需求: 9.4
export const revalidate = 300

// 预渲染页面以减少首次加载时间
export const fetchCache = 'force-cache'

// 加载骨架屏
function LoadingSkeleton() {
  return (
    <div className="min-h-screen bg-zinc-950">
      <div className="animate-pulse">
        {/* Hero skeleton */}
        <div className="h-[50vh] flex items-center justify-center">
          <div className="text-center space-y-4">
            <div className="h-8 w-32 bg-zinc-800 rounded-full mx-auto" />
            <div className="h-12 w-96 bg-zinc-800 rounded mx-auto" />
            <div className="h-6 w-64 bg-zinc-800 rounded mx-auto" />
            <div className="h-12 w-80 bg-zinc-800 rounded-lg mx-auto mt-8" />
          </div>
        </div>
        {/* Grid skeleton */}
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="h-48 bg-zinc-900 rounded-lg" />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default async function HomePage() {
  // 并行获取数据
  const [agents, agentCount] = await Promise.all([
    getTerminalAgents(50),
    getAgentCount()
  ])

  return (
    <Suspense fallback={<LoadingSkeleton />}>
      <TerminalHomePage 
        initialAgents={agents}
        signalCount={agentCount}
      />
    </Suspense>
  )
}
