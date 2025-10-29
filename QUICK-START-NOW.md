# 🚀 立即开始

## 当前状态

✅ 前端页面已完成
✅ OpenRouter API 已配置
✅ 爬虫脚本已准备好
⚠️ **数据库还未初始化**

## 📋 只需 3 步

### 步骤 1: 在 Supabase 创建数据库表

1. 访问 https://supabase.com/dashboard
2. 选择你的项目
3. 点击左侧 **SQL Editor**
4. 点击 **New Query**
5. 复制粘贴 `supabase/schema.sql` 的全部内容
6. 点击 **Run** 执行

### 步骤 2: 初始化分类数据

在项目目录运行：

```bash
node scripts/init-categories.js
```

应该看到：
```
✅ Created: 开发工具
✅ Created: 内容创作
...
✨ Categories initialized!
   ✅ Success: 10
```

### 步骤 3: 运行爬虫

```bash
npm run crawler
```

应该看到：
```
📝 Analyzing: Code Reviewer Pro
✅ Created: Code Reviewer Pro
...
✨ Crawler completed!
   ✅ Success: 10
```

## 🎉 完成！

访问 http://localhost:3000

你会看到：
- 大气的渐变 Hero 区域
- 10 个分类卡片
- 10 个 Agent 详细卡片
- 结构化的 FAQ

## 📊 验证数据

在 Supabase Dashboard → Table Editor：

1. **categories** 表 - 应该有 10 行
2. **agents** 表 - 应该有 10 行

## 🔧 如果遇到问题

### 问题 1: SQL 执行失败
- 确保复制了完整的 SQL
- 检查是否有语法错误
- 尝试分段执行

### 问题 2: init-categories 报错
```
❌ Error: Could not find the table 'public.categories'
```
**解决**: 步骤 1 的 SQL 没有成功执行，重新执行。

### 问题 3: 爬虫报错
```
Category not found: development
```
**解决**: 步骤 2 没有成功，重新运行 `node scripts/init-categories.js`

### 问题 4: OpenRouter API 错误
```
❌ AI analysis error: ...
```
**解决**: 检查 `.env` 文件中的 API Key 是否正确。

## 📝 完整的 SQL（步骤 1 使用）

如果你不想打开 `supabase/schema.sql`，这里是完整的 SQL：

```sql
-- 启用 UUID 扩展
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 分类表
CREATE TABLE IF NOT EXISTS categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL UNIQUE,
    slug VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    icon VARCHAR(50),
    parent_id UUID REFERENCES categories(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Agent 表
CREATE TABLE IF NOT EXISTS agents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    slug VARCHAR(255) NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    category_id UUID REFERENCES categories(id),
    short_description TEXT NOT NULL,
    detailed_description TEXT,
    key_features JSONB DEFAULT '[]',
    use_cases JSONB DEFAULT '[]',
    pros JSONB DEFAULT '[]',
    cons JSONB DEFAULT '[]',
    how_to_use TEXT,
    platform VARCHAR(100),
    pricing VARCHAR(50),
    official_url TEXT,
    keywords TEXT[],
    search_terms TEXT[],
    view_count INTEGER DEFAULT 0,
    favorite_count INTEGER DEFAULT 0,
    ai_search_count INTEGER DEFAULT 0,
    source VARCHAR(100),
    source_id VARCHAR(255),
    last_crawled_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_agents_category ON agents(category_id);
CREATE INDEX IF NOT EXISTS idx_agents_slug ON agents(slug);
CREATE INDEX IF NOT EXISTS idx_agents_created_at ON agents(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_agents_ai_search_count ON agents(ai_search_count DESC);

-- 自动更新时间触发器
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_agents_updated_at BEFORE UPDATE ON agents
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- RLS 策略
ALTER TABLE agents ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view agents" ON agents FOR SELECT USING (true);
```

## 🎯 预期结果

完成后，你的网站应该：

1. **首页 Hero** - 显示 "精选 10+ 个 AI 智能助手"
2. **分类导航** - 10 个分类卡片（开发工具、内容创作等）
3. **Agent 展示** - 10 个详细的 Agent 卡片
4. **每个卡片包含**:
   - 名称和平台标签
   - 简短描述
   - 核心功能（3个）
   - 优势（2个）
   - 适用场景
   - 价格和访问链接

## 📚 相关文档

- `SETUP-DATABASE.md` - 详细的数据库设置说明
- `FRONTEND-COMPLETE.md` - 前端设计说明
- `TEST-RESULTS.md` - OpenRouter 测试结果
- `DEPLOY-CHECKLIST.md` - 部署检查清单

---

**准备好了吗？开始步骤 1！** 🚀
