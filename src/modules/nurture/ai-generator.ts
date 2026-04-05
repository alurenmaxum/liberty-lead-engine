import { ai } from "@/lib/ai/client";

export interface NurtureContext {
  leadName: string | null;
  primaryConcern: string | null;
  tier: string;
  stepPrompt: string;
  conversationHistory?: string;
}

const CONCERN_TOPICS: Record<string, string> = {
  LIFE_COVER: "life insurance, family protection, cover gaps",
  DISABILITY: "income protection, disability cover, financial safety nets",
  RETIREMENT: "retirement planning, tax efficiency, compound growth",
  INVESTMENT: "investment fundamentals, diversification, wealth building",
  NOT_SURE: "general financial wellness, protection planning",
};

const SYSTEM_PROMPT = `You are a helpful, professional financial education assistant for a Liberty Life adviser's automated nurture system in South Africa.

Messages are sent via WhatsApp to people interested in financial cover but not yet ready to book.

RULES:
1. NEVER give specific product recommendations
2. NEVER quote specific returns, rates, or fees
3. NEVER say "you should buy" or "you need" a specific product
4. Keep messages under 300 characters
5. Be warm, professional, and educational
6. End with a soft invitation to chat with a licensed adviser
7. Use the lead's first name if provided`;

export async function generateNurtureMessage(
  context: NurtureContext
): Promise<string | null> {
  try {
    const topics =
      CONCERN_TOPICS[context.primaryConcern ?? ""] ?? CONCERN_TOPICS.NOT_SURE;

    const response = await ai.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 200,
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: "user",
          content: [
            `Write a WhatsApp nurture message for:`,
            `- Name: ${context.leadName ?? "there"}`,
            `- Interest area: ${topics}`,
            `- Lead warmth: ${context.tier}`,
            `- Instruction: ${context.stepPrompt}`,
            context.conversationHistory
              ? `- Previous context: ${context.conversationHistory}`
              : "",
          ]
            .filter(Boolean)
            .join("\n"),
        },
      ],
    });

    const text =
      response.content[0].type === "text" ? response.content[0].text : null;
    return text;
  } catch (error) {
    console.error("Nurture message generation failed:", error);
    return null;
  }
}
