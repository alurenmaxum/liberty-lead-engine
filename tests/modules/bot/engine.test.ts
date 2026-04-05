import { describe, it, expect } from "vitest";
import { processInput, BotContext } from "@/modules/bot/engine";

function makeContext(overrides: Partial<BotContext> = {}): BotContext {
  return { currentStep: "CONSENT", retryCount: 0, leadData: {}, ...overrides };
}

describe("Bot Engine — processInput", () => {
  it("advances from CONSENT to Q1_NAME on '1' (yes)", () => {
    const result = processInput(makeContext(), "1");
    expect(result.nextStep).toBe("Q1_NAME");
    expect(result.actions).toContainEqual(
      expect.objectContaining({ type: "send_message" })
    );
  });

  it("goes to CONSENT_DECLINED on '2' (no)", () => {
    const result = processInput(makeContext(), "2");
    expect(result.nextStep).toBe("CONSENT_DECLINED");
  });

  it("captures first name and advances to Q2_AGE", () => {
    const result = processInput(makeContext({ currentStep: "Q1_NAME" }), "Priya");
    expect(result.nextStep).toBe("Q2_AGE");
    expect(result.leadData.firstName).toBe("Priya");
  });

  it("captures age range and advances to Q3", () => {
    const result = processInput(makeContext({ currentStep: "Q2_AGE" }), "2");
    expect(result.nextStep).toBe("Q3_EMPLOYMENT");
    expect(result.leadData.ageRange).toBe("AGE_28_35");
  });

  it("retries on invalid input", () => {
    const result = processInput(makeContext({ currentStep: "Q2_AGE" }), "xyz");
    expect(result.nextStep).toBe("Q2_AGE");
    expect(result.retryCount).toBe(1);
    expect(result.actions).toContainEqual(
      expect.objectContaining({ type: "send_message" })
    );
  });

  it("escalates to human after max retries", () => {
    const result = processInput(makeContext({ currentStep: "Q2_AGE", retryCount: 2 }), "xyz");
    expect(result.nextStep).toBe("HUMAN_TAKEOVER");
  });

  it("advances through full flow to SCORING", () => {
    let ctx = makeContext();
    const inputs = ["1", "Priya", "2", "1", "1", "yes", "2", "2", "4"];
    for (const input of inputs) {
      const result = processInput(ctx, input);
      ctx = {
        currentStep: result.nextStep,
        retryCount: result.retryCount,
        leadData: { ...ctx.leadData, ...result.leadData },
      };
    }
    expect(ctx.currentStep).toBe("SCORING");
    expect(ctx.leadData.firstName).toBe("Priya");
    expect(ctx.leadData.ageRange).toBe("AGE_28_35");
    expect(ctx.leadData.employmentType).toBe("EMPLOYED");
    expect(ctx.leadData.maritalStatus).toBe("MARRIED");
    expect(ctx.leadData.hasDependants).toBe(true);
    expect(ctx.leadData.hasExistingCover).toBe("NO");
    expect(ctx.leadData.primaryConcern).toBe("DISABILITY");
    expect(ctx.leadData.preferredContactTime).toBe("IMMEDIATE");
  });

  // Casual greeting resilience
  it("does NOT increment retryCount when lead sends 'hi' at CONSENT", () => {
    const result = processInput(makeContext({ currentStep: "CONSENT", retryCount: 0 }), "hi");
    expect(result.nextStep).toBe("CONSENT");
    expect(result.retryCount).toBe(0); // retryCount unchanged
    expect(result.actions).toContainEqual(expect.objectContaining({ type: "send_message" }));
  });

  it("does NOT trigger HUMAN_TAKEOVER when lead greets twice then answers at CONSENT", () => {
    // First "hi" — should not burn a retry
    const r1 = processInput(makeContext({ currentStep: "CONSENT", retryCount: 0 }), "hi");
    expect(r1.nextStep).toBe("CONSENT");
    expect(r1.retryCount).toBe(0);

    // Second "hi" — still should not burn a retry
    const r2 = processInput(makeContext({ currentStep: "CONSENT", retryCount: r1.retryCount }), "hello");
    expect(r2.nextStep).toBe("CONSENT");
    expect(r2.retryCount).toBe(0);

    // Now answer "1" — should advance normally
    const r3 = processInput(makeContext({ currentStep: "CONSENT", retryCount: r2.retryCount }), "1");
    expect(r3.nextStep).toBe("Q1_NAME");
  });

  it("does NOT trigger HUMAN_TAKEOVER for casual greeting at Q2_AGE", () => {
    // retryCount already at max-1 (1), a casual greeting should not push it over
    const result = processInput(makeContext({ currentStep: "Q2_AGE", retryCount: 1 }), "hey");
    expect(result.nextStep).toBe("Q2_AGE");
    expect(result.retryCount).toBe(1); // unchanged
  });

  it("accepts 'hi' as a valid free_text name at Q1_NAME", () => {
    // free_text states should still accept any input including greetings
    const result = processInput(makeContext({ currentStep: "Q1_NAME" }), "hi");
    expect(result.nextStep).toBe("Q2_AGE");
    expect(result.leadData.firstName).toBe("hi");
  });
});
