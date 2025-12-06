# Implementation Plan

- [x] 1. 配置全局主题和字体




  - [x] 1.1 更新 Tailwind 配置添加深色主题

    - 在 `tailwind.config.ts` 中扩展 colors 添加 zinc 色系
    - 添加 JetBrains Mono 字体配置
    - 添加自定义动画 (marquee, ping-slow, blob)
    - _Requirements: 1.1, 1.2, 1.3, 10.2_


  - [x] 1.2 更新全局样式

    - 在 `app/globals.css` 中添加深色主题基础样式
    - 添加 JetBrains Mono 字体导入
    - 添加 marquee 动画 keyframes
    - _Requirements: 1.1, 1.5_


  - [x] 1.3 更新根布局

    - 在 `app/layout.tsx` 中配置字体和深色背景
    - _Requirements: 1.1_

- [x] 2. 扩展数据库 Schema 和类型




  - [x] 2.1 创建数据库迁移文件

    - 创建 `supabase/migrations/add_terminal_fields.sql`
    - 添加 entity_type, autonomy_level, metrics, status, rank, geo_score 字段
    - 添加约束检查
    - _Requirements: 6.1, 6.2, 6.3_


  - [x] 2.2 更新 TypeScript 类型定义

    - 在 `lib/supabase.ts` 中扩展 Agent 类型
    - 创建 `lib/types/agent.ts` 定义新类型
    - _Requirements: 6.1, 6.2, 6.3_

  - [ ]* 2.3 编写属性测试: Agent 数据验证
    - **Property 7: Agent Data Validation**
    - **Validates: Requirements 6.1, 6.2, 6.3**
    - 测试 entity_type 和 autonomy_level 枚举验证
    - _Requirements: 6.1, 6.2, 6.3_


  - [x] 2.4 实现 GEO Score 计算函数

    - 创建 `lib/geo-score.ts`
    - 实现 calculateGeoScore 函数
    - _Requirements: 6.4_

  - [ ]* 2.5 编写属性测试: GEO Score 计算
    - **Property 8: GEO Score Calculation**
    - **Validates: Requirements 6.4**
    - 测试分数范围 0-100 和公式正确性
    - _Requirements: 6.4_

- [x] 3. Checkpoint - 确保所有测试通过


  - Ensure all tests pass, ask the user if questions arise.


- [x] 4. 实现核心终端组件

  - [x] 4.1 创建 StatusPill 组件

    - 创建 `components/terminal/status-pill.tsx`
    - 显示网络状态和信号计数
    - _Requirements: 2.2_

  - [ ]* 4.2 编写属性测试: Status Pill 信号计数
    - **Property 14: Status Pill Signal Count**
    - **Validates: Requirements 2.2**
    - 测试任意非负整数计数正确渲染
    - _Requirements: 2.2_



  - [x] 4.3 创建 CodeMarquee 组件
    - 创建 `components/terminal/code-marquee.tsx`
    - 实现无限滚动代码流动画
    - _Requirements: 2.4, 10.2_


  - [x] 4.4 创建 Omnibar 搜索组件

    - 创建 `components/terminal/omnibar.tsx`
    - 终端风格搜索输入框
    - 命令提示符图标和快捷键提示
    - _Requirements: 2.3, 2.5_


  - [x] 4.5 创建 HeroTerminal 组件


    - 创建 `components/terminal/hero-terminal.tsx`
    - 整合 StatusPill, Omnibar, CodeMarquee
    - 深色背景和紫色光晕效果
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.6_

- [x] 5. 实现 Signal Card 组件




  - [x] 5.1 创建实体类型图标映射函数

    - 创建 `lib/entity-utils.ts`
    - 实现 getEntityIcon 和 getFrameworkIcon 函数
    - _Requirements: 6.5_

  - [ ]* 5.2 编写属性测试: 实体类型图标映射
    - **Property 9: Entity Type Icon Mapping**
    - **Validates: Requirements 6.5**
    - 测试所有实体类型返回正确图标
    - _Requirements: 6.5_


  - [x] 5.3 创建 SignalCard 组件

    - 创建 `components/terminal/signal-card.tsx`
    - 显示 agent 名称、状态、排名
    - 显示框架图标和自主等级徽章
    - 显示指标 (延迟、成本、技术栈)
    - 显示标签
    - Top 3 紫色光晕效果
    - 离线状态样式
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7_

  - [ ]* 5.4 编写属性测试: Signal Card 渲染
    - **Property 1: Signal Card Complete Rendering**
    - **Validates: Requirements 3.1, 3.2, 3.3, 3.4**
    - 测试所有必需字段正确渲染
    - _Requirements: 3.1, 3.2, 3.3, 3.4_

  - [ ]* 5.5 编写属性测试: Top Tier 样式
    - **Property 2: Top Tier Styling**
    - **Validates: Requirements 3.5**
    - 测试 rank <= 3 应用特殊样式
    - _Requirements: 3.5_

  - [ ]* 5.6 编写属性测试: 离线状态显示
    - **Property 3: Offline Status Display**
    - **Validates: Requirements 3.7**
    - 测试离线 agent 显示正确状态
    - _Requirements: 3.7_

