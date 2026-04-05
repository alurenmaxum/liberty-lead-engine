"use client";

import { useState, useEffect, useCallback } from "react";
import { DateRangePicker } from "@/components/analytics/date-range-picker";
import { MetricsGrid } from "@/components/analytics/metrics-grid";
import { FunnelChart } from "@/components/analytics/funnel-chart";
import { ConversionChart } from "@/components/analytics/conversion-chart";
import { CampaignTable } from "@/components/analytics/campaign-table";

interface MetricsSummary {
  leadsCreated: number;
  qualified: number;
  booked: number;
  consulted: number;
  closed: number;
  lost: number;
  totalAdSpend: number;
  avgCostPerLead: number;
  avgConversionRate: number;
  daily: { date: string; leadsCreated: number; booked: number; closed: number }[];
}

interface FunnelStep {
  event: string;
  count: number;
  conversionRate: number;
}

interface CampaignRow {
  source: string;
  leads: number;
  qualified: number;
  booked: number;
  closed: number;
}

const fmt = (d: Date) => d.toISOString().slice(0, 10);

const defaultMetrics: MetricsSummary = {
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

export default function AnalyticsPage() {
  const [from, setFrom] = useState(fmt(new Date(Date.now() - 30 * 86400000)));
  const [to, setTo] = useState(fmt(new Date()));
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState<MetricsSummary>(defaultMetrics);
  const [funnel, setFunnel] = useState<FunnelStep[]>([]);
  const [campaigns, setCampaigns] = useState<CampaignRow[]>([]);

  const load = useCallback(async () => {
    setLoading(true);
    const qs = `?from=${from}&to=${to}`;
    const [mRes, fRes, cRes] = await Promise.all([
      fetch(`/api/analytics/metrics${qs}`),
      fetch(`/api/analytics/funnel${qs}`),
      fetch(`/api/analytics/campaigns${qs}`),
    ]);
    const [m, f, c] = await Promise.all([mRes.json(), fRes.json(), cRes.json()]);
    setMetrics(m as MetricsSummary);
    setFunnel(f as FunnelStep[]);
    setCampaigns(c as CampaignRow[]);
    setLoading(false);
  }, [from, to]);

  useEffect(() => { void load(); }, [load]);

  const exportUrl = `/api/analytics/export?from=${from}&to=${to}`;

  if (loading) return <p className="text-gray-400">Loading analytics...</p>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-lg font-semibold text-white">Analytics</h1>
        <div className="flex items-center gap-4">
          <DateRangePicker from={from} to={to} onChange={(f, t) => { setFrom(f); setTo(t); }} />
          <a
            href={exportUrl}
            className="text-sm text-blue-400 hover:text-blue-300 underline"
          >
            Export CSV
          </a>
        </div>
      </div>

      <MetricsGrid data={metrics} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <FunnelChart data={funnel} />
        <ConversionChart data={metrics.daily} />
      </div>

      <CampaignTable data={campaigns} />
    </div>
  );
}
