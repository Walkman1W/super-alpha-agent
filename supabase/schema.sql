-- Shopo Alpha Agent 数据库结构

-- 启用 UUID 扩展
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 分类表
CREATE TABLE categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL UNIQUE,
    slug VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    icon VARCHAR(50),
    parent_id UUID REFERENCES categories(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Agent 表
CREATE TABLE agents (
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
    ai_search_count INTEGER DEFAULT 0,  -- 🆕 AI 搜索次数
    
    -- 元数据
    source VARCHAR(100),
    source_id VARCHAR(255),
    last_crawled_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- 索引
    CONSTRAINT agents_name_check CHECK (char_length(name) > 0)
);

-- 对比表
CREATE TABLE comparisons (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    slug VARCHAR(500) NOT NULL UNIQUE,
    agent_ids UUID[] NOT NULL,
    title VARCHAR(500) NOT NULL,
    content TEXT NOT NULL,
    view_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 用户收藏表
CREATE TABLE user_favorites (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    agent_id UUID NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, agent_id)
);

-- 用户提交表
CREATE TABLE user_submissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    agent_name VARCHAR(255) NOT NULL,
    agent_url TEXT NOT NULL,
    description TEXT,
    status VARCHAR(50) DEFAULT 'pending', -- pending, approved, rejected
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- AI 访问记录表（详细追踪）
CREATE TABLE ai_visits (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    agent_id UUID NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
    ai_name VARCHAR(100) NOT NULL,  -- ChatGPT, Claude, Perplexity, etc.
    user_agent TEXT,
    referer TEXT,
    search_query TEXT,  -- 用户的搜索词（如果有）
    ip_address INET,
    visited_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- 验证状态
    verified BOOLEAN DEFAULT FALSE,  -- 是否经过验证
    verification_method VARCHAR(50)  -- user_agent, user_report, api_token
);

-- 用户报告的 AI 来源
CREATE TABLE user_ai_reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    agent_id UUID NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
    ai_name VARCHAR(100) NOT NULL,
    search_query TEXT,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    ip_address INET,
    reported_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建索引
CREATE INDEX idx_agents_category ON agents(category_id);
CREATE INDEX idx_agents_platform ON agents(platform);
CREATE INDEX idx_agents_slug ON agents(slug);
CREATE INDEX idx_agents_created_at ON agents(created_at DESC);
CREATE INDEX idx_agents_ai_search_count ON agents(ai_search_count DESC);  -- 🆕 AI 搜索排序
CREATE INDEX idx_comparisons_slug ON comparisons(slug);
CREATE INDEX idx_user_favorites_user ON user_favorites(user_id);
CREATE INDEX idx_user_favorites_agent ON user_favorites(agent_id);
CREATE INDEX idx_ai_visits_agent ON ai_visits(agent_id);
CREATE INDEX idx_ai_visits_ai_name ON ai_visits(ai_name);
CREATE INDEX idx_ai_visits_visited_at ON ai_visits(visited_at DESC);

-- 全文搜索索引
CREATE INDEX idx_agents_search ON agents USING gin(
    to_tsvector('english', name || ' ' || COALESCE(short_description, '') || ' ' || COALESCE(detailed_description, ''))
);

-- 自动更新 updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_agents_updated_at BEFORE UPDATE ON agents
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_comparisons_updated_at BEFORE UPDATE ON comparisons
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 增加 AI 搜索计数的函数
CREATE OR REPLACE FUNCTION increment_ai_search_count(agent_id UUID)
RETURNS void AS $$
BEGIN
    UPDATE agents
    SET ai_search_count = ai_search_count + 1
    WHERE id = agent_id;
END;
$$ LANGUAGE plpgsql;

-- RLS (Row Level Security) 策略
ALTER TABLE agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_submissions ENABLE ROW LEVEL SECURITY;

-- 所有人可以读取 agents
CREATE POLICY "Anyone can view agents" ON agents
    FOR SELECT USING (true);

-- 用户只能管理自己的收藏
CREATE POLICY "Users can view own favorites" ON user_favorites
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own favorites" ON user_favorites
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own favorites" ON user_favorites
    FOR DELETE USING (auth.uid() = user_id);

-- 用户只能查看自己的提交
CREATE POLICY "Users can view own submissions" ON user_submissions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert submissions" ON user_submissions
    FOR INSERT WITH CHECK (auth.uid() = user_id);
