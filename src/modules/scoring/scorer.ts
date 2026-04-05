export interface LeadScoringInput {
  hasDependants?: boolean | null;
  isHomeowner?: boolean | null;
  hasExistingCover?: string | null;
  employmentType?: string | null;
  ageRange?: string | null;
  primaryConcern?: string | null;
  responseTimeMinutes?: number | null;
}

export interface ScoreResult {
  score: number;
  tier: "COLD" | "WARM" | "HOT";
}

export function scoreLead(input: LeadScoringInput): ScoreResult {
  let score = 0;

  if (input.hasDependants) score += 20;
  if (input.isHomeowner) score += 15;
  if (input.hasExistingCover === "NO") score += 15;
  if (input.employmentType === "SELF_EMPLOYED" || input.employmentType === "BUSINESS_OWNER") score += 10;
  if (input.ageRange === "AGE_28_35" || input.ageRange === "AGE_36_42") score += 10;
  if (input.primaryConcern === "LIFE_COVER" || input.primaryConcern === "DISABILITY") score += 10;
  if (input.responseTimeMinutes != null && input.responseTimeMinutes <= 60) score += 10;

  const tier = score >= 70 ? "HOT" : score >= 40 ? "WARM" : "COLD";
  return { score, tier };
}
