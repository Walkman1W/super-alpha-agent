-- Agent提交验证表
-- 用于存储待验证的Agent提交

CREATE TABLE IF NOT EXISTS agent_submissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) NOT NULL,
    url TEXT NOT NULL,
    agent_data JSONB NOT NULL,
    verification_code VARCHAR(6) NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    verified BOOLEAN DEFAULT FALSE,
    agent_id UUID REFERENCES agents(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- 同一邮箱+URL组合唯一
    UNIQUE(email, url)
);

-- 索引
CREATE INDEX IF NOT EXISTS idx_submissions_email ON agent_submissions(email);
CREATE INDEX IF NOT EXISTS idx_submissions_code ON agent_submissions(verification_code);
CREATE INDEX IF NOT EXISTS idx_submissions_expires ON agent_submissions(expires_at);

-- 自动更新updated_at
CREATE TRIGGER update_submissions_updated_at 
    BEFORE UPDATE ON agent_submissions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 添加submitter_email字段到agents表（如果不存在）
ALTER TABLE agents ADD COLUMN IF NOT EXISTS submitter_email VARCHAR(255);

-- 清理过期的未验证提交（可选，定期运行）
-- DELETE FROM agent_submissions WHERE verified = false AND expires_at < NOW();
