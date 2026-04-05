import type { BotState } from "./states";

export function getMessageForState(state: BotState, leadName?: string): string {
  const name = leadName ? ` ${leadName}` : "";
  switch (state) {
    case "CONSENT":
      return (
        "Hi! 👋 Thanks for reaching out about your cover review. " +
        "Before we continue, I need your consent to collect some basic details.\n\n" +
        "Do you agree to continue?\n1️⃣ Yes, I agree\n2️⃣ No thanks"
      );
    case "Q1_NAME":
      return "Great! What's your first name?";
    case "Q2_AGE":
      return (
        `Thanks${name}! Which age group are you in?\n` +
        "1️⃣ Under 28\n2️⃣ 28–35\n3️⃣ 36–42\n4️⃣ 43–50\n5️⃣ Over 50"
      );
    case "Q3_EMPLOYMENT":
      return "Are you currently:\n1️⃣ Employed\n2️⃣ Self-employed\n3️⃣ Business owner";
    case "Q4A_MARITAL":
      return "Are you married or living with a partner?\n1️⃣ Yes\n2️⃣ No";
    case "Q4B_DEPENDANTS":
      return "Do you have any dependants (children or others who rely on your income)?";
    case "Q5_COVER":
      return "Do you currently have any life or disability cover?\n1️⃣ Yes\n2️⃣ No\n3️⃣ Not sure";
    case "Q6_CONCERN":
      return (
        "What's your main concern right now?\n" +
        "1️⃣ Life cover\n2️⃣ Disability / income protection\n" +
        "3️⃣ Retirement planning\n4️⃣ Investment advice\n5️⃣ Not sure yet"
      );
    case "Q7_CONTACT_TIME":
      return (
        "When works best for a quick 15-minute call?\n" +
        "1️⃣ Morning\n2️⃣ Afternoon\n3️⃣ Evening\n4️⃣ Send me a link now"
      );
    case "RESULT_HOT":
      return (
        `Thanks${name}! It sounds like a proper cover review would be really valuable.\n\n` +
        "I can book you a free 15-minute call with Kiru, a licensed Liberty adviser. Pick a time: 📅"
      );
    case "RESULT_WARM":
      return (
        `Thanks for sharing that${name}! ` +
        "A Liberty adviser will be in touch to discuss your options."
      );
    case "RESULT_COLD":
      return (
        `Thanks for your interest${name}! ` +
        "We'll send you some helpful information. Reply here anytime to speak to an adviser."
      );
    case "CONSENT_DECLINED":
      return "No problem at all. If you change your mind, message us anytime. Have a great day! 👋";
    case "HUMAN_TAKEOVER":
      return "No problem — I'll have Kiru reach out to you shortly.";
    default:
      return "";
  }
}

export function getCasualNudgeMessage(state: BotState): string {
  const question = getMessageForState(state);
  return `Hey there! 👋 Just to keep things moving — ${question}`;
}

export function getRetryMessage(state: BotState): string {
  switch (state) {
    case "CONSENT":
      return "Just to confirm — would you like to continue?\n1️⃣ Yes, I agree\n2️⃣ No thanks";
    case "Q1_NAME":
      return "I just need your first name to get started. 😊";
    case "Q4B_DEPENDANTS":
      return "Just a simple yes or no — do you have any dependants?";
    default:
      return "Sorry, I didn't catch that. Could you try again with one of the numbered options?";
  }
}
