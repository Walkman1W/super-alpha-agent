import { ResultsPage } from '@/components/agent'
import { getAgents, getAgentCount } from '@/lib/data/agent-repository'
import type { ScannerAgent, SRTier } from '@/lib/types/scanner'

export const dynamic = 'force-dynamic'

type SearchParamValue = string | string[] | undefined

interface PageSearchParams {
  q?: SearchParamValue
  url?: SearchParamValue
  verified?: SearchParamValue
  page?: SearchParamValue
}

interface PageProps {
  searchParams: Promise<PageSearchParams>
}

type AgentListItem = {
  id: string
  name: string
  url: string
  icon: string
  description: string
  isVerified: boolean
  isClaimed?: boolean
  isMcp: boolean
  hasJsonLd: boolean
  hasApi: boolean
  srScore: number
  srTier: SRTier
  inputTypes: string[]
  outputTypes: string[]
}

const PAGE_SIZE = 15

function getFirstParam(param?: SearchParamValue) {
  if (Array.isArray(param)) return param[0]
  return param
}

function mapAgentToListItem(agent: ScannerAgent): AgentListItem {
  const name = agent.name || 'Unknown Agent'
  const primaryUrl = agent.homepageUrl || agent.githubUrl || `https://agentsignals.ai/agents/${agent.slug}`
  const icon = name.trim().charAt(0).toUpperCase() || '#'

  return {
    id: agent.id,
    name,
    url: primaryUrl,
    icon,
    description: agent.description || 'No description provided.',
    isVerified: Boolean(agent.isVerified),
    isClaimed: Boolean(agent.isClaimed),
    isMcp: Boolean(agent.isMcp),
    hasJsonLd: Boolean(agent.jsonLd),
    hasApi: Boolean(agent.apiDocsUrl),
    srScore: agent.srScore ?? 0,
    srTier: agent.srTier || 'C',
    inputTypes: agent.inputTypes?.length ? agent.inputTypes : ['Unknown'],
    outputTypes: agent.outputTypes?.length ? agent.outputTypes : ['Unknown']
  }
}

export default function AgentsPage({ searchParams }: PageProps) {
  return <AgentsPageContent searchParams={searchParams} />
}

async function AgentsPageContent({ searchParams }: { searchParams: Promise<PageSearchParams> }) {
  const resolvedParams = await searchParams
  const searchQuery = (getFirstParam(resolvedParams?.q) || '').trim() || undefined
  const scannedUrl = getFirstParam(resolvedParams?.url) || undefined
  const verifiedOnly = getFirstParam(resolvedParams?.verified) === 'true'
  const currentPage = Math.max(1, Number(getFirstParam(resolvedParams?.page)) || 1)
  const offset = (currentPage - 1) * PAGE_SIZE

  let agents: AgentListItem[] = []
  let errorMessage: string | undefined
  let totalCount = 0
  let totalPages = 1

  try {
    const results = await getAgents({
      searchQuery,
      isVerified: verifiedOnly ? true : undefined,
      orderBy: 'sr_score',
      orderDirection: 'desc',
      limit: PAGE_SIZE,
      offset
    })

    const count = await getAgentCount({
      searchQuery,
      isVerified: verifiedOnly ? true : undefined
    })

    totalCount = count
    totalPages = Math.max(1, Math.ceil(count / PAGE_SIZE))
    agents = results.map(mapAgentToListItem)
  } catch (error) {
    console.error('Failed to load agents', error)
    errorMessage = 'Failed to load agents. Please refresh or try again.'
  }

  return (
    <ResultsPage
      agents={agents}
      searchQuery={searchQuery}
      scannedUrl={scannedUrl}
      verifiedOnly={verifiedOnly}
      dailyScansUsed={3}
      dailyScansLimit={10}
      errorMessage={errorMessage}
      currentPage={currentPage}
      totalPages={totalPages}
      pageSize={PAGE_SIZE}
      totalCount={totalCount}
    />
  )
}

function AgentsPageSkeleton() {
  const items = Array.from({ length: 5 })

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#050505',
      color: '#fff',
      display: 'flex',
      flexDirection: 'column',
      padding: '80px 16px 40px'
    }}>
      <div style={{ maxWidth: '900px', margin: '0 auto', width: '100%' }}>
        <div style={{
          height: '64px',
          marginBottom: '24px',
          borderRadius: '12px',
          backgroundColor: '#0A0A0A',
          border: '1px solid #1F1F1F'
        }} />
        {items.map((_, index) => (
          <div
            key={index}
            style={{
              display: 'flex',
              gap: '20px',
              padding: '20px 0',
              borderBottom: '1px solid #1F1F1F'
            }}
          >
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: '12px',
              backgroundColor: '#0A0A0A',
              border: '1px solid #1F1F1F'
            }} />
            <div style={{ flex: 1 }}>
              <div style={{ height: '14px', width: '40%', backgroundColor: '#111', borderRadius: '4px', marginBottom: '10px' }} />
              <div style={{ height: '12px', width: '70%', backgroundColor: '#0D0D0D', borderRadius: '4px', marginBottom: '8px' }} />
              <div style={{ height: '12px', width: '50%', backgroundColor: '#0D0D0D', borderRadius: '4px' }} />
            </div>
            <div style={{ width: '70px', textAlign: 'right' }}>
              <div style={{ height: '24px', width: '100%', backgroundColor: '#111', borderRadius: '6px', marginBottom: '8px' }} />
              <div style={{ height: '12px', width: '60%', backgroundColor: '#0D0D0D', borderRadius: '4px', marginLeft: 'auto' }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
