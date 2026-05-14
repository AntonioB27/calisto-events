import { describe, expect, it } from "vitest";

import {
  guessTimeTokenFromExtraLine,
  isExtraLineSameAsFormattedDate,
  weddingInviteDateParts,
} from "./wedding-invite-date-parts";
import { formatEventDateForPrintField } from "./print-field-defaults";

describe("weddingInviteDateParts", () => {
  it("returns calendar parts", () => {
    const p = weddingInviteDateParts("2026-08-16T12:00:00.000Z", "en");
    expect(p).not.toBeNull();
    expect(p!.month).toMatch(/AUGUST/);
    expect(p!.day).toBeTruthy();
    expect(p!.year).toContain("2026");
  });

  it("returns null for invalid iso", () => {
    expect(weddingInviteDateParts("not-a-date", "en")).toBeNull();
  });
});

describe("guessTimeTokenFromExtraLine", () => {
  it("parses common time phrases", () => {
    expect(guessTimeTokenFromExtraLine("at 2pm")).toBeTruthy();
    expect(guessTimeTokenFromExtraLine("AT 2 PM")).toMatch(/2/);
    expect(guessTimeTokenFromExtraLine("3:30 PM")).toMatch(/3:30/);
  });

  it("returns null when no time", () => {
    expect(guessTimeTokenFromExtraLine("")).toBeNull();
    expect(guessTimeTokenFromExtraLine("City Hall only")).toBeNull();
  });
});

describe("isExtraLineSameAsFormattedDate", () => {
  it("detects default formatted date line", () => {
    const iso = "2026-06-15T12:00:00.000Z";
    const formatted = formatEventDateForPrintField(iso, "en");
    expect(isExtraLineSameAsFormattedDate(formatted, iso, "en")).toBe(true);
    expect(isExtraLineSameAsFormattedDate("2 PM", iso, "en")).toBe(false);
  });
});
