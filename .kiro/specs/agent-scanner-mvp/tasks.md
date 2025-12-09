# 实现计划

## 阶段 1: 核心基础设施

- [x] 1. 设置数据库 Schema 和类型
  - [x] 1.1 创建 Supabase 迁移：agents 表及 SR 评分字段
    - 添加列：sr_score, sr_tier, sr_track, score_github, score_saas, score_breakdown (JSONB)
    - 添加列：is_mcp, is_claimed, is_verified, input_types, output_types
    - 添加索引：sr_score DESC, is_verified, slug
    - _需求: 9.1, 9.2_
  - [x] 1.2 创建 Supabase 迁移：scan_history 表
    - 跟踪分数随时间的变化用于趋势展示
    - _需求: 9.4_
  - [x] 1.3 创建 Supabase 迁移：rate_limits 表
    - 存储 IP 地址、扫描次数、窗口开始时间
    - _需求: 10.1_
  - [x] 1.4 在 lib/types/agent.ts 中创建 TypeScript 类型

    - 定义 Agent, ScanRequest, ScanResponse, DiagnosticItem 接口
    - 定义 SRScoreBreakdown, IOModality 类型
    - _需求: 9.2_

- [x] 2. 实现 URL 检测器服务







  - [x] 2.1 创建 lib/scanner/url-detector.ts，实现 URL 验证和类型检测


    - 使用 URL 构造函数验证 URL 格式
    - 检测 GitHub URL（github.com/owner/repo 模式）
    - 从 GitHub URL 提取 owner/repo
    - 规范化 URL（移除尾部斜杠，确保 https）
    - _需求: 1.1, 1.2, 1.3_

  - [x] 2.2 编写 URL 验证的属性测试


    - **属性 1: URL 验证正确性**

    - **验证: 需求 1.1**
  - [x] 2.3 编写 URL 类型检测的属性测试

    - **属性 2: URL 类型检测准确性**
    - **验证: 需求 1.2, 1.3**

- [x] 3. 检查点 - 确保所有测试通过



  - 确保所有测试通过，如有问题请询问用户。

## 阶段 2: SR 计算器核心


- [x] 4. 实现 SR 计算器 - Track A (GitHub)



  - [x] 4.1 创建 lib/scanner/github-scanner.ts

    - 从 GitHub API 获取仓库数据（stars, forks, 最后提交, 文件）
    - 检查 openapi.json, swagger.yaml, manifest.json, Dockerfile
    - 获取并分析 README 内容
    - 在 README 和描述中检测 MCP 关键词
    - 提取 homepage URL 用于混合检测
    - _需求: 2.1-2.9_

  - [x] 4.2 创建 lib/scanner/sr-calculator.ts，实现 Track A 评分逻辑

    - 实现星标阶梯评分（>20k=2.0, >10k=1.5, >5k=1.0, >1k=0.5）
    - 实现 Fork 比率评分（forks > stars 的 10% = 1.0）
    - 实现活跃度评分（30 天内有提交 = 1.0, 有 license = 1.0）
    - 实现就绪度评分（openapi=1.5, dockerfile=0.5, readme=1.0）
    - 实现协议评分（MCP=2.0, 标准接口=1.0）
    - _需求: 2.1-2.7_

  - [x] 4.3 编写 Track A 评分的属性测试

    - **属性 3: 星标分数计算**
    - **属性 4: Fork 比率分数计算**
    - **属性 5: 活跃度分数计算**
    - **属性 6: 文件检测评分**
    - **属性 7: MCP 关键词检测**
    - **属性 8: README 质量评分**
    - **验证: 需求 2.1-2.7**

- [x] 5. 实现 SR 计算器 - Track B (SaaS)




  - [x] 5.1 使用 Playwright 创建 lib/scanner/saas-scanner.ts

    - 验证 HTTPS 和 SSL 证书
    - 提取社交链接（Twitter, GitHub, Discord, LinkedIn）
    - 检测 JSON-LD 结构化数据
    - 提取 Meta 标签（title, description, H1）
    - 检测 Open Graph 标签（og:image, og:title）
    - 扫描 API 文档路径（/docs, /api, /developers）
    - 检测集成关键词（SDK, Webhook, Zapier, Plugin）
    - _需求: 3.1-3.8_
  - [x] 5.2 在 sr-calculator.ts 中添加 Track B 评分逻辑


    - 实现信任评分（HTTPS=1.0, 社交链接>=2=1.0, 已认领=1.0）
    - 实现 AEO 评分（meta=1.0, JSON-LD=2.0, OG=1.0）
    - 实现互操作性评分（API 文档=1.5, 关键词=1.0, 登录=0.5）
    - _需求: 3.1-3.7_
  - [x] 5.3 编写 Track B 评分的属性测试


    - **属性 10: 社交链接检测**
    - **属性 11: JSON-LD 检测**
    - **属性 12: Meta 标签完整性**
    - **属性 13: Open Graph 标签检测**
    - **属性 14: API 文档路径检测**
    - **属性 15: 集成关键词检测**
    - **验证: 需求 3.1-3.7**

