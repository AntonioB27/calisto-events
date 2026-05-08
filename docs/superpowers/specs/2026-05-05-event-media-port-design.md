# Event Media App to Calisto Landing Port Design

Date: 2026-05-05
Status: Draft approved in chat, pending final spec review
Owner: Product/Engineering

## 1) Goal

Port the full currently implemented functionality of `event-media-app` into `calisto-landing` as a web experience, using a new branch from `main`, while preserving behavior parity for both organizer and guest flows.  
The web port must use the same Supabase project/schema/storage buckets already used by `event-media-app`.

## 2) In Scope

- Functional parity with currently implemented features in `event-media-app` (code-level parity target, not roadmap-only features).
- Organizer and guest flows delivered in lockstep.
- Reuse of already built web capabilities where they match source behavior.
- Shared domain rules for plans, usage limits, upload windows, and access constraints.
- Supabase auth/database/storage integration against the shared backend.

## 3) Out of Scope

- Mobile-only device integrations that do not apply to web runtime.
- New web-only product features before parity baseline is complete.
- A backend split/migration to a separate Supabase environment during this phase.

## 4) Branching and Integration Strategy

- Create a new feature branch from `calisto-landing/main`.
- Treat `event-media-app` behavior as the source of truth.
- Use existing `calisto-landing` web code (including ideas from `feat/web-platform`) selectively:
  - Keep it when it matches source behavior and quality bar.
  - Replace or adapt it when behavior diverges from app parity.
- Ship in vertical slices so each increment remains testable and reviewable.

## 5) Architecture Overview

### 5.1 Web Host

- Continue with Next.js app router in `calisto-landing`.
- Protected organizer routes validate sessions server-side.
- Public guest join entry points support access code and direct links.

### 5.2 Domain Parity Layer

- Centralize reusable business rules in `lib/`:
  - plan limits (guest/photo/video quotas)
  - upload window and lifecycle timing
  - usage statistics and counters
  - access code and event eligibility logic
- Use identical rule behavior in:
  - client pre-flight UX checks
  - server hard enforcement (authoritative)

### 5.3 Backend Integration

- Supabase auth remains the identity source.
- Supabase storage remains media source of truth.
- Supabase database tables remain event and media metadata source of truth.
- Server route handlers are the trust boundary for privileged mutations and permission checks.

## 6) Functional Components and Data Flow

### 6.1 Auth

- Register/login/logout on web with Supabase.
- Ensure route guards for organizer-only surfaces.
- Keep session/authorization behavior aligned with current app logic.

### 6.2 Organizer Flow

- Create event flow:
  - event details
  - plan selection
  - payment step parity where currently implemented
- Event admin surfaces:
  - overview
  - guests
  - gallery
  - share/QR
  - admin controls
- Ownership enforced on all organizer event operations.

### 6.3 Guest Flow

- Join via access code/link.
- Validate event availability and constraints before allowing upload.
- Upload media, view gallery, and interact according to current app permissions.

### 6.4 Media Pipeline

- Client selects files and performs pre-validation.
- Uploads go to Supabase storage.
- Metadata is persisted in database records.
- UI reflects successful/failed uploads and refreshed gallery state.

### 6.5 Plan and Usage Enforcement

- Quotas, upload windows, and eligibility checks are centralized.
- UX displays clear pre-flight limits and remaining capacity.
- Server rejects out-of-policy operations regardless of client behavior.

## 7) Error Handling

- Normalize errors into user-understandable categories:
  - authentication required
  - forbidden/insufficient permissions
  - quota reached
  - uploads closed by plan window
  - invalid file/type/size
  - transient backend/storage failure
- Keep detailed diagnostics in server logs only.
- Support partial success for batch upload attempts.

## 8) Testing and Verification

### 8.1 Automated Coverage

- Extend or add tests for domain utilities (plan limits, usage stats, access code rules).
- Add focused tests for critical route handlers enforcing authorization and quotas.
- Keep tests deterministic and independent of UI rendering where possible.

### 8.2 End-to-End Behavior Checks

- Organizer happy path:
  - auth -> create event -> manage event tabs
- Guest happy path:
  - join -> upload -> gallery visibility
- Edge cases:
  - quota reached
  - expired upload window
  - unauthorized event mutation attempts
  - mixed-success multi-file upload

### 8.3 Build Quality Gates

- `npm run lint`
- `npm run test` (if configured in branch scope)
- `npm run build`

Parity is considered complete only when checks pass and parity checklist items are all validated.

## 9) Delivery Plan (Lockstep)

- Work in small vertical increments that touch both organizer and guest behavior where relevant.
- Track parity against a capability checklist mapped to implemented `event-media-app` features.
- Freeze net-new web-specific enhancements until parity baseline is finished.

## 10) Risks and Mitigations

- Risk: Hidden behavior divergence between existing web code and app source.
  - Mitigation: capability-by-capability verification against app behavior, not file-level copy confidence.
- Risk: Shared backend assumptions differ between web and mobile runtimes.
  - Mitigation: verify auth/session/storage flows early with production-like configuration.
- Risk: Scope creep from desired web enhancements.
  - Mitigation: strict parity gate before enhancement backlog.

## 11) Definition of Done

The port is complete when:

- All currently implemented `event-media-app` capabilities intended for web runtime are available in `calisto-landing`.
- Organizer and guest flows both pass agreed parity checks.
- Domain rules and server enforcement match expected app behavior.
- Lint/tests/build pass on the target branch.
- Remaining known gaps (if any) are explicitly documented and approved.
