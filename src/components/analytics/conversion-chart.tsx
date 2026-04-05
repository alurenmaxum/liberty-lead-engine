"use client";

import { LineChart, Line, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from "recharts";

interface DailyPoint {
  date: string;
  leadsCreated: number;
  booked: number;
  closed: number;
}

interface ConversionChartProps {
  data: DailyPoint[];
}

export function ConversionChart({ data }: ConversionChartProps) {
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
      <h3 className="text-sm font-medium text-gray-300 mb-4">Trend</h3>
      <ResponsiveContainer width="100%" height={240}>
        <LineChart data={data}>
          <XAxis dataKey="date" tick={{ fill: "#9ca3af", fontSize: 11 }} />
          <YAxis tick={{ fill: "#9ca3af", fontSize: 11 }} />
          <Tooltip
            contentStyle={{ background: "#111827", border: "1px solid #374151", color: "#f3f4f6" }}
          />
          <Legend wrapperStyle={{ color: "#9ca3af", fontSize: 12 }} />
          <Line type="monotone" dataKey="leadsCreated" stroke="#60a5fa" dot={false} name="Leads" />
          <Line type="monotone" dataKey="booked" stroke="#34d399" dot={false} name="Booked" />
          <Line type="monotone" dataKey="closed" stroke="#f59e0b" dot={false} name="Closed" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
