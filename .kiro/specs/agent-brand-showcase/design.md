# Design Document

## Overview

Agent品牌展示页面是一个全新的用户界面层，旨在为真实用户提供更加吸引人和专业的Agent浏览体验。该设计在现有的Super Alpha Agent平台基础上构建，保持与现有数据库schema和爬虫系统的兼容性，同时引入新的UI组件和交互模式。

核心设计理念：
- **双重受众优化**：同时服务于真实用户（视觉吸引力）和AI机器人（结构化数据）
- **渐进式增强**：在现有功能基础上添加新特性，不破坏现有系统
- **性能优先**：利用Next.js 14的Server Components和ISR实现快速加载
- **移动优先**：响应式设计，确保在所有设备上的良好体验

## Architecture

### 系统架构层次

```
┌─────────────────────────────────────────────────────────────┐
│                        展示层                                 │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   主页       │  │  Agent市场   │  │  发布表单    │      │
│  │  (新增)      │  │  (增强)      │  │   (新增)     │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
                            │
┌─────────────────────────────────────────────────────────────┐
│                       业务逻辑层                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │  AI检测      │  │  URL分析     │  │  统计聚合    │      │
│  │  (已有)      │  │   (新增)     │  │  (增强)      │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
                            │
┌─────────────────────────────────────────────────────────────┐
│                        数据层                                 │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   Agents     │  │  AI访问记录  │  │  用户提交    │      │
│  │  (已有)      │  │  (已有)      │  │  (已有)      │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
```

### 技术栈决策

- **前端框架**: Next.js 14 App Router (已有)
- **样式**: Tailwind CSS 3.4 + 自定义渐变动画
- **数据获取**: Server Components + ISR (3600s revalidation)
- **状态管理**: React useState/useEffect (客户端组件最小化)
- **AI分析**: OpenRouter API (已有)
- **爬虫**: Playwright (已有)

## Components and Interfaces

### 1. Hero Section Component

**位置**: `app/page.tsx` (增强现有页面)

**职责**:
- 展示科技感的视觉设计
- 提供清晰的价值主张
- 引导用户进入Agent市场或发布功能

**Props接口**:
```typescript
interface HeroSectionProps {
  agentCount: number
  featuredCategories: Category[]
}
```

**关键特性**:
- 多层渐变背景 (from-blue-600 via-indigo-600 to-purple-700)
- SVG图案叠加层 (opacity-20)
- 动画效果 (hover:scale-105, transition-all)
- 响应式文字大小 (text-6xl md:text-7xl)

### 2. Mode Switcher Component

**位置**: `components/mode-switcher.tsx` (新建)

**职责**:
- 在Agent市场和发布Agent之间切换
- 维护URL状态 (使用query参数)
- 提供视觉反馈

**Props接口**:
```typescript
interface ModeSwitcherProps {
  currentMode: 'market' | 'publish'
  onModeChange: (mode: 'market' | 'publish') => void
}
```

**实现方式**:
- 使用Next.js `useSearchParams` 和 `useRouter`
- 客户端组件 ('use client')
- Tab式导航UI

### 3. Agent Market Grid Component

**位置**: `components/agent-market-grid.tsx` (重构现有)

**职责**:
- 展示Agent卡片网格
- 支持排序和筛选
- 实现分页或无限滚动

**Props接口**:
```typescript
interface AgentMarketGridProps {
  agents: Agent[]
  sortBy?: 'popularity' | 'recent' | 'ai_search_count'
  filterCategory?: string
}
```

**增强功能**:
- 添加AI搜索次数显示
- 改进hover效果
- 添加骨架屏加载状态

### 4. Agent Card Component

**位置**: `components/agent-card.tsx` (增强现有)

**职责**:
- 展示单个Agent的摘要信息
- 显示AI搜索统计
- 提供点击导航

**Props接口**:
```typescript
interface AgentCardProps {
  agent: Agent
  showAIStats?: boolean
}
```

**新增字段**:
```typescript
interface AgentCardData {
  // 现有字段...
  ai_search_count: number
  ai_search_breakdown?: {
    ChatGPT: number
    Claude: number
    Perplexity: number
    [key: string]: number
  }
}
```

### 5. Agent Detail Page Component

**位置**: `app/agents/[slug]/page.tsx` (增强现有)

**职责**:
- 展示完整的Agent信息
- 优化SEO/GEO
- 显示详细的AI搜索统计

**增强功能**:
- 添加结构化数据 (JSON-LD)
- 改进meta标签生成
- 添加AI搜索统计图表
- 集成AIVisitTracker组件