- [x] 6. 实现混合评分和最终计算




  - [x] 6.1 在 sr-calculator.ts 中添加混合评分逻辑

    - 当适用时计算 Track A 和 Track B 两个分数
    - 应用公式：最终 SR = Max(Score_A, Score_B) + 0.5
    - 分数封顶为 10.0
    - 四舍五入到一位小数
    - 确定等级（S: 9.0-10.0, A: 7.5-8.9, B: 5.0-7.4, C: <5.0）
    - _需求: 4.1-4.5_

  - [x] 6.2 编写混合评分的属性测试

    - **属性 16: 混合分数公式**
    - **属性 17: 分数四舍五入**
    - **属性 18: 等级分配**
    - **验证: 需求 4.1-4.5**

- [x] 7. 实现 I/O 提取器




  - [x] 7.1 创建 lib/scanner/io-extractor.ts

    - 为每种模态定义关键词模式（Text, Image, Audio, JSON, Code, File, Video）
    - 从内容中提取输入模态
    - 从内容中提取输出模态
    - 如果没有模式匹配则返回 'Unknown'
    - _需求: 2.8, 3.8_

  - [x] 7.2 编写 I/O 提取的属性测试

    - **属性 9: I/O 模态提取**
    - **验证: 需求 2.8, 3.8**


- [x] 8. 检查点 - 确保所有测试通过


  - 确保所有测试通过，如有问题请询问用户。

## 阶段 3: API 层


- [x] 9. 实现速率限制器和缓存



  - [x] 9.1 创建 lib/scanner/rate-limiter.ts

    - 根据 rate_limits 表检查 IP
    - 匿名用户强制执行 5 次/小时，已认证用户 20 次/小时
    - 超过限制时返回 429 带 retry-after
    - _需求: 10.1, 10.2, 10.6_

  - [x] 9.2 创建 lib/scanner/cache.ts

    - 检查是否存在不到 24 小时的扫描结果
    - 返回缓存数据及缓存时长
    - 支持强制重新扫描选项
    - _需求: 10.3, 10.4_

  - [x] 9.3 编写速率限制和缓存的属性测试

    - **属性 28: 速率限制执行**
    - **属性 29: 缓存命中逻辑**
    - **验证: 需求 10.1, 10.3, 10.4, 10.6**

- [x] 10. 创建扫描 API 路由



  - [x] 10.1 创建 app/api/scan/route.ts


    - 接受 POST 请求，参数 { url, forceRescan? }
    - 应用速率限制
    - 优先检查缓存
    - 运行 URL 检测和相应的扫描器
    - 计算 SR 分数
    - 持久化到数据库
    - 返回带诊断信息的 ScanResponse
    - _需求: 1.1-1.5, 9.1, 10.1-10.4_

  - [-] 10.2 创建诊断生成逻辑

    - 为每个指标生成红/绿状态
    - 为失败的指标生成可操作的建议

    - _需求: 5.2, 5.4_
  - [-] 10.3 编写诊断建议的属性测试

    - **属性 19: 诊断建议**
    - **验证: 需求 5.4**

- [x] 11. 检查点 - 确保所有测试通过



  - 确保所有测试通过，如有问题请询问用户。

## 阶段 4: 生成器

- [x] 12. 实现 JSON-LD 生成器




  - [x] 12.1 创建 lib/generators/json-ld-generator.ts

    - 生成 SoftwareApplication schema
    - 包含 @type, name, description, url, provider 字段
    - 格式化为有效的 JSON 字符串
    - 生成部署说明
    - _需求: 6.1-6.5_

  - [x] 12.2 编写 JSON-LD 生成的属性测试

    - **属性 20: JSON-LD 生成完整性**
    - **验证: 需求 6.1, 6.2, 6.3**


- [x] 13. 实现徽章生成器





  - [x] 13.1 创建 lib/generators/badge-generator.ts

    - 生成带等级颜色的 SVG 徽章（绿色=S, 蓝色=A, 黄色=B, 灰色=C）
    - 生成链接到 Agent 报告页的嵌入代码
    - 在徽章中显示分数
    - _需求: 6.6, 6.7_

  - [x] 13.2 编写徽章颜色映射的属性测试


    - **属性 21: 徽章颜色映射**
    - **验证: 需求 6.7**

