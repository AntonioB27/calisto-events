import { describe, expect, it } from "vitest";

import { parseCreateEventQuery, validateCreateEventInput } from "./page";

describe("validateCreateEventInput", () => {
  it("rejects missing event name", () => {
    expect(
      validateCreateEventInput({
        name: "   ",
        date: "2026-06-01",
        planId: "free",
      }),
    ).toEqual({
      ok: false,
      error: "NAME_REQUIRED",
    });
  });

  it("accepts a valid payload", () => {
    expect(
      validateCreateEventInput({
        name: "Spring Gala",
        date: "2026-06-01",
        planId: "premium",
      }),
    ).toEqual({
      ok: true,
      value: {
        name: "Spring Gala",
        date: "2026-06-01",
        planId: "premium",
      },
    });
  });
});

describe("parseCreateEventQuery", () => {
  it("applies defaults when date and plan are missing", () => {
    expect(
      parseCreateEventQuery({
        name: "Launch Party",
      }),
    ).toEqual({
      step: "1",
      name: "Launch Party",
      emoji: "",
      date: "2026-01-01",
      planId: "free",
    });
  });

  it("falls back to free for invalid plan", () => {
    expect(
      parseCreateEventQuery({
        step: "2",
        name: "Launch Party",
        date: "2026-08-20",
        planId: "enterprise",
      }),
    ).toEqual({
      step: "2",
      name: "Launch Party",
      emoji: "",
      date: "2026-08-20",
      planId: "free",
    });
  });
});
