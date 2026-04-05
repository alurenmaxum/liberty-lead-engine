# Project Structure

## Rule: Business logic lives in modules, NOT in route handlers
Route handlers in `src/app/api/` must only: parse input, call a module function, return a response.
Never put if/else logic, scoring rules, or message generation in route files.

## Directory layout
```
liberty/
├── prisma/
│   └── schema.prisma
├── src/
│   ├── app/
│   │   ├── layout.tsx
│   │   ├── page.tsx                    # redirects to /dashboard
│   │   ├── api/
│   │   │   ├── inngest/route.ts
│   │   │   ├── simulate/
│   │   │   │   └── intake/route.ts     # simulated WhatsApp intake (no Meta)
│   │   │   ├── webhooks/
│   │   │   │   └── calendly/route.ts
│   │   │   └── leads/
│   │   │       ├── route.ts
│   │   │       └── [id]/
│   │   │           ├── route.ts
│   │   │           └── messages/route.ts
│   │   ├── auth/signin/page.tsx
│   │   └── dashboard/
│   │       ├── layout.tsx
│   │       ├── page.tsx                # pipeline kanban
│   │       └── leads/[id]/page.tsx
│   ├── auth.ts
│   ├── middleware.ts
│   ├── lib/
│   │   ├── db.ts
│   │   ├── inngest/
│   │   │   ├── client.ts
│   │   │   └── functions/
│   │   │       ├── process-message.ts
│   │   │       └── process-calendly-event.ts
│   │   └── whatsapp/                   # WhatsApp types only (no live API yet)
│   │       └── types.ts
│   ├── modules/
│   │   ├── bot/
│   │   │   ├── engine.ts
│   │   │   ├── states.ts
│   │   │   ├── messages.ts
│   │   │   └── parser.ts
│   │   ├── scoring/
│   │   │   └── scorer.ts
│   │   └── appointments/
│   │       ├── booking.ts
│   │       └── briefing.ts
│   └── components/
│       ├── pipeline/
│       ├── lead-detail/
│       └── layout/
├── tests/                              # mirrors src/ structure
└── .kiro/steering/
```

## Import alias
Use `@/` for all imports from `src/`. Never use relative `../../` imports except in test files.

## Naming conventions
- Files: kebab-case
- React components: PascalCase
- Functions/variables: camelCase
- Prisma enums: SCREAMING_SNAKE_CASE (as generated)
- Types/interfaces: PascalCase with no I prefix
