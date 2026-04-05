import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getMetaAdsClient } from "@/lib/meta/client";

export async function POST(req: NextRequest) {
  const secret = req.headers.get("x-migrate-secret");
  if (!secret || secret !== process.env.MIGRATE_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const client = getMetaAdsClient();
  if (!client) {
    return NextResponse.json({ ok: true, skipped: true });
  }

  const yesterday = new Date();
  yesterday.setUTCDate(yesterday.getUTCDate() - 1);
  yesterday.setUTCHours(0, 0, 0, 0);

  const rows = await client.getDailySpend(yesterday, yesterday);
  const spend = rows.reduce((s, r) => s + r.spend, 0);

  const existing = await db.dailyMetrics.findUnique({ where: { date: yesterday } });
  const leadsCreated = existing?.leadsCreated ?? 0;
  const costPerLead = leadsCreated > 0 ? spend / leadsCreated : null;

  await db.dailyMetrics.upsert({
    where: { date: yesterday },
    create: {
      date: yesterday,
      adSpend: spend,
      costPerLead: costPerLead !== null ? costPerLead : undefined,
    },
    update: {
      adSpend: spend,
      costPerLead: costPerLead !== null ? costPerLead : undefined,
    },
  });

  return NextResponse.json({ ok: true, date: yesterday.toISOString().slice(0, 10), spend });
}
