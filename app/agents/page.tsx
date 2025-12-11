import { ResultsPage } from '@/components/agent'

export const dynamic = 'force-dynamic'

// Mock data for initial UI - will be replaced with real data
const mockAgents = [
  {
    id: '1',
    name: 'LangGraph',
    url: 'github.com/langchain-ai/langgraph',
    icon: '🦜',
    description: 'Build stateful, multi-actor applications with LLMs. Extends LangChain with cyclic computational capabilities.',
    isVerified: true,
    isMcp: true,
    hasJsonLd: true,
    hasApi: true,
    srScore: 9.8,
    srTier: 'S' as const,
    inputTypes: ['State'],
    outputTypes: ['Graph'],
  },
  {
    id: '2',
    name: 'AutoGPT',
    url: 'github.com/significant-gravitas/auto-gpt',
    icon: '⚡',
    description: 'An experimental open-source attempt to make GPT-4 fully autonomous.',
    isVerified: false,
    isMcp: false,
    hasJsonLd: true,
    hasApi: false,
    srScore: 8.2,
    srTier: 'A' as const,
    inputTypes: ['Goal'],
    outputTypes: ['Task'],
  },
  {
    id: '3',
    name: 'Manus AI',
    url: 'manus.ai',
    icon: '🤖',
    description: 'Autonomous writing agent capable of long-form research and content generation.',
    isVerified: true,
    isMcp: true,
    hasJsonLd: false,
    hasApi: true,
    srScore: 9.5,
    srTier: 'S' as const,
    inputTypes: ['Text', 'URL'],
    outputTypes: ['Document', 'Report'],
  },
  {
    id: '4',
    name: 'CrewAI',
    url: 'github.com/joaomdmoura/crewai',
    icon: '👥',
    description: 'Framework for orchestrating role-playing, autonomous AI agents.',
    isVerified: true,
    isMcp: true,
    hasJsonLd: true,
    hasApi: true,
    srScore: 8.9,
    srTier: 'A' as const,
    inputTypes: ['Task'],
    outputTypes: ['Result'],
  },
  {
    id: '5',
    name: 'MetaGPT',
    url: 'github.com/geekan/metagpt',
    icon: '🧠',
    description: 'Multi-agent framework that takes a one-line requirement and outputs PRD, design, tasks, and code.',
    isVerified: false,
    isMcp: false,
    hasJsonLd: false,
    hasApi: false,
    srScore: 7.8,
    srTier: 'B' as const,
    inputTypes: ['Requirement'],
    outputTypes: ['Code', 'PRD'],
  },
]

interface PageProps {
  searchParams: Promise<{ q?: string; url?: string; verified?: string }>
}

export default async function AgentsPage({ searchParams }: PageProps) {
  const params = await searchParams
  const searchQuery = params.q
  const scannedUrl = params.url
  const verifiedOnly = params.verified === 'true'

  // For now, use mock data
  // TODO: Replace with real database query
  let agents = mockAgents

  // Filter by verified if needed
  if (verifiedOnly) {
    agents = agents.filter(a => a.isVerified)
  }

  // Filter by search query if provided
  if (searchQuery) {
    const query = searchQuery.toLowerCase()
    agents = agents.filter(a => 
      a.name.toLowerCase().includes(query) ||
      a.description.toLowerCase().includes(query)
    )
  }

  // Sort by SR score descending
  agents = agents.sort((a, b) => b.srScore - a.srScore)

  return (
    <ResultsPage
      agents={agents}
      searchQuery={searchQuery}
      scannedUrl={scannedUrl}
      dailyScansUsed={3}
      dailyScansLimit={10}
    />
  )
}
