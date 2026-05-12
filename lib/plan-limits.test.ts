import { describe, expect, it } from "vitest";

import {
  PLAN_DB_INT_MAX,
  canGuestUpload,
  getPlanLimits,
  getRetentionDeletionEndMs,
  type PlanId,
} from "./plan-limits";

describe("getPlanLimits", () => {
  const cases: Array<{ planId: PlanId; expected: ReturnType<typeof getPlanLimits> }> = [
    {
      planId: "free",
      expected: {
        guests: 5,
        photos: 20,
        videos: 0,
        uploadDaysAfterEvent: 3,
        retentionDaysAfterEvent: 7,
      },
    },
    {
      planId: "standard",
      expected: {
        guests: 30,
        photos: 150,
        videos: 10,
        uploadDaysAfterEvent: 7,
        retentionDaysAfterEvent: 30,
      },
    },
    {
      planId: "plus",
      expected: {
        guests: 100,
        photos: 500,
        videos: 50,
        uploadDaysAfterEvent: 14,
        retentionDaysAfterEvent: 90,
      },
    },
    {
      planId: "premium",
      expected: {
        guests: 250,
        photos: 2000,
        videos: 200,
        uploadDaysAfterEvent: 30,
        retentionDaysAfterEvent: 180,
      },
    },
    {
      planId: "max",
      expected: {
        guests: PLAN_DB_INT_MAX,
        photos: PLAN_DB_INT_MAX,
        videos: PLAN_DB_INT_MAX,
        uploadDaysAfterEvent: 60,
        retentionDaysAfterEvent: 365,
      },
    },
  ];

  it.each(cases)("returns limits for $planId", ({ planId, expected }) => {
    expect(getPlanLimits(planId)).toEqual(expected);
  });

  it("returns original values after caller mutates returned object", () => {
    const freePlanLimits = { ...getPlanLimits("free") };

    freePlanLimits.guests = 999;
    freePlanLimits.photos = 999;
    freePlanLimits.videos = 999;
    freePlanLimits.uploadDaysAfterEvent = 999;
    freePlanLimits.retentionDaysAfterEvent = 999;

    expect(getPlanLimits("free")).toEqual({
      guests: 5,
      photos: 20,
      videos: 0,
      uploadDaysAfterEvent: 3,
      retentionDaysAfterEvent: 7,
    });
  });
});

describe("getRetentionDeletionEndMs", () => {
  it("adds plan retention days to event instant", () => {
    const ms = getRetentionDeletionEndMs({ planId: "free", eventDate: "2026-01-01T00:00:00.000Z" });
    expect(ms).toBe(new Date("2026-01-08T00:00:00.000Z").getTime());
  });

  it("uses 365 days for max", () => {
    const ms = getRetentionDeletionEndMs({ planId: "max", eventDate: "2026-06-01T12:00:00.000Z" });
    expect(ms).toBe(new Date("2027-06-01T12:00:00.000Z").getTime());
  });
});

describe("canGuestUpload", () => {
  it("allows upload until the plan upload window expires", () => {
    expect(
      canGuestUpload({
        planId: "free",
        eventDate: "2026-01-01T00:00:00.000Z",
        now: "2026-01-04T00:00:00.000Z",
      }),
    ).toBe(true);
  });

  it("rejects upload after the plan upload window expires", () => {
    expect(
      canGuestUpload({
        planId: "free",
        eventDate: "2026-01-01T00:00:00.000Z",
        now: "2026-01-04T00:00:00.001Z",
      }),
    ).toBe(false);
  });

  it("rejects upload before event date", () => {
    expect(
      canGuestUpload({
        planId: "free",
        eventDate: "2026-01-01T00:00:00.000Z",
        now: "2025-12-31T23:59:59.999Z",
      }),
    ).toBe(false);
  });

  it("rejects invalid date inputs", () => {
    expect(
      canGuestUpload({
        planId: "premium",
        eventDate: "not-a-date",
        now: "2026-01-01T00:00:00.000Z",
      }),
    ).toBe(false);
  });
});
