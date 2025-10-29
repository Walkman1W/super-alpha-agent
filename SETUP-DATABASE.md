# 数据库设置指南

## 🚨 重要：必须先设置数据库

在运行爬虫之前，需要先在 Supabase 创建数据库表。

## 📋 步骤

### 1. 登录 Supabase Dashboard

访问：https://supabase.com/dashboard

选择你的项目：`shopo-alpha-agent`

### 2. 打开 SQL Editor

在左侧菜单点击 **SQL Editor**

### 3. 执行数据库 Schema

点击 **New Query**，复制粘贴以下 SQL：

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
    
    -- 基础信息
    short_description TEXT NOT NULL,
    detailed_description TEXT,
    
    -- 结构化数据
    key_features JSONB DEFAULT '[]',
    use_cases JSONB DEFAULT '[]',
    pros JSONB DEFAULT '[]',
    cons JSONB DEFAULT '[]',
    
    -- 使用信息
    how_to_use TEXT,
    platform VARCHAR(100),
    pricing VARCHAR(50),
    official_url TEXT,
    
    -- SEO/GEO
    keywords TEXT[],
    search_terms TEXT[],
    
    -- 统计
    view_count INTEGER DEFAULT 0,
    favorite_count INTEGER DEFAULT 0,
    ai_search_count INTEGER DEFAULT 0,
    
    -- 元数据
    source VARCHAR(100),
    source_id TEXT,
    last_crawled_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_agents_category ON agents(category_id);
CREATE INDEX IF NOT EXISTS idx_agents_slug ON agents(slug);
CREATE INDEX IF NOT EXISTS idx_agents_created_at ON agents(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_agents_ai_search_count ON agents(ai_search_count DESC);

-- 创建更新时间触发器
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_agents_updated_at BEFORE UPDATE ON agents
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

点击 **Run** 执行。

### 4. 初始化分类数据

回到项目目录，运行：

```bash
node scripts/init-categories.js
```

你应该看到：
```
✅ Created: 开发工具
✅ Created: 内容创作
✅ Created: 数据分析
...
✨ Categories initialized!
   ✅ Success: 10
```

### 5. 运行爬虫

```bash
npm run crawler
```

你应该看到：
```
📝 Analyzing: Code Reviewer Pro
✅ Created: Code Reviewer Pro
📝 Analyzing: Content Writer AI
✅ Created: Content Writer AI
...
✨ Crawler completed!
   ✅ Success: 10
```

### 6. 查看结果

访问：http://localhost:3000

你应该看到 10 个 Agent 卡片！

## 🔍 验证数据库

在 Supabase Dashboard → Table Editor：

1. 点击 **categories** 表
   - 应该有 10 行数据
   - 包含：开发工具、内容创作、数据分析等

2. 点击 **agents** 表
   - 运行爬虫后应该有 10 行数据
   - 每行包含完整的 Agent 信息

## 🚨 常见问题

### Q: 执行 SQL 时报错
**A**: 确保：
- 已登录正确的 Supabase 项目
- SQL 语法正确（复制粘贴完整的 SQL）
- 没有语法错误

### Q: init-categories 报错 "table not found"
**A**: 说明第 3 步的 SQL 没有执行成功，重新执行。

### Q: 爬虫报错 "Category not found"
**A**: 说明第 4 步没有成功，重新运行 `node scripts/init-categories.js`

### Q: 页面显示 "暂无 Agent 数据"
**A**: 说明第 5 步爬虫没有成功运行，检查：
- OpenRouter API Key 是否正确
- Supabase 连接是否正常
- 查看爬虫输出的错误信息

## 📊 数据库结构

### categories 表
```
id          | UUID    | 主键
name        | VARCHAR | 分类名称（如：开发工具）
slug        | VARCHAR | URL 友好名称（如：development）
description | TEXT    | 分类描述
icon        | VARCHAR | 图标 emoji
created_at  | TIMESTAMP | 创建时间
```

### agents 表
```
id                  | UUID      | 主键
slug                | VARCHAR   | URL 友好名称
name                | VARCHAR   | Agent 名称
category_id         | UUID      | 分类 ID（外键）
short_description   | TEXT      | 简短描述
detailed_description| TEXT      | 详细描述
key_features        | JSONB     | 核心功能数组
use_cases           | JSONB     | 使用场景数组
pros                | JSONB     | 优点数组
cons                | JSONB     | 缺点数组
how_to_use          | TEXT      | 使用方法
platform            | VARCHAR   | 平台（如：GPT Store）
pricing             | VARCHAR   | 价格（免费/付费/Freemium）
official_url        | TEXT      | 官方链接
keywords            | TEXT[]    | 关键词数组
search_terms        | TEXT[]    | 搜索词数组
view_count          | INTEGER   | 浏览次数
favorite_count      | INTEGER   | 收藏次数
ai_search_count     | INTEGER   | AI 搜索次数
source              | VARCHAR   | 数据来源
source_id           | TEXT      | 来源 ID
last_crawled_at     | TIMESTAMP | 最后爬取时间
created_at          | TIMESTAMP | 创建时间
updated_at          | TIMESTAMP | 更新时间
```

## ✅ 完成检查清单

- [ ] 在 Supabase Dashboard 执行 SQL
- [ ] 运行 `node scripts/init-categories.js`
- [ ] 验证 categories 表有 10 行数据
- [ ] 运行 `npm run crawler`
- [ ] 验证 agents 表有 10 行数据
- [ ] 访问 http://localhost:3000 查看结果

---

完成这些步骤后，你的数据库就设置好了！🎉
