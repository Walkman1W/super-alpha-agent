# 🚀 一键部署指南

域名：**www.superalphaagent.com**

## 快速部署（3 个命令）

```bash
# 1. 初始化分类
npm run db:init

# 2. 运行爬虫
npm run crawler

# 3. 生成 sitemap
npm run sitemap
```

完成后推送到 GitHub，Vercel 会自动部署！

---

## 详细步骤

### 第 1 步：数据库初始化（5 分钟）

#### 1.1 在 Supabase 执行 SQL

1. 访问 https://supabase.com/dashboard
2. 选择项目
3. SQL Editor → New Query
4. 复制粘贴 `supabase/schema.sql` 全部内容
5. 点击 Run

#### 1.2 初始化分类

```bash
npm run db:init
```

**验证**：Supabase Table Editor → categories 表有 10 行

---

### 第 2 步：获取数据（10 分钟）

```bash
npm run crawler
```

**验证**：Supabase Table Editor → agents 表有 10 行

---

### 第 3 步：生成 Sitemap

```bash
npm run sitemap
```

**验证**：`public/sitemap.xml` 文件已生成

---

### 第 4 步：本地测试

```bash
npm run dev
```

访问 http://localhost:3000

**检查**：
- [ ] 页面显示正常
- [ ] 有 10 个 Agent 卡片
- [ ] 所有功能正常

---

### 第 5 步：推送到 GitHub

```bash
# 首次推送
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/你的用户名/super-alpha-agent.git
git push -u origin main

# 后续更新
git add .
git commit -m "Update content"
git push
```

---

### 第 6 步：Vercel 部署

#### 6.1 首次部署

1. 访问 https://vercel.com
2. 用 GitHub 登录
3. Import Project → 选择 `super-alpha-agent`
4. 配置环境变量（见下方）
5. Deploy

#### 6.2 环境变量配置

```env
NEXT_PUBLIC_SUPABASE_URL=https://tcrfxjdtxjcmbtplixcb.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=你的_anon_key
SUPABASE_SERVICE_ROLE_KEY=你的_service_role_key
OPENAI_API_KEY=sk-or-v1-你的_key
OPENAI_BASE_URL=https://openrouter.ai/api/v1
OPENAI_MODEL=qwen/qwen-2.5-72b-instruct
NEXT_PUBLIC_SITE_URL=https://www.superalphaagent.com
NEXT_PUBLIC_SITE_NAME=Super Alpha Agent
CRON_SECRET=生成随机字符串
```

**生成 CRON_SECRET**：
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

---

### 第 7 步：配置域名

#### 7.1 在 Vercel 添加域名

1. Vercel Dashboard → Settings → Domains
2. 输入 `www.superalphaagent.com`
3. Add

#### 7.2 配置 DNS

在你的域名服务商（阿里云/腾讯云/GoDaddy）：

**添加 CNAME 记录**：
```
类型: CNAME
主机记录: www
记录值: cname.vercel-dns.com
TTL: 600
```

**可选：添加根域名**：
```
类型: A
主机记录: @
记录值: 76.76.21.21
TTL: 600
```

#### 7.3 等待生效

- 通常 5-30 分钟
- 最多 24 小时

**验证**：
```bash
nslookup www.superalphaagent.com
```

---

### 第 8 步：验证部署

访问 https://www.superalphaagent.com

**检查清单**：
- [ ] 页面加载正常
- [ ] HTTPS 证书有效
- [ ] 所有功能正常
- [ ] 移动端显示正常
- [ ] Sitemap 可访问：/sitemap.xml
- [ ] Robots.txt 可访问：/robots.txt

---

### 第 9 步：提交到搜索引擎

#### Google Search Console

1. 访问 https://search.google.com/search-console
2. 添加属性：`www.superalphaagent.com`
3. 验证所有权（DNS TXT 或 HTML 文件）
4. 提交 Sitemap：`https://www.superalphaagent.com/sitemap.xml`

#### Bing Webmaster Tools

1. 访问 https://www.bing.com/webmasters
2. 添加网站
3. 提交 Sitemap

---

### 第 10 步：设置定时更新

Vercel Cron 已自动配置（每 6 小时运行一次）

**手动触发**：
```bash
curl -X GET https://www.superalphaagent.com/api/cron/crawler \
  -H "Authorization: Bearer 你的_CRON_SECRET"
```

---

## 🎯 完成检查

- [ ] 数据库已初始化（categories + agents 表）
- [ ] 本地测试通过
- [ ] 代码已推送到 GitHub
- [ ] Vercel 部署成功
- [ ] 域名已配置并生效
- [ ] HTTPS 证书有效
- [ ] Sitemap 已提交
- [ ] Cron 任务运行正常

---

## 📊 监控指标

### Vercel Analytics
- 访问：Vercel Dashboard → Analytics
- 查看：页面浏览量、访客数、性能指标

### Supabase Usage
- 访问：Supabase Dashboard → Usage
- 查看：数据库大小、API 调用次数

### OpenRouter Usage
- 访问：https://openrouter.ai/dashboard
- 查看：API 使用量、成本

---

## 💰 成本预估

- **Vercel**: $0（免费额度）
- **Supabase**: $0（免费额度）
- **OpenRouter**: $1-2/月
- **域名**: 已购买

**总计**: ~$1-2/月

---

## 🚨 常见问题

### Q: 部署失败？
**A**: 检查环境变量是否都配置，查看 Vercel 构建日志

### Q: 域名不生效？
**A**: 等待 DNS 传播，检查 CNAME 配置是否正确

### Q: 数据不显示？
**A**: 确认爬虫已成功运行，检查 Supabase 数据

### Q: Cron 不执行？
**A**: 检查 CRON_SECRET，查看 Vercel Functions 日志

---

## 📚 相关文档

- `DEPLOY-TO-PRODUCTION.md` - 完整部署流程
- `QUICK-START-NOW.md` - 本地快速开始
- `SETUP-DATABASE.md` - 数据库设置详解

---

## ✅ 快速命令参考

```bash
# 开发
npm run dev              # 启动开发服务器
npm run build            # 构建生产版本
npm run start            # 启动生产服务器

# 数据
npm run db:init          # 初始化分类
npm run crawler          # 运行爬虫
npm run sitemap          # 生成 sitemap

# 部署
git push                 # 推送代码（触发自动部署）
npm run deploy           # 生成 sitemap + 部署到 Vercel
```

---

**准备好了吗？开始第 1 步！** 🚀
