'use client'

import { useState, useCallback, useMemo } from 'react'
import { HeroTerminal } from './hero-terminal'
import { SidebarFilter } from './sidebar-filter'
import { AgentGrid } from './agent-grid'
import { InspectorDrawer } from './inspector-drawer'
import type { SignalAgent, FilterState } from '@/lib/types/agent'
import { DEFAULT_FILTER_STATE } from '@/lib/types/agent'
import { applyAllFilters } from '@/lib/filter-utils'

interface TerminalHomePageProps {
  initialAgents: SignalAgent[]
  signalCount: number
}

/**
 * Terminal 风格首页
 * 整合 HeroTerminal, SidebarFilter, AgentGrid, InspectorDrawer
 * 
 * **Validates: Requirements 1.1, 2.1, 5.1**
 */
export function TerminalHomePage({ initialAgents, signalCount }: TerminalHomePageProps) {
  // 过滤器状态
  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTER_STATE)
  
  // 选中的 Agent (用于 Inspector)
  const [selectedAgent, setSelectedAgent] = useState<SignalAgent | null>(null)
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)

  // 搜索处理
  const handleSearch = useCallback((query: string) => {
    setFilters(prev => ({ ...prev, search: query }))
  }, [])

  // 过滤后的 Agent 列表
  const filteredAgents = useMemo(() => {
    return applyAllFilters(initialAgents, filters)
  }, [initialAgents, filters])

  // Agent 点击处理 - 打开 Inspector
  const handleAgentClick = useCallback((agent: SignalAgent) => {
    setSelectedAgent(agent)
    setIsDrawerOpen(true)
  }, [])

  // 关闭 Inspector
  const handleCloseDrawer = useCallback(() => {
    setIsDrawerOpen(false)
    // 延迟清除 agent 数据，等动画完成
    setTimeout(() => setSelectedAgent(null), 300)
  }, [])

  return (
    <div className="min-h-screen bg-zinc-950">
      {/* 背景网格图案 */}
      <div 
        className="fixed inset-0 pointer-events-none opacity-[0.02]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px'
        }}
      />

      {/* Hero Section */}
      <HeroTerminal
        signalCount={signalCount}
        searchValue={filters.search}
        onSearch={handleSearch}
      />

      {/* Main Content */}
      <div className="relative flex">
        {/* Sidebar Filter - 桌面端显示 */}
        <SidebarFilter
          filters={filters}
          onFiltersChange={setFilters}
        />

        {/* Agent Grid */}
        <main className="flex-1 p-4 lg:p-6">
          <AgentGrid
            agents={filteredAgents}
            searchQuery={filters.search || undefined}
            onAgentClick={handleAgentClick}
          />
        </main>
      </div>

      {/* Inspector Drawer */}
      <InspectorDrawer
        agent={selectedAgent}
        isOpen={isDrawerOpen}
        onClose={handleCloseDrawer}
      />
    </div>
  )
}

export default TerminalHomePage