**SEO优化**:
```typescript
export async function generateMetadata({ params }): Promise<Metadata> {
  const agent = await getAgent(params.slug)
  
  return {
    title: `${agent.name} - AI Agent 详细介绍 | Super Alpha Agent`,
    description: agent.short_description,
    keywords: agent.keywords,
    openGraph: {
      title: agent.name,
      description: agent.short_description,
      type: 'article',
      // ...
    },
    // JSON-LD structured data
    other: {
      'application/ld+json': JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'SoftwareApplication',
        name: agent.name,
        description: agent.detailed_description,
        // ...
      })
    }
  }
}
```

### 6. Publish Agent Form Component

**位置**: `components/publish-agent-form.tsx` (新建)

**职责**:
- 接收用户提交的Agent URL
- 验证URL格式
- 显示提交状态

**Props接口**:
```typescript
interface PublishAgentFormProps {
  onSubmitSuccess?: (agentId: string) => void
}
```

**表单字段**:
```typescript
interface AgentSubmissionForm {
  agent_url: string
  user_email?: string  // 可选，用于通知
  additional_notes?: string
}
```

### 7. URL Analyzer Service

**位置**: `lib/url-analyzer.ts` (新建)

**职责**:
- 抓取用户提交的URL
- 提取页面内容
- 调用AI分析生成结构化数据

**接口**:
```typescript
interface URLAnalyzer {
  analyzeURL(url: string): Promise<AnalysisResult>
}

interface AnalysisResult {
  success: boolean
  data?: {
    name: string
    short_description: string
    detailed_description: string
    key_features: string[]
    use_cases: string[]
    pros: string[]
    cons: string[]
    platform: string
    pricing: string
  }
  error?: string
}
```

**实现步骤**:
1. 使用Playwright抓取页面HTML
2. 提取关键信息 (title, meta, content)
3. 调用OpenRouter API (使用qwen模型)
4. 解析AI响应为结构化数据
5. 验证数据完整性

### 8. AI Search Stats Component

**位置**: `components/ai-search-stats.tsx` (新建)

**职责**:
- 展示AI搜索统计数据
- 支持图表可视化
- 显示趋势信息

**Props接口**:
```typescript
interface AISearchStatsProps {
  agentId: string
  totalCount: number
  breakdown: Record<string, number>
  showChart?: boolean
}
```

**可视化方案**:
- 简单条形图 (使用Tailwind实现，无需额外库)
- 百分比显示
- 趋势指示器

## Data Models

### 现有数据模型 (无需修改)

```typescript
// agents 表已包含所需字段
type Agent = {
  id: string
  slug: string
  name: string
  short_description: string
  detailed_description: string | null
  key_features: string[]
  use_cases: string[]
  pros: string[]
  cons: string[]
  platform: string | null
  pricing: string | null
  official_url: string | null
  ai_search_count: number  // 已存在
  // ...
}

// ai_visits 表已存在
type AIVisit = {
  id: string
  agent_id: string
  ai_name: string
  user_agent: string
  referer: string
  visited_at: string
  // ...
}

// user_submissions 表已存在
type UserSubmission = {
  id: string
  user_id: string
  agent_name: string
  agent_url: string
  description: string
  status: 'pending' | 'approved' | 'rejected'
  created_at: string
}
```

### 新增视图模型 (应用层)

