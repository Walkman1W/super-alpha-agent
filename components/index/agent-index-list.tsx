'use client'

import { useMemo } from 'react'
import { AgentRow } from './agent-row'
import type { ScannerAgent } from '@/lib/types/scanner'

interface AgentIndexListProps {
  agents: ScannerAgent[]
  verifiedOnly: boolean
}

/**
 * 空状态组件
 */
function EmptyState({ verifiedOnly }: { verifiedOnly: boolean }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="w-20 h-20 mb-6 rounded-full bg-zinc-800/50 flex items-center justify-center">
        <span className="text-4xl">📡</span>
      </div>
      <h3 className="text-xl font-semibold text-zinc-300 mb-2 font-mono">
        No agents found
      </h3>
      <p className="text-sm text-zinc-500 max-w-md">
        {verifiedOnly 
          ? 'No verified agents yet. Try turning off the "Verified Only" filter.'
          : 'No agents have been scanned yet. Be the first to scan an agent!'
        }
      </p>
    </div>
  )
}

/**
 * Agent 索引列表组件
 * 按 SR 分数降序排列，支持已验证过滤
 * 
 * **Validates: Requirements 7.1, 7.4**
 */
export function AgentIndexList({ agents, verifiedOnly }: AgentIndexListProps) {
  // 过滤已验证的 Agent
  const filteredAgents = useMemo(() => {
    if (!verifiedOnly) return agents
    return agents.filter(agent => agent.isVerified)
  }, [agents, verifiedOnly])

  // 确保按 SR 分数降序排列 (服务端已排序，这里做二次保证)
  const sortedAgents = useMemo(() => {
    return [...filteredAgents].sort((a, b) => b.srScore - a.srScore)
  }, [filteredAgents])

  if (sortedAgents.length === 0) {
    return <EmptyState verifiedOnly={verifiedOnly} />
  }

  return (
    <div 
      className="bg-zinc-900/30 border border-zinc-800 rounded-lg overflow-hidden"
      data-testid="agent-index-list"
    >
      {/* 列表头部 */}
      <div className="flex items-center justify-between px-4 py-3 bg-zinc-900/50 border-b border-zinc-800">
        <div className="flex items-center gap-2">
          <div className="flex gap-1.5">
            <span className="w-3 h-3 rounded-full bg-red-500/80" />
            <span className="w-3 h-3 rounded-full bg-yellow-500/80" />
            <span className="w-3 h-3 rounded-full bg-green-500/80" />
          </div>
          <span className="ml-2 text-xs font-mono text-zinc-500">
            results.signal
          </span>
        </div>
        <span className="text-xs font-mono text-zinc-500">
          {sortedAgents.length} agent{sortedAgents.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Agent 列表 */}
      <div className="divide-y divide-zinc-800/50">
        {sortedAgents.map((agent) => (
          <AgentRow key={agent.id} agent={agent} />
        ))}
      </div>
    </div>
  )
}

export default AgentIndexList
