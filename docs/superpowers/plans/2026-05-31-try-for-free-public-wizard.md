# Try for Free — Public Event Creation Wizard Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Allow unauthenticated users to reach the event creation wizard from the landing page "Try for free" CTA, completing Steps 1–2 freely and hitting an auth gate at Step 3.

**Architecture:** Move the wizard route out of the `(app)` route group (which enforces server-side auth redirect) into a plain `app/events/new/` route. The URL stays `/events/new`. The existing Step 3 client-side auth gate, draft-save, and resume flow require zero changes.

**Tech Stack:** Next.js App Router, Supabase auth, localStorage draft system

---

## File Map

| Action | Path |
|--------|------|
| Move | `app/(app)/events/new/page.tsx` → `app/events/new/page.tsx` |
| Move | `app/(app)/events/new/ResumeDraftClient.tsx` → `app/events/new/ResumeDraftClient.tsx` |
| Move | `app/(app)/events/new/_steps/Step1Details.tsx` → `app/events/new/_steps/Step1Details.tsx` |
| Move | `app/(app)/events/new/_steps/Step2Plan.tsx` → `app/events/new/_steps/Step2Plan.tsx` |
| Move | `app/(app)/events/new/_steps/Step3Payment.tsx` → `app/events/new/_steps/Step3Payment.tsx` |
| Move | `app/(app)/events/new/complete/page.tsx` → `app/events/new/complete/page.tsx` |
| Move | `app/(app)/events/new/complete/CompleteCheckoutClient.tsx` → `app/events/new/complete/CompleteCheckoutClient.tsx` |
| Delete | `app/(app)/events/new/` (after move) |
| Modify | `components/Hero.tsx` |
| Modify | `lib/i18n.ts` |

---

### Task 1: Move wizard files to a public route

The `(app)` layout (`app/(app)/layout.tsx`) calls `requireOrganizerSession()` which server-redirects any unauthenticated request. Moving the wizard out of this group makes Steps 1–2 accessible without auth. All imports in these files use `@/` absolute paths — no import changes needed.

**Files:**
- Create (via move): `app/events/new/` and all contents listed in the file map above
- Delete: `app/(app)/events/new/`

- [ ] **Step 1: Create the destination directory structure and move files**

```bash
mkdir -p app/events/new/_steps
mkdir -p app/events/new/complete

# Move wizard files
mv app/\(app\)/events/new/page.tsx app/events/new/page.tsx
mv app/\(app\)/events/new/ResumeDraftClient.tsx app/events/new/ResumeDraftClient.tsx
mv app/\(app\)/events/new/_steps/Step1Details.tsx app/events/new/_steps/Step1Details.tsx
mv app/\(app\)/events/new/_steps/Step2Plan.tsx app/events/new/_steps/Step2Plan.tsx
mv app/\(app\)/events/new/_steps/Step3Payment.tsx app/events/new/_steps/Step3Payment.tsx
mv app/\(app\)/events/new/complete/page.tsx app/events/new/complete/page.tsx
mv app/\(app\)/events/new/complete/CompleteCheckoutClient.tsx app/events/new/complete/CompleteCheckoutClient.tsx

# Remove the now-empty (app)/events/new directory
rm -rf app/\(app\)/events/new
```

- [ ] **Step 2: Verify the old path is gone and new path has all files**

```bash
ls app/\(app\)/events/new 2>&1   # should say: No such file or directory
ls app/events/new/               # should list: page.tsx  ResumeDraftClient.tsx  _steps/  complete/
ls app/events/new/_steps/        # should list: Step1Details.tsx  Step2Plan.tsx  Step3Payment.tsx
ls app/events/new/complete/      # should list: page.tsx  CompleteCheckoutClient.tsx
```

- [ ] **Step 3: Confirm TypeScript still compiles**

```bash
npx tsc --noEmit
```

Expected: no errors. If you see errors about missing files, double-check the move commands above — you may be running them from the wrong directory (run from the project root).

- [ ] **Step 4: Commit**

```bash
git add app/events/new app/\(app\)/events/new
git commit -m "feat: move event creation wizard to public route"
```

---

### Task 2: Update the Hero CTA

Change the primary CTA in the hero from "Try the demo" → "Try for free" linking to `/events/new`.

**Files:**
- Modify: `components/Hero.tsx`
- Modify: `lib/i18n.ts`

- [ ] **Step 1: Update the href in `components/Hero.tsx`**

Find (line ~52):
```tsx
href="/demo"
```

Replace with:
```tsx
href="/events/new"
```

- [ ] **Step 2: Update EN copy in `lib/i18n.ts`**

Find (line ~179):
```ts
heroPrimaryCta: "Try the demo",
```

Replace with:
```ts
heroPrimaryCta: "Try for free",
```

- [ ] **Step 3: Update HR copy in `lib/i18n.ts`**

Find (line ~470):
```ts
heroPrimaryCta: "Isprobaj demo",
```

Replace with:
```ts
heroPrimaryCta: "Isprobaj besplatno",
```

- [ ] **Step 4: Update DE copy in `lib/i18n.ts`**

Find (line ~760):
```ts
heroPrimaryCta: "Demo ausprobieren",
```

Replace with:
```ts
heroPrimaryCta: "Kostenlos ausprobieren",
```

- [ ] **Step 5: Confirm TypeScript still compiles**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 6: Commit**

```bash
git add components/Hero.tsx lib/i18n.ts
git commit -m "feat: change hero CTA to Try for free linking to /events/new"
```

---

### Task 3: Verify the full flow

Manual end-to-end verification. Run the dev server:

```bash
npm run dev
```

- [ ] **Step 1: Verify unauthenticated access to Step 1**

Open a private/incognito browser window (no session). Navigate to `http://localhost:3000/events/new`.

Expected: Step 1 (Details) renders — you see the event name input and date picker. You are **not** redirected to login.

If you are redirected to login, the file move did not work correctly — check that `app/events/new/page.tsx` exists and `app/(app)/events/new/` is deleted.

- [ ] **Step 2: Complete Step 1 and verify Step 2**

Enter an event name (e.g. "My Wedding") and a date. Click Next/Continue.

Expected: Step 2 (Plan selection) renders. Still no login redirect.

- [ ] **Step 3: Select a plan and verify Step 3 shows auth gate**

Select any plan and proceed to Step 3.

Expected: Step 3 renders briefly showing a loading state ("Checking session…"), then switches to the auth gate card with "Log in" and "Create account" buttons.

- [ ] **Step 4: Verify draft is saved before redirect**

Open browser DevTools → Application → Local Storage → `localhost:3000`. Note the value of `calisto_create_event_draft_v1` — it should contain your event name, date, plan, and `"step":"3"`.

Click "Log in". You should be redirected to `/auth/login?returnTo=%2Fevents%2Fnew%3Fresume%3D1`.

- [ ] **Step 5: Verify draft resumes after auth**

Complete login with a test account. You should be redirected to `/events/new?resume=1`. The `ResumeDraftClient` reads the draft and redirects to Step 3 with your event name/date/plan pre-filled.

Expected: you land on Step 3 (Review) showing the event details you entered, ready to confirm.

- [ ] **Step 6: Verify the landing page CTA**

Navigate to `http://localhost:3000`. The primary hero button should say "Try for free" and clicking it should navigate to `/events/new` (Step 1).

- [ ] **Step 7: Verify logged-in users are unaffected**

While logged in, navigate to `/events/new`. Step 1 should render. Proceed through all 3 steps — Step 3 should show the confirmation card directly (no auth gate).
