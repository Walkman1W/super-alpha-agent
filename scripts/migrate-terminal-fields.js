/**
 * Terminal UI 字段迁移脚本
 * 为现有 agents 填充 entity_type, autonomy_level, metrics, status, rank, framework, geo_score 默认值
 * 
 * 使用方法: node scripts/migrate-terminal-fields.js
 */

require('dotenv').config()
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

// 根据 agent 特征推断 entity_type
function inferEntityType(agent) {
  const url = (agent.official_url || '').toLowerCase()
  const source = (agent.source || '').toLowerCase()
  const name = (agent.name || '').toLowerCase()
  
  if (source.includes('github') || url.includes('github.com')) {
    return 'repo'
  }
  if (url.includes('.app') || name.includes('app')) {
    return 'app'
  }
  return 'saas'
}

// 根据 agent 特征推断 autonomy_level
function inferAutonomyLevel(agent) {
  const desc = (agent.detailed_description || agent.short_description || '').toLowerCase()
  const features = JSON.stringify(agent.key_features || []).toLowerCase()
  
  // L5: 完全自主
  if (desc.includes('fully autonomous') || desc.includes('完全自主') || features.includes('autonomous')) {
    return 'L5'
  }
  // L4: 高度自主
  if (desc.includes('highly autonomous') || desc.includes('自动执行') || features.includes('auto-execute')) {
    return 'L4'
  }
  // L3: 中等自主
  if (desc.includes('semi-autonomous') || desc.includes('半自主') || features.includes('workflow')) {
    return 'L3'
  }
  // L2: 辅助型 (默认)
  if (desc.includes('assistant') || desc.includes('助手') || features.includes('assist')) {
    return 'L2'
  }
  // L1: 工具型
  if (desc.includes('tool') || desc.includes('工具')) {
    return 'L1'
  }
  
  return 'L2' // 默认
}

// 根据 agent 特征推断 framework
function inferFramework(agent) {
  const desc = (agent.detailed_description || agent.short_description || '').toLowerCase()
  const features = JSON.stringify(agent.key_features || []).toLowerCase()
  const combined = desc + ' ' + features
  
  if (combined.includes('langchain')) return 'LangChain'
  if (combined.includes('autogpt') || combined.includes('auto-gpt')) return 'AutoGPT'
  if (combined.includes('babyagi') || combined.includes('baby-agi')) return 'BabyAGI'
  if (combined.includes('llamaindex') || combined.includes('llama-index')) return 'LlamaIndex'
  if (combined.includes('crewai') || combined.includes('crew-ai')) return 'CrewAI'
  if (combined.includes('autogen')) return 'AutoGen'
  
  return null // 未知框架
}

// 生成初始 metrics
function generateMetrics(agent, entityType) {
  const metrics = {}
  
  if (entityType === 'saas') {
    metrics.latency = Math.floor(Math.random() * 500) + 100 // 100-600ms
    metrics.uptime = Math.floor(Math.random() * 5) + 95 // 95-100%
    metrics.lastPing = new Date().toISOString()
  } else if (entityType === 'repo') {
    metrics.stars = Math.floor(Math.random() * 5000) + 100
    metrics.forks = Math.floor(Math.random() * 500) + 10
    metrics.lastCommit = new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString()
  }
  
  // 随机添加 cost
  if (Math.random() > 0.5) {
    metrics.cost = Math.round((Math.random() * 0.05 + 0.001) * 1000) / 1000 // $0.001-$0.05
  }
  
  return metrics
}

