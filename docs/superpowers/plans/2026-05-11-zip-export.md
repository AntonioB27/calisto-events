# ZIP bulk export Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship async gallery ZIP exports for the **primary organizer only**, with per-run **include-videos** option, **24h** file retention, **email + in-app** status, and a **cron-based** worker aligned with existing purge patterns.

**Architecture:** Postgres table `media_zip_exports` queues jobs (`queued` → `running` → `ready` / `failed` / `expired`). Next.js **POST** creates rows after session auth proves `organizer_id`. **GET** cron (`CRON_SECRET`) uses **service role** to claim jobs, stream-build ZIPs with **`archiver`**, upload to **`event-media`** under `exports/{eventId}/{jobId}.zip`, notify via **Resend**, and expose **short-lived signed URLs** through an authenticated API route. A second cron pass (or same handler) removes expired ZIP objects and marks jobs `expired`.

**Tech stack:** Next.js App Router, Supabase (Postgres + Storage + Auth), `resend`, new dependency **`archiver`** (+ `@types/archiver`), Vitest.

**Spec:** `docs/superpowers/specs/2026-05-11-zip-export-design.md`

---

## File map (create / modify)

| Path | Role |
|------|------|
| `supabase/migrations/20260511200000_media_zip_exports.sql` | Table, indexes, RLS |
| `lib/zip-export-constants.ts` | `ZIP_EXPORT_EXPIRY_HOURS`, `ZIP_MAX_CONCURRENT`, `ZIP_MAX_MEDIA_ITEMS`, `ZIP_SIGNED_URL_SECONDS` |
| `lib/zip-export-email.ts` | Resend HTML + subject for ready/failed |
| `lib/process-zip-export-job.ts` | Claim job, list media, stream ZIP, upload, update row, call email |
| `lib/expire-zip-exports.ts` | Delete stale Storage objects + mark DB `expired` |
| `app/api/events/[id]/zip-export/route.ts` | `POST` create job |
| `app/api/events/[id]/zip-export/route.test.ts` | Auth + validation tests |
| `app/api/events/[id]/zip-export/[jobId]/sign/route.ts` | `POST` or `GET` returns short-lived signed URL |
| `app/api/events/[id]/zip-export/[jobId]/sign/route.test.ts` | Auth tests |
| `app/api/cron/process-zip-exports/route.ts` | Cron: process `queued` jobs |
| `app/api/cron/process-zip-exports/route.test.ts` | Bearer auth like purge cron |
| `app/api/cron/expire-zip-exports/route.ts` | Cron: TTL sweep |
| `app/api/cron/expire-zip-exports/route.test.ts` | Bearer auth |
| `vercel.json` | Add cron entries (or one combined route — see Task 8) |
| `app/(app)/events/[id]/page.tsx` | Pass `isPrimaryOrganizer` into `GalleryTab` |
| `app/(app)/events/[id]/_tabs/GalleryTab.tsx` | Accept prop, forward to `GalleryManager` |
| `app/(app)/events/[id]/_tabs/GalleryManager.tsx` | UI: Prepare ZIP panel, poll exports, download |
| `lib/app-ui/en.ts`, `de.ts`, `hr.ts` | Strings for modal, statuses, errors |
| `lib/i18n.ts` (and locale mirrors if duplicated) | Replace roadmap ZIP copy when feature ships |
| `README.md` | Document new crons + `RESEND_*` if new env vars |

---

### Task 1: Dependencies

**Files:**
- Modify: `package.json`

- [ ] **Step 1: Add archiver**

Run:

```bash
cd /home/antonio/repo/calisto-landing && npm install archiver && npm install -D @types/archiver
```

Expected: `package.json` / `package-lock.json` updated, `node_modules` contains `archiver`.

- [ ] **Step 2: Commit**

```bash
git add package.json package-lock.json
git commit -m "chore: add archiver for zip export worker"
```

---

### Task 2: Database — `media_zip_exports`

**Files:**
- Create: `supabase/migrations/20260511200000_media_zip_exports.sql`

