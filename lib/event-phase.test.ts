import { describe, expect, it } from "vitest";

import { daysUntilEvent, getEventPhase } from "./event-phase";

describe("getEventPhase", () => {
  const at = (iso: string) => new Date(iso);

  it("is before until the event day starts", () => {
    expect(getEventPhase("2026-06-14", at("2026-06-13T23:59:00Z"))).toBe("before");
  });

  it("is during on the event day and the day after", () => {
    expect(getEventPhase("2026-06-14", at("2026-06-14T00:00:00Z"))).toBe("during");
    expect(getEventPhase("2026-06-14T18:00:00Z", at("2026-06-15T10:00:00Z"))).toBe("during");
  });

  it("is after from the second day on", () => {
    expect(getEventPhase("2026-06-14", at("2026-06-16T00:00:00Z"))).toBe("after");
  });

  it("treats missing or bad dates as before", () => {
    expect(getEventPhase(null)).toBe("before");
    expect(getEventPhase("not a date")).toBe("before");
  });
});

describe("daysUntilEvent", () => {
  it("counts whole days", () => {
    expect(daysUntilEvent("2026-06-14", new Date("2026-05-27T22:00:00Z"))).toBe(18);
    expect(daysUntilEvent("2026-06-14", new Date("2026-06-14T09:00:00Z"))).toBe(0);
    expect(daysUntilEvent("2026-06-14", new Date("2026-06-20T09:00:00Z"))).toBe(-6);
  });
});
