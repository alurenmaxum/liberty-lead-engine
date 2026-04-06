import { ai } from "@/lib/ai/client";

export interface NurtureContext {
  leadName: string | null;
  primaryConcern: string | null;
  tier: string;
  stepPrompt: string;
  employmentType?: string | null;
  hasDependants?: boolean | null;
  hasExistingCover?: string | null;
  conversationHistory?: string;
  variantIndex?: number;
}

const CONCERN_RISK_ANGLES: Record<string, string> = {
  LIFE_COVER: "the financial gap a family faces when the breadwinner is gone",
  DISABILITY: "losing your income due to illness or injury — the most common financial shock in SA",
  RETIREMENT: "outliving your savings — the average South African retires with far less than needed",
  INVESTMENT: "inflation quietly eroding savings that aren't invested",
  NOT_SURE: "being underinsured without knowing it — the most common situation in SA",
};

const SYSTEM_PROMPT = `You are Kiru, a top Liberty financial adviser in South Africa. You write short WhatsApp messages to warm leads.

Your style:
- Human, direct, warm — like a trusted friend who happens to be an expert
- Lead with a real-life risk or consequence, not a product
- One clear CTA per message
- Under 250 characters total
- Never give specific advice, quotes, or product recommendations
- Never sound like a chatbot or generic marketing copy
- Use the lead's name naturally if you have it
- Vary your phrasing — avoid repeating the same opener

FAIS rules (non-negotiable):
- No specific product recommendations
- No promised returns, rates, or fees
- No "you should buy" or "you need X"
- No guaranteed eligibility claims`;

export async function generateNurtureMessage(
  context: NurtureContext
): Promise<string | null> {
  try {
    const riskAngle =
      CONCERN_RISK_ANGLES[context.primaryConcern ?? ""] ?? CONCERN_RISK_ANGLES.NOT_SURE;

    const segmentLines: string[] = [];
    if (context.employmentType === "SELF_EMPLOYED" || context.employmentType === "BUSINESS_OWNER") {
      segmentLines.push("Lead is self-employed/business owner — income protection is especially relevant.");
    }
    if (context.hasDependants) {
      segmentLines.push("Lead has dependants — family protection angle is strong.");
    }
    if (context.hasExistingCover === "NO") {
      segmentLines.push("Lead has no existing cover — gap awareness is the hook.");
    }

    const userContent = [
      `Write a WhatsApp nurture message for:`,
      `- Name: ${context.leadName ?? "the lead"}`,
      `- Risk angle: ${riskAngle}`,
      `- Lead warmth: ${context.tier}`,
      `- Instruction: ${context.stepPrompt}`,
      segmentLines.length > 0 ? `- Segment context: ${segmentLines.join(" ")}` : "",
      context.variantIndex !== undefined ? `- Variant: write a fresh angle, not the same opener as variant 0` : "",
      context.conversationHistory ? `- Prior context: ${context.conversationHistory}` : "",
    ]
      .filter(Boolean)
      .join("\n");

    const response = await ai.messages.create({
      model: "claude-3-5-haiku-20241022",
      max_tokens: 200,
      system: SYSTEM_PROMPT,
      messages: [{ role: "user", content: userContent }],
    });

    const text =
      response.content[0].type === "text" ? response.content[0].text : null;
    return text;
  } catch (error) {
    console.error("Nurture message generation failed:", error);
    return null;
  }
}
