# 爬虫 V2 使用指南

## 🚀 新特性

### 1. ✅ 数据库去重
搜索前自动检查数据库，过滤已存在的agents，避免重复处理。

### 2. ⚡ 并行处理
使用队列系统并行处理多个agents，大幅提升效率。

### 3. 💾 实时存储
处理完一个立即存储到Supabase，前端可实时看到数据更新。

### 4. 🎯 多Topic支持
可配置多个topic同时抓取，自动轮换。

### 5. 🛡️ 容错机制
中断后已处理的数据不丢失，可随时继续。

### 6. ⏰ 定时任务
支持Vercel Cron自动定时抓取。

## 📋 快速开始

### 基础使用

```bash
# 使用V2爬虫（推荐）
npm run crawler:v2

# 测试模式（5个agents）
npm run crawler:test

# 每日任务（高质量项目）
npm run crawler:daily

# 每周任务（全量抓取）
npm run crawler:weekly
```

### 环境变量配置

在`.env`文件中配置：

```env
# 基础配置
CRAWLER_TOPICS=ai-agent,llm,chatgpt          # 多个topic用逗号分隔
GITHUB_MIN_STARS=100                          # 最小星标数
CRAWLER_MAX_AGENTS_PER_RUN=50                # 每个topic最多抓取数量

# 性能配置
CRAWLER_CONCURRENCY=3                         # 并发处理数量（推荐2-5）
CRAWLER_BATCH_DELAY=2000                     # Topic间延迟(ms)

# 定时任务安全
CRON_SECRET=your-random-secret-here          # Cron端点密钥
```

## 🎯 使用场景

### 场景1: 快速测试

```bash
# 测试5个agents
npm run crawler:test
```

**配置**:
- Topic: ai-agent
- 最小Stars: 100
- 数量: 5
- 并发: 2

**预期时间**: ~30秒

### 场景2: 每日更新

```bash
# 每日抓取高质量项目
npm run crawler:daily
```

**配置**:
- Topics: ai-agent, llm
- 最小Stars: 500
- 每Topic: 20个
- 并发: 3

**预期时间**: ~3-5分钟
**预期结果**: 20-40个新agents

### 场景3: 每周全量

```bash
# 每周全量抓取
npm run crawler:weekly
```

**配置**:
- Topics: ai-agent, llm, chatgpt, langchain, autonomous-agent
- 最小Stars: 100
- 每Topic: 50个
- 并发: 5

**预期时间**: ~10-15分钟
**预期结果**: 100-250个新agents

### 场景4: 自定义配置

```bash
# 自定义多topic
$env:CRAWLER_TOPICS='ai-agent,llm,gpt'
$env:GITHUB_MIN_STARS='200'
$env:CRAWLER_MAX_AGENTS_PER_RUN='30'
$env:CRAWLER_CONCURRENCY='4'
npm run crawler:v2
```

## 📊 性能对比

| 版本 | 处理方式 | 10个agents耗时 | 50个agents耗时 | 去重 | 实时存储 |
|------|----------|----------------|----------------|------|----------|
| V1 | 串行 | ~60秒 | ~5分钟 | ❌ | ❌ |
| V2 | 并行(3) | ~30秒 | ~2.5分钟 | ✅ | ✅ |
| V2 | 并行(5) | ~25秒 | ~2分钟 | ✅ | ✅ |

**效率提升**: 50-60%

## 🔄 工作流程

```
1. 读取配置
   ├─ Topics列表
   ├─ 星标阈值
   └─ 并发数量

2. 数据库去重
   ├─ 查询已存在的GitHub URLs
   └─ 构建去重集合

3. 搜索GitHub
   ├─ 遍历每个Topic
   ├─ 调用GitHub API
   └─ 过滤已存在的

4. 并行处理队列
   ├─ 启动N个并发worker
   ├─ 每个worker处理一个agent
   │   ├─ AI分析
   │   ├─ 数据清理
   │   └─ 立即存储到Supabase
   └─ 实时显示进度

5. 统计报告
   ├─ 搜索到的数量
   ├─ 创建/更新数量
   └─ 成功率
```

## ⏰ 定时任务设置

### Vercel Cron（推荐）

已在`vercel.json`中配置：

```json
{
  "crons": [
    {
      "path": "/api/cron/crawler?schedule=daily_premium",
      "schedule": "0 2 * * *"
    },
    {
      "path": "/api/cron/crawler?schedule=weekly_full",
      "schedule": "0 3 * * 0"
    }
  ]
}
```

**调度说明**:
- `daily_premium`: 每天凌晨2点，抓取高质量项目
- `weekly_full`: 每周日凌晨3点，全量抓取

### 手动触发Cron

```bash
# 本地测试
curl http://localhost:3000/api/cron/crawler?schedule=test \
  -H "Authorization: Bearer your-cron-secret"

# 生产环境
curl https://agentsignals.ai/api/cron/crawler?schedule=daily_premium \
  -H "Authorization: Bearer your-cron-secret"
```

### GitHub Actions（备选）

创建`.github/workflows/crawler.yml`:

