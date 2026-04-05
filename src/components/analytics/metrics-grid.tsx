"use client";

interface MetricsSummary {
  leadsCreated: number;
  booked: number;
  closed: number;
  totalAdSpend: number;
  avgCostPerLead: number;
  avgConversionRate: number;
}

interface MetricsGridProps {
  data: MetricsSummary;
}

function KpiCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
      <p className="text-xs text-gray-400 mb-1">{label}</p>
      <p className="text-2xl font-semibold text-white">{value}</p>
    </div>
  );
}

export function MetricsGrid({ data }: MetricsGridProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
      <KpiCard label="Total Leads" value={String(data.leadsCreated)} />
      <KpiCard label="Booked" value={String(data.booked)} />
      <KpiCard label="Closed Deals" value={String(data.closed)} />
      <KpiCard label="Ad Spend" value={`R${data.totalAdSpend.toFixed(2)}`} />
      <KpiCard label="Avg CPL" value={`R${data.avgCostPerLead.toFixed(2)}`} />
      <KpiCard label="Conversion" value={`${(data.avgConversionRate * 100).toFixed(1)}%`} />
    </div>
  );
}
