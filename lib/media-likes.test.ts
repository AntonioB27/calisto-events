import { describe, expect, it } from "vitest";

import { canViewLikers, summarizeLikeRows } from "./media-likes";

describe("canViewLikers", () => {
  const base = {
    viewerId: "user_a",
    organizerId: "org_1",
    canManageEvent: false,
    uploadedBy: "user_b",
  };

  it("returns false when viewer is not signed in", () => {
    expect(canViewLikers({ ...base, viewerId: null })).toBe(false);
  });

  it("returns true for primary organizer", () => {
    expect(canViewLikers({ ...base, viewerId: "org_1" })).toBe(true);
  });

  it("returns true for co-organizer manage flag", () => {
    expect(canViewLikers({ ...base, canManageEvent: true })).toBe(true);
  });

  it("returns true for uploader on own photo", () => {
    expect(canViewLikers({ ...base, viewerId: "user_b", uploadedBy: "user_b" })).toBe(true);
  });

  it("returns false for unrelated guest", () => {
    expect(canViewLikers(base)).toBe(false);
  });
});

describe("summarizeLikeRows", () => {
  it("returns empty maps when no likes exist", () => {
    const summary = summarizeLikeRows([], "user_a");
    expect(summary.counts.size).toBe(0);
    expect(summary.likedByMe.size).toBe(0);
  });

  it("counts likes and tracks current user liked set", () => {
    const summary = summarizeLikeRows(
      [
        { media_item_id: "m1", user_id: "user_a" },
        { media_item_id: "m1", user_id: "user_b" },
        { media_item_id: "m2", user_id: "user_c" },
      ],
      "user_a",
    );
    expect(summary.counts.get("m1")).toBe(2);
    expect(summary.counts.get("m2")).toBe(1);
    expect(summary.likedByMe.has("m1")).toBe(true);
    expect(summary.likedByMe.has("m2")).toBe(false);
  });
});
