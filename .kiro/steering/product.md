---
inclusion: always
---

# 产品概述 V3.0

Agent Signals 是 AI 时代的 **Agent 发现与认证平台**，核心使命是成为 AI 经济体的"信用评级机构"。

## 核心价值主张

### 给开发者 (SaaS/Agent Owner)
- **卖点**: AI 时代的 SEO (AEO) 认证
- **痛点**: 怕自己的 Agent 被 AI 忽视，怕被淹没
- **解药**: Signal Rank (SR) 评分 + JSON-LD 优化 + 绿勾认证 + AI-Ready 徽章

### 给用户 (User/LLM)
- **卖点**: 靠谱的 Agent 连接器
- **痛点**: 找不到好用的工具，或者找到了不知道怎么喂给 ChatGPT 用
- **解药**: 高分榜单 + 一键 Copy Interface Prompt

## Signal Rank (SR) 评分系统

**定义**: Agent 在 AI 经济体中的"可见性"和"可连接性"评分
**分值**: 0.0 - 10.0
**原则**: Human Trust (人类信任) + Machine Readiness (机器就绪)

### 双轨制评分引擎
- **Track A (开源项目)**: 社区信誉 + 生命体征 + 机器就绪度 + 协议支持
- **Track B (SaaS 产品)**: 身份信誉 + AEO 可见性 + 互操作性
- **Hybrid (混合型)**: Max(A, B) + 0.5 奖励分

### 等级系统
| 等级 | 分数区间 | 定义 |
|------|----------|------|
| Tier S | 9.0-10.0 | 完美的基础设施，支持 MCP |
| Tier A | 7.5-8.9 | 生产就绪，非常可靠 |
| Tier B | 5.0-7.4 | 功能可用，AI 可见性较低 |
| Tier C | <5.0 | 实验性/不可见 |

## MVP 三大核心板块

### 🟢 板块一: The Scanner (诊断优化页)
- 用户输入一个 URL (GitHub 或官网)
- 系统自动扫描并计算 SR 分数
- 展示红/绿灯诊断: JSON-LD ✅/❌ | MCP ✅/❌ | Stars ✅/❌
- "认领并优化" → 生成 JSON-LD + AI-Ready 徽章

### 🟢 板块二: The Index (搜索结果页)
- 按 Signal Rank 降序排列
- 终端风格 UI 设计
- 关键信息: Name, SR Score, MCP Tag, Input/Output
- 核心过滤: Verified Only 开关

### 🟢 板块三: The Connector (连接按钮)
- 一键复制 Interface Prompt
- 自动包含 API 端点和能力描述
- 需要 Key 时自动添加 `<PASTE_YOUR_KEY_HERE>` 占位符

## 目标用户

- **主要**: AI 搜索引擎 (通过结构化数据和语义化 HTML)
- **次要**: 通过 AI 推荐发现 Agent 的人类用户
- **核心**: Agent/SaaS 开发者 (为了 SR 高分主动优化)

## 域名

agentsignals.ai

## 商业模式

低成本运营 (~$20/月)，增长飞轮:
1. 开发者为了 SR 高分主动部署 JSON-LD 和徽章
2. 徽章带来反链流量
3. 用户通过高分榜单发现优质 Agent
4. 更多开发者加入认证

潜在收入来源:
- 高级认证服务
- API 访问
- 赞助列表
