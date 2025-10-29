---
inclusion: always
---

# Project Structure

## Directory Organization

```
shopo-alpha-agent/
├── app/                    # Next.js App Router
│   ├── layout.tsx         # Root layout with nav and footer
│   ├── page.tsx           # Homepage
│   ├── globals.css        # Global styles
│   ├── agents/            # Agent-related pages
│   ├── ai-stats/          # AI search statistics
│   └── api/               # API routes
│
├── components/            # React components
│   └── ai-visit-tracker.tsx
│
├── lib/                   # Utility libraries
│   ├── supabase.ts       # Database client and types
│   ├── openai.ts         # AI analysis client
│   └── ai-detector.ts    # AI search detection
│
├── crawler/               # Web scraping system
│   ├── run.ts            # Crawler entry point
│   ├── enricher.ts       # AI analysis and data enrichment
│   └── sources/          # Platform-specific crawlers
│
├── supabase/             # Database configuration
│   ├── schema.sql        # Database schema
│   └── seed.sql          # Seed data
│
├── scripts/              # Utility scripts
│   └── setup-database.js # Database initialization
│
└── [config files]        # TypeScript, Tailwind, Next.js configs
```

## Key Conventions

### File Naming

- React components: kebab-case (e.g., `ai-visit-tracker.tsx`)
- Pages: Next.js conventions (e.g., `page.tsx`, `[slug]/page.tsx`)
- Utilities: kebab-case (e.g., `ai-detector.ts`)

### Component Structure

- Server Components by default (Next.js 14 App Router)
- Client Components marked with `'use client'` directive
- Async Server Components for data fetching

### Data Fetching

- Use `supabaseAdmin` in Server Components and API routes
- Use `createSupabaseClient()` in Client Components
- Implement ISR with `revalidate` export for static pages
- No client-side data fetching for public pages (SEO optimization)

### Styling

- Tailwind utility classes preferred
- Container pattern: `container mx-auto px-4`
- Responsive: mobile-first with `md:` and `lg:` breakpoints
- Hover states for interactive elements

### Database Types

- Type definitions in `lib/supabase.ts`
- Main types: `Agent`, `Category`, `Comparison`
- Use TypeScript types for type safety

### Crawler Architecture

- Platform-specific crawlers in `crawler/sources/`
- Raw data extraction → AI analysis → Database storage
- Rate limiting: 1 second delay between API calls
- Error handling with try-catch and logging

### AI Integration

- GPT-4 for content analysis and enrichment
- Structured prompts for consistent output
- Caching to minimize API costs
- Batch processing for efficiency

## Code Organization Principles

1. **Separation of Concerns**: UI (app/) vs Logic (lib/) vs Data (crawler/)
2. **Type Safety**: Explicit TypeScript types for all data structures
3. **Server-First**: Leverage Server Components for better performance and SEO
4. **Minimal Client JS**: Only use Client Components when necessary
5. **Structured Data**: Include Schema.org markup for AI/SEO optimization
