import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";

const DEFAULT_CONFIG = { blockPatterns: [], flagPatterns: [] };

export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const config = await db.complianceConfig.findUnique({ where: { key: "keyword_blocklist" } });
  return NextResponse.json(config?.value ?? DEFAULT_CONFIG);
}

export async function PUT(request: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = (await request.json()) as Record<string, unknown>;
  await db.complianceConfig.upsert({
    where: { key: "keyword_blocklist" },
    create: { key: "keyword_blocklist", value: body as object },
    update: { value: body as object },
  });
  return NextResponse.json({ ok: true });
}
