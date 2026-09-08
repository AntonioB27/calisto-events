# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Primary users are wedding hosts (and similar life-event hosts) planning an event who want guests to contribute photos/media during and after the event, plus printable QR materials for the venue. Guests are a secondary, lightweight audience: they join an event via an access code or QR scan (no account required) to view and upload media.

## Product Purpose

Calisto Events is an end-to-end event-media lifecycle tool for hosts: create an event, invite guests via QR/access code, collect and manage a shared media gallery, print QR table cards and invitations, and eventually export and let the event's media expire on a retention schedule. Organizers manage everything through an authenticated dashboard; guests interact through a minimal, account-free join flow.

## Positioning

Not a generic shared photo album (e.g. a Google Photos shared album). Calisto owns the full event lifecycle: tiered paid plans (Free/Standard/Plus/Premium/Max) with plan-based retention windows, automatic scheduled deletion of event media, ZIP export of the full gallery, a library of printable QR table-card and wedding invitation templates (themed designs, not just a generic QR code), and multilingual marketing/product surfaces. The product is purpose-built around the arc of a single event (before, during, after) rather than being an always-on media library.

## Operating Context

- Organizers: sign in via Supabase Auth (email or Google OAuth), create and manage events from an authenticated `(app)` dashboard, choose/upgrade a plan tier, generate and print QR/invitation materials, and manage gallery contents and retention.
- Guests: reach an event via `/join/{accessCode}` or a scanned QR code, optionally continue anonymously (Supabase anonymous sign-in), and view/upload media without entering the organizer app shell.
- Payments: Stripe Checkout for paid tiers and upgrades (free-to-paid and tier-to-tier).
- Retention/cron: scheduled deletion of event media per plan tier (Free 7d, Standard 30d, Plus 90d, Premium 180d, Max 365d), scheduled ZIP export generation and expiry, all via Vercel cron routes.
- Marketing/landing: locale-driven (`/[locale]`, e.g. `/en`, `/hr`, `/de`) marketing shell with a distinct visual language from the authenticated app chrome.

## Capabilities and Constraints

- Multilingual: English, Croatian, German (`en`, `hr`, `de`) locales are live in `lib/i18n.ts` for marketing copy; this is an existing capability, not yet confirmed as a binding constraint on every future surface.
- Print system: 6 themed QR table-card designs, 5 classic QR templates (PDF), and 10 wedding invitation templates (browser-print HTML). New invitation templates are added via a documented, code-first workflow (`docs/new-invitation-template.md`) — no planning docs, straight to code.
- Plan tiers gate storage/retention and are enforceable both at signup and at upgrade time (free-to-paid, and paid-to-higher-paid).
- Framework/version sensitivity: this Next.js app runs a newer major version (16.x) with breaking changes from typical training data — framework docs must be checked locally before writing Next.js-specific code (see `AGENTS.md`).

## Brand Commitments

- Mascot: "Aurora" appears throughout marketing copy (feature-card speech bubbles, hero mascot card, plan-selection copy) with her own illustrated asset (`/brand/mascot.png`) and a distinct conversational voice, separate from factual hero/product copy.
- Visual style (from prior sessions): warm-tinted amber glass UI, specular highlights, overlapping photo stacks; explicitly not pure-white glass.
- Copy constraint: never use em dashes in UI strings or written content.

## Evidence on Hand

- Existing marketing copy, plan tier definitions, and mascot dialogue live in `lib/i18n.ts`.
- Existing print/invitation template catalog and architecture documented in `docs/qr-prints-architecture.md`.
- Wider system overview in `docs/design-and-application.md`.
- No confirmed customer testimonials, case studies, or press should be fabricated; none found in the repo as of this writing.

## Product Principles

1. Design and copy for the arc of one event, not an always-on library: creation → invite → capture → export/expire.
2. Keep the guest join path frictionless and account-free; complexity belongs in the organizer dashboard, not the guest flow.
3. Treat print materials (QR cards, invitations) as first-class product surfaces, not an afterthought bolted onto the gallery feature.
4. Aurora's voice is a distinct, warmer channel from factual product copy — don't blend the two.
5. Preserve multilingual parity (en/hr/de) when touching marketing-facing copy.
