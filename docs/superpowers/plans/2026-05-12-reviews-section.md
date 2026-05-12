# Reviews Section Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the `WaitlistForm` section with a localized `Reviews` section showing 6 made-up testimonials per locale (en, hr, de) in a 3-column card grid.

**Architecture:** New `components/Reviews.tsx` owns all data as a `Record<Locale, ReviewEntry[]>` const — no i18n.ts changes. The component receives a `locale` prop and picks the correct set. Page wiring removes `WaitlistForm` and adds `Reviews` in the same slot.

**Tech Stack:** React, TypeScript, CSS-in-JSX (existing pattern), Next.js Image not needed

---

### Task 1: Create `components/Reviews.tsx`

**Files:**
- Create: `components/Reviews.tsx`

This task has no unit-testable pure logic — all content is static data and JSX. Verification is TypeScript compilation.

- [ ] **Step 1: Create `components/Reviews.tsx` with the full implementation**

```tsx
import type { Locale } from "@/lib/i18n";

type ReviewEntry = {
  name: string;
  role: string;
  quote: string;
  initials: string;
  accentColor: string;
};

type ReviewsProps = { locale: Locale };

const REVIEWS: Record<Locale, ReviewEntry[]> = {
  en: [
    {
      name: "Maja K.",
      role: "Bride",
      quote: "Calisto made our wedding day unforgettable. Every guest uploaded their photos instantly and we had a beautiful gallery ready by the next morning.",
      initials: "MK",
      accentColor: "#86A9F9",
    },
    {
      name: "Tomás R.",
      role: "Birthday party host",
      quote: "I hosted a 50th birthday party and couldn't believe how smooth everything was. No app downloads, just a QR code and everyone was sharing within seconds.",
      initials: "TR",
      accentColor: "#9FC58D",
    },
    {
      name: "Ana V.",
      role: "Corporate event planner",
      quote: "We used Calisto for our company retreat and it was a hit. The organizer view is clean and managing uploads in real time was completely effortless.",
      initials: "AV",
      accentColor: "#B89BC4",
    },
    {
      name: "Leon S.",
      role: "Family reunion organizer",
      quote: "Our family photos are finally all in one place. Calisto handled 200 guests and over 1,500 photos without a single hiccup.",
      initials: "LS",
      accentColor: "#E6A760",
    },
    {
      name: "Sara F.",
      role: "Hen party organizer",
      quote: "The hen party would have been chaos without Calisto. Everyone could see each other's photos as they uploaded — it felt like magic.",
      initials: "SF",
      accentColor: "#E97AA4",
    },
    {
      name: "Dario M.",
      role: "Wedding photographer",
      quote: "As a photographer I recommend Calisto to every couple. Guests love it and it takes the pressure off me to capture every candid moment.",
      initials: "DM",
      accentColor: "#86A9F9",
    },
  ],
  hr: [
    {
      name: "Maja K.",
      role: "Mlada",
      quote: "Calisto je naš vjenčani dan učinio nezaboravnim. Svaki gost odmah je postavio svoje fotografije i već sljedećeg jutra imali smo prekrasnu galeriju.",
      initials: "MK",
      accentColor: "#86A9F9",
    },
    {
      name: "Tomás R.",
      role: "Domaćin rodjendanske proslave",
      quote: "Organizirao sam proslavu 50. rodjendana i nisam mogao vjerovati koliko je sve bilo glatko. Bez preuzimanja aplikacije — samo QR kod i svi su dijelili fotografije.",
      initials: "TR",
      accentColor: "#9FC58D",
    },
    {
      name: "Ana V.",
      role: "Organizatorica poslovnih dogadjaja",
      quote: "Koristili smo Calisto za team building i bio je hit. Pregled organizatora je pregledan, a upravljanje prijenosima u stvarnom vremenu bilo je bez napora.",
      initials: "AV",
      accentColor: "#B89BC4",
    },
    {
      name: "Leon S.",
      role: "Organizator obiteljske proslave",
      quote: "Naše obiteljske fotografije konačno su na jednom mjestu. Calisto je bez problema obradio 200 gostiju i više od 1.500 fotografija.",
      initials: "LS",
      accentColor: "#E6A760",
    },
    {
      name: "Sara F.",
      role: "Organizatorica djevojačke večeri",
      quote: "Djevojačka večer bila bi kaos bez Calista. Svi su mogli vidjeti tuđe fotografije dok su se postavljale — izgledalo je čarobno.",
      initials: "SF",
      accentColor: "#E97AA4",
    },
    {
      name: "Dario M.",
      role: "Vjenčani fotograf",
      quote: "Kao fotograf, preporučujem Calisto svakom paru. Gosti ga vole, a meni skida pritisak da uhvatim svaki spontani trenutak.",
      initials: "DM",
      accentColor: "#86A9F9",
    },
  ],
  de: [
    {
      name: "Maja K.",
      role: "Braut",
      quote: "Calisto hat unseren Hochzeitstag unvergesslich gemacht. Jeder Gast lud sofort seine Fotos hoch und am nächsten Morgen hatten wir eine wunderschöne Galerie.",
      initials: "MK",
      accentColor: "#86A9F9",
    },
    {
      name: "Tomás R.",
      role: "Gastgeber einer Geburtstagsfeier",
      quote: "Ich habe eine 50. Geburtstagsfeier veranstaltet und konnte nicht glauben, wie reibungslos alles lief. Kein App-Download — einfach ein QR-Code und alle teilten sofort.",
      initials: "TR",
      accentColor: "#9FC58D",
    },
    {
      name: "Ana V.",
      role: "Unternehmensveranstalterin",
      quote: "Wir haben Calisto für unser Firmen-Retreat genutzt und es war ein Erfolg. Die Organisatorenansicht ist übersichtlich und Echtzeit-Uploads waren völlig mühelos.",
      initials: "AV",
      accentColor: "#B89BC4",
    },
    {
      name: "Leon S.",
      role: "Familienfeier-Organisator",
      quote: "Unsere Familienfotos sind endlich an einem Ort. Calisto hat 200 Gäste und über 1.500 Fotos problemlos bewältigt.",
      initials: "LS",
      accentColor: "#E6A760",
    },
    {
      name: "Sara F.",
      role: "Junggesellinnenabschied-Organisatorin",
      quote: "Der Junggesellinnenabschied wäre ohne Calisto chaotisch gewesen. Alle konnten die Fotos der anderen beim Hochladen sehen — wie Magie.",
      initials: "SF",
      accentColor: "#E97AA4",
    },
    {
      name: "Dario M.",
      role: "Hochzeitsfotograf",
      quote: "Als Fotograf empfehle ich Calisto jedem Paar. Die Gäste lieben es und es nimmt mir den Druck, jeden spontanen Moment selbst einzufangen.",
      initials: "DM",
      accentColor: "#86A9F9",
    },
  ],
};

const SECTION_COPY: Record<Locale, { label: string; title: string }> = {
  en: { label: "6 · Reviews", title: "What organizers say" },
  hr: { label: "6 · Recenzije", title: "Što kažu organizatori" },
  de: { label: "6 · Bewertungen", title: "Was Organisatoren sagen" },
};

function StarIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden
      style={{ width: 13, height: 13 }}
    >
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  );
}

export function Reviews({ locale }: ReviewsProps) {
  const reviews = REVIEWS[locale];
  const { label, title } = SECTION_COPY[locale];

  return (
    <section
      id="reviews"
      style={{
        borderTop: "1px solid var(--hair)",
        padding: "120px 0",
        position: "relative",
        zIndex: 2,
      }}
    >
      <div className="mx-auto" style={{ maxWidth: 1280, padding: "0 32px" }}>
        {/* Header */}
        <div style={{ marginBottom: 56 }}>
          <div
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "10.5px",
              letterSpacing: "0.28em",
              textTransform: "uppercase",
              color: "var(--gold)",
              marginBottom: 14,
            }}
          >
            {label}
          </div>
          <h2
            style={{
              fontFamily: "var(--font-display)",
              fontWeight: 400,
              fontSize: "clamp(36px, 5vw, 64px)",
              lineHeight: 1.02,
              letterSpacing: "-0.02em",
              color: "var(--cream)",
              margin: 0,
            }}
          >
            {title}
          </h2>
        </div>

        {/* Card grid */}
        <div className="reviews-grid">
          {reviews.map((review) => (
            <article
              key={review.name + review.role}
              style={{
                background: `linear-gradient(165deg, ${review.accentColor}1E 0%, ${review.accentColor}08 50%, transparent 100%), var(--ink)`,
                border: `1px solid ${review.accentColor}4D`,
                borderRadius: 16,
                padding: 22,
                display: "flex",
                flexDirection: "column",
                gap: 14,
              }}
            >
              {/* Avatar + name */}
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div
                  aria-hidden
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: "50%",
                    background: `${review.accentColor}26`,
                    border: `1px solid ${review.accentColor}4D`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: review.accentColor,
                    fontFamily: "var(--font-display)",
                    fontStyle: "italic",
                    fontSize: 14,
                    fontWeight: 400,
                    flexShrink: 0,
                  }}
                >
                  {review.initials}
                </div>
                <div>
                  <div
                    style={{
                      fontFamily: "var(--font-sans)",
                      fontWeight: 600,
                      fontSize: 14,
                      color: "var(--cream)",
                      lineHeight: 1.2,
                    }}
                  >
                    {review.name}
                  </div>
                  <div
                    style={{
                      fontFamily: "var(--font-mono)",
                      fontSize: 10,
                      letterSpacing: "0.09em",
                      textTransform: "uppercase",
                      color: "var(--cream-4, #6E6758)",
                      marginTop: 2,
                    }}
                  >
                    {review.role}
                  </div>
                </div>
              </div>

              {/* 5 stars */}
              <div
                aria-label="5 out of 5 stars"
                style={{ display: "flex", gap: 3, color: "var(--gold, #E6A760)" }}
              >
                {Array.from({ length: 5 }).map((_, i) => (
                  <StarIcon key={i} />
                ))}
              </div>

              {/* Quote */}
              <blockquote
                style={{
                  fontFamily: "var(--font-display)",
                  fontStyle: "italic",
                  fontWeight: 400,
                  fontSize: "clamp(15px, 2vw, 17px)",
                  lineHeight: 1.5,
                  color: "var(--cream)",
                  margin: 0,
                }}
              >
                {review.quote}
              </blockquote>
            </article>
          ))}
        </div>
      </div>

      <style>{`
        .reviews-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 18px;
        }
        @media (max-width: 900px) {
          .reviews-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }
        @media (max-width: 580px) {
          .reviews-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </section>
  );
}
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
npx tsc --noEmit 2>&1 | grep -v "admin-tabs\|layout.guard\|delete/route" | head -20
```

Expected: no new errors related to `Reviews.tsx` (pre-existing unrelated errors in test files are acceptable).

- [ ] **Step 3: Commit**

```bash
git add components/Reviews.tsx
git commit -m "feat(reviews): add Reviews component with en/hr/de content"
```

---

### Task 2: Wire `Reviews` into the page, remove `WaitlistForm`

**Files:**
- Modify: `app/[locale]/page.tsx`

- [ ] **Step 1: Update the page imports and JSX**

Open `app/[locale]/page.tsx`. Make these two changes:

**Remove** this import line:
```typescript
import { WaitlistForm } from "@/components/WaitlistForm";
```

**Add** this import line (alongside the other component imports):
```typescript
import { Reviews } from "@/components/Reviews";
```

**Remove** this JSX line:
```tsx
<WaitlistForm copy={copy.waitlist} mascotAlt={copy.auroraMascotAlt} locale={locale as Locale} />
```

**Add** this JSX line in its place:
```tsx
<Reviews locale={locale as Locale} />
```

The final `<main>` block should look like:

```tsx
<main className="flex-1">
  <Hero copy={copy} />
  <SocialProof copy={copy} />
  <AppPreviewWindow copy={copy} />
  <FeatureGrid copy={copy} />
  <HowItWorks copy={copy} />
  <PlanCards copy={copy} />
  <AuroraQuote copy={copy} />
  <FAQ copy={copy} />
  <Reviews locale={locale as Locale} />
