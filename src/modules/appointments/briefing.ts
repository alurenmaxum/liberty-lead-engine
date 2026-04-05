export interface BriefingInput {
  firstName?: string | null;
  lastName?: string | null;
  phone: string;
  ageRange?: string | null;
  employmentType?: string | null;
  maritalStatus?: string | null;
  hasDependants?: boolean | null;
  hasExistingCover?: string | null;
  primaryConcern?: string | null;
  isHomeowner?: boolean | null;
  score: number;
  tier: string;
}

export interface AdvisorBriefing {
  productInterest: string;
  incomeIndicators: string;
  needsSummary: string;
  urgencyLevel: "high" | "medium" | "low";
  recommendedNextStep: string;
}

const CONCERN_LABELS: Record<string, string> = {
  LIFE_COVER: "Life cover",
  DISABILITY: "Disability / income protection",
  RETIREMENT: "Retirement planning",
  INVESTMENT: "Investment advice",
  NOT_SURE: "Unsure — needs discovery",
};

const EMPLOYMENT_LABELS: Record<string, string> = {
  EMPLOYED: "Employed (salaried)",
  SELF_EMPLOYED: "Self-employed",
  BUSINESS_OWNER: "Business owner",
};

const AGE_LABELS: Record<string, string> = {
  UNDER_28: "Under 28",
  AGE_28_35: "28–35",
  AGE_36_42: "36–42",
  AGE_43_50: "43–50",
  OVER_50: "Over 50",
};

export function generateBriefing(input: BriefingInput): AdvisorBriefing {
  const productInterest = CONCERN_LABELS[input.primaryConcern ?? ""] ?? "Not specified";
  const employmentLabel = EMPLOYMENT_LABELS[input.employmentType ?? ""] ?? "Unknown";
  const ageLabel = AGE_LABELS[input.ageRange ?? ""] ?? "Unknown";
  const incomeIndicators = `${employmentLabel}, age ${ageLabel}`;

  const needs: string[] = [];
  if (input.primaryConcern) needs.push(CONCERN_LABELS[input.primaryConcern] ?? input.primaryConcern);
  if (input.hasExistingCover === "NO") needs.push("No existing cover in place");
  if (input.hasExistingCover === "UNSURE") needs.push("Unsure about current cover");
  if (input.hasDependants) needs.push("Has dependants");
  if (input.isHomeowner) needs.push("Homeowner / bond holder");
  if (input.maritalStatus === "MARRIED" || input.maritalStatus === "COHABITING") {
    needs.push("Partner/family financial responsibilities");
  }
  const needsSummary = needs.join(". ") + ".";

  const urgencyLevel = input.tier === "HOT" ? "high" : input.tier === "WARM" ? "medium" : "low";

  const steps: string[] = [];
  if (input.primaryConcern === "LIFE_COVER" || input.primaryConcern === "DISABILITY") {
    steps.push("Full cover gap analysis");
  }
  if (input.hasExistingCover === "NO" || input.hasExistingCover === "UNSURE") {
    steps.push("Review current protection status");
  }
  if (input.primaryConcern === "RETIREMENT") steps.push("Retirement readiness assessment");
  if (input.primaryConcern === "INVESTMENT") steps.push("Investment needs discovery");
  if (steps.length === 0) steps.push("General financial needs discovery");

  return {
    productInterest,
    incomeIndicators,
    needsSummary,
    urgencyLevel,
    recommendedNextStep: steps.join(". ") + ".",
  };
}
