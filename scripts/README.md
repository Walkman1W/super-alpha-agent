# Scripts Directory

This directory contains utility scripts for database setup, testing, and maintenance.

## Database Scripts

### `init-categories.js`
Initializes the categories table with default categories.

```bash
npm run db:init
```

### `setup-database.js`
Sets up the complete database schema (legacy, use migrations instead).

```bash
node scripts/setup-database.js
```

## Crawler Scripts

### `setup-github-crawler.js`
Verifies all prerequisites for running the GitHub crawler.

```bash
npm run setup:crawler
```

**Checks**:
- Environment variables
- Database schema (GitHub fields)
- Migration files
- Crawler implementation files
- NPM scripts

### `test-github-crawler.js`
Runs an integration test of the GitHub crawler.

```bash
# Test with 10 projects
npm run test:crawler

# Test with custom number
TEST_MAX_RESULTS=50 npm run test:crawler
```

**What it does**:
1. Checks environment setup
2. Shows database state before
3. Crawls GitHub repositories
4. Enriches with AI
5. Saves to database
6. Shows database state after
7. Verifies data integrity

### `apply-github-migration.js`
Helper script to apply GitHub fields migration (for reference only - use Supabase SQL Editor instead).

```bash
node scripts/apply-github-migration.js
```

## SEO Scripts

### `generate-sitemap.js`
Generates sitemap.xml for search engines.

```bash
npm run sitemap
```

### `verify-seo-setup.js`
Verifies SEO configuration (robots.txt, sitemap, meta tags).

```bash
npm run verify:seo
```

## Performance Scripts

### `test-performance.js`
Tests application performance and generates reports.

```bash
npm run test:perf
```

## Workflow

### Initial Setup
1. Set up environment variables in `.env`
2. Run database migrations in Supabase SQL Editor
3. Initialize categories: `npm run db:init`
4. Verify crawler setup: `npm run setup:crawler`

### Running Crawler
1. Test first: `npm run test:crawler`
2. Run production: `npm run crawler:github`
3. Generate sitemap: `npm run sitemap`

### Maintenance
- Verify SEO: `npm run verify:seo`
- Test performance: `npm run test:perf`
- Re-run crawler periodically to update data

## Environment Variables

All scripts use environment variables from `.env` file. See `.env.example` for required variables.

**Required for crawler**:
- `NEXT_PUBLIC_SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `OPENAI_API_KEY`

**Optional but recommended**:
- `GITHUB_TOKEN` - Higher API rate limits
- `INDEXNOW_KEY` - Search engine notifications

## Troubleshooting

### "column agents.github_stars does not exist"
Run the database migration in Supabase SQL Editor:
- File: `supabase/migrations/add_github_fields.sql`

### "API rate limit exceeded"
Add `GITHUB_TOKEN` to `.env` or wait for rate limit reset (1 hour).

### "Failed to connect to database"
Check Supabase credentials in `.env` file.

## Documentation

For detailed guides, see:
- `docs/github-crawler-test-guide.md` - GitHub crawler testing
- `docs/github-crawler-implementation.md` - Implementation details
- `docs/indexnow-setup-guide.md` - IndexNow configuration
