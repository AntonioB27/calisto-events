# RSVP is anonymous and identified by browser storage, not accounts

Unlike the existing guest media-gallery flow (`app/join/[accessCode]`), which requires an authenticated or anonymous Supabase session before joining, the RSVP flow requires no session at all: a party's identity across visits is tracked purely by a browser-stored reference (cookie/local storage) set after their first submission. We chose this to keep the RSVP link fully frictionless for a WhatsApp-shared use case, at the cost of edit access breaking if the guest switches devices or clears storage — that gap is covered by duplicate detection (contact info, then name similarity) flagging repeat submissions for organizer review rather than silently losing or overwriting data.

## Consequences

- A party who resubmits from a different device/browser will not see their prior entry pre-filled; they'll create a new submission, which the duplicate-detection flow is expected to catch.
- RSVP records are not linked to `event_memberships` or any user account, by design — RSVP and guest media-gallery access are independent, unrelated flows (see `CONTEXT.md`).
