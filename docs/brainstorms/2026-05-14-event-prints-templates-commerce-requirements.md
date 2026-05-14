---
date: 2026-05-14
topic: event-prints-templates-commerce
---

# Event prints: templates, customization, and paid catalog

## Summary

Organizers get a dedicated **Prints** area on the event (likely a new admin tab alongside Overview, Guests, Gallery, Share) where they browse **print products** grouped by **event type** (e.g. Wedding): invitation-style layouts and table materials (e.g. QR tent cards). Each product is a **template** with fixed visual design and a small set of **editable fields** (names, date, time, place). **Purchasing** is per template (or per unlock), with price reflecting template complexity. This doc defines product behavior and scope; implementation (rendering stack, Stripe shapes, persistence) is for `/ce-plan`.

---

## Problem Frame

Organizers already promote and run events in the app, but polished physical collateral usually means exporting to Canva, Word, or a print shop — extra tools and inconsistent branding. A first-party prints flow keeps organizers inside Calisto, matches event data where possible, and creates a clear monetization surface. Today the repo already exposes a **print route** with **two** table-poster templates and paper size options (`app/(app)/events/[id]/print/`, `lib/event-print/print-options.ts`); the pain is that this is narrow (table posters only), not type-aware, not paid, and not integrated as a first-class **tab** next to other organizer workflows.

---

## Assumptions

*This brainstorm was captured in one pass without synchronous confirmation of every gap. Items below are bets for planning to validate.*

- Event **type** (e.g. Wedding) is or will be a first-class attribute organizers set (today onboarding stores a kind in local storage only — product may need an `event_type` or similar on the event record).
- **Primary organizer** is the buyer; co-organizers if added later are out of scope unless planning extends this.
- **English-first** copy for template names and checkout; localization follows existing app patterns.
- Physical fulfillment (mailing prints) is **not** in v1 — deliverable is **digital** (PDF or high-quality print-ready file the user takes to a printer).

---

## Actors

- A1. **Primary organizer**: Creates the event, opens Prints, picks event type (or inherits it), browses templates, edits allowed fields, pays, downloads or re-opens purchased templates.
- A2. **Guest / invitee**: Out of scope for v1 template editing; may appear as *content* on prints (names) but does not use this feature.
- A3. **Platform (Calisto)**: Hosts catalog, enforces access after purchase, processes payments, serves files.

---

## Key Flows

- F1. **Discover templates**
  - **Trigger:** Organizer opens Prints tab for an event.
  - **Actors:** A1, A3
  - **Steps:** Load event context (type, date, title, venue if stored). Show categories (e.g. Invitations, Table & QR). List templates available for the event type; show locked vs owned state and price.
  - **Outcome:** Organizer sees what they can buy and what they already own.
  - **Covered by:** R1, R2, R3, R9

- F2. **Customize before purchase**
  - **Trigger:** Organizer selects a template they do not own.
  - **Actors:** A1, A3
  - **Steps:** Show live preview with editable fields only (names, date, time, place — exact set per template). Validate lengths/format. Show price and what is included (e.g. single PDF, bleed, size).
  - **Outcome:** Organizer sees accurate preview of purchased output; edits are not lost if they navigate away (autosave draft — optional product decision).
  - **Covered by:** R4, R5

- F3. **Purchase template**
  - **Trigger:** Organizer confirms checkout for a template (or bundle).
  - **Actors:** A1, A3
  - **Steps:** Pay via Stripe (or existing payment patterns in repo). Webhook or return path marks template as **licensed** for this event + template id (+ optional version).
  - **Outcome:** Organizer can download and re-download; guest users never get paid files without organizer role.
  - **Covered by:** R6, R7, R10

- F4. **Download / print-at-home**
  - **Trigger:** Organizer opens a purchased template.
  - **Actors:** A1, A3
  - **Steps:** Render final asset with locked layout + saved field values; offer download; optional “open print view” like current print page.
  - **Outcome:** Organizer has a print-ready file suitable for professional or home printing.
  - **Covered by:** R8

