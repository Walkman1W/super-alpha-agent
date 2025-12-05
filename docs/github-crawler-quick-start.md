# GitHub Crawler Quick Start Guide

## Prerequisites

1. **GitHub Personal Access Token**
   - Go to https://github.com/settings/tokens
   - Click "Generate new token (classic)"
   - Select scopes: `public_repo` (for public repositories)
   - Copy the generated token

2. **Environment Setup**
   - Copy `.env.example` to `.env.local`
   - Add your GitHub token:
     ```env
     GITHUB_TOKEN=ghp_your_token_here
     ```

## Quick Start

### 1. Run GitHub Crawler Only

```bash
npm run crawler:github
```

This will:
- Search for repositories with topic `ai-agent`
- Filter repos with at least 10 stars
- Fetch up to 50 repositories
- Process and save them to the database

### 2. Run All Crawlers

```bash
npm run crawler:all
```

This will run both GPT Store and GitHub crawlers.

### 3. Customize Search Parameters

Edit your `.env.local`:

```env
# Search for different topics
GITHUB_TOPIC=chatbot

# Increase minimum stars threshold
GITHUB_MIN_STARS=100

# Get more results
CRAWLER_MAX_AGENTS_PER_RUN=100
```

Then run:
```bash
npm run crawler:github
```

## Configuration Options

| Variable | Default | Description |
|----------|---------|-------------|
| `GITHUB_TOKEN` | (required) | Your GitHub personal access token |
| `GITHUB_TOPIC` | `ai-agent` | GitHub topic to search for |
| `GITHUB_MIN_STARS` | `10` | Minimum number of stars |
| `CRAWLER_MAX_AGENTS_PER_RUN` | `50` | Maximum repos to fetch per run |
| `CRAWLER_SOURCE` | `gpt-store` | Which crawler to run: `gpt-store`, `github`, or `all` |

## Expected Output

```
🚀 Starting GitHub crawler (export mode)...

🔍 Searching GitHub: https://api.github.com/search/repositories?q=topic:ai-agent&sort=stars&order=desc&per_page=50&page=1
   Found 50 repos (page 1/1)

📦 Processing: langchain-ai/langchain
📦 Processing: microsoft/autogen
📦 Processing: openai/openai-cookbook
...

✅ Processed 50 repositories

🚀 Starting batch enrichment for 50 agents

📝 Analyzing: langchain
✅ Created: langchain

📝 Analyzing: autogen
✅ Created: autogen

...

✨ Batch enrichment complete:
   ✅ Created: 45
   🔄 Updated: 3
   ❌ Errors: 2
   📊 Total: 50

🎉 Crawler completed successfully!
   Created: 45
   Updated: 3
   Failed: 2
```

## Troubleshooting

### Rate Limit Errors

If you see:
```
⏳ GitHub API rate limit reached. Waiting until 2024-12-05T10:30:00.000Z
```

The crawler will automatically wait and retry. GitHub's rate limit for authenticated requests is 5,000 requests per hour.

### Missing README

If a repository doesn't have a README:
```
⚠️  No README found for owner/repo
```

This is normal - the crawler will use the repository description instead.

### Authentication Errors

If you see:
```
Error: GITHUB_TOKEN environment variable is not set
```

Make sure you've added `GITHUB_TOKEN` to your `.env.local` file.

### Network Errors

The crawler automatically retries failed requests up to 3 times with exponential backoff. If all retries fail, the specific repository will be skipped and logged in the error report.

## Advanced Usage

### Programmatic Usage

```typescript
import { crawlAndExport } from '@/crawler/sources/github'
import { batchEnrichAgents } from '@/crawler/enricher'

async function customCrawl() {
  // Crawl specific repositories
  const repos = await crawlAndExport({
    topic: 'llm-agent',
    minStars: 500,
    maxResults: 20
  })
  
  // Process and save
  const result = await batchEnrichAgents(repos)
  
  console.log(`Success: ${result.created + result.updated}`)
  console.log(`Failed: ${result.failed}`)
}
```

### Multiple Topics

To crawl multiple topics, run the crawler multiple times:

```bash
# Crawl AI agents
GITHUB_TOPIC=ai-agent npm run crawler:github

# Crawl chatbots
GITHUB_TOPIC=chatbot npm run crawler:github

# Crawl LLM tools
GITHUB_TOPIC=llm npm run crawler:github
```

## Best Practices

1. **Start Small**: Begin with `CRAWLER_MAX_AGENTS_PER_RUN=10` to test
2. **Monitor Rate Limits**: Check your rate limit status at https://api.github.com/rate_limit
3. **Schedule Wisely**: Run during off-peak hours to avoid rate limits
4. **Review Results**: Check the database after each run to ensure quality
5. **Incremental Updates**: Run regularly to keep data fresh (repos are updated, not duplicated)

## Next Steps

After running the crawler:

1. **Verify Data**: Check your Supabase database to see the imported agents
2. **Test Display**: Visit your site to see the new agents listed
3. **Refine Search**: Adjust `GITHUB_TOPIC` and `GITHUB_MIN_STARS` to improve quality
4. **Schedule Automation**: Set up a cron job or GitHub Action to run regularly

## Support

For issues or questions:
- Check the implementation docs: `docs/github-crawler-implementation.md`
- Review the code: `lib/github.ts` and `crawler/sources/github.ts`
- Run tests: `npm test test/github-integration.test.ts`
