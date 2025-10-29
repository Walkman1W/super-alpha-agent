# 🚀 完整部署流程

域名：**www.superalphaagent.com**

## 📋 部署检查清单

### ✅ 前置准备（已完成）
- [x] 前端页面设计完成
- [x] OpenRouter API 配置完成
- [x] 爬虫脚本准备完成
- [x] 域名已购买：www.superalphaagent.com

### 🔄 待完成步骤
- [ ] 1. 本地数据库初始化
- [ ] 2. 本地测试验证
- [ ] 3. 推送代码到 GitHub
- [ ] 4. 部署到 Vercel
- [ ] 5. 配置域名
- [ ] 6. 设置定时爬虫
- [ ] 7. 验证生产环境

---

## 第一阶段：本地环境设置（15 分钟）

### 步骤 1.1: 初始化 Supabase 数据库

1. 访问 https://supabase.com/dashboard
2. 选择项目：`shopo-alpha-agent`
3. 点击左侧 **SQL Editor**
4. 点击 **New Query**
5. 打开项目中的 `supabase/schema.sql`
6. 复制全部内容，粘贴到 SQL Editor
7. 点击 **Run** 执行

**验证**：在 Table Editor 中应该看到 `categories` 和 `agents` 表

### 步骤 1.2: 初始化分类数据

```bash
node scripts/init-categories.js
```

**预期输出**：
```
✅ Created: 开发工具
✅ Created: 内容创作
✅ Created: 数据分析
...
✨ Categories initialized!
   ✅ Success: 10
```

**验证**：在 Supabase Table Editor → categories 表应该有 10 行数据

### 步骤 1.3: 运行爬虫获取数据

```bash
npm run crawler
```

**预期输出**：
```
📝 Analyzing: Code Reviewer Pro
✅ Created: Code Reviewer Pro
...
✨ Crawler completed!
   ✅ Success: 10
```

**验证**：在 Supabase Table Editor → agents 表应该有 10 行数据

### 步骤 1.4: 本地测试

```bash
npm run dev
```

访问 http://localhost:3000

**验证清单**：
- [ ] Hero 区域显示正常（渐变背景）
- [ ] 统计数字显示 "10+"
- [ ] 分类卡片显示 10 个
- [ ] Agent 卡片显示 10 个
- [ ] 每个 Agent 卡片包含完整信息
- [ ] FAQ 区域显示正常
- [ ] 页面响应式正常（调整浏览器窗口）

---

## 第二阶段：代码推送到 GitHub（5 分钟）

### 步骤 2.1: 创建 .gitignore

确保 `.gitignore` 包含：

```
# dependencies
node_modules/
.pnp
.pnp.js

# testing
coverage/

# next.js
.next/
out/
build/
dist/

# misc
.DS_Store
*.pem

# debug
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# local env files
.env
.env*.local

# vercel
.vercel

# typescript
*.tsbuildinfo
next-env.d.ts
```

### 步骤 2.2: 初始化 Git 仓库

```bash
# 如果还没有初始化
git init

# 添加所有文件
git add .

# 提交
git commit -m "Initial commit: Super Alpha Agent platform"
```

### 步骤 2.3: 推送到 GitHub

1. 在 GitHub 创建新仓库：`super-alpha-agent`
2. 不要初始化 README、.gitignore 或 license

```bash
# 添加远程仓库
git remote add origin https://github.com/你的用户名/super-alpha-agent.git

# 推送代码
git branch -M main
git push -u origin main
```

---

## 第三阶段：部署到 Vercel（10 分钟）

### 步骤 3.1: 连接 GitHub 仓库

1. 访问 https://vercel.com
2. 用 GitHub 账号登录
3. 点击 **Add New** → **Project**
4. 选择 `super-alpha-agent` 仓库
5. 点击 **Import**

### 步骤 3.2: 配置环境变量

在 Vercel 项目设置中，添加以下环境变量：

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://tcrfxjdtxjcmbtplixcb.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=你的_anon_key
SUPABASE_SERVICE_ROLE_KEY=你的_service_role_key

# OpenRouter
OPENAI_API_KEY=sk-or-v1-你的_openrouter_key
OPENAI_BASE_URL=https://openrouter.ai/api/v1
OPENAI_MODEL=qwen/qwen-2.5-72b-instruct

