'use client'

import { useState, useCallback, useEffect } from 'react'
import { cn } from '@/lib/utils'
import type { FilterState, EntityType, AutonomyLevel } from '@/lib/types/agent'
import {
  AVAILABLE_FRAMEWORKS,
  AUTONOMY_LEVEL_DESCRIPTIONS,
  ENTITY_TYPE_DESCRIPTIONS
} from '@/lib/types/agent'
import { hasActiveFilters, resetFilters } from '@/lib/filter-utils'

interface MobileMenuProps {
  filters: FilterState
  onFiltersChange: (filters: FilterState) => void
  className?: string
}

/**
 * MobileMenu 组件
 * 移动端汉堡菜单 + 滑出式筛选面板
 * 
 * **Validates: Requirements 9.2**
 */
export function MobileMenu({ filters, onFiltersChange, className }: MobileMenuProps) {
  const [isOpen, setIsOpen] = useState(false)
  const hasFilters = hasActiveFilters(filters)

  // 关闭菜单时恢复滚动
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  // ESC 键关闭
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false)
    }
    window.addEventListener('keydown', handleEsc)
    return () => window.removeEventListener('keydown', handleEsc)
  }, [])

  const toggleMenu = useCallback(() => setIsOpen(prev => !prev), [])
  const closeMenu = useCallback(() => setIsOpen(false), [])

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

  // 重置所有过滤器
  const handleReset = useCallback(() => {
    onFiltersChange(resetFilters())
  }, [onFiltersChange])

  return (
    <>
      {/* 汉堡菜单按钮 - 仅移动端显示 */}
      <button
        onClick={toggleMenu}
        className={cn(
          'lg:hidden fixed top-4 right-4 z-50',
          'w-10 h-10 flex items-center justify-center',
          'bg-zinc-900/90 backdrop-blur-sm',
          'border border-zinc-700 rounded-lg',
          'text-zinc-300 hover:text-zinc-100',
          'transition-colors',
          className
        )}
        aria-label={isOpen ? '关闭菜单' : '打开筛选菜单'}
        aria-expanded={isOpen}
      >
        <div className="relative w-5 h-4 flex flex-col justify-between">
          <span
            className={cn(
              'block h-0.5 bg-current rounded transition-transform duration-200',
              isOpen && 'translate-y-[7px] rotate-45'
            )}
          />
          <span
            className={cn(
              'block h-0.5 bg-current rounded transition-opacity duration-200',
              isOpen && 'opacity-0'
            )}
          />
          <span
            className={cn(
              'block h-0.5 bg-current rounded transition-transform duration-200',
              isOpen && '-translate-y-[7px] -rotate-45'
            )}
          />
        </div>
        {/* 过滤器激活指示器 */}
        {hasFilters && !isOpen && (
          <span className="absolute -top-1 -right-1 w-3 h-3 bg-purple-500 rounded-full border-2 border-zinc-900" />
        )}
      </button>

      {/* 遮罩层 */}
      <div
        className={cn(
          'lg:hidden fixed inset-0 z-40 bg-black/60 backdrop-blur-sm',
          'transition-opacity duration-300',
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        )}
        onClick={closeMenu}
        aria-hidden="true"
      />

      {/* 滑出式筛选面板 */}
      <aside
        className={cn(
          'lg:hidden fixed top-0 right-0 z-40',
          'w-[85vw] max-w-xs h-full',
          'bg-zinc-900/95 backdrop-blur-md',
          'border-l border-zinc-800',
          'overflow-y-auto',
          'transition-transform duration-300 ease-out',
          isOpen ? 'translate-x-0' : 'translate-x-full'
        )}
        aria-label="筛选面板"
      >
        <div className="p-4 pt-16 space-y-6">
          {/* 标题 */}
          <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
            <h2 className="text-lg font-semibold text-zinc-100">Filters</h2>
            {hasFilters && (
              <button
                onClick={handleReset}
                className="text-xs font-mono text-purple-400 hover:text-purple-300"
              >
                Reset All
              </button>
            )}
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
                  className="flex items-center gap-3 py-1 cursor-pointer group"
                >
                  <input
                    type="checkbox"
                    checked={filters.frameworks.includes(framework)}
                    onChange={() => toggleFramework(framework)}
                    className="w-5 h-5 rounded border-zinc-700 bg-zinc-800 text-purple-500 focus:ring-purple-500/20 focus:ring-offset-0"
                  />
                  <span className="text-sm text-zinc-300 group-hover:text-zinc-100">
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
                  className="flex items-center gap-3 py-1 cursor-pointer group"
                  title={ENTITY_TYPE_DESCRIPTIONS[type]}
                >
                  <input
                    type="checkbox"
                    checked={filters.entityTypes.includes(type)}
                    onChange={() => toggleEntityType(type)}
                    className="w-5 h-5 rounded border-zinc-700 bg-zinc-800 text-purple-500 focus:ring-purple-500/20 focus:ring-offset-0"
                  />
                  <span className="text-sm text-zinc-300 group-hover:text-zinc-100">
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
            <div className="grid grid-cols-5 gap-2">
              {(['L1', 'L2', 'L3', 'L4', 'L5'] as AutonomyLevel[]).map(level => (
                <button
                  key={level}
                  onClick={() => toggleAutonomyLevel(level)}
                  title={AUTONOMY_LEVEL_DESCRIPTIONS[level]}
                  className={cn(
                    'py-2 text-xs font-mono rounded border transition-colors',
                    filters.autonomyLevels.includes(level)
                      ? 'bg-purple-500/20 border-purple-500/50 text-purple-300'
                      : 'bg-zinc-800/50 border-zinc-700 text-zinc-400 hover:border-zinc-600'
                  )}
                >
                  {level}
                </button>
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
              onChange={(e) => onFiltersChange({ ...filters, maxLatency: Number(e.target.value) })}
              className="w-full h-2 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-purple-500"
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
              onChange={(e) => onFiltersChange({ ...filters, minSuccessRate: Number(e.target.value) })}
              className="w-full h-2 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-purple-500"
            />
          </div>

          {/* 应用按钮 */}
          <button
            onClick={closeMenu}
            className="w-full py-3 text-sm font-semibold text-zinc-100 bg-purple-600 hover:bg-purple-500 rounded-lg transition-colors"
          >
            Apply Filters
          </button>
        </div>
      </aside>
    </>
  )
}

export default MobileMenu
