import { Suspense } from 'react'
import { supabaseAdmin } from '@/lib/supabase'
import { AgentIndexList } from '@/components/index/agent-index-list'
import { VerifiedFilter } from '@/components/index/verified-filter'
import type { ScannerAgent, SRTier, SRTrack, IOModality, SRScoreBreakdown } from '@/lib/types/scanner'

export const dynamic = 'force-dynamic'
export const revalidate = 0

/**
 * Agent 索引页面
 * 终端风格的 Agent 列表，按 SR 分数降序排列
 * 
 * **Validates: Requirements 7.1, 7.2, 7.3**
 */

interface AgentRow {
  id: string
  slug: string
  name: string
  description: string | null
  github_url: string | null
  homepage_url: string | null
  api_docs_url: string | null
  sr_score: number | null
  sr_tier: string | null
  sr_track: string | null
  score_github: number | null
  score_saas: number | null
  score_breakdown: SRScoreBreakdown | null
  is_mcp: boolean | null
  is_claimed: boolean | null
  is_verified: boolean | null
  input_types: string[] | null
  output_types: string[] | null
  meta_title: string | null
  meta_description: string | null
  og_image: string | null
  json_ld: object | null
  github_stars: number | null
  github_forks: number | null
  github_last_commit: string | null
  last_scanned_at: string | null
  created_at: string
  updated_at: string
}

function createDefaultBreakdown(): SRScoreBreakdown {
  return {
    starsScore: 0,
    forksScore: 0,
    vitalityScore: 0,
    readinessScore: 0,
    protocolScore: 0,
    trustScore: 0,
    aeoScore: 0,
    interopScore: 0
  }
}

function mapToScannerAgent(row: AgentRow): ScannerAgent {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    description: row.description,
    githubUrl: row.github_url,
    homepageUrl: row.homepage_url,
    apiDocsUrl: row.api_docs_url,
    srScore: row.sr_score ?? 0,
    srTier: (row.sr_tier as SRTier) ?? 'C',
    srTrack: (row.sr_track as SRTrack) ?? 'SaaS',
    scoreGithub: row.score_github ?? 0,
    scoreSaas: row.score_saas ?? 0,
    scoreBreakdown: row.score_breakdown ?? createDefaultBreakdown(),
    isMcp: row.is_mcp ?? false,
    isClaimed: row.is_claimed ?? false,
    isVerified: row.is_verified ?? false,
    inputTypes: (row.input_types as IOModality[]) ?? [],
    outputTypes: (row.output_types as IOModality[]) ?? [],
    metaTitle: row.meta_title,
    metaDescription: row.meta_description,
    ogImage: row.og_image,
    jsonLd: row.json_ld,
    githubStars: row.github_stars ?? 0,
    githubForks: row.github_forks ?? 0,
    githubLastCommit: row.github_last_commit ? new Date(row.github_last_commit) : null,
    lastScannedAt: row.last_scanned_at ? new Date(row.last_scanned_at) : null,
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at)
  }
}

async function getAgents(): Promise<ScannerAgent[]> {
  const { data, error } = await supabaseAdmin
    .from('agents')
    .select(`
      id, slug, name, description,
      github_url, homepage_url, api_docs_url,
      sr_score, sr_tier, sr_track,
      score_github, score_saas, score_breakdown,
      is_mcp, is_claimed, is_verified,
      input_types, output_types,
      meta_title, meta_description, og_image, json_ld,
      github_stars, github_forks, github_last_commit,
      last_scanned_at, created_at, updated_at
    `)
    .order('sr_score', { ascending: false, nullsFirst: false })
    .limit(100)

  if (error) {
    console.error('Failed to fetch agents:', error)
    return []
  }

  return (data as AgentRow[]).map(mapToScannerAgent)
}

function LoadingSkeleton() {
  return (
    <div className="space-y-4">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="animate-pulse">
          <div className="flex justify-between items-start p-4 border-b border-zinc-800">
            <div className="space-y-2 flex-1">
              <div className="h-5 bg-zinc-800 rounded w-48" />
              <div className="h-4 bg-zinc-800 rounded w-32" />
              <div className="h-4 bg-zinc-800 rounded w-96" />
            </div>
            <div className="text-right">
              <div className="h-8 bg-zinc-800 rounded w-16" />
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

export default async function AgentsIndexPage({
  searchParams
}: {
  searchParams: Promise<{ verified?: string }>
}) {
  const params = await searchParams
  const verifiedOnly = params.verified === 'true'
  const agents = await getAgents()

  return (
    <div className="min-h-screen bg-[#050505]">
      {/* 页面头部 */}
      <div className="border-b border-zinc-800 bg-zinc-900/50">
        <div className="max-w-5xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-zinc-100 font-mono">
                <span className="text-[#00FF94]">$</span> agent.index
              </h1>
              <p className="text-sm text-zinc-500 mt-1">
                {agents.length} agents ranked by Signal Rank
              </p>
            </div>
            <Suspense fallback={null}>
              <VerifiedFilter initialValue={verifiedOnly} />
            </Suspense>
          </div>
        </div>
      </div>

      {/* Agent 列表 */}
      <div className="max-w-5xl mx-auto px-4 py-6">
        <Suspense fallback={<LoadingSkeleton />}>
          <AgentIndexList agents={agents} verifiedOnly={verifiedOnly} />
        </Suspense>
      </div>
    </div>
  )
}
