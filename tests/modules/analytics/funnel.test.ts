import { describe, it, expect, vi, beforeEach } from "vitest";
import { computeFunnel, FUNNEL_ORDER } from "@/modules/analytics/funnel";

vi.mock("@/lib/db", () => ({
  db: {
    analyticsEvent: {
      groupBy: vi.fn(),
    },
  },
}));

import { db } from "@/lib/db";

const mockGroupBy = db.analyticsEvent.groupBy as ReturnType<typeof vi.fn>;

beforeEach(() => vi.clearAllMocks());

describe("computeFunnel", () => {
  it("returns 7 funnel stages", async () => {
    mockGroupBy.mockResolvedValue([]);
    const result = await computeFunnel(new Date("2026-01-01"), new Date("2026-01-31"));
    expect(result).toHaveLength(7);
    expect(result.map((r) => r.event)).toEqual([...FUNNEL_ORDER]);
  });

  it("returns zeros when no events", async () => {
    mockGroupBy.mockResolvedValue([]);
    const result = await computeFunnel(new Date("2026-01-01"), new Date("2026-01-31"));
    for (const step of result) {
      expect(step.count).toBe(0);
      expect(step.conversionRate).toBe(0);
    }
  });

  it("computes conversion rates correctly", async () => {
    mockGroupBy.mockResolvedValue([
      { event: "wa_opened", _count: { id: 100 } },
      { event: "qual_started", _count: { id: 80 } },
      { event: "qual_completed", _count: { id: 40 } },
      { event: "booking_created", _count: { id: 20 } },
      { event: "booking_kept", _count: { id: 15 } },
      { event: "consultation_done", _count: { id: 10 } },
      { event: "deal_closed", _count: { id: 5 } },
    ]);
    const result = await computeFunnel(new Date("2026-01-01"), new Date("2026-01-31"));
    expect(result[0].conversionRate).toBe(1); // first step always 1
    expect(result[1].conversionRate).toBeCloseTo(0.8);
    expect(result[2].conversionRate).toBeCloseTo(0.5);
    expect(result[6].conversionRate).toBeCloseTo(0.5);
  });

  it("is zero-safe when previous step is zero", async () => {
    mockGroupBy.mockResolvedValue([
      { event: "booking_created", _count: { id: 5 } },
    ]);
    const result = await computeFunnel(new Date("2026-01-01"), new Date("2026-01-31"));
    // booking_kept depends on booking_created (5), so rate = 0/5 = 0
    const bookingKept = result.find((r) => r.event === "booking_kept")!;
    expect(bookingKept.conversionRate).toBe(0);
    // qual_started depends on wa_opened (0), so rate = 0
    const qualStarted = result.find((r) => r.event === "qual_started")!;
    expect(qualStarted.conversionRate).toBe(0);
  });
});
