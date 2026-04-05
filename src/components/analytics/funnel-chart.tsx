"use client";

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";

interface FunnelStep {
  event: string;
  count: number;
  conversionRate: number;
}

interface FunnelChartProps {
  data: FunnelStep[];
}

export function FunnelChart({ data }: FunnelChartProps) {
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
      <h3 className="text-sm font-medium text-gray-300 mb-4">Conversion Funnel</h3>
      <ResponsiveContainer width="100%" height={280}>
        <BarChart data={data} layout="vertical" margin={{ left: 20, right: 20 }}>
          <XAxis type="number" tick={{ fill: "#9ca3af", fontSize: 11 }} />
          <YAxis
            type="category"
            dataKey="event"
            tick={{ fill: "#9ca3af", fontSize: 11 }}
            width={130}
          />
          <Tooltip
            contentStyle={{ background: "#111827", border: "1px solid #374151", color: "#f3f4f6" }}
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
          formatter={((value: unknown) => [value ?? 0, "Count"]) as any}
          />
          <Bar dataKey="count" radius={[0, 4, 4, 0]}>
            {data.map((_, i) => (
              <Cell key={i} fill={`hsl(${220 - i * 20}, 70%, ${60 - i * 5}%)`} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
