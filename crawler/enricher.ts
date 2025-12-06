import { analyzeAgent } from '../lib/openai'
import { supabaseAdmin } from '../lib/supabase'
import { notifyAgentPublished } from '../lib/indexnow'
import type { RawAgentData } from './sources/gpt-store'

// 扩展 RawAgentData 类型以支持 GitHub 特有字段
export interface ExtendedRawAgentData extends RawAgentData {
  github_stars?: number
  github_url?: string
  github_owner?: string
  github_topics?: string[]
  readme_content?: string | null
}

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

export async function enrichAndSaveAgent(rawData: RawAgentData | ExtendedRawAgentData) {
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
    
    // 检查是否已存在（优先通过 source_id 查找，避免重复）
    let existing = null
    
    // 如果有 source_id，先尝试通过它查找
    if (rawData.url) {
      const { data } = await supabaseAdmin
        .from('agents')
        .select('id')
        .eq('source_id', rawData.url)
        .single()
      existing = data
    }
    
    // 如果没找到，再通过 slug 查找
    if (!existing) {
      const { data } = await supabaseAdmin
        .from('agents')
        .select('id')
        .eq('slug', slug)
        .single()
      existing = data
    }
    
    // 构建基础数据
    const agentData: any = {
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
    
    // 如果是 GitHub 数据源，添加 GitHub 特有字段
    const extendedData = rawData as ExtendedRawAgentData
    if (extendedData.github_stars !== undefined) {
      agentData.github_stars = extendedData.github_stars
    }
    if (extendedData.github_url) {
      agentData.github_url = extendedData.github_url
    }
    if (extendedData.github_owner) {
      agentData.github_owner = extendedData.github_owner
    }
    if (extendedData.github_topics) {
      agentData.github_topics = extendedData.github_topics
    }
    
    if (existing) {
      // 更新现有记录
      const { error } = await supabaseAdmin
        .from('agents')
        .update(agentData)
        .eq('id', existing.id)
      
      if (error) throw error
      console.log(`✅ Updated: ${rawData.name}`)
      
      // 通知 IndexNow（异步，不阻塞）
      notifyAgentPublished(slug).catch(err => {
        console.error(`IndexNow notification failed for ${slug}:`, err)
      })
      
      return { action: 'updated', id: existing.id, slug }
    } else {
      // 插入新记录
      const { data: inserted, error } = await supabaseAdmin
        .from('agents')
        .insert(agentData)
        .select('id')
        .single()
      
      if (error) throw error
      console.log(`✅ Created: ${rawData.name}`)
      
      // 通知 IndexNow（异步，不阻塞）
      notifyAgentPublished(slug).catch(err => {
        console.error(`IndexNow notification failed for ${slug}:`, err)
      })
      
      return { action: 'created', id: inserted?.id, slug }
    }
    
  } catch (error) {
    console.error(`❌ Error processing ${rawData.name}:`, error)
    throw error
  } finally {
    // 避免 API 限流
    await new Promise(resolve => setTimeout(resolve, 1000))
  }
}

export async function batchEnrichAgents(rawAgents: (RawAgentData | ExtendedRawAgentData)[]) {
  console.log(`\n🚀 Starting batch enrichment for ${rawAgents.length} agents\n`)
  
  let createdCount = 0
  let updatedCount = 0
  let errorCount = 0
  
  for (const rawAgent of rawAgents) {
    try {
      const result = await enrichAndSaveAgent(rawAgent)
      if (result?.action === 'created') {
        createdCount++
      } else if (result?.action === 'updated') {
        updatedCount++
      }
    } catch (error) {
      errorCount++
      console.error(`Failed to process: ${rawAgent.name}`)
    }
  }
  
  console.log(`\n✨ Batch enrichment complete:`)
  console.log(`   ✅ Created: ${createdCount}`)
  console.log(`   🔄 Updated: ${updatedCount}`)
  console.log(`   ❌ Errors: ${errorCount}`)
  console.log(`   📊 Total: ${rawAgents.length}\n`)
  
  return {
    created: createdCount,
    updated: updatedCount,
    failed: errorCount,
    total: rawAgents.length
  }
}
