-- Migration: Add Signal Rank (SR) scoring fields to agents table
-- Date: 2025-12-09
-- Description: Extends agents table with SR scoring system for Agent Scanner MVP
-- Requirements: 9.1, 9.2

-- ============================================
-- SR 评分相关字段
-- ============================================

-- SR 总分 (0.0 - 10.0)
ALTER TABLE agents ADD COLUMN IF NOT EXISTS sr_score DECIMAL(3,1) DEFAULT 0.0;

-- SR 等级 (S/A/B/C)
ALTER TABLE agents ADD COLUMN IF NOT EXISTS sr_tier VARCHAR(1) DEFAULT 'C';

-- SR 轨道类型 (OpenSource/SaaS/Hybrid)
ALTER TABLE agents ADD COLUMN IF NOT EXISTS sr_track VARCHAR(20) DEFAULT 'SaaS';

-- Track A (GitHub) 分数
ALTER TABLE agents ADD COLUMN IF NOT EXISTS score_github DECIMAL(3,1) DEFAULT 0.0;

-- Track B (SaaS) 分数
ALTER TABLE agents ADD COLUMN IF NOT EXISTS score_saas DECIMAL(3,1) DEFAULT 0.0;

-- 详细评分明细 (JSONB)
ALTER TABLE agents ADD COLUMN IF NOT EXISTS score_breakdown JSONB DEFAULT '{}';

-- ============================================
-- 标志位字段
-- ============================================

-- 是否支持 MCP (Model Context Protocol)
ALTER TABLE agents ADD COLUMN IF NOT EXISTS is_mcp BOOLEAN DEFAULT FALSE;

-- 是否已认领
ALTER TABLE agents ADD COLUMN IF NOT EXISTS is_claimed BOOLEAN DEFAULT FALSE;

-- 是否已验证
ALTER TABLE agents ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT FALSE;

-- ============================================
-- I/O 模态字段
-- ============================================

-- 输入模态 (Text, Image, Audio, JSON, Code, File, Video)
ALTER TABLE agents ADD COLUMN IF NOT EXISTS input_types TEXT[] DEFAULT '{}';

-- 输出模态 (Text, Image, Audio, JSON, Code, File, Video)
ALTER TABLE agents ADD COLUMN IF NOT EXISTS output_types TEXT[] DEFAULT '{}';

-- ============================================
-- 额外元数据字段
-- ============================================

-- Meta 标题
ALTER TABLE agents ADD COLUMN IF NOT EXISTS meta_title VARCHAR(255);

-- Meta 描述
ALTER TABLE agents ADD COLUMN IF NOT EXISTS meta_description TEXT;

-- OG 图片 URL
ALTER TABLE agents ADD COLUMN IF NOT EXISTS og_image VARCHAR(500);

-- JSON-LD 结构化数据
ALTER TABLE agents ADD COLUMN IF NOT EXISTS json_ld JSONB;

-- 主页 URL (用于 SaaS 扫描)
ALTER TABLE agents ADD COLUMN IF NOT EXISTS homepage_url VARCHAR(500);

-- API 文档 URL
ALTER TABLE agents ADD COLUMN IF NOT EXISTS api_docs_url VARCHAR(500);

-- GitHub Forks 数量
ALTER TABLE agents ADD COLUMN IF NOT EXISTS github_forks INTEGER DEFAULT 0;

-- GitHub 最后提交时间
ALTER TABLE agents ADD COLUMN IF NOT EXISTS github_last_commit TIMESTAMP WITH TIME ZONE;

-- 最后扫描时间
ALTER TABLE agents ADD COLUMN IF NOT EXISTS last_scanned_at TIMESTAMP WITH TIME ZONE;

-- ============================================
-- 约束检查
-- ============================================

