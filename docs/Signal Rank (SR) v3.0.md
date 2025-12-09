合伙人，这份文档将是我们平台的**“宪法”**。

它解决了我们之前所有的痛点：
1.  **公平性**：让 `dbeaver` 这种 GitHub 大佬和 `Manus` 这种 SaaS 新贵都能拿到高分。
2.  **导向性**：极其强硬地引导用户去配置 **JSON-LD** 和 **MCP**。
3.  **可执行性**：Kiro-CLI 可以直接照着写代码。

以下是 **Signal Rank (SR) v3.0 核心算法标准**。

---

# 📊 Signal Rank (SR) v3.0 评分标准白皮书

**定义**：SR 代表一个 Agent 在 AI 经济体中的 **“可见性” (Visibility)** 和 **“可连接性” (Connectability)**。
**分值**：`0.0` - `10.0`
**原则**：Human Trust (人类信任) + Machine Readiness (机器就绪)。

---

## 🛤️ 双轨制评分引擎 (Dual-Track Engine)

Kiro 在扫描时会自动判断目标是 **GitHub 仓库** 还是 **SaaS 官网**，并进入不同的评分轨道。

### 🅰️ Track A: 开源项目 (GitHub Repository)
*适用于：Libraries, Open Source Agents, CLI Tools*

#### 1. 社区信誉 (Community Trust) —— 权重 3.0 分
*逻辑：星星是开源世界的货币。解决“高星低分”的误判。*
*   **Stars 阶梯** (满分 2.0):
    *   `> 20,000`: **2.0 pts**
    *   `> 10,000`: **1.5 pts**
    *   `> 5,000`: **1.0 pts**
    *   `> 1,000`: **0.5 pts**
*   **Forks/Usage** (满分 1.0):
    *   `Forks > 10% of Stars` 或 `Used by > 100 repos`: **1.0 pts**

#### 2. 生命体征 (Vitality) —— 权重 2.0 分
*逻辑：确保 AI 不会调用到一个死掉的库。*
*   **近期活跃**: 最近 30 天内有 Commit / Release: **+1.0 pts**
*   **维护健康**: Open Issues 率健康 或 有完善的 License: **+1.0 pts**

#### 3. 机器就绪度 (Machine Readiness) —— 权重 3.0 分
*逻辑：代码里有没有给机器看的说明书？*
*   **结构化文档**: 根目录存在 `openapi.json` / `swagger.yaml` / `manifest.json`: **+1.5 pts**
*   **Docker/Deploy**: 存在 `Dockerfile` 或 `docker-compose.yml` (意味着 Bot 可以自托管它): **+0.5 pts**
*   **文档质量**: README 长度 > 200 行 且包含 "Usage" 代码块: **+1.0 pts**

#### 4. 协议与生态 (Protocol & Ecosystem) —— 权重 2.0 分
*逻辑：这是我们推崇的未来标准。*
*   **MCP Support (核心)**: 
    *   代码或文档中明确包含 `Model Context Protocol` 或 `MCP Server`: **+2.0 pts** (直接拉满)
*   **Standard Interface**:
    *   虽然不支持 MCP，但支持 `LangChain`, `Vercel AI SDK` 等标准: **+1.0 pts**

---

### 🅱️ Track B: 商业产品 (SaaS / Web Agent)
*适用于：Manus, Jasper, Midjourney, 及所有闭源产品*

#### 1. 身份信誉 (Identity Trust) —— 权重 3.0 分
*逻辑：没有 Stars，看什么？看域名和社交信号。*
*   **基础安全**: HTTPS 有效且 SSL 证书 > 3 个月: **+1.0 pts**
*   **社交验证**: 官网包含指向 `Twitter`, `GitHub`, `Discord`, `LinkedIn` 的有效链接 (至少2个): **+1.0 pts**
*   **认领状态 (Claimed)**: 
    *   开发者在 Agent Signals 完成了 **Owner Verification**: **+1.0 pts** (这是倒逼他们来注册的关键)

#### 2. AEO 可见性 (AI Visibility) —— 权重 4.0 分
*逻辑：这就是我们卖的 JSON-LD 优化服务。*
*   **基础 Meta**: Title, Description, H1 标签完整: **+1.0 pts**
*   **JSON-LD (核心)**: 
    *   检测到 `<script type="application/ld+json">`: **+2.0 pts**
    *   *这是 SaaS 产品拿高分的捷径，必须做！*
*   **Open Graph**: 包含 `og:image`, `og:title` (利于 AI 引用时展示卡片): **+1.0 pts**

#### 3. 互操作性 (Interoperability) —— 权重 3.0 分
*逻辑：是个封闭的网页，还是个开放的工具？*
*   **API 入口**: URL 路径扫描检测到 `/docs`, `/api`, `/developers`: **+1.5 pts**
*   **集成能力**: 页面文字提及 `SDK`, `Webhook`, `Zapier`, `Plugin`: **+1.0 pts**
*   **交互入口**: 首页有明确的 Login/Try 按钮 (非纯静态展示页): **+0.5 pts**

---

## ⚡️ 混合增强规则 (The Hybrid Boost)

**场景**：如果一个 SaaS 产品（Track B）在他的官网里挂了 GitHub 链接（Track A）。
*例如：LangChain 既有官网文档，又有 GitHub 仓库。*

**计算公式**：
> **Final SR = Max(Score_A, Score_B) + 0.5 (Hybrid Bonus)**
> *上限 10.0*

**逻辑**：
1.  我们分别跑一遍 Track A 和 Track B 的打分。
2.  取最高分（避免短板效应）。
3.  **额外奖励 0.5 分**：奖励那些既做好了商业化（官网好），又拥抱开源（代码好）的各种产品。

---

## 📝 给 Kiro-CLI 的执行指令

