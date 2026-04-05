import { getLeadWithConversation } from "@/lib/pipeline";
import { notFound } from "next/navigation";
import Link from "next/link";

const TIER_BADGE: Record<string, string> = {
  HOT: "bg-red-900 text-red-300",
  WARM: "bg-yellow-900 text-yellow-300",
  COLD: "bg-blue-900 text-blue-300",
};

export default async function LeadDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const lead = await getLeadWithConversation(id);
  if (!lead) notFound();

  const latestConversation = lead.conversations[0];
  const appointment = lead.appointments[0];
  const briefing = appointment?.briefing as Record<string, string> | null | undefined;

  return (
    <div className="max-w-3xl space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/dashboard" className="text-gray-500 hover:text-white text-sm">
          ← Pipeline
        </Link>
      </div>

      {/* Lead header */}
      <div className="bg-gray-900 rounded-lg p-4 space-y-2">
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-semibold text-white">
            {lead.firstName ?? "Unknown"} {lead.lastName ?? ""}
          </h2>
          <span
            className={`text-xs px-2 py-0.5 rounded-full font-medium ${TIER_BADGE[lead.tier] ?? "bg-gray-800 text-gray-400"}`}
          >
            {lead.tier}
          </span>
          <span className="text-xs text-gray-500">{lead.stage}</span>
        </div>
        <div className="text-sm text-gray-400">{lead.phone}</div>
        <div className="text-sm text-gray-500">Score: {lead.score}</div>
      </div>

      {/* Adviser briefing */}
      {briefing && (
        <div className="bg-gray-900 rounded-lg p-4 space-y-2">
          <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wide">
            Adviser Briefing
          </h3>
          <dl className="space-y-1 text-sm">
            <div>
              <dt className="text-gray-500 inline">Product interest: </dt>
              <dd className="text-gray-200 inline">{briefing.productInterest}</dd>
            </div>
            <div>
              <dt className="text-gray-500 inline">Income indicators: </dt>
              <dd className="text-gray-200 inline">{briefing.incomeIndicators}</dd>
            </div>
            <div>
              <dt className="text-gray-500 inline">Needs: </dt>
              <dd className="text-gray-200 inline">{briefing.needsSummary}</dd>
            </div>
            <div>
              <dt className="text-gray-500 inline">Urgency: </dt>
              <dd className="text-gray-200 inline">{briefing.urgencyLevel}</dd>
            </div>
            <div>
              <dt className="text-gray-500 inline">Next step: </dt>
              <dd className="text-gray-200 inline">{briefing.recommendedNextStep}</dd>
            </div>
          </dl>
        </div>
      )}

      {/* Conversation */}
      {latestConversation && (
        <div className="bg-gray-900 rounded-lg p-4 space-y-3">
          <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wide">
            Conversation
          </h3>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {latestConversation.messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.direction === "OUT" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-xs rounded-lg px-3 py-2 text-sm whitespace-pre-wrap ${
                    msg.direction === "OUT"
                      ? "bg-blue-800 text-blue-100"
                      : "bg-gray-800 text-gray-200"
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
