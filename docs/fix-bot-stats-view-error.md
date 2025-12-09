# Fix: bot_stats_7d View Missing Error

## Problem

The application is throwing this error:
```
Error fetching bot stats: {
  code: 'PGRST205',
  message: "Could not find the table 'public.bot_stats_7d' in the schema cache"
}
```

## Root Cause

The `bot_stats_7d` database view has not been created in your Supabase database. This view is required by the bot statistics feature on the homepage.

## Solution

You need to apply the migration that creates the `bot_stats_7d` view. There are two methods:

### Method 1: Manual Application (Recommended)

1. **Go to Supabase Dashboard**
   - Navigate to: https://supabase.com/dashboard
   - Select your project
   - Go to **SQL Editor** → **New Query**

2. **Copy the Migration SQL**
   - Open the file: `supabase/migrations/create_bot_stats_view.sql`
   - Copy the entire SQL content

3. **Execute the Migration**
   - Paste the SQL into the Supabase SQL Editor
   - Click **Run** to execute

4. **Verify Success**
   - You should see a success message
   - The view `bot_stats_7d` is now created

### Method 2: Using the Script (May Require Manual Steps)

Run the migration script:

```bash
node scripts/apply-bot-stats-migration.js
```

**Note**: If the script cannot execute directly (Supabase API limitations), it will display the SQL for you to copy and paste into the Supabase SQL Editor.

## What the Migration Does

The migration creates a database view called `bot_stats_7d` that:

1. **Aggregates AI bot visits** from the `ai_visits` table
2. **Calculates statistics** for each bot:
   - Total visits (all time)
   - Visits in the last 7 days
   - Visits in the previous 7 days (days 8-14)
   - Growth rate (percentage change)

3. **Orders results** by 7-day visits (descending)

## Migration SQL Preview

```sql
CREATE OR REPLACE VIEW bot_stats_7d AS
SELECT 
  ai_name as bot_name,
  COUNT(*) as total_visits,
  COUNT(*) FILTER (WHERE visited_at > NOW() - INTERVAL '7 days') as visits_7d,
  COUNT(*) FILTER (WHERE visited_at > NOW() - INTERVAL '14 days' 
                   AND visited_at <= NOW() - INTERVAL '7 days') as visits_prev_7d,
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
```

## Verification

After applying the migration, verify it works:

1. **Restart your development server**:
   ```bash
   npm run dev
   ```

2. **Check the homepage**:
   - Visit http://localhost:3000
   - The bot stats section should now load without errors

3. **Check the console**:
   - No more "Could not find the table 'public.bot_stats_7d'" errors

## Prerequisites

Before the bot stats will show data, you need:

1. **The `ai_visits` table** must exist (created by `supabase/schema.sql`)
2. **Some visit data** in the `ai_visits` table
   - This is populated by the `AIVisitTracker` component
   - Or manually inserted for testing

## Testing with Sample Data

If you want to test with sample data, run this in Supabase SQL Editor:

```sql
-- Insert sample AI bot visits for testing
INSERT INTO ai_visits (agent_id, ai_name, user_agent, visited_at)
SELECT 
  (SELECT id FROM agents LIMIT 1),
  bot_name,
  'Mozilla/5.0 (compatible; ' || bot_name || '/1.0)',
  NOW() - (random() * INTERVAL '14 days')
FROM (
  VALUES 
    ('GPTBot'),
    ('ClaudeBot'),
    ('PerplexityBot'),
    ('GPTBot'),
    ('ClaudeBot'),
    ('GPTBot')
) AS bots(bot_name);
```

## Related Files

- **Migration**: `supabase/migrations/create_bot_stats_view.sql`
- **Script**: `scripts/apply-bot-stats-migration.js`
- **Library**: `lib/bot-stats.ts`
- **Component**: `components/ai-bot-homepage-stats.tsx`
- **Usage**: `app/page.tsx` (homepage)

## Additional Notes

- The view is **read-only** and automatically updates as new data is added to `ai_visits`
- No manual refresh needed - the view always reflects current data
- The growth rate calculation handles division by zero gracefully
- If no visits exist, the view will return an empty result set (no error)