```yaml
name: Daily Crawler

on:
  schedule:
    - cron: '0 2 * * *'  # 每天凌晨2点
  workflow_dispatch:      # 手动触发

jobs:
  crawl:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm install
      - run: npm run crawler:daily
        env:
          NEXT_PUBLIC_SUPABASE_URL: ${{ secrets.SUPABASE_URL }}
          SUPABASE_SERVICE_ROLE_KEY: ${{ secrets.SUPABASE_KEY }}
          OPENAI_API_KEY: ${{ secrets.OPENAI_KEY }}
          GITHUB_TOKEN: ${{ secrets.GH_TOKEN }}
```

## 📈 监控与日志

### 实时进度

爬虫运行时会显示：

```
🚀 开始并行处理 (并发数: 3)
   队列长度: 25

[1/25] 📝 处理: chatgpt-on-wechat
   ✅ 已创建

[2/25] 📝 处理: CopilotKit
   ✅ 已创建

📊 实时进度: 2/25 (8.0%)
   ✅ 创建: 2
   🔄 更新: 0
   ❌ 失败: 0
```

### 最终统计

```
🎉 爬虫完成！
============================================================
📊 统计信息:
   搜索到: 30
   队列中: 25
   已处理: 25
   ✅ 创建: 20
   🔄 更新: 5
   ❌ 失败: 0
   成功率: 100.0%
============================================================
```

### 查看数据库

```bash
# 验证新数据
node scripts/verify-crawler-data.js

# 或直接查询
node -e "
require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);
supabase.from('agents')
  .select('name, github_stars, created_at')
  .order('created_at', { ascending: false })
  .limit(10)
  .then(({ data }) => console.table(data));
"
```

## 🎛️ 高级配置

### 调整并发数

```bash
# 低配置服务器（1-2核）
$env:CRAWLER_CONCURRENCY='2'

# 中等配置（4核）
$env:CRAWLER_CONCURRENCY='3'

# 高配置（8核+）
$env:CRAWLER_CONCURRENCY='5'
```

**注意**: 并发数过高可能触发API限流。

### 自定义调度策略

编辑`crawler/scheduler.ts`添加新策略：

```typescript
const SCHEDULES: Record<string, ScheduleConfig> = {
  // 添加自定义策略
  my_custom: {
    name: '我的自定义策略',
    topics: ['ai-agent', 'custom-topic'],
    minStars: 300,
    maxAgentsPerTopic: 40,
    concurrency: 4,
    cron: '0 4 * * *'  // 每天凌晨4点
  }
}
```

使用：
```bash
npm run crawler:v2
# 或
tsx crawler/scheduler.ts my_custom
```

## 🐛 故障排除

### 问题1: 并发过高导致超时

**症状**: 部分agents处理失败
**解决**: 降低并发数
```bash
$env:CRAWLER_CONCURRENCY='2'
```

### 问题2: API限流

**症状**: GitHub API返回403
**解决**: 增加批次延迟
```bash
$env:CRAWLER_BATCH_DELAY='5000'  # 5秒
```

### 问题3: 内存不足

**症状**: 进程崩溃
**解决**: 减少每次抓取数量
```bash
$env:CRAWLER_MAX_AGENTS_PER_RUN='20'
```

### 问题4: 数据库连接超时

**症状**: Supabase连接失败
**解决**: 检查环境变量和网络
```bash
node -e "require('dotenv').config(); console.log(process.env.NEXT_PUBLIC_SUPABASE_URL)"
```

## 📚 相关文档

- `docs/crawler-success-report.md` - V1成功报告
- `docs/CRAWLER-USAGE-GUIDE.md` - V1使用指南
- `docs/github-crawler-implementation.md` - 实现细节

## 🎯 最佳实践

### 1. 分层抓取策略

```bash
# 第1天: 顶级项目
$env:GITHUB_MIN_STARS='10000'
npm run crawler:v2

# 第2天: 高质量
$env:GITHUB_MIN_STARS='1000'
npm run crawler:v2

# 第3天: 优质
$env:GITHUB_MIN_STARS='500'
npm run crawler:v2

# 第4天: 新兴
$env:GITHUB_MIN_STARS='100'
npm run crawler:v2
```

### 2. Topic轮换

```bash
# 周一: AI Agent
$env:CRAWLER_TOPICS='ai-agent'
npm run crawler:v2

# 周二: LLM
$env:CRAWLER_TOPICS='llm'
npm run crawler:v2

# 周三: ChatGPT
$env:CRAWLER_TOPICS='chatgpt'
npm run crawler:v2
```

### 3. 增量更新

```bash
# 每日小批量
$env:CRAWLER_MAX_AGENTS_PER_RUN='20'
npm run crawler:daily

# 每周大批量
npm run crawler:weekly
```

## 🚀 生产部署

### 1. 设置环境变量

在Vercel Dashboard中配置：
- `CRON_SECRET`
- `GITHUB_TOKEN`
- `OPENAI_API_KEY`
- 其他必需变量

### 2. 部署

```bash
npm run deploy
```

### 3. 验证Cron

访问Vercel Dashboard > Cron Jobs，确认任务已创建。

### 4. 监控

- 查看Vercel Logs
- 检查Supabase数据增长
- 设置告警（可选）

---

**V2爬虫已就绪，开始高效抓取！** 🎉
