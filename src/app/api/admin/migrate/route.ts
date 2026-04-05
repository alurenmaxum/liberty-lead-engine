import { NextRequest, NextResponse } from "next/server";
import { Client } from "pg";
import fs from "fs";
import path from "path";

// One-shot migration endpoint — secured with MIGRATE_SECRET env var
// Call once after deploy: POST /api/admin/migrate with header x-migrate-secret: <MIGRATE_SECRET>
export async function POST(req: NextRequest) {
  const secret = req.headers.get("x-migrate-secret");
  const expected = process.env.MIGRATE_SECRET;

  if (!expected || secret !== expected) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) {
    return NextResponse.json({ error: "DATABASE_URL not set" }, { status: 500 });
  }

  const migrationNames = [
    "20260405000000_phase1_initial_schema",
    "20260405144943_phase2_intelligence",
    "20260405151820_phase3_analytics",
  ];

  const client = new Client({ connectionString: dbUrl, ssl: { rejectUnauthorized: false } });

  try {
    await client.connect();

    const applied: string[] = [];
    const skipped: string[] = [];

    for (const name of migrationNames) {
      const migrationPath = path.join(
        /*turbopackIgnore: true*/ process.cwd(),
        "prisma",
        "migrations",
        name,
        "migration.sql"
      );

      let sql: string;
      try {
        sql = fs.readFileSync(migrationPath, "utf8");
      } catch {
        await client.end();
        return NextResponse.json({ error: `Migration file not found: ${name}` }, { status: 500 });
      }

      try {
        await client.query(sql);
        applied.push(name);
      } catch (err) {
        const msg = (err as Error).message;
        if (msg.includes("already exists") || msg.includes("duplicate")) {
          skipped.push(name);
        } else {
          await client.end();
          return NextResponse.json({ ok: false, error: msg, applied, skipped }, { status: 500 });
        }
      }
    }

    await client.end();
    return NextResponse.json({ ok: true, applied, skipped });
  } catch (err) {
    try { await client.end(); } catch { /* ignore */ }
    return NextResponse.json({ ok: false, error: (err as Error).message }, { status: 500 });
  }
}
