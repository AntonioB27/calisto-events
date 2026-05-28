import { describe, expect, it } from "vitest";

import { mergeInvitationDraftWithDefaults } from "./merge-invitation-print-fields";

describe("mergeInvitationDraftWithDefaults", () => {
  it("overlays stored values on defaults", () => {
    const m = mergeInvitationDraftWithDefaults("wedding-invite-blue-floral", "A & B", "2026-06-15", "en", {
      venue: "City Hall",
    });
    expect(m.partner_a).toBe("A");
    expect(m.partner_b).toBe("B");
    expect(m.venue).toBe("City Hall");
    expect(m.extra_line).toBe("");
  });
});
