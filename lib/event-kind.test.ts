import { describe, expect, it } from "vitest";

import { parseEventKind, type EventKind } from "./event-kind";

describe("parseEventKind", () => {
  it("returns known kinds", () => {
    const cases: Array<[string, EventKind]> = [
      ["wedding", "wedding"],
      ["birthday", "birthday"],
      ["corporate", "corporate"],
      ["other", "other"],
    ];
    for (const [raw, expected] of cases) {
      expect(parseEventKind(raw)).toBe(expected);
    }
  });

  it("falls back to other for unknown values", () => {
    expect(parseEventKind("nope")).toBe("other");
    expect(parseEventKind(null)).toBe("other");
  });
});
