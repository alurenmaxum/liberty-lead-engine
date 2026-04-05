import { describe, it, expect, vi, beforeEach } from "vitest";
import { checkMessage } from "@/modules/compliance/filter";

vi.mock("@/modules/compliance/keyword-filter", () => ({
  checkKeywords: vi.fn(),
}));
vi.mock("@/modules/compliance/ai-checker", () => ({
  checkTone: vi.fn(),
}));
vi.mock("@/lib/db", () => ({
  db: {
    complianceLog: { create: vi.fn() },
  },
}));

import { checkKeywords } from "@/modules/compliance/keyword-filter";
import { checkTone } from "@/modules/compliance/ai-checker";
const mockKeywords = vi.mocked(checkKeywords);
const mockTone = vi.mocked(checkTone);

describe("checkMessage", () => {
  beforeEach(() => {
    mockKeywords.mockReset();
    mockTone.mockReset();
  });

  it("blocks immediately if keyword filter blocks", async () => {
    mockKeywords.mockReturnValue({ result: "block", reason: "guaranteed returns" });

    const result = await checkMessage("msg-1", "Guaranteed returns!", {});
    expect(result.result).toBe("block");
    expect(mockTone).not.toHaveBeenCalled();
  });

  it("runs AI check if keyword filter passes", async () => {
    mockKeywords.mockReturnValue({ result: "pass" });
    mockTone.mockResolvedValue({ result: "pass" });

    const result = await checkMessage("msg-1", "Speak to an adviser.", {});
    expect(result.result).toBe("pass");
    expect(mockTone).toHaveBeenCalled();
  });

  it("returns worst result between keyword flag and AI pass", async () => {
    mockKeywords.mockReturnValue({ result: "flag", reason: "borderline" });
    mockTone.mockResolvedValue({ result: "pass" });

    const result = await checkMessage("msg-1", "Some message.", {});
    expect(result.result).toBe("flag");
  });

  it("returns AI block even if keywords pass", async () => {
    mockKeywords.mockReturnValue({ result: "pass" });
    mockTone.mockResolvedValue({ result: "block", reason: "gives advice" });

    const result = await checkMessage("msg-1", "You should buy this.", {});
    expect(result.result).toBe("block");
  });
});
