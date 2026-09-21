# Context

Glossary of domain terms for calisto-events. This file documents vocabulary only — no implementation details.

## RSVP

A guest party's response to an event invitation, submitted through the event's RSVP link. An RSVP is either:
- **Confirmed**: the party is attending, with a list of attendee full names, each marked adult or child.
- **Declined**: the party is not attending, identified only by a submitter/party name.

An RSVP submission may optionally include contact info (phone or email) for the submitting party.

RSVP is distinct from **Invite** (see below) and from **Guest** (see below) — it does not require an account and is not the same record as event membership.

## Invite / Invitation

A printable invitation *design* (a themed visual template, e.g. a wedding invitation PDF/HTML layout) that an organizer customizes and prints or shares as an image. This term refers only to the visual artifact — it has no relationship to RSVP or attendance tracking.

## Guest

A person who has joined an event via the event's `access_code` (an `event_memberships` row with role `guest`), giving them account-free access to view and upload photos/videos in the event's media gallery. Being a Guest is unrelated to submitting an RSVP — a person can do either, both, or neither.

## RSVP link

A per-event, RSVP-specific shareable link, independent of the event's `access_code` used for guest media-gallery access. Opening it requires no account. It always accepts new or edited submissions unless the organizer manually closes it.

## Duplicate RSVP

A newly submitted RSVP that appears to belong to the same party as an existing submission (matched by contact info first, then by name similarity as a fallback). Duplicates are never auto-merged — they are flagged for the organizer to review, merge, or dismiss from the RSVP dashboard tab.
