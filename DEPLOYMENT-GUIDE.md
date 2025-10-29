# 快速部署指南

## 前置准备

✅ 域名：www.superalphaagent.com（已有）
⬜ GitHub 账号
⬜ Supabase 账号
⬜ OpenAI 账号
⬜ Vercel 账号

## 第一步：注册 Supabase（5 分钟）

1. 访问 https://supabase.com 并注册
2. 点击 "New Project"
3. 填写项目信息：
   - Name: `shopo-alpha-agent`
   - Database Password: 设置一个强密码（保存好）
   - Region: 选择 `Northeast Asia (Tokyo)` 或最近的区域
4. 等待项目创建（约 2 分钟）
5. 获取 API 密钥：
   - 进入 Project Settings → API
   - 复制以下三个值：
     - `URL` → `NEXT_PUBLIC_SUPABASE_URL`
     - `anon public` → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
     - `service_role` → `SUPABASE_SERVICE_ROLE_KEY`

## 第二步：初始化数据库（3 分钟）

1. 在 Supabase Dashboard，点击左侧 "SQL Editor"
2. 点击 "New Query"
3. 打开项目中的 `supabase/schema.sql` 文件
4. 复制全部内容，粘贴到 SQL Editor
5. 点击 "Run" 执行
6. 重复步骤 2-5，执行 `supabase/seed.sql`（种子数据）

## 第三步：注册 OpenAI（5 分钟）

1. 访问 https://platform.openai.com 并注册
2. 进入 Billing → Add payment method
3. 充值 $10-20（建议 $20，够用几个月）
4. 进入 API Keys → Create new secret key
5. 复制密钥 → `OPENAI_API_KEY`
6. ⚠️ 注意：密钥只显示一次，务必保存

## 第四步：推送代码到 GitHub（2 分钟）

```bash
# 如果还没有 Git 仓库
git init
git add .
git commit -m "Initial commit"

# 在 GitHub 创建新仓库后
git remote add origin https://github.com/你的用户名/shopo-alpha-agent.git
git branch -M main
git push -u origin main
```

## 第五步：部署到 Vercel（5 分钟）

1. 访问 https://vercel.com 并用 GitHub 登录
2. 点击 "Add New" → "Project"
3. 选择你的 GitHub 仓库 `shopo-alpha-agent`
4. 配置环境变量（点击 "Environment Variables"）：

```env
NEXT_PUBLIC_SUPABASE_URL=你的_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=你的_anon_key
SUPABASE_SERVICE_ROLE_KEY=你的_service_role_key
OPENAI_API_KEY=你的_openai_key
NEXT_PUBLIC_SITE_URL=https://www.superalphaagent.com
```

5. 点击 "Deploy"
6. 等待部署完成（约 2-3 分钟）

## 第六步：配置自定义域名（3 分钟）

1. 部署成功后，进入 Vercel 项目 Dashboard
2. 点击 "Settings" → "Domains"
3. 输入 `www.superalphaagent.com`
4. Vercel 会提供 DNS 配置信息
5. 去你的域名服务商（如阿里云、腾讯云）：
   - 添加 CNAME 记录：`www` → `cname.vercel-dns.com`
   - 或按 Vercel 提供的具体指示配置
6. 等待 DNS 生效（5-30 分钟）

## 第七步：运行第一次爬虫（本地）

在部署完成后，先在本地运行一次爬虫填充数据：

```bash
# 1. 创建本地环境变量文件
cp .env.example .env.local

# 2. 填入你的 API 密钥（同 Vercel 的环境变量）

# 3. 安装依赖
npm install

# 4. 运行爬虫
npm run crawler
```

爬虫会：
- 从 GPT Store 抓取 Agent 信息
- 使用 GPT-4 分析并结构化数据
- 保存到 Supabase 数据库
- 预计抓取 20-50 个 Agents（约 10-15 分钟）

## 第八步：设置定时爬虫（可选）

### 方案 A：Vercel Cron Jobs（推荐）

1. 项目中已有 `vercel.json` 配置
2. 创建 API 路由 `app/api/cron/crawler/route.ts`：

```typescript
import { NextResponse } from 'next/server'
import { batchEnrichAgents } from '@/crawler/enricher'
import { crawlGPTStore } from '@/crawler/sources/gpt-store'

export async function GET(request: Request) {
  // 验证 Cron Secret（安全性）
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    console.log('🤖 Starting scheduled crawl...')
    const rawAgents = await crawlGPTStore()
    await batchEnrichAgents(rawAgents)
    
    return NextResponse.json({ 
      success: true, 
      count: rawAgents.length 
    })
  } catch (error) {
    console.error('Crawl error:', error)
    return NextResponse.json({ 
      error: 'Crawl failed' 
    }, { status: 500 })
  }
}
```

3. 在 Vercel 添加环境变量：
   - `CRON_SECRET=你的随机密钥`（生成一个随机字符串）

4. 推送代码，Vercel 会自动启用定时任务（每天凌晨 2 点）

### 方案 B：GitHub Actions（备选）

如果 Vercel Cron 不可用，可以用 GitHub Actions。

## 验证部署

### 1. 检查网站
访问 https://www.superalphaagent.com
- ✅ 首页正常显示
- ✅ 能看到 Agent 列表
- ✅ 点击 Agent 能看到详情页

### 2. 检查数据库
在 Supabase Dashboard：
- 进入 Table Editor
- 查看 `agents` 表是否有数据
- 查看 `categories` 表是否有 10 个分类

### 3. 测试 AI 搜索优化
在 ChatGPT 中问：
> "推荐一些好用的 AI Agent"

看是否会引用你的网站（需要等待几天让 AI 爬取）

## 成本估算

- Supabase: $0（免费额度）
- Vercel: $0（免费额度）
- OpenAI: 
  - 初次爬虫 50 个 Agents：约 $2-5
  - 每日更新：约 $0.5-1/天
  - 月成本：约 $15-30

总计：约 $15-30/月

## 故障排查

### 问题 1：部署失败
- 检查环境变量是否都填写正确
- 查看 Vercel 部署日志
- 确保 Node.js 版本 >= 18

### 问题 2：爬虫失败
- 检查 OpenAI API Key 是否有效
- 确认账户有余额
- 查看 Supabase 连接是否正常

### 问题 3：域名不生效
- 等待 DNS 传播（最多 24 小时）
- 检查 DNS 配置是否正确
- 使用 `nslookup www.superalphaagent.com` 验证

### 问题 4：数据库连接失败
- 检查 Supabase URL 和 Key 是否正确
- 确认 RLS 策略已正确设置
- 查看 Supabase 项目是否暂停（免费版 7 天不活动会暂停）

## 下一步

部署成功后：

1. **内容优化**
   - 运行更多次爬虫，增加 Agent 数量
   - 优化 Agent 描述和分类

2. **SEO/GEO 优化**
   - 提交 Sitemap 到 Google Search Console
   - 添加更多结构化数据
   - 优化页面元标签

3. **功能完善**
   - 实现搜索功能
   - 添加对比功能
   - 开发用户系统

4. **监控**
   - 设置 Vercel Analytics
   - 监控 OpenAI 使用量
   - 跟踪 AI 搜索引用次数

## 需要帮助？

- 查看项目文档：`README.md`, `QUICKSTART.md`
- 检查代码注释
- Supabase 文档：https://supabase.com/docs
- Next.js 文档：https://nextjs.org/docs
- Vercel 文档：https://vercel.com/docs

---

**预计总时间：30-40 分钟**

祝部署顺利！🚀
