import { describe, expect, it } from "vitest";

import { DEFAULT_EVENT_KIND, normalizeEventKind } from "./event-kind";

describe("normalizeEventKind", () => {
  it("returns generic for empty or unknown", () => {
    expect(normalizeEventKind(undefined)).toBe(DEFAULT_EVENT_KIND);
    expect(normalizeEventKind(null)).toBe(DEFAULT_EVENT_KIND);
    expect(normalizeEventKind("")).toBe(DEFAULT_EVENT_KIND);
    expect(normalizeEventKind("corporate")).toBe(DEFAULT_EVENT_KIND);
  });

  it("accepts known kinds", () => {
    expect(normalizeEventKind("wedding")).toBe("wedding");
    expect(normalizeEventKind("generic")).toBe("generic");
  });
});
