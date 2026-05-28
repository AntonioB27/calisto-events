import type { AppUiDict } from "@/lib/app-ui";

import type { InvitationVisibilityKey } from "./invitation-field-visibility";

/** Prints-tab label for each visibility toggle (UI locale strings). */
export function invitationVisibilityToggleLabel(
  tab: AppUiDict["printsTab"],
  key: InvitationVisibilityKey,
): string {
  switch (key) {
    case "together_families":
      return tab.inviteToggleTogetherFamilies;
    case "partner_names":
      return tab.inviteTogglePartnerNames;
    case "invite_preamble":
      return tab.inviteToggleInvitePreamble;
    case "cordially_invite":
      return tab.inviteToggleCordiallyInvite;
    case "wedding_title":
      return tab.inviteToggleWeddingTitle;
    case "event_date":
      return tab.inviteToggleEventDate;
    case "extra_line":
      return tab.inviteToggleExtraLine;
    case "venue":
      return tab.inviteToggleVenue;
    case "venue_line_2":
      return tab.inviteToggleVenueLineTwo;
    case "reception":
      return tab.inviteToggleReception;
    case "gathering":
      return tab.inviteToggleGathering;
    case "church":
      return tab.inviteToggleChurch;
    case "dinner":
      return tab.inviteToggleDinner;
    case "quote":
      return tab.inviteToggleQuote;
    default: {
      const _exhaustive: never = key;
      return _exhaustive;
    }
  }
}
