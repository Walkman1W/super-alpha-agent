/**
 * Terminal UI Agent 类型定义
 * 扩展的 Agent 数据模型，支持 Bloomberg Terminal 风格界面
 */

// 实体类型: Agent 的交付形态
export type EntityType = 'repo' | 'saas' | 'app'

// 自主等级: Agent 自主程度分级 L1-L5
export type AutonomyLevel = 'L1' | 'L2' | 'L3' | 'L4' | 'L5'

// Agent 状态
export type AgentStatus = 'online' | 'offline' | 'maintenance'

// Agent 指标数据
export interface AgentMetrics {
  latency?: number      // ms, 响应延迟 (saas)
  uptime?: number       // percentage, 在线率 (saas)
  stars?: number        // GitHub stars (repo)
  forks?: number        // GitHub forks (repo)
  cost?: number         // $ per request, 每次请求成本
  lastCommit?: string   // ISO date, 最后提交时间 (repo)
  lastPing?: string     // relative time, 最后心跳时间
}

// 扩展的 Agent 类型 (Terminal UI)
export interface ExtendedAgent {
  id: string
  slug: string
  name: string
  category_id: string | null
  short_description: string
  detailed_description: string | null
  entity_type: EntityType
  autonomy_level: AutonomyLevel
  status: AgentStatus
  metrics: AgentMetrics
  framework: string | null
  tags: string[]
  rank: number
  geo_score: number
  official_url: string | null
  platform: string | null
  pricing: string | null
  key_features: string[]
  use_cases: string[]
  pros: string[]
  cons: string[]
  how_to_use: string | null
  keywords: string[]
  search_terms: string[]
  view_count: number
  favorite_count: number
  ai_search_count: number
  source: string | null
  source_id: string | null
  last_crawled_at: string | null
  created_at: string
  updated_at: string
}

// Signal Card 显示用的简化 Agent 类型
export interface SignalAgent {
  id: string
  slug: string
  name: string
  short_description: string
  entity_type: EntityType
  autonomy_level: AutonomyLevel
  status: AgentStatus
  metrics: AgentMetrics
  framework: string | null
  tags: string[]
  rank: number
  geo_score: number
  official_url: string | null
}

// 过滤器状态
export interface FilterState {
  search: string
  maxLatency: number
  minSuccessRate: number
  frameworks: string[]
  entityTypes: EntityType[]
  autonomyLevels: AutonomyLevel[]
}

// 默认过滤器状态
export const DEFAULT_FILTER_STATE: FilterState = {
  search: '',
  maxLatency: 2000,
  minSuccessRate: 0,
  frameworks: [],
  entityTypes: [],
  autonomyLevels: []
}

// 可用框架列表
export const AVAILABLE_FRAMEWORKS = [
  'LangChain',
  'AutoGPT',
  'BabyAGI',
  'LlamaIndex',
  'CrewAI',
  'AutoGen',
  'Custom'
] as const

// 自主等级描述
export const AUTONOMY_LEVEL_DESCRIPTIONS: Record<AutonomyLevel, string> = {
  L1: '基础自动化 - 执行预定义任务',
  L2: '辅助决策 - 提供建议和选项',
  L3: '有限自主 - 在约束内自主决策',
  L4: '高度自主 - 复杂任务自主完成',
  L5: '完全自主 - 自主学习和适应'
}

// 实体类型描述
export const ENTITY_TYPE_DESCRIPTIONS: Record<EntityType, string> = {
  repo: '代码仓库 - 可自托管的开源项目',
  saas: '网页服务 - 在线 API 或 Web 应用',
  app: '本地应用 - 桌面或移动端应用'
}

// 类型守卫函数
export function isValidEntityType(value: unknown): value is EntityType {
  return typeof value === 'string' && ['repo', 'saas', 'app'].includes(value)
}

export function isValidAutonomyLevel(value: unknown): value is AutonomyLevel {
  return typeof value === 'string' && ['L1', 'L2', 'L3', 'L4', 'L5'].includes(value)
}

export function isValidAgentStatus(value: unknown): value is AgentStatus {
  return typeof value === 'string' && ['online', 'offline', 'maintenance'].includes(value)
}

// 验证 Agent 数据
export function validateAgentData(data: unknown): data is Partial<ExtendedAgent> {
  if (typeof data !== 'object' || data === null) return false
  
  const agent = data as Record<string, unknown>
  
  // 验证 entity_type (如果存在)
  if (agent.entity_type !== undefined && !isValidEntityType(agent.entity_type)) {
    return false
  }
  
  // 验证 autonomy_level (如果存在)
  if (agent.autonomy_level !== undefined && !isValidAutonomyLevel(agent.autonomy_level)) {
    return false
  }
  
  // 验证 status (如果存在)
  if (agent.status !== undefined && !isValidAgentStatus(agent.status)) {
    return false
  }
  
  // 验证 metrics (如果存在)
  if (agent.metrics !== undefined && typeof agent.metrics !== 'object') {
    return false
  }
  
  return true
}
