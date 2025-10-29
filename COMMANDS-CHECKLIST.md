# ✅ 命令检查清单

## 当前状态
✅ Git 已初始化
✅ 代码已提交到本地
✅ 用户名已配置：Walkman1W
⏳ 等待创建 GitHub 仓库

---

## 第 1 步：创建 GitHub 仓库

### 在浏览器操作：
1. 访问：https://github.com/new
2. Repository name: `super-alpha-agent`
3. Public
4. **不要勾选** README、.gitignore、license
5. 点击 **Create repository**

---

## 第 2 步：推送代码

### 在终端运行：

```bash
# 推送到 GitHub
git push -u origin main
```

**如果提示输入密码**：
- 使用 Personal Access Token（不是密码）
- 获取 Token：https://github.com/settings/tokens
- 勾选 `repo` 权限

---

## 第 3 步：验证推送

### 在浏览器检查：
访问：https://github.com/Walkman1W/super-alpha-agent

应该看到所有文件

---

## 第 4 步：部署到 Vercel

### 在浏览器操作：
1. 访问：https://vercel.com
2. Continue with GitHub
3. Import Project → 选择 `super-alpha-agent`
4. 配置环境变量（见下方）
5. Deploy

### 环境变量（复制粘贴）：

```
NEXT_PUBLIC_SUPABASE_URL=https://tcrfxjdtxjcmbtplixcb.supabase.co

NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRjcmZ4amR0eGpjbWJ0cGxpeGNiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE3MDA0MzAsImV4cCI6MjA3NzI3NjQzMH0.h1HF07T0k2hIZQb0KmHITn-fxkAKcYtIxFfESkDfg_I

SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRjcmZ4amR0eGpjbWJ0cGxpeGNiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MTcwMDQzMCwiZXhwIjoyMDc3Mjc2NDMwfQ.sab-IFvQkA9MEQ9AC1ke32z4tgISx9FXj7wS0IFIXIE

OPENAI_API_KEY=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

OPENAI_BASE_URL=https://openrouter.ai/api/v1

OPENAI_MODEL=qwen/qwen-2.5-72b-instruct

NEXT_PUBLIC_SITE_URL=https://www.superalphaagent.com

NEXT_PUBLIC_SITE_NAME=Super Alpha Agent
```

**生成 CRON_SECRET**：
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

---

## 第 5 步：初始化数据

### 在 Supabase Dashboard：
1. 访问：https://supabase.com/dashboard
2. SQL Editor → New Query
3. 复制 `supabase/schema.sql` 全部内容
4. 粘贴并 Run

### 在本地终端：
```bash
# 初始化分类
npm run db:init

# 运行爬虫
npm run crawler
```

---

## 第 6 步：配置域名

### 在 Vercel：
1. Settings → Domains
2. 添加：`www.superalphaagent.com`

### 在域名服务商：
```
类型: CNAME
主机: www
值: cname.vercel-dns.com
```

---

## 验证清单

- [ ] GitHub 仓库已创建
- [ ] 代码已推送
- [ ] Vercel 部署成功
- [ ] 数据库已初始化
- [ ] 有 10 个 Agent 数据
- [ ] 域名已配置
- [ ] 网站可访问

---

## 快速命令参考

```bash
# Git
git status                    # 查看状态
git push -u origin main       # 推送代码

# 数据
npm run db:init              # 初始化分类
npm run crawler              # 运行爬虫
npm run sitemap              # 生成 sitemap

# 开发
npm run dev                  # 本地测试
```

---

## 重要链接

- GitHub: https://github.com/Walkman1W/super-alpha-agent
- Vercel: https://vercel.com/dashboard
- Supabase: https://supabase.com/dashboard
- 域名: https://www.superalphaagent.com

---

**当前任务**: 在 GitHub 创建仓库

**下一步**: 推送代码

准备好了吗？🚀
