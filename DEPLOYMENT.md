# 部署指南

## 快速部署（15 分钟上线）

### 1. Supabase 设置（5 分钟）

1. 访问 [supabase.com](https://supabase.com) 并创建账号
2. 创建新项目
3. 进入 SQL Editor，执行以下文件：
   - `supabase/schema.sql`（创建表结构）
   - `supabase/seed.sql`（初始化分类数据）
4. 进入 Settings > API，复制：
   - `Project URL`
   - `anon public` key
   - `service_role` key（保密！）

### 2. OpenAI API（2 分钟）

1. 访问 [platform.openai.com](https://platform.openai.com)
2. 创建 API Key
3. 确保账户有余额（建议充值 $10）

### 3. 本地开发（3 分钟）

```bash
# 克隆项目
cd shopo-alpha-mvp

# 安装依赖
npm install

# 配置环境变量
cp .env.example .env.local

# 编辑 .env.local，填入：
# - Supabase URL 和 Keys
# - OpenAI API Key

# 运行开发服务器
npm run dev
```

访问 http://localhost:3000

### 4. 运行爬虫（5 分钟）

```bash
# 首次运行，会爬取并分析 Agents
npm run crawler

# 等待完成（约 5-10 分钟，取决于 Agent 数量）
```

### 5. 部署到 Vercel（5 分钟）

```bash
# 安装 Vercel CLI
npm i -g vercel

# 登录
vercel login

# 部署
vercel

# 添加环境变量（在 Vercel Dashboard）
# - NEXT_PUBLIC_SUPABASE_URL
# - NEXT_PUBLIC_SUPABASE_ANON_KEY
# - SUPABASE_SERVICE_ROLE_KEY
# - OPENAI_API_KEY

# 生产部署
vercel --prod
```

## 定时爬虫设置

### 方案 1：Vercel Cron Jobs（推荐）

创建 `vercel.json`：

```json
{
  "crons": [{
    "path": "/api/cron/crawler",
    "schedule": "0 0 * * *"
  }]
}
```

创建 `app/api/cron/crawler/route.ts`：

```typescript
import { NextResponse } from 'next/server'
import { crawlGPTStore } from '@/crawler/sources/gpt-store'
import { batchEnrichAgents } from '@/crawler/enricher'

export async function GET(request: Request) {
  // 验证 Cron Secret
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new NextResponse('Unauthorized', { status: 401 })
  }

  try {
    const rawAgents = await crawlGPTStore(50)
    await batchEnrichAgents(rawAgents)
    
    return NextResponse.json({ success: true, count: rawAgents.length })
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
```

### 方案 2：GitHub Actions

创建 `.github/workflows/crawler.yml`：

```yaml
name: Daily Crawler

on:
  schedule:
    - cron: '0 0 * * *'  # 每天 UTC 0:00
  workflow_dispatch:  # 手动触发

jobs:
  crawl:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm install
      - run: npm run crawler
        env:
          NEXT_PUBLIC_SUPABASE_URL: ${{ secrets.SUPABASE_URL }}
          SUPABASE_SERVICE_ROLE_KEY: ${{ secrets.SUPABASE_KEY }}
          OPENAI_API_KEY: ${{ secrets.OPENAI_KEY }}
```

## 性能优化

### 1. 启用 ISR（增量静态再生成）

已在页面中设置 `revalidate = 3600`（每小时更新）

### 2. 添加 CDN 缓存

Vercel 自动提供全球 CDN

### 3. 数据库索引

已在 `schema.sql` 中创建必要索引

## 监控和维护

### 1. 监控爬虫状态

```bash
# 查看最近爬取的 Agents
SELECT name, last_crawled_at 
FROM agents 
ORDER BY last_crawled_at DESC 
LIMIT 10;
```

### 2. 监控 API 使用

- Supabase Dashboard > Database > Usage
- OpenAI Dashboard > Usage

### 3. 错误日志

- Vercel Dashboard > Logs
- Supabase Dashboard > Logs

## 成本估算

### 免费额度（足够 MVP）

- **Vercel**: 免费（100GB 带宽/月）
- **Supabase**: 免费（500MB 数据库，50K 月活用户）
- **OpenAI**: 按使用付费
  - GPT-4 Turbo: $0.01/1K tokens
  - 分析 50 个 Agents ≈ $0.50
  - 每天爬取 50 个 ≈ $15/月

### 预计成本（1000 UV/天）

- Vercel: $0（免费额度内）
- Supabase: $0（免费额度内）
- OpenAI: $15-30/月
- **总计: ~$20/月**

## 扩展建议

### 短期（1 个月内）

- [ ] 添加更多爬虫源（Poe, Hugging Face）
- [ ] 实现用户认证和收藏功能
- [ ] 生成对比页面
- [ ] 添加搜索功能

### 中期（3 个月内）

- [ ] Agent 试用功能
- [ ] 用户评论和评分
- [ ] API 服务
- [ ] 付费功能

### 长期（6 个月+）

- [ ] Agent 市场
- [ ] 工作流编排
- [ ] 企业版
- [ ] 移动应用

## 故障排查

### 爬虫失败

1. 检查网络连接
2. 检查目标网站是否更改结构
3. 使用种子数据：`getGPTStoreSeedData()`

### 数据库连接失败

1. 检查 Supabase URL 和 Key
2. 检查 RLS 策略
3. 查看 Supabase Dashboard > Logs

### OpenAI API 错误

1. 检查 API Key
2. 检查账户余额
3. 检查速率限制

## 支持

如有问题，请查看：
- [Next.js 文档](https://nextjs.org/docs)
- [Supabase 文档](https://supabase.com/docs)
- [OpenAI 文档](https://platform.openai.com/docs)