```typescript
// Agent卡片展示模型
interface AgentCardViewModel {
  id: string
  slug: string
  name: string
  short_description: string
  platform: string
  key_features: string[]
  pricing: string
  ai_search_count: number
  official_url: string
}

// AI统计聚合模型
interface AIStatsViewModel {
  total_count: number
  breakdown: {
    ai_name: string
    count: number
    percentage: number
  }[]
  recent_visits: {
    ai_name: string
    visited_at: string
  }[]
}
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### 性能属性

属性 1: 主页加载时间
*For any* homepage request, the page SHALL render gradient backgrounds and visual effects within 2 seconds
**Validates: Requirements 1.2**

属性 2: 响应式布局适配
*对于任意* 视口宽度，主页布局应适当适配屏幕尺寸（移动端 < 768px，平板 768-1024px，桌面端 > 1024px）
**验证: 需求 1.3**

### 导航属性

属性 3: 客户端导航到Agent市场
*For any* user interaction clicking the Agent Market option, the system SHALL update the URL and content without triggering a full page reload
**Validates: Requirements 2.2**

属性 4: 客户端导航到发布Agent
*对于任意* 用户点击发布Agent选项的交互，系统应更新URL和内容而不触发完整页面重载
**验证: 需求 2.3**

属性 5: 滚动位置管理
*对于任意* 模式切换操作，系统应根据导航上下文保持当前滚动位置或重置到顶部
**验证: 需求 2.4**

属性 6: 活动模式高亮
*对于任意* 活动模式（市场或发布），相应的导航控件应具有显示其活动状态的视觉指示器（CSS类或属性）
**验证: 需求 2.5**

### Agent市场属性

属性 7: Agent排序
*For any* Agent Market view, agents SHALL be displayed in descending order by the selected sort criterion (popularity, recent, or ai_search_count)
**Validates: Requirements 3.1**

属性 8: Agent卡片完整性
*对于任意* 显示的Agent卡片，它应包含所有必需字段：名称、简短描述和搜索统计
**验证: 需求 3.2**

属性 9: Agent导航
*对于任意* Agent卡片点击，系统应导航到与点击的agent的slug匹配的正确Agent详情页
**验证: 需求 4.1**

属性 10: Agent详情完整性
*对于任意* Agent详情页，它应显示所有必需的信息字段：名称、完整描述、关键特性、使用场景和搜索统计
**验证: 需求 4.2**

属性 11: 结构化数据存在性
*对于任意* Agent详情页，渲染的HTML应包含有效的Schema.org JSON-LD结构化数据
**验证: 需求 4.3**

属性 12: SEO元标签完整性
*对于任意* Agent详情页，HTML头部应包含所有必需的元标签：标题、描述和Open Graph标签
**验证: 需求 4.4**

属性 13: AI统计细分
*对于任意* 带有搜索统计的Agent详情页，页面应显示每个AI搜索引擎的计数细分
**验证: 需求 4.5**

### URL提交属性

属性 14: URL格式验证
*For any* submitted URL string, the system SHALL validate it matches a valid URL format before processing
**Validates: Requirements 5.2**

属性 15: 分析启动
*对于任意* 有效的URL提交，系统应触发自动化分析流程
**验证: 需求 5.3**

属性 16: 信息提取完整性
*对于任意* 成功的分析，提取的数据应至少包括：名称、描述和特性
**验证: 需求 5.4**

属性 17: 提取后的数据库持久化
*对于任意* 成功提取的Agent信息，系统应创建新的数据库条目且该条目应可检索
**验证: 需求 5.5**

### 爬虫和分析属性

属性 18: 网页抓取
*For any* Agent URL received, the system SHALL successfully fetch the webpage content using the crawler
**Validates: Requirements 6.1**

属性 19: HTML解析
*对于任意* 检索到的网页内容，系统应解析HTML结构并提取文本内容
**验证: 需求 6.2**

属性 20: AI分析执行
*对于任意* 解析的网页内容，系统应调用AI分析以生成描述和特性
**验证: 需求 6.3**

属性 21: Schema验证
*对于任意* AI生成的数据，系统应在存储前根据所需的Agent schema进行验证
**验证: 需求 6.4**

属性 22: 数据库存储
*对于任意* 验证过的Agent数据，系统应成功将其存储在Supabase中且数据应可检索
**验证: 需求 6.5**

### SEO/GEO属性

属性 23: JSON-LD结构化数据有效性
*For any* Agent Detail Page, the JSON-LD structured data SHALL be valid according to Schema.org SoftwareApplication schema
**Validates: Requirements 7.1**

属性 24: 语义化HTML和ARIA
*对于任意* 渲染的页面，应使用语义化HTML5元素且交互元素应具有适当的ARIA标签
**验证: 需求 7.2**

属性 25: 关键词派生
*对于任意* Agent详情页，元关键词应从agent的类别和特性中派生
**验证: 需求 7.3**

属性 26: 服务端渲染
*对于任意* 页面请求，初始HTML响应应包含完整的页面内容（而不仅仅是加载外壳）
**验证: 需求 7.5**

### AI搜索统计属性

属性 27: 聚合计数显示
*For any* Agent card, the displayed search count SHALL equal the sum of all AI Search Engine counts for that agent
**Validates: Requirements 8.1**

属性 28: 详细细分显示
*对于任意* Agent详情页，统计部分应显示每个访问过的AI搜索引擎的单独计数
**验证: 需求 8.2**

属性 29: 机器人检测和增量
*对于任意* AI机器人访问Agent详情页，系统应检测机器人类型并增加相应的计数器
**验证: 需求 8.3**

属性 30: 立即持久化
*对于任意* 搜索计数更新，更改应在发送响应之前持久化到数据库
**验证: 需求 8.4**

属性 31: 数字格式化
*对于任意* 显示的大于999的计数，数字应使用适当的分隔符格式化（例如，1,000或1K）
**验证: 需求 8.5**

### 图片优化属性

属性 32: Next.js Image使用
*For any* image element in the application, it SHALL use the Next.js Image component with lazy loading enabled
**Validates: Requirements 9.2**

属性 33: 缓存实现
*对于任意* Supabase数据获取，响应应包含带有重新验证间隔的适当缓存头
**验证: 需求 9.3**

### 移动端响应式属性

属性 34: 移动端布局优化
*For any* page accessed with a viewport width less than 768px, the layout SHALL render in mobile-optimized format
**Validates: Requirements 10.1**

属性 35: 触摸目标尺寸
*对于任意* 交互元素（按钮、链接），触摸目标应至少为44x44像素
**验证: 需求 10.2**

属性 36: 移动端输入类型
*对于任意* 移动端表单输入，输入类型属性应适当设置（url、email、tel等）以触发正确的移动键盘
**验证: 需求 10.3**

属性 37: 移动端网格布局
*对于任意* 移动端（视口 < 768px）的Agent市场视图，网格应以单列显示卡片
**验证: 需求 10.4**

## Error Handling


### 错误分类

**1. 用户输入错误**
- 无效的URL格式
- 空表单提交
- 不可访问的URL

**处理策略**:
- 客户端验证 (实时反馈)
- 服务端二次验证
- 友好的错误提示信息
- 保留用户输入数据

**2. 网络和爬虫错误**
- URL无法访问 (404, 500等)
- 超时错误
- 反爬虫机制阻止
- SSL证书问题

**处理策略**:
```typescript
try {
  const page = await browser.newPage()
  await page.goto(url, { 
    timeout: 30000,
    waitUntil: 'networkidle' 
  })
} catch (error) {
  if (error.name === 'TimeoutError') {
    return { success: false, error: '页面加载超时，请检查URL是否正确' }
  }
  if (error.message.includes('net::ERR_NAME_NOT_RESOLVED')) {
    return { success: false, error: '无法访问该URL，请检查网址是否正确' }
  }
  return { success: false, error: '抓取页面时发生错误，请稍后重试' }
}
```

**3. AI分析错误**
- API调用失败
- 速率限制
- 响应格式错误
- 内容解析失败

**处理策略**:
```typescript
async function analyzeWithRetry(content: string, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      const response = await openai.chat.completions.create({
        model: 'qwen/qwen-2.5-72b-instruct',
        messages: [/* ... */],
        timeout: 60000
      })
      
      return parseAIResponse(response)
    } catch (error) {
      if (i === maxRetries - 1) throw error
      
      // 指数退避
      await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, i)))
    }
  }
}
```

**4. 数据库错误**
- 连接失败
- 写入冲突
- 查询超时
- 权限问题

**处理策略**:
```typescript
try {
  const { data, error } = await supabaseAdmin
    .from('agents')
    .insert(agentData)
    .select()
    .single()
  
  if (error) {
    if (error.code === '23505') {
      // 唯一约束冲突
      return { success: false, error: '该Agent已存在' }
    }
    throw error
  }
  
  return { success: true, data }
} catch (error) {
  console.error('Database error:', error)
  return { success: false, error: '保存数据时发生错误' }
}
```

**5. 页面渲染错误**
- 数据不存在 (404)
- 数据格式异常
- 组件渲染失败

**处理策略**:
- 使用Next.js的notFound()函数
- 实现error.tsx边界组件
- 提供降级UI
- 记录错误日志

```typescript
// app/agents/[slug]/page.tsx
export default async function AgentDetailPage({ params }) {
  const agent = await getAgent(params.slug)
  
  if (!agent) {
    notFound()  // 触发404页面
  }
  
  return <AgentDetail agent={agent} />
}

