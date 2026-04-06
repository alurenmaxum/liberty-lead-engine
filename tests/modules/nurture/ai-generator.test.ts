import { describe, it, expect, vi, beforeEach } from "vitest";
import { generateNurtureMessage, NurtureContext } from "@/modules/nurture/ai-generator";

vi.mock("@/lib/ai/client", () => ({
  ai: {
    messages: {
      create: vi.fn(),
    },
  },
}));

import { ai } from "@/lib/ai/client";
const mockCreate = vi.mocked(ai.messages.create);

describe("generateNurtureMessage", () => {
  beforeEach(() => mockCreate.mockReset());

  it("generates a message using lead context", async () => {
    mockCreate.mockResolvedValueOnce({
      content: [{ type: "text", text: "Priya, losing your income for even 3 months can be devastating. Reply to chat with Kiru." }],
    } as never);

    const ctx: NurtureContext = {
      leadName: "Priya",
      primaryConcern: "DISABILITY",
      tier: "WARM",
      stepPrompt: "Risk-led nudge about income protection",
    };

    const result = await generateNurtureMessage(ctx);
    expect(result).toContain("Priya");
    expect(mockCreate).toHaveBeenCalledWith(
      expect.objectContaining({ model: "claude-3-5-haiku-20241022" })
    );
  });

  it("passes segmentation signals to the AI call", async () => {
    mockCreate.mockResolvedValueOnce({
      content: [{ type: "text", text: "As a business owner, your income is everything." }],
    } as never);

    const ctx: NurtureContext = {
      leadName: "Thabo",
      primaryConcern: "DISABILITY",
      tier: "WARM",
      stepPrompt: "Segment-aware nudge",
      employmentType: "BUSINESS_OWNER",
      hasDependants: true,
    };

    await generateNurtureMessage(ctx);

    const callArg = mockCreate.mock.calls[0][0] as { messages: { content: string }[] };
    expect(callArg.messages[0].content).toContain("business owner");
    expect(callArg.messages[0].content).toContain("dependants");
  });

  it("passes variant index to the AI call", async () => {
    mockCreate.mockResolvedValueOnce({
      content: [{ type: "text", text: "Fresh angle message." }],
    } as never);

    const ctx: NurtureContext = {
      leadName: "Sam",
      primaryConcern: "LIFE_COVER",
      tier: "WARM",
      stepPrompt: "Variant nudge",
      variantIndex: 1,
    };

    await generateNurtureMessage(ctx);

    const callArg = mockCreate.mock.calls[0][0] as { messages: { content: string }[] };
    expect(callArg.messages[0].content).toContain("variant");
  });

  it("returns null on API error", async () => {
    mockCreate.mockRejectedValueOnce(new Error("API down"));

    const result = await generateNurtureMessage({
      leadName: "Test",
      primaryConcern: "LIFE_COVER",
      tier: "WARM",
      stepPrompt: "tip",
    });
    expect(result).toBeNull();
  });
});
