# Calisto Landing Page — "Celebration Album" Full Redesign Spec

**Approved aesthetic:** Playful & Celebratory (Option C)  
**Aurora presence:** Prominent throughout — persistent guide (Option B)  
**Palette:** Purple-led with amber/gold and coral accents (Option A)  
**Typography:** SF Pro with heavy weight contrast  
**Structure:** Restyle + restructure with new design-only sections (Option C)  
**Direction chosen:** Approach A — "Celebration Album"

---

## 1. Design System

### Color Tokens (additions/changes to `globals.css`)

```css
--primary:        #b453c9   /* purple — brand, CTAs */
--primary-dark:   #7c2d9e   /* deep purple — dark section accents */
--primary-tint:   #ede4f5   /* existing */
--amber:          #f59e0b   /* gold/amber — highlight color, warm CTAs */
--coral:          #f97316   /* coral/orange — hover accents, Aurora quote bg */
--cream:          #fdf6ec   /* warm off-white — alternate section bg */
--ink:            #1a0a2e   /* near-black with purple tint — hero/footer bg */
--warm-surface:   #fdf8f0   /* existing */
--background:     #fafaf8   /* existing */
```

### Typography

All SF Pro (already in font stack). Rules:
- **Display headings** (Hero h1, Aurora quote): `font-weight: 900`, `font-size: clamp(3rem, 8vw, 5.5rem)`, `letter-spacing: -0.04em`, `line-height: 1.05`
- **Section headings** (h2): `font-weight: 800`, `text-4xl–text-5xl`, `tracking-tight`
- **Sub-headings** (h3, card titles): `font-weight: 700`, `text-lg–text-xl`
- **Body**: `font-weight: 400`, `leading-relaxed`
- **Labels/badges**: `font-weight: 700`, `uppercase`, `tracking-widest`, `text-xs`

### Global Design Details

- **Confetti dots**: Scattered `aria-hidden` absolutely-positioned circles in primary/amber/coral at various sizes and opacities — used in hero and Aurora quote sections
- **Section rhythm**: Alternates ink → cream → white → deep-purple → cream → white → coral-gradient → warm-surface → ink. No two adjacent sections share the same bg.
- **Card radius**: `rounded-[24px]` or `rounded-[28px]` throughout (up from `rounded-2xl`)
- **Shadows**: Color-tinted (`shadow-[0_8px_32px_rgba(180,83,201,0.15)]` for primary cards, `shadow-[0_8px_32px_rgba(245,158,11,0.2)]` for amber CTAs)
- **Buttons**: Pill shape (`rounded-full`), heavier padding (`px-8 py-4`), colored drop shadows
- **Section dividers**: No hard borders between sections — bg color change alone creates separation

---

## 2. Section-by-Section Spec

### 2.1 SiteHeader

**Background**: `bg-ink/90 backdrop-blur-md` (dark frosted glass — matches hero)  
**Logo**: Calisto icon + split wordmark ("Cal" in amber, "isto" in white)  
**Nav links**: White text, coral underline on hover (2px, slides in from left)  
**CTA button**: Amber bg (`bg-amber`), ink text, pill shape, amber shadow  
**Mobile**: Same dark glass, hamburger → same amber CTA  

**Files**: `components/SiteHeader.tsx`

---

### 2.2 Hero

**Background**: `bg-ink` (`#1a0a2e`) — full dark  
**Confetti**: 12–16 absolutely-positioned `aria-hidden` circles/dots in primary, amber, coral at random positions — CSS `animate-pulse` with varying delays  
**Layout**: Two-column on lg — text left, Aurora right  

**Left column**:
- Small label badge: amber pill — "Meet Aurora ✨"
- h1: Display weight, white, huge (`clamp(2.8rem, 6vw, 5rem)`), 2–3 lines
- Body: `text-zinc-300`, `text-lg`, max-w-xl
- CTAs: Primary = amber pill button with amber shadow; Secondary = white/10 ghost pill button

**Right column**:
- Aurora mascot image (`/brand/mascot.png`) — no frame, just the image
- Speech bubble above Aurora: white bg, primary text, `copy.heroIntro`
- Decorative: faint concentric ring circles behind Aurora in primary/20 opacity

**Files**: `components/Hero.tsx`

---

### 2.3 ✨ PhotoMarquee (NEW COMPONENT)

