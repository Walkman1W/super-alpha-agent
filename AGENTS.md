# Repository Guidelines

## Project Structure & Module Organization
- `app/` holds App Router pages and API routes; `app/layout.tsx` wires providers, and `app/agents`, `app/ai-stats`, `app/api` host feature pages/endpoints.
- `components/` houses shared UI (Tailwind-first) and `components/ui/` primitives; prefer importing via `@/components/...`.
- `lib/` stores service clients and helpers (Supabase, OpenAI, utility functions) reused by server and client modules.
- `crawler/` contains the Playwright/OpenAI ingestion pipeline; `scripts/` has utilities such as sitemap generation and category seeding.
- `supabase/` keeps schema/migrations/seed data; `public/` holds static assets. Tailwind config in `tailwind.config.ts`; global styles in `app/globals.css`.

## Build, Test, and Development Commands
- Install: `npm install` (Node 18.17+).
- Local dev: `npm run dev` with hot reload.
- Production build: `npm run build`; serve the build with `npm start`.
- Quality: `npm run lint` (Next/ESLint rules).
- Data/setup: `npm run db:init` seeds categories; `npm run crawler` runs the agent fetcher; `npm run sitemap` regenerates `public/sitemap.xml`; `npm run deploy` runs sitemap then deploys with Vercel.
- Connectivity checks: `node test-openrouter.js` validates OpenRouter config; `node test-full-setup.js` verifies OpenRouter + Supabase.

## Coding Style & Naming Conventions
- TypeScript everywhere; prefer server components unless client hooks are needed. Two-space indentation; omit semicolons.
- Use PascalCase for React components and files in `components/`; kebab-case for routes under `app/`.
- Tailwind-first: reach for utilities before custom CSS. Keep gradient-heavy hero styling aligned with `app/page.tsx`.
- Export helpers from `lib/` and import via `@/` aliases; avoid deep relative paths.

## Testing Guidelines
- No unit test suite yet; run the node scripts once `.env` is set (Supabase URLs/keys and OpenAI/OpenRouter config).
- For UI changes, sanity-check in `npm run dev`; confirm the agents list renders with Supabase data and crawler output matches the schema before deploy.

## Commit & Pull Request Guidelines
- Commit messages use short, imperative phrasing (e.g., “Add GitHub Actions workflow for daily crawler”); keep them focused and under ~72 chars.
- PRs should include a summary, verification steps (commands run), and screenshots/GIFs for UI-impacting changes.
- Call out new env vars, Supabase migrations, or crawler behavior changes; link issues/tasks and note rollout steps (e.g., rerun `npm run sitemap`).

## Security & Configuration Tips
- Never commit secrets; keep `.env` local and rotate Supabase service keys if exposed. Restrict crawler targets to approved sources and respect rate limits.
- When changing Supabase schema, update seed/migration files in `supabase/` and verify `supabaseAdmin` usage remains server-side only.
