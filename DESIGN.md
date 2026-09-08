---
name: Calisto Events — Marketing Landing
description: The dark-first, golden-hour editorial system for the public marketing site (Hero through footer at /[locale])
colors:
  void-plum: "#0C0A0F"
  void-plum-2: "#141019"
  void-plum-3: "#1C1724"
  warm-parchment: "#F4EAD9"
  warm-parchment-2: "#E8DCC6"
  warm-parchment-muted: "#B5AB99"
  warm-parchment-faint: "#6E6758"
  amber-flare: "#F0B34B"
  amber-flare-2: "#FFD28E"
  warm-gold: "#F5C76B"
  warm-gold-deep: "#C9912E"
  dusty-plum: "#8B6A8C"
  dusty-plum-2: "#A584A6"
typography:
  display:
    fontFamily: "DM Serif Display, Georgia, serif"
    fontSize: "clamp(2.5rem, 6.4vw, 4.875rem)"
    fontWeight: 400
    lineHeight: 1.0
    letterSpacing: "-0.025em"
  body:
    fontFamily: "DM Sans, -apple-system, BlinkMacSystemFont, Helvetica Neue, sans-serif"
    fontSize: "17px"
    fontWeight: 400
    lineHeight: 1.6
  label:
    fontFamily: "JetBrains Mono, ui-monospace, SFMono-Regular, monospace"
    fontSize: "11px"
    fontWeight: 400
    letterSpacing: "0.28em"
rounded:
  pill: "999px"
  lg: "20px"
  md: "18px"
  sm: "8px"
  xs: "4px"
spacing:
  xs: "8px"
  sm: "14px"
  md: "16px"
  lg: "24px"
  xl: "32px"
  xxl: "56px"
components:
  button-primary:
    backgroundColor: "{colors.warm-gold}"
    textColor: "#1b1208"
    rounded: "{rounded.pill}"
    padding: "11px 22px"
  button-secondary:
    backgroundColor: "transparent"
    textColor: "{colors.warm-parchment}"
    rounded: "{rounded.pill}"
    padding: "11px 22px"
  card-panel:
    backgroundColor: "{colors.warm-parchment}"
    rounded: "{rounded.md}"
  badge-eyebrow:
    textColor: "{colors.warm-gold}"
    typography: "{typography.label}"
---

# Design System: Calisto Events — Marketing Landing

## Overview

**Creative North Star: "The Golden Hour Album"**

This system reads as a keepsake album opened at golden hour: a near-black, plum-tinted void holds warm amber and gold light like the last hour of a wedding reception, and every surface is a page in that album rather than a dashboard panel. Type does the heavy lifting — a serif display face (DM Serif Display) carries headlines, section titles, pull-quotes and even the italic stat numerals at full size, while a plain, quiet sans (DM Sans) carries body copy and interface labels without competing with it. Ambient radial washes of plum and amber drift behind sections instead of hard-edged blocks, a film-grain overlay sits over the whole page, and hairline borders plus barely-there glass fills (never solid cards, never pure white) do almost all of the structural work. Real candid event photography — golden-hour wedding dances, string-lit dinners, birthday sparklers — is the system's evidence, staged as physical objects (rotated, washi-taped, drop-shadowed) rather than cropped into flat image tiles. Aurora, the mascot, is a named character with her own contextual portrait art and a distinct first-person voice, always set apart from factual product copy by an italic serif treatment or a bordered speech-bubble panel.

**Key Characteristics:**
- Dark-first (near-black plum void), with a fully mirrored light theme that swaps token roles rather than just inverting lightness.
- Serif display type at full strength for anything that needs to feel emotional or important; mono/uppercase/tracked type for anything that needs to feel structural or factual.
- Flat, hairline-bordered surfaces by default; shadow and rotation are reserved for two things only — primary calls to action, and physical photographic evidence.
- Real, warm, golden-hour event photography as proof, never generic stock or decorative crops.
- Aurora's voice is always visually distinct from the product's factual copy.

## Colors

Warm, low-saturation ambers and golds against a near-black plum void; used sparingly and always as the warmest thing on screen.

