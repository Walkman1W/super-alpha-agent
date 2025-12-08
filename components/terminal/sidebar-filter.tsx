'use client'

import { useCallback } from 'react'
import { cn } from '@/lib/utils'
import type { FilterState, EntityType, AutonomyLevel } from '@/lib/types/agent'
import { AVAILABLE_FRAMEWORKS, GEO_SCORE_LEVELS } from '@/lib/types/agent'
import { hasActiveFilters, resetFilters } from '@/lib/filter-utils'

interface SidebarFilterProps {
  filters: FilterState
  onFiltersChange: (filters: FilterState) => void
  className?: string
}

/**
 * 5档滑轨组件
 */
function StepSlider({
  label,
  value,
  steps,
  onChange,
  formatLabel = (v) => String(v)
}: {
  label: string
  value: number
  steps: readonly number[] | string[]
  onChange: (index: number) => void
  formatLabel?: (v: number | string) => string
}) {
  const currentIndex = typeof steps[0] === 'number' 
    ? (steps as readonly number[]).findIndex(s => s >= value)
    : (steps as string[]).indexOf(value as unknown as string)
  const activeIndex = currentIndex === -1 ? 0 : currentIndex

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-mono text-zinc-500 uppercase tracking-wider">{label}</h3>
        <span className="text-xs font-mono text-purple-400">{formatLabel(steps[activeIndex])}</span>
      </div>
      <div className="flex items-center gap-1">
        {steps.map((step, index) => (
          <button
            key={index}
            onClick={() => onChange(index)}
            className={cn(
              'flex-1 h-2 rounded-full transition-all',
              index <= activeIndex ? 'bg-purple-500' : 'bg-zinc-700',
              'hover:bg-purple-400'
            )}
            title={formatLabel(step)}
          />
        ))}
      </div>
      <div className="flex justify-between text-[10px] font-mono text-zinc-600">
        <span>{formatLabel(steps[0])}</span>
        <span>{formatLabel(steps[steps.length - 1])}</span>
      </div>
    </div>
  )
}

export function SidebarFilter({ filters, onFiltersChange, className }: SidebarFilterProps) {
  const toggleFramework = useCallback((framework: string) => {
    const newFrameworks = filters.frameworks.includes(framework)
      ? filters.frameworks.filter(f => f !== framework)
      : [...filters.frameworks, framework]
    onFiltersChange({ ...filters, frameworks: newFrameworks })
  }, [filters, onFiltersChange])

  const toggleEntityType = useCallback((entityType: EntityType) => {
    const newTypes = filters.entityTypes.includes(entityType)
      ? filters.entityTypes.filter(t => t !== entityType)
      : [...filters.entityTypes, entityType]
    onFiltersChange({ ...filters, entityTypes: newTypes })
  }, [filters, onFiltersChange])

  const toggleAutonomyLevel = useCallback((level: AutonomyLevel) => {
    const newLevels = filters.autonomyLevels.includes(level)
      ? filters.autonomyLevels.filter(l => l !== level)
      : [...filters.autonomyLevels, level]
    onFiltersChange({ ...filters, autonomyLevels: newLevels })
  }, [filters, onFiltersChange])

  const handleGeoScoreChange = useCallback((index: number) => {
    onFiltersChange({ ...filters, geoScoreMin: GEO_SCORE_LEVELS[index] })
  }, [filters, onFiltersChange])

  const handleReset = useCallback(() => {
    onFiltersChange(resetFilters())
  }, [onFiltersChange])

  const hasFilters = hasActiveFilters(filters)

  return (
    <aside
      className={cn(
        'w-56 flex-shrink-0 bg-zinc-900/50 backdrop-blur-sm border-r border-zinc-800 p-4 space-y-5 hidden lg:block overflow-y-auto',
        className
      )}
    >
      {/* 标题 */}
      <div className="flex items-center gap-2 pb-3 border-b border-zinc-800">
        <span className="text-xs font-mono text-zinc-500 uppercase tracking-wider">Filters</span>
        {hasFilters && (
          <span className="w-2 h-2 bg-purple-500 rounded-full animate-pulse" />
        )}
      </div>

      {/* 框架过滤器 */}
      <div className="space-y-2">
        <h3 className="text-xs font-mono text-zinc-500 uppercase tracking-wider">Frameworks</h3>
        <div className="space-y-1.5">
          {AVAILABLE_FRAMEWORKS.map(framework => (
            <label key={framework} className="flex items-center gap-2 cursor-pointer group">
              <input
                type="checkbox"
                checked={filters.frameworks.includes(framework)}
                onChange={() => toggleFramework(framework)}
                className="w-3.5 h-3.5 rounded border-zinc-700 bg-zinc-800 text-purple-500 focus:ring-purple-500/20 focus:ring-offset-0"
              />
              <span className="text-xs text-zinc-400 group-hover:text-zinc-200 transition-colors">
                {framework}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* 实体类型过滤器 */}
      <div className="space-y-2">
        <h3 className="text-xs font-mono text-zinc-500 uppercase tracking-wider">Entity Type</h3>
        <div className="space-y-1.5">
          {(['repo', 'saas'] as EntityType[]).map(type => (
            <label key={type} className="flex items-center gap-2 cursor-pointer group">
              <input
                type="checkbox"
                checked={filters.entityTypes.includes(type)}
                onChange={() => toggleEntityType(type)}
                className="w-3.5 h-3.5 rounded border-zinc-700 bg-zinc-800 text-purple-500 focus:ring-purple-500/20 focus:ring-offset-0"
              />
              <span className="text-xs text-zinc-400 group-hover:text-zinc-200 transition-colors">
                {type === 'repo' ? '📦 Repository' : '☁️ SaaS'}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* GEO Score 滑轨 */}
      <StepSlider
        label="GEO Score"
        value={filters.geoScoreMin}
        steps={GEO_SCORE_LEVELS}
        onChange={handleGeoScoreChange}
        formatLabel={(v) => `${v}+`}
      />

      {/* Autonomy Level 滑轨 */}
      <div className="space-y-2">
        <h3 className="text-xs font-mono text-zinc-500 uppercase tracking-wider">Autonomy Level</h3>
        <div className="flex gap-1">
          {(['L1', 'L2', 'L3', 'L4', 'L5'] as AutonomyLevel[]).map(level => (
            <button
              key={level}
              onClick={() => toggleAutonomyLevel(level)}
              className={cn(
                'flex-1 py-1.5 text-xs font-mono rounded transition-all',
                filters.autonomyLevels.includes(level)
                  ? 'bg-purple-500 text-white'
                  : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
              )}
            >
              {level}
            </button>
          ))}
        </div>
      </div>

      {/* 重置按钮 */}
      {hasFilters && (
        <button
          onClick={handleReset}
          className="w-full py-2 text-xs font-mono text-zinc-400 bg-zinc-800/50 border border-zinc-700 rounded hover:bg-zinc-800 hover:text-zinc-200 transition-colors"
        >
          Reset Filters
        </button>
      )}
    </aside>
  )
}

export default SidebarFilter
