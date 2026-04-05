import { describe, it, expect, vi, beforeEach } from "vitest";
import { getCampaignPerformance } from "@/modules/analytics/campaigns";

vi.mock("@/lib/db", () => ({
  db: {
    lead: {
      groupBy: vi.fn(),
    },
  },
}));

import { db } from "@/lib/db";

const mockGroupBy = db.lead.groupBy as ReturnType<typeof vi.fn>;

beforeEach(() => vi.clearAllMocks());

describe("getCampaignPerformance", () => {
  it("returns empty array when no leads", async () => {
    mockGroupBy.mockResolvedValue([]);
    const result = await getCampaignPerformance(new Date("2026-01-01"), new Date("2026-01-31"));
    expect(result).toEqual([]);
  });

  it("groups leads by source and counts stages", async () => {
    mockGroupBy.mockResolvedValue([
      { source: "facebook", stage: "NEW", _count: { id: 5 } },
      { source: "facebook", stage: "QUALIFIED", _count: { id: 3 } },
      { source: "facebook", stage: "CLOSED", _count: { id: 2 } },
      { source: "google", stage: "NEW", _count: { id: 10 } },
      { source: "google", stage: "BOOKED", _count: { id: 4 } },
    ]);

    const result = await getCampaignPerformance(new Date("2026-01-01"), new Date("2026-01-31"));
    expect(result).toHaveLength(2);

    const google = result.find((r) => r.source === "google")!;
    expect(google.leads).toBe(14);
    expect(google.booked).toBe(4);
    expect(google.closed).toBe(0);

    const facebook = result.find((r) => r.source === "facebook")!;
    expect(facebook.leads).toBe(10);
    expect(facebook.qualified).toBe(5); // QUALIFIED + CLOSED
    expect(facebook.closed).toBe(2);
  });

  it("sorts by leads descending", async () => {
    mockGroupBy.mockResolvedValue([
      { source: "organic", stage: "NEW", _count: { id: 2 } },
      { source: "facebook", stage: "NEW", _count: { id: 10 } },
    ]);
    const result = await getCampaignPerformance(new Date("2026-01-01"), new Date("2026-01-31"));
    expect(result[0].source).toBe("facebook");
  });
});
