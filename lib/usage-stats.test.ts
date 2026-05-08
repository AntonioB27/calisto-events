import { describe, expect, it } from "vitest";

import { getUsageStats } from "./usage-stats";

describe("getUsageStats", () => {
  it("returns remaining capacities from current usage", () => {
    expect(
      getUsageStats({
        planId: "standard",
        photosUsed: 10,
        videosUsed: 2,
        guestsUsed: 3,
      }),
    ).toEqual({
      photosRemaining: 140,
      videosRemaining: 8,
      guestsRemaining: 27,
    });
  });

  it("clamps remaining capacities at zero when usage exceeds limits", () => {
    expect(
      getUsageStats({
        planId: "free",
        photosUsed: 999,
        videosUsed: 999,
        guestsUsed: 999,
      }),
    ).toEqual({
      photosRemaining: 0,
      videosRemaining: 0,
      guestsRemaining: 0,
    });
  });

  it("treats negative usage as zero usage", () => {
    expect(
      getUsageStats({
        planId: "free",
        photosUsed: -1,
        videosUsed: -10,
        guestsUsed: -2,
      }),
    ).toEqual({
      photosRemaining: 20,
      videosRemaining: 0,
      guestsRemaining: 5,
    });
  });

  it("treats non-finite usage as zero usage", () => {
    expect(
      getUsageStats({
        planId: "standard",
        photosUsed: Number.NaN,
        videosUsed: Number.POSITIVE_INFINITY,
        guestsUsed: Number.NEGATIVE_INFINITY,
      }),
    ).toEqual({
      photosRemaining: 150,
      videosRemaining: 10,
      guestsRemaining: 30,
    });
  });
});
