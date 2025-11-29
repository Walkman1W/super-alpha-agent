# 搜索分析系统使用指南

## 概述

搜索分析系统帮助你了解用户搜索行为，优化Agent推荐算法，发现新的市场需求。

## 数据库表结构

### search_logs 表

主要字段说明：

- **搜索内容**
  - `query`: 用户输入的原始搜索词
  - `normalized_query`: 标准化后的搜索词（用于统计）
  - `language`: 搜索语言（zh/en）

- **用户信息**（匿名化）
  - `session_id`: 会话ID（基于IP+UA生成）
  - `fingerprint`: 浏览器指纹
  - `ip_address`: IP地址

- **搜索结果**
  - `results_count`: 返回结果数量
  - `has_results`: 是否有结果
  - `clicked_agents`: 点击的Agent ID数组
  - `clicked_positions`: 点击位置数组

- **用户行为**
  - `time_spent_seconds`: 停留时间
  - `bounce`: 是否跳出（无点击）

## API 接口

### 记录搜索行为

```typescript
POST /api/search-log

{
  "query": "代码生成工具",
  "resultsCount": 5,
  "hasResults": true,
  "clickedAgents": ["agent-id-1", "agent-id-2"],
  "clickedPositions": [0, 2],
  "timeSpent": 45,
  "bounce": false
}
```

### 获取搜索统计

```typescript
// 热门搜索词
GET /api/search-log?type=popular&days=7

// 无结果搜索
GET /api/search-log?type=zero-results&days=7

// 搜索趋势
GET /api/search-log?type=trends&days=30
```

## 前端集成

### 1. 使用 Hook

```typescript
import { useSearchAnalytics } from '@/lib/hooks/use-search-analytics'

function SearchPage() {
  const {
    trackSearchStart,
    trackAgentClick,
    trackSearchResults,
    trackPageLeave
  } = useSearchAnalytics()

  const handleSearch = async (query: string) => {
    // 1. 记录搜索开始
    trackSearchStart(query)
    
    // 2. 执行搜索
    const results = await searchAgents(query)
    
    // 3. 记录搜索结果
    await trackSearchResults({
      query,
      resultsCount: results.length,
      hasResults: results.length > 0
    })
  }

  const handleAgentClick = (agentId: string, position: number) => {
    // 记录点击
    trackAgentClick(agentId, position)
  }

  return (
    // 搜索界面
  )
}
```

### 2. 自动跟踪页面离开

```typescript
import { useSearchAnalyticsAutoTrack } from '@/lib/hooks/use-search-analytics'

function SearchPage() {
  const analytics = useSearchAnalyticsAutoTrack() // 自动处理页面离开事件
  // ...
}
```

## 管理后台

### 搜索分析仪表板

```typescript
import { SearchAnalyticsDashboard } from '@/components/admin/search-analytics-dashboard'

function AdminPage() {
  return (
    <div>
      <h1>搜索分析</h1>
      <SearchAnalyticsDashboard />
    </div>
  )
}
```

## 数据分析视图

### 1. 热门搜索词

```sql
SELECT * FROM popular_searches;
```

显示最近30天的热门搜索词，包括：
- 搜索次数
- 独立用户数
- 平均结果数
- 成功率

### 2. 无结果搜索

```sql
SELECT * FROM zero_result_searches;
```

发现用户需求但平台缺少的Agent类型。

### 3. 搜索趋势

```sql
SELECT * FROM search_trends;
```

查看每日搜索量、用户数、成功率等趋势数据。

## 数据库初始化

在Supabase中执行SQL文件：

```bash
# 1. 创建搜索记录表
psql -h your-db-host -U postgres -d postgres -f supabase/search_logs.sql

# 或在Supabase Dashboard的SQL Editor中直接执行
```

## 使用场景

### 1. 优化搜索算法

分析热门搜索词，了解用户真实需求：

```sql
-- 查看最近7天热门搜索
SELECT * FROM popular_searches LIMIT 20;
```

### 2. 发现市场机会

找出无结果搜索，发现新的Agent需求：

```sql
-- 查看无结果搜索
SELECT * FROM zero_result_searches 
WHERE search_count >= 5
ORDER BY search_count DESC;
```

### 3. 改进用户体验

分析跳出率和点击行为：

```sql
-- 查看高跳出率的搜索词
SELECT 
  normalized_query,
  COUNT(*) as total,
  COUNT(*) FILTER (WHERE bounce = true) * 100.0 / COUNT(*) as bounce_rate
FROM search_logs
WHERE created_at >= NOW() - INTERVAL '7 days'
GROUP BY normalized_query
HAVING COUNT(*) >= 10
ORDER BY bounce_rate DESC
LIMIT 20;
```

### 4. 个性化推荐

基于用户搜索历史提供个性化推荐：

