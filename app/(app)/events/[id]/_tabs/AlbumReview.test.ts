import { describe, expect, it } from "vitest";

import { relativeTime } from "./AlbumReview";

describe("relativeTime", () => {
  const now = Date.parse("2026-10-28T12:00:00Z");
  it("picks the largest fitting unit", () => {
    expect(relativeTime("2026-10-28T11:58:00Z", "en", now)).toBe("2 minutes ago");
    expect(relativeTime("2026-10-28T09:00:00Z", "en", now)).toBe("3 hours ago");
    expect(relativeTime("2026-10-27T12:00:00Z", "en", now)).toBe("yesterday");
  });
});