- [x] 14. 实现提示词生成器



  - [x] 14.1 创建 lib/generators/prompt-generator.ts

    - 生成包含 Agent 名称、端点、能力的 Interface Prompt
    - 当需要 API 密钥时包含 <PASTE_YOUR_KEY_HERE> 占位符
    - 为没有 API 结构的 Track B 生成自然语言回退
    - _需求: 8.1-8.6_

  - [x] 14.2 编写提示词生成的属性测试

    - **属性 24: Interface Prompt 生成**
    - **属性 25: API 密钥占位符**
    - **属性 26: 自然语言回退**
    - **验证: 需求 8.1-8.6**

- [ ] 15. 创建生成器 API 路由
  - [ ] 15.1 创建 app/api/generate/route.ts
    - 接受 POST 请求，参数 { agentSlug, type: 'jsonld' | 'badge' | 'prompt' }
    - 根据类型返回生成的内容
    - 跟踪生成事件用于分析
    - _需求: 6.4, 6.8, 8.5_

- [ ] 16. 检查点 - 确保所有测试通过
  - 确保所有测试通过，如有问题请询问用户。

## 阶段 5: 前端 - 扫描页面

- [ ] 17. 创建扫描页面 UI
  - [ ] 17.1 创建 app/scan/page.tsx，包含 URL 输入表单
    - 大型居中的 URL 输入框
    - 带加载状态的提交按钮
    - 无效 URL 的错误消息展示
    - _需求: 1.1, 1.4, 1.5_
  - [ ] 17.2 创建 components/scanner/scan-results.tsx
    - 醒目展示 SR 分数和等级徽章
    - 显示轨道类型（OpenSource, SaaS, Hybrid）
    - 展示红/绿诊断指示器
    - 显示失败指标的改进建议
    - _需求: 5.1-5.5_
  - [ ] 17.3 创建 components/scanner/claim-optimize.tsx
    - 未认领 Agent 的"认领并优化"按钮
    - 带复制按钮的 JSON-LD 代码块
    - 带复制按钮的徽章嵌入代码
    - 部署说明
    - "验证部署"按钮用于重新扫描
    - _需求: 5.5, 6.1-6.8_

## 阶段 6: 前端 - 索引页面

- [ ] 18. 创建 Agent 索引页面
  - [ ] 18.1 创建 app/agents/page.tsx，终端风格列表
    - 获取按 SR 分数降序排列的 Agent
    - 每行显示名称、SR 分数、MCP 标签、I/O 类型
    - 使用 show-agentv3.0.html 参考的终端风格设计
    - _需求: 7.1-7.3_
  - [ ] 18.2 创建 components/index/agent-row.tsx
    - 带悬停操作的终端风格行
    - 为已认领 Agent 显示已验证徽章
    - 悬停时显示"复制 JSON-LD"和"查看文档"
    - _需求: 7.2, 7.5_
  - [ ] 18.3 创建 components/index/verified-filter.tsx
    - "仅显示已验证"过滤器的切换开关
    - 按 is_verified 状态过滤 Agent
    - _需求: 7.4_
  - [ ] 18.4 编写索引展示的属性测试
    - **属性 22: Agent 索引排序**
    - **属性 23: 已验证过滤器正确性**
    - **验证: 需求 7.1, 7.4**

## 阶段 7: 前端 - 连接器

- [ ] 19. 实现连接按钮
  - [ ] 19.1 创建 components/connector/connect-button.tsx
    - Agent 卡片/详情页上的"连接"按钮
    - 打开带生成的 Interface Prompt 的模态框
    - 复制到剪贴板并显示成功反馈
    - _需求: 8.1, 8.4_
  - [ ] 19.2 创建 components/connector/prompt-modal.tsx
    - 在代码块中展示生成的提示词
    - 如需要则显示 API 密钥占位符
    - 带 toast 通知的复制按钮
    - _需求: 8.2, 8.3, 8.4_

## 阶段 8: 数据持久化集成

- [ ] 20. 实现数据层
  - [ ] 20.1 创建 lib/data/agent-repository.ts
    - upsertAgent: 创建或更新 Agent 记录
    - getAgentBySlug: 获取单个 Agent
    - getAgents: 带过滤器获取（已验证、按 SR 排序）
    - updateClaimStatus: 将 is_claimed 设为 true
    - _需求: 9.1, 9.3, 9.5_
  - [ ] 20.2 创建 lib/data/scan-history-repository.ts
    - createScanHistory: 记录扫描结果
    - getScoreHistory: 获取历史用于趋势展示
    - _需求: 9.4_
  - [ ] 20.3 编写数据持久化的属性测试
    - **属性 27: 数据持久化完整性**
    - **验证: 需求 9.1, 9.2**

- [ ] 21. 最终检查点 - 确保所有测试通过
  - 确保所有测试通过，如有问题请询问用户。
