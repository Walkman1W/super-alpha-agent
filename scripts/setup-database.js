#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const path = require('path')

async function setupDatabase() {
  console.log('🗄️  Setting up database...\n')

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Missing Supabase credentials in .env.local')
    console.error('   Please set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY')
    process.exit(1)
  }

  const supabase = createClient(supabaseUrl, supabaseKey)

  try {
    // 读取 schema
    const schemaPath = path.join(__dirname, '../supabase/schema.sql')
    const schema = fs.readFileSync(schemaPath, 'utf8')

    console.log('📝 Executing schema...')
    // 注意：Supabase JS 客户端不直接支持执行 SQL
    // 你需要在 Supabase Dashboard 的 SQL Editor 中手动执行 schema.sql
    console.log('\n⚠️  请在 Supabase Dashboard 中执行以下步骤：')
    console.log('   1. 访问 https://app.supabase.com')
    console.log('   2. 选择你的项目')
    console.log('   3. 进入 SQL Editor')
    console.log('   4. 复制并执行 supabase/schema.sql 的内容')
    console.log('   5. 复制并执行 supabase/seed.sql 的内容\n')

    // 验证表是否存在
    const { data, error } = await supabase
      .from('categories')
      .select('count')
      .limit(1)

    if (error) {
      console.log('❌ 表还未创建，请先在 Supabase Dashboard 执行 SQL')
    } else {
      console.log('✅ 数据库连接成功！')
    }

  } catch (error) {
    console.error('❌ Setup failed:', error)
    process.exit(1)
  }
}

setupDatabase()