- [ ] **Step 1: Write migration**

Create `supabase/migrations/20260511200000_media_zip_exports.sql`:

```sql
-- media_zip_exports: async ZIP jobs for primary organizer exports.

CREATE TYPE public.media_zip_export_status AS ENUM ('queued', 'running', 'ready', 'failed', 'expired');

CREATE TABLE public.media_zip_exports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid NOT NULL REFERENCES public.events (id) ON DELETE CASCADE,
  requested_by uuid NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  include_videos boolean NOT NULL DEFAULT false,
  status public.media_zip_export_status NOT NULL DEFAULT 'queued',
  storage_path text,
  file_size_bytes bigint,
  error_message text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz
);

CREATE INDEX media_zip_exports_event_created_idx ON public.media_zip_exports (event_id, created_at DESC);
CREATE INDEX media_zip_exports_status_created_idx ON public.media_zip_exports (status, created_at);

CREATE TRIGGER media_zip_exports_set_updated_at
  BEFORE UPDATE ON public.media_zip_exports
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

ALTER TABLE public.media_zip_exports ENABLE ROW LEVEL SECURITY;

-- Primary organizer of the event can read their event's export rows.
CREATE POLICY media_zip_exports_select_primary
  ON public.media_zip_exports
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.events e
      WHERE e.id = media_zip_exports.event_id
        AND e.organizer_id = auth.uid()
    )
  );

-- Only primary organizer inserts (requested_by must match organizer).
CREATE POLICY media_zip_exports_insert_primary
  ON public.media_zip_exports
  FOR INSERT
  WITH CHECK (
    requested_by = auth.uid()
    AND EXISTS (
      SELECT 1 FROM public.events e
      WHERE e.id = media_zip_exports.event_id
        AND e.organizer_id = auth.uid()
    )
  );

-- No UPDATE/DELETE for authenticated users — worker uses service role.
```

Notes for implementer: if `public.set_updated_at()` does not exist in a given project, copy the same trigger definition used on `events` or define a minimal `set_updated_at` in this migration. Apply with `supabase db push` or MCP `apply_migration`.

- [ ] **Step 2: Commit**

```bash
git add supabase/migrations/20260511200000_media_zip_exports.sql
git commit -m "feat(db): add media_zip_exports queue for zip exports"
```

---

### Task 3: Constants

**Files:**
- Create: `lib/zip-export-constants.ts`

- [ ] **Step 1: Add file**

Create `lib/zip-export-constants.ts`:

```typescript
/** Hours until the ZIP object is deleted from Storage after job becomes ready. */
export const ZIP_EXPORT_EXPIRY_HOURS = 24;

/** Max ZIP jobs the cron worker will pick up per invocation. */
export const ZIP_EXPORT_BATCH_LIMIT = 2;

/** Max media items per ZIP; refuse larger jobs in POST with clear error. */
export const ZIP_MAX_MEDIA_ITEMS = 2000;

/** Signed URL TTL for the browser download hop (seconds). */
export const ZIP_SIGNED_URL_SECONDS = 120;
```

- [ ] **Step 2: Commit**

```bash
git add lib/zip-export-constants.ts
git commit -m "feat: add zip export constants"
```

---

### Task 4: Unit tests — export eligibility helpers

**Files:**
- Create: `lib/zip-export-eligibility.ts`
- Create: `lib/zip-export-eligibility.test.ts`

- [ ] **Step 1: Write failing test**

Create `lib/zip-export-eligibility.test.ts`:

```typescript
import { describe, expect, it } from "vitest";

import { wouldExceedMediaLimit } from "./zip-export-eligibility";

describe("wouldExceedMediaLimit", () => {
  it("returns false at boundary", () => {
    expect(wouldExceedMediaLimit(2000, 2000)).toBe(false);
  });

  it("returns true over boundary", () => {
    expect(wouldExceedMediaLimit(2001, 2000)).toBe(true);
  });
});
```

Run: `npm test -- lib/zip-export-eligibility.test.ts`  
Expected: **FAIL** (module missing).

