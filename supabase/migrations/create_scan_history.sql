-- Migration: Create scan_history table for SR score tracking
-- Date: 2025-12-09
-- Description: Stores historical scan results for trend analysis
-- Requirements: 9.4

-- ============================================
-- 扫描历史表
-- ============================================

CREATE TABLE IF NOT EXISTS scan_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- 关联的 Agent
    agent_id UUID NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
    
    -- 扫描时的 SR 分数
    sr_score DECIMAL(3,1) NOT NULL,
    
    -- 扫描时的等级
    sr_tier VARCHAR(1) NOT NULL DEFAULT 'C',
    
    -- 扫描时的轨道类型
    sr_track VARCHAR(20) NOT NULL DEFAULT 'SaaS',
    
    -- Track A 分数
    score_github DECIMAL(3,1) DEFAULT 0.0,
    
    -- Track B 分数
    score_saas DECIMAL(3,1) DEFAULT 0.0,
    
    -- 详细评分明细
    score_breakdown JSONB DEFAULT '{}',
    
    -- 扫描触发方式 (manual/scheduled/api)
    scan_type VARCHAR(20) DEFAULT 'manual',
    
    -- 扫描时间
    scanned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- 约束检查
-- ============================================

DO $$
BEGIN
    -- sr_score 范围约束
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'check_scan_history_sr_score_range'
    ) THEN
        ALTER TABLE scan_history ADD CONSTRAINT check_scan_history_sr_score_range 
            CHECK (sr_score >= 0.0 AND sr_score <= 10.0);
    END IF;

    -- sr_tier 值约束
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'check_scan_history_sr_tier'
    ) THEN
        ALTER TABLE scan_history ADD CONSTRAINT check_scan_history_sr_tier 
            CHECK (sr_tier IN ('S', 'A', 'B', 'C'));
    END IF;

    -- sr_track 值约束
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'check_scan_history_sr_track'
    ) THEN
        ALTER TABLE scan_history ADD CONSTRAINT check_scan_history_sr_track 
            CHECK (sr_track IN ('OpenSource', 'SaaS', 'Hybrid'));
    END IF;

    -- scan_type 值约束
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'check_scan_history_scan_type'
    ) THEN
        ALTER TABLE scan_history ADD CONSTRAINT check_scan_history_scan_type 
            CHECK (scan_type IN ('manual', 'scheduled', 'api'));
    END IF;
END $$;

-- ============================================
-- 索引优化
-- ============================================

-- Agent + 时间复合索引 (用于获取某 Agent 的历史记录)
CREATE INDEX IF NOT EXISTS idx_scan_history_agent_time 
    ON scan_history(agent_id, scanned_at DESC);

-- 时间索引 (用于清理旧数据)
CREATE INDEX IF NOT EXISTS idx_scan_history_scanned_at 
    ON scan_history(scanned_at DESC);

-- SR 分数索引 (用于统计分析)
CREATE INDEX IF NOT EXISTS idx_scan_history_sr_score 
    ON scan_history(sr_score);

-- ============================================
-- RLS 策略
-- ============================================

ALTER TABLE scan_history ENABLE ROW LEVEL SECURITY;

-- 所有人可以读取扫描历史
CREATE POLICY "Anyone can view scan history" ON scan_history
    FOR SELECT USING (true);

-- 只有服务端可以插入扫描历史 (通过 service role)
CREATE POLICY "Service can insert scan history" ON scan_history
    FOR INSERT WITH CHECK (true);

-- ============================================
-- 字段注释
-- ============================================

COMMENT ON TABLE scan_history IS '扫描历史表: 记录每次扫描的 SR 分数，用于趋势分析';
COMMENT ON COLUMN scan_history.agent_id IS '关联的 Agent ID';
COMMENT ON COLUMN scan_history.sr_score IS '扫描时的 SR 总分';
COMMENT ON COLUMN scan_history.sr_tier IS '扫描时的 SR 等级';
COMMENT ON COLUMN scan_history.sr_track IS '扫描时的轨道类型';
COMMENT ON COLUMN scan_history.score_github IS '扫描时的 Track A 分数';
COMMENT ON COLUMN scan_history.score_saas IS '扫描时的 Track B 分数';
COMMENT ON COLUMN scan_history.score_breakdown IS '扫描时的详细评分明细';
COMMENT ON COLUMN scan_history.scan_type IS '扫描触发方式: manual(手动), scheduled(定时), api(API调用)';
COMMENT ON COLUMN scan_history.scanned_at IS '扫描时间';
