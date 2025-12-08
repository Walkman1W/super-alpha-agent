'use client'

import { useState, useCallback, useMemo, useEffect } from 'react'
import { HeroTerminal } from './hero-terminal'
import { SidebarFilter } from './sidebar-filter'
import { AgentWindow } from './agent-window'
import { InspectorDrawer } from './inspector-drawer'
import { MobileMenu } from './mobile-menu'
import type { SignalAgent, FilterState } from '@/lib/types/agent'
import { DEFAULT_FILTER_STATE } from '@/lib/types/agent'
import { applyAllFilters } from '@/lib/filter-utils'

interface Category {
  id: string
  name: string
  slug: string
  icon: string
}

interface TerminalHomePageProps {
  initialAgents: SignalAgent[]
  signalCount: number
  categories: Category[]
  initialAgentSlug?: string
}

export function TerminalHomePage({ initialAgents, signalCount, categories, initialAgentSlug }: TerminalHomePageProps) {
  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTER_STATE)
  const [selectedAgent, setSelectedAgent] = useState<SignalAgent | null>(null)
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)

  // 处理从详情页重定向过来的情况
  useEffect(() => {
    if (initialAgentSlug) {
      const agent = initialAgents.find(a => a.slug === initialAgentSlug)
      if (agent) {
        setSelectedAgent(agent)
        setIsDrawerOpen(true)
        if (typeof window !== 'undefined') {
          window.history.replaceState(null, '', '/')
        }
      }
    }
  }, [initialAgentSlug, initialAgents])

  const handleSearch = useCallback((query: string) => {
    setFilters(prev => ({ ...prev, search: query }))
  }, [])

  const handleCategoryChange = useCallback((categoryId: string | null) => {
    setFilters(prev => ({ ...prev, categoryId }))
  }, [])

  // 过滤后的 Agent 列表
  const filteredAgents = useMemo(() => {
    let result = applyAllFilters(initialAgents, filters)
    
    // 分类过滤（需要从完整数据中过滤，这里简化处理）
    // 实际应该在服务端根据 category_id 过滤
    if (filters.categoryId) {
      // 暂时跳过分类过滤，因为 SignalAgent 没有 category_id
      // 后续可以扩展 SignalAgent 类型
    }
    
    return result
  }, [initialAgents, filters])

  const handleAgentClick = useCallback((agent: SignalAgent) => {
    if (selectedAgent?.slug === agent.slug && isDrawerOpen) {
      setIsDrawerOpen(false)
      setTimeout(() => setSelectedAgent(null), 300)
    } else {
      setSelectedAgent(agent)
      setIsDrawerOpen(true)
    }
  }, [selectedAgent, isDrawerOpen])

  const handleCloseDrawer = useCallback(() => {
    setIsDrawerOpen(false)
    setTimeout(() => setSelectedAgent(null), 300)
  }, [])

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col">
      {/* 背景网格 */}
      <div 
        className="hidden sm:block fixed inset-0 pointer-events-none opacity-[0.02]"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
          backgroundSize: '50px 50px'
        }}
      />

      {/* Mobile Menu */}
      <MobileMenu filters={filters} onFiltersChange={setFilters} />

      {/* Hero Section */}
      <HeroTerminal
        signalCount={signalCount}
        searchValue={filters.search}
        onSearch={handleSearch}
      />

      {/* Main Content */}
      <div className="relative flex flex-1">
        {/* Sidebar Filter */}
        <SidebarFilter filters={filters} onFiltersChange={setFilters} />

        {/* Agent Window */}
        <main className="flex-1 p-3 sm:p-4 lg:p-6">
          <AgentWindow
            agents={filteredAgents}
            categories={categories}
            totalCount={signalCount}
            selectedCategory={filters.categoryId}
            onCategoryChange={handleCategoryChange}
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
