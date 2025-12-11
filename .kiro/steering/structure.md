---
inclusion: always
---

# 项目结构 V3.1（Next.js 14 App Router）

## 目录组织（当前约定）
```
Super-alpha-agent/
├── app/                       # 路由层（页面 + API）
│   ├── layout.tsx             # 根布局
│   ├── page.tsx               # 首页
│   ├── agents/
│   │   ├── page.tsx           # 索引页
│   │   └── [slug]/page.tsx    # 详情页
│   ├── scan/page.tsx          # 扫描页
│   ├── publish/page.tsx       # 发布/认领
│   └── api/                   # API 路由（scan/generate/agents/track-ai-visit/...）
│
├── components/                # UI 按功能分组
│   ├── home/                  # 首页 UI（home-page）
│   ├── scanner/               # 扫描/诊断（scan-results, claim-optimize）
│   ├── agent/                 # 索引/详情/洞察
│   │   ├── results-page.tsx, agent-result-item.tsx
│   │   └── insights/          # AI 访问追踪、搜索统计、推荐语
│   ├── connector/             # 连接器（connect-button, prompt-modal）
│   ├── ui/                    # 基础组件（button/input/card/toast/logo…）
│   ├── layout/                # 公共布局块（header/footer）如需
│   └── legacy/                # 归档的旧版 UI（终端风格、旧卡片/首页等）
│
├── lib/                       # 纯逻辑/类型（无 React）
│   ├── supabase.ts            # Supabase 客户端
│   ├── types/                 # 类型定义（scanner/agent 等）
│   ├── scanner/               # URL 检测、GitHub/SaaS 扫描、SR 计算、I/O 提取、缓存、速率限制
│   ├── generators/            # JSON-LD、Badge、Prompt 生成
│   ├── data/                  # Repository（Agent/ScanHistory）
│   └── utils.ts 等
│
├── crawler/                   # Playwright/OpenAI 抓取与调度
├── supabase/                  # schema 与 migrations
├── test/                      # 测试（或与源文件同目录）
├── docs/                      # 设计/需求/任务/结构说明
└── scripts/                   # 工具脚本（sitemap、crawler helpers 等）
```

## 命名与组件规范
- 文件命名：kebab-case；测试文件 `*.test.ts` / `*.property.test.ts`
- 默认 Server Components；需交互/副作用的组件使用 `'use client'`
- 导入：使用别名 `@/components/...`、`@/lib/...`；页面从功能 index 出口导入（如 `@/components/agent`），避免深层相对路径。

## 服务层架构
- Scanner：URL 检测 → GitHub/SaaS 扫描 → SR 计算 → 缓存/持久化
- Generators：JSON-LD / Badge / Prompt
- Data：Repository 封装 Supabase 访问

## 数据流（扫描）
```
用户 URL
  → Rate Limiter
  → Cache
  → URL Detector
  → GitHub Scanner | SaaS Scanner
  → SR Calculator
  → Agent Repository 持久化
  → ScanResponse
```

## 样式基调
- 终端风格：深色 #050505，强调 #00FF94，等宽 JetBrains Mono
- Tailwind 优先；自定义样式前先用工具类

## 测试约定
- fast-check 属性测试；每个属性 100 次迭代
- 核心逻辑（lib/scanner, lib/generators）必须有属性测试覆盖
- 测试可与源文件同目录或置于 `test/`

## 开发操作指南
### 添加页面/路由
1) 在 `app/` 下新增目录与 `page.tsx`；如需 API，放入 `app/api/<feature>/route.ts`。
2) 页面只组装已分组的组件，避免直接耦合 lib 层。

### 添加组件
1) 放入对应功能目录（scanner/agent/connector/ui 等）；避免平铺。
2) 若是客户端组件，加 `'use client'`；更新该目录的 `index.ts` 以统一导出。
3) 页面通过 `@/components/<feature>` 引入，不要使用深层相对路径。

### 添加服务逻辑
1) 纯逻辑放 `lib/`：类型在 `lib/types/`，核心算法在 `lib/scanner/`，生成器在 `lib/generators/`，数据访问在 `lib/data/`。
2) 需要新 API：在 `app/api/<feature>/route.ts` 调用 lib 层，不要在组件中直连数据库。

### 扩展 Scanner/Generator
1) 新检测/评分：在 `lib/scanner/` 增加函数并写属性测试；在类型中补充字段。
2) 新生成输出：在 `lib/generators/` 添加模块，暴露工厂函数与类型。

### 归档/清理
- 未再使用的 UI 移入 `components/legacy/`，避免误用；确认无引用后可删除。

### 流程检查
- 新功能/结构调整后执行：`npm run lint`、`npm run build`
- 扫描/生成逻辑调整需补充/更新属性测试与单测。
