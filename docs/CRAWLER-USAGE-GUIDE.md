# 爬虫使用指南

## ✅ 修复完成

已将爬虫切换到真实的GitHub API版本！

### 修改内容
1. ✅ 更新`package.json`使用`tsx crawler/run.ts`
2. ✅ 安装`tsx`和`cross-env`依赖
3. ✅ 重命名`crawler/run.js` → `crawler/run.seed.js`
4. ✅ 修复环境变量加载问题
5. ✅ 修复OpenAI客户端初始化问题

## 🚀 立即开始使用

### 1. 快速测试（10个agents）

```bash
# 设置环境变量
$env:CRAWLER_MAX_AGENTS_PER_RUN='10'
$env:GITHUB_MIN_STARS='100'

# 运行爬虫
npm run crawler:github
```

### 2. 生产环境配置

编辑`.env`文件：
```env
# 爬虫配置
CRAWLER_SOURCE=github
CRAWLER_MAX_AGENTS_PER_RUN=50
GITHUB_TOPIC=ai-agent
GITHUB_MIN_STARS=100

# GitHub API
GITHUB_TOKEN=your_token_here

# OpenRouter (AI分析)
OPENAI_API_KEY=sk-or-v1-...
OPENAI_BASE_URL=https://openrouter.ai/api/v1
OPENAI_MODEL=qwen/qwen-2.5-72b-instruct
```

### 3. 运行完整爬虫

```bash
# 方式1: 使用npm脚本
npm run crawler:github

# 方式2: 自定义参数
$env:CRAWLER_MAX_AGENTS_PER_RUN='50'
$env:GITHUB_MIN_STARS='200'
npm run crawler:github

# 方式3: 抓取所有来源（GitHub + GPT Store）
npm run crawler:all
```

## 📊 可用的数据源

### GitHub Topics

| Topic | 仓库数量 | 推荐星标 | 说明 |
|-------|----------|----------|------|
| `ai-agent` | 113+ | >= 100 | 最相关，AI代理应用 |
| `llm` | 1,250+ | >= 500 | 大语言模型应用 |
| `chatgpt` | 数百个 | >= 200 | ChatGPT相关 |
| `langchain` | 数百个 | >= 100 | LangChain框架 |
| `autonomous-agent` | 数十个 | >= 50 | 自主代理 |

### 高质量项目示例

1. **zhayujie/chatgpt-on-wechat** - 39,946⭐
   - 微信聊天机器人，支持多个AI模型

2. **CopilotKit/CopilotKit** - 25,255⭐
   - React UI + AI Copilots基础设施

3. **activepieces/activepieces** - 19,367⭐
   - AI Agents & MCPs & AI工作流自动化

4. **trycua/cua** - 11,426⭐
   - 计算机使用代理的开源基础设施

5. **e2b-dev/E2B** - 10,062⭐
   - 企业级代理的安全环境

## 🎯 推荐的爬取策略

### 策略1: 分层抓取

```bash
# 第1天: 顶级项目 (>= 10,000 stars)
$env:GITHUB_MIN_STARS='10000'
$env:CRAWLER_MAX_AGENTS_PER_RUN='20'
npm run crawler:github

# 第2天: 高质量项目 (>= 1,000 stars)
$env:GITHUB_MIN_STARS='1000'
$env:CRAWLER_MAX_AGENTS_PER_RUN='50'
npm run crawler:github

# 第3天: 优质项目 (>= 500 stars)
$env:GITHUB_MIN_STARS='500'
$env:CRAWLER_MAX_AGENTS_PER_RUN='50'
npm run crawler:github

# 第4天: 新兴项目 (>= 100 stars)
$env:GITHUB_MIN_STARS='100'
$env:CRAWLER_MAX_AGENTS_PER_RUN='100'
npm run crawler:github
```

### 策略2: 多Topic轮换

```bash
# 周一: AI Agent
$env:GITHUB_TOPIC='ai-agent'
$env:GITHUB_MIN_STARS='100'
npm run crawler:github

# 周二: LLM
$env:GITHUB_TOPIC='llm'
$env:GITHUB_MIN_STARS='500'
npm run crawler:github

# 周三: ChatGPT
$env:GITHUB_TOPIC='chatgpt'
$env:GITHUB_MIN_STARS='200'
npm run crawler:github

# 周四: LangChain
$env:GITHUB_TOPIC='langchain'
$env:GITHUB_MIN_STARS='100'
npm run crawler:github

# 周五: 自主代理
$env:GITHUB_TOPIC='autonomous-agent'
$env:GITHUB_MIN_STARS='50'
npm run crawler:github
```

### 策略3: 增量更新

```bash
# 每日: 抓取新项目
$env:CRAWLER_MAX_AGENTS_PER_RUN='20'
$env:GITHUB_MIN_STARS='100'
npm run crawler:github

# 每周: 更新现有项目
# 爬虫会自动检测并更新已存在的项目
```

## 📈 预期结果

### 单次运行（10个agents）
- 耗时: ~30-60秒
- AI分析: 每个agent约3-5秒
- 数据质量: 100%完整

### 完整运行（50个agents）
- 耗时: ~3-5分钟
- 新增: 预计30-40个新agents
- 更新: 预计10-20个现有agents

## 🔍 验证数据质量

运行验证脚本：
```bash
node scripts/verify-crawler-data.js
```

检查内容：
- ✅ 必填字段完整性
- ✅ AI分析字段质量
- ✅ GitHub字段正确性
- ✅ 无重复数据
- ✅ 分类映射正确

## 📝 查看抓取结果

### 方式1: Supabase Dashboard
访问: https://supabase.com/dashboard
- 进入项目
- 打开Table Editor
- 查看`agents`表
- 按`last_crawled_at`排序

### 方式2: 本地查询
```bash
# 查看最新10个agents
node -e "
require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);
supabase.from('agents')
  .select('name, github_stars, github_url, last_crawled_at')
  .order('last_crawled_at', { ascending: false })
  .limit(10)
  .then(({ data }) => console.table(data));
"
```

### 方式3: 网站查看
```bash
npm run dev
# 访问 http://localhost:3000
```

## ⚠️ 注意事项

### GitHub API限制
- **认证用户**: 5,000请求/小时
- **搜索API**: 30请求/分钟
- 爬虫已内置速率限制保护

### OpenRouter限制
- 根据你的套餐而定
- 建议使用qwen模型（性价比高）
- 爬虫已内置1秒延迟

### 数据去重
- 通过`source_id`（GitHub URL）检测重复
- 通过`slug`检测重复
- 自动更新而非重复插入

## 🐛 故障排除

### 问题1: "OPENAI_API_KEY not set"
**解决**: 确保`.env`文件存在且包含正确的API key

### 问题2: "GITHUB_TOKEN not set"
**解决**: 在`.env`中添加GitHub Token

### 问题3: 没有找到新数据
**原因**: 可能都是已存在的项目
**解决**: 
- 降低`GITHUB_MIN_STARS`阈值
- 更换`GITHUB_TOPIC`
- 查看日志中的"Updated"数量

### 问题4: AI分析失败
**原因**: OpenRouter API问题
**解决**:
- 检查API key是否有效
- 检查账户余额
- 查看错误日志

## 📚 相关文档

- `docs/crawler-test-report.md` - 测试报告
- `docs/crawler-verification-summary.md` - 核查总结
- `docs/github-crawler-real-test-result.md` - GitHub API测试结果
- `docs/github-crawler-implementation.md` - 实现文档

## 🎉 开始使用

现在你可以开始抓取真实的GitHub数据了！

```bash
# 快速开始
npm run crawler:github
```

祝你抓取愉快！🚀
