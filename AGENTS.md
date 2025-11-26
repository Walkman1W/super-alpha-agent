# 代码仓库指南

## 项目结构与模块组织
- `app/` 包含 App Router 页面和 API 路由；`app/layout.tsx` 连接 providers，`app/agents`、`app/ai-stats`、`app/api` 托管功能页面/端点。
- `components/` 存放共享 UI（Tailwind 优先）和 `components/ui/` 基础组件；优先通过 `@/components/...` 导入。
- `lib/` 存储服务客户端和辅助函数（Supabase、OpenAI、工具函数），供服务端和客户端模块复用。
- `crawler/` 包含 Playwright/OpenAI 数据采集管道；`scripts/` 包含 sitemap 生成和分类种子等工具。
- `supabase/` 保存 schema/migrations/seed 数据；`public/` 存放静态资源。Tailwind 配置在 `tailwind.config.ts`；全局样式在 `app/globals.css`。

## 构建、测试和开发命令
- 安装: `npm install` (Node 18.17+)。
- 本地开发: `npm run dev` 支持热重载。
- 生产构建: `npm run build`；使用 `npm start` 启动构建。
- 质量检查: `npm run lint` (Next/ESLint 规则)。
- 数据/设置: `npm run db:init` 初始化分类；`npm run crawler` 运行 agent 抓取器；`npm run sitemap` 重新生成 `public/sitemap.xml`；`npm run deploy` 运行 sitemap 然后通过 Vercel 部署。
- 连接检查: `node test-openrouter.js` 验证 OpenRouter 配置；`node test-full-setup.js` 验证 OpenRouter + Supabase。

## 编码风格与命名约定
- 全面使用 TypeScript；除非需要客户端 hooks，否则优先使用 server components。两空格缩进；省略分号。
- `components/` 中的 React 组件和文件使用 PascalCase；`app/` 下的路由使用 kebab-case。
- Tailwind 优先：在自定义 CSS 之前先使用工具类。保持渐变密集的 hero 样式与 `app/page.tsx` 一致。
- 从 `lib/` 导出辅助函数，通过 `@/` 别名导入；避免深层相对路径。

## 测试指南
- 暂无单元测试套件；设置 `.env` 后运行 node 脚本（Supabase URLs/keys 和 OpenAI/OpenRouter 配置）。
- 对于 UI 更改，在 `npm run dev` 中进行健全性检查；确认 agents 列表使用 Supabase 数据渲染，爬虫输出与 schema 匹配后再部署。

## 提交与 Pull Request 指南
- 提交消息使用简短的祈使句（例如："Add GitHub Actions workflow for daily crawler"）；保持专注且不超过约 72 个字符。
- PR 应包含摘要、验证步骤（运行的命令）以及影响 UI 的更改的截图/GIF。
- 标注新的环境变量、Supabase 迁移或爬虫行为更改；链接 issues/tasks 并注明部署步骤（例如重新运行 `npm run sitemap`）。

## 安全与配置提示
- 永远不要提交密钥；保持 `.env` 本地化，如果暴露则轮换 Supabase service keys。限制爬虫目标为已批准的来源并遵守速率限制。
- 更改 Supabase schema 时，更新 `supabase/` 中的 seed/migration 文件，并验证 `supabaseAdmin` 使用仅限服务端。
