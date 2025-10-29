# 🚀 分步部署指南

## 当前状态
✅ 代码已提交到本地 Git
✅ 用户名已配置：Walkman1W
⏳ 需要创建 GitHub 仓库并推送

---

## 第 1 步：创建 GitHub 仓库（2 分钟）

### 1.1 访问 GitHub
打开浏览器，访问：https://github.com/new

### 1.2 填写仓库信息
- **Repository name**: `super-alpha-agent`
- **Description**: `AI Agent 发现平台 - 专为 AI 搜索引擎优化`
- **Public** 或 **Private**: 选择 Public（推荐）
- ⚠️ **不要勾选**：
  - [ ] Add a README file
  - [ ] Add .gitignore
  - [ ] Choose a license

### 1.3 创建仓库
点击 **Create repository** 按钮

---

## 第 2 步：推送代码到 GitHub（1 分钟）

GitHub 会显示一个页面，选择 "push an existing repository"。

在你的项目目录运行：

```bash
# 已经完成的步骤（不需要再运行）
# git remote add origin https://github.com/Walkman1W/super-alpha-agent.git
# git branch -M main

# 推送代码
git push -u origin main
```

**如果提示输入用户名和密码**：
- Username: `Walkman1W`
- Password: 使用 **Personal Access Token**（不是密码）

### 如何获取 Personal Access Token

1. 访问：https://github.com/settings/tokens
2. 点击 **Generate new token** → **Generate new token (classic)**
3. 填写：
   - Note: `super-alpha-agent-deploy`
   - Expiration: `90 days`
   - 勾选：`repo`（所有权限）
4. 点击 **Generate token**
5. **复制 token**（只显示一次！）
6. 在 Git 推送时，用这个 token 作为密码

---

## 第 3 步：验证推送成功（1 分钟）

访问：https://github.com/Walkman1W/super-alpha-agent

你应该看到：
- ✅ 所有文件已上传
- ✅ README.md 显示项目说明
- ✅ 61 个文件

---

## 第 4 步：部署到 Vercel（5 分钟）

### 4.1 访问 Vercel
打开：https://vercel.com

### 4.2 登录
- 点击 **Sign Up** 或 **Log In**
- 选择 **Continue with GitHub**
- 授权 Vercel 访问你的 GitHub

### 4.3 导入项目
1. 点击 **Add New** → **Project**
2. 找到 `super-alpha-agent` 仓库
3. 点击 **Import**

### 4.4 配置项目
- **Framework Preset**: Next.js（自动检测）
- **Root Directory**: `./`（默认）
- **Build Command**: `npm run build`（默认）
- **Output Directory**: `.next`（默认）

### 4.5 配置环境变量

点击 **Environment Variables**，添加以下变量：

```env
NEXT_PUBLIC_SUPABASE_URL
值: https://tcrfxjdtxjcmbtplixcb.supabase.co

NEXT_PUBLIC_SUPABASE_ANON_KEY
值: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRjcmZ4amR0eGpjbWJ0cGxpeGNiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE3MDA0MzAsImV4cCI6MjA3NzI3NjQzMH0.h1HF07T0k2hIZQb0KmHITn-fxkAKcYtIxFfESkDfg_I

SUPABASE_SERVICE_ROLE_KEY
值: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRjcmZ4amR0eGpjbWJ0cGxpeGNiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MTcwMDQzMCwiZXhwIjoyMDc3Mjc2NDMwfQ.sab-IFvQkA9MEQ9AC1ke32z4tgISx9FXj7wS0IFIXIE

OPENAI_API_KEY
值: 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

OPENAI_BASE_URL
值: https://openrouter.ai/api/v1

OPENAI_MODEL
值: qwen/qwen-2.5-72b-instruct

NEXT_PUBLIC_SITE_URL
值: https://www.superalphaagent.com

NEXT_PUBLIC_SITE_NAME
值: Super Alpha Agent

CRON_SECRET
值: 生成一个随机字符串（见下方）
```

**生成 CRON_SECRET**：
在本地终端运行：
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```
复制输出的字符串

### 4.6 部署
点击 **Deploy** 按钮

等待 2-3 分钟，部署完成后会得到一个 URL，例如：
`https://super-alpha-agent-xxx.vercel.app`

