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
      content: [{ type: "text", text: "Hi Priya, here's a quick tip about income protection..." }],
    } as never);

    const ctx: NurtureContext = {
      leadName: "Priya",
      primaryConcern: "DISABILITY",
      tier: "WARM",
      stepPrompt: "Share a helpful tip about income protection",
    };

    const result = await generateNurtureMessage(ctx);
    expect(result).toContain("Priya");
    expect(mockCreate).toHaveBeenCalledWith(
      expect.objectContaining({ model: "claude-haiku-4-5-20251001" })
    );
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
