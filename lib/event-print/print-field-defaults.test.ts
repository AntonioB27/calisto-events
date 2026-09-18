import { describe, expect, it } from "vitest";

import { defaultFieldValuesForTemplate, guessPartnerNamesFromEventTitle } from "./print-field-defaults";

describe("guessPartnerNamesFromEventTitle", () => {
  it("splits on ampersand", () => {
    expect(guessPartnerNamesFromEventTitle("Alex & Sam")).toEqual({ partnerA: "Alex", partnerB: "Sam" });
  });

  it("returns whole string as A when no separator", () => {
    expect(guessPartnerNamesFromEventTitle("Company offsite")).toEqual({
      partnerA: "Company offsite",
      partnerB: "",
    });
  });
});

describe("defaultFieldValuesForTemplate", () => {
  it("leaves the second name empty when the title has no second name", () => {
    const v = defaultFieldValuesForTemplate("wedding-invite-blue-floral", "Solo name", "2026-06-01", "en");
    expect(v.partner_a).toBe("Solo name");
    expect(v.partner_b).toBe("");
  });
});
