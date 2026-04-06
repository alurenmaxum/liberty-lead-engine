type Tier = "HOT" | "WARM" | "COLD";
type LeadStage = "BOOKING" | "NURTURING";

export interface NurtureLeadContext {
  firstName?: string | null;
  tier: Exclude<Tier, "HOT">;
  primaryConcern?: string | null;
  employmentType?: string | null;
  hasDependants?: boolean | null;
  hasExistingCover?: string | null;
}

export function getNurtureStage(tier: Tier): LeadStage {
  return tier === "HOT" ? "BOOKING" : "NURTURING";
}

// Risk-led openers segmented by concern
const RISK_HOOKS: Record<string, string[]> = {
  LIFE_COVER: [
    "Most families only realise their cover is too low when it's too late.",
    "If something happened to you today, would your family be okay financially?",
  ],
  DISABILITY: [
    "1 in 4 people will be unable to work at some point in their career.",
    "Your income is your biggest asset — most people don't protect it.",
  ],
  RETIREMENT: [
    "The average South African retires with less than 10% of what they need.",
    "Compound growth works best when you start early — every year matters.",
  ],
  INVESTMENT: [
    "Inflation quietly erodes savings that aren't working hard enough.",
    "Most people leave significant returns on the table without realising it.",
  ],
  NOT_SURE: [
    "Most people in SA are underinsured — and most don't know it.",
    "A 15-minute conversation can reveal gaps you didn't know existed.",
  ],
};

function getRiskHook(concern: string | null | undefined, variantIndex: number): string {
  const hooks = RISK_HOOKS[concern ?? ""] ?? RISK_HOOKS.NOT_SURE;
  return hooks[variantIndex % hooks.length];
}

// Segment-specific context lines
function getSegmentLine(ctx: NurtureLeadContext): string {
  if (ctx.employmentType === "SELF_EMPLOYED" || ctx.employmentType === "BUSINESS_OWNER") {
    return "As someone running their own income, a gap in cover hits harder than most.";
  }
  if (ctx.hasDependants) {
    return "With people depending on you, the stakes are higher than average.";
  }
  if (ctx.hasExistingCover === "NO") {
    return "You mentioned you don't have cover yet — that's exactly where we can help.";
  }
  return "";
}

export function buildNurtureMessage(
  firstName: string | null | undefined,
  tier: Exclude<Tier, "HOT">,
  primaryConcern?: string | null,
  variantIndex = 0
): string {
  const name = firstName ? ` ${firstName}` : "";
  const hook = getRiskHook(primaryConcern, variantIndex);

  if (tier === "WARM") {
    return (
      `Hey${name} 👋 ${hook}\n\n` +
      "Kiru can walk you through where you stand — free, no obligation. Just reply to book a 15-min call."
    );
  }

  // COLD — softer, no direct CTA to book
  return (
    `Hey${name} 👋 ${hook}\n\n` +
    "No pressure — just reply if you'd like to know more. Kiru's happy to chat."
  );
}

export function buildSegmentedNurtureMessage(ctx: NurtureLeadContext, variantIndex = 0): string {
  const name = ctx.firstName ? ` ${ctx.firstName}` : "";
  const hook = getRiskHook(ctx.primaryConcern, variantIndex);
  const segmentLine = getSegmentLine(ctx);

  const body = segmentLine ? `${hook} ${segmentLine}` : hook;

  if (ctx.tier === "WARM") {
    return `Hey${name} 👋 ${body}\n\nReply to book a free 15-min call with Kiru.`;
  }

  return `Hey${name} 👋 ${body}\n\nJust reply if you'd like to know more — no pressure.`;
}
