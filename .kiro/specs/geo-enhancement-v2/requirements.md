# Requirements Document

## Introduction

本文档定义 GEO (生成式引擎优化) 增强 V2 版本的第一阶段需求，聚焦三个核心功能：
1. **GitHub 爬虫** - 快速扩充数据到 1000+
2. **首页 AI Bot 统计展示** - 差异化卖点展示
3. **IndexNow 主动推送** - 加速内容被索引

目标是将 Super Alpha Agent 打造成"为 AI 准备的数据发射台"。

## Glossary

- **GEO**: Generative Engine Optimization，生成式引擎优化，针对 AI 搜索引擎的优化策略
- **JSON-LD**: JavaScript Object Notation for Linked Data，结构化数据格式
- **Schema.org**: 结构化数据标准，被搜索引擎广泛支持
- **AI Bot**: AI 搜索引擎的爬虫，如 GPTBot、ClaudeBot
- **IndexNow**: 主动通知搜索引擎内容更新的协议

---

## 功能对比分析表

| 序号 | 功能点 | 合伙人建议 | 现有实现 | 差距分析 | 优先级 |
|------|--------|-----------|----------|----------|--------|
| 1 | JSON-LD 结构化数据 | SoftwareApplication + aggregateRating + interactionStatistic | ✅ 已实现 SoftwareApplication + FAQPage + BreadcrumbList | 缺少 interactionStatistic 字段 | P1 |
| 2 | Markdown 内容结构 | 功能列表、优缺点、使用场景、竞品对比、FAQ | ✅ 已实现大部分 | 缺少竞品对比的结构化展示 | P1 |
| 3 | GitHub 爬虫 | 按 Stars 排序，提取 README，AI 总结 | ❌ 仅有 GPT Store 爬虫 | 需要新增 GitHub 数据源 | P0 |
| 4 | Product Hunt 爬虫 | 抓取用户反馈 | ❌ 未实现 | 需要新增数据源 | P2 |
| 5 | HuggingFace 爬虫 | 抓取 Spaces 元数据 | ❌ 未实现 | 需要新增数据源 | P2 |
| 6 | AI Bot 访问计数展示 | 首页展示各 Bot 访问趋势 | ⚠️ 部分实现 (ai-stats 页面) | 首页缺少 Bot 访问统计展示 | P1 |
| 7 | 竞品语义图谱 | similarity_score + shared_features + unique_features | ⚠️ 有相似 Agents 展示 | 缺少深度竞品分析和相似度评分 | P1 |
| 8 | robots.txt AI 友好 | 明确 Allow GPTBot/ClaudeBot | ✅ 已实现 | 完善 | - |
| 9 | 邮箱用户闭环 | 提交 → 邮箱验证 → GEO 报告 | ✅ 已实现邮箱验证 | 缺少 GEO 报告功能 | P2 |
| 10 | IndexNow 主动推送 | 新增/更新页面主动通知 | ❌ 未实现 | 需要新增 | P1 |
| 11 | Sitemap 分片 | 1000+ 数据后分片 | ⚠️ 单一 sitemap | 数据量增加后需要分片 | P2 |
| 12 | AI Bot 专用导航 | /ai-index 页面 | ❌ 未实现 | 需要新增 | P1 |
| 13 | 搜索问答块 (QA Block) | 每个 Agent 自动生成 10 个 Q&A | ⚠️ 有 FAQ 但数量少 | 需要扩展 FAQ 生成 | P2 |
| 14 | 使用场景图谱 | scenarios 结构化数据 | ⚠️ 有 use_cases 字段 | 需要增强为图谱结构 | P3 |
| 15 | AI Bot 热度趋势 | 7天趋势图 + 增长率 | ⚠️ 有统计但无趋势 | 需要增加趋势计算 | P2 |
| 16 | 会员体系 | 免费/付费分层 | ❌ 未实现 | 后期商业化需求 | P3 |
| 17 | middleware Bot 计数 | User-Agent 检测计数 | ✅ 已实现 ai-detector | 完善 | - |

---

## Requirements

### Requirement 1: GitHub 爬虫扩容

**User Story:** As a 平台运营者, I want to 自动从 GitHub 抓取 AI Agent 项目, so that I can 快速扩充数据库到 1000+ 条目。

#### Acceptance Criteria

1. WHEN 爬虫执行时 THEN THE 系统 SHALL 使用 GitHub API 搜索 `topic:ai-agent` 并按 Stars 排序
2. WHEN 发现新项目时 THEN THE 系统 SHALL 提取 README.md 内容并使用 AI 分析生成结构化数据
3. WHEN 项目已存在时 THEN THE 系统 SHALL 更新 Stars 数量和最后抓取时间
4. WHEN API 调用失败时 THEN THE 系统 SHALL 记录错误并在 1 分钟后重试
5. WHEN 单次爬取完成时 THEN THE 系统 SHALL 生成爬取报告包含成功/失败数量

---

### Requirement 2: 首页 AI Bot 访问统计展示

**User Story:** As a 访问者, I want to 在首页看到各 AI Bot 的访问统计, so that I can 了解平台被 AI 搜索引擎的认可程度。

#### Acceptance Criteria

1. WHEN 用户访问首页时 THEN THE 系统 SHALL 展示过去 7 天各 AI Bot 的访问次数
2. WHEN 展示统计数据时 THEN THE 系统 SHALL 显示 GPTBot、ClaudeBot、PerplexityBot 等主要 Bot 的访问趋势
3. WHEN 访问量变化时 THEN THE 系统 SHALL 计算并显示周环比增长率
4. WHEN 数据加载中时 THEN THE 系统 SHALL 显示骨架屏占位符

---

### Requirement 3: 竞品语义图谱

**User Story:** As a 用户, I want to 查看 Agent 的竞品分析和相似度评分, so that I can 更好地选择适合我的工具。

#### Acceptance Criteria

1. WHEN 用户查看 Agent 详情时 THEN THE 系统 SHALL 展示 3 个最相似的竞品及相似度评分
2. WHEN 生成竞品分析时 THEN THE 系统 SHALL 使用 AI 分析共同特性和独特特性
3. WHEN 展示竞品对比时 THEN THE 系统 SHALL 使用内部链接连接到竞品页面
4. WHEN 竞品数据不足时 THEN THE 系统 SHALL 显示"暂无足够数据进行竞品分析"

---

### Requirement 4: IndexNow 主动推送

**User Story:** As a 平台运营者, I want to 在内容更新时主动通知搜索引擎, so that I can 加速内容被索引的速度。

#### Acceptance Criteria

1. WHEN 新 Agent 发布时 THEN THE 系统 SHALL 向 IndexNow API 发送 URL 通知
2. WHEN Agent 信息更新时 THEN THE 系统 SHALL 向 IndexNow API 发送更新通知
3. WHEN IndexNow 调用失败时 THEN THE 系统 SHALL 记录错误但不阻塞主流程
4. WHEN 批量更新时 THEN THE 系统 SHALL 合并请求避免超过 API 限制

---

## 本阶段范围

本阶段聚焦以下三个核心需求：
- Requirement 1: GitHub 爬虫扩容
- Requirement 2: 首页 AI Bot 访问统计展示  
- Requirement 4: IndexNow 主动推送

其他需求 (竞品图谱、AI 索引页、JSON-LD 增强等) 将在后续阶段实施。
