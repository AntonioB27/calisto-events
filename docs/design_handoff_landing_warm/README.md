# Handoff: Calisto — "Create Event" Ad Landing Page (Warm style)

## Overview
This is the page visitors land on after tapping a Calisto social-media ad. Its
single job is **conversion**: get the visitor to create an event right now. The
create-event form sits high on the page; everything else (how-it-works, live
album preview, feature list, pricing) reassures and supports that one action.

Primary CTA: **"Stvori događaj besplatno"** (Create event for free).
Language: Croatian (HR), with an HR / EN / DE switcher in the nav.
Target: **mobile-first**, must also work on desktop (center the 430px column,
or let it grow to a comfortable max-width on larger screens).

## About the Design Files
The files in this bundle are **design references created in HTML/React (via
Babel in the browser)** — prototypes showing the intended look and behavior.
They are **not production code to copy directly.** The task is to **recreate
this design in the Calisto codebase** using its existing environment, component
library, design tokens, and routing/data patterns. If Calisto already has a
button/input/card system, use those primitives and map the values below onto
them rather than re-deriving inline styles.

The React components in `landing-c-themed.jsx` are **theme-driven**; this
handoff is only the **`warm`** theme. Ignore the `midnight` and `light` themes —
the exact warm values are spelled out in **Design Tokens** below so you don't
need to trace the theme object.

## Fidelity
**High-fidelity.** Colors, typography, spacing, and radii are final. Recreate
the UI to match, using the codebase's existing components where they exist.

## Layout (top → bottom)
Single scrolling column, **430px** content width on mobile (max-width container,
centered, on desktop). Section horizontal padding is **24–26px**. Order:

1. **Top nav** — wordmark left, language switcher + "Prijava" link right.
2. **Hero** — review badge → headline → subcopy.
3. **Create-event form card** (the hero action).
4. **"Kako radi"** — 3 numbered steps (the QR flow).
5. **"Album uživo"** — phone mockup of the live shared album. *(Placeholder
   imagery — see Assets. The client is wiring the real QR/album visual.)*
6. **Feature checklist** — 4 ticks on a soft panel.
7. **Pricing** — "Plus" highlighted recommended card + a compact comparison
   list of the other 4 tiers.
8. **Fair-use note** (footer microcopy).
9. **Sticky mobile CTA bar** — pinned to the bottom of the viewport, follows
   scroll on mobile.

## Components

### 1. Top nav
- Row, space-between, padding `18px 24px`, bottom border `1px solid #E0D6C6`.
- **Wordmark** "Calisto." — Playfair Display, italic, 700, 20px, `#221509`.
- Right group (gap 14px):
  - **Language switcher**: pills HR / EN / DE. Active pill bg `#C5922A`, text
    `#1a0f00`; inactive text `rgba(34,21,9,0.42)`, transparent bg. Pill padding
    `4px 9px`, radius 7px, font 10px/700, letter-spacing 0.06em. Default = HR.
  - **"Prijava"** link — DM Sans 13px/600, `#221509`, no underline.

### 2. Hero
- Padding `32px 26px 0`.
- **Review badge** (pill): inline-flex, gap 7px, bg `#FBF1DC`, border
  `1px solid #E8C878`, radius 30px, padding `6px 13px`, margin-bottom 16px.
  - Stars "★★★★★" in `#C5922A`, 12px.
  - Text "4.9 · 12.000+ događaja" — 11.5px/600, `#3A2A18`.
- **Headline** (two lines): "Gosti skeniraju." / "Vi skupljate uspomene." —
  Playfair Display, **italic 700, 36px**, line-height 1.07, `#221509`.
- **Subcopy**: "Jedan QR kod prikuplja sve fotografije i videe s vaše proslave —
  uživo, bez aplikacije, u punoj kvaliteti." — DM Sans 14.5px, `#9A8570`,
  line-height 1.55, max-width 340px, margin-top 14px.

### 3. Create-event form card
- Padding wrapper `24px 22px 0`. Card: bg `#FFFFFF`, radius 20px, padding
  `22px 20px 24px`, border `1px solid #E0D6C6`, shadow
  `0 18px 40px -22px rgba(80,55,20,0.22)`.
