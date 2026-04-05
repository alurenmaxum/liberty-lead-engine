import { db } from "@/lib/db";

export interface DailyRow {
  date: string; // ISO date string YYYY-MM-DD
  leadsCreated: number;
  booked: number;
  closed: number;
}

export interface MetricsSummary {
  leadsCreated: number;
  qualified: number;
  booked: number;
  consulted: number;
  closed: number;
  lost: number;
  totalAdSpend: number;
  avgCostPerLead: number;
  avgConversionRate: number;
  daily: DailyRow[];
}

export async function getMetricsSummary(from: Date, to: Date): Promise<MetricsSummary> {
  const rows = await db.dailyMetrics.findMany({
    where: { date: { gte: from, lte: to } },
    orderBy: { date: "asc" },
  });

  if (rows.length === 0) {
    return {
      leadsCreated: 0,
      qualified: 0,
      booked: 0,
      consulted: 0,
      closed: 0,
      lost: 0,
      totalAdSpend: 0,
      avgCostPerLead: 0,
      avgConversionRate: 0,
      daily: [],
    };
  }

  const totalAdSpend = rows.reduce((s, r) => s + Number(r.adSpend ?? 0), 0);
  const cplRows = rows.filter((r) => r.costPerLead !== null);
  const crRows = rows.filter((r) => r.conversionRate !== null);

  return {
    leadsCreated: rows.reduce((s, r) => s + r.leadsCreated, 0),
    qualified: rows.reduce((s, r) => s + r.qualified, 0),
    booked: rows.reduce((s, r) => s + r.booked, 0),
    consulted: rows.reduce((s, r) => s + r.consulted, 0),
    closed: rows.reduce((s, r) => s + r.closed, 0),
    lost: rows.reduce((s, r) => s + r.lost, 0),
    totalAdSpend,
    avgCostPerLead:
      cplRows.length === 0
        ? 0
        : cplRows.reduce((s, r) => s + Number(r.costPerLead), 0) / cplRows.length,
    avgConversionRate:
      crRows.length === 0
        ? 0
        : crRows.reduce((s, r) => s + Number(r.conversionRate), 0) / crRows.length,
    daily: rows.map((r) => ({
      date: r.date.toISOString().slice(0, 10),
      leadsCreated: r.leadsCreated,
      booked: r.booked,
      closed: r.closed,
    })),
  };
}