// app/agents/[slug]/not-found.tsx
export default function NotFound() {
  return (
    <div className="container mx-auto px-4 py-16 text-center">
      <h1 className="text-4xl font-bold mb-4">Agent未找到</h1>
      <p className="text-gray-600 mb-8">抱歉，您访问的Agent不存在或已被删除</p>
      <Link href="/agents" className="btn-primary">
        返回Agent市场
      </Link>
    </div>
  )
}
```

### 错误监控和日志

**日志策略**:
```typescript
// lib/logger.ts
export const logger = {
  error: (context: string, error: Error, metadata?: any) => {
    console.error(`[ERROR] ${context}:`, {
      message: error.message,
      stack: error.stack,
      metadata,
      timestamp: new Date().toISOString()
    })
    
    // 生产环境可集成Sentry或其他监控服务
    if (process.env.NODE_ENV === 'production') {
      // sendToMonitoring(error, metadata)
    }
  },
  
  warn: (context: string, message: string, metadata?: any) => {
    console.warn(`[WARN] ${context}:`, message, metadata)
  },
  
  info: (context: string, message: string, metadata?: any) => {
    console.log(`[INFO] ${context}:`, message, metadata)
  }
}
```

### 用户反馈机制

**Toast通知组件**:
```typescript
// components/toast.tsx
interface ToastProps {
  type: 'success' | 'error' | 'warning' | 'info'
  message: string
  duration?: number
}

