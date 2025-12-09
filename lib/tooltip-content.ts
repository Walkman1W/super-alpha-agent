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

export interface SignalScoreTooltip {
  title: string
  description: string
  formula: string
  dimensions: {
    name: string
    nameEn: string
    maxPoints: number
    color: string
    metrics: {
      name: string
      criteria: string
      points: number
    }[]
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
 * Signal Score (SSS v2.0) Tooltip 内容
 * 基于机器可读性和可靠性的评分系统
 */
export const signalScoreTooltip: SignalScoreTooltip = {
  title: 'Signal Score (SSS v2.0)',
  description: '基于机器可读性与可靠性的评分系统，衡量 Agent 被 LLM 理解和调用的能力',
  formula: 'Total Score: 0.0 - 10.0 = Vitality(3) + Semantic Readiness(4) + Interoperability(3)',
  dimensions: [
    {
      name: '生命力',
      nameEn: 'Vitality',
      maxPoints: 3,
      color: 'green',
      metrics: [
        { name: 'Active Endpoint', criteria: 'Website/API 200 OK & Latency < 2s', points: 1.0 },
        { name: 'Freshness', criteria: 'Last Commit/Update < 30 days', points: 1.0 },
        { name: 'Security', criteria: 'Valid HTTPS & No malware flags', points: 1.0 },
      ],
    },
    {
      name: '语义就绪',
      nameEn: 'Semantic Readiness',
      maxPoints: 4,
      color: 'blue',
      metrics: [
        { name: 'Basic Meta', criteria: '<title>, <meta description> exist', points: 1.0 },
        { name: 'Documentation', criteria: '/docs, README.md or Wiki exists', points: 1.0 },
        { name: 'Structured Data', criteria: 'Contains application/ld+json', points: 1.0 },
        { name: 'Manifest/Spec', criteria: 'manifest.json, openapi.yaml exists', points: 1.0 },
      ],
    },
    {
      name: '互操作性',
      nameEn: 'Interoperability',
      maxPoints: 3,
      color: 'purple',
      metrics: [
        { name: 'Open Source', criteria: 'Public Repo + OSI License', points: 1.0 },
        { name: 'Protocol Ready', criteria: 'Supports MCP or standard APIs', points: 2.0 },
      ],
    },
  ],
}

// 保留旧名称的别名以兼容
export const geoScoreTooltip = signalScoreTooltip

/**
 * 格式化 Signal Score Tooltip 显示内容
 */
export function formatSignalScoreTooltip(): string {
  return `${signalScoreTooltip.title}\n${signalScoreTooltip.description}\n\n公式: ${signalScoreTooltip.formula}`
}

// 保留旧名称的别名以兼容
export const formatGeoTooltip = formatSignalScoreTooltip

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
