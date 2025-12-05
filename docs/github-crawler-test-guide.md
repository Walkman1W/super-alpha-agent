# GitHub Crawler Integration Test Guide

## Prerequisites

Before running the GitHub crawler test, you need to:

### 1. Apply Database Migration

The GitHub crawler requires additional fields in the `agents` table. You need to run the migration manually:

**Steps:**
1. Go to your Supabase Dashboard: https://supabase.com/dashboard
2. Select your project
3. Navigate to **SQL Editor** in the left sidebar
4. Click **New Query**
5. Copy the contents of `supabase/migrations/add_github_fields.sql`
6. Paste into the SQL Editor
7. Click **Run** or press `Ctrl+Enter`

**What this migration does:**
- Adds `github_stars` column (INTEGER)
- Adds `github_url` column (TEXT)
- Adds `github_owner` column (TEXT)
- Adds `github_topics` column (TEXT[])
- Creates indexes for performance

### 2. Set Up GitHub Token (Optional but Recommended)

GitHub API has rate limits:
- **Without token**: 60 requests/hour
- **With token**: 5,000 requests/hour

**To create a GitHub token:**
1. Go to https://github.com/settings/tokens
2. Click **Generate new token** → **Generate new token (classic)**
3. Give it a name like "Super Alpha Agent Crawler"
4. Select scopes: `public_repo` (read access to public repositories)
5. Click **Generate token**
6. Copy the token (starts with `ghp_`)

**Add to your `.env` file:**
```env
GITHUB_TOKEN=ghp_your_token_here
```

### 3. Set Up IndexNow Key (Optional)

For search engine notifications:

1. Generate a random key:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

2. Add to `.env`:
```env
INDEXNOW_KEY=your_generated_key_here
```

3. Create the key file:
```bash
echo your_generated_key_here > public/your_generated_key_here.txt
```

## Running the Test

### Quick Test (10 projects)
```bash
npm run test:crawler
```

This will:
- Check environment variables
- Show database state before crawling
- Crawl 10 GitHub repositories with topic `ai-agent` and 50+ stars
- Process and enrich data with AI
- Save to database
- Show database state after crawling
- Verify data integrity

### Full Test (50 projects)
```bash
TEST_MAX_RESULTS=50 npm run test:crawler
```

### Custom Test
```bash
TEST_MAX_RESULTS=20 GITHUB_MIN_STARS=100 GITHUB_TOPIC=chatbot npm run test:crawler
```

## Expected Output

```
🧪 GitHub Crawler Integration Test

============================================================

📋 Environment Check:
   GITHUB_TOKEN: ✓ Set
   SUPABASE_URL: ✓ Set
   SUPABASE_KEY: ✓ Set
   OPENAI_API_KEY: ✓ Set

📊 Database State (Before):
   GitHub Agents: 0

🚀 Running GitHub Crawler...
   (Crawling 10 projects for testing)

📦 Processing: owner/repo-name
...

✅ Crawled 10 repositories

📦 Sample Projects:
   1. AutoGPT
      URL: https://github.com/Significant-Gravitas/AutoGPT
      Stars: 165000
      Topics: ai, agent, gpt-4

🤖 Enriching with AI analysis...

📊 Enrichment Results:
   Created: 8
   Updated: 2
   Failed: 0

📊 Database State (After):
   GitHub Agents: 10 (+10)

🏆 Top GitHub Agents (by stars):
   1. AutoGPT
      Stars: 165000
      URL: https://github.com/Significant-Gravitas/AutoGPT
      Topics: ai, agent, gpt-4

✅ Data Integrity Check:
   ✓ All GitHub agents have required fields

============================================================
✅ GitHub Crawler Test Completed Successfully!
============================================================
```

## Troubleshooting

### Error: "column agents.github_stars does not exist"
**Solution**: Run the database migration (see step 1 above)

### Error: "API rate limit exceeded"
**Solution**: 
- Wait 1 hour for rate limit to reset, OR
- Add a GITHUB_TOKEN to your `.env` file (see step 2 above)

### Error: "Failed to fetch README"
**Cause**: Some repositories don't have a README or it's in a non-standard location
**Impact**: The crawler will continue with other repositories

### No repositories found
**Possible causes**:
- GitHub API rate limiting
- No repositories match the criteria (try lowering GITHUB_MIN_STARS)
- Network issues

## Running the Production Crawler

After testing, you can run the full crawler:

### GitHub only (50 projects)
```bash
npm run crawler:github
```

### All sources (GPT Store + GitHub)
```bash
npm run crawler:all
```

### Custom configuration
```bash
CRAWLER_MAX_AGENTS_PER_RUN=100 GITHUB_MIN_STARS=50 npm run crawler:github
```

## Verification

After running the crawler, verify the data in Supabase:

1. Go to **Table Editor** → **agents**
2. Filter by `source = 'GitHub'`
3. Check that the following fields are populated:
   - `github_stars`
   - `github_url`
   - `github_owner`
   - `github_topics`

## Next Steps

1. ✅ Run database migration
2. ✅ Set up GitHub token (optional)
3. ✅ Run test crawler
4. ✅ Verify data in database
5. ✅ Run production crawler
6. ✅ Monitor AI Bot stats on homepage
7. ✅ Check IndexNow notifications (if configured)
