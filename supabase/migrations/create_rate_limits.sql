-- Migration: Create rate_limits table for scan throttling
-- Date: 2025-12-09
-- Description: Stores rate limit data per IP address for scan API protection
-- Requirements: 10.1

-- ============================================
-- 速率限制表
-- ============================================

CREATE TABLE IF NOT EXISTS rate_limits (
    -- IP 地址作为主键
    ip_address VARCHAR(45) PRIMARY KEY,
    
    -- 当前窗口内的扫描次数
    scan_count INTEGER DEFAULT 0,
    
    -- 窗口开始时间
    window_start TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- 用户 ID (如果已认证)
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    
    -- 是否已认证用户
    is_authenticated BOOLEAN DEFAULT FALSE,
    
    -- 最后请求时间
    last_request_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- 创建时间
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- 更新时间
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- 约束检查
-- ============================================

DO $$
BEGIN
    -- scan_count 非负约束
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'check_rate_limits_scan_count'
    ) THEN
        ALTER TABLE rate_limits ADD CONSTRAINT check_rate_limits_scan_count 
            CHECK (scan_count >= 0);
    END IF;
END $$;

-- ============================================
-- 索引优化
-- ============================================

-- 窗口开始时间索引 (用于清理过期记录)
CREATE INDEX IF NOT EXISTS idx_rate_limits_window_start 
    ON rate_limits(window_start);

-- 用户 ID 索引 (用于已认证用户查询)
CREATE INDEX IF NOT EXISTS idx_rate_limits_user_id 
    ON rate_limits(user_id);

-- 最后请求时间索引
CREATE INDEX IF NOT EXISTS idx_rate_limits_last_request 
    ON rate_limits(last_request_at DESC);

-- ============================================
-- 自动更新 updated_at 触发器
-- ============================================

CREATE OR REPLACE FUNCTION update_rate_limits_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_rate_limits_updated_at ON rate_limits;
CREATE TRIGGER update_rate_limits_updated_at 
    BEFORE UPDATE ON rate_limits
    FOR EACH ROW EXECUTE FUNCTION update_rate_limits_updated_at();

-- ============================================
-- 辅助函数: 检查并更新速率限制
-- ============================================

CREATE OR REPLACE FUNCTION check_rate_limit(
    p_ip_address VARCHAR(45),
    p_user_id UUID DEFAULT NULL,
    p_is_authenticated BOOLEAN DEFAULT FALSE
)
RETURNS TABLE (
    allowed BOOLEAN,
    current_count INTEGER,
    max_count INTEGER,
    reset_at TIMESTAMP WITH TIME ZONE
) AS $$
DECLARE
    v_max_count INTEGER;
    v_current_count INTEGER;
    v_window_start TIMESTAMP WITH TIME ZONE;
    v_window_duration INTERVAL := '1 hour';
BEGIN
    -- 设置最大请求数: 已认证用户 20 次/小时, 匿名用户 5 次/小时
    IF p_is_authenticated THEN
        v_max_count := 20;
    ELSE
        v_max_count := 5;
    END IF;

    -- 获取或创建速率限制记录
    SELECT scan_count, window_start INTO v_current_count, v_window_start
    FROM rate_limits
    WHERE ip_address = p_ip_address;

    -- 如果记录不存在，创建新记录
    IF NOT FOUND THEN
        INSERT INTO rate_limits (ip_address, scan_count, window_start, user_id, is_authenticated)
        VALUES (p_ip_address, 1, NOW(), p_user_id, p_is_authenticated);
        
        RETURN QUERY SELECT TRUE, 1, v_max_count, NOW() + v_window_duration;
        RETURN;
    END IF;

    -- 检查窗口是否已过期
    IF v_window_start + v_window_duration < NOW() THEN
        -- 重置窗口
        UPDATE rate_limits
        SET scan_count = 1, 
            window_start = NOW(),
            user_id = COALESCE(p_user_id, user_id),
            is_authenticated = p_is_authenticated,
            last_request_at = NOW()
        WHERE ip_address = p_ip_address;
        
        RETURN QUERY SELECT TRUE, 1, v_max_count, NOW() + v_window_duration;
        RETURN;
    END IF;

    -- 检查是否超过限制
    IF v_current_count >= v_max_count THEN
        RETURN QUERY SELECT FALSE, v_current_count, v_max_count, v_window_start + v_window_duration;
        RETURN;
    END IF;

    -- 增加计数
    UPDATE rate_limits
    SET scan_count = scan_count + 1,
        user_id = COALESCE(p_user_id, user_id),
        is_authenticated = p_is_authenticated,
        last_request_at = NOW()
    WHERE ip_address = p_ip_address;

    RETURN QUERY SELECT TRUE, v_current_count + 1, v_max_count, v_window_start + v_window_duration;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 清理函数: 删除过期的速率限制记录
-- ============================================

CREATE OR REPLACE FUNCTION cleanup_expired_rate_limits()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM rate_limits
    WHERE window_start + INTERVAL '2 hours' < NOW();
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- RLS 策略
-- ============================================

ALTER TABLE rate_limits ENABLE ROW LEVEL SECURITY;

-- 只有服务端可以访问速率限制表 (通过 service role)
CREATE POLICY "Service can manage rate limits" ON rate_limits
    FOR ALL USING (true);

-- ============================================
-- 字段注释
-- ============================================

COMMENT ON TABLE rate_limits IS '速率限制表: 存储每个 IP 的扫描请求计数，用于防止滥用';
COMMENT ON COLUMN rate_limits.ip_address IS 'IP 地址 (支持 IPv4 和 IPv6)';
COMMENT ON COLUMN rate_limits.scan_count IS '当前时间窗口内的扫描次数';
COMMENT ON COLUMN rate_limits.window_start IS '当前时间窗口的开始时间';
COMMENT ON COLUMN rate_limits.user_id IS '关联的用户 ID (如果已认证)';
COMMENT ON COLUMN rate_limits.is_authenticated IS '是否为已认证用户';
COMMENT ON COLUMN rate_limits.last_request_at IS '最后一次请求时间';

COMMENT ON FUNCTION check_rate_limit IS '检查并更新速率限制，返回是否允许请求';
COMMENT ON FUNCTION cleanup_expired_rate_limits IS '清理过期的速率限制记录，返回删除的记录数';
