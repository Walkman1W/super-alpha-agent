import { analyzeAgent } from '../lib/openai'
import { supabaseAdmin } from '../lib/supabase'
import type { RawAgentData } from './sources/gpt-store'

// 将分类名称映射到数据库 slug
const categoryMap: Record<string, string> = {
  '开发工具': 'development',
  '内容创作': 'content',
  '数据分析': 'data-analysis',
  '设计': 'design',
  '营销': 'marketing',
  '客服': 'customer-service',
  '教育': 'education',
  '研究': 'research',
  '生产力': 'productivity',
  '其他': 'other'
}

export async function enrichAndSaveAgent(rawData: RawAgentData) {
  try {
    console.log(`📝 Analyzing: ${rawData.name}`)
    
    // 使用 AI 分析
    const analyzed = await analyzeAgent(rawData)
    
    // 获取分类 ID
    const categorySlug = categoryMap[analyzed.category] || 'other'
    const { data: category } = await supabaseAdmin
      .from('categories')
      .select('id')
      .eq('slug', categorySlug)
      .single()
    
    if (!category) {
      throw new Error(`Category not found: ${categorySlug}`)
    }
    
    // 生成 slug
    const slug = rawData.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
    
    // 检查是否已存在
    const { data: existing } = await supabaseAdmin
      .from('agents')
      .select('id')
      .eq('slug', slug)
      .single()
    
    const agentData = {
      slug,
      name: rawData.name,
      category_id: category.id,
      short_description: analyzed.short_description,
      detailed_description: analyzed.detailed_description,
      key_features: analyzed.key_features,
      use_cases: analyzed.use_cases,
      pros: analyzed.pros,
      cons: analyzed.cons,
      how_to_use: analyzed.how_to_use,
      platform: rawData.platform,
      pricing: analyzed.pricing,
      official_url: rawData.url,
      keywords: analyzed.keywords,
      search_terms: analyzed.search_terms,
      source: rawData.platform,
      source_id: rawData.url,
      last_crawled_at: new Date().toISOString()
    }
    
    if (existing) {
      // 更新现有记录
      const { error } = await supabaseAdmin
        .from('agents')
        .update(agentData)
        .eq('id', existing.id)
      
      if (error) throw error
      console.log(`✅ Updated: ${rawData.name}`)
    } else {
      // 插入新记录
      const { error } = await supabaseAdmin
        .from('agents')
        .insert(agentData)
      
      if (error) throw error
      console.log(`✅ Created: ${rawData.name}`)
    }
    
    // 避免 API 限流
    await new Promise(resolve => setTimeout(resolve, 1000))
    
  } catch (error) {
    console.error(`❌ Error processing ${rawData.name}:`, error)
    throw error
  }
}

export async function batchEnrichAgents(rawAgents: RawAgentData[]) {
  console.log(`\n🚀 Starting batch enrichment for ${rawAgents.length} agents\n`)
  
  let successCount = 0
  let errorCount = 0
  
  for (const rawAgent of rawAgents) {
    try {
      await enrichAndSaveAgent(rawAgent)
      successCount++
    } catch (error) {
      errorCount++
      console.error(`Failed to process: ${rawAgent.name}`)
    }
  }
  
  console.log(`\n✨ Batch enrichment complete:`)
  console.log(`   ✅ Success: ${successCount}`)
  console.log(`   ❌ Errors: ${errorCount}`)
  console.log(`   📊 Total: ${rawAgents.length}\n`)
}
