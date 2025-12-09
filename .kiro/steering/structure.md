---
inclusion: always
---

# 项目结构 V3.0

## 目录组织

```
Super-alpha-agent/
├── app/                        # Next.js App Router
│   ├── layout.tsx             # 根布局
│   ├── page.tsx               # 首页
│   ├── globals.css            # 全局样式
│   ├── scan/                  # 🆕 Scanner 扫描诊断页
│   │   └── page.tsx
│   ├── agents/                # Agent 列表和详情
│   │   ├── page.tsx           # Index 索引页
│   │   └── [slug]/page.tsx    # 详情页
│   └── api/                   # API 路由
│       ├── scan/route.ts      # 🆕 扫描 API
│       ├── generate/route.ts  # 🆕 生成器 API (JSON-LD/Badge/Prompt)
│       └── agents/route.ts    # Agent 查询 API
│
├── components/                 # React 组件
│   ├── terminal/              # 终端风格 UI 组件
│   │   ├── header.tsx
│   │   ├── footer.tsx
│   │   ├── signal-card.tsx
│   │   └── agent-window.tsx
│   ├── scanner/               # 🆕 Scanner 相关组件
│   │   ├── scan-results.tsx   # 扫描结果展示
│   │   └── claim-optimize.tsx # 认领优化面板
│   ├── index/                 # 🆕 Index 相关组件
│   │   ├── agent-row.tsx      # Agent 行组件
│   │   └── verified-filter.tsx # 已验证过滤器
│   ├── connector/             # 🆕 Connector 相关组件
│   │   ├── connect-button.tsx # 连接按钮
│   │   └── prompt-modal.tsx   # Prompt 模态框
│   └── ui/                    # 基础 UI 组件
│
├── lib/                        # 工具库
│   ├── supabase.ts            # 数据库客户端
│   ├── types/                 # 🆕 TypeScript 类型定义
│   │   └── agent.ts           # Agent, SRScore 等类型
│   ├── scanner/               # 🆕 扫描器服务
│   │   ├── url-detector.ts    # URL 检测器
│   │   ├── github-scanner.ts  # GitHub 扫描器 (Track A)
│   │   ├── saas-scanner.ts    # SaaS 扫描器 (Track B)
│   │   ├── sr-calculator.ts   # SR 评分计算器
│   │   ├── io-extractor.ts    # I/O 模态提取器
│   │   ├── rate-limiter.ts    # 速率限制器
│   │   └── cache.ts           # 缓存层
│   ├── generators/            # 🆕 生成器服务
│   │   ├── json-ld-generator.ts
│   │   ├── badge-generator.ts
│   │   └── prompt-generator.ts
│   └── data/                  # 🆕 数据访问层
│       ├── agent-repository.ts
│       └── scan-history-repository.ts
│
├── crawler/                    # 网页抓取系统 (保留)
│   ├── run.ts
│   └── sources/
│
├── supabase/                   # 数据库配置
│   ├── migrations/            # 🆕 数据库迁移
│   │   ├── 001_agents_sr.sql  # SR 评分字段
│   │   ├── 002_scan_history.sql
│   │   └── 003_rate_limits.sql
│   └── schema.sql
│
├── test/                       # 🆕 测试文件
│   └── property/              # 属性测试
│
└── docs/                       # 文档
    ├── Signal Rank (SR) v3.0.md
    └── show-agentv3.0.html
```

## 关键约定

### 文件命名
- React 组件: kebab-case (例如: `scan-results.tsx`)
- 服务模块: kebab-case (例如: `sr-calculator.ts`)
- 类型文件: kebab-case (例如: `agent.ts`)
- 测试文件: `*.test.ts` 或 `*.property.test.ts`

### 组件结构
- 默认使用 Server Components
- Client Components 使用 `'use client'` 指令
- Scanner/Connector 组件多为 Client Components (需要交互)

### 服务层架构
- **Scanner 服务**: URL 检测 → 扫描 → SR 计算 → 持久化
- **Generator 服务**: 根据 Agent 数据生成 JSON-LD/Badge/Prompt
- **Data 服务**: Repository 模式封装数据库操作

### 数据流
```
用户输入 URL
    ↓
Rate Limiter (检查限制)
    ↓
Cache Layer (检查缓存)
    ↓
URL Detector (识别类型)
    ↓
GitHub Scanner / SaaS Scanner
    ↓
SR Calculator (计算评分)
    ↓
Agent Repository (持久化)
    ↓
返回 ScanResponse
```

### 样式规范
- 终端风格 UI: 深色背景 (#050505), 绿色强调 (#00FF94)
- 等宽字体: JetBrains Mono
- 参考: `docs/show-agentv3.0.html`

### 测试规范
- 属性测试使用 fast-check
- 每个属性测试 100 次迭代
- 测试文件与源文件同目录

## 代码组织原则

1. **关注点分离**: UI (app/) vs 服务 (lib/scanner/, lib/generators/) vs 数据 (lib/data/)
2. **类型安全**: 所有接口使用 TypeScript 严格类型
3. **服务端优先**: 扫描和计算逻辑在服务端执行
4. **缓存优先**: 24 小时内的扫描结果优先返回缓存
5. **属性测试**: 核心计算逻辑必须有属性测试覆盖