- **Fields** (vertical stack, gap 11px — "compact"):
  - Field label: DM Sans 10px/700, uppercase, letter-spacing 0.16em, `#9A8570`,
    margin-bottom 7px.
  - **"Naziv događaja"** — text input, placeholder "npr. Antonio i Matea".
    Input: padding `13px 15px`, bg `#FBF7F1`, border `1.5px solid #E0D6C6`,
    radius 13px, 15.5px, text `#221509`. (Focus border → `#C5922A`.)
  - **"Datum događaja"** — date field, shows "27.04.2026." with a calendar glyph
    (stroke `#C5B7A3`) on the right. Use a native date picker in production.
  - **"Emoji"** — row of 6 selectable emoji buttons (🎉 💍 🎂 🎓 🏖️ 🎊), each
    flex:1, height 42px, radius 11px, border `1.5px solid #E0D6C6`, bg `#FBF7F1`.
    Selected: border `#C5922A`, bg `#FBF1DC`. Default selected = 🎉.
- **Primary CTA** (margin-top 17px): full-width button, radius 14px, padding
  `15px 24px`, bg gradient `linear-gradient(135deg,#7B3FBE 0%,#5B2D8E 100%)`,
  text `#FFFFFF`, DM Sans 14.5px/700, uppercase, letter-spacing 0.07em. Label
  "Stvori događaj besplatno →". Hover: lift `translateY(-1px)` + shadow
  `0 10px 30px rgba(91,45,142,0.30)` (rest shadow `0 5px 16px` same color).
- **Reassurance** under button (margin-top 11px, centered): "Bez kreditne
  kartice · spremno odmah" — 12px, `#9A8570`.

### 4. "Kako radi" (how it works)
- Padding `38px 26px 0`. Centered eyebrow "Kako radi" (label style, `#9A8570`),
  margin-bottom 18px.
- 3 rows, gap 10px. Each row: bg `#FFFFFF`, border `1px solid #E0D6C6`, radius
  14px, padding `13px 15px`, flex align-center, gap 14px.
  - **Number medallion**: 30px circle, bg `#FBF1DC`, border `1px solid #E8C878`,
    Playfair italic 700, 15px, `#C5922A`.
  - **Title** 14.5px/600 `#221509`; **desc** 12.5px `#9A8570`.
  - Steps:
    1. "Stvorite događaj" — "Naziv, datum — i gotovi ste."
    2. "Gosti skeniraju QR" — "Bez aplikacije, bez registracije."
    3. "Uspomene stižu uživo" — "Sve na jednom mjestu, u punoj kvaliteti."

### 5. "Album uživo" (phone mockup)
- Padding `40px 26px 0`, centered. Eyebrow "Album uživo" (label), mb 14px.
- **Phone**: 188px wide, radius 30px, bezel bg `#1d140a`, padding 8px, shadow
  `0 28px 50px -22px rgba(20,12,4,0.5)`. Screen radius 23px, bg `#FBF7F1`.
  - Header bar 30px, bg #fff, bottom border `#E0D6C6`, centered title
    "Antonio i Matea" (Playfair italic 700, 12px).
  - 2-col photo grid, gap 5px, 6 cells (alternating heights 64/50px, radius 8px).
    **Replace with real album photos** in production (see Assets).
- Caption (Playfair italic 14px `#9A8570`, max-width 290px): "Svaka skenirana
  fotografija pojavljuje se u zajedničkom albumu u trenutku."

### 6. Feature checklist
- Padding `36px 26px 0`. Panel: bg `#FBF7F1`, border `1px solid #E0D6C6`,
  radius 18px, padding `20px 22px`, vertical stack gap 13px.
- Each item: 22px circle bg `#5B2D8E` with white check (✓) + text 13.5px `#3A2A18`.
  - "Bez aplikacije — gosti samo skeniraju"
  - "Fotografije i videi u punoj kvaliteti"
  - "Preuzmite cijeli album jednim klikom"
  - "Privatno i samo za vaše goste"

### 7. Pricing
- Padding `42px 26px 0`. Centered header: eyebrow "Planovi · po događaju" +
  H2 "Odaberite veličinu proslave" (Playfair italic 700, 27px, `#221509`).
