import { db } from "@/lib/db";

export const FUNNEL_ORDER = [
  "wa_opened",
  "qual_started",
  "qual_completed",
  "booking_created",
  "booking_kept",
  "consultation_done",
  "deal_closed",
] as const;

export type FunnelStage = (typeof FUNNEL_ORDER)[number];

export interface FunnelStep {
  event: FunnelStage;
  count: number;
  conversionRate: number; // rate vs previous step (0–1), 1 for first step
}

export async function computeFunnel(from: Date, to: Date): Promise<FunnelStep[]> {
  const rows = await db.analyticsEvent.groupBy({
    by: ["event"],
    where: { timestamp: { gte: from, lte: to }, event: { in: [...FUNNEL_ORDER] } },
    _count: { id: true },
  });

  const countMap = new Map<string, number>(rows.map((r) => [r.event, r._count.id]));

  return FUNNEL_ORDER.map((event, i) => {
    const count = countMap.get(event) ?? 0;
    const prev = i === 0 ? count : (countMap.get(FUNNEL_ORDER[i - 1]) ?? 0);
    const conversionRate = prev === 0 ? 0 : count / prev;
    return { event, count, conversionRate };
  });
}
