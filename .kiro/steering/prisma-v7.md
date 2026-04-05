# Prisma 7 Patterns (LEARNED — DO NOT REPEAT MISTAKES)

## Critical: datasource url does NOT go in schema.prisma
In Prisma 7 the `url` property is no longer valid inside `datasource db {}` in schema files.
The connection string is provided via `prisma.config.ts` which already exists:

```ts
// prisma.config.ts — already configured, do not touch
import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  datasource: { url: process.env["DATABASE_URL"] },
});
```

The schema.prisma `datasource db {}` block must NOT include `url = env(...)`.

## Generator
```prisma
generator client {
  provider = "prisma-client"              // Prisma 7 — NOT "prisma-client-js"
  output   = "../src/app/generated/prisma"
}
```

## Client singleton
Prisma client is at `src/lib/db.ts`. Import from `@/lib/db`:
```ts
import { db } from "@/lib/db";
```
Never instantiate `new PrismaClient()` elsewhere.

## Prisma adapter (Prisma 7 style)
`src/lib/db.ts` uses the DATABASE_URL from env directly via the config. Standard usage:
```ts
import { PrismaClient } from "@/app/generated/prisma";
const globalForPrisma = global as unknown as { prisma: PrismaClient };
export const db = globalForPrisma.prisma || new PrismaClient();
if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db;
```

## Migrations
Do NOT run `prisma db push` without confirming DATABASE_URL is live.
For schema changes: edit `prisma/schema.prisma`, then `npx prisma generate` (always safe).
Migration against DB: `npx prisma migrate dev` (requires live DB).

## Enum usage in queries
Prisma enums are generated as TypeScript string unions.
Reference them as strings, not as Prisma namespace members:
```ts
// ✅ correct
await db.lead.create({ data: { stage: "NEW", tier: "COLD" } });
// ❌ wrong
await db.lead.create({ data: { stage: Prisma.LeadStage.NEW } });
```
