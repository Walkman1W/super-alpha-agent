/**
 * 提示词生成器
 * 为 Agent 生成 Interface Prompt，用于让 LLM 调用 Agent API
 * 
 * 功能:
 * - 生成包含 Agent 名称、端点、能力的 Interface Prompt
 * - 当需要 API 密钥时包含 <PASTE_YOUR_KEY_HERE> 占位符
 * - 为没有 API 结构的 Track B 生成自然语言回退
 * 
 * 验证: 需求 8.1-8.6
 */

import type { ScannerAgent, PromptOutput, SRTrack, IOModality } from '@/lib/types/scanner'

/**
 * API 认证类型
 */
type AuthType = 'api_key' | 'oauth' | 'none' | 'unknown'

/**
 * 检测 Agent 是否需要 API 密钥
 * 基于描述、API 文档 URL 和页面内容中的关键词
 */
export function detectRequiresApiKey(agent: ScannerAgent): boolean {
  const content = [
    agent.description || '',
    agent.metaDescription || '',
    agent.apiDocsUrl || ''
  ].join(' ').toLowerCase()

  const apiKeyIndicators = [
    'api key',
    'api_key',
    'apikey',
    'api-key',
    'authentication',
    'auth token',
    'access token',
    'bearer token',
    'secret key',
    'credentials',
    'sign up',
    'register',
    'get started'
  ]

  return apiKeyIndicators.some(indicator => content.includes(indicator))
}

/**
 * 检测 Agent 是否有结构化 API
 * 基于 API 文档 URL、GitHub 中的 OpenAPI 文件等
 */
export function hasStructuredAPI(agent: ScannerAgent): boolean {
  // 有 API 文档 URL
  if (agent.apiDocsUrl) return true
  
  // GitHub 项目有 OpenAPI 文件 (通过 scoreBreakdown 判断)
  if (agent.scoreBreakdown.readinessScore >= 1.5) return true
  
  // 是 MCP 项目
  if (agent.isMcp) return true
  
  return false
}

/**
 * 获取 Agent 的主要端点 URL
 */
function getApiEndpoint(agent: ScannerAgent): string | undefined {
  // 优先使用 API 文档 URL
  if (agent.apiDocsUrl) {
    return agent.apiDocsUrl
  }
  
  // 其次使用 homepage
  if (agent.homepageUrl) {
    return agent.homepageUrl
  }
  
  // 最后使用 GitHub URL
  if (agent.githubUrl) {
    return agent.githubUrl
  }
  
  return undefined
}

/**
 * 格式化 I/O 模态列表为可读字符串
 */
function formatModalities(modalities: IOModality[]): string {
  const filtered = modalities.filter(m => m !== 'Unknown')
  if (filtered.length === 0) return 'various formats'
  return filtered.join(', ')
}

/**
 * 构建能力描述
 */
function buildCapabilitiesDescription(agent: ScannerAgent): string {
  const capabilities: string[] = []
  
  // 基于 I/O 模态
  const inputs = agent.inputTypes.filter(m => m !== 'Unknown')
  const outputs = agent.outputTypes.filter(m => m !== 'Unknown')
  
  if (inputs.length > 0) {
    capabilities.push(`Accepts input in: ${inputs.join(', ')}`)
  }
  
  if (outputs.length > 0) {
    capabilities.push(`Produces output in: ${outputs.join(', ')}`)
  }
  
  // 基于 MCP 支持
  if (agent.isMcp) {
    capabilities.push('Supports Model Context Protocol (MCP) for standardized AI integration')
  }
  
  // 基于轨道类型
  if (agent.srTrack === 'OpenSource') {
    capabilities.push('Open source project available on GitHub')
  } else if (agent.srTrack === 'SaaS') {
    capabilities.push('Cloud-based SaaS service')
  } else if (agent.srTrack === 'Hybrid') {
    capabilities.push('Available as both open source and cloud service')
  }
  
  // 基于 SR 评分
  const tierDescriptions: Record<string, string> = {
    S: 'Top-tier reliability and AI integration (Signal Rank S)',
    A: 'Production-ready with excellent AI visibility (Signal Rank A)',
    B: 'Functional with moderate AI visibility (Signal Rank B)',
    C: 'Experimental or limited AI visibility (Signal Rank C)'
  }
  capabilities.push(tierDescriptions[agent.srTier] || tierDescriptions.C)
  
  return capabilities.join('\n- ')
}

/**
 * 生成结构化 API 的 Interface Prompt
 */
function generateStructuredPrompt(agent: ScannerAgent, requiresApiKey: boolean): string {
  const endpoint = getApiEndpoint(agent)
  const capabilities = buildCapabilitiesDescription(agent)
  
  let prompt = `You are an AI assistant that helps users interact with "${agent.name}".

## About ${agent.name}
${agent.description || `${agent.name} is an AI agent available on Agent Signals.`}

## Capabilities
- ${capabilities}

## API Integration
`

  if (endpoint) {
    prompt += `- Documentation: ${endpoint}\n`
  }

  if (agent.isMcp) {
    prompt += `- Protocol: Model Context Protocol (MCP)
- This agent supports standardized MCP communication for seamless AI integration.
`
  }

  if (requiresApiKey) {
    prompt += `
## Authentication
This agent requires an API key for access.
API Key: <PASTE_YOUR_KEY_HERE>

When making requests, include the API key in the appropriate header or parameter as specified in the documentation.
`
  }

  prompt += `
## Usage Instructions
1. Review the agent's documentation for available endpoints and parameters
2. ${requiresApiKey ? 'Replace <PASTE_YOUR_KEY_HERE> with your actual API key' : 'No authentication required for basic usage'}
3. Format your requests according to the agent's API specification
4. Handle responses based on the output format (${formatModalities(agent.outputTypes)})

## Signal Rank
This agent has a Signal Rank of ${agent.srTier} (${agent.srScore.toFixed(1)}/10), indicating ${
    agent.srTier === 'S' ? 'excellent' :
    agent.srTier === 'A' ? 'very good' :
    agent.srTier === 'B' ? 'moderate' : 'basic'
  } AI integration readiness.`

  return prompt
}

