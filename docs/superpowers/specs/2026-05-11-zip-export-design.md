---
date: 2026-05-11
topic: organizer-zip-export
status: approved-for-implementation-planning
---

# ZIP bulk export — design spec

## 1. Summary

Primary organizers can request an **async ZIP export** of an event’s gallery from the **Gallery** tab. They choose options per run (e.g. **include videos**). The system builds the archive in the background, keeps the resulting file in Storage for **24 hours**, and notifies the organizer via **email and in-app** state. **Guests and co-organizers cannot** trigger exports, limiting Supabase Storage egress to intentional primary-organizer actions.

## 2. Goals

- One-click **“Prepare ZIP”** from the organizer Gallery, primary only.
- **Predictable cost:** no guest-triggered bulk reads; optional caps (see §8).
- **Reliable UX:** no long-running browser requests; clear states (`queued` → `running` → `ready` / `failed`).
- **Trust:** time-limited download link; object removed after **24h**.

## 3. Non-goals (v1)

- Co-organizer or guest ZIP access.
- Incremental / delta ZIPs or sync-to-Drive integrations.
- Server-side re-encoding or transcoding of video.
- ZIPs that exceed platform limits without a clear refusal or split strategy (defer “multi-part ZIP” until needed).

## 4. Actors and permissions

| Actor | Can request ZIP? |
|--------|-------------------|
| Primary organizer (`events.organizer_id === auth.uid()`) | Yes |
| Co-organizer | No (UI hidden; API 403) |
| Guest / anonymous | No |

Every **create-job** and **download** path must re-verify organizer ownership of the event (same bar as destructive settings APIs).

## 5. User experience

### 5.1 Gallery entry (primary only)

- Control: **Prepare ZIP** (or equivalent copy), placed in the Gallery toolbar area.
- Modal or inline panel:
  - Checkbox: **Include videos** (default **off** to reduce default egress/size).
  - Short copy: approximate implications (larger file, longer processing, Storage egress).
  - Primary action: **Start export** → creates job, shows toast “Export queued.”

### 5.2 In-app status

- Show **latest job** (or short list) for this event: status, requested options, created time, error message if failed.
- When `ready`: **Download** button fetches a **short-lived signed URL** (or server redirect) scoped to that job’s object.
- Polling: acceptable v1 (e.g. every few seconds while Gallery tab focused); **Supabase Realtime** on the job row is an optional improvement.

### 5.3 Email

- On `ready`: send transactional email (Resend) with **link to open the app** on the Gallery tab and/or a **direct signed URL** (if policy allows — prefer app deep-link + in-app download for security).
- On `failed`: optional email with support-oriented message.

## 6. Data model (conceptual)

New table, e.g. `media_zip_exports` (exact name to align with migrations):

| Column | Purpose |
|--------|---------|
| `id` | UUID PK |
| `event_id` | FK → `events` |
| `requested_by` | `uuid` (must match organizer; redundant check) |
| `include_videos` | `boolean` |
| `status` | `queued` \| `running` \| `ready` \| `failed` \| `expired` |
| `storage_path` | Path to ZIP object in a **private** bucket/prefix, nullable until ready |
| `file_size_bytes` | Nullable; for UI |
| `error_message` | Nullable; user-safe text |
| `created_at`, `updated_at` | Audit |
| `expires_at` | Set when `ready` = `created_at` + **24h** (or when object TTL starts) |

Indexes: `(event_id, created_at desc)` for UI; `(status, created_at)` for worker claim pattern.

**RLS:** primary organizer can `select` own event’s rows; `insert` only via controlled RPC or server route; worker uses **service role** to update status and write Storage (same pattern as purge).

## 7. Processing architecture (recommended)

**Queue + cron processor** (consistent with existing `purge-expired-events` pattern):

1. **POST** authenticated route (e.g. `/api/events/[id]/zip-export`) validates primary organizer, inserts row `queued`.
2. **GET** cron route (e.g. `/api/cron/process-zip-exports`) with `CRON_SECRET`:
   - Selects a small batch of `queued` jobs, marks `running` (claim with optimistic locking or `FOR UPDATE SKIP LOCKED`).
   - Lists candidate `media_items` for `event_id`, filtered by `include_videos`.
   - **Streams** from `event-media` into a ZIP (avoid loading entire album into RAM).
   - Uploads ZIP to a **dedicated private prefix** (e.g. bucket `event-media` under `exports/{event_id}/{job_id}.zip` or sibling private bucket — decision at implementation).
   - Sets `ready`, `storage_path`, `file_size_bytes`, `expires_at`, sends **Resend** email.
3. **TTL sweep:** same or separate cron deletes Storage objects past `expires_at` and marks jobs `expired` (or deletes rows per retention policy).

**Failure:** mark `failed`, store sanitized `error_message`, optionally email.

## 8. Limits and abuse controls (v1 minimum)

Documented defaults (tune during implementation):

- **Max concurrent `running` jobs** globally (e.g. 1–3) to cap CPU.
- **Per-event cooldown** or “one `queued`/`running` at a time” to prevent double-click storms.
- **Max bytes or max items** per job; if exceeded, `failed` with message to contact support or deselect videos.

## 9. Download authorization

- **Do not** use long-lived public URLs.
- Download endpoint or RPC: verifies `auth.uid()` is primary organizer **and** job belongs to that event **and** `status === ready` **and** `expires_at > now()`.
- Signed URL TTL short (e.g. minutes) even if file has 24h Storage retention.

## 10. Observability

- Structured logs: `event_id`, `job_id`, duration, bytes, item counts.
- Optional: admin metrics later.

## 11. Testing strategy (high level)

- Unit: status transitions, claim logic, filter `include_videos`.
- Integration: route auth (403 for co-org / guest), fake Storage list + small ZIP smoke.
- Load: defer; manual test with medium album before launch.

## 12. Open implementation choices (not blocking spec approval)

- Exact bucket/prefix layout vs separate `exports` bucket.
- Streaming ZIP library choice for Node runtime.
- Whether Realtime v1 ships with polling fallback.

## 13. Marketing / copy

When shipped: replace “ZIP export roadmap” strings in `lib/i18n.ts` (and DE/HR mirrors) with accurate capability and limits; link from plan tables if ZIP is all tiers or tier-gated (currently spec is **all primary organizers** — tier gating is a future product knob).
