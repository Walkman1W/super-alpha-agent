#!/usr/bin/env node

/**
 * 性能测试脚本
 * 测试主页加载时间和数据大小
 */

const http = require('http')
const https = require('https')

const TEST_URL = process.env.TEST_URL || 'http://localhost:3000'
const ITERATIONS = 3

console.log('🚀 开始性能测试...\n')
console.log(`测试 URL: ${TEST_URL}`)
console.log(`测试次数: ${ITERATIONS}\n`)

async function testPageLoad(url) {
  return new Promise((resolve, reject) => {
    const startTime = Date.now()
    const protocol = url.startsWith('https') ? https : http
    
    protocol.get(url, (res) => {
      let data = ''
      let dataSize = 0
      
      res.on('data', (chunk) => {
        data += chunk
        dataSize += chunk.length
      })
      
      res.on('end', () => {
        const endTime = Date.now()
        const loadTime = endTime - startTime
        
        resolve({
          loadTime,
          dataSize,
          statusCode: res.statusCode,
          headers: res.headers
        })
      })
    }).on('error', reject)
  })
}

async function runTests() {
  const results = []
  
  for (let i = 0; i < ITERATIONS; i++) {
    console.log(`📊 测试 ${i + 1}/${ITERATIONS}...`)
    
    try {
      const result = await testPageLoad(TEST_URL)
      results.push(result)
      
      console.log(`  ✅ 状态码: ${result.statusCode}`)
      console.log(`  ⏱️  加载时间: ${result.loadTime}ms`)
      console.log(`  📦 数据大小: ${(result.dataSize / 1024).toFixed(2)} KB`)
      console.log(`  🔄 缓存策略: ${result.headers['cache-control'] || 'N/A'}`)
      console.log('')
    } catch (error) {
      console.error(`  ❌ 测试失败: ${error.message}\n`)
    }
  }
  
  if (results.length === 0) {
    console.error('❌ 所有测试都失败了')
    process.exit(1)
  }
  
  // 计算平均值
  const avgLoadTime = results.reduce((sum, r) => sum + r.loadTime, 0) / results.length
  const avgDataSize = results.reduce((sum, r) => sum + r.dataSize, 0) / results.length
  
  console.log('📈 测试结果汇总:')
  console.log('─'.repeat(50))
  console.log(`平均加载时间: ${avgLoadTime.toFixed(0)}ms`)
  console.log(`平均数据大小: ${(avgDataSize / 1024).toFixed(2)} KB`)
  console.log(`最快加载时间: ${Math.min(...results.map(r => r.loadTime))}ms`)
  console.log(`最慢加载时间: ${Math.max(...results.map(r => r.loadTime))}ms`)
  console.log('')
  
  // 性能评估
  console.log('🎯 性能评估:')
  console.log('─'.repeat(50))
  
  if (avgLoadTime < 2000) {
    console.log('✅ 加载时间: 优秀 (< 2s)')
  } else if (avgLoadTime < 3000) {
    console.log('⚠️  加载时间: 良好 (2-3s)')
  } else if (avgLoadTime < 5000) {
    console.log('⚠️  加载时间: 一般 (3-5s)')
  } else {
    console.log('❌ 加载时间: 需要优化 (> 5s)')
  }
  
  if (avgDataSize < 50 * 1024) {
    console.log('✅ 数据大小: 优秀 (< 50 KB)')
  } else if (avgDataSize < 100 * 1024) {
    console.log('⚠️  数据大小: 良好 (50-100 KB)')
  } else if (avgDataSize < 200 * 1024) {
    console.log('⚠️  数据大小: 一般 (100-200 KB)')
  } else {
    console.log('❌ 数据大小: 需要优化 (> 200 KB)')
  }
  
  console.log('')
  console.log('✨ 测试完成!')
}

runTests().catch(error => {
  console.error('❌ 测试失败:', error)
  process.exit(1)
})