export function useToast() {
  const [toasts, setToasts] = useState<ToastProps[]>([])
  
  const showToast = (toast: ToastProps) => {
    const id = Date.now()
    setToasts(prev => [...prev, { ...toast, id }])
    
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id))
    }, toast.duration || 5000)
  }
  
  return { toasts, showToast }
}
```

## Testing Strategy

### 测试方法论

本项目采用**双重测试策略**，结合单元测试和基于属性的测试（Property-Based Testing, PBT），以确保代码的正确性和健壮性。

- **单元测试**：验证特定示例、边缘情况和错误条件
- **属性测试**：验证应在所有输入中保持的通用属性
- 两者互补：单元测试捕获具体错误，属性测试验证通用正确性

### 测试框架选择

**单元测试框架**: Vitest
- 与Next.js和TypeScript无缝集成
- 快速执行
- 兼容Jest API
- 内置代码覆盖率

**属性测试框架**: fast-check
- TypeScript原生支持
- 丰富的生成器库
- 可配置的测试迭代次数
- 良好的错误报告

**安装**:
```bash
npm install -D vitest @vitest/ui fast-check
```

**配置** (`vitest.config.ts`):
```typescript
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./test/setup.ts']
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './')
    }
  }
})
```

### 单元测试策略

**测试组织**:
- 测试文件与源文件同目录，使用 `.test.ts` 或 `.test.tsx` 后缀
- 每个组件/函数一个测试文件
- 使用描述性的测试名称

**测试覆盖范围**:

1. **组件测试**
   - 渲染测试（组件正常渲染）
   - Props测试（不同props下的行为）
   - 交互测试（用户操作响应）
   - 边缘情况（空数据、错误状态）

2. **工具函数测试**
   - 正常输入输出
   - 边界值
   - 错误输入处理
   - 类型安全

3. **API路由测试**
   - 成功响应
   - 错误处理
   - 验证逻辑
   - 权限检查

**示例单元测试**:
```typescript
// components/agent-card.test.tsx
import { render, screen } from '@testing-library/react'
import { AgentCard } from './agent-card'

describe('AgentCard', () => {
  const mockAgent = {
    id: '1',
    slug: 'test-agent',
    name: 'Test Agent',
    short_description: 'A test agent',
    ai_search_count: 42,
    platform: 'Web',
    pricing: 'Free'
  }
  
  it('renders agent name and description', () => {
    render(<AgentCard agent={mockAgent} />)
    expect(screen.getByText('Test Agent')).toBeInTheDocument()
    expect(screen.getByText('A test agent')).toBeInTheDocument()
  })
  
  it('displays AI search count when showAIStats is true', () => {
    render(<AgentCard agent={mockAgent} showAIStats={true} />)
    expect(screen.getByText(/42/)).toBeInTheDocument()
  })
  
  it('handles missing optional fields gracefully', () => {
    const agentWithoutPricing = { ...mockAgent, pricing: null }
    render(<AgentCard agent={agentWithoutPricing} />)
    expect(screen.queryByText('Free')).not.toBeInTheDocument()
  })
})
```

### 属性测试策略

**配置要求**:
- 每个属性测试至少运行 **100次迭代**
- 使用 `fc.assert` 进行断言
- 每个测试必须标注对应的设计文档属性

**标注格式**:
```typescript
/**
 * Feature: agent-brand-showcase, Property 14: URL format validation
 * Validates: Requirements 5.2
 */
