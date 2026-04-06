import { describe, it, expect } from "vitest";
import {
  getNurtureStage,
  buildNurtureMessage,
  buildSegmentedNurtureMessage,
  NurtureLeadContext,
} from "@/modules/nurture/engine";

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

  it("variant 0 and variant 1 differ for same concern", () => {
    const v0 = buildNurtureMessage("Sam", "WARM", "DISABILITY", 0);
    const v1 = buildNurtureMessage("Sam", "WARM", "DISABILITY", 1);
    expect(v0).not.toBe(v1);
  });

  it("WARM message contains booking CTA", () => {
    const msg = buildNurtureMessage("Sam", "WARM", "LIFE_COVER");
    expect(msg.toLowerCase()).toMatch(/book|call|reply/);
  });

  it("COLD message does not push hard booking CTA", () => {
    const msg = buildNurtureMessage("Sam", "COLD", "LIFE_COVER");
    expect(msg.toLowerCase()).not.toContain("book a");
  });
});

describe("buildSegmentedNurtureMessage", () => {
  it("includes segment line for self-employed lead", () => {
    const ctx: NurtureLeadContext = {
      firstName: "Thabo",
      tier: "WARM",
      primaryConcern: "DISABILITY",
      employmentType: "SELF_EMPLOYED",
    };
    const msg = buildSegmentedNurtureMessage(ctx);
    expect(msg).toContain("Thabo");
    expect(msg.toLowerCase()).toMatch(/self-employed|own income|income/);
  });

  it("includes dependants segment line when hasDependants is true", () => {
    const ctx: NurtureLeadContext = {
      firstName: "Lerato",
      tier: "WARM",
      primaryConcern: "LIFE_COVER",
      hasDependants: true,
    };
    const msg = buildSegmentedNurtureMessage(ctx);
    expect(msg.toLowerCase()).toMatch(/depend/);
  });

  it("includes no-cover segment line when hasExistingCover is NO", () => {
    const ctx: NurtureLeadContext = {
      firstName: "Sam",
      tier: "COLD",
      primaryConcern: "NOT_SURE",
      hasExistingCover: "NO",
    };
    const msg = buildSegmentedNurtureMessage(ctx);
    expect(msg.toLowerCase()).toMatch(/cover/);
  });

  it("produces different variants", () => {
    const ctx: NurtureLeadContext = { firstName: "Sam", tier: "WARM", primaryConcern: "RETIREMENT" };
    const v0 = buildSegmentedNurtureMessage(ctx, 0);
    const v1 = buildSegmentedNurtureMessage(ctx, 1);
    expect(v0).not.toBe(v1);
  });
});
