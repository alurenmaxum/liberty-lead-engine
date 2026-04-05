import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(req: NextRequest) {
  const secret = req.headers.get("x-migrate-secret");
  if (!secret || secret !== process.env.MIGRATE_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const yesterday = new Date();
  yesterday.setUTCDate(yesterday.getUTCDate() - 1);
  yesterday.setUTCHours(0, 0, 0, 0);

  const dayEnd = new Date(yesterday);
  dayEnd.setUTCHours(23, 59, 59, 999);

  const [leadsCreated, qualified, booked, consulted, closed, lost] = await Promise.all([
    db.lead.count({ where: { createdAt: { gte: yesterday, lte: dayEnd } } }),
    db.lead.count({ where: { createdAt: { gte: yesterday, lte: dayEnd }, stage: { in: ["QUALIFIED", "NURTURING", "BOOKING", "BOOKED", "CONSULTED", "CLOSED"] } } }),
    db.lead.count({ where: { createdAt: { gte: yesterday, lte: dayEnd }, stage: { in: ["BOOKED", "CONSULTED", "CLOSED"] } } }),
    db.lead.count({ where: { createdAt: { gte: yesterday, lte: dayEnd }, stage: "CONSULTED" } }),
    db.lead.count({ where: { createdAt: { gte: yesterday, lte: dayEnd }, stage: "CLOSED" } }),
    db.lead.count({ where: { createdAt: { gte: yesterday, lte: dayEnd }, stage: "LOST" } }),
  ]);

  const conversionRate = leadsCreated > 0 ? closed / leadsCreated : null;

  await db.dailyMetrics.upsert({
    where: { date: yesterday },
    create: {
      date: yesterday,
      leadsCreated,
      qualified,
      booked,
      consulted,
      closed,
      lost,
      conversionRate: conversionRate !== null ? conversionRate : undefined,
    },
    update: {
      leadsCreated,
      qualified,
      booked,
      consulted,
      closed,
      lost,
      conversionRate: conversionRate !== null ? conversionRate : undefined,
    },
  });

  return NextResponse.json({ ok: true, date: yesterday.toISOString().slice(0, 10), leadsCreated, closed });
}
