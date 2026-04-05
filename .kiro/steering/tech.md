# Tech Stack

## Framework
- Next.js 15 App Router — no pages router, no class components
- TypeScript strict mode — no `any` types, no `as unknown`, no type assertions unless necessary
- Node 20+

## Database
- PostgreSQL via **Supabase** (not Neon, not PlanetScale)
- ORM: Prisma with standard `@prisma/client` (no Neon adapter, no Supabase client for DB — use Prisma only)
- Prisma client output: `src/app/generated/prisma`
- DB client singleton: `src/lib/db.ts`

## Background Jobs
- Inngest for all async/background work — no raw queues, no cron via Vercel edge
- Inngest client: `src/lib/inngest/client.ts`

## Auth
- Auth.js v5 (`next-auth@beta`) — credentials provider only
- Single admin user (Kiru) via env vars

## UI
- Tailwind CSS + shadcn/ui components
- Dark theme dashboard (gray-950 background)

## Testing
- Vitest for all unit tests
- Tests live in `tests/` mirroring `src/` structure
- Run: `npm test`

## WhatsApp
- NOT integrated yet — build a simulated intake endpoint instead
- Simulate WhatsApp payloads via POST /api/simulate/intake

## Packages to use
- `prisma`, `@prisma/client`
- `inngest`
- `next-auth@beta`
- `bcryptjs` + `@types/bcryptjs`
- `zod` for validation
- `vitest`, `@vitejs/plugin-react`, `@testing-library/react`, `jsdom`
- `@anthropic-ai/sdk` (Phase 2+)
- AI model: `claude-3-5-haiku-20241022` — use for all AI calls (compliance tone check, nurture generation). Do NOT use Sonnet or Opus.

## Packages to NOT use
- `@prisma/adapter-neon` — wrong database
- `@supabase/supabase-js` for DB queries — use Prisma
- `react-query`, `swr` — use server components and fetch where possible
