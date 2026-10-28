import { describe, expect, it } from "vitest";

import { plural } from "./plural";

const memories = { one: "{count} uspomena", few: "{count} uspomene", other: "{count} uspomena" };

describe("plural", () => {
  it("uses the Croatian one / few / other forms", () => {
    expect(plural("hr", 1, memories)).toBe("1 uspomena");
    expect(plural("hr", 3, memories)).toBe("3 uspomene");
    expect(plural("hr", 5, memories)).toBe("5 uspomena");
    expect(plural("hr", 22, memories)).toBe("22 uspomene");
    expect(plural("hr", 1204, memories)).toBe("1.204 uspomene");
  });

  it("falls back to other for English counts above one", () => {
    expect(plural("en", 1, { one: "{count} memory", few: "x", other: "{count} memories" })).toBe("1 memory");
    expect(plural("en", 2, { one: "{count} memory", few: "x", other: "{count} memories" })).toBe("2 memories");
  });
});
