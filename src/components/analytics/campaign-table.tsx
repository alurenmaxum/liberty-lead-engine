"use client";

interface CampaignRow {
  source: string;
  leads: number;
  qualified: number;
  booked: number;
  closed: number;
}

interface CampaignTableProps {
  data: CampaignRow[];
}

export function CampaignTable({ data }: CampaignTableProps) {
  if (data.length === 0) {
    return (
      <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
        <h3 className="text-sm font-medium text-gray-300 mb-2">Campaigns</h3>
        <p className="text-gray-500 text-sm">No campaign data yet</p>
      </div>
    );
  }

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
      <h3 className="text-sm font-medium text-gray-300 mb-4">Campaigns</h3>
      <table className="w-full text-sm">
        <thead>
          <tr className="text-gray-400 text-left border-b border-gray-800">
            <th className="pb-2">Source</th>
            <th className="pb-2 text-right">Leads</th>
            <th className="pb-2 text-right">Qualified</th>
            <th className="pb-2 text-right">Booked</th>
            <th className="pb-2 text-right">Closed</th>
          </tr>
        </thead>
        <tbody>
          {data.map((row) => (
            <tr key={row.source} className="border-b border-gray-800/50 text-gray-200">
              <td className="py-2">{row.source}</td>
              <td className="py-2 text-right">{row.leads}</td>
              <td className="py-2 text-right">{row.qualified}</td>
              <td className="py-2 text-right">{row.booked}</td>
              <td className="py-2 text-right">{row.closed}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
