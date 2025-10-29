# 部署检查清单

## ✅ 快速部署步骤（30 分钟）

### 1. 注册服务（15 分钟）

- [ ] **Supabase** (https://supabase.com)
  - 创建项目：`shopo-alpha-agent`
  - 区域选择：Tokyo（东京）
  - 获取 3 个密钥（Project Settings → API）

- [ ] **OpenAI** (https://platform.openai.com)
  - 充值 $20
  - 创建 API Key

- [ ] **Vercel** (https://vercel.com)
  - 用 GitHub 登录

### 2. 初始化数据库（5 分钟）

在 Supabase Dashboard → SQL Editor：

- [ ] 执行 `supabase/schema.sql`
- [ ] 执行 `supabase/seed.sql`
- [ ] 验证：Table Editor 中看到 10 个 categories

### 3. 推送代码（2 分钟）

```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/你的用户名/shopo-alpha-agent.git
git push -u origin main
```

### 4. 部署到 Vercel（5 分钟）

- [ ] Import GitHub 仓库
- [ ] 配置环境变量（6 个）：
  ```
  NEXT_PUBLIC_SUPABASE_URL
  NEXT_PUBLIC_SUPABASE_ANON_KEY
  SUPABASE_SERVICE_ROLE_KEY
  OPENAI_API_KEY
  NEXT_PUBLIC_SITE_URL=https://www.superalphaagent.com
  CRON_SECRET=生成一个随机字符串
  ```
- [ ] 点击 Deploy

### 5. 配置域名（3 分钟）

在 Vercel → Settings → Domains：

- [ ] 添加 `www.superalphaagent.com`
- [ ] 在域名服务商添加 CNAME：`www` → `cname.vercel-dns.com`
- [ ] 等待 DNS 生效（5-30 分钟）

### 6. 运行首次爬虫（本地，10 分钟）

```bash
# 创建 .env.local（复制 Vercel 的环境变量）
npm install
npm run crawler
```

### 7. 验证部署

- [ ] 访问 https://www.superalphaagent.com
- [ ] 首页显示正常
- [ ] 能看到 Agent 列表
- [ ] 点击 Agent 查看详情页

## 🔑 环境变量速查

| 变量 | 从哪里获取 | 示例 |
|------|-----------|------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase → Settings → API | `https://xxx.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase → Settings → API | `eyJhbG...` |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase → Settings → API | `eyJhbG...` |
| `OPENAI_API_KEY` | OpenAI → API Keys | `sk-proj-...` |
| `NEXT_PUBLIC_SITE_URL` | 你的域名 | `https://www.superalphaagent.com` |
| `CRON_SECRET` | 自己生成 | 任意随机字符串（20+ 字符）|

## 💰 成本

- Supabase: **免费**
- Vercel: **免费**
- OpenAI: **$15-30/月**

## 🚨 常见问题

**Q: 部署失败？**
- 检查所有环境变量是否填写
- 查看 Vercel 部署日志

**Q: 爬虫报错？**
- 确认 OpenAI 账户有余额
- 检查 Supabase 连接

**Q: 域名不生效？**
- 等待 DNS 传播（最多 24 小时）
- 用 `nslookup www.superalphaagent.com` 检查

## 📊 定时爬虫

已配置为每 6 小时自动运行一次（`vercel.json`）

手动触发：
```bash
curl -X GET https://www.superalphaagent.com/api/cron/crawler \
  -H "Authorization: Bearer 你的_CRON_SECRET"
```

## 下一步

- [ ] 增加 Agent 数量（多运行几次爬虫）
- [ ] 提交到 Google Search Console
- [ ] 测试 AI 搜索效果（ChatGPT、Claude）
- [ ] 监控 Vercel Analytics

---

详细说明见 `DEPLOYMENT-GUIDE.md`
