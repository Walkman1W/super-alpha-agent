# Requirements Document

## Introduction

本次改版旨在提升 Agent Signals 平台的品牌形象和用户体验，包括：添加 About/Blog 内容页面展示行业标准文章、重新设计页眉页脚以体现独角兽企业科技感、优化卡片交互逻辑、修复搜索框图标、以及在导航中集成发布 Agent 入口。

## Glossary

- **GEO**: Generative Engine Optimization，生成式引擎优化，针对 AI 搜索引擎的优化策略
- **L1-L5**: Agent 自主性分级标准，从 L1 (辅助型) 到 L5 (蜂群/组织级)
- **Signal Card**: 终端风格的 Agent 信息卡片组件
- **Inspector Drawer**: 右侧滑入的 Agent 详情抽屉面板
- **Tooltip**: 鼠标悬停时显示的工具提示信息
- **Header**: 页面顶部导航栏
- **Footer**: 页面底部注脚区域

## Requirements

### Requirement 1: About 和 Blog 内容页面

**User Story:** As a visitor, I want to read authoritative articles about AI agent classification and GEO scoring, so that I can understand the industry standards behind Agent Signals.

#### Acceptance Criteria

1. WHEN a user navigates to the About page THEN THE system SHALL display the L1-L5 AI autonomy framework article with proper formatting and citations
2. WHEN a user navigates to the Blog page THEN THE system SHALL display the GEO scoring algorithm article with detailed explanations
3. WHEN displaying articles THEN THE system SHALL use consistent terminal-style typography with proper headings, lists, and code blocks
4. WHEN a user hovers over L1-L5 level badges anywhere on the site THEN THE system SHALL display a tooltip with the level definition and industry reference
5. WHEN a user hovers over GEO score badges anywhere on the site THEN THE system SHALL display a tooltip explaining the scoring methodology

### Requirement 2: 页眉 (Header) 重新设计

**User Story:** As a visitor, I want to see a modern, tech-forward header that conveys the platform's unicorn-level ambition, so that I feel confident in the platform's credibility.

#### Acceptance Criteria

1. WHEN the header is displayed THEN THE system SHALL show a refined logo with gradient effects and subtle glow animation
2. WHEN the header is displayed THEN THE system SHALL include navigation links to: Agents, About, Blog, and Publish Agent
3. WHEN a user clicks the Publish Agent link THEN THE system SHALL navigate to the /publish page
4. WHEN the header is displayed on mobile THEN THE system SHALL collapse navigation into a hamburger menu
5. WHEN a user scrolls down THEN THE system SHALL apply a backdrop blur effect to the sticky header

### Requirement 3: 页脚 (Footer) 重新设计

**User Story:** As a visitor, I want to see a clean, professional footer with essential links and brand information, so that I can easily navigate and understand the platform.

#### Acceptance Criteria

1. WHEN the footer is displayed THEN THE system SHALL show the brand logo, tagline, and brief description
2. WHEN the footer is displayed THEN THE system SHALL include links to: About, Blog, Publish Agent, and GitHub
3. WHEN the footer is displayed THEN THE system SHALL show technology stack information in a compact format
4. WHEN the footer is displayed THEN THE system SHALL include copyright notice and community attribution
5. WHEN the footer is displayed THEN THE system SHALL maintain terminal aesthetic with monospace fonts and subtle borders

### Requirement 4: 搜索框图标修改

**User Story:** As a user, I want to see a terminal-style prompt icon in the search box, so that the interface maintains consistent terminal aesthetics.

#### Acceptance Criteria

1. WHEN the search box is displayed THEN THE system SHALL show a terminal prompt symbol ">_" instead of a magnifying glass icon
2. WHEN the terminal prompt is displayed THEN THE system SHALL use monospace font styling consistent with the terminal theme

### Requirement 5: 卡片交互优化

**User Story:** As a user, I want intuitive card interactions that allow me to quickly access agent information without unexpected navigation, so that I can efficiently browse agents.

#### Acceptance Criteria

1. WHEN a user clicks on an agent card title THEN THE system SHALL open the agent's official website (GitHub or homepage) in a new browser tab
2. WHEN a user clicks on the card body (not title) THEN THE system SHALL open the Inspector Drawer showing the radar chart and details
3. WHEN the Inspector Drawer is open THEN THE system SHALL display buttons for "Visit Site" (opens official URL) and "Publish Agent" (navigates to /publish)
4. WHEN a user clicks the same card again while Inspector Drawer is open THEN THE system SHALL close the drawer and return to the main grid view
5. WHEN a user clicks a card THEN THE system SHALL NOT navigate to the /agents/[slug] detail page (this page is for AI bots only)

### Requirement 6: 详情页访问限制

**User Story:** As a platform operator, I want the agent detail pages to be accessible only to AI bots for SEO purposes, so that human users have a streamlined experience through the Inspector Drawer.

#### Acceptance Criteria

1. WHEN a human user attempts to directly access /agents/[slug] THEN THE system SHALL redirect them to the homepage with the Inspector Drawer open for that agent
2. WHEN an AI bot accesses /agents/[slug] THEN THE system SHALL serve the full detail page with JSON-LD structured data
3. WHEN the system detects user type THEN THE system SHALL use User-Agent analysis to distinguish between human browsers and AI crawlers
