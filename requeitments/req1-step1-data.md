# Step 1 — 数据模型与基础文案

## 目标
- 扩展 Agent 数据模型，加入 GEO 相关字段，并在 mock 数据中填充。
- 补齐中英文文案键值，方便后续界面使用。

## 工作内容
1. `types.ts`
   - `Agent` 新增字段：`geoScore`(0-100 数值)、`category`(字符串)、`competitors`(string[])、`geoInsights`(对象，含如 `missingKeywords`、`trafficPotential` 等 mock 数据)。
2. `App.tsx`
   - `INITIAL_AGENTS` 为上述字段填充真实感 mock 数据。
3. `data/locales.ts`
   - 新增对应键值的中英翻译，如 “GEO Score”、“Category”、“Competitors”、“Insights”、“Traffic Potential”、“Keyword Gap” 等。

## 输出文件
- `types.ts`
- `App.tsx`
- `data/locales.ts`
