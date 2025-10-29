---
inclusion: always
---

# Technology Stack

## Core Technologies

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript (strict mode enabled)
- **Styling**: Tailwind CSS 3.4
- **Database**: Supabase (PostgreSQL + Auth + API)
- **AI**: OpenAI GPT-4 for content analysis
- **Crawler**: Playwright for web scraping
- **Deployment**: Vercel with automatic CI/CD

## Key Libraries

- `@supabase/supabase-js` - Database client
- `@supabase/auth-helpers-nextjs` - Authentication
- `openai` - AI analysis
- `playwright` - Web crawling
- `zod` - Schema validation
- `lucide-react` - Icons
- `date-fns` - Date utilities
- `class-variance-authority`, `clsx`, `tailwind-merge` - Styling utilities

## Path Aliases

- `@/*` maps to project root (e.g., `@/lib/supabase`)

## Common Commands

```bash
# Development
npm run dev              # Start dev server (localhost:3000)
npm run build            # Build for production
npm run start            # Start production server
npm run lint             # Run ESLint

# Database
npm run db:setup         # Initialize database schema

# Crawler
npm run crawler          # Run web crawler and AI analysis

# Utilities
npm run generate:sitemap # Generate sitemap for SEO
```

## Environment Variables

Required in `.env.local`:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# OpenAI
OPENAI_API_KEY=

# Site
NEXT_PUBLIC_SITE_URL=
```

## Build Configuration

- **Target**: ES2017
- **Module Resolution**: bundler
- **JSX**: preserve (Next.js handles transformation)
- **Strict Mode**: Enabled
- **Image Domains**: chatgpt.com, poe.com
- **Server Actions**: Enabled (experimental)
- **Revalidation**: Pages use ISR with 3600s (1 hour) revalidation

## Database Client Usage

- **Server-side**: Use `supabaseAdmin` from `@/lib/supabase` (service role key)
- **Client-side**: Use `createSupabaseClient()` for client components
- Service role key bypasses RLS policies for admin operations
