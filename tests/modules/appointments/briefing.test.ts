import { describe, it, expect } from "vitest";
import { generateBriefing, BriefingInput } from "@/modules/appointments/briefing";

describe("generateBriefing", () => {
  it("generates a structured briefing from lead data", () => {
    const input: BriefingInput = {
      firstName: "Priya",
      lastName: "Sharma",
      phone: "27821234567",
      ageRange: "AGE_28_35",
      employmentType: "EMPLOYED",
      maritalStatus: "MARRIED",
      hasDependants: true,
      hasExistingCover: "NO",
      primaryConcern: "DISABILITY",
      isHomeowner: true,
      score: 85,
      tier: "HOT",
    };
    const result = generateBriefing(input);
    expect(result.productInterest).toContain("Disability");
    expect(result.incomeIndicators).toContain("Employed");
    expect(result.needsSummary).toBeTruthy();
    expect(result.urgencyLevel).toBe("high");
    expect(result.recommendedNextStep).toBeTruthy();
  });

  it("sets lower urgency for cold leads", () => {
    const input: BriefingInput = {
      firstName: "Test",
      phone: "27820000000",
      ageRange: "OVER_50",
      employmentType: "EMPLOYED",
      hasExistingCover: "YES",
      primaryConcern: "INVESTMENT",
      score: 10,
      tier: "COLD",
    };
    const result = generateBriefing(input);
    expect(result.urgencyLevel).toBe("low");
  });
});
