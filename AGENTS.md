# 代码仓库指南 V3.0

Agent Signals 是 AI 时代的 Agent 发现与认证平台，核心使命是成为 AI 经济体的"信用评级机构"。

## 项目结构与模块组织

```
Super-alpha-agent/
├── app/                        # Next.js App Router
│   ├── layout.tsx             # 根布局
│   ├── page.tsx               # 首页
│   ├── globals.css            # 全局样式
│   ├── scan/                  # Scanner 扫描诊断页
│   ├── agents/                # Agent 列表和详情
│   │   ├── page.tsx           # Index 索引页
│   │   └── [slug]/page.tsx    # 详情页
│   └── api/                   # API 路由
│       ├── scan/route.ts      # 扫描 API
│       ├── generate/route.ts  # 生成器 API (JSON-LD/Badge/Prompt)
│       └── agents/route.ts    # Agent 查询 API
│
├── components/                 # React 组件
│   ├── terminal/              # 终端风格 UI 组件
│   ├── scanner/               # Scanner 相关组件
│   ├── index/                 # Index 相关组件
│   ├── connector/             # Connector 相关组件
│   └── ui/                    # 基础 UI 组件
│
├── lib/                        # 工具库
│   ├── supabase.ts            # 数据库客户端
│   ├── types/                 # TypeScript 类型定义
│   ├── scanner/               # 扫描器服务 (URL检测/GitHub扫描/SaaS扫描/SR计算)
│   ├── generators/            # 生成器服务 (JSON-LD/Badge/Prompt)
│   └── data/                  # 数据访问层 (Repository 模式)
│
├── crawler/                    # Playwright/OpenAI 数据采集管道
├── supabase/                   # 数据库配置和迁移
├── test/                       # 测试文件 (属性测试)
└── docs/                       # 文档
```

## 技术栈

- **框架**: Next.js 14 (App Router)
- **语言**: TypeScript (严格模式)
- **样式**: Tailwind CSS 3.4
- **数据库**: Supabase (PostgreSQL + Auth + API)
- **AI**: OpenRouter 多模型 (主推 qwen)
- **爬虫**: Playwright
- **测试**: Vitest + fast-check (属性测试)
- **部署**: Vercel 自动 CI/CD

## 构建、测试和开发命令

```bash
# 开发
npm run dev              # 启动开发服务器 (localhost:3000)
npm run build            # 生产环境构建
npm run start            # 启动生产服务器
npm run lint             # 运行 ESLint

# 测试
npm run test             # 运行所有测试
npm run test:watch       # 监听模式
npm run test:property    # 仅运行属性测试

# 数据库
npm run db:setup         # 初始化数据库 schema
npm run db:migrate       # 运行迁移

# 爬虫
npm run crawler          # 运行网页爬虫

# 工具
npm run generate:sitemap # 生成 SEO sitemap
```

## 编码风格与命名约定

- 全面使用 TypeScript；除非需要客户端 hooks，否则优先使用 Server Components
- Client Components 使用 `'use client'` 指令
- 文件命名: kebab-case (例如: `scan-results.tsx`, `sr-calculator.ts`)
- 测试文件: `*.test.ts` 或 `*.property.test.ts`
- 两空格缩进；省略分号
- Tailwind 优先：在自定义 CSS 之前先使用工具类
- 从 `lib/` 导出辅助函数，通过 `@/` 别名导入；避免深层相对路径
- 终端风格 UI: 深色背景 (#050505), 绿色强调 (#00FF94), 等宽字体 JetBrains Mono

## 数据流架构

```
用户输入 URL → Rate Limiter → Cache Layer → URL Detector
    → GitHub Scanner / SaaS Scanner → SR Calculator → Agent Repository → 返回 ScanResponse
```

## 测试指南

- 属性测试使用 fast-check，每个属性测试 100 次迭代
- 测试文件与源文件同目录
- 核心计算逻辑 (lib/scanner/, lib/generators/) 必须有属性测试覆盖
- 对于 UI 更改，在 `npm run dev` 中进行健全性检查

## 提交与 Pull Request 指南

- 提交消息使用简短的祈使句（例如："Add GitHub Actions workflow for daily crawler"）；保持专注且不超过约 72 个字符
- PR 应包含摘要、验证步骤（运行的命令）以及影响 UI 的更改的截图/GIF
- 标注新的环境变量、Supabase 迁移或爬虫行为更改；链接 issues/tasks 并注明部署步骤

## 安全与配置提示

- 永远不要提交密钥；保持 `.env` 本地化，如果暴露则轮换 Supabase service keys
- 限制爬虫目标为已批准的来源并遵守速率限制
- 更改 Supabase schema 时，更新 `supabase/` 中的 seed/migration 文件
- 服务端使用 `supabaseAdmin` (service role key)，客户端使用 `createSupabaseClient()`
- Scanner 服务仅在服务端运行
