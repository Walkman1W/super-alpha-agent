# Agent Signals

🤖 **The GEO Engine for AI Agents** - 自动爬取、分析、展示 AI Agents，专为 AI 搜索引擎优化

**域名**: [agentsignals.ai](https://agentsignals.ai)

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/yourusername/super-alpha-agent)

## 🎯 核心特点

- 🤖 **AI 优先**: 专为 AI 搜索引擎（ChatGPT、Claude、Perplexity）优化
- 🔄 **自动化**: 自动爬取、分析、更新，无需人工干预
- 📊 **AI 搜索追踪**: 业界首创！追踪 AI 搜索引擎的推荐次数
- 🚀 **零维护**: 部署后自动运行，低成本高效率

## 技术栈

- **前端**: Next.js 14 + Tailwind CSS
- **后端**: Supabase (PostgreSQL + API)
- **爬虫**: Playwright + OpenAI GPT-4
- **部署**: Vercel (自动化 Cron)

## 🚀 快速开始

### 方案 A：一键部署（推荐）

1. 点击上方 "Deploy with Vercel" 按钮
2. 配置环境变量
3. 部署完成！

### 方案 B：本地开发

```bash
# 1. 克隆仓库
git clone https://github.com/yourusername/super-alpha-agent.git
cd super-alpha-agent

# 2. 安装依赖
npm install

# 3. 配置环境变量
cp .env.example .env
# 编辑 .env 填入你的 API 密钥

# 4. 初始化数据库（在 Supabase Dashboard 执行 supabase/schema.sql）

# 5. 初始化分类
npm run db:init

# 6. 运行爬虫
npm run crawler

# 7. 启动开发服务器
npm run dev
```

访问 http://localhost:3000

## 📖 详细文档

- **[DEPLOY-NOW.md](./DEPLOY-NOW.md)** - 一键部署指南（推荐）
- **[DEPLOY-TO-PRODUCTION.md](./DEPLOY-TO-PRODUCTION.md)** - 完整部署流程
- **[QUICK-START-NOW.md](./QUICK-START-NOW.md)** - 本地快速开始
- **[SETUP-DATABASE.md](./SETUP-DATABASE.md)** - 数据库设置详解
- **[FRONTEND-COMPLETE.md](./FRONTEND-COMPLETE.md)** - 前端设计说明
- **[DESIGN-NOTES.md](./DESIGN-NOTES.md)** - 设计理念和规范

## 项目结构

```
Super-alpha-mvp/
├── app/                      # Next.js App Router
│   ├── (main)/              # 主站页面
│   │   ├── page.tsx         # 首页
│   │   ├── agents/          # Agent 列表和详情
│   │   ├── compare/         # 对比页面
│   │   └── category/        # 分类页面
│   ├── api/                 # API 路由
│   │   ├── agents/
│   │   ├── crawler/
│   │   └── auth/
│   └── layout.tsx
├── components/              # React 组件
│   ├── ui/                  # shadcn/ui 组件
│   ├── agent-card.tsx
│   ├── agent-comparison.tsx
│   └── search-bar.tsx
├── lib/                     # 工具函数
│   ├── supabase.ts         # Supabase 客户端
│   ├── openai.ts           # OpenAI 客户端
│   └── utils.ts
├── crawler/                 # 爬虫系统
│   ├── sources/
│   │   ├── gpt-store.ts
│   │   └── poe.ts
│   ├── enricher.ts         # AI 分析
│   └── scheduler.ts
├── supabase/               # 数据库配置
│   ├── migrations/
│   └── seed.sql
└── public/
```

## 环境变量

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# OpenAI
OPENAI_API_KEY=your_openai_api_key

# 其他
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

## 开发计划

### Week 1: 基础架构
- [x] 项目初始化
- [ ] 数据库设计
- [ ] 基础页面搭建
- [ ] 爬虫开发

### Week 2: 功能完善
- [ ] Agent 详情页
- [ ] 对比功能
- [ ] 用户认证
- [ ] GEO 优化

### Week 3: 上线
- [ ] 测试
- [ ] 部署
- [ ] 监控
