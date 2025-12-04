# Implementation Plan

## Phase 1: GEO Enhancement V2

- [x] 1. 数据库 Schema 扩展




  - [x] 1.1 创建数据库迁移文件，扩展 agents 表

    - 添加 `github_stars`, `github_url`, `github_owner`, `github_topics` 字段
    - 创建 `idx_agents_github_stars` 索引
    - _Requirements: 1.2, 1.3_

  - [x] 1.2 创建 bot_stats_7d 视图

    - 按 ai_name 聚合 7 天和 14 天访问数据
    - _Requirements: 2.1, 2.3_

- [ ] 2. GitHub 爬虫实现


  - [x] 2.1 创建 GitHub API 客户端 (`lib/github.ts`)


    - 实现 `searchRepos()` 函数，支持 topic 过滤和 Stars 排序
    - 实现 `fetchReadme()` 函数获取 README 内容
    - 实现 API 速率限制处理
    - _Requirements: 1.1, 1.4_
  - [ ]* 2.2 编写属性测试: GitHub API 请求参数正确性
    - **Property 1: GitHub API 请求参数正确性**
    - **Validates: Requirements 1.1**
  - [-] 2.3 创建 GitHub 爬虫源 (`crawler/sources/github.ts`)

    - 实现 `crawlGitHub()` 主函数
    - 实现 `processGitHubRepo()` 数据转换
    - 生成爬取报告
    - _Requirements: 1.1, 1.2, 1.5_
  - [ ]* 2.4 编写属性测试: 结构化数据 Schema 一致性
    - **Property 2: 结构化数据 Schema 一致性**
    - **Validates: Requirements 1.2**
  - [ ]* 2.5 编写属性测试: 爬取报告完整性
    - **Property 4: 爬取报告完整性**
    - **Validates: Requirements 1.5**
  - [ ] 2.6 更新 enricher 支持 GitHub 数据源
    - 扩展 `enrichAndSaveAgent()` 处理 GitHub 特有字段
    - 实现更新逻辑避免重复
    - _Requirements: 1.2, 1.3_
  - [ ]* 2.7 编写属性测试: 更新幂等性
    - **Property 3: 更新幂等性**
    - **Validates: Requirements 1.3**


- [ ] 3. Checkpoint - 确保 GitHub 爬虫测试通过
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 4. 首页 AI Bot 统计展示

  - [ ] 4.1 创建 Bot 统计数据获取函数 (`lib/bot-stats.ts`)
    - 实现 `getHomepageBotStats()` 查询 bot_stats_7d 视图
    - 计算周环比增长率
    - _Requirements: 2.1, 2.2, 2.3_
  - [ ]* 4.2 编写属性测试: Bot 统计数据正确性
    - **Property 5: Bot 统计数据正确性**
    - **Validates: Requirements 2.1**
  - [ ]* 4.3 编写属性测试: 增长率计算正确性
    - **Property 6: 增长率计算正确性**
    - **Validates: Requirements 2.3**
  - [ ] 4.4 创建首页 Bot 统计组件 (`components/ai-bot-homepage-stats.tsx`)
    - 展示各 Bot 访问次数和趋势
    - 实现骨架屏加载状态
    - _Requirements: 2.1, 2.2, 2.4_
  - [ ] 4.5 集成 Bot 统计组件到首页
    - 在 Hero 区域下方添加统计展示
    - 使用 Suspense 包裹实现流式加载
    - _Requirements: 2.1, 2.4_

- [ ] 5. Checkpoint - 确保首页统计功能测试通过
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 6. IndexNow 主动推送服务
  - [ ] 6.1 创建 IndexNow 服务 (`lib/indexnow.ts`)
    - 实现 `notifyIndexNow()` 发送 URL 通知
    - 实现批量合并逻辑
    - 实现错误处理和日志记录
    - _Requirements: 4.1, 4.2, 4.3, 4.4_
  - [ ]* 6.2 编写属性测试: IndexNow 错误隔离
    - **Property 8: IndexNow 错误隔离**
    - **Validates: Requirements 4.3**
  - [ ]* 6.3 编写属性测试: 批量请求合并
    - **Property 9: 批量请求合并**
    - **Validates: Requirements 4.4**
  - [ ] 6.4 创建 IndexNow key 文件
    - 在 `public/` 目录创建 key 验证文件
    - 更新 robots.txt 添加 key 位置
    - _Requirements: 4.1_
  - [ ] 6.5 集成 IndexNow 到 Agent 发布流程
    - 在 `submit-agent` API 成功后调用 IndexNow
    - 在 `verify-and-publish` API 成功后调用 IndexNow
    - _Requirements: 4.1, 4.2_
  - [ ]* 6.6 编写属性测试: IndexNow 调用触发
    - **Property 7: IndexNow 调用触发**
    - **Validates: Requirements 4.1**

- [ ] 7. Checkpoint - 确保 IndexNow 功能测试通过
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 8. 集成测试和文档
  - [ ] 8.1 运行完整爬虫测试
    - 执行 GitHub 爬虫抓取 50 个项目
    - 验证数据正确入库
    - _Requirements: 1.1, 1.2, 1.3, 1.5_
  - [ ] 8.2 更新 package.json 脚本
    - 添加 `npm run crawler:github` 命令
    - 更新 `npm run crawler` 支持多数据源
    - _Requirements: 1.1_
  - [ ] 8.3 更新环境变量文档
    - 在 `.env.example` 添加 `GITHUB_TOKEN` 和 `INDEXNOW_KEY`
    - _Requirements: 1.1, 4.1_

- [ ] 9. Final Checkpoint - 确保所有测试通过
  - Ensure all tests pass, ask the user if questions arise.