合伙人，你可以把下面这段伪代码直接发给 Kiro，让它去实装：

```javascript
// SR Calculation Logic v3.0

function calculateSR(agent) {
    let scoreA = 0; // GitHub Track
    let scoreB = 0; // SaaS Track
    let isHybrid = false;

    // --- TRACK A: GitHub Analysis ---
    if (agent.github_repo) {
        const repo = agent.github_data;
        // 1. Trust
        if (repo.stars > 20000) scoreA += 2.0;
        else if (repo.stars > 10000) scoreA += 1.5;
        else if (repo.stars > 5000) scoreA += 1.0;
        else if (repo.stars > 1000) scoreA += 0.5;
        if (repo.forks > repo.stars * 0.1) scoreA += 1.0;
        
        // 2. Vitality
        if (daysSince(repo.last_commit) < 30) scoreA += 1.0;
        if (repo.has_license) scoreA += 1.0;

        // 3. Readiness
        if (hasFile(repo, ['openapi.json', 'swagger.yaml'])) scoreA += 1.5;
        if (repo.readme_length > 200) scoreA += 1.0;
        if (hasFile(repo, ['Dockerfile'])) scoreA += 0.5;

        // 4. Protocol
        if (scanKeywords(repo, ['mcp', 'model context protocol'])) scoreA += 2.0; 
        else if (scanKeywords(repo, ['langchain', 'vercel ai'])) scoreA += 1.0;
    }

    // --- TRACK B: SaaS Analysis ---
    if (agent.homepage_url) {
        const page = agent.web_data;
        // 1. Trust
        if (page.https_valid) scoreB += 1.0;
        if (page.social_links.length >= 2) scoreB += 1.0;
        if (agent.is_claimed) scoreB += 1.0; // Database field

        // 2. AEO (Visibility)
        if (page.has_basic_meta) scoreB += 1.0;
        if (page.has_json_ld) scoreB += 2.0; // Big weight!
        if (page.has_og_tags) scoreB += 1.0;

        // 3. Interop
        if (page.has_api_docs_path) scoreB += 1.5;
        if (scanPageText(page, ['sdk', 'webhook', 'zapier'])) scoreB += 1.0;
        if (page.has_login_btn) scoreB += 0.5;
    }

    // --- Final Decision ---
    if (agent.github_repo && agent.

    
    // 判断是否为混合型项目（既有 GitHub 又有独立官网）
    if (agent.github_repo && agent.homepage_url) {
        isHybrid = true;
    }

    let finalScore = 0;

    if (isHybrid) {
        // 混合型：取两者最大值 + 0.5 混合奖励
        // 逻辑：鼓励大家既做开源，又做好商业化门面
        finalScore = Math.max(scoreA, scoreB) + 0.5;
    } else if (agent.github_repo) {
        // 纯开源项目
        finalScore = scoreA;
    } else {
        // 纯 SaaS 产品
        finalScore = scoreB;
    }

    // 封顶 10.0 分
    finalScore = Math.min(Math.round(finalScore * 10) / 10, 10.0);

    return {
        score: finalScore,
        details: {
            track: isHybrid ? 'Hybrid' : (agent.github_repo ? 'OpenSource' : 'SaaS'),
            score_github: scoreA,
            score_saas: scoreB,
            is_mcp: scanKeywords(repo, ['mcp', 'model context protocol']), // 用于打 Tag
            is_verified: agent.is_claimed // 用于打 Verified 徽章
        }
    };
}

---

### 🏆 自动定级标准 (The Tier System)

有了上面的 `finalScore`，我们在前端展示时，直接映射为以下等级。这套标准对标的是 **穆迪信用评级**：

| 等级 Badge | 分数区间 | 定义 (Definition) | 话术 (对开发者说) |
| :--- | :--- | :--- | :--- |
| **Tier S (Infrastructure)** | **9.0 - 10.0** | **完美的基础设施**。支持 MCP，文档完备，社区信誉极高。 | *"你是行业的灯塔。保持住！"* |
| **Tier A (Production)** | **7.5 - 8.9** | **生产就绪**。非常可靠，但可能缺少 JSON-LD 或 MCP 支持。 | *"这就去添加 JSON-LD，冲击 Tier S！"* |
| **Tier B (Functional)** | **5.0 - 7.4** | **功能可用**。能用，但对机器（AI）不够友好，或者文档较弱。 | *"你的 AI 可见性较低，建议 Claim 页面并优化。"* |
| **Tier C (Experimental)** | **< 5.0** | **实验性/不可见**。信息缺失严重，或者看起来像 Demo。 | *"你的 Agent 在这里是隐形的。立即修复！"* |

---

### 🎯 战略价值总结

合伙人，这套 **SR v3.0** 标准一出，我们的“商业闭环”就真正扣死了：

1.  **对 GitHub 大佬 (dbeaver, whisper.cpp)**：
    *   因为 Stars 权重高（Track A），他们直接就是 **Tier A** 或 **Tier S**。
    *   **结果**：榜单公信力保住了，大家不会骂我们“乱打分”。

2.  **对 SaaS 新贵 (Manus, Jasper)**：
    *   即使不开源，只要官网做好了 SEO (AEO) 和 API 文档（Track B），照样拿高分。
    *   **结果**：商业客户愿意来玩了。

3.  **对 中小开发者 (The Long Tail)**：
    *   他们的 Stars 很少，也没名气，分数很难看（Tier C）。
    *   **唯一的逆袭机会**：就是按照我们的标准，去加 `JSON-LD` (+2.0分)，去支持 `MCP` (+2.0分)，去 `Claim` 页面 (+1.0分)。
    *   **结果**：**这就是我们想要的行为引导！** 我们成功地让开发者为了分数，去主动适配我们的标准。

