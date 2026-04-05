import { describe, it, expect } from "vitest";
import { checkKeywords, KeywordResult } from "@/modules/compliance/keyword-filter";

describe("checkKeywords", () => {
  it("passes clean messages", () => {
    const result = checkKeywords("Thanks for your interest in a cover review.");
    expect(result.result).toBe("pass");
  });

  it("blocks messages with guaranteed returns language", () => {
    const result = checkKeywords("We can guarantee you a 15% return on your investment.");
    expect(result.result).toBe("block");
    expect(result.reason).toContain("guarantee");
  });

  it("blocks messages with best investment claims", () => {
    const result = checkKeywords("This is the best investment in South Africa.");
    expect(result.result).toBe("block");
  });

  it("flags messages with specific product recommendations", () => {
    const result = checkKeywords("You should definitely get the Liberty Lifestyle Protector plan.");
    expect(result.result).toBe("flag");
    expect(result.reason).toContain("product recommendation");
  });

  it("flags messages with return/fee claims", () => {
    const result = checkKeywords("You can expect around 12% growth per year.");
    expect(result.result).toBe("flag");
  });

  it("is case-insensitive", () => {
    const result = checkKeywords("GUARANTEED RETURNS for everyone!");
    expect(result.result).toBe("block");
  });

  it("blocks messages with aggressive urgency", () => {
    const result = checkKeywords("Act now or you'll regret it forever!");
    expect(result.result).toBe("block");
  });
});
