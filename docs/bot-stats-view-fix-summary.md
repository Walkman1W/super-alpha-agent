# Bot Stats View 修复总结

## 问题
应用报错：`PGRST205: Could not find the table 'public.bot_stats_7d' in the schema cache`

## 原因
数据库视图 `bot_stats_7d` 未创建，虽然迁移文件存在但未应用到 Supabase 数据库。

## 解决方案

### 1. 使用 Supabase MCP 应用迁移
通过 Supabase MCP 工具直接在托管数据库上执行了迁移：
- 创建了 `bot_stats_7d` 视图
- 添加了 `security_invoker = true` 以修复安全问题

### 2. 更新本地迁移文件
更新了 `supabase/migrations/create_bot_stats_view.sql`，添加了安全配置：
```sql
CREATE OR REPLACE VIEW bot_stats_7d
WITH (security_invoker = true)
AS ...
```

### 3. 验证修复
创建并运行了验证脚本 `scripts/verify-bot-stats-view.js`：
- ✅ 视图可访问
- ✅ 插入测试数据成功
- ✅ 统计计算正确

## 结果
- ✅ 错误已消除
- ✅ Bot 统计功能正常工作
- ✅ 安全问题已修复（使用 SECURITY INVOKER）

## 相关文件
- `supabase/migrations/create_bot_stats_view.sql` - 迁移文件（已更新）
- `scripts/verify-bot-stats-view.js` - 验证脚本（新建）
- `scripts/apply-bot-stats-migration.js` - 迁移应用脚本（新建）
- `docs/fix-bot-stats-view-error.md` - 详细修复指南（新建）

## 测试数据
验证脚本插入了示例数据并确认视图正常工作：
- GPTBot: 3 次访问，7 天内 2 次，增长率 100%
- ClaudeBot: 1 次访问，7 天内 1 次，增长率 0%
