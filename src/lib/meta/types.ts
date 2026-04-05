export interface DailyAdSpend {
  date: string; // YYYY-MM-DD
  spend: number;
  impressions: number;
  clicks: number;
}

export interface MetaInsightsResponse {
  data: Array<{
    date_start: string;
    spend: string;
    impressions: string;
    clicks: string;
  }>;
  paging?: {
    cursors?: { before: string; after: string };
    next?: string;
  };
}
