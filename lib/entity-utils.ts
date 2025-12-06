/**
 * 实体类型工具函数
 * 提供实体类型图标映射和框架图标映射
 */

import type { EntityType, AutonomyLevel } from './types/agent'

/**
 * 获取实体类型对应的图标
 * - repo: 📦 (代码仓库)
 * - saas: 🌐 (网页服务)
 * - app: 📱 (本地应用)
 * 
 * **Validates: Requirements 6.5**
 */
export function getEntityIcon(entityType: EntityType): string {
  const iconMap: Record<EntityType, string> = {
    repo: '📦',
    saas: '🌐',
    app: '📱'
  }
  return iconMap[entityType] ?? '🤖'
}

/**
 * 获取实体类型的标签文本
 */
export function getEntityLabel(entityType: EntityType): string {
  const labelMap: Record<EntityType, string> = {
    repo: 'Repository',
    saas: 'SaaS',
    app: 'App'
  }
  return labelMap[entityType] ?? 'Unknown'
}

/**
 * 获取框架对应的图标/颜色
 */
export function getFrameworkIcon(framework: string | null): { icon: string; color: string } {
  if (!framework) {
    return { icon: '⚙️', color: 'text-zinc-400' }
  }

  const frameworkMap: Record<string, { icon: string; color: string }> = {
    'LangChain': { icon: '🦜', color: 'text-green-400' },
    'AutoGPT': { icon: '🤖', color: 'text-blue-400' },
    'BabyAGI': { icon: '👶', color: 'text-pink-400' },
    'LlamaIndex': { icon: '🦙', color: 'text-purple-400' },
    'CrewAI': { icon: '👥', color: 'text-orange-400' },
    'AutoGen': { icon: '🔄', color: 'text-cyan-400' },
    'Custom': { icon: '🛠️', color: 'text-yellow-400' }
  }

  return frameworkMap[framework] ?? { icon: '⚙️', color: 'text-zinc-400' }
}

/**
 * 获取自主等级的样式配置
 */
export function getAutonomyLevelStyle(level: AutonomyLevel): {
  label: string
  color: string
  bgColor: string
  description: string
} {
  const styleMap: Record<AutonomyLevel, {
    label: string
    color: string
    bgColor: string
    description: string
  }> = {
    L1: {
      label: 'L1',
      color: 'text-zinc-400',
      bgColor: 'bg-zinc-800',
      description: '基础自动化'
    },
    L2: {
      label: 'L2',
      color: 'text-blue-400',
      bgColor: 'bg-blue-900/30',
      description: '辅助决策'
    },
    L3: {
      label: 'L3',
      color: 'text-green-400',
      bgColor: 'bg-green-900/30',
      description: '有限自主'
    },
    L4: {
      label: 'L4',
      color: 'text-purple-400',
      bgColor: 'bg-purple-900/30',
      description: '高度自主'
    },
    L5: {
      label: 'L5',
      color: 'text-amber-400',
      bgColor: 'bg-amber-900/30',
      description: '完全自主'
    }
  }

  return styleMap[level] ?? styleMap.L2
}

/**
 * 格式化延迟显示
 */
export function formatLatency(latency: number | undefined): string {
  if (latency === undefined) return '--'
  if (latency < 1000) return `${latency}ms`
  return `${(latency / 1000).toFixed(1)}s`
}

/**
 * 格式化成本显示
 */
export function formatCost(cost: number | undefined): string {
  if (cost === undefined) return '--'
  if (cost === 0) return 'Free'
  if (cost < 0.01) return '<$0.01'
  return `$${cost.toFixed(2)}`
}

/**
 * 格式化 stars 数量
 */
export function formatStars(stars: number | undefined): string {
  if (stars === undefined) return '--'
  if (stars < 1000) return stars.toString()
  if (stars < 1000000) return `${(stars / 1000).toFixed(1)}k`
  return `${(stars / 1000000).toFixed(1)}M`
}
