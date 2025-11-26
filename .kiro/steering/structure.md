---
inclusion: always
---

# 项目结构

## 目录组织

```
Super-alpha-agent/
├── app/                    # Next.js App Router
│   ├── layout.tsx         # 根布局，包含导航和页脚
│   ├── page.tsx           # 首页
│   ├── globals.css        # 全局样式
│   ├── agents/            # Agent 相关页面
│   ├── ai-stats/          # AI 搜索统计
│   └── api/               # API 路由
│
├── components/            # React 组件
│   └── ai-visit-tracker.tsx
│
├── lib/                   # 工具库
│   ├── supabase.ts       # 数据库客户端和类型
│   ├── openai.ts         # AI 分析客户端
│   └── ai-detector.ts    # AI 搜索检测
│
├── crawler/               # 网页抓取系统
│   ├── run.ts            # 爬虫入口
│   ├── enricher.ts       # AI 分析和数据增强
│   └── sources/          # 平台特定爬虫
│
├── supabase/             # 数据库配置
│   ├── schema.sql        # 数据库 schema
│   └── seed.sql          # 种子数据
│
├── scripts/              # 工具脚本
│   └── setup-database.js # 数据库初始化
│
└── [config files]        # TypeScript, Tailwind, Next.js 配置
```

## 关键约定

### 文件命名

- React 组件: kebab-case (例如: `ai-visit-tracker.tsx`)
- 页面: Next.js 约定 (例如: `page.tsx`, `[slug]/page.tsx`)
- 工具: kebab-case (例如: `ai-detector.ts`)

### 组件结构

- 默认使用 Server Components (Next.js 14 App Router)
- Client Components 使用 `'use client'` 指令标记
- 使用 Async Server Components 进行数据获取

### 数据获取

- 在 Server Components 和 API 路由中使用 `supabaseAdmin`
- 在 Client Components 中使用 `createSupabaseClient()`
- 使用 `revalidate` 导出实现 ISR 静态页面
- 公共页面不使用客户端数据获取 (SEO 优化)

### 样式

- 优先使用 Tailwind 工具类
- Container 模式: `container mx-auto px-4`
- 响应式: 移动优先，使用 `md:` 和 `lg:` 断点
- 交互元素的悬停状态

### 数据库类型

- 类型定义在 `lib/supabase.ts`
- 主要类型: `Agent`, `Category`, `Comparison`
- 使用 TypeScript 类型确保类型安全

### 爬虫架构

- 平台特定爬虫在 `crawler/sources/`
- 原始数据提取 → AI 分析 → 数据库存储
- 速率限制: API 调用之间延迟 1 秒
- 使用 try-catch 和日志进行错误处理

### AI 集成

- 使用 GPT-4 进行内容分析和增强
- 结构化提示确保输出一致性
- 缓存以最小化 API 成本
- 批处理提高效率

## 代码组织原则

1. **关注点分离**: UI (app/) vs 逻辑 (lib/) vs 数据 (crawler/)
2. **类型安全**: 所有数据结构使用显式 TypeScript 类型
3. **服务端优先**: 利用 Server Components 提升性能和 SEO
4. **最小化客户端 JS**: 仅在必要时使用 Client Components
5. **结构化数据**: 包含 Schema.org 标记用于 AI/SEO 优化
