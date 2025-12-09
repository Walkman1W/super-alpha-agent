# 设计文档: 品牌内容与用户体验升级

## 概述

本设计文档描述 Agent Signals 平台的品牌内容和用户体验升级方案。主要包括：
1. 新增 About 和 Blog 内容页面，展示 L1-L5 分级标准和 GEO 评分算法
2. 重新设计页眉页脚，体现独角兽企业科技感
3. 优化卡片交互逻辑，改善用户浏览体验
4. 修改搜索框图标为终端风格
5. 实现详情页的 AI Bot 专属访问策略

## 架构

```
┌─────────────────────────────────────────────────────────────┐
│                        应用布局                              │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────────┐   │
│  │                    页眉 (Header)                     │   │
│  │  Logo | Agents | About | Blog | Publish | GitHub    │   │
│  └─────────────────────────────────────────────────────┘   │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐ │
│  │   /about    │  │   /blog     │  │    / (首页)          │ │
│  │  L1-L5 文章  │  │  GEO 文章   │  │  终端网格 +          │ │
│  │             │  │             │  │  Inspector 抽屉      │ │
│  └─────────────┘  └─────────────┘  └─────────────────────┘ │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │              /agents/[slug] (仅 AI Bot)              │   │
│  │  人类用户 → 重定向到首页并打开抽屉                      │   │
│  │  Bot → 完整页面 + JSON-LD                            │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────────┐   │
│  │                    页脚 (Footer)                     │   │
│  │  品牌 | About | Blog | Publish | 技术栈              │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

## 组件与接口

### 1. Header 组件 (重构)

```typescript
// components/terminal/header.tsx
interface HeaderProps {
  currentPath?: string
}

// 导航项配置
const navItems = [
  { label: 'Agents', href: '/#agents' },
  { label: 'About', href: '/about' },
  { label: 'Blog', href: '/blog' },
  { label: 'Publish', href: '/publish', highlight: true },
  { label: 'GitHub', href: 'https://github.com/...', external: true }
]
```

### 2. Footer 组件 (重构)

```typescript
// components/terminal/footer.tsx
interface FooterProps {}

// 链接分组
const footerLinks = {
  product: ['Agents', 'About', 'Blog', 'Publish'],
  resources: ['GitHub', 'API Docs', 'Status'],
  legal: ['Privacy', 'Terms']
}
```

### 3. Tooltip 组件 (新增)

```typescript
// components/ui/tooltip.tsx
interface TooltipProps {
  content: string | React.ReactNode
  children: React.ReactNode
  position?: 'top' | 'bottom' | 'left' | 'right'
}

// 预定义 Tooltip 内容
const autonomyTooltips: Record<string, { label: string; description: string; reference: string }> = {
  L1: { label: '辅助型', description: 'AI 作为工具，由人类提示触发', reference: 'SAE L1' },
  L2: { label: '副驾驶型', description: 'AI 提供建议，人类拥有最终决定权', reference: 'Microsoft Copilot Stack' },
  L3: { label: '链式工作流', description: 'AI 执行线性多步骤工作流', reference: 'LangChain Chains' },
  L4: { label: '自主闭环', description: 'AI 自我纠错并处理非线性任务', reference: 'SAE L4' },
  L5: { label: '蜂群/组织级', description: '多智能体协作，具备组织架构', reference: 'OpenAI Multi-Agent' }
}

const geoTooltip = {
  title: 'GEO 评分',
  description: '基于普林斯顿 GEO 研究的生成式引擎优化评分',
  formula: '基础分(50) + 生命力(20) + 影响力(10) + 元数据(10) + 自主性(0-10)'
}
```

### 4. Omnibar 组件 (修改)

```typescript
// components/terminal/omnibar.tsx
// 将 Search 图标替换为终端提示符 ">_"
```

### 5. SignalCard 组件 (修改)

```typescript
// components/terminal/signal-card.tsx
interface SignalCardProps {
  agent: SignalAgent
  onTitleClick?: (agent: SignalAgent) => void  // 新增：标题点击
  onCardClick?: (agent: SignalAgent) => void   // 修改：卡片点击打开抽屉
  isSelected?: boolean                          // 新增：选中状态
}
```

### 6. InspectorDrawer 组件 (修改)

```typescript
// components/terminal/inspector-drawer.tsx
// 移除 "Full Details" 链接
// 添加 "Publish Agent" 按钮
```

### 7. About 页面 (新增)

```typescript
// app/about/page.tsx
// 展示 L1-L5 分级框架文章
```

### 8. Blog 页面 (新增)

```typescript
// app/blog/page.tsx
// 展示 GEO 评分算法文章
```

### 9. User Agent 检测 (新增/增强)

```typescript
// lib/ai-detector.ts (增强)
function isAIBot(userAgent: string): boolean
function shouldRedirectToHome(userAgent: string): boolean
```

## 数据模型

### Tooltip 内容模型

```typescript
interface TooltipContent {
  title: string
  description: string
  reference?: string
  formula?: string
}

