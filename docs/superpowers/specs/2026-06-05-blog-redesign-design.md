# Blog Redesign — Aurora's Guidebook

**Date:** 2026-06-05
**Status:** Approved

## Overview

Redesign the blog listing page and individual post page to use Aurora (the Calisto mascot) as the visual anchor and narrator throughout. The design style is "Aurora's Guidebook" — full character immersion, dark editorial aesthetic matching the landing page, with Aurora actively participating in the reading experience via reaction cards injected at section breaks.

---

## Design Decisions

- **Theme:** Dark (matches landing page — `var(--ink)` backgrounds, cream text, gold/plum accents)
- **Aurora's role:** Active narrator — appears in the hero, on listing cards, and at every H2 section break inside posts via reaction cards
- **Listing layout:** Hero block + 2-column card grid (single column mobile)
- **Post layout:** Two-column hero + centered prose body with injected Aurora reactions

---

## Blog Listing Page (`/blog`)

### Hero Block (~480px tall)
- Background: `var(--ink)` with plum radial glow (matches landing page hero)
- Left: monospace eyebrow "Aurora's Guidebook", display heading "Every memory has a story.", sans subline, gold pill CTA anchoring to first post
- Right: `aurora_planning.png` (~320px), slightly overlapping the card grid below

### Post Cards
- Layout: 2-column grid on desktop (max ~900px), single column on mobile, gap 20px
- Card anatomy:
  - Background: `var(--ink-2)`, border-radius 18px
  - Left border accent (4px) colored by `category` frontmatter field
  - Content: monospace date, italic display title, sans description, "Read →" link
  - Mascot: the post's `mascot` image (~120px) floats bottom-right, overflowing the card by ~20px on the right and bottom (sticker effect), transparent PNG, no background box
- Hover: `translateY(-4px)`, mascot scales to 1.06, border accent brightens

### Category → Accent Color Map
| Category | Color |
|---|---|
| `wedding` | `var(--gold)` / `rgba(245,199,107,…)` |
| `tips` | `var(--plum-2)` / `rgba(165,132,166,…)` |
| `events` | `#9FC58D` |
| default | `var(--cream-4)` |

---

## Individual Post Page (`/blog/[slug]`)

### Hero Block
- Two-column (single column on mobile)
- Left: "← Back to blog" link, category badge, large italic display title, monospace date
- Right: post `mascot` image (~280px) with plum radial glow behind it
- Background: continuous `var(--ink)` from header

### Post Body
- Max-width 680px centered, `line-height: 1.8`, `var(--cream-2)` body text
- H1 from markdown is hidden — title lives in the hero
- H2s are the anchor points for Aurora reactions

### Aurora Reaction Cards
Injected immediately before each H2 in the rendered HTML. Matched by index to the `auroraReactions` frontmatter array.

**Card anatomy:**
- Background: `var(--ink-2)`, border-radius 12px, plum-tinted left border (3px)
- Left: mascot image from reaction (72px, transparent PNG)
- Right: italic display font quote, `var(--cream-2)`, ~14–15px
- Margin: `2.5em 0 0.5em`
- Graceful fallback: if `auroraReactions[N]` is undefined, the H2 renders as plain heading with no card

### Pull Quotes (blockquotes)
- Style: italic display font, 1.25em, `var(--cream-2)`
- 3px plum left border
- Small `aurora.png` avatar (32px, circular) top-left
- Rendered as Aurora "speaking" to the reader

### End CTA Block
- Full-width panel, glass background, border
- `aurora_waving.png` (200px) centered above
- Italic display quote: "That's all from me — now go make some memories."
- Gold pill button: "Try Calisto free →" linking to `/en`

---

## Frontmatter Schema (Extended)

```yaml
---
title: "Post title"
description: "Meta description"
slug: post-slug
publishedAt: 2026-06-05
updatedAt: 2026-06-05
mascot: aurora_camera        # stem only — resolves to /brand/mascot/aurora_camera.png
category: wedding            # drives accent color on card and post hero badge
auroraReactions:
  - mascot: aurora_planning
    quote: "Quote text shown in the reaction card before the first H2."
  - mascot: aurora_gallery
    quote: "Quote text before the second H2."
  # One entry per H2 in the post body (after the H1 which is hidden).
  # Fewer entries than H2s is fine — remaining H2s render without a card.
  # Omit auroraReactions entirely for clean prose with no Aurora interruptions.
---
```

**Mascot path resolution:** `mascot: aurora_camera` → `/brand/mascot/aurora_camera.png`

---

## Technical Architecture

### Files Modified
| File | Change |
|---|---|
| `lib/blog.ts` | Add `mascot`, `category`, `auroraReactions` to `PostMeta` / `Post` types; parse from frontmatter; custom `marked` renderer to inject Aurora reaction card HTML before H2 tokens |
| `app/blog/page.tsx` | Full redesign — hero + 2-col card grid |
| `app/blog/[slug]/page.tsx` | Full redesign — hero + prose with injected reactions |
| `content/blog/best-wedding-photo-sharing-apps.md` | Add `mascot`, `category`, `auroraReactions` frontmatter |

### Files Created
| File | Purpose |
|---|---|
| `components/BlogPostCard.tsx` | Isolated post card component (listing page) |

### Aurora Reaction Injection Strategy
In `lib/blog.ts`, `getPost()` uses a custom `marked` Renderer that overrides the `heading()` method. When it encounters a level-2 heading:
1. Looks up `auroraReactions[h2Index]` from the post frontmatter
2. If found: prepends the reaction card HTML (plain HTML string) before the `<h2>` tag
3. If not found: renders the `<h2>` as normal
4. Increments `h2Index` counter for each H2 encountered

This keeps all rendering server-side with no client JS.

### Image Component
Blog pages use Next.js `<Image>` for mascot images with `width`/`height` props. All mascot PNGs have transparent backgrounds — no wrapper boxes needed.

---

## Existing Post Update

`content/blog/best-wedding-photo-sharing-apps.md` needs these frontmatter additions:
```yaml
mascot: aurora_camera
category: wedding
auroraReactions:
  - mascot: aurora_planning
    quote: "Three questions worth answering before you pick anything."
  - mascot: aurora_gallery
    quote: "I made this table so you don't have to read five different websites."
  - mascot: aurora_camera
    quote: "No app, no account — this is the differentiator that actually matters."
  - mascot: aurora_phone
    quote: "Free and familiar — but that Google account requirement trips people up every time."
  - mascot: aurora_happy
    quote: "Capsule is great if your guests are all under 35 and have their phones handy."
  - mascot: aurora_key
    quote: "iPhone-only is a real limitation. One Android guest and this falls apart."
  - mascot: aurora_recording
    quote: "WhatsApp works for a dinner of twelve. It does not work for a wedding of 120."
  - mascot: aurora_guests
    quote: "Match the tool to how many guests you have and how tech-comfortable they are."
  - mascot: aurora_photo
    quote: "The photos that get shared are the ones where sharing was effortless."
  - mascot: aurora_waving
    quote: "Set it up before the day, display the QR at every table, and let it fill itself."
```
(10 reactions matching the 10 H2s in the post: What to look for, Quick comparison, 1. Calisto, 2. Google Photos, 3. Capsule, 4. iCloud, 5. WhatsApp, How to choose, What most couples get wrong, FAQ.)

---

## Out of Scope
- Scroll-based mascot pose changes (deferred, too complex for now)
- Blog search or tag filtering
- Localization of blog content (EN only for now)
- Author profiles
