import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { getMetricsSummary } from "@/modules/analytics/metrics";
import { computeFunnel } from "@/modules/analytics/funnel";
import { getCampaignPerformance } from "@/modules/analytics/campaigns";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = req.nextUrl;
  const from = new Date(searchParams.get("from") ?? new Date(Date.now() - 30 * 86400000).toISOString());
  const to = new Date(searchParams.get("to") ?? new Date().toISOString());

  const [metrics, funnel, campaigns] = await Promise.all([
    getMetricsSummary(from, to),
    computeFunnel(from, to),
    getCampaignPerformance(from, to),
  ]);

  const lines: string[] = [];

  // Metrics section
  lines.push("Metric,Value");
  lines.push(`Total Leads,${metrics.leadsCreated}`);
  lines.push(`Qualified,${metrics.qualified}`);
  lines.push(`Booked,${metrics.booked}`);
  lines.push(`Consulted,${metrics.consulted}`);
  lines.push(`Closed,${metrics.closed}`);
  lines.push(`Lost,${metrics.lost}`);
  lines.push(`Total Ad Spend,${metrics.totalAdSpend.toFixed(2)}`);
  lines.push(`Avg CPL,${metrics.avgCostPerLead.toFixed(2)}`);
  lines.push(`Avg Conversion Rate,${(metrics.avgConversionRate * 100).toFixed(2)}%`);
  lines.push("");

  // Funnel section
  lines.push("Funnel Stage,Count,Conversion Rate");
  for (const step of funnel) {
    lines.push(`${step.event},${step.count},${(step.conversionRate * 100).toFixed(1)}%`);
  }
  lines.push("");

  // Campaigns section
  lines.push("Source,Leads,Qualified,Booked,Closed");
  for (const c of campaigns) {
    lines.push(`${c.source},${c.leads},${c.qualified},${c.booked},${c.closed}`);
  }

  const csv = lines.join("\n");
  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": `attachment; filename="analytics-${from.toISOString().slice(0, 10)}-${to.toISOString().slice(0, 10)}.csv"`,
    },
  });
}