- [x] 6. 实现过滤逻辑



  - [x] 6.1 创建过滤工具函数

    - 创建 `lib/filter-utils.ts`
    - 实现 filterAgentsBySearch, filterAgentsByFramework
    - 实现 sanitizeFilterState
    - _Requirements: 2.5, 4.5_

  - [ ]* 6.2 编写属性测试: 搜索过滤
    - **Property 4: Search Filter Correctness**
    - **Validates: Requirements 2.5**
    - 测试过滤结果只包含匹配项
    - _Requirements: 2.5_

  - [ ]* 6.3 编写属性测试: 框架过滤
    - **Property 5: Framework Filter Correctness**
    - **Validates: Requirements 4.5**
    - 测试框架过滤正确性
    - _Requirements: 4.5_


  - [x] 6.4 创建 SidebarFilter 组件

    - 创建 `components/terminal/sidebar-filter.tsx`
    - 框架复选框过滤器
    - 延迟和成功率滑块
    - 实时连接状态显示
    - 响应式隐藏
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 4.7_


- [x] 7. Checkpoint - 确保所有测试通过


  - Ensure all tests pass, ask the user if questions arise.

- [x] 8. 实现 Agent Grid 和首页



  - [x] 8.1 创建 AgentGrid 组件

    - 创建 `components/terminal/agent-grid.tsx`
    - 响应式网格布局 (1/2/3/4 列)
    - 显示搜索查询和结果计数
    - 空状态处理
    - 加载骨架屏
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_

  - [ ]* 8.2 编写属性测试: Grid Header 准确性
    - **Property 6: Grid Header Accuracy**
    - **Validates: Requirements 5.2**
    - 测试 header 显示正确的查询和计数
    - _Requirements: 5.2_


  - [x] 8.3 重构首页

    - 更新 `app/page.tsx` 使用新终端组件
    - 整合 HeroTerminal, SidebarFilter, AgentGrid
    - 保持 ISR 缓存策略
    - _Requirements: 1.1, 2.1, 5.1_



- [x] 9. 实现 Inspector 详情抽屉

  - [x] 9.1 创建 API 代码片段生成函数

    - 在 `lib/entity-utils.ts` 中添加 generateApiSnippet
    - _Requirements: 7.3_

  - [ ]* 9.2 编写属性测试: API 代码片段生成
    - **Property 10: API Snippet Generation**
    - **Validates: Requirements 7.3**
    - 测试生成的代码包含 agent URL
    - _Requirements: 7.3_


  - [x] 9.3 创建 RadarChart 组件

    - 创建 `components/terminal/radar-chart.tsx`
    - 使用 Recharts 实现 5 维度雷达图
    - _Requirements: 7.2_


  - [x] 9.4 创建 InspectorDrawer 组件

    - 创建 `components/terminal/inspector-drawer.tsx`
    - 右侧滑入抽屉
    - 显示雷达图和 API 代码片段
    - 操作按钮
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5_

- [ ] 10. 实现发布页面
  - [ ] 10.1 创建 URL 验证函数
    - 在 `lib/validation.ts` 中实现 validateUrl
    - _Requirements: 8.2_

  - [ ]* 10.2 编写属性测试: URL 验证
    - **Property 11: URL Validation**
    - **Validates: Requirements 8.2**
    - 测试有效/无效 URL 识别
    - _Requirements: 8.2_

  - [ ] 10.3 创建 JSON-LD 生成函数
    - 在 `lib/json-ld.ts` 中实现 generateJsonLd
    - _Requirements: 8.3_

  - [ ]* 10.4 编写属性测试: JSON-LD 生成 (Round-trip)
    - **Property 12: JSON-LD Preview Generation**
    - **Validates: Requirements 8.3**
    - 测试生成的 JSON-LD 包含所有输入值
    - _Requirements: 8.3_

  - [ ] 10.5 创建表单验证函数
    - 在 `lib/validation.ts` 中实现 validatePublishForm
    - _Requirements: 8.4, 8.5_

  - [ ]* 10.6 编写属性测试: 表单验证
    - **Property 13: Form Validation Completeness**
    - **Validates: Requirements 8.4, 8.5**
    - 测试必填字段验证
    - _Requirements: 8.4, 8.5_

  - [ ] 10.7 创建 PublisherForm 组件
    - 创建 `components/publish/publisher-form.tsx`
    - 分屏布局 (表单 + JSON-LD 预览)
    - 实时 URL 验证
    - 实时 JSON-LD 更新
    - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5_

- [ ] 11. Checkpoint - 确保所有测试通过
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 12. 响应式设计优化
  - [ ] 12.1 添加移动端菜单组件
    - 创建 `components/terminal/mobile-menu.tsx`
    - 汉堡菜单按钮
    - 滑出式筛选面板
    - _Requirements: 9.2_

  - [ ] 12.2 优化组件响应式样式
    - 更新 HeroTerminal 移动端布局
    - 更新 SignalCard 移动端样式
    - 更新 AgentGrid 响应式断点
    - _Requirements: 9.1, 9.2, 9.3_

- [ ] 13. 数据迁移和种子数据
  - [ ] 13.1 创建数据迁移脚本
    - 创建 `scripts/migrate-terminal-fields.js`
    - 为现有 agents 填充默认值
    - _Requirements: 6.1, 6.2, 6.3_

  - [ ] 13.2 更新种子数据
    - 更新 `supabase/seed.sql` 包含新字段
    - 添加 10 个示例 agents 覆盖不同类型
    - _Requirements: 6.1, 6.2, 6.3_

- [ ] 14. Final Checkpoint - 确保所有测试通过
  - Ensure all tests pass, ask the user if questions arise.