- **Recommended card (Plus)**: radius 20px, padding `22px 22px 24px`, bg
  `linear-gradient(160deg,#5B2D8E 0%,#45226E 100%)`, white text, shadow
  `0 20px 44px -20px rgba(91,45,142,0.5)`, margin-bottom 12px.
  - "Najpopularnije" badge top-right: bg `#E8C878`, text `#3A2A0A`, 9.5px/800,
    uppercase, letter-spacing 0.1em, padding `4px 9px`, radius 20px.
  - Name "Plus" (Playfair italic 700, 26px); sub "do 200 gostiju"
    (13px, rgba(255,255,255,0.72)).
  - Price "35€" (Playfair 700, 42px) + "/ DOGAĐAJ" (monospace 10px, uppercase,
    letter-spacing 0.08em, rgba(255,255,255,0.72)).
  - Desc "Za srednje proslave i duže liste gostiju" (13px).
  - Button full-width, radius 13px, padding 14px, bg #fff, text `#5B2D8E`,
    DM Sans 14px/700 uppercase — "Odaberi Plus →".
- **Comparison list** (other 4 tiers): white card, border `1px solid #E0D6C6`,
  radius 18px. Each row: padding `15px 18px`, divider `1px solid #E0D6C6`.
  - Left: 32px rounded chip (per-tier tint) holding the tier icon (per-tier ink).
  - Middle: tier name (Playfair italic 700, 16px) + guest line (11.5px `#9A8570`).
  - Right: optional struck-through old price (11px `#C5B7A3`) + price (Playfair
    700, 19px) + chevron (stroke `#C5B7A3`).
  - Tiers & data (see Design Tokens → Plans):
    Free 0€ / do 30 · Standard 15€ / do 80 · Premium 65€ (was 70€) / do 500 ·
    Max 90€ (was 100€) / neograničeno. (Plus is the highlight card above.)

### 8. Fair-use note
- Padding `34px 26px 0`. Playfair italic 11.5px, `#C5B7A3`, centered, lh 1.6:
  "Primjenjuje se fair-use politika: postoji razuman maksimalan limit veličine
  videodatoteke radi sprječavanja zloupotrebe."
- Followed by a 92px spacer so the sticky bar never covers content.