- [ ] **Step 2: Implement**

Create `lib/zip-export-eligibility.ts`:

```typescript
export function wouldExceedMediaLimit(count: number, max: number): boolean {
  return count > max;
}
```

Run: `npm test -- lib/zip-export-eligibility.test.ts`  
Expected: **PASS**

- [ ] **Step 3: Commit**

```bash
git add lib/zip-export-eligibility.ts lib/zip-export-eligibility.test.ts
git commit -m "feat: add zip export media limit helper"
```

---

### Task 5: `POST /api/events/[id]/zip-export` — create job

**Files:**
- Create: `app/api/events/[id]/zip-export/route.ts`
- Create: `app/api/events/[id]/zip-export/route.test.ts`

Implement `POST` that:

1. Uses `createSupabaseAuthServerClient()` (same as `app/api/events/[id]/delete/route.ts`) to `getUser()`.
2. Loads `events` row `{ id, organizer_id }` for `:id`; `404` if missing.
3. If `user.id !== organizer_id` → `403` JSON `{ error: "Forbidden." }`.
4. Parses JSON body `{ includeVideos?: boolean }`; default `false`.
5. Counts `media_items` for `event_id` with optional `mime_type` filter (exclude videos when `includeVideos` is false: `mime_type` is null OR `mime_type` ilike `image/%`). Use `head: true` count queries.
6. If count `> ZIP_MAX_MEDIA_ITEMS` → `400` with stable error code e.g. `ZIP_TOO_MANY_ITEMS`.
7. Checks no existing row for this `event_id` in `queued` or `running` (simple `select id ... limit 1`); if exists → `409` `ZIP_JOB_ALREADY_PENDING`.
8. Inserts into `media_zip_exports` with `status: 'queued'`, `requested_by: user.id`, `include_videos`.
9. Returns `201` with `{ id: job.id }`.

- [ ] **Step 1: Write route test skeleton**

Create `app/api/events/[id]/zip-export/route.test.ts` with mocks for Supabase (pattern from `app/api/events/[id]/delete/route.test.ts`): cases for **401** (no user), **403** (co-user id ≠ organizer), **409** (pending job exists). Use `vi.mock` on `@/lib/supabase-auth-server` and `@/lib/supabase-server` as needed.

Run: `npm test -- app/api/events/[id]/zip-export/route.test.ts`  
Expected: **FAIL** until route exists.

- [ ] **Step 2: Implement route** (full implementation in `route.ts` following steps above; use `getSupabaseAuthServerClient` for user-scoped insert so RLS applies.)

- [ ] **Step 3: Run tests**

```bash
npm test -- app/api/events/[id]/zip-export/route.test.ts
```

Expected: **PASS**

- [ ] **Step 4: Commit**

```bash
git add app/api/events/[id]/zip-export/route.ts app/api/events/[id]/zip-export/route.test.ts
git commit -m "feat(api): POST zip-export job for primary organizer"
```

---

### Task 6: Worker core — `processZipExportJob`

**Files:**
- Create: `lib/process-zip-export-job.ts`
- Create: `lib/process-zip-export-job.test.ts` (mock Storage + DB; small fixture paths)

Implementation sketch for `lib/process-zip-export-job.ts`:

- Export async function `processNextZipExportJob(db: SupabaseClient): Promise<{ processed: boolean; jobId?: string }>`.
- `select ... from media_zip_exports where status = 'queued' order by created_at asc limit 1 for update skip locked` — if Supabase JS cannot express `FOR UPDATE SKIP LOCKED`, use RPC `claim_zip_export_job()` in a migration instead; **prefer RPC** if client is awkward:

  ```sql
  CREATE OR REPLACE FUNCTION public.claim_next_zip_export_job()
  RETURNS public.media_zip_exports
  LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path = public
  AS $$
  DECLARE r public.media_zip_exports;
  BEGIN
    UPDATE public.media_zip_exports m
    SET status = 'running', updated_at = now()
    WHERE m.id = (
      SELECT id FROM public.media_zip_exports
      WHERE status = 'queued'
      ORDER BY created_at ASC
      FOR UPDATE SKIP LOCKED
      LIMIT 1
    )
    RETURNING * INTO STRICT r;
    RETURN r;
  EXCEPTION WHEN NO_DATA_FOUND THEN
    RETURN NULL;
  END;
  $$;
  REVOKE ALL ON FUNCTION public.claim_next_zip_export_job() FROM PUBLIC;
  GRANT EXECUTE ON FUNCTION public.claim_next_zip_export_job() TO service_role;
  ```

