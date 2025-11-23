# Step 3 — 详情页 Tab 化与 GEO 洞察

## 目标
- 为详情页右侧内容增加 Tab，提供基础信息与 GEO 深度分析视图。

## 工作内容
1. `components/AgentDetail.tsx`
   - 右侧改为 Tab 结构：
     - `Overview`：保留描述、访问按钮、结构化数据网格（能力/定价/API 状态）、JSON-LD 预览。
     - `GEO Insights & Analysis`：展示竞争者列表、优化建议、关键词缺口标签、流量潜力（仪表或指标）。
   - 保持暗色/赛博朋克 + 玻璃拟态视觉风格。
2. 文案与多语言
   - 若尚未添加，请确保 `data/locales.ts` 包含 GEO 相关键值的中英翻译（如 GEO Score、Insights、Competitors、Traffic Potential、Keyword Gap 等），并在组件中引用。
3. 数据依赖
   - 若 Step 1 未执行，在本步骤中确保 `Agent` 数据具备 `geoScore`、`category`、`competitors`、`geoInsights` 等字段，供 Insights 视图使用。

## 输出文件
- `components/AgentDetail.tsx`
- （如需要）`data/locales.ts`
