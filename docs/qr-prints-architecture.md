# QR Print Cards — Architecture & Implementation Guide

## What it does

Organizers can print QR table cards for their event. Each card shows the event name, a scannable QR code linking to the event join URL, and the access code. The print page generates an A4 sheet with two A5 portrait cards (cut in half → two cards).

There are **6 themed QR card designs** (Simple, Romantic, Luxurious, Botanical, Art Deco, Playful) with a live-preview print screen, plus **5 classic table QR templates** (PDF-only) and **10 wedding invitation templates** (browser-print HTML).

---

## Entry points

| Route | What it does |
|---|---|
| `/events/[id]?tab=prints` | Prints tab in event dashboard — shows `PrintsTab` with cards linking to the print page |
| `/events/[id]/print?template=qr-luxurious&paper=a4&posterLang=hr` | The full print screen for QR-themed cards |
| `/events/[id]/print?template=wedding-invite-blue-floral&paper=a4` | Wedding invitation print screen |
| `/api/events/[id]/qr-pdf` | Downloads a simple A4 PDF (classic QR; does NOT use the themed cards) |

---

## File map

```
app/(app)/events/[id]/
├── _tabs/
│   └── PrintsTab.tsx                  ← Entry tab (links to print page)
├── print/
│   ├── page.tsx                       ← Server component: fetches data, routes to correct sheet
│   ├── layout.tsx                     ← Loads Google Fonts for serif/script/display typefaces
│   ├── print-sheet.css                ← All CSS for every print template + PrintScreen UI
│   ├── PrintScreen.tsx                ← ★ New immersive mobile UI for QR-themed cards
│   ├── QrThemedPrintSheet.tsx         ← Mobile preview (single card) + desktop A4 rotation sheet
│   ├── QrCardSimple.tsx               ← White/minimal card
│   ├── QrCardRomantic.tsx             ← Blush gradient, Pinyon Script, botanical sprigs
│   ├── QrCardLuxurious.tsx            ← Dark espresso, Bodoni Moda, gold corner ticks
│   ├── QrCardBotanical.tsx            ← Sage gradient, leaf branch SVGs, Jost
│   ├── QrCardArtDeco.tsx              ← Dark emerald, Cinzel, deco fan SVGs
│   ├── QrCardPlayful.tsx              ← Cream, colour blobs, Fredoka
│   ├── EventPrintToolbar.tsx          ← Toolbar for classic QR + invitation templates
│   ├── TemplatePicker.tsx             ← Bottom sheet picker (used by old toolbar path)
│   ├── EventPrintSheet.tsx            ← Dead code — never imported (kept for safety)
│   └── WeddingInvite*.tsx             ← 10 invitation sheet components
app/api/events/[id]/qr-pdf/
│   ├── route.ts                       ← GET handler — strips emoji, generates PDF
│   └── QrPdfDocument.tsx              ← react-pdf document (classic QR only, not themed)
lib/event-print/
│   ├── template-catalog.ts            ← All template IDs, categories, field defs
│   └── print-options.ts               ← Parsing helpers, PRINT_ROUTE_TEMPLATE_IDS
```

---

## Template ID system

Three categories in `lib/event-print/template-catalog.ts`:

```ts
// QR-themed (new immersive UI — PrintScreen)
QR_THEMED_PRINT_TEMPLATE_IDS = ["qr-simple","qr-romantic","qr-luxurious","qr-botanical","qr-art-deco","qr-playful"]

// Classic table QR (PDF download only)
TABLE_QR_PRINT_TEMPLATE_IDS  = ["table-minimal","table-bold","qr-clean","qr-gold","qr-dark"]

// Wedding invitations (HTML browser-print)
INVITATION_PRINT_TEMPLATE_IDS = ["wedding-invite-blue-floral", ... 10 total]
```

Detection helpers: `isQrThemedPrintTemplateId()`, `isInvitationPrintTemplateId()`, `isTableQrTemplateId()`.

`PRINT_ROUTE_TEMPLATE_IDS` = all three arrays merged — used by URL param parsing.

---

## Routing logic in `page.tsx`

```
GET /events/[id]/print?template=X&paper=Y&posterLang=Z
  ↓
isQrThemed?   → early return <PrintScreen>           (immersive mobile UI)
isInvitation? → render <WeddingInvite*PrintSheet>    (HTML browser-print)
else          → render <EventPrintToolbar>            (classic QR — links to PDF download)
```

For QR-themed: the server computes `joinUrl` from `getPublicOrigin()` + `getWebJoinUrl()`, strips the emoji from the event title with `splitEventTitleStored()`, and wraps `PrintScreen` in `<div className="join-shell">` so the app's radial gradient background shows through.

---

## PrintScreen (QR-themed mobile UI)

`app/(app)/events/[id]/print/PrintScreen.tsx` — client component.

**Layout (top to bottom):**
1. **Stage** (`ps-stage`) — transparent background, card preview centered
2. **Panel** (`ps-panel`) — cream white surface with 26px top radius
   - Action bar (`ps-action-bar`) — back chevron + Download PDF + gold Print button
   - Theme rail (`ps-rail`) — horizontal scroll, 52px thumbnails, gold ring on active
   - Paper toggle (`ps-paper-row`) — A4 / Letter pill
