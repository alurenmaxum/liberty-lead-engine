import { describe, it, expect, vi, beforeEach } from "vitest";
import { checkTone } from "@/modules/compliance/ai-checker";

vi.mock("@/lib/ai/client", () => ({
  ai: {
    messages: {
      create: vi.fn(),
    },
  },
}));

import { ai } from "@/lib/ai/client";
const mockCreate = vi.mocked(ai.messages.create);

describe("checkTone", () => {
  beforeEach(() => {
    mockCreate.mockReset();
  });

  it("returns pass for compliant message", async () => {
    mockCreate.mockResolvedValueOnce({
      content: [{ type: "text", text: JSON.stringify({ result: "pass" }) }],
    } as never);

    const result = await checkTone(
      "Would you like to speak to a licensed adviser about your options?",
      { leadName: "Priya", concern: "disability" }
    );
    expect(result.result).toBe("pass");
  });

  it("returns flag for borderline message", async () => {
    mockCreate.mockResolvedValueOnce({
      content: [
        {
          type: "text",
          text: JSON.stringify({
            result: "flag",
            reason: "Implies specific product recommendation",
          }),
        },
      ],
    } as never);

    const result = await checkTone(
      "You really need income protection - it's the most important cover you can get.",
      { leadName: "Priya", concern: "disability" }
    );
    expect(result.result).toBe("flag");
    expect(result.reason).toBeTruthy();
  });

  it("returns flag on API error (fail-open)", async () => {
    mockCreate.mockRejectedValueOnce(new Error("API down"));

    const result = await checkTone("Hello there!", {});
    expect(result.result).toBe("flag");
    expect(result.reason).toContain("Compliance AI check failed");
  });
});