```

**生成器设计原则**:
- 生成器应智能约束输入空间
- 避免生成无意义的测试数据
- 使用组合生成器构建复杂对象
- 考虑边界值和特殊情况

**示例属性测试**:
```typescript
// lib/url-analyzer.test.ts
import fc from 'fast-check'
import { validateURL } from './url-analyzer'

/**
 * Feature: agent-brand-showcase, Property 14: URL format validation
 * Validates: Requirements 5.2
 */
describe('URL Validation Property Tests', () => {
  it('should accept all valid URLs', () => {
    fc.assert(
      fc.property(
        fc.webUrl(),  // fast-check内置的URL生成器
        (url) => {
          const result = validateURL(url)
          expect(result.isValid).toBe(true)
        }
      ),
      { numRuns: 100 }
    )
  })
  
  it('should reject invalid URL formats', () => {
    const invalidURLGenerator = fc.oneof(
      fc.constant('not a url'),
      fc.constant('htp://wrong-protocol.com'),
      fc.constant('://missing-protocol.com'),
      fc.string().filter(s => !s.includes('://'))
    )
    
    fc.assert(
      fc.property(
        invalidURLGenerator,
        (invalidUrl) => {
          const result = validateURL(invalidUrl)
          expect(result.isValid).toBe(false)
        }
      ),
      { numRuns: 100 }
    )
  })
})

/**
 * Feature: agent-brand-showcase, Property 16: Information extraction completeness
 * Validates: Requirements 5.4
 */
describe('Agent Data Extraction Property Tests', () => {
  it('should always extract minimum required fields', () => {
    const htmlGenerator = fc.record({
      title: fc.string({ minLength: 1 }),
      description: fc.string({ minLength: 10 }),
      features: fc.array(fc.string(), { minLength: 1, maxLength: 10 })
    })
    
    fc.assert(
      fc.property(
        htmlGenerator,
        async (mockHTML) => {
          const result = await extractAgentInfo(mockHTML)
          
          expect(result).toHaveProperty('name')
          expect(result).toHaveProperty('description')
          expect(result).toHaveProperty('features')
          expect(result.name).toBeTruthy()
          expect(result.description).toBeTruthy()
          expect(result.features.length).toBeGreaterThan(0)
        }
      ),
      { numRuns: 100 }
    )
  })
})

/**
 * Feature: agent-brand-showcase, Property 7: Agent sorting
 * Validates: Requirements 3.1
 */
describe('Agent Sorting Property Tests', () => {
  it('should maintain descending order for any sort criterion', () => {
    const agentArrayGenerator = fc.array(
      fc.record({
        id: fc.uuid(),
        name: fc.string(),
        ai_search_count: fc.nat(10000),
        created_at: fc.date()
      }),
      { minLength: 2, maxLength: 50 }
    )
    
    fc.assert(
      fc.property(
        agentArrayGenerator,
        fc.constantFrom('ai_search_count', 'created_at'),
        (agents, sortBy) => {
          const sorted = sortAgents(agents, sortBy)
          
          // 验证降序排列
          for (let i = 0; i < sorted.length - 1; i++) {
            expect(sorted[i][sortBy]).toBeGreaterThanOrEqual(sorted[i + 1][sortBy])
          }
        }
      ),
      { numRuns: 100 }
    )
  })
})
```

### 集成测试

**测试范围**:
- API端点的完整流程
- 数据库交互
- 爬虫和AI分析管道
- 用户提交到展示的完整流程

**示例**:
```typescript
// app/api/submit-agent/route.test.ts
describe('Submit Agent API Integration', () => {
  it('should process valid submission end-to-end', async () => {
    const submission = {
      agent_url: 'https://example.com/agent',
      user_email: 'test@example.com'
    }
    
    const response = await fetch('/api/submit-agent', {
      method: 'POST',
      body: JSON.stringify(submission)
    })
    
    expect(response.status).toBe(200)
    
    const data = await response.json()
    expect(data.success).toBe(true)
    expect(data.agentId).toBeDefined()
    
    // 验证数据库中存在该记录
    const agent = await supabaseAdmin
      .from('agents')
      .select()
      .eq('id', data.agentId)
      .single()
    
    expect(agent.data).toBeDefined()
  })
})
```

### 测试执行

**命令**:
```bash
# 运行所有测试
npm run test

# 运行测试并生成覆盖率报告
npm run test:coverage

# 监视模式
npm run test:watch