```sql
-- 查看用户搜索历史
SELECT 
  normalized_query,
  COUNT(*) as search_count,
  MAX(created_at) as last_search
FROM search_logs
WHERE session_id = 'user-session-id'
GROUP BY normalized_query
ORDER BY last_search DESC;
```

## 隐私保护

系统采用匿名化设计：

- 不存储真实用户身份
- 使用会话ID和浏览器指纹代替用户ID
- IP地址仅用于地理位置分析
- 可配置数据保留期限（建议1年）

## 性能优化

### 索引策略

已创建的索引：

- 全文搜索索引（GIN）
- 时间范围索引
- 用户会话索引
- 复合索引（常见查询组合）

### 数据清理

定期清理旧数据：

```sql
-- 删除1年前的数据
DELETE FROM search_logs 
WHERE created_at < NOW() - INTERVAL '1 year';

-- 或使用分区表自动管理
```

## 最佳实践

1. **异步记录**：搜索日志记录不应阻塞用户操作
2. **批量处理**：高流量时考虑批量写入
3. **错误处理**：日志记录失败不应影响用户体验
4. **数据采样**：超高流量时可采样记录（如10%）
5. **定期分析**：每周查看分析报告，优化产品

## 示例查询

### 查找相似搜索词

```sql
-- 使用相似度查找相关搜索
SELECT 
  normalized_query,
  similarity(normalized_query, '代码生成') as sim,
  COUNT(*) as search_count
FROM search_logs
WHERE similarity(normalized_query, '代码生成') > 0.3
GROUP BY normalized_query
ORDER BY sim DESC, search_count DESC
LIMIT 10;
```

### 分析搜索转化率

```sql
-- 搜索到点击的转化率
SELECT 
  normalized_query,
  COUNT(*) as total_searches,
  COUNT(*) FILTER (WHERE array_length(clicked_agents, 1) > 0) as searches_with_clicks,
  COUNT(*) FILTER (WHERE array_length(clicked_agents, 1) > 0) * 100.0 / COUNT(*) as conversion_rate
FROM search_logs
WHERE created_at >= NOW() - INTERVAL '30 days'
  AND has_results = true
GROUP BY normalized_query
HAVING COUNT(*) >= 10
ORDER BY conversion_rate ASC
LIMIT 20;
```

### 用户搜索路径分析

```sql
-- 分析用户的搜索序列
WITH user_searches AS (
  SELECT 
    session_id,
    normalized_query,
    created_at,
    LAG(normalized_query) OVER (PARTITION BY session_id ORDER BY created_at) as prev_query
  FROM search_logs
  WHERE created_at >= NOW() - INTERVAL '7 days'
)
SELECT 
  prev_query,
  normalized_query as next_query,
  COUNT(*) as transition_count
FROM user_searches
WHERE prev_query IS NOT NULL
GROUP BY prev_query, normalized_query
ORDER BY transition_count DESC
LIMIT 20;
```

## 故障排查

### 日志未记录

1. 检查API端点是否正常：`curl -X POST http://localhost:3000/api/search-log`
2. 查看浏览器控制台错误
3. 检查Supabase连接和权限

### 统计数据不准确

1. 检查时区设置
2. 验证数据去重逻辑
3. 确认索引是否正常

### 性能问题

1. 检查索引使用情况：`EXPLAIN ANALYZE SELECT ...`
2. 考虑添加分区表
3. 启用查询缓存

## 扩展功能

### AI意图分析

可以添加AI分析搜索意图：

```typescript
// 在后台任务中分析搜索意图
async function analyzeSearchIntent(query: string) {
  const response = await openai.chat.completions.create({
    model: 'gpt-4',
    messages: [{
      role: 'user',
      content: `分析这个搜索词的用户意图：${query}
      
      返回JSON格式：
      {
        "intent_category": "找工具|学习|解决问题|比较选择",
        "intent_confidence": 0.95,
        "suggested_keywords": ["关键词1", "关键词2"]
      }`
    }]
  })
  
  return JSON.parse(response.choices[0].message.content)
}
```

### 实时搜索建议

基于热门搜索提供自动补全：

```typescript
// API: /api/search-suggestions?q=代码
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const query = searchParams.get('q') || ''
  
  const { data } = await supabaseAdmin
    .from('search_logs')
    .select('normalized_query, COUNT(*) as count')
    .ilike('normalized_query', `${query}%`)
    .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
    .groupBy('normalized_query')
    .orderBy('count', { ascending: false })
    .limit(10)
  
  return NextResponse.json({ suggestions: data })
}
```

## 总结

搜索分析系统帮助你：

✅ 了解用户真实需求  
✅ 优化搜索算法和推荐  
✅ 发现新的市场机会  
✅ 改进用户体验  
✅ 数据驱动产品决策

定期查看分析报告，持续优化你的Agent平台！
