// 生成 sitemap.xml
require('dotenv').config({ path: '.env' })
const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const path = require('path')

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.superalphaagent.com'

async function generateSitemap() {
  console.log('🗺️  Generating sitemap...\n')
  
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  )
  
  // 获取所有 Agents
  const { data: agents } = await supabase
    .from('agents')
    .select('slug, updated_at')
    .order('updated_at', { ascending: false })
  
  // 获取所有分类
  const { data: categories } = await supabase
    .from('categories')
    .select('slug')
  
  // 生成 sitemap XML
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <!-- 首页 -->
  <url>
    <loc>${SITE_URL}</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  
  <!-- Agent 页面 -->
${agents?.map(agent => `  <url>
    <loc>${SITE_URL}/agents/${agent.slug}</loc>
    <lastmod>${agent.updated_at}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`).join('\n') || ''}
  
  <!-- 分类页面 -->
${categories?.map(category => `  <url>
    <loc>${SITE_URL}/category/${category.slug}</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>`).join('\n') || ''}
</urlset>`
  
  // 保存到 public 目录
  const publicDir = path.join(process.cwd(), 'public')
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true })
  }
  
  fs.writeFileSync(
    path.join(publicDir, 'sitemap.xml'),
    sitemap,
    'utf-8'
  )
  
  console.log('✅ Sitemap generated!')
  console.log(`   📄 File: public/sitemap.xml`)
  console.log(`   🔗 URL: ${SITE_URL}/sitemap.xml`)
  console.log(`   📊 Pages: ${1 + (agents?.length || 0) + (categories?.length || 0)}\n`)
}

generateSitemap().catch(error => {
  console.error('💥 Failed:', error)
  process.exit(1)
})
