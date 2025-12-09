#!/usr/bin/env node

/**
 * 验证爬虫数据质量
 * 检查Supabase中存储的agent数据
 */

import { config } from 'dotenv'
import { createClient } from '@supabase/supabase-js'

config()

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function verifyData() {
  console.log('🔍 验证爬虫数据质量\n')
  
  try {
    // 1. 获取最近爬取的agents
    const { data: agents, error } = await supabase
      .from('agents')
      .select(`
        id,
        slug,
        name,
        short_description,
        key_features,
        pros,
        cons,
        platform,
        pricing,
        official_url,
        github_stars,
        github_url,
        github_owner,
        source,
        last_crawled_at,
        created_at
      `)
      .order('created_at', { ascending: false })
      .limit(10)
    
    if (error) throw error
    
    if (!agents || agents.length === 0) {
      console.log('⚠️  没有找到任何agent数据')
      return
    }
    
    console.log(`📊 找到 ${agents.length} 个最新的agents\n`)
    
    // 2. 逐个检查数据质量
    let issueCount = 0
    
    agents.forEach((agent, index) => {
      console.log(`\n${index + 1}. ${agent.name}`)
      console.log(`   Slug: ${agent.slug}`)
      console.log(`   来源: ${agent.source || 'N/A'}`)
      console.log(`   平台: ${agent.platform || 'N/A'}`)
      
      const issues = []
      
      // 检查必填字段
      if (!agent.name) issues.push('缺少 name')
      if (!agent.slug) issues.push('缺少 slug')
      if (!agent.short_description) issues.push('缺少 short_description')
      
      // 检查数组字段
      if (!agent.key_features || agent.key_features.length === 0) {
        issues.push('key_features 为空')
      }
      if (!agent.pros || agent.pros.length === 0) {
        issues.push('pros 为空')
      }
      if (!agent.cons || agent.cons.length === 0) {
        issues.push('cons 为空')
      }
      
      // 检查URL
      if (!agent.official_url) {
        issues.push('缺少 official_url')
      }
      
      // 检查GitHub字段（如果是GitHub源）
      if (agent.source === 'github') {
        if (!agent.github_url) issues.push('缺少 github_url')
        if (!agent.github_stars && agent.github_stars !== 0) issues.push('缺少 github_stars')
        if (!agent.github_owner) issues.push('缺少 github_owner')
      }
      
      // 显示结果
      if (issues.length > 0) {
        console.log(`   ❌ 问题: ${issues.join(', ')}`)
        issueCount++
      } else {
        console.log(`   ✅ 数据完整`)
      }
      
      // 显示关键数据
      console.log(`   描述: ${agent.short_description?.substring(0, 60)}...`)
      console.log(`   特性数: ${agent.key_features?.length || 0}`)
      console.log(`   优点数: ${agent.pros?.length || 0}`)
      console.log(`   缺点数: ${agent.cons?.length || 0}`)
      if (agent.github_stars !== null && agent.github_stars !== undefined) {
        console.log(`   GitHub Stars: ${agent.github_stars}`)
      }
      console.log(`   爬取时间: ${agent.last_crawled_at || 'N/A'}`)
    })
    
    // 3. 总结
    console.log('\n' + '='.repeat(60))
    console.log('📈 数据质量总结:')
    console.log(`   总数: ${agents.length}`)
    console.log(`   有问题: ${issueCount}`)
    console.log(`   完整: ${agents.length - issueCount}`)
    console.log(`   质量率: ${((agents.length - issueCount) / agents.length * 100).toFixed(1)}%`)
    
    // 4. 检查分类映射
    console.log('\n🏷️  检查分类映射:')
    const { data: categories } = await supabase
      .from('categories')
      .select('id, name, slug')
    
    if (categories) {
      console.log(`   可用分类: ${categories.length}`)
      categories.forEach(cat => {
        console.log(`   - ${cat.name} (${cat.slug})`)
      })
    }
    
    // 5. 检查重复
    console.log('\n🔄 检查重复数据:')
    const { data: duplicates } = await supabase
      .from('agents')
      .select('slug, count')
      .group('slug')
      .having('count > 1')
    
    if (duplicates && duplicates.length > 0) {
      console.log(`   ⚠️  发现 ${duplicates.length} 个重复的slug`)
      duplicates.forEach(dup => {
        console.log(`   - ${dup.slug}: ${dup.count} 次`)
      })
    } else {
      console.log('   ✅ 没有重复数据')
    }
    
  } catch (error) {
    console.error('❌ 验证失败:', error)
    process.exit(1)
  }
}

verifyData()
