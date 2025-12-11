'use client'

interface TickerAgent {
  name: string
  score: number
  trend: 'up' | 'down' | 'stable'
}

// Static mock data - will be replaced with real data later
const tickerAgents: TickerAgent[] = [
  { name: 'Manus AI', score: 9.8, trend: 'up' },
  { name: 'Claude Computer Use', score: 9.5, trend: 'up' },
  { name: 'Devin', score: 9.1, trend: 'up' },
  { name: 'LangChain', score: 8.7, trend: 'stable' },
  { name: 'AutoGPT', score: 8.2, trend: 'down' },
  { name: 'BabyAGI', score: 7.9, trend: 'down' },
  { name: 'OpenAI Swarm', score: 8.5, trend: 'up' },
  { name: 'CrewAI', score: 8.3, trend: 'up' },
  { name: 'MetaGPT', score: 7.8, trend: 'stable' },
  { name: 'AgentGPT', score: 7.5, trend: 'down' },
]

function getTrendIcon(trend: 'up' | 'down' | 'stable') {
  switch (trend) {
    case 'up': return '▲'
    case 'down': return '▼'
    case 'stable': return '▬'
  }
}

function getTrendColor(trend: 'up' | 'down' | 'stable') {
  switch (trend) {
    case 'up': return 'text-[#00C853]'
    case 'down': return 'text-[#FF5252]'
    case 'stable': return 'text-[#888]'
  }
}

export function BottomTicker() {
  // Duplicate items for seamless infinite scroll
  const items = [...tickerAgents, ...tickerAgents]

  return (
    <footer className="fixed bottom-0 left-0 right-0 h-10 bg-[#050505]/95 border-t border-[#1F1F1F] flex items-center overflow-hidden z-50">
      <div className="ticker-content flex gap-10 animate-ticker whitespace-nowrap hover:[animation-play-state:paused]">
        {items.map((agent, index) => (
          <div
            key={`${agent.name}-${index}`}
            className="flex items-center gap-2 text-sm cursor-pointer text-[#888] hover:text-white transition-colors"
          >
            <span className="font-semibold text-white">{agent.name}</span>
            <span className="font-mono text-[#00C853]">{agent.score.toFixed(1)}</span>
            <span className={`text-xs ${getTrendColor(agent.trend)}`}>
              {getTrendIcon(agent.trend)}
            </span>
          </div>
        ))}
      </div>
    </footer>
  )
}

export default BottomTicker
