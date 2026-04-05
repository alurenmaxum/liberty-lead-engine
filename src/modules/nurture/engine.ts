type Tier = "HOT" | "WARM" | "COLD";
type LeadStage = "BOOKING" | "NURTURING";

const CONCERN_TOPICS: Record<string, string> = {
  LIFE_COVER: "life cover",
  DISABILITY: "disability and income protection",
  RETIREMENT: "retirement planning",
  INVESTMENT: "investment options",
  NOT_SURE: "financial planning",
};

export function getNurtureStage(tier: Tier): LeadStage {
  return tier === "HOT" ? "BOOKING" : "NURTURING";
}

export function buildNurtureMessage(
  firstName: string | null | undefined,
  tier: Exclude<Tier, "HOT">,
  primaryConcern?: string | null
): string {
  const name = firstName ? ` ${firstName}` : "";
  const topic = CONCERN_TOPICS[primaryConcern ?? ""] ?? "financial planning";

  if (tier === "WARM") {
    return (
      `Hi${name}! 👋 Just checking in — we'd love to help you explore your options around ${topic}.\n\n` +
      "When you're ready for a quick no-obligation chat with Kiru, just reply here and we'll get you booked in."
    );
  }

  // COLD
  return (
    `Hi${name}! We wanted to share a quick tip on ${topic} that might be useful.\n\n` +
    "If you ever want to explore your options, our adviser Kiru is happy to help — no pressure, just a conversation. Reply here anytime."
  );
}