### Primary
- **Warm Gold** (#F5C76B) / **Amber Flare** (#F0B34B): the CTA and emphasis accent. Carries the primary button gradient (`warm-gold → amber-flare → warm-gold-deep`, 135deg), eyebrow labels, active nav state, and the italic display numerals in the stat bar. This is the only saturated color on the page and it earns that rarity — it marks the one thing per section the visitor should act on or remember.
- **Warm Gold Deep** (#C9912E): the gradient's shadow-side stop; also the tone for a mascot info-badge.

### Secondary
- **Dusty Plum** (#8B6A8C) / **Dusty Plum 2** (#A584A6): the ambient half of the palette. Never used on interactive elements; lives entirely in background radial glows and the scroll-spy nav underline gradient (paired with amber), giving the page atmosphere without competing with the gold accent.

### Neutral
- **Void Plum** (#0C0A0F) with layered steps **Void Plum 2** (#141019) and **Void Plum 3** (#1C1724): the default (dark) background and panel layers.
- **Warm Parchment** (#F4EAD9) with muted steps **Warm Parchment 2** (#E8DCC6), **muted** (#B5AB99), and **faint** (#6E6758): the foreground text ramp, from headline color down to the quietest caption.

### Named Rules
**The One Warm Color Rule.** Gold/amber is the only saturated accent anywhere on the page. Plum stays ambient and background-only; it never appears on a button, link, or anything clickable.

## Typography

**Display Font:** DM Serif Display (with Georgia, serif fallback)
**Body Font:** DM Sans (with system sans-serif fallback)
**Label/Mono Font:** JetBrains Mono (with ui-monospace fallback)

**Character:** A confident editorial serif paired with a quiet, almost invisible grotesque sans. The serif is never used small; the sans is never used loud. A tracked, uppercase mono third voice marks anything structural (eyebrows, step counters, stat captions) so the reader always knows whether they're looking at emotion, information, or navigation.

### Hierarchy
- **Display** (400, `clamp(2.5rem, 6.4vw, 4.875rem)`, line-height 1.0, tracking -0.025em): hero and section headlines. Always the biggest, boldest-reading element on the page even at font-weight 400 — bulk comes from size and the serif's inherent contrast, not synthetic bolding.
- **Display Italic**: Aurora's quotes, pull-quotes, testimonial copy, and the animated stat-bar numerals. Italic display type is the system's signal for "voice" or "a specific real number," as distinct from plain informational text.
- **Body** (400, 17px, line-height 1.6): descriptive paragraphs, max-width capped around 460px for the hero subhead so lines stay readable.
- **Label** (400, 10.5–11px, letter-spacing 0.22–0.28em, uppercase, mono): section eyebrows ("MEET AURORA", "4 · PRICING"), step counters, stat captions, small structural badges. Always gold or a muted neutral, never body-text color.

### Named Rules
**The Three-Voice Rule.** Every piece of text on the page is legible at a glance as one of exactly three voices: serif display (emotional/important), sans body (informational), or mono uppercase (structural/labeling). Mixing a fourth type treatment in reads as off-system.

## Layout

Content is capped at a 1200–1280px `max-width` container with fluid horizontal padding (`clamp(16px, 4vw, 32px)`). The Hero runs a two-column grid (`1.05fr / 1fr`: copy left, an interactive card right) that collapses to a single stacked column under 960px, with copy centering itself on mobile rather than staying left-aligned. Section spacing is generous and fluid via `clamp()` rather than fixed breakpize steps (e.g. `clamp(24px, 4vw, 40px)` top padding). Below-the-fold sections (stats, features, plans, testimonials, FAQ) run single-column content within the same max-width, with internal grids (3-up stat bar, 2-up plan comparison columns) that collapse to 1-column stacks under 640px.

## Elevation & Depth

Flat by default. Structure comes from hairline borders (`--hair` at 8% opacity, `--hair-2` at 14%, `--hair-strong` at 22%, all parchment-tinted) and near-transparent glass fills (`--glass-bg` at 4%, `--glass-bg-2` at 7%), never from box-shadow. Depth in the page as a whole comes from layered radial-gradient glows (plum, amber, rose) plus a constant film-grain overlay, not from card elevation. Shadow is reserved for exactly two situations, and using it elsewhere is a signal something has drifted off-system:

### Shadow Vocabulary
- **CTA glow** (`0 0 0 1px rgba(255,255,255,0.28) inset, 0 12px 40px -12px rgba(240,179,75,0.55)`): the primary gold button only. An inset highlight plus an amber ambient glow, giving it the one moment of "lift" on the page.
- **Physical-photo shadow** (`0 24px 64px rgba(0,0,0,0.55)` active / `0 8px 28px rgba(0,0,0,0.38)` resting, paired with rotation): the testimonial polaroid cards and the floating hero phone mockup. This shadow exists to sell the illusion of a tangible object, not to elevate a UI panel.

### Named Rules
**The Flat-Except-Proof Rule.** Everything is flat and hairline-bordered except the primary CTA (which glows) and real photographic evidence (which casts a physical-object shadow and sits at a slight rotation). If a new panel wants a shadow for neither reason, give it a hairline border instead.

## Shapes

Two radii do almost all the work. **Pill** (999px) is the button and interactive-chip shape — primary CTA, secondary CTA, nav pills, plan "Choose" buttons, tag pills. **18–22px** rounded corners cover cards and panels (the hero's event-builder card, the Aurora speech bubble, the trust bar, plan cards). Smaller UI fragments (mini badges, plan-tier tags) drop to 4–8px. Avatars, icon bubbles, and step-counter circles are fully circular. Corners never go sharp (0px) and never exceed the pill on anything except the polaroid testimonial cards, which use a near-sharp 1–2px radius specifically to read as printed photo paper rather than a UI element.

## Components

### Buttons
- **Shape:** pill (999px), always.
- **Primary:** `linear-gradient(135deg, var(--gold) 0%, var(--amber) 45%, var(--gold-deep) 100%)` fill, `#1b1208` (near-black) text, 11px/22px padding, the CTA glow shadow above, 250ms ease transition.
- **Secondary / Ghost:** transparent fill, warm-parchment text, `1px solid var(--hair-strong)` border with a faint inset amber tint (`0 0 0 1px rgba(240,179,75,0.16) inset`), same pill shape and padding as primary so the pair reads as one family at two weights.

### Cards / Panels
- **Corner Style:** 18–22px radius.
- **Background:** `var(--glass-bg)`, a 4% parchment-tinted transparency over whatever sits behind it — never a solid opaque fill, never pure white.
- **Border:** `1px solid var(--hair-2)` (14% parchment).
- **Shadow Strategy:** none at rest (see Elevation & Depth); the one exception is the event-builder card's thin 2px gold-gradient top accent line, which stands in for elevation without using shadow.
- **Internal Padding:** generous, typically 16–20px for compact panels (speech bubble, trust-bar items) up to full section padding for larger cards.

### Badges / Eyebrow Labels
- **Style:** mono uppercase, 10.5–11px, 0.22–0.28em letter-spacing, gold or muted-neutral color, no background by default.
- **Pill variant:** small mono badges (plan tags, mascot info-badges) get a light background tint plus 4px radius rather than the interactive pill radius, keeping them visually distinct from clickable buttons.

### Navigation
- Text links in muted parchment, brightening to full parchment on hover/active. The active in-page section link gets a 2px underline in a plum-to-amber gradient — the one place plum and gold appear together, marking "you are here" as distinct from "act on this" (gold alone).

### Signature Component: Photographic Evidence
Real event photography never appears as a plain `<img>` crop. It is staged as a physical object: rotated a few degrees at rest, straightening and scaling up when active/focused, with a washi-tape strip, a subtle grain overlay, and a vignette baked into the photo's own presentation, then captioned in italic serif like a handwritten album note. This is the system's proof mechanism — when the design needs to argue "this really happens at real events," it reaches for this component, not a stock photo grid.

## Do's and Don'ts

### Do:
- **Do** treat gold/amber as the only saturated, interactive color; everything else (including plum) stays ambient or textual.
- **Do** use the serif display face at full size for anything emotional (headlines, Aurora's voice, pull-quotes, live stat numerals); keep the sans small and quiet everywhere else.
- **Do** use pill radius (999px) for every button and interactive chip; reserve 18–22px for static cards/panels.
- **Do** stage real event photography as a physical object (rotation, tape, grain, shadow) rather than a flat cropped image.
- **Do** keep Aurora's voice visually distinct from factual product copy (italic serif and/or a bordered speech-bubble panel), matching her own contextual portrait art rather than a generic icon.

### Don't:
- **Don't** use pure-white glass or opaque white card fills; glass surfaces stay parchment-tinted and near-transparent even in light mode.
- **Don't** add box-shadow to an ordinary card or panel; flat + hairline border is the default, shadow is earned only by the primary CTA or real photographic evidence.
- **Don't** use em dashes anywhere in copy, UI strings, or labels.
- **Don't** invent a fourth type voice; every text element is display-serif, sans-body, or mono-label.
