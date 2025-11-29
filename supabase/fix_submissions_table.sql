-- 修复agent_submissions表，允许同一邮箱提交多个Agent
-- 执行此脚本前请备份数据！

-- 1. 删除唯一约束（如果存在）
DO $$ 
BEGIN
    -- 查找并删除所有相关的唯一约束
    IF EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'agent_submissions_email_url_key'
    ) THEN
        ALTER TABLE agent_submissions DROP CONSTRAINT agent_submissions_email_url_key;
        RAISE NOTICE '已删除 agent_submissions_email_url_key 约束';
    END IF;
END $$;

-- 2. 修改agent_data字段为可空
ALTER TABLE agent_submissions 
ALTER COLUMN agent_data DROP NOT NULL;

-- 3. 添加索引以提高查询性能
CREATE INDEX IF NOT EXISTS idx_submissions_email_url ON agent_submissions(email, url);
CREATE INDEX IF NOT EXISTS idx_submissions_verified ON agent_submissions(verified);
CREATE INDEX IF NOT EXISTS idx_submissions_created_at ON agent_submissions(created_at DESC);

-- 4. 清理过期的未验证提交
DELETE FROM agent_submissions 
WHERE verified = false 
  AND expires_at < NOW() - INTERVAL '1 day';

-- 5. 添加表注释
COMMENT ON TABLE agent_submissions IS '允许同一邮箱提交多个Agent，管理员账号无限制';
COMMENT ON COLUMN agent_submissions.agent_data IS '验证前为null，验证后存储AI分析结果';

-- 6. 查看当前表结构
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'agent_submissions'
ORDER BY ordinal_position;

-- 7. 查看当前约束
SELECT 
    conname as constraint_name,
    contype as constraint_type
FROM pg_constraint 
WHERE conrelid = 'agent_submissions'::regclass;

-- 完成提示
DO $$ 
BEGIN
    RAISE NOTICE '✅ agent_submissions表修复完成！';
    RAISE NOTICE '✅ 现在同一邮箱可以提交多个不同的Agent';
    RAISE NOTICE '✅ 管理员邮箱(253553962@qq.com)无速率限制';
END $$;