**Purpose**: Full-width auto-scrolling strip of app screenshots — visual proof that the app works  
**Background**: Seamless continuation — thin strip between Hero and StatBar  
**Implementation**: Two rows of rounded screenshot cards scrolling in opposite directions (row 1 left-to-right, row 2 right-to-left) — CSS `@keyframes marquee` with `translateX`. Cards: `rounded-2xl`, subtle shadow, ~140px tall, auto width.  
**Content**: Uses the 3 existing screenshots (`p1.jpeg`, `p2.jpeg`, `p3.jpeg`) duplicated for seamless loop  
**A11y**: `aria-hidden` on the entire marquee, `prefers-reduced-motion` stops animation  

**Files**: `components/PhotoMarquee.tsx` (new), `app/globals.css` (marquee keyframes)

---

### 2.4 ✨ StatBar (NEW COMPONENT)

**Purpose**: Social proof / scale — 3 big numbers that anchor the value proposition  
**Background**: `bg-primary-dark` (`#7c2d9e`) — deep purple strip  
**Layout**: 3 columns, centered, `py-12`  

**Stats**:
1. `50+` guests — "on the Free plan alone"
2. `100 GB` — "max storage available"  
3. `3` steps — "from invite to shared gallery"

**Styling**:
- Number: `font-weight: 900`, `text-5xl`, amber color (`text-amber-400`)
- Label: `text-sm`, `text-purple-200`, `uppercase tracking-widest`
- Dividers: 1px white/10 vertical lines between stats on desktop

**Files**: `components/StatBar.tsx` (new)

---

### 2.5 FeatureGrid

**Background**: `bg-cream` (`#fdf6ec`)  
**Header**: h2 left-aligned, large. Aurora image on the right with speech bubble (`copy.featuresAuroraBubble`)  
**Cards**: `rounded-[24px]`, white bg, left colored border (4px) — each card gets a different accent color cycling through: primary, amber, coral, primary, amber, coral  
**Card content**: emoji icon in a colored pill (matching border color), h3, description  
**Hover**: card lifts (`hover:shadow-xl hover:-translate-y-1`), border color brightens  

**Files**: `components/FeatureGrid.tsx`

---

### 2.6 HowItWorks

**Background**: `bg-[var(--primary-dark)]` (deep purple) — inverted section  
**Text colors**: White headings, `text-purple-200` body  
**Step circles**: Amber bg, ink text — contrasts sharply against purple bg  
**Connector**: Dashed white/30 line (existing pattern, re-colored)  
**Mobile vertical connector**: Same white/30  

**Files**: `components/HowItWorks.tsx`

---

### 2.7 PlanCards

**Background**: `bg-cream`  
**Header + Aurora**: Same layout — speech bubble + aurora_planning.png  
**Cards**: Larger radius `rounded-[28px]`, more padding  
**Popular card (premium)**: Amber gradient header (`from-amber-400 to-orange-400`) instead of purple — makes it stand out even more, ink text on amber  
**Other cards**: White bg, subtle amber/primary tinted shadows  
**Footnote**: Styled info box (unchanged logic)  

**Files**: `components/PlanCards.tsx`

---

### 2.8 Lifecycle

**Background**: `bg-white`  
**Timeline**: Existing `.lifecycle-rule` / `.lifecycle-dot` CSS — no structural change  
**Visual refresh**: Dot color → amber, connector line → amber-to-transparent gradient  
**Heading**: Larger, heavier weight  

**Files**: `components/Lifecycle.tsx`, `app/globals.css` (dot color override via class)

---

### 2.9 ✨ AuroraQuote (NEW COMPONENT)

**Purpose**: A full-width Aurora personality moment — breaks up the page with warmth and character  
**Background**: Diagonal gradient `from-coral/20 via-amber/10 to-primary-tint/30` — warm celebratory feel  
**Layout**: Centered, `max-w-3xl`, `py-20`  

**Content**:
- Large decorative `"` quotation mark in amber (aria-hidden), `text-[120px]`, positioned top-left
- Italic quote text: `copy.heroIntro` or a dedicated `auroraQuote` copy key — `text-2xl font-semibold italic text-zinc-800`
- Aurora portrait (`/brand/aurora-photo.png`), circular, 64px, below the quote
- Name tag: "Aurora, your Calisto guide" in small text

**Note on copy**: Add `auroraQuote` key to `LandingCopy` type and all 3 locales. Value:  
- en: "Every memory deserves a home. I'll make sure yours is beautiful, organized, and yours forever."
- hr: "Svaka uspomena zaslužuje dom. Pobrinut ću se da bude lijepa, organizirana i zauvijek vaša."
- de: "Jede Erinnerung verdient ein Zuhause. Ich sorge dafür, dass deines schön, geordnet und für immer deins ist."

