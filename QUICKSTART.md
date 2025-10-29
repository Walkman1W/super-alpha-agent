# 🚀 快速启动指南

## 5 分钟快速上手

### 前置要求

- Node.js 18+
- npm 或 yarn
- Supabase 账号（免费）
- OpenAI API Key

### 步骤 1: 克隆并安装

```bash
npm install
```

### 步骤 2: 配置 Supabase

1. 访问 [supabase.com](https://supabase.com)，创建新项目
2. 进入 SQL Editor，依次执行：
   - 复制 `supabase/schema.sql` 的内容并执行
   - 复制 `supabase/seed.sql` 的内容并执行
3. 进入 Settings > API，复制：
   - Project URL
   - anon public key
   - service_role key

### 步骤 3: 配置环境变量

```bash
cp .env.example .env.local
```

编辑 `.env.local`：

```env
NEXT_PUBLIC_SUPABASE_URL=你的_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=你的_anon_key
SUPABASE_SERVICE_ROLE_KEY=你的_service_role_key
OPENAI_API_KEY=你的_openai_key
```

### 步骤 4: 运行开发服务器

```bash
npm run dev
```

访问 http://localhost:3000

### 步骤 5: 运行爬虫（可选）

```bash
npm run crawler
```

等待 5-10 分钟，爬虫会自动：
1. 爬取 GPT Store 的 Agent 信息
2. 使用 GPT-4 分析并结构化
3. 保存到 Supabase 数据库

## 常见问题

### Q: 爬虫失败怎么办？

A: 爬虫可能因为网络或网站结构变化失败。可以使用种子数据：

```typescript
// 在 crawler/run.ts 中
import { getGPTStoreSeedData } from './sources/gpt-store'
const rawAgents = getGPTStoreSeedData()
```

### Q: OpenAI API 太贵？

A: 可以：
1. 减少每次爬取的数量（修改 `CRAWLER_MAX_AGENTS_PER_RUN`）
2. 使用 GPT-3.5 代替 GPT-4（修改 `lib/openai.ts` 中的 model）
3. 缓存分析结果，避免重复分析

### Q: 如何添加更多 Agent？

A: 三种方式：
1. 运行爬虫：`npm run crawler`
2. 手动添加：在 Supabase Dashboard 的 Table Editor 中添加
3. 用户提交：实现用户提交功能后，用户可以提交

### Q: 如何部署到生产环境？

A: 查看 `DEPLOYMENT.md` 获取详细步骤。简单来说：

```bash
npm i -g vercel
vercel login
vercel
```

## 下一步

- [ ] 阅读 `MVP-PLAN.md` 了解完整计划
- [ ] 阅读 `DEPLOYMENT.md` 了解部署流程
- [ ] 自定义 UI 和样式
- [ ] 添加更多爬虫源
- [ ] 实现对比功能
- [ ] 添加用户认证

## 需要帮助？

- 查看 `README.md` 获取项目概览
- 查看 `MVP-PLAN.md` 了解开发计划
- 查看 `DEPLOYMENT.md` 了解部署指南

祝你成功！🎉
