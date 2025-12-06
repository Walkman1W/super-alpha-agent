# Requirements Document

## Introduction

本规范定义了 Agent Signals 平台的 UI 重构需求，将现有的"App Store"风格界面升级为"Bloomberg Terminal"风格的高密度数据终端界面。新设计采用深色主题、等宽字体、紧凑布局，专为开发者、AI 机器人和投资者优化。

核心设计理念：
- **Dark Mode Only**: 背景色 `#050505` (Zinc 950)
- **Monospace**: 数字、ID、标签使用 `JetBrains Mono` 或 `Geist Mono`
- **High Density**: 小间距、可见边框 (`1px solid #333`)、紧凑网格
- **Visual Metaphor**: 雷达站 - 在噪音中检测信号 (agents)

## Glossary

- **Signal**: Agent 在系统中的表示，包含状态、指标和元数据
- **Signal Card**: 展示单个 Agent 信息的卡片组件
- **GEO Score**: 基于活跃度、影响力、元数据完整度和自主等级计算的 0-100 评分
- **Entity Type**: Agent 的交付形态 - `repo` (代码仓库)、`saas` (网页服务)、`app` (本地应用)
- **Autonomy Level**: Agent 自主程度分级 L1-L5
- **Terminal Grid**: 首页的高密度卡片网格布局
- **Omnibar**: 终端风格的全局搜索输入框
- **Sidebar**: 左侧筛选面板，包含框架、约束条件等过滤器
- **Inspector**: Agent 详情页的模态/抽屉组件

## Requirements

### Requirement 1: 全局主题系统

**User Story:** As a developer, I want a consistent dark terminal theme across all pages, so that the platform feels professional and data-focused.

#### Acceptance Criteria