// 计算 GEO Score
function calculateGeoScore(agent, entityType, autonomyLevel, metrics) {
  let score = 50 // Base
  
  // Vitality (20 points)
  if (entityType === 'saas' && metrics.uptime) {
    score += Math.min(20, metrics.uptime / 5)
  } else if (entityType === 'repo' && metrics.lastCommit) {
    const daysSinceCommit = Math.floor((Date.now() - new Date(metrics.lastCommit).getTime()) / (1000 * 60 * 60 * 24))
    score += Math.max(0, 20 - daysSinceCommit)
  }
  
  // Influence (10 points)
  if (metrics.stars) {
    score += Math.min(10, Math.log10(metrics.stars + 1) * 2)
  }
  
  // Metadata completeness (10 points)
  const metadataScore = [
    agent.detailed_description,
    (agent.key_features || []).length > 0,
    agent.official_url,
    agent.how_to_use
  ].filter(Boolean).length * 2.5
  score += metadataScore
  
  // Autonomy bonus (0-10 points)
  const autonomyBonus = { L1: 0, L2: 2, L3: 5, L4: 8, L5: 10 }
  score += autonomyBonus[autonomyLevel] || 0
  
  return Math.min(100, Math.round(score))
}

// 生成 tags
function generateTags(agent) {
  const tags = []
  const desc = (agent.detailed_description || agent.short_description || '').toLowerCase()
  
  // 基于描述推断标签
  if (desc.includes('code') || desc.includes('coding') || desc.includes('编程')) tags.push('coding')
  if (desc.includes('write') || desc.includes('writing') || desc.includes('写作')) tags.push('writing')
  if (desc.includes('data') || desc.includes('数据')) tags.push('data')
  if (desc.includes('research') || desc.includes('研究')) tags.push('research')
  if (desc.includes('chat') || desc.includes('对话')) tags.push('chat')
  if (desc.includes('image') || desc.includes('图像')) tags.push('image')
  if (desc.includes('api')) tags.push('api')
  if (desc.includes('open source') || desc.includes('开源')) tags.push('open-source')
  if (desc.includes('free') || desc.includes('免费')) tags.push('free')
  
  // 确保至少有一个标签
  if (tags.length === 0) {
    tags.push('ai-agent')
  }
  
  return tags.slice(0, 5) // 最多 5 个标签
}

async function migrateAgents() {
  console.log('🚀 Starting Terminal UI fields migration...\n')
  
  // 获取所有 agents
  const { data: agents, error: fetchError } = await supabase
    .from('agents')
    .select('*')
    .order('created_at', { ascending: true })
  
  if (fetchError) {
    console.error('❌ Failed to fetch agents:', fetchError.message)
    process.exit(1)
  }
  
  console.log(`📊 Found ${agents.length} agents to migrate\n`)
  
  let successCount = 0
  let errorCount = 0
  
  for (let i = 0; i < agents.length; i++) {
    const agent = agents[i]
    const rank = i + 1
    
    try {
      // 推断字段值
      const entityType = inferEntityType(agent)
      const autonomyLevel = inferAutonomyLevel(agent)
      const framework = inferFramework(agent)
      const metrics = generateMetrics(agent, entityType)
      const geoScore = calculateGeoScore(agent, entityType, autonomyLevel, metrics)
      const tags = generateTags(agent)
      const status = Math.random() > 0.1 ? 'online' : 'offline' // 90% online
      
      // 更新 agent
      const { error: updateError } = await supabase
        .from('agents')
        .update({
          entity_type: entityType,
          autonomy_level: autonomyLevel,
          framework: framework,
          metrics: metrics,
          geo_score: geoScore,
          tags: tags,
          status: status,
          rank: rank
        })
        .eq('id', agent.id)
      
      if (updateError) {
        throw updateError
      }
      
      console.log(`✅ [${rank}/${agents.length}] ${agent.name}`)
      console.log(`   Type: ${entityType} | Level: ${autonomyLevel} | Framework: ${framework || 'N/A'} | Score: ${geoScore}`)
      successCount++
      
    } catch (err) {
      console.error(`❌ [${rank}/${agents.length}] ${agent.name}: ${err.message}`)
      errorCount++
    }
  }
  
  console.log('\n' + '='.repeat(50))
  console.log(`✅ Migration complete!`)
  console.log(`   Success: ${successCount}`)
  console.log(`   Errors: ${errorCount}`)
  console.log('='.repeat(50))
}

// 运行迁移
migrateAgents().catch(console.error)
