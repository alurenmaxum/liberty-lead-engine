import { describe, it, expect } from "vitest";
import { getNextStepAction, parseDelay, NurtureStep } from "@/modules/nurture/sequence-engine";

describe("getNextStepAction", () => {
  it("returns send_template action for template step", () => {
    const step: NurtureStep = { delay: "2d", type: "template", templateId: "tmpl-123" };
    const action = getNextStepAction(step);
    expect(action.type).toBe("send_template");
    expect(action.templateId).toBe("tmpl-123");
  });

  it("returns ai_generate action for AI step", () => {
    const step: NurtureStep = { delay: "3d", type: "ai", aiPrompt: "Share a tip about income protection" };
    const action = getNextStepAction(step);
    expect(action.type).toBe("ai_generate");
    expect(action.prompt).toBe("Share a tip about income protection");
  });

  it("returns action type for action step", () => {
    const step: NurtureStep = { delay: "7d", type: "action", action: "rescore" };
    const action = getNextStepAction(step);
    expect(action.type).toBe("rescore");
  });
});

describe("parseDelay", () => {
  it("parses days", () => {
    expect(parseDelay("2d")).toBe(2 * 24 * 60 * 60 * 1000);
  });

  it("parses hours", () => {
    expect(parseDelay("12h")).toBe(12 * 60 * 60 * 1000);
  });

  it("parses minutes", () => {
    expect(parseDelay("30m")).toBe(30 * 60 * 1000);
  });

  it("defaults to 1 day for invalid input", () => {
    expect(parseDelay("invalid")).toBe(24 * 60 * 60 * 1000);
  });
});
