/**
 * Tooltip 内容定义
 * 包含 L1-L5 自主等级定义和 GEO 评分说明
 */

export interface AutonomyLevelDefinition {
  level: 'L1' | 'L2' | 'L3' | 'L4' | 'L5'
  label: string
  labelEn: string
  description: string
  industryRef: string
  examples: string[]
}

export interface GeoScoreTooltip {
  title: string
  description: string
  formula: string
  components: {
    name: string
    weight: number
    description: string
  }[]
}

/**
 * L1-L5 自主等级定义
 * 基于 SAE 自动驾驶分级、Microsoft Copilot Stack、LangChain 等行业标准
 */
export const autonomyLevels: Record<string, AutonomyLevelDefinition> = {
  L1: {
    level: 'L1',
    label: '辅助型',
    labelEn: 'Assistant',
    description: 'AI 作为工具，由人类提示触发执行单一任务，无自主决策能力',
    industryRef: 'SAE Level 1 (Driver Assistance)',
    examples: ['ChatGPT 基础对话', '代码补全', '文本翻译'],
  },
  L2: {
    level: 'L2',
    label: '副驾驶型',
    labelEn: 'Copilot',
    description: 'AI 提供建议和辅助，人类保持最终决定权和控制权',
    industryRef: 'Microsoft Copilot Stack',
    examples: ['GitHub Copilot', 'Notion AI', 'Grammarly'],
  },
  L3: {
    level: 'L3',
    label: '链式工作流',
    labelEn: 'Chain',
    description: 'AI 执行预定义的线性多步骤工作流，具备有限的条件分支能力',
    industryRef: 'LangChain Chains / Zapier',
    examples: ['自动化工作流', 'CI/CD Pipeline', '数据处理管道'],
  },
  L4: {
    level: 'L4',
    label: '自主闭环',
    labelEn: 'Autonomous',
    description: 'AI 能够自我纠错、处理非线性任务，在特定领域内完全自主运行',
    industryRef: 'SAE Level 4 (High Automation)',
    examples: ['AutoGPT', 'Devin', 'Claude Computer Use'],
  },
  L5: {
    level: 'L5',
    label: '蜂群/组织级',
    labelEn: 'Swarm',
    description: '多智能体协作系统，具备组织架构、角色分工和集体智能',
    industryRef: 'OpenAI Multi-Agent / Anthropic MCP',
    examples: ['MetaGPT', 'AutoGen', 'CrewAI'],
  },
}

/**
 * 获取自主等级 Tooltip 内容
 */
export function getAutonomyTooltipContent(level: string): AutonomyLevelDefinition | null {
  const normalizedLevel = level.toUpperCase()
  return autonomyLevels[normalizedLevel] || null
}

/**
 * 格式化自主等级 Tooltip 显示内容
 */
export function formatAutonomyTooltip(level: string): string {
  const def = getAutonomyTooltipContent(level)
  if (!def) return '未知等级'
  
  return `${def.label} (${def.labelEn})\n${def.description}\n参考: ${def.industryRef}`
}

/**
 * GEO 评分 Tooltip 内容
 * 基于普林斯顿 GEO 研究的生成式引擎优化评分
 */
export const geoScoreTooltip: GeoScoreTooltip = {
  title: 'GEO 评分',
  description: '基于普林斯顿 GEO 研究的生成式引擎优化评分，衡量 Agent 在 AI 搜索引擎中的可发现性',
  formula: '总分 = 基础分(50) + 生命力(20) + 影响力(10) + 元数据(10) + 自主性(0-10)',
  components: [
    {
      name: '基础分',
      weight: 50,
      description: '所有 Agent 的起始分数',
    },
    {
      name: '生命力',
      weight: 20,
      description: '基于最近更新时间和活跃度',
    },
    {
      name: '影响力',
      weight: 10,
      description: '基于 GitHub Stars、用户评分等指标',
    },
    {
      name: '元数据',
      weight: 10,
      description: '描述完整度、标签丰富度等',
    },
    {
      name: '自主性',
      weight: 10,
      description: '基于 L1-L5 等级 (L1=2, L5=10)',
    },
  ],
}

/**
 * 格式化 GEO 评分 Tooltip 显示内容
 */
export function formatGeoTooltip(): string {
  return `${geoScoreTooltip.title}\n${geoScoreTooltip.description}\n\n公式: ${geoScoreTooltip.formula}`
}

/**
 * 验证自主等级是否有效
 */
export function isValidAutonomyLevel(level: string): boolean {
  const normalizedLevel = level.toUpperCase()
  return normalizedLevel in autonomyLevels
}

/**
 * 获取所有自主等级列表
 */
export function getAllAutonomyLevels(): AutonomyLevelDefinition[] {
  return Object.values(autonomyLevels)
}
