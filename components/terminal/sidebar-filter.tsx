'use client'

import { useState, useCallback } from 'react'
import { cn } from '@/lib/utils'
import type { FilterState, EntityType, AutonomyLevel } from '@/lib/types/agent'
import {
  AVAILABLE_FRAMEWORKS,
  AUTONOMY_LEVEL_DESCRIPTIONS,
  ENTITY_TYPE_DESCRIPTIONS
} from '@/lib/types/agent'
import { hasActiveFilters, resetFilters } from '@/lib/filter-utils'

interface SidebarFilterProps {
  filters: FilterState
  onFiltersChange: (filters: FilterState) => void
  className?: string
}

/**
 * SidebarFilter 组件
 * 终端风格的筛选面板
 * 
 * **Validates: Requirements 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 4.7**
 */
export function SidebarFilter({ filters, onFiltersChange, className }: SidebarFilterProps) {
  const [isConnected] = useState(true)

  // 框架过滤切换
  const toggleFramework = useCallback((framework: string) => {
    const newFrameworks = filters.frameworks.includes(framework)
      ? filters.frameworks.filter(f => f !== framework)
      : [...filters.frameworks, framework]
    onFiltersChange({ ...filters, frameworks: newFrameworks })
  }, [filters, onFiltersChange])

  // 实体类型过滤切换
  const toggleEntityType = useCallback((entityType: EntityType) => {
    const newTypes = filters.entityTypes.includes(entityType)
      ? filters.entityTypes.filter(t => t !== entityType)
      : [...filters.entityTypes, entityType]
    onFiltersChange({ ...filters, entityTypes: newTypes })
  }, [filters, onFiltersChange])

  // 自主等级过滤切换
  const toggleAutonomyLevel = useCallback((level: AutonomyLevel) => {
    const newLevels = filters.autonomyLevels.includes(level)
      ? filters.autonomyLevels.filter(l => l !== level)
      : [...filters.autonomyLevels, level]
    onFiltersChange({ ...filters, autonomyLevels: newLevels })
  }, [filters, onFiltersChange])

  // 延迟滑块变化
  const handleLatencyChange = useCallback((value: number) => {
    onFiltersChange({ ...filters, maxLatency: value })
  }, [filters, onFiltersChange])

  // 成功率滑块变化
  const handleSuccessRateChange = useCallback((value: number) => {
    onFiltersChange({ ...filters, minSuccessRate: value })
  }, [filters, onFiltersChange])

  // 重置所有过滤器
  const handleReset = useCallback(() => {
    onFiltersChange(resetFilters())
  }, [onFiltersChange])

  const hasFilters = hasActiveFilters(filters)

  return (
    <aside
      className={cn(
        'w-64 flex-shrink-0',
        'bg-zinc-900/50 backdrop-blur-sm',
        'border-r border-zinc-800',
        'p-4 space-y-6',
        'hidden lg:block',
        className
      )}
      data-testid="sidebar-filter"
    >
      {/* Logo + 标题 */}
      <div className="flex items-center gap-2 mb-6">
        <div className="relative">
          <div className="w-8 h-8 bg-purple-500/20 rounded-lg flex items-center justify-center">
            <span className="text-purple-400 font-bold font-mono">AS</span>
          </div>
          <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
        </div>
        <span className="font-semibold text-zinc-100">AgentSignals</span>
      </div>

      {/* 框架过滤器 */}
      <div className="space-y-3">
        <h3 className="text-xs font-mono text-zinc-500 uppercase tracking-wider">
          Frameworks
        </h3>
        <div className="space-y-2">
          {AVAILABLE_FRAMEWORKS.map(framework => (
            <label
              key={framework}
              className="flex items-center gap-2 cursor-pointer group"
            >
              <input
                type="checkbox"
                checked={filters.frameworks.includes(framework)}
                onChange={() => toggleFramework(framework)}
                className="w-4 h-4 rounded border-zinc-700 bg-zinc-800 text-purple-500 focus:ring-purple-500/20 focus:ring-offset-0"
              />
              <span className="text-sm text-zinc-400 group-hover:text-zinc-200 transition-colors">
                {framework}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* 实体类型过滤器 */}
      <div className="space-y-3">
        <h3 className="text-xs font-mono text-zinc-500 uppercase tracking-wider">
          Entity Type
        </h3>
        <div className="space-y-2">
          {(['repo', 'saas', 'app'] as EntityType[]).map(type => (
            <label
              key={type}
              className="flex items-center gap-2 cursor-pointer group"
              title={ENTITY_TYPE_DESCRIPTIONS[type]}
            >
              <input
                type="checkbox"
                checked={filters.entityTypes.includes(type)}
                onChange={() => toggleEntityType(type)}
                className="w-4 h-4 rounded border-zinc-700 bg-zinc-800 text-purple-500 focus:ring-purple-500/20 focus:ring-offset-0"
              />
              <span className="text-sm text-zinc-400 group-hover:text-zinc-200 transition-colors capitalize">
                {type === 'repo' ? '📦 Repository' : type === 'saas' ? '🌐 SaaS' : '📱 App'}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* 自主等级过滤器 */}
      <div className="space-y-3">
        <h3 className="text-xs font-mono text-zinc-500 uppercase tracking-wider">
          Autonomy Level
        </h3>
        <div className="space-y-2">
          {(['L1', 'L2', 'L3', 'L4', 'L5'] as AutonomyLevel[]).map(level => (
            <label
              key={level}
              className="flex items-center gap-2 cursor-pointer group"
              title={AUTONOMY_LEVEL_DESCRIPTIONS[level]}
            >
              <input
                type="checkbox"
                checked={filters.autonomyLevels.includes(level)}
                onChange={() => toggleAutonomyLevel(level)}
                className="w-4 h-4 rounded border-zinc-700 bg-zinc-800 text-purple-500 focus:ring-purple-500/20 focus:ring-offset-0"
              />
              <span className="text-sm text-zinc-400 group-hover:text-zinc-200 transition-colors font-mono">
                {level}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* 延迟滑块 */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-mono text-zinc-500 uppercase tracking-wider">
            Max Latency
          </h3>
          <span className="text-xs font-mono text-zinc-400">
            {filters.maxLatency >= 2000 ? 'Any' : `${filters.maxLatency}ms`}
          </span>
        </div>
        <input
          type="range"
          min={0}
          max={2000}
          step={100}
          value={filters.maxLatency}
          onChange={(e) => handleLatencyChange(Number(e.target.value))}
          className="w-full h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-purple-500"
        />
      </div>

      {/* 成功率滑块 */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-mono text-zinc-500 uppercase tracking-wider">
            Min Success Rate
          </h3>
          <span className="text-xs font-mono text-zinc-400">
            {filters.minSuccessRate <= 0 ? 'Any' : `${filters.minSuccessRate}%`}
          </span>
        </div>
        <input
          type="range"
          min={0}
          max={100}
          step={5}
          value={filters.minSuccessRate}
          onChange={(e) => handleSuccessRateChange(Number(e.target.value))}
          className="w-full h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-purple-500"
        />
      </div>

      {/* 重置按钮 */}
      {hasFilters && (
        <button
          onClick={handleReset}
          className="w-full py-2 px-3 text-sm font-mono text-zinc-400 bg-zinc-800/50 border border-zinc-700 rounded hover:bg-zinc-800 hover:text-zinc-200 transition-colors"
        >
          Reset Filters
        </button>
      )}

      {/* 连接状态 */}
      <div className="mt-auto pt-6 border-t border-zinc-800">
        <div className="flex items-center gap-2 p-3 bg-zinc-800/50 rounded-lg border border-zinc-700/50">
          <span
            className={cn(
              'w-2 h-2 rounded-full',
              isConnected ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'
            )}
          />
          <span className="text-xs font-mono text-zinc-400">
            {isConnected ? 'Live Connection' : 'Disconnected'}
          </span>
        </div>
      </div>
    </aside>
  )
}

export default SidebarFilter
