import { ai } from "@/lib/ai/client";

export interface ToneCheckResult {
  result: "pass" | "flag" | "block";
  reason?: string;
}

interface ToneContext {
  leadName?: string;
  concern?: string;
  conversationSummary?: string;
}

const SYSTEM_PROMPT = `You are a FAIS compliance checker for a South African financial services lead generation system.

Check if a WhatsApp message is compliant with South African financial advertising rules.

NON-COMPLIANT (block): specific product recommendations, promised returns/outcomes, personalised financial advice, unsubstantiated comparisons, aggressive urgency/fear, guaranteed eligibility.
BORDERLINE (flag): close to advice, mildly aggressive persuasion, general claims that could be misinterpreted.
COMPLIANT (pass): broad education, invites to speak with adviser, general tips, trust-building content.

Respond ONLY with JSON: {"result": "pass"|"flag"|"block", "reason": "brief explanation if flag or block"}`;

export async function checkTone(
  content: string,
  context: ToneContext
): Promise<ToneCheckResult> {
  try {
    const contextStr = [
      context.leadName && `Lead: ${context.leadName}`,
      context.concern && `Interest area: ${context.concern}`,
      context.conversationSummary && `Context: ${context.conversationSummary}`,
    ]
      .filter(Boolean)
      .join(". ");

    const response = await ai.messages.create({
      model: "claude-3-5-haiku-20241022",
      max_tokens: 150,
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: "user",
          content: `Check this message for compliance:\n\n"${content}"\n\n${contextStr ? `Context: ${contextStr}` : ""}`,
        },
      ],
    });

    const text =
      response.content[0].type === "text" ? response.content[0].text : "";
    const parsed = JSON.parse(text) as { result?: string; reason?: string };

    return {
      result: (parsed.result as ToneCheckResult["result"]) ?? "flag",
      reason: parsed.reason,
    };
  } catch (error) {
    return {
      result: "flag",
      reason: `Compliance AI check failed: ${error instanceof Error ? error.message : "Unknown error"}`,
    };
  }
}
