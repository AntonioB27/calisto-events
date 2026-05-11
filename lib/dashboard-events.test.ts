import { describe, expect, it } from "vitest";

import { mergeDashboardEvents } from "./dashboard-events";

describe("mergeDashboardEvents", () => {
  it("combines organizer and co-organizer lists and excludes duplicate ids", () => {
    const out = mergeDashboardEvents(
      [
        { id: "a", title: "X", event_date: "2026-01-10T00:00:00.000Z", plan: "free", access_code: "A" },
        { id: "b", title: "Y", event_date: "2026-02-01T00:00:00.000Z", plan: "plus", access_code: "B" },
      ],
      [{ id: "b", title: "Y", event_date: "2026-02-01T00:00:00.000Z", plan: "plus", access_code: "B" }],
    );

    expect(out.map((r) => r.id)).toEqual(["b", "a"]);
    expect(out.find((r) => r.id === "a")?.membershipRole).toBe("organizer");
    expect(out.find((r) => r.id === "b")?.membershipRole).toBe("organizer");
  });

  it("adds co-only events sorted by date descending", () => {
    const out = mergeDashboardEvents(
      [{ id: "a", title: "Old", event_date: "2025-06-01T00:00:00.000Z", plan: "free", access_code: "A" }],
      [{ id: "c", title: "NewCo", event_date: "2026-06-01T00:00:00.000Z", plan: "standard", access_code: "C" }],
    );
    expect(out.map((r) => r.membershipRole)).toEqual(["co_organizer", "organizer"]);
    expect(out[0].id).toBe("c");
  });
});