### 9. Sticky mobile CTA bar
- Pinned to bottom of viewport (`position: fixed/sticky` in production; in the
  prototype it's absolute at the bottom of the frame). Full width, padding
  `12px 18px` (+ safe-area inset bottom). bg `rgba(255,255,255,0.92)` +
  `backdrop-filter: blur(10px)`, top border `1px solid #E0D6C6`, shadow
  `0 -6px 20px -8px rgba(20,12,4,0.18)`. Flex, gap 12px.
  - Left text: "Spremno za 30 sekundi" (12px/700 `#221509`) + "Free plan · bez
    kartice" (11px `#9A8570`).
  - Right: compact version of the primary CTA, label "Stvori →", padding
    `13px 20px`, same purple gradient.

## Interactions & Behavior
- **Emoji buttons**: single-select; selected gets gold border + `#FBF1DC` bg.
- **Inputs**: focus state changes border to `#C5922A` (gold). Validate that
  "Naziv događaja" is non-empty before submit.
- **Primary / sticky CTA**: submits the create-event form → creates the event
  and routes to the organizer/album view (wire to existing Calisto create-event
  endpoint). On mobile, the sticky bar's CTA triggers the same submit.
- **"Najpopularnije" / "Odaberi Plus" and comparison rows**: select a plan; the
  chevron rows open the respective plan. Default suggested plan = Plus.
- **Language switcher**: swaps copy locale (HR default). All strings above are HR.
- **Hover** (desktop): primary buttons lift 1px and deepen shadow (0.2s).
- **Responsive**: single column on mobile; on desktop keep the column centered
  (≈430–480px) or expand into a two-column hero (copy + form) if desired — the
  content order above is the source of truth.

## State Management
- `name` (string), `date` (ISO date), `emoji` (string, default "🎉").
- `selectedPlan` (default "plus").
- `lang` (default "HR").
- On submit: POST create-event { name, date, emoji, plan } → redirect to event.
- No data fetching on load (static marketing page) beyond locale strings.

## Design Tokens (warm theme — exact values)

### Colors
| Token | Hex | Use |
|---|---|---|
| Page bg | `#EFE8DD` | page background (cream) |
| Surface | `#FFFFFF` | cards |
| Surface soft | `#FBF7F1` | input bg, soft panels |
| Text | `#221509` | primary text |
| Ink | `#3A2A18` | secondary on-light text |
| Muted | `#9A8570` | subcopy/labels |
| Faint | `#C5B7A3` | hairline text, struck prices, calendar glyph |
| Line | `#E0D6C6` | borders / dividers |
| Gold | `#C5922A` | accents, focus, stars |
| Gold soft | `#E8C878` | badge borders, "recommended" badge |
| Gold tint | `#FBF1DC` | badge bg, medallion bg, selected emoji |
| Purple | `#5B2D8E` | CTA + Plus highlight + checks |
| Purple hi | `#7B3FBE` | CTA gradient top stop |

### Per-plan tokens (chip bg / icon ink / icon name)
- **Free** — tint `#EAF1E6`, chip `#E2EDDB`, ink `#4E7A4A`, icon `leaf`, 0€, "do 30 gostiju"
- **Standard** — chip `#E0E8F6`, ink `#3E5FA6`, icon `star`, 15€, "do 80 gostiju"
- **Plus** — chip `#E9E0F1`, ink `#7A4FA6`, icon `layers`, 35€, "do 200 gostiju" *(highlight card)*
- **Premium** — chip `#F5E6C4`, ink `#B07E25`, icon `diamond`, 65€ (was 70€), "do 500 gostiju"
- **Max** — chip `#F3DBE5`, ink `#B0517A`, icon `spark`, 90€ (was 100€), "neograničeno"

### Typography
- **Display / headings / prices / wordmark**: "Playfair Display", serif —
  **italic, 700** is the signature treatment. Sizes used: 36 (H1), 27 (H2),
  26/24/20/19/16 (plan names & prices), 42 (highlight price).
- **Body / UI / labels**: "DM Sans", sans — 300–700. Sizes: 15.5 (inputs),
  14.5 (subcopy/CTA), 13.5/13/12.5/12/11.5 (supporting), 10 (uppercase labels).
- **Mono accents**: any UI monospace for "/ DOGAĐAJ" tags (10px, uppercase,
  letter-spacing 0.08em).
- Uppercase label recipe: 10px/700, letter-spacing 0.16em, `#9A8570`.

### Radius
Cards 18–22px · inputs/medallions 11–14px · pills/badges 20–30px ·
phone bezel 30px (screen 23px).

### Shadows
- Card: `0 18px 40px -22px rgba(80,55,20,0.22)`
- Purple CTA: rest `0 5px 16px rgba(91,45,142,0.30)`, hover `0 10px 30px …`
- Plus highlight: `0 20px 44px -20px rgba(91,45,142,0.5)`
- Sticky bar: `0 -6px 20px -8px rgba(20,12,4,0.18)`

### Spacing
Section vertical rhythm ≈ 36–42px between blocks; section H-padding 24–26px;
card inner padding 20–24px.

## Assets
- **Wordmark** "Calisto." is set in type (Playfair italic) — no image needed.
- **Aurora mascot** is NOT used on this warm screen (it's optional brand art).
- **Plan icons** (`leaf, star, layers, diamond, spark`) are simple inline SVGs
  defined in `landing-shared.jsx` (`PlanIcon`). Replace with the codebase's icon
  set if it has equivalents; otherwise port these.
- **Photos**: the phone-album grid and any imagery use striped placeholders.
  Swap in real guest photos / the live-album component. The QR "scan" moment is
  intentionally left for the client to implement.
- **Fonts**: Playfair Display + DM Sans (Google Fonts). Use the codebase's font
  loading mechanism.

## Files in this bundle
- `Calisto Landing Warm.html` — standalone, single-screen reference of this exact
  design (open in a browser to see the live warm page at 430px).
- `landing-c-themed.jsx` — the React component (`LandingCThemed`), theme-driven.
  This handoff is the **`warm`** theme only (`C_THEMES.warm`).
- `landing-shared.jsx` — brand tokens (`C`), atoms (`CreateForm`, `Label`,
  `LangSwitcher`, `Photo`, `PlanIcon`, `Stat`), and the `PLANS` data.

> Reference originals in the project: `Calisto Landing C - Style Studies.html`
> (all three styles on a canvas) and `Calisto Ad Landing Redesign.html`
> (directions A/B/C).
