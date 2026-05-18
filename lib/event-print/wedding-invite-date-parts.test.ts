import { describe, expect, it } from "vitest";

import {
  guessTimeTokenFromExtraLine,
  isExtraLineSameAsFormattedDate,
  weddingInviteDateParts,
  weddingInviteGlitterTimeYearLine,
  weddingInviteWatercolorPipeDateLine,
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

describe("weddingInviteWatercolorPipeDateLine", () => {
  it("formats en date with pipes", () => {
    expect(weddingInviteWatercolorPipeDateLine("2026-05-30T12:00:00.000Z", "en")).toBe(
      "30TH | MAY | 2026",
    );
  });
});

describe("weddingInviteGlitterTimeYearLine", () => {
  it("joins time prose and spelled year for en", () => {
    const iso = "2026-06-23T12:00:00.000Z";
    const line = weddingInviteGlitterTimeYearLine(iso, "en", "at six thirty in the evening");
    expect(line).toContain("at six thirty in the evening");
    expect(line).toContain("two thousand twenty six");
    expect(line).toContain(" / ");
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
