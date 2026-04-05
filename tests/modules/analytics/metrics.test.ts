import { describe, it, expect, vi, beforeEach } from "vitest";
import { getMetricsSummary } from "@/modules/analytics/metrics";

vi.mock("@/lib/db", () => ({
  db: {
    dailyMetrics: {
      findMany: vi.fn(),
    },
  },
}));

import { db } from "@/lib/db";

const mockFindMany = db.dailyMetrics.findMany as ReturnType<typeof vi.fn>;

beforeEach(() => vi.clearAllMocks());

describe("getMetricsSummary", () => {
  it("returns zeros when no rows", async () => {
    mockFindMany.mockResolvedValue([]);
    const result = await getMetricsSummary(new Date("2026-01-01"), new Date("2026-01-31"));
    expect(result.leadsCreated).toBe(0);
    expect(result.totalAdSpend).toBe(0);
    expect(result.avgCostPerLead).toBe(0);
    expect(result.avgConversionRate).toBe(0);
  });

  it("sums totals and averages across 2 daily rows", async () => {
    mockFindMany.mockResolvedValue([
      {
        date: new Date("2026-01-01"),
        leadsCreated: 10,
        qualified: 8,
        booked: 4,
        consulted: 3,
        closed: 2,
        lost: 1,
        adSpend: "50.00",
        costPerLead: "5.00",
        conversionRate: "0.2000",
        updatedAt: new Date(),
      },
      {
        date: new Date("2026-01-02"),
        leadsCreated: 20,
        qualified: 16,
        booked: 8,
        consulted: 6,
        closed: 4,
        lost: 2,
        adSpend: "100.00",
        costPerLead: "5.00",
        conversionRate: "0.2000",
        updatedAt: new Date(),
      },
    ]);

    const result = await getMetricsSummary(new Date("2026-01-01"), new Date("2026-01-02"));
    expect(result.leadsCreated).toBe(30);
    expect(result.qualified).toBe(24);
    expect(result.booked).toBe(12);
    expect(result.consulted).toBe(9);
    expect(result.closed).toBe(6);
    expect(result.lost).toBe(3);
    expect(result.totalAdSpend).toBeCloseTo(150);
    expect(result.avgCostPerLead).toBeCloseTo(5);
    expect(result.avgConversionRate).toBeCloseTo(0.2);
  });
});
