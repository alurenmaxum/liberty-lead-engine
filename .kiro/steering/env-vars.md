# Environment Variable Registry

All env vars for this project. Use EXACTLY these names — no aliases.

## Database
- `DATABASE_URL` — Supabase pooler connection string

## Auth (Auth.js v5 credentials provider)
- `AUTH_SECRET` — generated with `npx auth secret`
- `AUTH_ADMIN_EMAIL` — the single admin user's email (runtime only)
- `AUTH_ADMIN_PASSWORD_HASH` — bcrypt hash of admin password (runtime only)

## Calendly
- `CALENDLY_BOOKING_URL` — full booking page URL e.g. https://calendly.com/kiru/15min
- `CALENDLY_API_TOKEN` — Calendly API token (Phase 2)

## WhatsApp (Phase 2+, not yet active)
- `WHATSAPP_PHONE_NUMBER_ID`
- `WHATSAPP_ACCESS_TOKEN`
- `WHATSAPP_VERIFY_TOKEN`
- `WHATSAPP_BUSINESS_ACCOUNT_ID`

## Inngest (Phase 1.5+)
- `INNGEST_EVENT_KEY`
- `INNGEST_SIGNING_KEY`

## Anthropic (Phase 2)
- `ANTHROPIC_API_KEY`

## Rules for env usage in code
- Access env vars at RUNTIME (inside functions), never at module scope
- Always provide a safe fallback or null-guard
- Never use `process.env.X!` non-null assertion in production paths — check first
- In tests, set process.env values in a beforeEach block, not at file scope
