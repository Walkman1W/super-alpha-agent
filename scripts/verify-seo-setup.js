// 验证 SEO 设置（Sitemap 和 Robots.txt）
const https = require('https')
const fs = require('fs')
const path = require('path')

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://agentsignals.ai'

console.log('🔍 验证 SEO 设置...\n')

// 检查本地文件
function checkLocalFiles() {
  console.log('📁 检查本地文件:')
  
  const sitemapPath = path.join(process.cwd(), 'public', 'sitemap.xml')
  const robotsPath = path.join(process.cwd(), 'public', 'robots.txt')
  
  if (fs.existsSync(sitemapPath)) {
    const stats = fs.statSync(sitemapPath)
    console.log(`  ✅ sitemap.xml 存在 (${stats.size} bytes, 最后修改: ${stats.mtime.toISOString()})`)
    
    // 验证 XML 格式
    const content = fs.readFileSync(sitemapPath, 'utf-8')
    if (content.includes('<?xml version="1.0"') && content.includes('<urlset')) {
      console.log('  ✅ sitemap.xml 格式正确')
      
      // 统计 URL 数量
      const urlCount = (content.match(/<url>/g) || []).length
      console.log(`  ✅ 包含 ${urlCount} 个 URL`)
    } else {
      console.log('  ❌ sitemap.xml 格式错误')
    }
  } else {
    console.log('  ❌ sitemap.xml 不存在')
  }
  
  if (fs.existsSync(robotsPath)) {
    const stats = fs.statSync(robotsPath)
    console.log(`  ✅ robots.txt 存在 (${stats.size} bytes)`)
    
    // 验证内容
    const content = fs.readFileSync(robotsPath, 'utf-8')
    if (content.includes('Sitemap:')) {
      console.log('  ✅ robots.txt 包含 Sitemap 声明')
    } else {
      console.log('  ⚠️  robots.txt 缺少 Sitemap 声明')
    }
    
    // 检查 AI 爬虫
    const aiCrawlers = ['GPTBot', 'Claude-Web', 'PerplexityBot', 'anthropic-ai']
    const foundCrawlers = aiCrawlers.filter(crawler => content.includes(crawler))
    console.log(`  ✅ 允许 ${foundCrawlers.length}/${aiCrawlers.length} 个 AI 爬虫: ${foundCrawlers.join(', ')}`)
  } else {
    console.log('  ❌ robots.txt 不存在')
  }
  
  console.log('')
}

// 检查在线可访问性
async function checkOnlineAccess() {
  console.log('🌐 检查在线可访问性:')
  
  // 检查 sitemap
  await checkURL(`${SITE_URL}/sitemap.xml`, 'Sitemap')
  
  // 检查 robots.txt
  await checkURL(`${SITE_URL}/robots.txt`, 'Robots.txt')
  
  console.log('')
}

function checkURL(url, name) {
  return new Promise((resolve) => {
    const startTime = Date.now()
    
    https.get(url, (res) => {
      const duration = Date.now() - startTime
      
      if (res.statusCode === 200) {
        console.log(`  ✅ ${name} 可访问 (${res.statusCode}, ${duration}ms)`)
        console.log(`     Content-Type: ${res.headers['content-type']}`)
        
        // 读取内容大小
        let size = 0
        res.on('data', (chunk) => {
          size += chunk.length
        })
        res.on('end', () => {
          console.log(`     Size: ${size} bytes`)
          resolve()
        })
      } else {
        console.log(`  ❌ ${name} 返回错误状态码: ${res.statusCode}`)
        resolve()
      }
    }).on('error', (error) => {
      console.log(`  ❌ ${name} 无法访问: ${error.message}`)
      resolve()
    })
  })
}

// 验证 sitemap 内容
function validateSitemapContent() {
  console.log('🔍 验证 Sitemap 内容:')
  
  const sitemapPath = path.join(process.cwd(), 'public', 'sitemap.xml')
  
  if (!fs.existsSync(sitemapPath)) {
    console.log('  ❌ sitemap.xml 不存在，无法验证')
    return
  }
  
  const content = fs.readFileSync(sitemapPath, 'utf-8')
  
  // 检查必需元素
  const checks = [
    { name: '首页', pattern: /<loc>https:\/\/agentsignals\.ai<\/loc>/ },
    { name: 'Agent 页面', pattern: /<loc>https:\/\/agentsignals\.ai\/agents\// },
    { name: '分类页面', pattern: /<loc>https:\/\/agentsignals\.ai\/category\// },
    { name: 'lastmod 标签', pattern: /<lastmod>/ },
    { name: 'changefreq 标签', pattern: /<changefreq>/ },
    { name: 'priority 标签', pattern: /<priority>/ },
  ]
  
  checks.forEach(check => {
    if (check.pattern.test(content)) {
      console.log(`  ✅ 包含 ${check.name}`)
    } else {
      console.log(`  ❌ 缺少 ${check.name}`)
    }
  })
  
  // 检查 URL 格式
  const urls = content.match(/<loc>(.*?)<\/loc>/g) || []
  const invalidUrls = urls.filter(url => {
    const urlContent = url.replace(/<\/?loc>/g, '')
    return !urlContent.startsWith('https://') || urlContent.includes(' ')
  })
  
  if (invalidUrls.length === 0) {
    console.log(`  ✅ 所有 ${urls.length} 个 URL 格式正确`)
  } else {
    console.log(`  ❌ 发现 ${invalidUrls.length} 个格式错误的 URL`)
    invalidUrls.forEach(url => console.log(`     ${url}`))
  }
  
  console.log('')
}

// 生成提交清单
function generateSubmissionChecklist() {
  console.log('📋 搜索引擎提交清单:')
  console.log('')
  console.log('  1. Google Search Console')
  console.log('     🔗 https://search.google.com/search-console')
  console.log('     📝 提交 sitemap: sitemap.xml')
  console.log('')
  console.log('  2. Bing Webmaster Tools')
  console.log('     🔗 https://www.bing.com/webmasters')
  console.log('     📝 提交 sitemap: https://agentsignals.ai/sitemap.xml')
  console.log('')
  console.log('  3. Yandex Webmaster (可选)')
  console.log('     🔗 https://webmaster.yandex.com')
  console.log('')
  console.log('  4. 百度搜索资源平台 (可选)')
  console.log('     🔗 https://ziyuan.baidu.com')
  console.log('')
  console.log('💡 提示: 查看详细指南')
  console.log('   - docs/quick-submission-guide.md')
  console.log('   - docs/search-engine-submission-checklist.md')
  console.log('   - docs/sitemap-and-seo-submission.md')
  console.log('')
}

// 主函数
async function main() {
  try {
    checkLocalFiles()
    validateSitemapContent()
    await checkOnlineAccess()
    generateSubmissionChecklist()
    
    console.log('✅ SEO 设置验证完成!')
    console.log('')
    console.log('🚀 下一步: 提交到搜索引擎')
    console.log('   运行: npm run sitemap  # 重新生成 sitemap')
    console.log('   查看: docs/quick-submission-guide.md')
  } catch (error) {
    console.error('❌ 验证失败:', error)
    process.exit(1)
  }
}

main()
