# 🤖 爬虫运行策略

## 问题说明

Vercel 的 Serverless Functions 有限制：
- 执行时间限制：10 秒（免费）/ 60 秒（Pro）
- 不适合运行长时间的爬虫任务

## ✅ 推荐方案

### 方案 A：本地手动运行（最简单）

每次想更新数据时，在本地运行：

```bash
npm run crawler
```

**优点**：
- 完全免费
- 可以看到实时进度
- 可以随时运行
- 数据立即同步到 Supabase

**缺点**：
- 需要手动运行

---

### 方案 B：GitHub Actions（推荐）

完全免费，每月 2000 分钟额度。

#### 步骤 1：创建 workflow 文件

创建 `.github/workflows/crawler.yml`：

```yaml
name: Daily Crawler

on:
  schedule:
    - cron: '0 2 * * *'  # 每天凌晨 2 点
  workflow_dispatch:  # 允许手动触发

jobs:
  crawl:
    runs-on: ubuntu-latest
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '20'
      
      - name: Install dependencies
        run: npm install
      
      - name: Run crawler
        run: npm run crawler
        env:
          NEXT_PUBLIC_SUPABASE_URL: ${{ secrets.SUPABASE_URL }}
          SUPABASE_SERVICE_ROLE_KEY: ${{ secrets.SUPABASE_SERVICE_KEY }}
          OPENAI_API_KEY: ${{ secrets.OPENAI_API_KEY }}
          OPENAI_BASE_URL: https://openrouter.ai/api/v1
          OPENAI_MODEL: qwen/qwen-2.5-72b-instruct
```

#### 步骤 2：配置 GitHub Secrets

1. 访问：https://github.com/Walkman1W/super-alpha-agent/settings/secrets/actions
2. 点击 **New repository secret**
3. 添加以下 secrets：

```
SUPABASE_URL = https://tcrfxjdtxjcmbtplixcb.supabase.co
SUPABASE_SERVICE_KEY = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
OPENAI_API_KEY = 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
```

#### 步骤 3：手动触发测试

1. 访问：https://github.com/Walkman1W/super-alpha-agent/actions
2. 选择 "Daily Crawler"
3. 点击 "Run workflow"

**优点**：
- 完全自动化
- 免费（每月 2000 分钟）
- 可以手动触发
- 可以看到运行日志

**缺点**：
- 需要配置 GitHub Actions

---

### 方案 C：Vercel Cron（当前方案）

**当前状态**：
- Cron 端点已创建：`/api/cron/crawler`
- 但不执行实际爬虫（因为 Serverless 限制）
- 只是一个占位符

**如果要使用**：
需要将爬虫逻辑改为：
1. 触发外部服务（如 GitHub Actions）
2. 或使用 Vercel Pro（$20/月）

---

## 📋 当前推荐流程

### 初次部署（现在）

1. **在本地运行爬虫**：
```bash
npm run crawler
```

2. **验证数据**：
- 访问 Supabase Dashboard
- 检查 agents 表有 10 行数据

3. **访问网站**：
- https://super-alpha-agent-xxx.vercel.app
- 应该看到 10 个 Agent 卡片

### 日常更新

**选项 1：手动运行（最简单）**
```bash
npm run crawler
```

**选项 2：设置 GitHub Actions（一次配置，永久自动）**
- 按照上面的步骤配置
- 每天自动运行

---

## 🎯 建议

对于 MVP 阶段：
1. **现在**：手动运行爬虫（5 分钟）
2. **本周**：设置 GitHub Actions（15 分钟）
3. **未来**：有收入后考虑 Vercel Pro

---

## ✅ 下一步

现在让我们先手动运行爬虫，让网站有数据：

```bash
# 1. 初始化分类
npm run db:init

# 2. 运行爬虫
npm run crawler
```

完成后，你的网站就有数据了！🚀
