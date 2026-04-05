# Scope Boundaries

## What is IN scope for Phase 1 (current)
- src/modules/** — bot engine, scoring, appointments, nurture
- src/lib/db.ts, src/lib/pipeline.ts
- src/app/api/** — intake simulator, leads API, auth routes
- src/app/dashboard/** — pipeline, lead detail, simulate pages
- src/app/auth/** — sign-in page
- src/auth.ts, src/middleware.ts
- prisma/schema.prisma — schema edits only, no migrations without instruction
- tests/** — unit tests for modules and lib

## What is OUT of scope until explicitly instructed
- src/lib/inngest/** — Inngest integration (Phase 1.5 or Phase 2)
- src/lib/whatsapp/** — live WhatsApp API (no Meta credentials yet)
- src/app/api/webhooks/** — live webhook routes
- @anthropic-ai/sdk — Claude API (Phase 2 only)
- Any external API calls in production code paths (only mocked in tests)

## Route handler rules
NEVER put business logic in route handlers. A route handler must only:
1. Parse and validate input (with Zod)
2. Call exactly one module/lib function
3. Return the result

If you catch yourself writing if/else, scoring, or message generation in a route — stop.
Move the logic to src/modules/ or src/lib/.

## Test rules
- Tests live in tests/ mirroring src/ structure
- Mocks: use vi.stubGlobal("fetch", mockFetch) for all fetch calls
- No real DB, no real network calls in tests
- Run: npm test (vitest run)

## File naming
- kebab-case for all files
- No barrel index.ts files unless the directory has 4+ exports