# 运行特定测试文件
npm run test url-analyzer.test.ts
```

**CI/CD集成**:
- 在GitHub Actions中自动运行测试
- PR必须通过所有测试才能合并
- 覆盖率阈值：80%

### 测试最佳实践

1. **测试隔离**：每个测试独立，不依赖其他测试
2. **清理资源**：使用afterEach清理测试数据
3. **Mock外部依赖**：数据库、API调用等使用mock
4. **描述性命名**：测试名称清晰描述测试内容
5. **AAA模式**：Arrange（准备）、Act（执行）、Assert（断言）
6. **避免过度测试**：专注于核心逻辑和边缘情况
7. **属性优先**：优先使用属性测试验证通用规则

## Implementation Notes

### 开发顺序

**Phase 1: 基础设施** (1-2天)
1. 设置测试框架 (Vitest + fast-check)
2. 创建基础组件库 (按钮、卡片、表单)
3. 设置样式系统 (Tailwind配置、主题变量)

**Phase 2: 主页和导航** (2-3天)
1. 增强Hero Section (渐变、动画、响应式)
2. 实现Mode Switcher组件
3. 更新路由结构
4. 编写单元测试和属性测试

**Phase 3: Agent市场增强** (3-4天)
1. 重构Agent Card组件 (添加AI统计)
2. 实现Agent Market Grid (排序、筛选)
3. 添加加载状态和骨架屏
4. 编写属性测试验证排序和筛选

**Phase 4: Agent详情页优化** (2-3天)
1. 增强SEO/GEO (meta标签、JSON-LD)
2. 添加AI Search Stats组件
3. 改进页面布局和视觉设计
4. 编写属性测试验证SEO元素

**Phase 5: 发布功能** (4-5天)
1. 创建Publish Agent Form组件
2. 实现URL Analyzer服务
3. 创建API端点 (/api/submit-agent)
4. 集成爬虫和AI分析
5. 编写完整的集成测试

**Phase 6: 测试和优化** (2-3天)
1. 运行完整测试套件
2. 性能优化 (图片、缓存、代码分割)
3. 移动端测试和调整
4. SEO审计和改进

### 性能优化策略

**1. 图片优化**
```typescript
// 使用Next.js Image组件
import Image from 'next/image'

<Image
  src={agent.logo_url}
  alt={agent.name}
  width={200}
  height={200}
  loading="lazy"
  placeholder="blur"
  blurDataURL="data:image/jpeg;base64,..."
/>
```

**2. 代码分割**
```typescript
// 动态导入重型组件
import dynamic from 'next/dynamic'

const AISearchChart = dynamic(() => import('@/components/ai-search-chart'), {
  loading: () => <ChartSkeleton />,
  ssr: false  // 仅客户端渲染
})
```

**3. 数据缓存**
```typescript
// ISR配置
export const revalidate = 3600  // 1小时

// 数据库查询缓存
const agents = await supabaseAdmin
  .from('agents')
  .select('*')
  .order('ai_search_count', { ascending: false })
  .limit(20)

// Next.js自动缓存fetch请求
```

**4. 渐进式加载**
```typescript
// 使用Intersection Observer实现无限滚动
const { ref, inView } = useInView({
  threshold: 0.5,
  triggerOnce: false
})

useEffect(() => {
  if (inView && hasMore) {
    loadMoreAgents()
  }
}, [inView])
```

### 安全考虑

**1. URL验证和清理**
```typescript
function sanitizeURL(url: string): string {
  try {
    const parsed = new URL(url)
    
    // 只允许http和https协议
    if (!['http:', 'https:'].includes(parsed.protocol)) {
      throw new Error('Invalid protocol')
    }
    
    return parsed.toString()
  } catch {
    throw new Error('Invalid URL')
  }
}
```

**2. 内容安全策略 (CSP)**
```typescript
// next.config.js
const securityHeaders = [
  {
    key: 'Content-Security-Policy',
    value: `
      default-src 'self';
      script-src 'self' 'unsafe-eval' 'unsafe-inline';
      style-src 'self' 'unsafe-inline';
      img-src 'self' data: https:;
      font-src 'self' data:;
    `.replace(/\s{2,}/g, ' ').trim()
  }
]
```

**3. 速率限制**
```typescript
// lib/rate-limiter.ts
import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, '1 h'),  // 每小时10次
})

export async function checkRateLimit(identifier: string) {
  const { success, limit, reset, remaining } = await ratelimit.limit(identifier)
  
  return { success, limit, reset, remaining }
}
```

**4. 输入验证**
```typescript
import { z } from 'zod'

const AgentSubmissionSchema = z.object({
  agent_url: z.string().url().max(500),
  user_email: z.string().email().optional(),
  additional_notes: z.string().max(1000).optional()
})

