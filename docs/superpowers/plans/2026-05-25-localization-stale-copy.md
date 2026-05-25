# Localization: Update Stale Landing Copy Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Update stale i18n values for `heroPrimaryCta`, `joinWaitlistShort`, and `waitlist.*` in all three locales, then re-wire the three components that hardcoded "Try the demo" so translated strings actually appear.

**Architecture:** Pure data + thin wiring. No new types, no new files. `lib/i18n.ts` holds all copy; the three components (`Hero`, `SiteHeader`, `WaitlistForm`) receive `copy` props they already accept — they just need to use the keys instead of hardcoded strings.

**Tech Stack:** TypeScript, Next.js App Router, React

---

### Task 1: Update i18n.ts copy values

**Files:**
- Modify: `lib/i18n.ts` (en ~lines 178–180, 417–430; hr ~lines 462–463, 706–717; de ~lines 749–750, 995–1007)

- [ ] **Step 1: Update English values**

In `lib/i18n.ts`, find the `en` object and update these five fields:

```ts
// en — around line 171
joinWaitlistShort: "Try the demo",

// en — around line 179
heroPrimaryCta: "Try the demo",

// en — waitlist object, around line 417
waitlist: {
  title: "Try the demo.",
  description:
    "See Calisto in action — no sign-up needed. Explore the event view as an organizer or guest.",
  buttonIdle: "Try the demo",
  // leave all other fields exactly as-is
  discount: "The first 10 people on the waiting list get 20% off any paid plan (Standard, Plus, Premium, or Max).",
  submitted: "You're on the list—we'll be in touch.",
  submitFailed: "Could not join the waitlist right now. Please try again in a moment.",
  inputLabel: "Email",
  inputPlaceholder: "you@example.com",
  invalidEmail: "Enter a valid email address.",
  buttonBusy: "Joining...",
  note: "Discount details and eligibility may be updated before launch. No spam—unsubscribe anytime once we send real emails.",
},
```

- [ ] **Step 2: Update Croatian values**

In `lib/i18n.ts`, find the `hr` object and update the same five fields:

```ts
// hr — joinWaitlistShort (around line 462)
joinWaitlistShort: "Isprobaj demo",

// hr — heroPrimaryCta (around line 470)
heroPrimaryCta: "Isprobaj demo",

// hr — waitlist object (around line 706)
waitlist: {
  title: "Isprobaj demo.",
  description:
    "Vidi Calisto u akciji — bez registracije. Istraži prikaz događaja kao organizator ili gost.",
  buttonIdle: "Isprobaj demo",
  // leave all other fields exactly as-is
  discount: "Prvih 10 na listi dobiva 20% popusta na bilo koji plaćeni paket (Standard, Plus, Premium ili Max).",
  submitted: "Na listi si — javimo ti se uskoro.",
  submitFailed: "Trenutno se ne možeš prijaviti na listu čekanja. Pokušaj ponovno za trenutak.",
  inputLabel: "Email",
  inputPlaceholder: "ti@primjer.com",
  invalidEmail: "Unesi valjanu email adresu.",
  buttonBusy: "Prijava...",
  note: "Detalji popusta i uvjeti mogu se promijeniti prije lansiranja. Bez spama — odjava je uvijek moguća.",
},
```

- [ ] **Step 3: Update German values**

In `lib/i18n.ts`, find the `de` object and update the same five fields:

```ts
// de — joinWaitlistShort (around line 749)
joinWaitlistShort: "Demo ausprobieren",

// de — heroPrimaryCta (around line 757)
heroPrimaryCta: "Demo ausprobieren",

// de — waitlist object (around line 995)
waitlist: {
  title: "Demo ausprobieren.",
  description:
    "Erlebe Calisto in Aktion — keine Anmeldung nötig. Erkunde die Eventansicht als Organisator oder Gast.",
  buttonIdle: "Demo ausprobieren",
  // leave all other fields exactly as-is
  discount: "Die ersten 10 Personen auf der Warteliste erhalten 20% Rabatt auf jeden bezahlten Tarif (Standard, Plus, Premium oder Max).",
  submitted: "Du bist auf der Liste – wir melden uns bald.",
  submitFailed: "Ein Eintrag in die Warteliste ist gerade nicht möglich. Bitte versuche es gleich noch einmal.",
  inputLabel: "E-Mail",
  inputPlaceholder: "du@beispiel.de",
  invalidEmail: "Bitte gib eine gültige E-Mail-Adresse ein.",
  buttonBusy: "Wird eingetragen...",
  note: "Rabattdetails und Teilnahmebedingungen können vor dem Launch angepasst werden. Kein Spam.",
},
```

