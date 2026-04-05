import { describe, it, expect } from "vitest";
import { buildBookingMessage } from "@/modules/appointments/booking";

describe("buildBookingMessage", () => {
  it("includes lead name and booking URL", () => {
    const msg = buildBookingMessage("Priya", "https://calendly.com/kiru/15min");
    expect(msg).toContain("Priya");
    expect(msg).toContain("https://calendly.com/kiru/15min");
  });

  it("works without a name", () => {
    const msg = buildBookingMessage(null, "https://calendly.com/kiru/15min");
    expect(msg).toContain("https://calendly.com/kiru/15min");
    expect(msg).not.toContain("null");
  });
});