- F5. **Edit after purchase (optional v1)**
  - **Trigger:** Organizer needs to fix a typo in names or time.
  - **Actors:** A1, A3
  - **Steps:** Either free limited edits, or “regenerate” within same template entitlement — product must pick policy.
  - **Outcome:** Clarified in Outstanding Questions (OQ1).

---

## Requirements

**Prints surface & navigation**

- R1. Primary organizers have a **Prints** entry point from the event admin experience (name can be “Prints”, “Stationery”, or final copy — same concept): visible with other organizer tabs, not buried only in Share.
- R2. Prints content is **scoped to the event**: template choices, purchases, and saved customizations belong to that event.
- R3. Templates are **filtered or grouped by event type** (e.g. Wedding): changing event type updates which templates are suggested or available (exact rule: catalog mapping — see Key Decisions).

**Template model**

- R4. Each template defines a **fixed visual layout** (typography, ornamentation, colors, QR placement for table items) and an explicit list of **user-editable fields** with constraints (max length, required vs optional).
- R5. Editable fields **at minimum** support the organizer’s stated needs: couple or host **names**, **event date**, **time**, **place** (venue / address as one or two fields — product copy). Additional fields (e.g. dress code, RSVP line) are template-specific, not global.
- R6. **Paid access**: using a template’s final export requires a successful **purchase** (or included entitlement if product later bundles templates with plans).
- R7. **Price varies** by template: catalog carries a price (and optionally complexity tier) per template; checkout shows the correct amount for the selected template(s).

**Output & quality**

- R8. Purchased output is **print-grade**: correct dimensions for stated paper/size, sufficient resolution for QR on table cards, no watermarks on paid exports (preview may show watermark — product decision).

**Catalog & commerce**

- R9. For each event type, the catalog exposes **multiple** invitation templates and **multiple** table/QR templates (numbers for v1 are a planning detail; not a single one-of-each).
- R10. Payment and entitlement logic is **reliable**: double webhook delivery, refresh mid-checkout, and abandoned checkout do not strand entitlements or grant without pay (align with existing Stripe patterns in repo).

**Non-organizer access**

- R11. Guests and non-organizers **cannot** purchase or download paid print assets for an event they do not organize.

---

## Acceptance Examples

- AE1. **Covers R1, R11.** Given an authenticated user who is **not** the event’s primary organizer, when they open the event’s Prints area, they do not see purchase or download controls for paid templates (or the tab is hidden per product rule).

- AE2. **Covers R3, R9.** Given an event with type **Wedding**, when the organizer opens Prints, they see at least one invitation template and at least one table/QR template in separate groupings.

- AE3. **Covers R4, R5, R8.** Given a wedding invitation template with fields “Partner A”, “Partner B”, “Date”, “Time”, “Venue”, when the organizer fills those fields and exports after purchase, the PDF preserves the template’s visual design and only those regions change.

- AE4. **Covers R6, R7, R10.** Given an organizer selects a template priced higher than another, when they complete Stripe checkout successfully, the template appears in **My purchases** (or equivalent) and download is enabled; if checkout fails or is canceled, download stays disabled.

---

## Success Criteria

- Organizers report they can produce **on-brand** invitations and table QR cards without leaving the app for v1 template sets.
- Support volume stays low: entitlement and download edge cases are documented and testable (webhook idempotency, role checks).
- Revenue attribution is clear: each purchase maps to event + template for reporting.

---

## Scope Boundaries

- No **physical mailing** or print-partner fulfillment in v1.
- No **guest-facing** template editor or RSVP design tool in v1.
- No **unlimited free-form design** (full Canva-like editor) — only field substitution on designed templates.
- No commitment to **every** event type at launch: v1 may ship with **Wedding** only plus a **Generic** fallback type if needed.
- **Copyrighted third-party art** in templates: only assets the product has rights to use (stock, commissioned, or internal).

---

## Key Decisions (product-level; mechanism names without implementation detail)

- **KD1. Tab vs route:** Prefer integrating **Prints as an organizer tab** (`?tab=prints`) for discoverability, while optionally reusing or redirecting from the existing `/events/[id]/print` experience so users do not land on two disconnected “print” concepts. Planning picks the navigation model.

