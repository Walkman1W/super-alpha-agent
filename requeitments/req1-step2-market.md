# Step 2 — Agent 市场与排行榜

## 目标
- 按总曝光量构建可视化排行榜，提升卡片信息密度与层级感。

## 工作内容
1. `components/AgentMarket.tsx`
   - 列表/网格严格按 `Total Hits` 降序排序。
2. `components/AgentCard.tsx`
   - 显示 GEO Score（区间配色：>90 绿色，>70 黄色，其他保持中性）。
   - 显示 Category 徽章；保留五色进度条（Gemini/GPT/Claude/Perplexity/Tavily）。
   - 排名前三应用金/银/铜边框光晕与徽章。
   - 悬停时展示更多技术统计信息。
   - 视觉风格保持暗色/赛博朋克 + 玻璃拟态（backdrop-blur）。
3. 如果 Step 1 未执行，请在本步骤中确保需要的字段（`geoScore`、`category`、`competitors`、`geoInsights`）已存在并被卡片使用。

## 输出文件
- `components/AgentMarket.tsx`
- `components/AgentCard.tsx`
