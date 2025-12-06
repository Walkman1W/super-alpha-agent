-- Migration: Create bot_stats_7d view
-- Date: 2025-12-05
-- Description: Creates a view for AI bot visit statistics aggregated over 7 and 14 day periods

-- Drop view if exists (for idempotent migrations)
DROP VIEW IF EXISTS bot_stats_7d;

-- Create view for bot statistics with SECURITY INVOKER for better security
CREATE OR REPLACE VIEW bot_stats_7d
WITH (security_invoker = true)
AS
SELECT 
  ai_name as bot_name,
  COUNT(*) as total_visits,
  COUNT(*) FILTER (WHERE visited_at > NOW() - INTERVAL '7 days') as visits_7d,
  COUNT(*) FILTER (WHERE visited_at > NOW() - INTERVAL '14 days' 
                   AND visited_at <= NOW() - INTERVAL '7 days') as visits_prev_7d,
  -- Calculate growth rate: (current - previous) / previous * 100
  CASE 
    WHEN COUNT(*) FILTER (WHERE visited_at > NOW() - INTERVAL '14 days' 
                          AND visited_at <= NOW() - INTERVAL '7 days') = 0 
    THEN 0
    ELSE ROUND(
      (COUNT(*) FILTER (WHERE visited_at > NOW() - INTERVAL '7 days')::NUMERIC - 
       COUNT(*) FILTER (WHERE visited_at > NOW() - INTERVAL '14 days' 
                        AND visited_at <= NOW() - INTERVAL '7 days')::NUMERIC) / 
      COUNT(*) FILTER (WHERE visited_at > NOW() - INTERVAL '14 days' 
                       AND visited_at <= NOW() - INTERVAL '7 days')::NUMERIC * 100, 
      2
    )
  END as growth_rate
FROM ai_visits
GROUP BY ai_name
ORDER BY visits_7d DESC;

-- Add comment for documentation
COMMENT ON VIEW bot_stats_7d IS 'Aggregates AI bot visit statistics over 7-day and 14-day periods with growth rate calculation';