**Files**: `components/AuroraQuote.tsx` (new), `lib/i18n.ts`

---

### 2.10 FutureRoadmap

**Background**: `bg-[var(--warm-surface)]`  
**Cards**: Existing status pill layout  
**Visual refresh**: Card hover gets a colored left-border in the pill's color (violet for Roadmap, blue for Planned, amber for Idea)  

**Files**: `components/FutureRoadmap.tsx`

---

### 2.11 WaitlistForm

**Background**: `bg-ink` (`#1a0a2e`) — bookends the page with the hero  
**Card**: `bg-white/5 border border-white/10` — glassmorphism on dark  
**Heading**: White, display weight  
**Description**: `text-zinc-300`  
**Discount badge**: Amber bg (`bg-amber-400/20 border-amber-400/30 text-amber-200`)  
**Input**: `bg-white/10 border-white/20` dark input, white text, amber focus ring  
**Button**: Amber pill button with amber shadow (matches hero CTA)  
**Aurora panel**: Left column on desktop — Aurora on the dark bg with primary-tint gradient behind her  

**Files**: `components/WaitlistForm.tsx`

---

### 2.12 SiteFooter

**Background**: `bg-ink`  
**Logo**: Amber "Cal" + white "isto"  
**Footer text**: `text-zinc-400`  
**Copyright**: `text-zinc-600`  
**Separator**: 1px `border-white/10` above copyright  

**Files**: `components/SiteFooter.tsx`

---

### 2.13 Page Assembly

**File**: `app/[locale]/page.tsx`  
**Change**: Import and add `PhotoMarquee`, `StatBar`, `AuroraQuote` in the correct positions:

```
SiteHeader
Hero
PhotoMarquee          ← new, after Hero
StatBar               ← new, after PhotoMarquee
FeatureGrid
HowItWorks
PlanCards
Lifecycle
AuroraQuote           ← new, after Lifecycle
FutureRoadmap
WaitlistForm
LanguageSelectorBar
SiteFooter
```

---

## 3. New CSS Required (globals.css)

```css
/* Marquee animation */
@keyframes marqueeLeft {
  from { transform: translateX(0); }
  to   { transform: translateX(-50%); }
}
@keyframes marqueeRight {
  from { transform: translateX(-50%); }
  to   { transform: translateX(0); }
}
.marquee-left  { animation: marqueeLeft  28s linear infinite; }
.marquee-right { animation: marqueeRight 34s linear infinite; }

@media (prefers-reduced-motion: reduce) {
  .marquee-left, .marquee-right { animation: none; }
}
```

---

## 4. i18n Changes

Add to `LandingCopy` type and all 3 locales:
- `auroraQuote: string` — used in `AuroraQuote` component

---

## 5. Files Changed/Created

| File | Action |
|------|--------|
| `app/globals.css` | Add new tokens, marquee keyframes, lifecycle dot color override |
| `app/[locale]/page.tsx` | Add 3 new component imports + placement |
| `lib/i18n.ts` | Add `auroraQuote` to type + all 3 locales |
| `components/SiteHeader.tsx` | Dark glass, amber CTA, coral nav hover |
| `components/Hero.tsx` | Dark ink bg, confetti dots, amber CTAs, large display type |
| `components/PhotoMarquee.tsx` | **NEW** — dual-row scrolling screenshot strip |
| `components/StatBar.tsx` | **NEW** — 3-stat amber-on-purple strip |
| `components/FeatureGrid.tsx` | Cream bg, colored card borders, hover lift |
| `components/HowItWorks.tsx` | Deep purple inverted bg, amber step circles |
| `components/PlanCards.tsx` | Cream bg, amber gradient on popular card |
| `components/Lifecycle.tsx` | White bg, amber timeline dot override |
| `components/AuroraQuote.tsx` | **NEW** — full-width warm quote panel |
| `components/FutureRoadmap.tsx` | Colored left-border on hover |
| `components/WaitlistForm.tsx` | Ink bg, glassmorphism card, amber CTAs |
| `components/SiteFooter.tsx` | Ink bg, amber/white wordmark |

---

## 6. Out of Scope

- AppPreviewWindow (just redesigned — keep as-is)
- LanguageSelectorPopup / LanguageSelectorBar (functional, not part of redesign)
- API route, Supabase logic
- i18n copy beyond `auroraQuote` addition
