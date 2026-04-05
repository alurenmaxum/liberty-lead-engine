---
name: db-migration
description: Step-by-step pattern for applying Prisma schema changes to the live Supabase database. Use when: adding a new model, adding a field, or when told to run migrations against the live DB.
---

# DB Migration Pattern (Prisma 7 + Supabase)

## Prerequisites
- `DATABASE_URL` must be the **direct connection** string (not the pooler) for migrations
  - Pooler (port 6543) is for runtime queries
  - Direct (port 5432) is for migrations
  - Ask Dev if you don't have it — never guess the URL

## Steps

### 1. Edit the schema
```
prisma/schema.prisma
```
Add your model or field. Follow the existing enum/model patterns exactly.

### 2. Generate the client (always safe, no DB needed)
```bash
npx prisma generate
```
Confirm: no errors.

### 3. Run migration (requires live DB)
```bash
npx prisma migrate dev --name describe-the-change
```
This creates a migration file in `prisma/migrations/` and applies it.

### 4. Verify
```bash
npx prisma db pull  # optional — confirms schema matches DB
npm run build       # confirm TypeScript is still clean
npm test            # confirm no regressions
```

## Common mistakes to avoid
- Do NOT add `url = env("DATABASE_URL")` to schema.prisma — this causes Prisma 7 validation failure
- Do NOT run `prisma db push` in production — always use `migrate dev` / `migrate deploy`
- Do NOT run migrations if DATABASE_URL is a placeholder
