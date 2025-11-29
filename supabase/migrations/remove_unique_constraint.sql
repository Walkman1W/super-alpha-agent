-- 移除agent_submissions表的UNIQUE(email, url)约束
-- 允许同一邮箱提交多个不同的Agent

-- 1. 删除唯一约束
ALTER TABLE agent_submissions 
DROP CONSTRAINT IF EXISTS agent_submissions_email_url_key;

-- 2. 修改agent_data字段为可空（验证前为null）
ALTER TABLE agent_submissions 
ALTER COLUMN agent_data DROP NOT NULL;

-- 3. 添加索引以提高查询性能
CREATE INDEX IF NOT EXISTS idx_submissions_email_url ON agent_submissions(email, url);
CREATE INDEX IF NOT EXISTS idx_submissions_verified ON agent_submissions(verified);

-- 4. 清理过期的未验证提交（可选）
DELETE FROM agent_submissions 
WHERE verified = false 
  AND expires_at < NOW() - INTERVAL '1 day';

COMMENT ON TABLE agent_submissions IS '允许同一邮箱提交多个Agent，管理员账号无限制';
