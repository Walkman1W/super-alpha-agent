# Frontend Structure Guide (Next.js 14, App Router)

This repo already runs `/` (home) and `/agents` (index). Keep the structure predictable and split by responsibility.

## Top-level layout
- `app/` – routes only (pages + api + error/not-found)
  - `page.tsx` (home), `agents/page.tsx`, `agents/[slug]/page.tsx`, `scan/page.tsx`, `publish/page.tsx`
  - `api/*` (scan, generate, agents, track-ai-visit, crawler triggers)
  - marketing/extra pages can live in `app/(marketing)/...`
- `components/` – UI by feature
  - `components/agent/` – index & detail UI (results-page, agent-result-item) and insights (`insights/*` for AI stats, tracker, recommendation snippets)
  - `components/scanner/` – scan-results, claim-optimize, etc.
  - `components/connector/` – connect-button, prompt-modal
  - `components/home/` – home-page hero/search/scan entry
  - `components/ui/` – shared primitives (button, input, card, toast, logo…)
  - `components/layout/` – shared layout bits (header/footer) if needed
  - `components/legacy/` – archived/unused UI (terminal theme, old cards/home)
- `lib/` – logic & types (no React)
  - `lib/types/` – shared types (scanner, agent…)
  - `lib/scanner/` – url-detector, github-scanner, saas-scanner, sr-calculator, io-extractor, cache, rate-limiter
  - `lib/generators/` – json-ld, badge, prompt
  - `lib/data/` – repositories (Supabase access)
  - `lib/supabase.ts`, `lib/utils.ts`, etc.
- `crawler/` – Playwright/OpenAI pipelines & schedulers
- `supabase/` – schema/migrations
- `test/` – unit/property tests (or colocated `*.test.ts` / `*.property.test.ts`)
- `docs/` – specs/design/tasks (this guide included)
- `scripts/` – CLI utilities (sitemap, crawler helpers)

## Import conventions
- Prefer `@/components/...` and `@/lib/...` aliases; page files should import via feature index (`@/components/agent`, `@/components/connector`, etc.).
- Keep server logic in `lib/`; components stay presentation-only (call APIs, not DB clients directly).

## Legacy handling
- Old terminal/home/card UIs live in `components/legacy/` to avoid accidental use. Only promote them back when replacing current UI.

## Hygiene checklist
- When adding a feature, create/extend the relevant feature folder and update its `index.ts` for clean imports.
- Keep tests next to logic or under `test/` with clear naming.
- Run `npm run lint` and `npm run build` after structural changes.
