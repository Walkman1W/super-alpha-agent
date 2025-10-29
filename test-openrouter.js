// 测试 OpenRouter API 配置
require('dotenv').config({ path: '.env' })
const OpenAI = require('openai').default

async function testOpenRouter() {
  console.log('🧪 Testing OpenRouter API...\n')
  
  // 显示配置
  console.log('📋 Configuration:')
  console.log('  API Key:', process.env.OPENAI_API_KEY?.substring(0, 20) + '...')
  console.log('  Base URL:', process.env.OPENAI_BASE_URL)
  console.log('  Model:', process.env.OPENAI_MODEL)
  console.log('')
  
  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
    baseURL: process.env.OPENAI_BASE_URL,
  })
  
  try {
    console.log('🚀 Sending test request...\n')
    
    const response = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL,
      messages: [
        {
          role: 'system',
          content: 'You are a helpful assistant. Always respond with valid JSON only.'
        },
        {
          role: 'user',
          content: `分析这个 AI Agent 并返回 JSON 格式：

名称: Code Reviewer
描述: Expert code review assistant
平台: GPT Store

返回格式：
{
  "category": "开发工具",
  "short_description": "一句话描述",
  "key_features": ["功能1", "功能2"],
  "pros": ["优点1", "优点2"],
  "cons": ["缺点1"],
  "pricing": "免费"
}`
        }
      ],
      response_format: { type: 'json_object' },
      temperature: 0.7,
    })
    
    console.log('✅ API Response received!\n')
    console.log('📊 Response:')
    console.log(JSON.stringify(JSON.parse(response.choices[0].message.content), null, 2))
    console.log('\n✨ OpenRouter API is working correctly!')
    
  } catch (error) {
    console.error('❌ Error:', error.message)
    if (error.response) {
      console.error('Response:', error.response.data)
    }
  }
}

testOpenRouter()
