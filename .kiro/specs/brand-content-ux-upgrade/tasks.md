# 实现计划

- [x] 1. 创建 Tooltip 组件和自主等级定义



  - [x] 1.1 创建带悬停触发和定位的 Tooltip UI 组件


    - 创建 `components/ui/tooltip.tsx`，支持可配置位置 (top/bottom/left/right)
    - 支持字符串和 ReactNode 内容
    - 处理视口边界检测以防止溢出
    - _需求: 1.4, 1.5_

  - [x] 1.2 创建自主等级 Tooltip 内容定义

    - 创建 `lib/tooltip-content.ts`，包含 L1-L5 定义（标签、描述、行业参考）
    - 添加 GEO 评分 Tooltip 内容及公式说明
    - _需求: 1.4, 1.5_

  - [x] 1.3 编写自主等级 Tooltip 一致性属性测试

    - **属性 1: 自主等级 Tooltip 一致性**
    - **验证: 需求 1.4**

- [x] 2. 更新 Omnibar 搜索图标为终端提示符




  - [x] 2.1 将 Search 图标替换为终端提示符 ">_"

    - 修改 `components/terminal/omnibar.tsx`
    - 使用等宽字体显示提示符
    - 保持键盘快捷键 (Cmd+K) 功能
    - _需求: 4.1, 4.2_

- [x] 3. 重构 SignalCard 交互逻辑


  - [x] 3.1 分离标题点击和卡片点击处理器

    - 修改 `components/terminal/signal-card.tsx`
    - 标题点击: 在新标签页打开 official_url (target="_blank")
    - 卡片主体点击: 触发 onCardClick 回调（打开抽屉）
    - 移除导航到 /agents/[slug] 的 Link 包装器
    - _需求: 5.1, 5.2, 5.5_

  - [x] 3.2 为自主等级徽章添加 Tooltip
    - 用 Tooltip 组件包装自主等级徽章
    - 悬停时显示等级定义
    - _需求: 1.4_

  - [x] 3.3 为 GEO 评分徽章添加 Tooltip
    - 用 Tooltip 组件包装 GEO 评分
    - 悬停时显示评分方法
    - _需求: 1.5_

  - [x] 3.4 编写卡片标题外部链接属性测试
    - **属性 2: 卡片标题外部链接**
    - **验证: 需求 5.1**

  - [x] 3.5 编写卡片点击不导航到详情页属性测试

    - **属性 3: 卡片点击不导航到详情页**
    - **验证: 需求 5.5**

- [x] 4. 更新 InspectorDrawer 操作





  - [x] 4.1 将 "Full Details" 按钮替换为 "Publish Agent" 按钮



    - 修改 `components/terminal/inspector-drawer.tsx`
    - "Visit Site" 按钮: 在新标签页打开 official_url
    - "Publish Agent" 按钮: 导航到 /publish 页面
    - _需求: 5.3_


  - [x] 4.2 实现同一卡片点击时的抽屉切换

    - 更新父组件 (terminal-home-page.tsx) 以跟踪选中的 Agent
    - 如果点击同一 Agent，关闭抽屉；否则打开新 Agent
    - _需求: 5.4_

- [ ] 5. 检查点 - 确保卡片交互正常工作
  - 确保所有测试通过，如有问题请询问用户。

- [ ] 6. 重新设计 Header 组件
  - [ ] 6.1 创建带更新导航的新 Header 组件
    - 创建 `components/terminal/header.tsx`（或在 layout.tsx 中重构）
    - 添加导航链接: Agents, About, Blog, Publish Agent, GitHub
    - 用强调色高亮 "Publish" 链接
    - 应用带微妙发光动画的渐变 Logo
    - _需求: 2.1, 2.2, 2.3_
  - [ ] 6.2 实现移动端汉堡菜单
    - 为移动视口添加响应式菜单切换
    - 滑入式菜单包含所有导航项
    - _需求: 2.4_
  - [ ] 6.3 确保粘性页眉在滚动时有背景模糊效果
    - 验证 backdrop-blur 效果已应用
    - _需求: 2.5_

- [ ] 7. 重新设计 Footer 组件
  - [ ] 7.1 创建带更新布局的新 Footer 组件
    - 在 `app/layout.tsx` 中重构页脚或创建 `components/terminal/footer.tsx`
    - 品牌区域: Logo、标语、描述
    - 链接区域: About, Blog, Publish Agent, GitHub
    - 技术栈区域: 紧凑格式
    - 版权和社区归属
    - _需求: 3.1, 3.2, 3.3, 3.4, 3.5_

- [ ] 8. 创建包含 L1-L5 文章的 About 页面
  - [ ] 8.1 创建 About 页面路由和内容
    - 创建 `app/about/page.tsx`
    - 渲染来自 docs/about.md 内容的 L1-L5 AI 自主性框架文章
    - 使用终端风格排版，包含正确的标题和格式
    - 包含引用和行业参考
    - _需求: 1.1, 1.3_

- [ ] 9. 创建包含 GEO 文章的 Blog 页面
  - [ ] 9.1 创建 Blog 页面路由和内容
    - 创建 `app/blog/page.tsx`
    - 渲染来自 docs/about.md 内容的 GEO 评分算法文章
    - 使用终端风格排版，包含正确的标题和格式
    - 包含公式说明和引用
    - _需求: 1.2, 1.3_

- [ ] 10. 检查点 - 验证页面和导航
  - 确保所有测试通过，如有问题请询问用户。

- [ ] 11. 实现详情页路由的 AI Bot 检测
  - [ ] 11.1 增强 ai-detector 中的 User-Agent 检测
    - 更新 `lib/ai-detector.ts`，添加全面的 Bot 模式
    - 添加函数判断请求是否应重定向
    - _需求: 6.3_
  - [ ] 11.2 在 Agent 详情页实现重定向逻辑
    - 修改 `app/agents/[slug]/page.tsx`
    - 在服务端检查 User-Agent
    - 将人类用户重定向到首页，Agent slug 作为查询参数
    - 为 AI Bot 提供包含 JSON-LD 的完整页面
    - _需求: 6.1, 6.2_
  - [ ] 11.3 在首页处理重定向
    - 更新首页检查 Agent 查询参数
    - 自动为指定 Agent 打开 Inspector Drawer
    - _需求: 6.1_
  - [ ] 11.4 编写 User Agent 路由属性测试
    - **属性 4: 基于 User Agent 的路由**
    - **验证: 需求 6.1, 6.2, 6.3**

- [ ] 12. 最终检查点 - 确保所有测试通过
  - 确保所有测试通过，如有问题请询问用户。
