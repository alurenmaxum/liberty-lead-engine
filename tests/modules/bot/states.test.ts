import { describe, it, expect } from "vitest";
import { STATES, getNextState } from "@/modules/bot/states";

describe("Bot States", () => {
  it("defines all qualification states in order", () => {
    expect(Object.keys(STATES)).toEqual([
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
      "RESULT_HOT",
      "RESULT_WARM",
      "RESULT_COLD",
      "CONSENT_DECLINED",
      "HUMAN_TAKEOVER",
    ]);
  });

  it("advances CONSENT to Q1_NAME on consent given", () => {
    expect(getNextState("CONSENT", "accepted")).toBe("Q1_NAME");
  });

  it("advances CONSENT to CONSENT_DECLINED on decline", () => {
    expect(getNextState("CONSENT", "declined")).toBe("CONSENT_DECLINED");
  });

  it("advances Q7_CONTACT_TIME to SCORING", () => {
    expect(getNextState("Q7_CONTACT_TIME", "any")).toBe("SCORING");
  });
});