DO $$
BEGIN
    -- sr_score 范围约束 (0.0 - 10.0)
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'check_sr_score_range'
    ) THEN
        ALTER TABLE agents ADD CONSTRAINT check_sr_score_range 
            CHECK (sr_score >= 0.0 AND sr_score <= 10.0);
    END IF;

    -- sr_tier 值约束
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'check_sr_tier'
    ) THEN
        ALTER TABLE agents ADD CONSTRAINT check_sr_tier 
            CHECK (sr_tier IN ('S', 'A', 'B', 'C'));
    END IF;

    -- sr_track 值约束
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'check_sr_track'
    ) THEN
        ALTER TABLE agents ADD CONSTRAINT check_sr_track 
            CHECK (sr_track IN ('OpenSource', 'SaaS', 'Hybrid'));
    END IF;

    -- score_github 范围约束
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'check_score_github_range'
    ) THEN
        ALTER TABLE agents ADD CONSTRAINT check_score_github_range 
            CHECK (score_github >= 0.0 AND score_github <= 10.0);
    END IF;

    -- score_saas 范围约束
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'check_score_saas_range'
    ) THEN
        ALTER TABLE agents ADD CONSTRAINT check_score_saas_range 
            CHECK (score_saas >= 0.0 AND score_saas <= 10.0);
    END IF;
END $$;

-- ============================================
-- 索引优化
-- ============================================

-- SR 分数降序索引 (用于排行榜)
CREATE INDEX IF NOT EXISTS idx_agents_sr_score ON agents(sr_score DESC);

-- 已验证状态索引 (用于过滤)
CREATE INDEX IF NOT EXISTS idx_agents_is_verified ON agents(is_verified);

-- SR 等级索引
CREATE INDEX IF NOT EXISTS idx_agents_sr_tier ON agents(sr_tier);

-- SR 轨道索引
CREATE INDEX IF NOT EXISTS idx_agents_sr_track ON agents(sr_track);

-- MCP 支持索引
CREATE INDEX IF NOT EXISTS idx_agents_is_mcp ON agents(is_mcp);

-- 已认领状态索引
CREATE INDEX IF NOT EXISTS idx_agents_is_claimed ON agents(is_claimed);

-- 最后扫描时间索引 (用于缓存检查)
CREATE INDEX IF NOT EXISTS idx_agents_last_scanned_at ON agents(last_scanned_at DESC);

-- 复合索引: SR 分数 + 已验证 (常用查询优化)
CREATE INDEX IF NOT EXISTS idx_agents_sr_verified ON agents(sr_score DESC, is_verified);

-- ============================================
-- 字段注释
-- ============================================

COMMENT ON COLUMN agents.sr_score IS 'Signal Rank 总分 (0.0-10.0): Agent 在 AI 经济体中的可见性和可连接性评分';
COMMENT ON COLUMN agents.sr_tier IS 'SR 等级: S(9.0-10.0), A(7.5-8.9), B(5.0-7.4), C(<5.0)';
COMMENT ON COLUMN agents.sr_track IS 'SR 轨道类型: OpenSource(GitHub), SaaS(商业产品), Hybrid(混合型)';
COMMENT ON COLUMN agents.score_github IS 'Track A (GitHub) 评分: 基于社区信任度和机器就绪度';
COMMENT ON COLUMN agents.score_saas IS 'Track B (SaaS) 评分: 基于 AI 可见性和互操作性';
COMMENT ON COLUMN agents.score_breakdown IS 'SR 评分明细 JSON: {starsScore, forksScore, vitalityScore, readinessScore, protocolScore, trustScore, aeoScore, interopScore}';
COMMENT ON COLUMN agents.is_mcp IS '是否支持 Model Context Protocol (MCP)';
COMMENT ON COLUMN agents.is_claimed IS '是否已被开发者认领';
COMMENT ON COLUMN agents.is_verified IS '是否已验证所有权';
COMMENT ON COLUMN agents.input_types IS '输入模态数组: Text, Image, Audio, JSON, Code, File, Video';
COMMENT ON COLUMN agents.output_types IS '输出模态数组: Text, Image, Audio, JSON, Code, File, Video';
COMMENT ON COLUMN agents.meta_title IS 'SEO Meta 标题';
COMMENT ON COLUMN agents.meta_description IS 'SEO Meta 描述';
COMMENT ON COLUMN agents.og_image IS 'Open Graph 图片 URL';
COMMENT ON COLUMN agents.json_ld IS 'JSON-LD 结构化数据';
COMMENT ON COLUMN agents.homepage_url IS 'Agent 主页 URL (用于 SaaS 扫描)';
COMMENT ON COLUMN agents.api_docs_url IS 'API 文档 URL';
COMMENT ON COLUMN agents.github_forks IS 'GitHub Fork 数量';
COMMENT ON COLUMN agents.github_last_commit IS 'GitHub 最后提交时间';
COMMENT ON COLUMN agents.last_scanned_at IS '最后扫描时间 (用于缓存判断)';
