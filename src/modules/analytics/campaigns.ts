import { db } from "@/lib/db";

export interface CampaignRow {
  source: string;
  leads: number;
  qualified: number;
  booked: number;
  closed: number;
}

export async function getCampaignPerformance(from: Date, to: Date): Promise<CampaignRow[]> {
  const rows = await db.lead.groupBy({
    by: ["source", "stage"],
    where: { createdAt: { gte: from, lte: to } },
    _count: { id: true },
  });

  const map = new Map<string, CampaignRow>();

  for (const row of rows) {
    const src = row.source ?? "unknown";
    if (!map.has(src)) {
      map.set(src, { source: src, leads: 0, qualified: 0, booked: 0, closed: 0 });
    }
    const entry = map.get(src)!;
    const count = row._count.id;
    entry.leads += count;
    if (["QUALIFIED", "NURTURING", "BOOKING", "BOOKED", "CONSULTED", "CLOSED"].includes(row.stage)) {
      entry.qualified += count;
    }
    if (["BOOKED", "CONSULTED", "CLOSED"].includes(row.stage)) {
      entry.booked += count;
    }
    if (row.stage === "CLOSED") {
      entry.closed += count;
    }
  }

  return [...map.values()].sort((a, b) => b.leads - a.leads);
}
