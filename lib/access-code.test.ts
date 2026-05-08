import { describe, expect, it } from "vitest";

import { isAccessCodeValid } from "./access-code";

describe("isAccessCodeValid", () => {
  it("accepts lowercase by normalizing to uppercase", () => {
    expect(isAccessCodeValid("wedding2026")).toBe(true);
  });

  it("accepts uppercase alphanumeric values within length bounds", () => {
    expect(isAccessCodeValid("ABC123")).toBe(true);
    expect(isAccessCodeValid("A1234567890123456789")).toBe(true);
  });

  it("rejects values outside required format", () => {
    expect(isAccessCodeValid("abc")).toBe(false);
    expect(isAccessCodeValid("ABC-123")).toBe(false);
    expect(isAccessCodeValid("ABCDE_12345")).toBe(false);
    expect(isAccessCodeValid("A12345678901234567890")).toBe(false);
  });
});
