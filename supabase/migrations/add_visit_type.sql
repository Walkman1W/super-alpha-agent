-- 添加访问类型字段到 ai_visits 表
-- 用于区分 bot_crawl (AI Bot 爬取) 和 ai_referral (用户从 AI 跳转)

-- 添加 visit_type 字段
ALTER TABLE ai_visits 
ADD COLUMN IF NOT EXISTS visit_type VARCHAR(20) DEFAULT 'bot_crawl';

-- 添加注释
COMMENT ON COLUMN ai_visits.visit_type IS '访问类型: bot_crawl (AI Bot 爬取), ai_referral (用户从 AI 跳转)';

-- 更新 verification_method 字段的注释
COMMENT ON COLUMN ai_visits.verification_method IS '检测方法: user_agent:bot_crawl, referer:ai_referral';

-- 创建索引以便按访问类型查询
CREATE INDEX IF NOT EXISTS idx_ai_visits_visit_type ON ai_visits(visit_type);

-- 可选：为现有数据设置默认值（基于 verification_method 推断）
UPDATE ai_visits 
SET visit_type = CASE 
  WHEN verification_method LIKE '%referer%' THEN 'ai_referral'
  ELSE 'bot_crawl'
END
WHERE visit_type IS NULL;
