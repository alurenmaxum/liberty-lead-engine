import { describe, it, expect } from "vitest";
import { parseResponse } from "@/modules/bot/parser";

describe("parseResponse", () => {
  it("parses numbered option '2' to second option id", () => {
    const options = [
      { id: "UNDER_28", label: "Under 28" },
      { id: "AGE_28_35", label: "28–35" },
      { id: "AGE_36_42", label: "36–42" },
    ];
    expect(parseResponse("2", "options", options)).toBe("AGE_28_35");
  });

  it("parses option label text case-insensitively", () => {
    const options = [
      { id: "EMPLOYED", label: "Employed" },
      { id: "SELF_EMPLOYED", label: "Self-employed" },
    ];
    expect(parseResponse("self-employed", "options", options)).toBe("SELF_EMPLOYED");
  });

  it("parses yes/no responses", () => {
    expect(parseResponse("yes", "yes_no")).toBe("true");
    expect(parseResponse("Yeah", "yes_no")).toBe("true");
    expect(parseResponse("no", "yes_no")).toBe("false");
    expect(parseResponse("nah", "yes_no")).toBe("false");
  });

  it("returns free text trimmed", () => {
    expect(parseResponse("  Priya  ", "free_text")).toBe("Priya");
  });

  it("returns null for unrecognized option input", () => {
    const options = [{ id: "A", label: "Alpha" }];
    expect(parseResponse("zebra", "options", options)).toBeNull();
  });

  it("returns null for unrecognized yes/no input", () => {
    expect(parseResponse("maybe", "yes_no")).toBeNull();
  });
});
