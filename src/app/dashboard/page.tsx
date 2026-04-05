import { getAllLeads } from "@/lib/pipeline";
import Link from "next/link";

const STAGE_COLUMNS = [
  "NEW",
  "QUALIFYING",
  "QUALIFIED",
  "NURTURING",
  "BOOKING",
  "BOOKED",
] as const;

const TIER_COLORS: Record<string, string> = {
  HOT: "bg-red-500",
  WARM: "bg-yellow-500",
  COLD: "bg-blue-500",
};

export default async function DashboardPage() {
  const leads = await getAllLeads();

  const byStage = Object.fromEntries(
    STAGE_COLUMNS.map((s) => [s, leads.filter((l) => l.stage === s)])
  );

  return (
    <div>
      <h1 className="text-lg font-semibold mb-4">Pipeline</h1>
      <div className="flex gap-3 overflow-x-auto pb-4">
        {STAGE_COLUMNS.map((stage) => (
          <div key={stage} className="min-w-[180px] flex-shrink-0">
            <div className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-2">
              {stage} ({byStage[stage]?.length ?? 0})
            </div>
            <div className="space-y-2">
              {(byStage[stage] ?? []).map((lead) => (
                <Link
                  key={lead.id}
                  href={`/dashboard/leads/${lead.id}`}
                  className="block bg-gray-900 rounded p-3 hover:bg-gray-800 transition-colors"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-white truncate">
                      {lead.firstName ?? lead.phone}
                    </span>
                    <span
                      className={`ml-2 w-2 h-2 rounded-full flex-shrink-0 ${TIER_COLORS[lead.tier] ?? "bg-gray-500"}`}
                    />
                  </div>
                  <div className="text-xs text-gray-500">{lead.phone}</div>
                  <div className="text-xs text-gray-600 mt-1">
                    Score: {lead.score}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
