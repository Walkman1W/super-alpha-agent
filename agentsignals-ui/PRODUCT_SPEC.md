---

### 📋 Agent Signals v2.0 - Product Requirement Document (PRD)

**Project Codename**: The GEO Engine
**Target Audience**: Developers, AI Bots, Investors.
**Design Philosophy**: "Bloomberg Terminal" for the AI Economy. Dark, Dense, Data-driven.

---

### 1. 核心定位与品牌 (Identity)

*   **Brand Name**: AgentSignals
*   **Slogan (H1)**: Index the Intelligence Economy.
*   **Sub-slogan (H2)**: Powered by the **AgentSignals™ GEO Engine**.
*   **Visual Metaphor**: Radar Station. We detect signals (agents) in the noise.
*   **Key Vibe**:
    *   **Dark Mode Only**: Background `#050505` (Zinc 950).
    *   **Monospace**: All numbers, IDs, and tags use `JetBrains Mono` or `Geist Mono`.
    *   **High Density**: Small padding, visible borders (`1px solid #333`), compact grids.

---

### 2. 数据架构标准 (The "Signal" Standard)

我们需要在数据库（Supabase）中严格执行以下分类标准，这是产品的核心壁垒。

#### A. 实体类型 (Entity Type)
用于定义 Agent 的交付形态和监测逻辑。
*   `repo` (Code): GitHub/GitLab 开源项目。
    *   *Health Check*: `last_commit_at` < 7 days = Online.
    *   *Key Metric*: Stars, Forks.
*   `saas` (Endpoint): 网页版或 API 服务。
    *   *Health Check*: HTTP Ping (Head Request) return 200 OK.
    *   *Key Metric*: Latency (ms), Uptime (%).
*   `app` (Application): 本地软件或移动端 App。
    *   *Health Check*: `last_version_update` < 30 days.
    *   *Key Metric*: Version Number, Platform (iOS/Mac/Win).

#### B. 智能分级 (Autonomy Levels - L1 to L5)
参考自动驾驶分级，定义 Agent 的自主程度。
*   `L1_Assisted`: **Script/Prompt**. 人输入指令 -> AI 执行单一任务 (e.g., GPTs).
*   `L2_Copilot`: **Co-pilot**. 理解上下文，辅助建议，需人类确认 (e.g., GitHub Copilot).
*   `L3_Chained`: **Agentic Workflow**. 自动拆解任务，执行线性流程 (e.g., BabyAGI).
*   `L4_Autonomous`: **Independent**. 自主联网、纠错、闭环解决问题 (e.g., Devin, AutoGPT).
*   `L5_Swarm`: **Multi-Agent**. 多智能体协作，具备组织架构 (e.g., MetaGPT).

#### C. GEO 评分算法 (Signal Score: 0-100)
这是一个计算字段，用于排序。
*   **Algorithm**:
    *   `Base`: 50 points.
    *   `+ Vitality`: 20 points (Based on Uptime or Recency).
    *   `+ Influence`: 10 points (Based on Stars/Traffic).
    *   `+ Metadata`: 10 points (Has complete JSON-LD, Tags, Description).
    *   `+ Autonomy`: L1=0, L2=2, L3=5, L4=8, L5=10.

---

### 3. UI/UX 详细实施规范 (Implementation)

#### 3.1 首页 (The Terminal Grid) - 参考 Image 7 & 8
*   **Hero Section**:
    *   Left: H1 "Index the Intelligence Economy".
    *   Right: A looping animation of **Raw JSON Data** scrolling (Matrix style), implying we are processing data.
    *   Stats: Display "Live Signals: 1,542", "API Calls: 24h", "Avg Latency: 400ms".
*   **Card Design (The Signal Card)**:
    *   **Border**: `1px solid #27272a` (Zinc 800).
    *   **Header**: Agent Name + Status Dot (🟢 Online / 🔴 Offline).
    *   **Badge**: `[Type Icon] [L-Level]` (e.g., 📦 L4).
    *   **Data Row (Monospace)**:
        *   Repo: `⭐ 3.2k` | `Last push: 2h ago`
        *   SaaS: `⚡ 120ms` | `Uptime: 99.9%`
    *   **Tech Stack**: Small tags at bottom (e.g., `#LangChain`, `#Python`).
*   **Sidebar**:
    *   Filter by: Category (Finance/Coding), Tech Stack, Autonomy Level (L1-L5).

#### 3.2 详情页 (The Inspector) - 参考 Image 6
*   **Interaction**: Modal / Drawer (Slide-over).
*   **Visuals**:
    *   **Radar Chart**: 5 dimensions (Coding, Writing, Reasoning, Speed, Stability).
    *   **API Snippet**: A code block showing how to connect/invoke this agent (or a simulated JSON response).
*   **Call to Action**: "Visit Site" (Secondary) -> "Claim This Signal" (Primary, outlining the verification logic).

#### 3.3 发布页 (The Publisher) - 参考 Image 1
*   **Split View**:
    *   Left: Input Form (URL, Name, Description).
    *   Right: **Live JSON-LD Preview**.
*   **Validation**: Real-time checking. If URL is valid, show green tick.

---

### 4. 技术栈指令 (Tech Stack Hints)

*   **Frontend**: Next.js 14 (App Router), Tailwind CSS, Shadcn/UI (for base components), Lucide Icons.
*   **Visuals**: Recharts (for Radar Chart), Framer Motion (for smooth transitions).
*   **Backend**: Supabase (Postgres).
*   **Search**: Supabase pgvector (for "Related Signals").
*   **Font**: Add `JetBrains Mono` to `tailwind.config.ts`.

---

### 🚀 给 AI 的启动 Prompt (直接复制这个)

> **Role**: You are a Senior Product Engineer specializing in "Bloomberg-style" data dashboards.
>
> **Goal**: Refactor the current "Agent Signals" project into a high-density, dark-mode "AI Data Terminal".
>
> **Reference**: Please read the `PRODUCT_SPEC.md` (above) carefully.
>
> **Immediate Tasks**:
> 1.  **Update Theme**: Enforce Zinc-950 background and JetBrains Mono font globally.
> 2.  **Update Database**: Modify the Supabase schema to include `type` (repo/saas/app), `autonomy_level` (L1-L5), and `metrics` JSONB.
> 3.  **Refactor Home**: Implement the "Grid Card" layout. Replace the old "App Store" style cards with the new "Signal Cards" that display Latency/Stars and L-Levels.
> 4.  **Mock Data**: create a seed script with 10 dummy agents covering different types (L4 Repo, L2 SaaS, L5 Swarm) to test the UI.
>
> Let's build the engine. Start by confirming you understand the "Signal Standard".

---