/**
 * 生成自然语言回退 Prompt (用于没有结构化 API 的 Track B Agent)
 */
function generateNaturalLanguagePrompt(agent: ScannerAgent, requiresApiKey: boolean): string {
  const capabilities = buildCapabilitiesDescription(agent)
  
  let prompt = `You are an AI assistant helping users understand and use "${agent.name}".

## About ${agent.name}
${agent.description || `${agent.name} is a service available on Agent Signals.`}

## What This Agent Does
- ${capabilities}

## How to Use
Since this agent doesn't have a structured API, here's how you can interact with it:

1. **Visit the Website**: Go to ${agent.homepageUrl || 'the agent\'s homepage'}
2. **Explore Features**: Look for the main functionality described above
3. **Follow On-Screen Instructions**: The service will guide you through its features
`

  if (requiresApiKey) {
    prompt += `
## Authentication Required
This service requires you to create an account or obtain access credentials.
- Sign up at the service's website
- Look for API access or developer options
- Your API Key: <PASTE_YOUR_KEY_HERE>
`
  }

  prompt += `
## Integration Tips
- Check if the service offers browser extensions or plugins
- Look for export/import features to work with your data
- Consider using web automation tools if direct API isn't available

## Signal Rank
This agent has a Signal Rank of ${agent.srTier} (${agent.srScore.toFixed(1)}/10).
${agent.srTier === 'C' || agent.srTier === 'B' 
  ? 'The lower rank may indicate limited API access or AI integration options.' 
  : 'This indicates good reliability and potential for AI integration.'}`

  return prompt
}

/**
 * 生成 MCP 专用 Prompt
 */
function generateMCPPrompt(agent: ScannerAgent, requiresApiKey: boolean): string {
  const endpoint = getApiEndpoint(agent)
  
  let prompt = `You are an AI assistant configured to use "${agent.name}" via Model Context Protocol (MCP).

## MCP Server: ${agent.name}
${agent.description || `${agent.name} is an MCP-compatible AI agent.`}

## MCP Configuration
This agent supports the Model Context Protocol, enabling standardized communication between AI systems.

\`\`\`json
{
  "mcpServers": {
    "${agent.slug}": {
      "command": "npx",
      "args": ["-y", "${agent.slug}"],
      "env": {${requiresApiKey ? `
        "API_KEY": "<PASTE_YOUR_KEY_HERE>"` : ''}
      }
    }
  }
}
\`\`\`
`

  if (endpoint) {
    prompt += `
## Documentation
For detailed setup and usage instructions, visit: ${endpoint}
`
  }

  prompt += `
## Capabilities
- Input formats: ${formatModalities(agent.inputTypes)}
- Output formats: ${formatModalities(agent.outputTypes)}

## Signal Rank: ${agent.srTier} (${agent.srScore.toFixed(1)}/10)
This MCP server has excellent AI integration readiness.`

  return prompt
}

/**
 * 生成 Interface Prompt
 * 
 * @param agent - Agent 数据
 * @returns 提示词输出，包含系统提示词、是否有结构化 API、API 端点
 * 
 * **验证: 需求 8.1, 8.2, 8.3, 8.6**
 */
export function generatePrompt(agent: ScannerAgent): PromptOutput {
  const requiresApiKey = detectRequiresApiKey(agent)
  const hasAPI = hasStructuredAPI(agent)
  const endpoint = getApiEndpoint(agent)
  
  let systemPrompt: string
  
  // 根据 Agent 类型选择合适的 Prompt 模板
  if (agent.isMcp) {
    // MCP 项目使用专用模板
    systemPrompt = generateMCPPrompt(agent, requiresApiKey)
  } else if (hasAPI) {
    // 有结构化 API 的项目
    systemPrompt = generateStructuredPrompt(agent, requiresApiKey)
  } else {
    // 没有结构化 API 的 Track B 项目，使用自然语言回退
    systemPrompt = generateNaturalLanguagePrompt(agent, requiresApiKey)
  }
  
  return {
    systemPrompt,
    hasStructuredAPI: hasAPI,
    apiEndpoint: endpoint
  }
}

/**
 * 验证生成的 Prompt 是否包含必需元素
 * 用于属性测试
 */
export function validatePromptContent(prompt: string, agentName: string): boolean {
  // 必须包含 Agent 名称
  if (!prompt.includes(agentName)) return false
  
  // 必须非空
  if (prompt.trim().length === 0) return false
  
  return true
}

/**
 * 验证 Prompt 是否包含 API 密钥占位符
 * 用于属性测试
 */
export function hasApiKeyPlaceholder(prompt: string): boolean {
  return prompt.includes('<PASTE_YOUR_KEY_HERE>')
}

/**
 * 验证自然语言回退是否有效
 * 用于属性测试
 */
export function isValidNaturalLanguageFallback(prompt: string): boolean {
  // 必须非空
  if (prompt.trim().length === 0) return false
  
  // 必须包含使用说明
  const hasUsageInstructions = 
    prompt.includes('How to Use') || 
    prompt.includes('Usage') ||
    prompt.includes('Instructions')
  
  return hasUsageInstructions
}
