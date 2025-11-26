---
inclusion: always
---

# 技术栈

## 核心技术

- **框架**: Next.js 14 (App Router)
- **语言**: TypeScript (启用严格模式)
- **样式**: Tailwind CSS 3.4
- **数据库**: Supabase (PostgreSQL + Auth + API)
- **AI**: 采用Openrouter 的多款模型 用于内容分析，主推qwen
- **爬虫**: Playwright 用于网页抓取
- **部署**: Vercel 自动 CI/CD

## 关键库

- `@supabase/supabase-js` - 数据库客户端
- `@supabase/auth-helpers-nextjs` - 身份验证
- `openai` - AI 分析
- `playwright` - 网页爬取
- `zod` - Schema 验证
- `lucide-react` - 图标
- `date-fns` - 日期工具
- `class-variance-authority`, `clsx`, `tailwind-merge` - 样式工具

## 路径别名

- `@/*` 映射到项目根目录 (例如: `@/lib/supabase`)

## 常用命令

```bash
# 开发
npm run dev              # 启动开发服务器 (localhost:3000)
npm run build            # 生产环境构建
npm run start            # 启动生产服务器
npm run lint             # 运行 ESLint

# 数据库
npm run db:setup         # 初始化数据库 schema

# 爬虫
npm run crawler          # 运行网页爬虫和 AI 分析

# 工具
npm run generate:sitemap # 生成 SEO sitemap
```

## 环境变量

在 `.env.local` 中必需:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# OpenAI/openrouter

OPENAI_API_KEY=

# 站点
NEXT_PUBLIC_SITE_URL=
```

## 构建配置

- **Target**: ES2017
- **Module Resolution**: bundler
- **JSX**: preserve (Next.js 处理转换)
- **Strict Mode**: 启用
- **Image Domains**: chatgpt.com, poe.com
- **Server Actions**: 启用 (实验性)
- **Revalidation**: 页面使用 ISR，3600秒 (1小时) 重新验证

## 数据库客户端使用

- **服务端**: 使用 `@/lib/supabase` 中的 `supabaseAdmin` (service role key)
- **客户端**: 在客户端组件中使用 `createSupabaseClient()`
- Service role key 绕过 RLS 策略用于管理操作