# Site
NEXT_PUBLIC_SITE_URL=https://www.superalphaagent.com
NEXT_PUBLIC_SITE_NAME=Super Alpha Agent

# Crawler
CRAWLER_MAX_AGENTS_PER_RUN=50

# Cron Security
CRON_SECRET=生成一个随机字符串（20+字符）
```

**生成 CRON_SECRET**：
```bash
# 在终端运行
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 步骤 3.3: 部署

1. 点击 **Deploy**
2. 等待构建完成（约 2-3 分钟）
3. 部署成功后会得到一个 URL：`https://super-alpha-agent-xxx.vercel.app`

**验证**：访问 Vercel 提供的 URL，确认网站正常运行

---

## 第四阶段：配置自定义域名（10 分钟）

### 步骤 4.1: 在 Vercel 添加域名

1. 进入 Vercel 项目 Dashboard
2. 点击 **Settings** → **Domains**
3. 输入 `www.superalphaagent.com`
4. 点击 **Add**

### 步骤 4.2: 配置 DNS

Vercel 会提供 DNS 配置信息，通常是：

**方案 A：CNAME 记录（推荐）**
```
类型: CNAME
名称: www
值: cname.vercel-dns.com
```

**方案 B：A 记录**
```
类型: A
名称: www
值: 76.76.21.21
```

### 步骤 4.3: 在域名服务商配置

去你的域名服务商（如阿里云、腾讯云、GoDaddy）：

1. 进入 DNS 管理
2. 添加 CNAME 记录：
   - 主机记录：`www`
   - 记录类型：`CNAME`
   - 记录值：`cname.vercel-dns.com`
   - TTL：`600`（10分钟）
3. 保存

### 步骤 4.4: 等待 DNS 生效

- 通常需要 5-30 分钟
- 最多可能需要 24 小时

**验证 DNS**：
```bash
# Windows
nslookup www.superalphaagent.com

# Mac/Linux
dig www.superalphaagent.com
```

### 步骤 4.5: 配置根域名（可选）

如果你也想让 `superalphaagent.com`（不带 www）访问：

1. 在 Vercel Domains 添加 `superalphaagent.com`
2. 在 DNS 添加 A 记录：
   - 主机记录：`@`
   - 记录类型：`A`
   - 记录值：`76.76.21.21`

---

## 第五阶段：设置定时爬虫（5 分钟）

### 步骤 5.1: 验证 Cron 配置

确认 `vercel.json` 内容：

```json
{
  "crons": [
    {
      "path": "/api/cron/crawler",
      "schedule": "0 */6 * * *"
    }
  ]
}
```

这表示每 6 小时运行一次爬虫。

### 步骤 5.2: 测试 Cron API

```bash
# 使用你的 CRON_SECRET
curl -X GET https://www.superalphaagent.com/api/cron/crawler \
  -H "Authorization: Bearer 你的_CRON_SECRET"
```

**预期响应**：
```json
{
  "success": true,
  "count": 10,
  "timestamp": "2025-01-28T..."
}
```

### 步骤 5.3: 查看 Cron 日志

1. 在 Vercel Dashboard
2. 点击 **Deployments** → 最新部署
3. 点击 **Functions**
4. 查看 `/api/cron/crawler` 的执行日志

---

## 第六阶段：验证生产环境（10 分钟）

### 步骤 6.1: 功能测试

访问 https://www.superalphaagent.com

**测试清单**：
- [ ] 页面加载速度正常（< 3秒）
- [ ] Hero 区域显示正常
- [ ] 统计数字正确
- [ ] 分类卡片显示
- [ ] Agent 卡片显示
- [ ] 所有链接可点击
- [ ] 响应式布局正常
- [ ] 移动端显示正常

### 步骤 6.2: SEO 验证

使用工具检查：
- Google PageSpeed Insights: https://pagespeed.web.dev/
- Meta Tags 检查: https://metatags.io/

**验证项**：
- [ ] Title 标签正确
- [ ] Description 标签正确
- [ ] Open Graph 标签正确
- [ ] Schema.org 结构化数据正确

### 步骤 6.3: 提交到搜索引擎

