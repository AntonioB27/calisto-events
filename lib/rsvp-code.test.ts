import { describe, expect, it } from "vitest";

import { generateRsvpCode, isRsvpCodeValid, normalizeRsvpCode } from "./rsvp-code";

describe("generateRsvpCode", () => {
  it("generates an 8-character uppercase code from the unambiguous alphabet", () => {
    const code = generateRsvpCode();
    expect(code).toHaveLength(8);
    expect(isRsvpCodeValid(code)).toBe(true);
    expect(code).not.toMatch(/[0O1I]/);
  });

  it("generates different codes across calls", () => {
    const codes = new Set(Array.from({ length: 50 }, () => generateRsvpCode()));
    expect(codes.size).toBeGreaterThan(1);
  });
});

describe("normalizeRsvpCode", () => {
  it("trims and uppercases", () => {
    expect(normalizeRsvpCode("  abcd1234 ")).toBe("ABCD1234");
  });
});

describe("isRsvpCodeValid", () => {
  it("accepts a valid generated code regardless of case", () => {
    const code = generateRsvpCode();
    expect(isRsvpCodeValid(code.toLowerCase())).toBe(true);
  });

  it("rejects wrong length", () => {
    expect(isRsvpCodeValid("ABC")).toBe(false);
  });

  it("rejects disallowed characters", () => {
    expect(isRsvpCodeValid("ABCD01IO")).toBe(false);
  });
});
