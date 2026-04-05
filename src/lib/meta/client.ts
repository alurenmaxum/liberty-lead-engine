import type { DailyAdSpend, MetaInsightsResponse } from "./types";

const META_API_VERSION = "v19.0";

export class MetaAdsClient {
  private readonly accessToken: string;
  private readonly adAccountId: string;

  constructor(accessToken: string, adAccountId: string) {
    this.accessToken = accessToken;
    this.adAccountId = adAccountId;
  }

  async getDailySpend(from: Date, to: Date): Promise<DailyAdSpend[]> {
    const fmt = (d: Date) => d.toISOString().slice(0, 10);
    const url =
      `https://graph.facebook.com/${META_API_VERSION}/act_${this.adAccountId}/insights` +
      `?fields=date_start,spend,impressions,clicks` +
      `&time_range={"since":"${fmt(from)}","until":"${fmt(to)}"}` +
      `&time_increment=1` +
      `&access_token=${this.accessToken}`;

    const res = await fetch(url);
    if (!res.ok) {
      throw new Error(`Meta Ads API error: ${res.status} ${res.statusText}`);
    }

    const json = (await res.json()) as MetaInsightsResponse;
    return json.data.map((row) => ({
      date: row.date_start,
      spend: parseFloat(row.spend),
      impressions: parseInt(row.impressions, 10),
      clicks: parseInt(row.clicks, 10),
    }));
  }
}

let _client: MetaAdsClient | null = null;

export function getMetaAdsClient(): MetaAdsClient | null {
  const token = process.env.META_ADS_ACCESS_TOKEN;
  const accountId = process.env.META_AD_ACCOUNT_ID;
  if (!token || !accountId) return null;
  if (!_client) _client = new MetaAdsClient(token, accountId);
  return _client;
}