- **KD2. Template engine (directional options for planning):** Three mechanism families are in play; the requirements doc does not pick a winner — planning compares against team skills and ops cost.
  - **Browser-first layout**: HTML/CSS (or canvas) + **print CSS** or client-side PDF — fast iteration, designer-friendly if components mirror web stack; watch for cross-browser print fidelity.
  - **Server-rendered PDF**: Headless render (e.g. HTML → PDF pipeline) — more consistent output, easier to lock dimensions; higher infra complexity.
  - **Template DSL + programmatic PDF** (e.g. declarative layout, coordinates) — maximum consistency and smallest file size; higher cost to author each template.

- **KD3. Catalog source:** Templates are **data-driven** (metadata + asset references + field schema + price) so new templates can ship without core app redeploy, once the pipeline exists (CMS, config repo, or database — planning decides).

- **KD4. Purchase granularity:** Default assumption is **per template per event** entitlement (buy once per event; re-download anytime). Bundles (“Wedding pack”) are optional later.

- **KD5. Preview vs final:** **Preview** may use lower resolution or watermark; **final** matches print spec exactly after purchase (or after “generate” click post-purchase).

---

## Dependencies / Assumptions

- **Stripe** (already used for event creation plans) extends or parallels for **template SKUs** / Checkout — legal, tax, and receipt copy need alignment with existing checkout UX.
- **Event type** must exist or be introduced for R3; until then, “Generic” templates or manual selector inside Prints can bootstrap.
- **Venue / address** may need structured fields on the event if today only `title` + `event_date` exist — planning audits `events` table and create flow.
- Existing print stack under `lib/event-print/` and `app/(app)/events/[id]/print/` is the **baseline** for table QR behavior; new work should not fork concepts unnecessarily.

---

## Outstanding Questions

### Resolve Before Planning

- **OQ1. Post-purchase edits:** Can organizers change field values **after** purchase without paying again? If yes, is there a limit (e.g. 3 regenerations / 30 days)?

- **OQ2. Tab naming:** “Prints”, “Stationery”, or “Invites & prints” — affects navigation and marketing; pick one for v1.

- **OQ3. Co-organizers:** If the product adds non-primary organizers later, do they share the same print entitlements?

### Deferred to Planning

- **OQ4.** Exact **Stripe** model (Price per template vs dynamic Checkout line items vs Customer Portal) and idempotency keys.

- **OQ5.** Whether **draft** customizations live in DB, local storage, or server session before purchase.

- **OQ6.** **QR** content: same join URL / access code as Share tab today — confirm single source of truth.

- **OQ7.** Internationalization of **template artwork** (separate locale assets vs universal designs).

---

## Template implementation angles (for planning, not binding)

These are the angles the user asked to “help implement” — framed so `/ce-plan` can compare trade-offs:

| Angle | What it optimizes for | Watch-outs |
|--------|------------------------|------------|
| **Extend current HTML print sheet** | Reuse `EventPrintSheet`-style rendering; add template variants and field injection. | Invitation layouts may need different aspect ratios than posters; print CSS quirks. |
| **Server PDF generation** | Pixel-identical output for every user; easier to enforce bleed/trim. | Hosting, latency, font embedding, queue if heavy. |
| **Hybrid** | Preview in browser; final on server. | Two code paths must stay visually in sync. |
| **External design tool export** | Designers work in Figma → export assets; devs map coordinates. | Slower template authoring; versioning discipline. |

**Field binding:** Each template ships a **schema** (field keys, labels, max length, type: text / date / time / multiline). The app merges **event defaults** (date from event record) into the form and lets the organizer override for print-specific wording.

**QR on table templates:** Encode the same **guest join** experience the app already promotes (URL + access code pattern); planning verifies `getWebJoinUrl` / access code behavior matches print size and error correction for QR.

---

## Sources & References

- Existing print route and templates: `app/(app)/events/[id]/print/`, `lib/event-print/print-options.ts`
- Event admin tabs: `app/(app)/events/[id]/_tabs/event-admin-tabs.ts`, `EventAdminTabs.tsx`
- Paid event creation: `app/api/stripe/checkout-create-event/route.ts`, `lib/event-stripe-checkout.ts`
