---
date: 2026-05-09
topic: leave-event-delete-event
---

# Guest leave + organizer delete event

## Summary

Add two explicit lifecycle actions: (1) a signed-in participant who is **not** the primary organizer may **leave** the event on their own, ending their membership; (2) the **primary organizer** may **delete the entire event**, which removes memberships, gallery records, and stored media for that event. Policy is enforced server-side (database RPC / RLS), aligned with existing patterns such as `remove_event_member`.

## Problem Frame

Guests and co-organizers are currently stuck in memberships unless the primary organizer removes them. That creates avoidable friction and support burden (“get me off this album”). Primaries have no productized way to retire an event—they only manage members and delete individual uploads. Dedicated **leave** and **delete event** flows make ownership and consent explicit without inventing informal workarounds.

## Actors

- **A1. Primary organizer** — `events.organizer_id`; owns billing/Settings and is the only role that may delete the whole event (per this proposal).
- **A2. Co-organizer** — Same event admin tabs as today except organizer-only tabs; may leave the event but does **not** delete the event.
- **A3. Guest (member)** — Joined via code; may leave the event; cannot delete the event.

## Key Flows

- **F1. Guest or co-organizer leaves**
  - **Trigger:** User opens the appropriate surface (guest join/event experience or event admin shell) and chooses **Leave event** (exact placement TBD in planning).
  - **Actors:** A2 or A3
  - **Steps:** Confirm destructive-to-membership intent → invoke server-validated leave action for `(event_id, self)` → revoke membership → redirect or refresh so the event no longer appears in “my memberships” contexts.
  - **Outcome:** No `event_memberships` row for that user and event; user loses access to guest upload (if applicable) and admin/guest views.
  - **Covered by:** R1–R3, R7

- **F2. Primary organizer deletes event**
  - **Trigger:** Primary opens Settings (or a dedicated danger zone) and runs **Delete event**.
  - **Actors:** A1
  - **Steps:** Strong confirmation (e.g. type event name or `DELETE`) → server validates primary → delete or archive event data per R4–R6 → redirect to dashboard with success/failure feedback.
  - **Outcome:** Event and associated data are removed per policy; all members lose access.
  - **Covered by:** R4–R6, R8

## Requirements

**Guest / co-organizer leave**

- R1. Any authenticated user with an `event_memberships` row for an event may remove **their own** membership, **unless** they are the primary organizer for that event.
- R2. Leaving is not available to users who are not members (clear, non-leaky error or no action).
- R3. After a successful leave, the user must not retain access to that event’s guest or admin experiences (consistent with “not a member”).

**Primary organizer delete event**

- R4. Only the primary organizer may delete the event record (or trigger an equivalent irreversible teardown).
- R5. Deleting an event removes all memberships for that event and prevents new joins with the old access code (code must not resolve to a live event afterward).
- R6. Deleting an event removes associated gallery data: `media_items` (or equivalent) and **objects in storage** for that event’s uploads, so orphans are not left in the bucket.

**UX & safety**

- R7. Both actions require an explicit confirmation step; copy must state that **past uploads remain** in the gallery with the same attribution after leave (membership-only change), matching organizer-driven removal semantics.
- R8. Organizer delete confirmation must be stronger than leave (danger pattern, deliberate friction).
- R9. Co-organizers and guests see **Leave event** where it fits their shell; primaries see **Delete event** only in organizer-only surfaces (e.g. Settings).

## Acceptance Examples

- **AE1.** Covers R1, R3 — Guest member clicks Leave, confirms → membership row gone → revisit join URL behaves as non-member (e.g. can re-join with code if policy allows).
- **AE2.** Covers R1 — Primary organizer does **not** see “Leave event” as the only lifecycle action for ownership; deleting or transferring is out of scope unless added later (see Scope boundaries).
- **AE3.** Covers R4–R6 — Primary deletes event → event id no longer loads for any former member → storage listings for that event’s prefix are gone (verified at integration level).

## Success Criteria

- No member depends on organizer removal to exit an event they joined voluntarily.
- Primary organizer can fully retire an event without manual DB/storage cleanup.
- Unauthorized users cannot delete events or strip others’ memberships via spoofed calls (enforced server-side).

## Scope boundaries

**In scope**

- Self-service leave for non-primary members.
- Hard delete event by primary organizer with cascade teardown of media + storage as specified.

**Deferred for later**

- **Transfer primary ownership** to another member.
- Soft-delete / recycle-bin / undo window for organizer delete.
- Bulk export (“download entire gallery”) before delete.
- Admin/moderator tools or email-based deletion.

**Outside this product’s identity (for this brief)**

- Changing plan-tier marketing copy about automatic deletion (`lib/i18n.ts`) to match real retention policy (separate content task).

## Key decisions

- **D1.** **Leave** affects **membership only**; the user’s past uploads **remain** in the gallery with the same attribution (confirmed 2026-05-09).
- **D2.** **Delete event** is **primary-only**; co-organizers keep current powers but do not gain event deletion.
- **D3.** Enforcement lives in the **database layer** (RPC or equivalent), not only in the UI, mirroring `remove_event_member` / existing security model.

## Dependencies / assumptions

- Supabase (or backend) can run a privileged function to delete storage objects by path prefix or per-row paths and to delete related rows in a transaction where possible.
- Existing RPC `remove_event_member` may be extended or a new `leave_event` / `delete_event` RPC added—planning phase picks the smallest safe change set.

## Outstanding Questions

1. **Re-join:** After leave, can the same user join again with the same access code? (Default assumption: **yes**, same as never having been a member.)
2. **Co-organizer delete:** Should co-organizers ever be allowed to delete the event (e.g. “both primary and co”)? This brief assumes **no**.

---

*Brainstorm output — confirm or adjust Key decisions and Outstanding Questions before implementation planning (`ce-plan`).*
