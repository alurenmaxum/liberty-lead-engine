import { describe, it, expect } from "vitest";
import { scoreLead, LeadScoringInput } from "@/modules/scoring/scorer";

describe("scoreLead", () => {
  it("scores a hot lead correctly", () => {
    const input: LeadScoringInput = {
      hasDependants: true,          // +20
      isHomeowner: true,            // +15
      hasExistingCover: "NO",       // +15
      employmentType: "EMPLOYED",   // +0
      ageRange: "AGE_28_35",        // +10
      primaryConcern: "DISABILITY", // +10
      responseTimeMinutes: 30,      // +10
    };
    const result = scoreLead(input);
    expect(result.score).toBe(80);
    expect(result.tier).toBe("HOT");
  });

  it("scores a warm lead", () => {
    const input: LeadScoringInput = {
      hasDependants: true,           // +20
      isHomeowner: false,            // +0
      hasExistingCover: "YES",       // +0
      employmentType: "EMPLOYED",    // +0
      ageRange: "AGE_28_35",         // +10
      primaryConcern: "RETIREMENT",  // +0
      responseTimeMinutes: 30,       // +10
    };
    const result = scoreLead(input);
    expect(result.score).toBe(40);
    expect(result.tier).toBe("WARM");
  });

  it("scores a cold lead", () => {
    const input: LeadScoringInput = {
      hasDependants: false,
      isHomeowner: false,
      hasExistingCover: "YES",
      employmentType: "EMPLOYED",
      ageRange: "OVER_50",
      primaryConcern: "INVESTMENT",
      responseTimeMinutes: 180,
    };
    const result = scoreLead(input);
    expect(result.score).toBe(0);
    expect(result.tier).toBe("COLD");
  });

  it("gives self-employed bonus", () => {
    const input: LeadScoringInput = {
      hasDependants: false,
      isHomeowner: false,
      hasExistingCover: "YES",
      employmentType: "SELF_EMPLOYED",
      ageRange: "OVER_50",
      primaryConcern: "INVESTMENT",
      responseTimeMinutes: 180,
    };
    expect(scoreLead(input).score).toBe(10);
  });

  it("handles null/undefined fields gracefully", () => {
    const result = scoreLead({});
    expect(result.score).toBe(0);
    expect(result.tier).toBe("COLD");
  });
});
