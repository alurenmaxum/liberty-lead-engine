import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { MetaAdsClient, getMetaAdsClient } from "@/lib/meta/client";

beforeEach(() => vi.clearAllMocks());
afterEach(() => vi.unstubAllGlobals());

describe("MetaAdsClient.getDailySpend", () => {
  it("parses response correctly", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        data: [
          { date_start: "2026-01-01", spend: "25.50", impressions: "1000", clicks: "50" },
          { date_start: "2026-01-02", spend: "30.00", impressions: "1200", clicks: "60" },
        ],
      }),
    }));

    const client = new MetaAdsClient("token123", "123456");
    const result = await client.getDailySpend(new Date("2026-01-01"), new Date("2026-01-02"));

    expect(result).toHaveLength(2);
    expect(result[0]).toEqual({ date: "2026-01-01", spend: 25.5, impressions: 1000, clicks: 50 });
    expect(result[1].spend).toBe(30);
  });

  it("throws on non-ok response", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
      ok: false,
      status: 401,
      statusText: "Unauthorized",
    }));

    const client = new MetaAdsClient("bad-token", "123456");
    await expect(client.getDailySpend(new Date("2026-01-01"), new Date("2026-01-01"))).rejects.toThrow(
      "Meta Ads API error: 401"
    );
  });
});

describe("getMetaAdsClient", () => {
  it("returns null when env vars not set", () => {
    delete process.env.META_ADS_ACCESS_TOKEN;
    delete process.env.META_AD_ACCOUNT_ID;
    expect(getMetaAdsClient()).toBeNull();
  });

  it("returns client when env vars are set", () => {
    process.env.META_ADS_ACCESS_TOKEN = "test-token";
    process.env.META_AD_ACCOUNT_ID = "test-account";
    const client = getMetaAdsClient();
    expect(client).toBeInstanceOf(MetaAdsClient);
    // cleanup
    delete process.env.META_ADS_ACCESS_TOKEN;
    delete process.env.META_AD_ACCOUNT_ID;
  });
});
