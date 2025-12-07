'use client'

import { useState, useCallback, useMemo, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { HeroTerminal } from './hero-terminal'
import { SidebarFilter } from './sidebar-filter'
import { AgentGrid } from './agent-grid'
import { InspectorDrawer } from './inspector-drawer'
import { MobileMenu } from './mobile-menu'
import type { SignalAgent, FilterState } from '@/lib/types/agent'
import { DEFAULT_FILTER_STATE } from '@/lib/types/agent'
import { applyAllFilters } from '@/lib/filter-utils'

interface TerminalHomePageProps {
  initialAgents: SignalAgent[]
  signalCount: number
  /** 初始要打开的 Agent slug（从详情页重定向过来时使用）- 验证: 需求 6.1 */
  initialAgentSlug?: string
}

/**
 * Terminal 风格首页
 * 整合 HeroTerminal, SidebarFilter, AgentGrid, InspectorDrawer, MobileMenu
 * 
 * **Validates: Requirements 1.1, 2.1, 5.1, 6.1, 9.1, 9.2**
 */
export function TerminalHomePage({ initialAgents, signalCount, initialAgentSlug }: TerminalHomePageProps) {
  const router = useRouter()
  
  // 过滤器状态
  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTER_STATE)
  
  // 选中的 Agent (用于 Inspector)
  const [selectedAgent, setSelectedAgent] = useState<SignalAgent | null>(null)
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)

  // 处理从详情页重定向过来的情况，自动打开 Inspector Drawer
  // 验证: 需求 6.1
  useEffect(() => {
    if (initialAgentSlug) {
      // 查找对应的 Agent
      const agent = initialAgents.find(a => a.slug === initialAgentSlug)
      if (agent) {
        setSelectedAgent(agent)
        setIsDrawerOpen(true)
        // 清除 URL 中的 agent 参数，避免刷新时重复打开
        router.replace('/', { scroll: false })
      }
    }
  }, [initialAgentSlug, initialAgents, router])

  // 搜索处理
  const handleSearch = useCallback((query: string) => {
    setFilters(prev => ({ ...prev, search: query }))
  }, [])

  // 过滤后的 Agent 列表
  const filteredAgents = useMemo(() => {
    return applyAllFilters(initialAgents, filters)
  }, [initialAgents, filters])

  // Agent 点击处理 - 打开/切换 Inspector
  // 如果点击同一 Agent，关闭抽屉；否则打开新 Agent
  const handleAgentClick = useCallback((agent: SignalAgent) => {
    if (selectedAgent?.slug === agent.slug && isDrawerOpen) {
      // 点击同一 Agent，关闭抽屉
      setIsDrawerOpen(false)
      setTimeout(() => setSelectedAgent(null), 300)
    } else {
      // 点击不同 Agent，打开/切换到新 Agent
      setSelectedAgent(agent)
      setIsDrawerOpen(true)
    }
  }, [selectedAgent, isDrawerOpen])

  // 关闭 Inspector
  const handleCloseDrawer = useCallback(() => {
    setIsDrawerOpen(false)
    // 延迟清除 agent 数据，等动画完成
    setTimeout(() => setSelectedAgent(null), 300)
  }, [])

  return (
    <div className="min-h-screen bg-zinc-950">
      {/* 背景网格图案 - 移动端隐藏以提升性能 */}
      <div 
        className="hidden sm:block fixed inset-0 pointer-events-none opacity-[0.02]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px'
        }}
      />

      {/* Mobile Menu - 仅移动端显示 */}
      <MobileMenu
        filters={filters}
        onFiltersChange={setFilters}
      />

      {/* Hero Section */}
      <HeroTerminal
        signalCount={signalCount}
        searchValue={filters.search}
        onSearch={handleSearch}
      />

      {/* Main Content - 响应式布局 */}
      <div className="relative flex">
        {/* Sidebar Filter - 仅桌面端显示 (lg+) */}
        <SidebarFilter
          filters={filters}
          onFiltersChange={setFilters}
        />

        {/* Agent Grid - 响应式内边距 */}
        <main className="flex-1 p-3 sm:p-4 lg:p-6">
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