1. WHEN the application loads THEN the System SHALL apply Zinc-950 (#050505) as the global background color
2. WHEN displaying numeric data, IDs, or tags THEN the System SHALL render them using JetBrains Mono or Geist Mono font
3. WHEN rendering card borders THEN the System SHALL use 1px solid border with Zinc-800 (#27272a) color
4. WHEN a user hovers over interactive elements THEN the System SHALL provide subtle visual feedback without disrupting the dark aesthetic
5. WHEN rendering text content THEN the System SHALL use Zinc-100 (#f4f4f5) for primary text and Zinc-400 (#a1a1aa) for secondary text

### Requirement 2: Hero Section (Terminal Header)

**User Story:** As a visitor, I want to see a compelling hero section with live system status, so that I understand the platform's purpose and current state.

#### Acceptance Criteria

1. WHEN the hero section renders THEN the System SHALL display the headline "Index the Intelligence Economy."
2. WHEN the hero section renders THEN the System SHALL display a status pill showing "Network Active" with live signal count
3. WHEN the hero section renders THEN the System SHALL include a terminal-style search bar (Omnibar) with command prompt icon
4. WHEN the hero section renders THEN the System SHALL display a scrolling code stream marquee at the bottom
5. WHEN a user types in the Omnibar THEN the System SHALL filter the agent grid in real-time
6. WHEN the hero section renders THEN the System SHALL show a subtle purple spotlight glow effect in the center

### Requirement 3: Signal Card 组件

**User Story:** As a user, I want to see agent information in a compact, data-rich card format, so that I can quickly scan and compare multiple agents.

#### Acceptance Criteria

1. WHEN rendering a Signal Card THEN the System SHALL display agent name, status indicator (online/offline), and rank number
2. WHEN rendering a Signal Card THEN the System SHALL display the agent's framework icon and autonomy level badge
3. WHEN rendering a Signal Card THEN the System SHALL show key metrics in monospace font: latency (ms), cost ($), and tech stack
4. WHEN rendering a Signal Card THEN the System SHALL display tags as small bordered pills at the bottom
5. WHEN an agent ranks in top 3 THEN the System SHALL display a purple glow effect and indicator dot
6. WHEN a user hovers over a Signal Card THEN the System SHALL apply a subtle lift animation (-translate-y-1)
7. WHEN an agent is offline THEN the System SHALL display "Offline" status with muted styling

### Requirement 4: Sidebar 筛选面板

**User Story:** As a user, I want to filter agents by framework, latency, and other constraints, so that I can find agents matching my specific needs.

#### Acceptance Criteria

1. WHEN the sidebar renders THEN the System SHALL display the AgentSignals logo with animated pulse indicator
2. WHEN the sidebar renders THEN the System SHALL provide framework filter checkboxes (LangChain, AutoGPT, BabyAGI, LlamaIndex, Custom)
3. WHEN the sidebar renders THEN the System SHALL provide a latency range slider (0-2000ms)
4. WHEN the sidebar renders THEN the System SHALL provide a success rate range slider (0-100%)
5. WHEN a user toggles a framework filter THEN the System SHALL update the agent grid immediately
6. WHEN the sidebar renders THEN the System SHALL display a "Live Connection" status box at the bottom
7. WHEN the sidebar renders on mobile (< 1024px) THEN the System SHALL hide the sidebar by default

### Requirement 5: Agent Grid 布局

**User Story:** As a user, I want to see agents in a responsive grid layout, so that I can browse efficiently on any device.

#### Acceptance Criteria

1. WHEN rendering the agent grid THEN the System SHALL use a responsive grid: 1 column on mobile, 2 on tablet, 3 on desktop, 4 on large screens
2. WHEN rendering the grid header THEN the System SHALL display current search query and result count
3. WHEN no agents match filters THEN the System SHALL display an empty state with "No signals detected" message and reset button
4. WHEN the grid loads THEN the System SHALL display a subtle grid pattern overlay in the background
5. WHEN agents are loading THEN the System SHALL display skeleton cards with pulse animation

### Requirement 6: 数据架构扩展

**User Story:** As a system administrator, I want to store entity type, autonomy level, and metrics for each agent, so that the UI can display rich categorization data.

#### Acceptance Criteria

1. WHEN storing an agent THEN the System SHALL include `entity_type` field with values: 'repo', 'saas', or 'app'
2. WHEN storing an agent THEN the System SHALL include `autonomy_level` field with values: 'L1' through 'L5'
3. WHEN storing an agent THEN the System SHALL include `metrics` JSONB field containing latency, uptime, stars, forks as applicable
4. WHEN calculating GEO Score THEN the System SHALL use the formula: Base(50) + Vitality(20) + Influence(10) + Metadata(10) + Autonomy(0-10)
5. WHEN displaying entity type THEN the System SHALL show appropriate icon: 📦 for repo, 🌐 for saas, 📱 for app

### Requirement 7: Agent 详情页 (Inspector)

**User Story:** As a user, I want to view detailed agent information in a modal/drawer, so that I can learn more without leaving the grid view.

#### Acceptance Criteria

1. WHEN a user clicks a Signal Card THEN the System SHALL open a slide-over drawer from the right
2. WHEN the Inspector opens THEN the System SHALL display a radar chart with 5 dimensions: Coding, Writing, Reasoning, Speed, Stability
3. WHEN the Inspector opens THEN the System SHALL display an API code snippet showing how to invoke the agent
4. WHEN the Inspector opens THEN the System SHALL display "Visit Site" and "Claim This Signal" action buttons
5. WHEN a user clicks outside the Inspector THEN the System SHALL close the drawer with smooth animation

### Requirement 8: 发布页面 (Publisher)

**User Story:** As an agent creator, I want to submit my agent with real-time JSON-LD preview, so that I can ensure proper metadata before publishing.

#### Acceptance Criteria

1. WHEN the publish page renders THEN the System SHALL display a split view: input form on left, JSON-LD preview on right
2. WHEN a user enters a URL THEN the System SHALL validate it in real-time and show green tick if valid
3. WHEN a user fills form fields THEN the System SHALL update the JSON-LD preview immediately
4. WHEN the form is submitted THEN the System SHALL validate all required fields before processing
5. WHEN validation fails THEN the System SHALL highlight invalid fields with error messages

### Requirement 9: 响应式设计

**User Story:** As a mobile user, I want the terminal interface to adapt to my screen size, so that I can use the platform on any device.

#### Acceptance Criteria

1. WHEN viewport width is less than 768px THEN the System SHALL stack the hero content vertically
2. WHEN viewport width is less than 1024px THEN the System SHALL hide the sidebar and show a mobile menu toggle
3. WHEN viewport width is less than 640px THEN the System SHALL reduce card padding and font sizes
4. WHEN viewport width changes THEN the System SHALL smoothly transition layout without content jumps

### Requirement 10: 动画与过渡效果

**User Story:** As a user, I want smooth animations that enhance the terminal aesthetic, so that the interface feels polished and responsive.

#### Acceptance Criteria

1. WHEN the page loads THEN the System SHALL animate the hero content with fade-in effect
2. WHEN the code stream marquee renders THEN the System SHALL scroll continuously from right to left
3. WHEN a card appears in viewport THEN the System SHALL apply a subtle fade-in animation
4. WHEN status indicators render THEN the System SHALL apply a slow pulse animation to online dots
5. WHEN the spotlight glow renders THEN the System SHALL apply a subtle breathing animation