- [ ] **Step 4: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```

Expected: no errors. If type errors appear, check that all `WaitlistCopy` fields are still present.

- [ ] **Step 5: Commit**

```bash
git add lib/i18n.ts
git commit -m "i18n: update stale copy for heroPrimaryCta, joinWaitlistShort, waitlist.*"
```

---

### Task 2: Re-wire Hero.tsx

**Files:**
- Modify: `components/Hero.tsx` (line ~68)

- [ ] **Step 1: Replace hardcoded string**

In `components/Hero.tsx`, find the primary CTA `<a>` block (around line 51–70) and change the hardcoded label:

```tsx
// Before
>
  Try the demo
  <span aria-hidden>→</span>
</a>

// After
>
  {copy.heroPrimaryCta}
  <span aria-hidden>→</span>
</a>
```

- [ ] **Step 2: Verify no TypeScript errors**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add components/Hero.tsx
git commit -m "feat: use i18n copy.heroPrimaryCta in Hero CTA"
```

---

### Task 3: Re-wire SiteHeader.tsx

**Files:**
- Modify: `components/SiteHeader.tsx` (lines ~57, ~74)

- [ ] **Step 1: Replace hardcoded strings on both buttons**

In `components/SiteHeader.tsx`, there are two `<a href="/demo">` buttons — desktop (hidden on mobile) and mobile (hidden on desktop). Replace the hardcoded label in each:

```tsx
// Desktop button — before
>
  Try the demo
  <span aria-hidden style={{ transition: "transform 300ms" }}>→</span>
</a>

// Desktop button — after
>
  {copy.joinWaitlistShort}
  <span aria-hidden style={{ transition: "transform 300ms" }}>→</span>
</a>

// Mobile button — before
>
  Try the demo
</a>

// Mobile button — after
>
  {copy.joinWaitlistShort}
</a>
```

- [ ] **Step 2: Verify no TypeScript errors**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add components/SiteHeader.tsx
git commit -m "feat: use i18n copy.joinWaitlistShort in SiteHeader CTAs"
```

---

### Task 4: Re-wire WaitlistForm.tsx

**Files:**
- Modify: `components/WaitlistForm.tsx` (lines ~48, ~61, ~93)

- [ ] **Step 1: Wire up the three visible strings**

In `components/WaitlistForm.tsx`, the component receives `copy: LandingCopy["waitlist"]` but currently renders hardcoded strings. Replace each one:

```tsx
// Heading — before
<h2 ...>
  Try the demo.
</h2>

// Heading — after
<h2 ...>
  {copy.title}
</h2>

// Body paragraph — before
<p ...>
  See Calisto in action — no sign-up needed. Explore the event view as an organizer or guest.
</p>

// Body paragraph — after
<p ...>
  {copy.description}
</p>

// Button label — before
>
  Try the demo
  <span aria-hidden>→</span>
</Link>

// Button label — after
>
  {copy.buttonIdle}
  <span aria-hidden>→</span>
</Link>
```

- [ ] **Step 2: Verify no TypeScript errors**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add components/WaitlistForm.tsx
git commit -m "feat: wire WaitlistForm to use i18n copy for title, description, button"
```

---

### Task 5: Smoke-test all three locales

- [ ] **Step 1: Start dev server**

```bash
npm run dev
```

- [ ] **Step 2: Check English**

Open `http://localhost:3000/en` in a browser. Verify:
- Hero primary CTA reads "Try the demo"
- Header CTA reads "Try the demo"
- Bottom "Try the demo." section shows English text

- [ ] **Step 3: Check Croatian**

Open `http://localhost:3000/hr`. Verify:
- Hero primary CTA reads "Isprobaj demo"
- Header CTA reads "Isprobaj demo"
- Bottom section reads "Isprobaj demo." with Croatian description

- [ ] **Step 4: Check German**

Open `http://localhost:3000/de`. Verify:
- Hero primary CTA reads "Demo ausprobieren"
- Header CTA reads "Demo ausprobieren"
- Bottom section reads "Demo ausprobieren." with German description