</main>
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
npx tsc --noEmit 2>&1 | grep -v "admin-tabs\|layout.guard\|delete/route" | head -20
```

Expected: no new errors.

- [ ] **Step 3: Run full test suite**

```bash
npx vitest run
```

Expected: all 139 tests pass.

- [ ] **Step 4: Commit**

```bash
git add app/\[locale\]/page.tsx
git commit -m "feat(reviews): replace WaitlistForm with Reviews on landing page"
```

---

### Task 3: Visual verification

No code changes — browser verification pass.

- [ ] **Step 1: Start the dev server**

```bash
npm run dev
```

- [ ] **Step 2: English locale**

Open `http://localhost:3000/en`. Scroll to the bottom. Confirm:
- Reviews section appears where WaitlistForm was (before the footer)
- Section label reads `6 · Reviews`, h2 reads `What organizers say`
- 6 cards in a 3-column grid
- Each card shows: colored initials circle, name, role in mono uppercase, 5 gold stars, italic quote
- WaitlistForm is gone

- [ ] **Step 3: Croatian locale**

Open `http://localhost:3000/hr`. Confirm:
- Section label reads `6 · Recenzije`, h2 reads `Što kažu organizatori`
- All 6 quotes and roles are in Croatian

- [ ] **Step 4: German locale**

Open `http://localhost:3000/de`. Confirm:
- Section label reads `6 · Bewertungen`, h2 reads `Was Organisatoren sagen`
- All 6 quotes and roles are in German

- [ ] **Step 5: Responsive check**

Resize browser to 800px wide → 2-column grid. Resize to 500px → 1-column. Confirm no layout breaks.