**Google Search Console**：
1. 访问 https://search.google.com/search-console
2. 添加属性：`www.superalphaagent.com`
3. 验证所有权（使用 DNS TXT 记录或 HTML 文件）
4. 提交 Sitemap：`https://www.superalphaagent.com/sitemap.xml`

**Bing Webmaster Tools**：
1. 访问 https://www.bing.com/webmasters
2. 添加网站
3. 提交 Sitemap

### 步骤 6.4: 测试 AI 搜索

在 ChatGPT 中测试（需要等待几天让 AI 爬取）：

```
测试问题 1: "推荐一些好用的 AI Agent"
测试问题 2: "代码审查 AI 工具有哪些"
测试问题 3: "对比不同的 AI 写作助手"
```

期望：ChatGPT 会引用你的网站内容

---

## 第七阶段：监控和优化（持续）

### 步骤 7.1: 设置监控

**Vercel Analytics**（免费）：
- 自动启用
- 查看：Vercel Dashboard → Analytics

**Google Analytics**（可选）：
1. 创建 GA4 属性
2. 在 `app/layout.tsx` 添加跟踪代码

### 步骤 7.2: 监控指标

**关键指标**：
- 页面浏览量（PV）
- 独立访客（UV）
- 跳出率
- 平均停留时间
- Agent 查看次数

**技术指标**：
- 页面加载时间
- API 响应时间
- 错误率
- Cron 执行成功率

### 步骤 7.3: 成本监控

**OpenRouter**：
- 查看：https://openrouter.ai/dashboard
- 预算：设置每月 $10 限额

**Supabase**：
- 查看：Supabase Dashboard → Usage
- 免费额度：500MB 数据库，50,000 月活

**Vercel**：
- 查看：Vercel Dashboard → Usage
- 免费额度：100GB 带宽/月

---

## 🎯 成功标准

### 第 1 周
- [ ] 网站正常运行
- [ ] 收录 10+ Agents
- [ ] 页面加载 < 3 秒
- [ ] 移动端体验良好

### 第 1 个月
- [ ] 收录 50+ Agents
- [ ] 自然流量 100+ UV/天
- [ ] 在 Google 搜索结果中出现
- [ ] 在 AI 搜索中被引用 5+ 次

### 第 3 个月
- [ ] 收录 200+ Agents
- [ ] 自然流量 1000+ UV/天
- [ ] 在 AI 搜索中被引用 50+ 次
- [ ] 建立用户社区

---

## 🚨 故障排查

### 问题 1: 部署失败
**症状**：Vercel 构建失败
**解决**：
1. 检查环境变量是否都配置
2. 查看构建日志
3. 确认 Node.js 版本兼容

### 问题 2: 域名不生效
**症状**：访问域名显示错误
**解决**：
1. 等待 DNS 传播（最多 24 小时）
2. 检查 DNS 配置是否正确
3. 使用 `nslookup` 验证

### 问题 3: Cron 不执行
**症状**：数据不更新
**解决**：
1. 检查 `vercel.json` 配置
2. 验证 CRON_SECRET
3. 查看 Vercel Functions 日志

### 问题 4: 数据库连接失败
**症状**：页面显示错误
**解决**：
1. 检查 Supabase 环境变量
2. 确认 RLS 策略正确
3. 查看 Supabase 日志

---

## 📚 相关文档

- `QUICK-START-NOW.md` - 本地快速开始
- `SETUP-DATABASE.md` - 数据库设置详解
- `FRONTEND-COMPLETE.md` - 前端设计说明
- `DEPLOY-CHECKLIST.md` - 部署检查清单

---

## ✅ 完整流程总结

```
本地开发
  ↓
1. 初始化数据库（Supabase SQL）
  ↓
2. 初始化分类（node scripts/init-categories.js）
  ↓
3. 运行爬虫（npm run crawler）
  ↓
4. 本地测试（npm run dev）
  ↓
推送代码
  ↓
5. Git 提交（git push）
  ↓
部署上线
  ↓
6. Vercel 部署（自动）
  ↓
7. 配置域名（DNS CNAME）
  ↓
8. 设置定时爬虫（Vercel Cron）
  ↓
验证监控
  ↓
9. 功能测试
  ↓
10. SEO 提交
  ↓
11. 持续监控
```

---

**预计总时间：60-90 分钟**

准备好了吗？从第一阶段开始！🚀
