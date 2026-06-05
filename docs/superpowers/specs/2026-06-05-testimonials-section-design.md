# Testimonials Section Design

**Date:** 2026-06-05
**Scope:** Add a 3-quote testimonials strip to the landing page between "How it works" and pricing.

---

## Goal

Build social proof at the trust-before-purchase moment — right before visitors see pricing, a human voice confirms the product works for real events.

---

## Component

**New file:** `components/Testimonials.tsx` — server component (no interactivity needed)

**Placement in `app/[locale]/page.tsx`:**
```
<HowItWorks copy={copy} />
<Testimonials copy={copy} />   ← insert here
<PlanCards copy={copy} />
```

**Props:** `{ copy: LandingCopy }` — same pattern as all other landing components.

---

## Copy

New keys added to `LandingCopy` type and all 3 locales in `lib/i18n.ts`:

```ts
testimonialsSectionLabel: string;
testimonialsTitle: string;
testimonials: {
  quote: string;
  name: string;
  event: string;
}[];
```

### English (en)

```ts
testimonialsSectionLabel: "What people say",
testimonialsTitle: "Trusted at real events",
testimonials: [
  {
    quote: "We had 90 guests uploading all night. By midnight the album had 340 photos and nobody had to share a single WhatsApp message.",
    name: "Ana & Marko",
    event: "Wedding, Zagreb",
  },
  {
    quote: "Set it up in under a minute. My parents were uploading from their phones without asking me for help once.",
    name: "Luka T.",
    event: "Family reunion",
  },
  {
    quote: "The QR code on the table was the best idea. Everyone scanned it, even my grandmother.",
    name: "Sara M.",
    event: "Birthday party",
  },
],
```

### Croatian (hr)

```ts
testimonialsSectionLabel: "Što kažu korisnici",
testimonialsTitle: "Provjereno na pravim događajima",
testimonials: [
  {
    quote: "Imali smo 90 gostiju koji su cijelu noć učitavali slike. Do ponoći je album imao 340 fotografija i nitko nije morao slati niti jednu WhatsApp poruku.",
    name: "Ana & Marko",
    event: "Vjenčanje, Zagreb",
  },
  {
    quote: "Postavio sam sve za manje od minute. Roditelji su učitavali s mobitela bez da su me jednom pitali za pomoć.",
    name: "Luka T.",
    event: "Obiteljsko okupljanje",
  },
  {
    quote: "QR kod na stolu bila je izvrsna ideja. Svi su ga skenirali, čak i moja baka.",
    name: "Sara M.",
    event: "Rođendanska proslava",
  },
],
```

### German (de)

```ts
testimonialsSectionLabel: "Was andere sagen",
testimonialsTitle: "Bewährt bei echten Events",
testimonials: [
  {
    quote: "Wir hatten 90 Gäste, die die ganze Nacht hochgeladen haben. Um Mitternacht hatte das Album 340 Fotos – ohne eine einzige WhatsApp-Nachricht.",
    name: "Ana & Marko",
    event: "Hochzeit, Zagreb",
  },
  {
    quote: "In unter einer Minute eingerichtet. Meine Eltern haben vom Handy hochgeladen, ohne mich einmal um Hilfe zu bitten.",
    name: "Luka T.",
    event: "Familientreffen",
  },
  {
    quote: "Der QR-Code auf dem Tisch war die beste Idee. Alle haben ihn gescannt – sogar meine Oma.",
    name: "Sara M.",
    event: "Geburtstagsfeier",
  },
],
```

---

## Visual Design

Use the `frontend-design` skill during implementation. Design brief:

- **Layout:** 3-column grid (stacks to 1 column on mobile), matching the existing grid language
- **Quote text:** Italic serif (`var(--font-display)`), medium size, cream color — the dominant visual element
- **Stars:** 5 amber stars (★★★★★) above each quote
- **Name:** `var(--font-sans)`, cream, semi-bold
- **Event:** `var(--font-mono)`, small, cream-4, uppercase, tracked
- **Card background:** subtle glass/dark treatment consistent with existing plan cards
- **Section header:** same eyebrow + title pattern as FeatureGrid and HowItWorks
- **Animation:** subtle fade-in on scroll (IntersectionObserver), staggered per card

---

## Files Changed

- `components/Testimonials.tsx` — new component
- `lib/i18n.ts` — new copy keys + translations for en, hr, de
- `app/[locale]/page.tsx` — import + render between HowItWorks and PlanCards
