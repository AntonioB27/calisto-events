# Landing Page Social Proof + Simplified Plan Labels Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a social proof stat bar below the hero and replace technical plan row labels with plain language across all 3 locales.

**Architecture:** Two file changes only — `lib/i18n.ts` gets updated copy, `app/[locale]/page.tsx` gets the existing `StatBar` component inserted after `<Hero>`. No new components, no new types.

**Tech Stack:** Next.js (App Router), TypeScript, React

---

## File Map

- Modify: `lib/i18n.ts` — update `statBar` values and plan row labels for `en`, `hr`, `de`
- Modify: `app/[locale]/page.tsx` — import `StatBar` and render it after `<Hero>`

---

### Task 1: Update i18n copy — English

**Files:**
- Modify: `lib/i18n.ts`

- [ ] **Step 1: Replace the English `statBar` array**

In `lib/i18n.ts`, find the `en` locale's `statBar` field (around line 199) and replace it:

```ts
statBar: [
  { value: "436 weddings", label: "already celebrated" },
  { value: "9,000+ photos", label: "captured and shared" },
  { value: "5,000+ guests", label: "no app, no account" },
],
```

- [ ] **Step 2: Replace English plan row labels in all 5 plans**

In the `en` locale, find every plan's `rows` array and rename:
- `"ZIP export"` → `"Download all"`
- `"Upload window"` → `"Guests can upload for"`
- `"Event deletion"` → `"Photos kept for"`

The result for the `free` plan should look like:
```ts
rows: [
  { label: "Price", value: "0€" },
  { label: "Photos", value: "20" },
  { label: "Videos", value: "0" },
  { label: "Guest limit", value: "5" },
  { label: "Download all", value: "Gallery — primary organizer, 24h link" },
  { label: "Guests can upload for", value: "3 days" },
  { label: "Photos kept for", value: "7 days" },
],
```

Apply the same label renames to `standard`, `plus`, `premium`, and `max` plans. Values stay unchanged.

---

### Task 2: Update i18n copy — Croatian

**Files:**
- Modify: `lib/i18n.ts`

- [ ] **Step 1: Replace the Croatian `statBar` array**

Find the `hr` locale's `statBar` field (around line 496) and replace it:

```ts
statBar: [
  { value: "436 vjenčanja", label: "već proslavljena" },
  { value: "9.000+ fotografija", label: "snimljeno i podijeljeno" },
  { value: "5.000+ gostiju", label: "bez aplikacije i računa" },
],
```

- [ ] **Step 2: Replace Croatian plan row labels in all 5 plans**

In the `hr` locale, rename:
- `"ZIP izvoz"` → `"Preuzmi sve"`
- `"Rok uploada"` → `"Gosti mogu učitavati još"`
- `"Brisanje događaja"` → `"Fotografije čuvamo"`

The result for the `free` plan should look like:
```ts
rows: [
  { label: "Cijena", value: "0€" },
  { label: "Fotografije", value: "20" },
  { label: "Videa", value: "0" },
  { label: "Limit gostiju", value: "5" },
  { label: "Preuzmi sve", value: "Galerija — primarni organizator, 24h link" },
  { label: "Gosti mogu učitavati još", value: "3 dana" },
  { label: "Fotografije čuvamo", value: "7 dana" },
],
```

Apply the same label renames to `standard`, `plus`, `premium`, and `max` plans.

---

### Task 3: Update i18n copy — German

**Files:**
- Modify: `lib/i18n.ts`

- [ ] **Step 1: Replace the German `statBar` array**

Find the `de` locale's `statBar` field (around line 792) and replace it:

```ts
statBar: [
  { value: "436 Hochzeiten", label: "bereits gefeiert" },
  { value: "9.000+ Fotos", label: "aufgenommen und geteilt" },
  { value: "5.000+ Gäste", label: "ohne App, ohne Konto" },
],
```

- [ ] **Step 2: Replace German plan row labels in all 5 plans**

In the `de` locale, rename:
- `"ZIP-Export"` → `"Alles herunterladen"`
- `"Upload-Fenster"` → `"Gäste können hochladen für"`
- `"Event-Löschung"` → `"Fotos gespeichert für"`

The result for the `free` plan should look like:
```ts
rows: [
  { label: "Preis", value: "0€" },
  { label: "Fotos", value: "20" },
  { label: "Videos", value: "0" },
  { label: "Gästelimit", value: "5" },
  { label: "Alles herunterladen", value: "Galerie — Primär, 24h-Link" },
  { label: "Gäste können hochladen für", value: "3 Tage" },
  { label: "Fotos gespeichert für", value: "7 Tage" },
],
```

Apply the same label renames to `standard`, `plus`, `premium`, and `max` plans.

---

### Task 4: Wire up StatBar on the landing page

**Files:**
- Modify: `app/[locale]/page.tsx`

- [ ] **Step 1: Import StatBar**

Add the import at the top of `app/[locale]/page.tsx` alongside the other component imports:

```ts
import { StatBar } from "@/components/StatBar";
```

- [ ] **Step 2: Render StatBar after Hero**

In the `<main>` block, insert `<StatBar copy={copy} />` immediately after `<Hero>`:

```tsx
<main className="flex-1">
  <Hero copy={copy} isLoggedIn={isLoggedIn} />
  <StatBar copy={copy} />
  <AppPreviewWindow copy={copy} />
  <FeatureGrid copy={copy} />
  <HowItWorks copy={copy} />
  <PlanCards copy={copy} />
  <AuroraQuote copy={copy} />
  <FAQ copy={copy} />
  <WaitlistForm copy={copy.waitlist} mascotAlt={copy.auroraMascotAlt} locale={locale as Locale} />
</main>
```

- [ ] **Step 3: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 4: Run the dev server and check the landing page**

```bash
npm run dev
```

Open `http://localhost:3000/en` and verify:
- The stat bar appears between the hero and the app preview, showing "436 weddings", "9,000+ photos", "5,000+ guests"
- Open a plan card and expand it — confirm "Download all", "Guests can upload for", "Photos kept for" appear instead of the old labels
- Check `http://localhost:3000/hr` and `http://localhost:3000/de` for the same
