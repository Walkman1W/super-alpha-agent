/**
 * 过滤工具函数
 * 提供 Agent 列表的搜索和过滤功能
 * 
 * **Validates: Requirements 2.5, 4.5**
 */

import type { SignalAgent, FilterState, EntityType, AutonomyLevel } from './types/agent'
import { DEFAULT_FILTER_STATE } from './types/agent'

/**
 * 根据搜索关键词过滤 Agent 列表
 * 搜索范围: name, short_description, tags, framework
 * 
 * **Property 4: Search Filter Correctness**
 * **Validates: Requirements 2.5**
 * 
 * @param agents - Agent 列表
 * @param query - 搜索关键词
 * @returns 过滤后的 Agent 列表
 */
export function filterAgentsBySearch(agents: SignalAgent[], query: string): SignalAgent[] {
  if (!query || query.trim() === '') {
    return agents
  }

  const normalizedQuery = query.toLowerCase().trim()

  return agents.filter(agent => {
    // 搜索 name
    if (agent.name.toLowerCase().includes(normalizedQuery)) {
      return true
    }

    // 搜索 short_description
    if (agent.short_description.toLowerCase().includes(normalizedQuery)) {
      return true
    }

    // 搜索 tags
    if (agent.tags.some(tag => tag.toLowerCase().includes(normalizedQuery))) {
      return true
    }

    // 搜索 framework
    if (agent.framework && agent.framework.toLowerCase().includes(normalizedQuery)) {
      return true
    }

    return false
  })
}

/**
 * 根据框架过滤 Agent 列表
 * 
 * **Property 5: Framework Filter Correctness**
 * **Validates: Requirements 4.5**
 * 
 * @param agents - Agent 列表
 * @param frameworks - 选中的框架列表
 * @returns 过滤后的 Agent 列表
 */
export function filterAgentsByFramework(agents: SignalAgent[], frameworks: string[]): SignalAgent[] {
  if (!frameworks || frameworks.length === 0) {
    return agents
  }

  const frameworkSet = new Set(frameworks.map(f => f.toLowerCase()))

  return agents.filter(agent => {
    if (!agent.framework) {
      return false
    }
    return frameworkSet.has(agent.framework.toLowerCase())
  })
}

/**
 * 根据实体类型过滤 Agent 列表
 * 
 * @param agents - Agent 列表
 * @param entityTypes - 选中的实体类型列表
 * @returns 过滤后的 Agent 列表
 */
export function filterAgentsByEntityType(agents: SignalAgent[], entityTypes: EntityType[]): SignalAgent[] {
  if (!entityTypes || entityTypes.length === 0) {
    return agents
  }

  const typeSet = new Set(entityTypes)

  return agents.filter(agent => typeSet.has(agent.entity_type))
}

/**
 * 根据自主等级过滤 Agent 列表
 * 
 * @param agents - Agent 列表
 * @param autonomyLevels - 选中的自主等级列表
 * @returns 过滤后的 Agent 列表
 */
export function filterAgentsByAutonomyLevel(agents: SignalAgent[], autonomyLevels: AutonomyLevel[]): SignalAgent[] {
  if (!autonomyLevels || autonomyLevels.length === 0) {
    return agents
  }

  const levelSet = new Set(autonomyLevels)

  return agents.filter(agent => levelSet.has(agent.autonomy_level))
}

/**
 * 根据延迟过滤 Agent 列表
 * 
 * @param agents - Agent 列表
 * @param maxLatency - 最大延迟 (ms)
 * @returns 过滤后的 Agent 列表
 */
export function filterAgentsByLatency(agents: SignalAgent[], maxLatency: number): SignalAgent[] {
  if (maxLatency >= 2000) {
    return agents
  }

  return agents.filter(agent => {
    // 如果没有延迟数据，默认通过
    if (agent.metrics.latency === undefined) {
      return true
    }
    return agent.metrics.latency <= maxLatency
  })
}

/**
 * 根据成功率/在线率过滤 Agent 列表
 * 
 * @param agents - Agent 列表
 * @param minSuccessRate - 最小成功率 (%)
 * @returns 过滤后的 Agent 列表
 */
export function filterAgentsBySuccessRate(agents: SignalAgent[], minSuccessRate: number): SignalAgent[] {
  if (minSuccessRate <= 0) {
    return agents
  }

  return agents.filter(agent => {
    // 如果没有 uptime 数据，默认通过
    if (agent.metrics.uptime === undefined) {
      return true
    }
    return agent.metrics.uptime >= minSuccessRate
  })
}

/**
 * 应用所有过滤条件
 * 
 * @param agents - Agent 列表
 * @param filters - 过滤器状态
 * @returns 过滤后的 Agent 列表
 */
export function applyAllFilters(agents: SignalAgent[], filters: FilterState): SignalAgent[] {
  let result = agents

  // 搜索过滤
  result = filterAgentsBySearch(result, filters.search)

  // 框架过滤
  result = filterAgentsByFramework(result, filters.frameworks)

  // 实体类型过滤
  result = filterAgentsByEntityType(result, filters.entityTypes)

  // 自主等级过滤
  result = filterAgentsByAutonomyLevel(result, filters.autonomyLevels)

  // 延迟过滤
  result = filterAgentsByLatency(result, filters.maxLatency)

  // 成功率过滤
  result = filterAgentsBySuccessRate(result, filters.minSuccessRate)

  return result
}

/**
 * 清理和验证过滤器状态
 * 确保所有字段都有有效值
 * 
 * @param filters - 部分过滤器状态
 * @returns 完整的过滤器状态
 */
export function sanitizeFilterState(filters: Partial<FilterState>): FilterState {
  return {
    search: typeof filters.search === 'string' ? filters.search : DEFAULT_FILTER_STATE.search,
    maxLatency: Math.min(2000, Math.max(0, filters.maxLatency ?? DEFAULT_FILTER_STATE.maxLatency)),
    minSuccessRate: Math.min(100, Math.max(0, filters.minSuccessRate ?? DEFAULT_FILTER_STATE.minSuccessRate)),
    frameworks: Array.isArray(filters.frameworks) ? filters.frameworks : DEFAULT_FILTER_STATE.frameworks,
    entityTypes: Array.isArray(filters.entityTypes) ? filters.entityTypes : DEFAULT_FILTER_STATE.entityTypes,
    autonomyLevels: Array.isArray(filters.autonomyLevels) ? filters.autonomyLevels : DEFAULT_FILTER_STATE.autonomyLevels
  }
}

/**
 * 检查过滤器是否有任何活动条件
 * 
 * @param filters - 过滤器状态
 * @returns 是否有活动过滤条件
 */
export function hasActiveFilters(filters: FilterState): boolean {
  return (
    filters.search.trim() !== '' ||
    filters.frameworks.length > 0 ||
    filters.entityTypes.length > 0 ||
    filters.autonomyLevels.length > 0 ||
    filters.maxLatency < 2000 ||
    filters.minSuccessRate > 0
  )
}

/**
 * 重置过滤器到默认状态
 * 
 * @returns 默认过滤器状态
 */
export function resetFilters(): FilterState {
  return { ...DEFAULT_FILTER_STATE }
}
