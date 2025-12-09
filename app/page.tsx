import { Suspense } from 'react'
import { getTerminalAgents, getAgentCount, getCategories } from '@/lib/data-fetcher'
import { TerminalHomePage } from '@/components/terminal/terminal-home-page'

export const revalidate = 300
export const fetchCache = 'force-cache'

function LoadingSkeleton() {
  return (
    <div className="min-h-screen bg-zinc-950">
      <div className="animate-pulse">
        <div className="h-[40vh] flex items-center justify-center">
          <div className="text-center space-y-4">
            <div className="h-8 w-32 bg-zinc-800 rounded-full mx-auto" />
            <div className="h-12 w-96 bg-zinc-800 rounded mx-auto" />
            <div className="h-12 w-80 bg-zinc-800 rounded-lg mx-auto mt-8" />
          </div>
        </div>
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {Array.from({ length: 16 }).map((_, i) => (
              <div key={i} className="h-48 bg-zinc-900 rounded-lg" />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

interface HomePageProps {
  searchParams: Promise<{ agent?: string }>
}

export default async function HomePage({ searchParams }: HomePageProps) {
  const resolvedSearchParams = await searchParams
  
  const [agents, agentCount, categories] = await Promise.all([
    getTerminalAgents(200), // 获取更多数据用于窗口滚动
    getAgentCount(),
    getCategories()
  ])

  const initialAgentSlug = resolvedSearchParams.agent || undefined

  return (
    <Suspense fallback={<LoadingSkeleton />}>
      <TerminalHomePage 
        initialAgents={agents}
        signalCount={agentCount}
        categories={categories}
        initialAgentSlug={initialAgentSlug}
      />
    </Suspense>
  )
}
