import { describe, it, expect } from "vitest";
import { getNurtureStage, buildNurtureMessage } from "@/modules/nurture/engine";

describe("getNurtureStage", () => {
  it("returns BOOKING for HOT tier", () => {
    expect(getNurtureStage("HOT")).toBe("BOOKING");
  });

  it("returns NURTURING for WARM tier", () => {
    expect(getNurtureStage("WARM")).toBe("NURTURING");
  });

  it("returns NURTURING for COLD tier", () => {
    expect(getNurtureStage("COLD")).toBe("NURTURING");
  });
});

describe("buildNurtureMessage", () => {
  it("includes first name when provided", () => {
    const msg = buildNurtureMessage("Priya", "WARM");
    expect(msg).toContain("Priya");
  });

  it("works without a name", () => {
    const msg = buildNurtureMessage(null, "COLD");
    expect(msg).not.toContain("null");
    expect(msg.length).toBeGreaterThan(0);
  });

  it("returns a message for WARM tier", () => {
    const msg = buildNurtureMessage("Sam", "WARM");
    expect(msg.length).toBeGreaterThan(0);
  });

  it("returns a message for COLD tier", () => {
    const msg = buildNurtureMessage("Sam", "COLD");
    expect(msg.length).toBeGreaterThan(0);
  });

  it("includes concern context when provided", () => {
    const msg = buildNurtureMessage("Sam", "WARM", "DISABILITY");
    expect(msg).toContain("disability");
  });
});
