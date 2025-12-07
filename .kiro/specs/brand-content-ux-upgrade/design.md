# Design Document: Brand Content & UX Upgrade

## Overview

本设计文档描述 Agent Signals 平台的品牌内容和用户体验升级方案。主要包括：
1. 新增 About 和 Blog 内容页面，展示 L1-L5 分级标准和 GEO 评分算法
2. 重新设计页眉页脚，体现独角兽企业科技感
3. 优化卡片交互逻辑，改善用户浏览体验
4. 修改搜索框图标为终端风格
5. 实现详情页的 AI Bot 专属访问策略

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        App Layout                           │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────────┐   │
│  │                    Header                            │   │
│  │  Logo | Agents | About | Blog | Publish | GitHub    │   │
│  └─────────────────────────────────────────────────────┘   │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐ │
│  │   /about    │  │   /blog     │  │    / (Homepage)     │ │
│  │  L1-L5 文章  │  │  GEO 文章   │  │  Terminal Grid +    │ │
│  │             │  │             │  │  Inspector Drawer   │ │
│  └─────────────┘  └─────────────┘  └─────────────────────┘ │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │              /agents/[slug] (AI Bot Only)           │   │
│  │  Human → Redirect to / with drawer open             │   │
│  │  Bot → Full page with JSON-LD                       │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────────┐   │
│  │                    Footer                            │   │
│  │  Brand | About | Blog | Publish | Tech Stack        │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

## Components and Interfaces

### 1. Header Component (重构)

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

### 2. Footer Component (重构)

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

### 3. Tooltip Component (新增)

```typescript
// components/ui/tooltip.tsx
interface TooltipProps {
  content: string | React.ReactNode
  children: React.ReactNode
  position?: 'top' | 'bottom' | 'left' | 'right'
}

// 预定义 Tooltip 内容
const autonomyTooltips: Record<string, { label: string; description: string; reference: string }> = {
  L1: { label: 'Assisted', description: 'AI as tool, triggered by human prompts', reference: 'SAE L1' },
  L2: { label: 'Copilot', description: 'AI provides suggestions, human has final say', reference: 'Microsoft Copilot Stack' },
  L3: { label: 'Chained', description: 'AI executes linear multi-step workflows', reference: 'LangChain Chains' },
  L4: { label: 'Autonomous', description: 'AI self-corrects and handles non-linear tasks', reference: 'SAE L4' },
  L5: { label: 'Swarm', description: 'Multi-agent collaboration with org structure', reference: 'OpenAI Multi-Agent' }
}

const geoTooltip = {
  title: 'GEO Score',
  description: 'Generative Engine Optimization score based on Princeton GEO research',
  formula: 'Base(50) + Vitality(20) + Influence(10) + Metadata(10) + Autonomy(0-10)'
}
```

### 4. Omnibar Component (修改)

```typescript
// components/terminal/omnibar.tsx
// 将 Search icon 替换为终端提示符 ">_"
```

### 5. SignalCard Component (修改)

```typescript
// components/terminal/signal-card.tsx
interface SignalCardProps {
  agent: SignalAgent
  onTitleClick?: (agent: SignalAgent) => void  // 新增：标题点击
  onCardClick?: (agent: SignalAgent) => void   // 修改：卡片点击打开抽屉
  isSelected?: boolean                          // 新增：选中状态
}
```

### 6. InspectorDrawer Component (修改)

```typescript
// components/terminal/inspector-drawer.tsx
// 移除 "Full Details" 链接
// 添加 "Publish Agent" 按钮
```

### 7. About Page (新增)

```typescript
// app/about/page.tsx
// 展示 L1-L5 分级框架文章
```

### 8. Blog Page (新增)

```typescript
// app/blog/page.tsx
// 展示 GEO 评分算法文章
```

### 9. User Agent Detection (新增/增强)

```typescript
// lib/ai-detector.ts (增强)
function isAIBot(userAgent: string): boolean
function shouldRedirectToHome(userAgent: string): boolean
```

## Data Models

### Tooltip Content Model

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

### Article Content Model

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

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Autonomy Level Tooltip Consistency

*For any* autonomy level (L1-L5), the tooltip content SHALL include a valid label, description, and industry reference that matches the predefined autonomy level definitions.

**Validates: Requirements 1.4**

### Property 2: Card Title External Link

*For any* agent card with a valid official_url, clicking the title SHALL result in an anchor element with `target="_blank"` and `rel="noopener noreferrer"` attributes pointing to the official URL.

**Validates: Requirements 5.1**

### Property 3: Card Click Does Not Navigate to Detail Page

*For any* agent card click event on the card body, the system SHALL NOT trigger navigation to `/agents/[slug]` route.

**Validates: Requirements 5.5**

### Property 4: User Agent Based Routing

*For any* request to `/agents/[slug]`, if the User-Agent matches known AI bot patterns, the system SHALL serve the full page; otherwise, the system SHALL redirect to the homepage.

**Validates: Requirements 6.1, 6.2, 6.3**

## Error Handling

### Navigation Errors
- If About/Blog page content fails to load, display a fallback message with retry option
- If agent official_url is invalid or missing, disable the title link and show tooltip explaining unavailability

### Tooltip Errors
- If tooltip content is undefined for an autonomy level, fall back to generic description
- Ensure tooltip positioning doesn't overflow viewport boundaries

### Redirect Errors
- If redirect to homepage fails, serve the detail page as fallback
- Log redirect failures for monitoring

## Testing Strategy

### Unit Testing
- Test Tooltip component renders correct content for each autonomy level
- Test Header component renders all navigation links
- Test Footer component renders all required sections
- Test Omnibar displays terminal prompt symbol

### Property-Based Testing

使用 **fast-check** 库进行属性测试。

**Test Configuration:**
- Minimum iterations: 100
- Shrinking enabled for counterexample discovery

**Property Tests:**

1. **Autonomy Tooltip Property Test**
   - Generate random autonomy levels (L1-L5)
   - Verify tooltip content is always valid and complete
   - **Feature: brand-content-ux-upgrade, Property 1: Autonomy Level Tooltip Consistency**

2. **Card Title Link Property Test**
   - Generate random agent data with various official_url values
   - Verify title link attributes are correctly set
   - **Feature: brand-content-ux-upgrade, Property 2: Card Title External Link**

3. **User Agent Routing Property Test**
   - Generate random user agent strings (both bot and human patterns)
   - Verify routing decision matches expected behavior
   - **Feature: brand-content-ux-upgrade, Property 4: User Agent Based Routing**

### Integration Testing
- Test full page navigation flow: Home → About → Blog → Publish
- Test card interaction: click title → new tab, click body → drawer opens
- Test drawer toggle: click same card → drawer closes
