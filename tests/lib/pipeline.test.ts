import { describe, it, expect } from "vitest";
import { scoreLead } from "@/modules/scoring/scorer";
import { generateBriefing } from "@/modules/appointments/briefing";
import { buildNurtureMessage } from "@/modules/nurture/engine";
import { buildBookingMessage } from "@/modules/appointments/booking";

describe("pipeline integration — pure functions", () => {
  it("HOT lead produces booking message and high-urgency briefing", () => {
    const score = scoreLead({
      hasDependants: true,
      hasExistingCover: "NO",
      employmentType: "SELF_EMPLOYED",
      ageRange: "AGE_28_35",
      primaryConcern: "LIFE_COVER",
      responseTimeMinutes: 10,
    });
    expect(score.tier).toBe("HOT");
    expect(score.score).toBeGreaterThanOrEqual(70);

    const briefing = generateBriefing({
      firstName: "Alice",
      lastName: null,
      phone: "+27820000001",
      ageRange: "AGE_28_35",
      employmentType: "SELF_EMPLOYED",
      maritalStatus: "MARRIED",
      hasDependants: true,
      hasExistingCover: "NO",
      primaryConcern: "LIFE_COVER",
      isHomeowner: null,
      score: score.score,
      tier: score.tier,
    });
    expect(briefing.urgencyLevel).toBe("high");
    expect(briefing.productInterest).toBe("Life cover");

    const msg = buildBookingMessage("Alice", "https://calendly.com/test");
    expect(msg).toContain("Alice");
    expect(msg).toContain("https://calendly.com/test");
  });

  it("WARM lead produces nurture message", () => {
    // hasDependants(20) + hasExistingCover NO(15) + AGE_28_35(10) = 45 → WARM
    const score = scoreLead({
      hasDependants: true,
      hasExistingCover: "NO",
      employmentType: "EMPLOYED",
      ageRange: "AGE_28_35",
      primaryConcern: "RETIREMENT",
    });
    expect(score.tier).toBe("WARM");

    const msg = buildNurtureMessage("Bob", "WARM", "RETIREMENT");
    expect(msg).toContain("Bob");
    expect(msg.toLowerCase()).toMatch(/retire|savings/);
  });

  it("COLD lead produces cold nurture message", () => {
    const score = scoreLead({});
    expect(score.tier).toBe("COLD");

    const msg = buildNurtureMessage(null, "COLD", null);
    expect(msg.length).toBeGreaterThan(0);
    expect(msg.toLowerCase()).toMatch(/insur|cover|protect|know/);
  });
});
