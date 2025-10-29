// 完整测试：OpenRouter + Supabase
require('dotenv').config({ path: '.env' })
const { createClient } = require('@supabase/supabase-js')
const OpenAI = require('openai').default

async function testFullSetup() {
  console.log('🧪 测试完整配置...\n')
  
  // 1. 测试 OpenRouter
  console.log('1️⃣ 测试 OpenRouter API')
  console.log('   API Key:', process.env.OPENAI_API_KEY?.substring(0, 20) + '...')
  console.log('   Base URL:', process.env.OPENAI_BASE_URL)
  console.log('   Model:', process.env.OPENAI_MODEL)
  
  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
    baseURL: process.env.OPENAI_BASE_URL,
  })
  
  try {
    const response = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL,
      messages: [
        { role: 'user', content: '你好，请回复"OK"' }
      ],
      max_tokens: 10,
    })
    console.log('   ✅ OpenRouter 连接成功')
    console.log('   响应:', response.choices[0].message.content)
  } catch (error) {
    console.log('   ❌ OpenRouter 连接失败:', error.message)
    return
  }
  
  console.log('')
  
  // 2. 测试 Supabase
  console.log('2️⃣ 测试 Supabase 连接')
  console.log('   URL:', process.env.NEXT_PUBLIC_SUPABASE_URL)
  console.log('   Anon Key:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.substring(0, 20) + '...')
  
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  )
  
  try {
    // 检查 categories 表
    const { data: categories, error } = await supabase
      .from('categories')
      .select('*')
      .limit(5)
    
    if (error) throw error
    
    console.log('   ✅ Supabase 连接成功')
    console.log('   找到', categories?.length || 0, '个分类')
    if (categories && categories.length > 0) {
      console.log('   示例:', categories[0].name)
    }
  } catch (error) {
    console.log('   ❌ Supabase 连接失败:', error.message)
    console.log('   提示: 请确保已在 Supabase Dashboard 执行 schema.sql 和 seed.sql')
    return
  }
  
  console.log('')
  
  // 3. 测试 AI 分析功能
  console.log('3️⃣ 测试 AI 分析功能')
  
  try {
    const analysisResponse = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL,
      messages: [
        {
          role: 'system',
          content: 'You are an AI agent analyst. Always respond with valid JSON only.'
        },
        {
          role: 'user',
          content: `分析这个 AI Agent 并返回 JSON：

名称: Code Reviewer
描述: 专业的代码审查助手
平台: GPT Store

返回格式：
{
  "category": "开发工具",
  "short_description": "一句话描述",
  "key_features": ["功能1", "功能2"],
  "pros": ["优点1"],
  "cons": ["缺点1"],
  "pricing": "免费"
}`
        }
      ],
      response_format: { type: 'json_object' },
      temperature: 0.7,
    })
    
    const analysis = JSON.parse(analysisResponse.choices[0].message.content)
    console.log('   ✅ AI 分析功能正常')
    console.log('   分析结果:', JSON.stringify(analysis, null, 2))
  } catch (error) {
    console.log('   ❌ AI 分析失败:', error.message)
    return
  }
  
  console.log('')
  console.log('✨ 所有测试通过！系统配置正确。')
  console.log('')
  console.log('📝 下一步:')
  console.log('   1. 升级 Node.js 到 18.17.0+ (推荐 20.x)')
  console.log('   2. 运行 npm run dev 启动开发服务器')
  console.log('   3. 访问 http://localhost:3000')
  console.log('   4. 运行 npm run crawler 抓取 Agent 数据')
}

testFullSetup().catch(console.error)