interface AutonomyLevel {
  level: 'L1' | 'L2' | 'L3' | 'L4' | 'L5'
  label: string
  description: string
  industryRef: string
  examples: string[]
}
```

### 文章内容模型

```typescript
interface ArticleSection {
  id: string
  title: string
  content: string
  subsections?: ArticleSection[]
}

interface Article {
  slug: string
  title: string
  subtitle?: string
  sections: ArticleSection[]
  citations: Citation[]
}

interface Citation {
  id: string
  source: string
  url?: string
  date?: string
}
```

## 正确性属性

*属性是指在系统所有有效执行中都应保持为真的特征或行为——本质上是关于系统应该做什么的形式化陈述。属性是人类可读规范与机器可验证正确性保证之间的桥梁。*

### 属性 1: 自主等级 Tooltip 一致性

*对于任意*自主等级 (L1-L5)，Tooltip 内容应包含有效的标签、描述和行业参考，且与预定义的自主等级定义匹配。

**验证: 需求 1.4**

### 属性 2: 卡片标题外部链接

*对于任意*具有有效 official_url 的 Agent 卡片，点击标题应产生一个带有 `target="_blank"` 和 `rel="noopener noreferrer"` 属性的锚元素，指向官方 URL。

**验证: 需求 5.1**

### 属性 3: 卡片点击不导航到详情页

*对于任意*卡片主体的点击事件，系统不应触发到 `/agents/[slug]` 路由的导航。

**验证: 需求 5.5**

### 属性 4: 基于 User Agent 的路由

*对于任意*到 `/agents/[slug]` 的请求，如果 User-Agent 匹配已知的 AI Bot 模式，系统应提供完整页面；否则，系统应重定向到首页。

**验证: 需求 6.1, 6.2, 6.3**

## 错误处理

### 导航错误
- 如果 About/Blog 页面内容加载失败，显示带有重试选项的回退消息
- 如果 Agent 的 official_url 无效或缺失，禁用标题链接并显示解释不可用的工具提示

### Tooltip 错误
- 如果某个自主等级的 Tooltip 内容未定义，回退到通用描述
- 确保 Tooltip 定位不会溢出视口边界

### 重定向错误
- 如果重定向到首页失败，作为回退提供详情页
- 记录重定向失败以便监控

## 测试策略

### 单元测试
- 测试 Tooltip 组件为每个自主等级渲染正确内容
- 测试 Header 组件渲染所有导航链接
- 测试 Footer 组件渲染所有必需部分
- 测试 Omnibar 显示终端提示符

### 属性测试

使用 **fast-check** 库进行属性测试。

**测试配置:**
- 最小迭代次数: 100
- 启用收缩以发现反例

**属性测试:**

1. **自主等级 Tooltip 属性测试**
   - 生成随机自主等级 (L1-L5)
   - 验证 Tooltip 内容始终有效且完整
   - **功能: brand-content-ux-upgrade, 属性 1: 自主等级 Tooltip 一致性**

2. **卡片标题链接属性测试**
   - 生成具有各种 official_url 值的随机 Agent 数据
   - 验证标题链接属性设置正确
   - **功能: brand-content-ux-upgrade, 属性 2: 卡片标题外部链接**

3. **User Agent 路由属性测试**
   - 生成随机 User Agent 字符串（Bot 和人类模式）
   - 验证路由决策符合预期行为
   - **功能: brand-content-ux-upgrade, 属性 4: 基于 User Agent 的路由**

### 集成测试
- 测试完整页面导航流程: 首页 → About → Blog → Publish
- 测试卡片交互: 点击标题 → 新标签页，点击主体 → 抽屉打开
- 测试抽屉切换: 点击同一卡片 → 抽屉关闭
