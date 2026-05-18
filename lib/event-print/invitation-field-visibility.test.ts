import { describe, expect, it } from "vitest";

import {
  defaultVisibilityFieldValues,
  invitationFieldValuesOnly,
  parseInvitationFieldVisibility,
  showInvitationField,
  visibilityStorageKey,
} from "./invitation-field-visibility";

describe("invitation-field-visibility", () => {
  it("defaults all blocks to visible", () => {
    const v = parseInvitationFieldVisibility({});
    expect(showInvitationField(v, "partner_names")).toBe(true);
    expect(showInvitationField(v, "venue")).toBe(true);
  });

  it("parses show_0 as hidden", () => {
    const v = parseInvitationFieldVisibility({
      [visibilityStorageKey("venue")]: "0",
      [visibilityStorageKey("reception")]: "0",
    });
    expect(showInvitationField(v, "venue")).toBe(false);
    expect(showInvitationField(v, "reception")).toBe(false);
    expect(showInvitationField(v, "partner_names")).toBe(true);
  });

  it("strips show_* from value maps", () => {
    const values = invitationFieldValuesOnly({
      partner_a: "A",
      [visibilityStorageKey("venue")]: "0",
    });
    expect(values).toEqual({ partner_a: "A" });
  });

  it("defaultVisibilityFieldValues uses 1", () => {
    expect(defaultVisibilityFieldValues()[visibilityStorageKey("event_date")]).toBe("1");
  });
});