---

## 第 5 步：验证部署（2 分钟）

### 5.1 访问 Vercel URL
点击 Vercel 提供的 URL

**检查**：
- [ ] 页面加载正常
- [ ] Hero 区域显示
- [ ] 显示 "暂无 Agent 数据"（正常，因为还没运行爬虫）

### 5.2 初始化数据库

#### 在 Supabase Dashboard：
1. 访问：https://supabase.com/dashboard
2. 选择项目
3. SQL Editor → New Query
4. 打开本地的 `supabase/schema.sql`
5. 复制全部内容，粘贴到 SQL Editor
6. 点击 **Run**

#### 在本地运行：
```bash
# 初始化分类
npm run db:init

# 运行爬虫
npm run crawler
```

### 5.3 刷新网站
再次访问 Vercel URL，应该看到 10 个 Agent 卡片！

---

## 第 6 步：配置自定义域名（10 分钟）

### 6.1 在 Vercel 添加域名
1. Vercel Dashboard → 你的项目
2. Settings → Domains
3. 输入：`www.superalphaagent.com`
4. 点击 **Add**

### 6.2 配置 DNS

Vercel 会显示需要添加的 DNS 记录。

#### 去你的域名服务商（阿里云/腾讯云/GoDaddy）：

**添加 CNAME 记录**：
```
记录类型: CNAME
主机记录: www
记录值: cname.vercel-dns.com
TTL: 600（10分钟）
```

**可选：添加根域名重定向**：
```
记录类型: A
主机记录: @
记录值: 76.76.21.21
TTL: 600
```

### 6.3 等待 DNS 生效
- 通常 5-30 分钟
- 最多 24 小时

**验证 DNS**：
```bash
nslookup www.superalphaagent.com
```

### 6.4 验证 HTTPS
访问：https://www.superalphaagent.com

Vercel 会自动配置 SSL 证书（Let's Encrypt）

---

## 第 7 步：提交到搜索引擎（5 分钟）

### Google Search Console
1. 访问：https://search.google.com/search-console
2. 添加属性：`www.superalphaagent.com`
3. 验证所有权（DNS TXT 记录或 HTML 文件）
4. 提交 Sitemap：`https://www.superalphaagent.com/sitemap.xml`

### Bing Webmaster Tools
1. 访问：https://www.bing.com/webmasters
2. 添加网站
3. 提交 Sitemap

---

## 完成检查清单

- [ ] GitHub 仓库已创建
- [ ] 代码已推送到 GitHub
- [ ] Vercel 部署成功
- [ ] 数据库已初始化
- [ ] 爬虫已运行（有 10 个 Agent）
- [ ] 自定义域名已配置
- [ ] DNS 已生效
- [ ] HTTPS 证书有效
- [ ] Sitemap 已提交

---

## 🎉 完成！

你的网站现在运行在：
- **Vercel URL**: https://super-alpha-agent-xxx.vercel.app
- **自定义域名**: https://www.superalphaagent.com

### 下一步
- 监控 Vercel Analytics
- 查看 Cron 任务日志
- 等待 AI 搜索引擎爬取（几天后）
- 持续添加更多 Agent

---

## 🚨 遇到问题？

### 问题 1: GitHub 推送失败
**错误**: `remote: Repository not found`
**解决**: 
1. 确认已在 GitHub 创建仓库
2. 检查仓库名称是否正确
3. 确认用户名是 `Walkman1W`

### 问题 2: Vercel 构建失败
**解决**:
1. 检查所有环境变量是否配置
2. 查看构建日志
3. 确认 Node.js 版本 >= 18

### 问题 3: 域名不生效
**解决**:
1. 等待 DNS 传播
2. 检查 CNAME 配置
3. 使用 `nslookup` 验证

### 问题 4: 页面显示 "暂无数据"
**解决**:
1. 确认数据库 SQL 已执行
2. 运行 `npm run db:init`
3. 运行 `npm run crawler`
4. 检查 Supabase 数据

---

**预计总时间**: 30 分钟

**当前进度**: 第 1 步 - 创建 GitHub 仓库

准备好了吗？开始第 1 步！🚀