export function validateSubmission(data: unknown) {
  return AgentSubmissionSchema.safeParse(data)
}
```

### 可访问性 (A11y)

**1. 语义化HTML**
```tsx
<nav aria-label="主导航">
  <ul role="list">
    <li><a href="/agents">Agent市场</a></li>
    <li><a href="/publish">发布Agent</a></li>
  </ul>
</nav>
```

**2. ARIA标签**
```tsx
<button
  aria-label="切换到Agent市场视图"
  aria-pressed={mode === 'market'}
  onClick={() => setMode('market')}
>
  Agent市场
</button>
```

**3. 键盘导航**
```tsx
function AgentCard({ agent }) {
  return (
    <Link
      href={`/agents/${agent.slug}`}
      className="focus:ring-2 focus:ring-blue-500 focus:outline-none"
      tabIndex={0}
    >
      {/* 卡片内容 */}
    </Link>
  )
}
```

**4. 颜色对比度**
- 确保文字和背景的对比度至少为4.5:1
- 使用工具验证：WebAIM Contrast Checker
- 提供高对比度模式选项

### 监控和分析

**1. 性能监控**
```typescript
// lib/analytics.ts
export function trackPageView(url: string) {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('config', 'GA_MEASUREMENT_ID', {
      page_path: url,
    })
  }
}

export function trackEvent(action: string, category: string, label?: string) {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', action, {
      event_category: category,
      event_label: label,
    })
  }
}
```

**2. 错误追踪**
```typescript
// 集成Sentry (可选)
import * as Sentry from '@sentry/nextjs'

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 0.1,
})
```

**3. 用户行为分析**
- 追踪Agent卡片点击率
- 监控提交表单转化率
- 分析AI搜索来源分布
- 记录页面加载时间

### 部署清单

**部署前检查**:
- [ ] 所有测试通过 (单元测试 + 属性测试)
- [ ] 代码覆盖率 ≥ 80%
- [ ] 性能审计通过 (Lighthouse score ≥ 90)
- [ ] SEO审计通过
- [ ] 移动端测试通过
- [ ] 可访问性测试通过 (WCAG 2.1 AA)
- [ ] 环境变量配置正确
- [ ] 数据库迁移已应用
- [ ] Sitemap已生成
- [ ] robots.txt已配置

**Vercel部署配置**:
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": ".next",
  "installCommand": "npm install",
  "framework": "nextjs",
  "env": {
    "NEXT_PUBLIC_SUPABASE_URL": "@supabase-url",
    "NEXT_PUBLIC_SUPABASE_ANON_KEY": "@supabase-anon-key",
    "SUPABASE_SERVICE_ROLE_KEY": "@supabase-service-key",
    "OPENAI_API_KEY": "@openai-api-key"
  }
}
```

## Future Enhancements

### 短期改进 (1-3个月)

1. **用户认证和个人化**
   - 用户登录/注册
   - 收藏Agent功能
   - 个人化推荐

2. **高级搜索和筛选**
   - 全文搜索
   - 多维度筛选 (价格、平台、功能)
   - 保存搜索条件

3. **社区功能**
   - 用户评论和评分
   - Agent使用心得分享
   - 问答社区

4. **数据可视化增强**
   - AI搜索趋势图表
   - Agent对比工具
   - 分类热度地图

### 中期改进 (3-6个月)

1. **API开放平台**
   - RESTful API
   - GraphQL端点
   - API密钥管理
   - 使用配额和计费

2. **高级分析**
   - Agent性能指标
   - 用户行为分析
   - 市场趋势报告
   - 竞品分析

3. **内容管理系统**
   - 管理员后台
   - 内容审核工具
   - 批量操作
   - 数据导入/导出

4. **国际化**
   - 多语言支持
   - 地区化内容
   - 货币转换

### 长期愿景 (6-12个月)

1. **AI助手集成**
   - 智能推荐引擎
   - 对话式搜索
   - 自动化内容生成
   - 个性化学习路径

2. **生态系统建设**
   - Agent开发者平台
   - SDK和工具包
   - 插件市场
   - 合作伙伴计划

3. **企业功能**
   - 团队协作
   - 私有Agent库
   - 企业级支持
   - 定制化部署

4. **移动应用**
   - iOS/Android原生应用
   - 离线功能
   - 推送通知
   - 移动优化体验

---

**文档版本**: 1.0  
**最后更新**: 2025-11-26  
**维护者**: 开发团队
