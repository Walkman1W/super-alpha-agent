-- Terminal UI 字段扩展迁移
-- 为 agents 表添加 entity_type, autonomy_level, metrics, status, rank, framework, geo_score 字段

-- 添加 entity_type 字段 (repo/saas/app)
ALTER TABLE agents ADD COLUMN IF NOT EXISTS entity_type VARCHAR(10) DEFAULT 'saas';

-- 添加 autonomy_level 字段 (L1-L5)
ALTER TABLE agents ADD COLUMN IF NOT EXISTS autonomy_level VARCHAR(5) DEFAULT 'L2';

-- 添加 metrics JSONB 字段 (latency, uptime, stars, forks, cost 等)
ALTER TABLE agents ADD COLUMN IF NOT EXISTS metrics JSONB DEFAULT '{}';

-- 添加 status 字段 (online/offline/maintenance)
ALTER TABLE agents ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'online';

-- 添加 rank 字段 (排名)
ALTER TABLE agents ADD COLUMN IF NOT EXISTS rank INTEGER DEFAULT 999;

-- 添加 framework 字段 (LangChain, AutoGPT 等)
ALTER TABLE agents ADD COLUMN IF NOT EXISTS framework VARCHAR(50);

-- 添加 geo_score 字段 (0-100 评分)
ALTER TABLE agents ADD COLUMN IF NOT EXISTS geo_score INTEGER DEFAULT 50;

-- 添加 tags 字段 (标签数组)
ALTER TABLE agents ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}';

-- 添加约束检查 (使用 DO 块避免重复添加约束错误)
DO $$
BEGIN
    -- entity_type 约束
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'check_entity_type'
    ) THEN
        ALTER TABLE agents ADD CONSTRAINT check_entity_type 
            CHECK (entity_type IN ('repo', 'saas', 'app'));
    END IF;

    -- autonomy_level 约束
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'check_autonomy_level'
    ) THEN
        ALTER TABLE agents ADD CONSTRAINT check_autonomy_level 
            CHECK (autonomy_level IN ('L1', 'L2', 'L3', 'L4', 'L5'));
    END IF;

    -- status 约束
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'check_status'
    ) THEN
        ALTER TABLE agents ADD CONSTRAINT check_status 
            CHECK (status IN ('online', 'offline', 'maintenance'));
    END IF;

    -- geo_score 范围约束
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'check_geo_score_range'
    ) THEN
        ALTER TABLE agents ADD CONSTRAINT check_geo_score_range 
            CHECK (geo_score >= 0 AND geo_score <= 100);
    END IF;

    -- rank 正数约束
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'check_rank_positive'
    ) THEN
        ALTER TABLE agents ADD CONSTRAINT check_rank_positive 
            CHECK (rank > 0);
    END IF;
END $$;

-- 创建索引以优化查询
CREATE INDEX IF NOT EXISTS idx_agents_entity_type ON agents(entity_type);
CREATE INDEX IF NOT EXISTS idx_agents_autonomy_level ON agents(autonomy_level);
CREATE INDEX IF NOT EXISTS idx_agents_status ON agents(status);
CREATE INDEX IF NOT EXISTS idx_agents_rank ON agents(rank);
CREATE INDEX IF NOT EXISTS idx_agents_geo_score ON agents(geo_score DESC);
CREATE INDEX IF NOT EXISTS idx_agents_framework ON agents(framework);

-- 添加注释
COMMENT ON COLUMN agents.entity_type IS 'Agent 交付形态: repo(代码仓库), saas(网页服务), app(本地应用)';
COMMENT ON COLUMN agents.autonomy_level IS 'Agent 自主程度: L1(最低) 到 L5(最高)';
COMMENT ON COLUMN agents.metrics IS 'Agent 指标数据: {latency, uptime, stars, forks, cost, lastCommit, lastPing}';
COMMENT ON COLUMN agents.status IS 'Agent 状态: online(在线), offline(离线), maintenance(维护中)';
COMMENT ON COLUMN agents.rank IS 'Agent 排名, 数字越小排名越高';
COMMENT ON COLUMN agents.framework IS 'Agent 使用的框架: LangChain, AutoGPT, BabyAGI, LlamaIndex, Custom 等';
COMMENT ON COLUMN agents.geo_score IS 'GEO 评分 (0-100): 基于活跃度、影响力、元数据完整度和自主等级计算';
COMMENT ON COLUMN agents.tags IS 'Agent 标签数组';