3. **Floating nav** (`MobileNav`) — fixed glass pill at bottom, prints tab active (mobile only, `md:hidden`)

**State:** `selected: QrThemedTemplateId` and `paper: PrintPaperId` managed client-side. No URL navigation on theme change — print button always prints whatever is currently selected.

**Print media:** `ps-ui` is hidden, `ps-print-layout` (containing `QrThemedPrintSheet`) is shown. The A4 sheet view always prints regardless of screen size.

**Card sizing:**
- Main preview: `w={300}` → scale = 300/559 ≈ 0.537, height ≈ 426px
- Rail thumbnails: `w={52}` → scale ≈ 0.093

`CardThumb` renders the card at native 559×793px then `transform: scale(w/559)` from `top left` origin, clipped by `overflow: hidden` on the container.

---

## QrCard components

Each card component is a **server component** (no `"use client"`). It receives:
```ts
{ eventTitle: string; accessCode: string; joinUrl: string }
```

Cards use `width: 100%; height: 100%` to fill their container and have **hardcoded pixel font sizes** designed for a 559px-wide container (= 148mm at 96 dpi). This means they MUST be rendered inside a correctly-sized container — don't render them raw.

`react-qr-code` `<QRCode>` is used for the scannable code. Pass `fgColor` matching the theme and `bgColor` as white/cream for scannability.

`pickQrCard(templateId, cardProps)` in `QrThemedPrintSheet.tsx` is the central dispatch function — import from there when you need to render any themed card.

---

## A4 sheet layout (for printing)

`QrThemedPrintSheet` renders two views:

```tsx
// Mobile (< 640px): single portrait card, no rotation
<div className="qr-themed-mobile-only">
  <div className="qr-themed-mobile-card">          // width: min(90vw, 340px)
    <div className="qr-themed-mobile-card__scaler"> // transform: scale(0.608)
      {pickQrCard(...)}
    </div>
  </div>
</div>

// Desktop (≥ 640px): A4 sheet with two rotated A5 cards
<div className="qr-themed-desktop-only">
  <div className="qr-themed-desk">                  // dark surface
    <div className="qr-themed-page">                // 210mm wide
      <Slot /> // 148mm slot, card rotated -90°
      <div className="qr-themed-cut" />             // dashed line
      <Slot />
    </div>
  </div>
</div>
```

**Why the rotation?** Each A5 portrait card (148×210mm) is rotated -90° to sit in a 210×148mm landscape slot on the A4 page. After printing and cutting, the user turns each half 90° to get an upright portrait card.

In `PrintScreen`, the `ps-print-layout` div forces the desktop A4 view in `@media print` regardless of screen width:
```css
@media print {
  .ps-print-layout .qr-themed-mobile-only  { display: none !important; }
  .ps-print-layout .qr-themed-desktop-only { display: block !important; }
}
```

---

## Adding a new QR card theme

1. Create `QrCard{Name}.tsx` — follow the existing card pattern, `width: 100%; height: 100%` on root, hardcode for 559px width
2. Add the template ID to `QR_THEMED_PRINT_TEMPLATE_IDS` in `template-catalog.ts`
3. Add to `PRINT_ROUTE_TEMPLATE_IDS` in `print-options.ts` (already done automatically if using the spread)
4. Add a `PrintTemplateDef` entry in `PRINT_TEMPLATE_DEFINITIONS` in `template-catalog.ts`
5. Add the `case` to `pickQrCard()` in `QrThemedPrintSheet.tsx`
6. Add i18n labels (`templateQr{Name}`) to `en.ts`, `de.ts`, `hr.ts`
7. Add the label to `themeLabel()` in `PrintScreen.tsx` and `buildLabelMap()` in `TemplatePicker.tsx`

---

## PDF route (`/api/events/[id]/qr-pdf`)

Used for **classic QR templates only** (Download PDF button). Generates a simple 2-up A4 PDF via `react-pdf/renderer`.

Key detail: event title emoji is stripped with `splitEventTitleStored()` before passing to the PDF — react-pdf cannot render emoji.

The themed cards are NOT available via this PDF route. The themed card designs require CSS features (gradients, Google Fonts, SVG decorations) that react-pdf cannot render. Themed cards print via `window.print()` on the HTML page.

---

## Fonts

Loaded in `app/(app)/events/[id]/print/layout.tsx` from Google Fonts:
- `Cormorant Garamond`, `Dancing Script`, `Montserrat` (existing invitation fonts)
- `Space Grotesk` (Simple card)
- `Pinyon Script` (Romantic — script names)
- `Bodoni Moda` (Luxurious)
- `Jost` (Luxurious, Botanical)
- `Cinzel` (Luxurious, Art Deco)
- `Marcellus` (Art Deco)
- `Fredoka` (Playful)

---

## i18n keys (print section)

New keys added for this feature in `en.ts` / `de.ts` / `hr.ts`:

```ts
print: {
  changeTheme: "Change theme",
  printThemeLabel: "Theme",
  printSheetChip: "2 cards per {paper} · cut in the middle",
  templateQrSimple: "Simple",
  templateQrRomantic: "Romantic",
  templateQrLuxurious: "Luxurious",
  templateQrBotanical: "Botanical",
  templateQrArtDeco: "Art Deco",
  templateQrPlayful: "Playful",
}
```
