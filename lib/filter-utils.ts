/**
 * 过滤工具函数
 * 提供 Agent 列表的搜索和过滤功能
 */

import type { SignalAgent, FilterState, EntityType, AutonomyLevel } from './types/agent'
import { DEFAULT_FILTER_STATE } from './types/agent'

/**
 * 根据搜索关键词过滤 Agent 列表
 */
export function filterAgentsBySearch(agents: SignalAgent[], query: string): SignalAgent[] {
  if (!query || query.trim() === '') return agents

  const normalizedQuery = query.toLowerCase().trim()

  return agents.filter(agent => {
    if (agent.name.toLowerCase().includes(normalizedQuery)) return true
    if (agent.short_description.toLowerCase().includes(normalizedQuery)) return true
    if (agent.tags.some(tag => tag.toLowerCase().includes(normalizedQuery))) return true
    if (agent.framework && agent.framework.toLowerCase().includes(normalizedQuery)) return true
    return false
  })
}

/**
 * 根据框架过滤 Agent 列表
 */
export function filterAgentsByFramework(agents: SignalAgent[], frameworks: string[]): SignalAgent[] {
  if (!frameworks || frameworks.length === 0) return agents

  const frameworkSet = new Set(frameworks.map(f => f.toLowerCase()))
  return agents.filter(agent => {
    if (!agent.framework) return false
    return frameworkSet.has(agent.framework.toLowerCase())
  })
}

/**
 * 根据实体类型过滤 Agent 列表
 */
export function filterAgentsByEntityType(agents: SignalAgent[], entityTypes: EntityType[]): SignalAgent[] {
  if (!entityTypes || entityTypes.length === 0) return agents
  const typeSet = new Set(entityTypes)
  return agents.filter(agent => typeSet.has(agent.entity_type))
}

/**
 * 根据自主等级过滤 Agent 列表
 */
export function filterAgentsByAutonomyLevel(agents: SignalAgent[], autonomyLevels: AutonomyLevel[]): SignalAgent[] {
  if (!autonomyLevels || autonomyLevels.length === 0) return agents
  const levelSet = new Set(autonomyLevels)
  return agents.filter(agent => levelSet.has(agent.autonomy_level))
}

/**
 * 根据 GEO Score 最小值过滤
 */
export function filterAgentsByGeoScore(agents: SignalAgent[], minScore: number): SignalAgent[] {
  if (minScore <= 0) return agents
  return agents.filter(agent => agent.geo_score >= minScore)
}

/**
 * 应用所有过滤条件
 */
export function applyAllFilters(agents: SignalAgent[], filters: FilterState): SignalAgent[] {
  let result = agents
  result = filterAgentsBySearch(result, filters.search)
  result = filterAgentsByFramework(result, filters.frameworks)
  result = filterAgentsByEntityType(result, filters.entityTypes)
  result = filterAgentsByAutonomyLevel(result, filters.autonomyLevels)
  result = filterAgentsByGeoScore(result, filters.geoScoreMin)
  return result
}

/**
 * 清理和验证过滤器状态
 */
export function sanitizeFilterState(filters: Partial<FilterState>): FilterState {
  return {
    search: typeof filters.search === 'string' ? filters.search : DEFAULT_FILTER_STATE.search,
    frameworks: Array.isArray(filters.frameworks) ? filters.frameworks : DEFAULT_FILTER_STATE.frameworks,
    entityTypes: Array.isArray(filters.entityTypes) ? filters.entityTypes : DEFAULT_FILTER_STATE.entityTypes,
    autonomyLevels: Array.isArray(filters.autonomyLevels) ? filters.autonomyLevels : DEFAULT_FILTER_STATE.autonomyLevels,
    geoScoreMin: Math.min(100, Math.max(0, filters.geoScoreMin ?? DEFAULT_FILTER_STATE.geoScoreMin)),
    categoryId: filters.categoryId ?? DEFAULT_FILTER_STATE.categoryId
  }
}

/**
 * 检查过滤器是否有任何活动条件
 */
export function hasActiveFilters(filters: FilterState): boolean {
  return (
    filters.search.trim() !== '' ||
    filters.frameworks.length > 0 ||
    filters.entityTypes.length > 0 ||
    filters.autonomyLevels.length > 0 ||
    filters.geoScoreMin > 0 ||
    filters.categoryId !== null
  )
}

/**
 * 重置过滤器到默认状态
 */
export function resetFilters(): FilterState {
  return { ...DEFAULT_FILTER_STATE }
}
