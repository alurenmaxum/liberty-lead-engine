import { NextRequest, NextResponse } from "next/server";
import { execSync } from "child_process";

// One-shot migration endpoint — secured with MIGRATE_SECRET env var
// Call once after deploy: POST /api/admin/migrate with header x-migrate-secret: <MIGRATE_SECRET>
export async function POST(req: NextRequest) {
  const secret = req.headers.get("x-migrate-secret");
  const expected = process.env.MIGRATE_SECRET;

  if (!expected || secret !== expected) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const output = execSync("npx prisma migrate deploy", {
      env: { ...process.env },
      timeout: 60000,
      encoding: "utf8",
    });
    return NextResponse.json({ ok: true, output });
  } catch (err) {
    const error = err as { message: string; stdout?: string; stderr?: string };
    return NextResponse.json(
      { ok: false, error: error.message, stderr: error.stderr, stdout: error.stdout },
      { status: 500 }
    );
  }
}