- After claim: load media rows `id, storage_path, mime_type` filtered by `include_videos`.
- Use `import archiver from "archiver"` and `import { PassThrough } from "node:stream"` — pipe archiver output to `PassThrough`, simultaneously `db.storage.from("event-media").upload(path, stream, { contentType: "application/zip", upsert: true })` (verify `upload` accepts stream in your SDK version; if not, buffer to temp file with `fs` in `/tmp` **only if** stream API unsupported — document decision in code comment).
- Set `storage_path`, `file_size_bytes` from upload result if available, `status = 'ready'`, `expires_at = now() + interval '24 hours'`.
- On error: `status = 'failed'`, `error_message` user-safe string.
- Call `sendZipReadyEmail` (Task 7).

Tests: mock `archiver` and storage `upload` to avoid real I/O; assert status transitions invoked.

- [ ] **Steps:** implement → test → commit `feat: add zip export worker core`

---

### Task 7: Resend — ready / failed email

**Files:**
- Create: `lib/zip-export-email.ts`

```typescript
import { Resend } from "resend";

export type ZipExportEmailKind = "ready" | "failed";

export async function sendZipExportEmail(args: {
  kind: ZipExportEmailKind;
  to: string;
  eventTitle: string;
  galleryUrl: string;
  jobId: string;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  const key = process.env.RESEND_API_KEY;
  if (!key) return { ok: false, error: "RESEND_API_KEY missing" };

  const resend = new Resend(key);
  const subject =
    args.kind === "ready"
      ? `Your Calisto export is ready — ${args.eventTitle}`
      : `Calisto export failed — ${args.eventTitle}`;

  const html =
    args.kind === "ready"
      ? `<p>Your ZIP for <strong>${escape(args.eventTitle)}</strong> is ready.</p><p><a href="${args.galleryUrl}">Open gallery to download</a></p>`
      : `<p>We could not finish the ZIP for <strong>${escape(args.eventTitle)}</strong>. Open the gallery for details.</p><p><a href="${args.galleryUrl}">Open gallery</a></p>`;

  const from = process.env.RESEND_FROM ?? "Calisto <onboarding@resend.dev>";
  const { error } = await resend.emails.send({ from, to: args.to, subject, html });
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

function escape(s: string): string {
  return s.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");
}
```

Worker loads organizer email via `auth.admin` not available on client — use `supabase.auth.admin.getUserById` **only if** service role key present, else skip email with log (or query `profiles` if email stored there). **Prefer** reading email from `profiles` table if the app already stores it; else document `RESEND` dependency on having user email in session-only flow — **implementation must resolve** using existing patterns in repo (`grep` for `profiles` email).

- [ ] **Step: Implement + commit** `feat: send zip export ready email via Resend`

---

### Task 8: Cron routes + `vercel.json`

**Files:**
- Create: `app/api/cron/process-zip-exports/route.ts` (mirror `purge-expired-events` auth header)
- Create: `app/api/cron/expire-zip-exports/route.ts` — selects `status = 'ready' AND expires_at < now()`, deletes Storage object, sets `expired`
- Modify: `vercel.json` — add schedules, e.g. every 5 minutes for processor, hourly for expiry:

```json
{
  "crons": [
    { "path": "/api/cron/purge-expired-events", "schedule": "0 * * * *" },
    { "path": "/api/cron/process-zip-exports", "schedule": "*/5 * * * *" },
    { "path": "/api/cron/expire-zip-exports", "schedule": "15 * * * *" }
  ]
}
```

