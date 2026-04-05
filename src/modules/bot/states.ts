export type BotState =
  | "CONSENT"
  | "Q1_NAME"
  | "Q2_AGE"
  | "Q3_EMPLOYMENT"
  | "Q4A_MARITAL"
  | "Q4B_DEPENDANTS"
  | "Q5_COVER"
  | "Q6_CONCERN"
  | "Q7_CONTACT_TIME"
  | "SCORING"
  | "RESULT_HOT"
  | "RESULT_WARM"
  | "RESULT_COLD"
  | "CONSENT_DECLINED"
  | "HUMAN_TAKEOVER";

export interface StateDefinition {
  responseType: "free_text" | "options" | "yes_no" | "terminal";
  options?: { id: string; label: string }[];
  maxRetries: number;
}

export const STATES: Record<BotState, StateDefinition> = {
  CONSENT: {
    responseType: "options",
    options: [
      { id: "accepted", label: "Yes, I agree" },
      { id: "declined", label: "No thanks" },
    ],
    maxRetries: 1,
  },
  Q1_NAME: { responseType: "free_text", maxRetries: 2 },
  Q2_AGE: {
    responseType: "options",
    options: [
      { id: "UNDER_28", label: "Under 28" },
      { id: "AGE_28_35", label: "28–35" },
      { id: "AGE_36_42", label: "36–42" },
      { id: "AGE_43_50", label: "43–50" },
      { id: "OVER_50", label: "Over 50" },
    ],
    maxRetries: 2,
  },
  Q3_EMPLOYMENT: {
    responseType: "options",
    options: [
      { id: "EMPLOYED", label: "Employed" },
      { id: "SELF_EMPLOYED", label: "Self-employed" },
      { id: "BUSINESS_OWNER", label: "Business owner" },
    ],
    maxRetries: 2,
  },
  Q4A_MARITAL: {
    responseType: "options",
    options: [
      { id: "MARRIED", label: "Yes" },
      { id: "SINGLE", label: "No" },
    ],
    maxRetries: 2,
  },
  Q4B_DEPENDANTS: { responseType: "yes_no", maxRetries: 2 },
  Q5_COVER: {
    responseType: "options",
    options: [
      { id: "YES", label: "Yes" },
      { id: "NO", label: "No" },
      { id: "UNSURE", label: "Not sure" },
    ],
    maxRetries: 2,
  },
  Q6_CONCERN: {
    responseType: "options",
    options: [
      { id: "LIFE_COVER", label: "Life cover" },
      { id: "DISABILITY", label: "Disability / income protection" },
      { id: "RETIREMENT", label: "Retirement planning" },
      { id: "INVESTMENT", label: "Investment advice" },
      { id: "NOT_SURE", label: "Not sure yet" },
    ],
    maxRetries: 2,
  },
  Q7_CONTACT_TIME: {
    responseType: "options",
    options: [
      { id: "MORNING", label: "Morning" },
      { id: "AFTERNOON", label: "Afternoon" },
      { id: "EVENING", label: "Evening" },
      { id: "IMMEDIATE", label: "Send me a link now" },
    ],
    maxRetries: 2,
  },
  SCORING: { responseType: "terminal", maxRetries: 0 },
  RESULT_HOT: { responseType: "terminal", maxRetries: 0 },
  RESULT_WARM: { responseType: "terminal", maxRetries: 0 },
  RESULT_COLD: { responseType: "terminal", maxRetries: 0 },
  CONSENT_DECLINED: { responseType: "terminal", maxRetries: 0 },
  HUMAN_TAKEOVER: { responseType: "terminal", maxRetries: 0 },
};

const FLOW_ORDER: BotState[] = [
  "CONSENT",
  "Q1_NAME",
  "Q2_AGE",
  "Q3_EMPLOYMENT",
  "Q4A_MARITAL",
  "Q4B_DEPENDANTS",
  "Q5_COVER",
  "Q6_CONCERN",
  "Q7_CONTACT_TIME",
  "SCORING",
];

export function getNextState(current: BotState, response: string): BotState {
  if (current === "CONSENT") {
    return response === "declined" ? "CONSENT_DECLINED" : "Q1_NAME";
  }
  const idx = FLOW_ORDER.indexOf(current);
  if (idx === -1 || idx >= FLOW_ORDER.length - 1) return current;
  return FLOW_ORDER[idx + 1];
}
