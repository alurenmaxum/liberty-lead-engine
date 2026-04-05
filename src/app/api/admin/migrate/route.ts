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

  // Read migration SQL bundled at build time
  const migrationPath = path.join(
    process.cwd(),
    "prisma/migrations/20260405000000_phase1_initial_schema/migration.sql"
  );

  let sql: string;
  try {
    sql = fs.readFileSync(migrationPath, "utf8");
  } catch {
    return NextResponse.json({ error: "Migration file not found at " + migrationPath }, { status: 500 });
  }

  const client = new Client({ connectionString: dbUrl, ssl: { rejectUnauthorized: false } });

  try {
    await client.connect();

    // Check if tables already exist
    const check = await client.query(
      "SELECT COUNT(*) as count FROM information_schema.tables WHERE table_schema='public' AND table_name='Lead'"
    );
    if (parseInt(check.rows[0].count) > 0) {
      await client.end();
      return NextResponse.json({ ok: true, message: "Already migrated — Lead table exists" });
    }

    // Run migration
    await client.query(sql);
    await client.end();

    return NextResponse.json({ ok: true, message: "Migration applied successfully" });
  } catch (err) {
    try { await client.end(); } catch { /* ignore */ }
    const error = err as Error;
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }
}
