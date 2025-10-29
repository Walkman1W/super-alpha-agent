# 🚀 快速参考卡片

## 域名
**www.superalphaagent.com**

## 一键命令

```bash
# 1. 初始化分类
npm run db:init

# 2. 运行爬虫
npm run crawler

# 3. 生成 sitemap
npm run sitemap

# 4. 本地测试
npm run dev

# 5. 推送部署
git push
```

## 环境变量（Vercel）

```env
NEXT_PUBLIC_SUPABASE_URL=https://tcrfxjdtxjcmbtplixcb.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=你的_key
SUPABASE_SERVICE_ROLE_KEY=你的_key
OPENAI_API_KEY=sk-or-v1-你的_key
OPENAI_BASE_URL=https://openrouter.ai/api/v1
OPENAI_MODEL=qwen/qwen-2.5-72b-instruct
NEXT_PUBLIC_SITE_URL=https://www.superalphaagent.com
CRON_SECRET=随机字符串
```

## DNS 配置

```
类型: CNAME
主机: www
值: cname.vercel-dns.com
```

## 重要链接

- **Supabase**: https://supabase.com/dashboard
- **Vercel**: https://vercel.com/dashboard
- **OpenRouter**: https://openrouter.ai/dashboard
- **Google Search Console**: https://search.google.com/search-console

## 文档导航

| 文档 | 用途 | 时间 |
|------|------|------|
| DEPLOY-NOW.md | 一键部署 | 35分钟 |
| QUICK-START-NOW.md | 本地开始 | 15分钟 |
| SETUP-DATABASE.md | 数据库设置 | 10分钟 |
| DEPLOY-TO-PRODUCTION.md | 完整流程 | 90分钟 |

## 故障排查

| 问题 | 解决方案 |
|------|---------|
| 数据库表不存在 | 在 Supabase 执行 schema.sql |
| 分类未找到 | 运行 npm run db:init |
| 爬虫失败 | 检查 OpenRouter API Key |
| 域名不生效 | 等待 DNS 传播（最多24小时）|

## 成本

- **开发**: $2-5（一次性）
- **运营**: $1-2/月
- **总计**: < $2/月

## 下一步

1. 阅读 `DEPLOY-NOW.md`
2. 执行 5 个命令
3. 35 分钟后上线！

---

**准备好了吗？开始吧！** 🚀
