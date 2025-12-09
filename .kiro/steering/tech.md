---
inclusion: always
---

# 技术栈 V3.0

## 核心技术

- **框架**: Next.js 14 (App Router)
- **语言**: TypeScript (启用严格模式)
- **样式**: Tailwind CSS 3.4
- **数据库**: Supabase (PostgreSQL + Auth + API)
- **AI**: OpenRouter 多模型 (主推 qwen)
- **爬虫**: Playwright 用于 SaaS 网页抓取
- **测试**: Vitest + fast-check (属性测试)
- **部署**: Vercel 自动 CI/CD

## 关键库

### 核心依赖
- `@supabase/supabase-js` - 数据库客户端
- `@supabase/auth-helpers-nextjs` - 身份验证
- `openai` - AI 分析 (通过 OpenRouter)
- `playwright` - 网页爬取 (Track B 扫描)
- `zod` - Schema 验证

### UI 相关
- `lucide-react` - 图标
- `class-variance-authority`, `clsx`, `tailwind-merge` - 样式工具

### 测试相关
- `vitest` - 测试框架
- `fast-check` - 属性测试库

### 工具
- `date-fns` - 日期工具

## 路径别名

- `@/*` 映射到项目根目录 (例如: `@/lib/scanner/sr-calculator`)

## 常用命令

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

## 环境变量

在 `.env.local` 中必需:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# OpenAI/OpenRouter
OPENAI_API_KEY=

# GitHub (用于 Track A 扫描)
GITHUB_TOKEN=

# 站点
NEXT_PUBLIC_SITE_URL=https://agentsignals.ai
```

## 数据库 Schema (V3.0 新增)

### agents 表扩展字段
```sql
-- SR 评分相关
sr_score DECIMAL(3,1)      -- Signal Rank 分数 0.0-10.0
sr_tier VARCHAR(1)         -- 等级 S/A/B/C
sr_track VARCHAR(20)       -- 轨道 OpenSource/SaaS/Hybrid
score_github DECIMAL(3,1)  -- Track A 分数
score_saas DECIMAL(3,1)    -- Track B 分数
score_breakdown JSONB      -- 详细评分明细

-- 标志位
is_mcp BOOLEAN             -- 是否支持 MCP
is_claimed BOOLEAN         -- 是否已认领
is_verified BOOLEAN        -- 是否已验证

-- I/O 类型
input_types TEXT[]         -- 输入模态 ['Text', 'Image']
output_types TEXT[]        -- 输出模态 ['JSON', 'Code']
```

### 新增表
- `scan_history` - 扫描历史，用于趋势追踪
- `rate_limits` - 速率限制，防止滥用

## SR 计算器配置

### Track A (GitHub) 权重
| 指标 | 最高分 |
|------|--------|
| Stars 阶梯 | 2.0 |
| Fork 比率 | 1.0 |
| 活跃度 | 2.0 |
| 机器就绪度 | 3.0 |
| 协议支持 | 2.0 |

### Track B (SaaS) 权重
| 指标 | 最高分 |
|------|--------|
| 身份信誉 | 3.0 |
| AEO 可见性 | 4.0 |
| 互操作性 | 3.0 |

### 混合计算
```typescript
finalScore = Math.min(Math.max(scoreA, scoreB) + 0.5, 10.0)
```

## 速率限制配置

- 匿名用户: 5 次扫描/小时/IP
- 已认证用户: 20 次扫描/小时
- 缓存 TTL: 24 小时

## 构建配置

- **Target**: ES2017
- **Module Resolution**: bundler
- **JSX**: preserve
- **Strict Mode**: 启用
- **Server Actions**: 启用

## 数据库客户端使用

- **服务端**: 使用 `supabaseAdmin` (service role key)
- **客户端**: 使用 `createSupabaseClient()`
- **Scanner 服务**: 仅在服务端运行，使用 `supabaseAdmin`

## 测试配置

```typescript
// vitest.config.ts
export default {
  test: {
    include: ['**/*.test.ts', '**/*.property.test.ts'],
    coverage: {
      reporter: ['text', 'html'],
      include: ['lib/scanner/**', 'lib/generators/**']
    }
  }
}
```

### 属性测试注释格式
```typescript
/**
 * **功能: agent-scanner-mvp, 属性 X: 属性名称**
 * 属性描述...
 * **验证: 需求 X.X**
 */
```
