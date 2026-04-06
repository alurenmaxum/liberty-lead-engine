import type { BotState } from "./states";

// Multiple variants for states where A/B learning matters.
// Caller picks by (leadId hash % variants.length) or round-robin.
export const MESSAGE_VARIANTS: Partial<Record<BotState, string[]>> = {
  CONSENT: [
    "Hey 👋 Quick question — are you protected if something happened to your income tomorrow?\n\nI can help you find out in 2 minutes.\n\n1️⃣ Let's go\n2️⃣ Not now",
    "Hi there 👋 Most people in SA are underinsured and don't know it.\n\nWant a quick check? Takes 2 minutes.\n\n1️⃣ Yes, check me\n2️⃣ No thanks",
    "Hey 👋 Kiru from Liberty here. One quick question — if you couldn't work for 3 months, would your family be okay?\n\nLet's find out.\n\n1️⃣ Show me\n2️⃣ Not right now",
  ],
  RESULT_HOT: [
    "You're in a spot where the right cover could make a real difference.\n\nKiru has a 15-min slot — no sales pitch, just clarity. Book now: 📅",
    "Based on what you've shared, there are some real gaps worth looking at.\n\nGrab a free 15 mins with Kiru: 📅",
  ],
  RESULT_WARM: [
    "Thanks for sharing that. Kiru will be in touch — expect a message soon.",
    "Good stuff. A Liberty adviser will reach out shortly to chat through your options.",
  ],
  RESULT_COLD: [
    "Got it. If anything changes or you want to chat, just reply here — Kiru's always around.",
    "No rush. When you're ready, just reply and we'll pick it up from here.",
  ],
};

export function getMessageForState(state: BotState, leadName?: string, variantIndex = 0): string {
  const name = leadName ? ` ${leadName}` : "";

  // Use variant if available
  const variants = MESSAGE_VARIANTS[state];
  if (variants && variants.length > 0) {
    return variants[variantIndex % variants.length];
  }

  switch (state) {
    case "Q1_NAME":
      return "What's your first name?";
    case "Q2_AGE":
      return (
        `Which age group are you in${name ? `, ${leadName}` : ""}?\n` +
        "1️⃣ Under 28\n2️⃣ 28–35\n3️⃣ 36–42\n4️⃣ 43–50\n5️⃣ Over 50"
      );
    case "Q3_EMPLOYMENT":
      return "And your work situation?\n1️⃣ Employed\n2️⃣ Self-employed\n3️⃣ Business owner";
    case "Q4A_MARITAL":
      return "Do you have a partner or spouse?\n1️⃣ Yes\n2️⃣ No";
    case "Q4B_DEPENDANTS":
      return "Anyone depending on your income — kids, family?\n1️⃣ Yes\n2️⃣ No";
    case "Q5_COVER":
      return "Do you have any life or disability cover right now?\n1️⃣ Yes\n2️⃣ No\n3️⃣ Not sure";
    case "Q6_CONCERN":
      return (
        "What's the biggest thing on your mind?\n" +
        "1️⃣ Life cover\n2️⃣ Income if I can't work\n" +
        "3️⃣ Retirement\n4️⃣ Growing my money\n5️⃣ Not sure yet"
      );
    case "Q7_CONTACT_TIME":
      return (
        "When's a good time for a quick call?\n" +
        "1️⃣ Morning\n2️⃣ Afternoon\n3️⃣ Evening\n4️⃣ Send me the link now"
      );
    case "CONSENT_DECLINED":
      return "No problem. If you ever want to check your cover, just message us. 👋";
    case "HUMAN_TAKEOVER":
      return "Got it — I'll get Kiru to reach out to you directly.";
    default:
      return "";
  }
}

export function getRetryMessage(state: BotState): string {
  switch (state) {
    case "CONSENT":
      return "Just tap 1 to continue or 2 to opt out — that's all I need.";
    case "Q1_NAME":
      return "Just your first name is fine 😊";
    case "Q4B_DEPENDANTS":
      return "Yes or no — do you have anyone depending on your income?";
    default:
      return "Could you pick one of the numbered options?";
  }
}

// Nudge for stalled conversations — short, human, no pressure
export function getCasualNudgeMessage(state: BotState, leadName?: string): string {
  const name = leadName ? ` ${leadName}` : "";
  switch (state) {
    case "CONSENT":
      return `Hey${name} 👋 Still there? Just tap 1 to continue or 2 to opt out.`;
    case "Q6_CONCERN":
      return `${name ? `${leadName}, ` : ""}what's the main thing you'd like sorted? Pick a number above.`;
    case "Q7_CONTACT_TIME":
      return "When works for a quick call? Just pick a number above.";
    default:
      return `Hey${name} — still with us? Just reply with a number to continue.`;
  }
}