- [ ] **Tests:** duplicate bearer 401/503 pattern from `app/api/cron/purge-expired-events/route.test.ts`.

- [ ] **Commit** `feat: add zip export cron routes`

---

### Task 9: Signed download route

**Files:**
- Create: `app/api/events/[id]/zip-export/[jobId]/sign/route.ts`

`POST` (or `GET`) flow:

1. Session user must be primary organizer for `eventId` (same check as Task 5).
2. Load job by `jobId` + `event_id` match; `404` if wrong.
3. Require `status === 'ready'`, `expires_at > now()`, `storage_path` non-null; else `409`.
4. `getSupabaseServerClient().storage.from("event-media").createSignedUrl(storage_path, ZIP_SIGNED_URL_SECONDS)`.
5. Return `{ url: signed.data.signedUrl }`.

- [ ] **Tests** co-organizer 403, wrong job 404, expired 409.

- [ ] **Commit** `feat(api): signed URL for ready zip export`

---

### Task 10: Gallery UI + wiring

**Files:**
- Modify: `app/(app)/events/[id]/page.tsx` — pass `isPrimaryOrganizer` to `GalleryTab`
- Modify: `app/(app)/events/[id]/_tabs/GalleryTab.tsx` — prop `isPrimaryOrganizer: boolean`
- Modify: `app/(app)/events/[id]/_tabs/GalleryManager.tsx` — when `isPrimaryOrganizer`, show **Prepare ZIP** button + modal + `useEffect` poll `supabase.from("media_zip_exports").select("*").eq("event_id", eventId).order("created_at", { ascending: false }).limit(5)` every 4s while tab focused; **Download** calls `fetch("/api/events/${eventId}/zip-export/${jobId}/sign", { method: "POST" })` then `window.location` or anchor to URL.

- [ ] **Strings** in `lib/app-ui/en.ts` / `de.ts` / `hr.ts` under e.g. `gallery.zipExportPrepare`, `gallery.zipExportIncludeVideos`, `gallery.zipExportQueued`, `gallery.zipExportReady`, `gallery.zipExportFailed`, `gallery.zipExportDownload`.

- [ ] **Commit** `feat(ui): gallery zip export panel for primary organizer`

---

### Task 11: Marketing copy

**Files:**
- Modify: `lib/i18n.ts` (EN/DE/HR sections): replace “ZIP export roadmap” with factual one-liner that matches shipped behavior; update FAQ “how long stored” if it still says no auto zip.

- [ ] **Commit** `docs(i18n): document zip export availability`

---

### Task 12: README + manual QA

- [ ] **README:** document `RESEND_API_KEY` / `RESEND_FROM` if not already, new cron paths, env `CRON_SECRET` already used.

- [ ] **Manual QA checklist:** create event as primary, upload 2 photos, request ZIP without videos, verify email, download within 2 minutes, wait 24h+ (or temporarily shorten TTL in dev) and confirm `expired` + object gone.

---

## Plan self-review (vs spec)

| Spec section | Task coverage |
|--------------|---------------|
| Primary only | Task 5, 9, 10 |
| Include videos option | Task 5 body + worker filter Task 6 |
| Async queue | Tasks 2, 5, 6, 8 |
| Email + in-app | Tasks 7, 10 |
| Gallery entry | Task 10 |
| 24h retention | Tasks 2 `expires_at`, 8 expire cron |
| Limits | Tasks 3–4, 5 count |
| Signed URL short | Task 9 constant |
| Marketing | Task 11 |

**Placeholder scan:** none intentional; implementer must resolve “user email source” in Task 7 note by inspecting existing `profiles` / auth usage.

---

**Plan complete and saved to `docs/superpowers/plans/2026-05-11-zip-export.md`. Two execution options:**

1. **Subagent-Driven (recommended)** — dispatch a fresh subagent per task, review between tasks, fast iteration (`superpowers:subagent-driven-development`).

2. **Inline Execution** — run tasks in this session with checkpoints (`superpowers:executing-plans`).

**Which approach do you want?**
