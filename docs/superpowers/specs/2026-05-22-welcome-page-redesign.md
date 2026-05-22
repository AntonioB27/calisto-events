# Welcome Page Redesign — Spec

## Goal

Redesign the welcome page (`/welcome`) to reflect the reality that ~90% of visitors are returning users or users arriving from the marketing landing page who need to register. Login and Register dominate the hierarchy. "Create Event" is removed. A new post-registration onboarding screen guides first-time registrants to their next step.

## Architecture

- Modify `app/welcome/page.tsx` — restructure action hierarchy, apply Editorial Almanac inline styles
- Replace `app/globals.css` welcome button classes — update `welcome-btn--join` and `welcome-btn--account` styles; repurpose `welcome-btn--create` for Register
- Add `app/welcome/onboarding/page.tsx` — new post-registration "create or join" screen
- Auth link from welcome page passes `returnTo=/welcome/onboarding` so the auth flow redirects there after registration

## Tech Stack

Next.js App Router (server component), existing `app-shell` CSS class, inline styles matching Editorial Almanac palette, existing `welcome-reveal` animation classes, `MascotSpot` component.

---

## Page: `/welcome`

### Action hierarchy

1. **Register** — primary, full width, gold gradient button. Label: copy key `copy.register` ("Create an account"). DM Serif Display italic, `font-size: 16.5px`, `padding: 17px 22px`. Gold gradient `linear-gradient(135deg, #C5922A 0%, #F5C76B 50%, #E8A84E 100%)`, dark ink text `#1b1208`. Sparkle SVG icon left of label. Sheen sweep on hover (existing `appBtnSheen` animation). Navigates to `/auth/login?mode=register&returnTo=%2Fwelcome%2Fonboarding`.
2. **Log in** — secondary, full width, glass with gold-to-purple gradient border. Label: copy key `copy.logIn` ("Log in"). DM Sans, `font-size: 15px`, same padding. Background: `rgba(255,255,255,0.62)` + `backdropFilter: blur(14px)`. Border: `1.5px solid transparent` with `linear-gradient(135deg, rgba(197,146,42,0.72), rgba(91,45,142,0.58)) border-box`. Navigates to `/auth/login?returnTo=%2Fdashboard`.
3. **Join with a code** — tertiary, small muted text link. Label: copy key `copy.joinWithCode` ("Join with a code"). `font-size: 13px`, `color: #9A8570`, no button border. Navigates to `/join`.

### Visual style (inline, Editorial Almanac palette)

- Page: `app-shell` class for background, flex column centered, `min-height: 100vh`, `padding: 24px`
- Card wrapper: `width: 100%`, `maxWidth: 400px`, `textAlign: center`
- Mascot: `aurora_present.png` via `MascotSpot`, existing `welcome-mascot-float` animation
- Gold rule: `width: 32px`, `height: 3px`, `background: #C5922A`, `borderRadius: 2`, centered
- Eyebrow: `fontSize: 11px`, `fontWeight: 700`, `letterSpacing: 0.18em`, uppercase, `color: #9A8570`
- Heading: `"Calisto."` in DM Serif Display italic, `clamp(36px, 13vw, 56px)`, `color: #221509`, `lineHeight: 1`
- Tagline: DM Serif Display italic, `fontSize: 16px`, `color: #9A8570`, `lineHeight: 1.6`
- Button stack: `display: flex`, `flexDirection: column`, `gap: 10px`
- Staggered `welcome-reveal` animation delays preserved (d1–d6)

### Copy keys

Update `lib/welcome-page-copy.ts` — keep using the existing `getWelcomePageCopy` helper, do not migrate to app-ui. Replace the shape of `WelcomePageCopy` with:

```ts
type WelcomePageCopy = {
  eyebrow: string;       // "Welcome to"
  tagline: string;       // "Collect photos and videos from everyone at your event."
  register: string;      // "Create an account"  (was: createEvent)
  logIn: string;         // "Log in"             (was: joinEvent)
  joinWithCode: string;  // "Join with a code"   (was: haveAccount)
  backHome: string;      // "← Back to home"
  // Onboarding page
  onboardingHeading: string;   // "What would you like to do?"
  onboardingCreateTitle: string; // "Create an event"
  onboardingCreateSub: string;   // "Set up a new event and invite your guests."
  onboardingJoinTitle: string;   // "Join an event"
  onboardingJoinSub: string;     // "Enter an access code from your organizer."
};
```

Update all three locale entries (en, hr, de) in the same file.

---

## Page: `/welcome/onboarding`

### Purpose

Shown after first-time registration from the welcome page. Asks: do you want to create an event or join one?

### Layout

Centered card, same `app-shell` background, max-width `420px`. Two glass action tiles stacked vertically:

**Tile 1 — Create an event**
- Glass card: `background: rgba(255,255,255,0.62)`, `backdropFilter: blur(14px)`, `border: 1px solid rgba(255,255,255,0.78)`, `borderRadius: 14px`, `padding: 20px`
- Icon: `Plus` from lucide-react, `color: #C5922A`
- Heading: DM Serif italic, `fontSize: 18px`, `color: #221509`
- Sub-text: DM Sans, `fontSize: 13px`, `color: #9A8570`
- Full-width link → `/events/new`

**Tile 2 — Join with a code**
- Same glass card style
- Icon: `Key` from lucide-react, `color: #5B2D8E`
- Heading + sub-text same treatment
- Full-width link → `/join`

Above the tiles: eyebrow + short heading ("What would you like to do?") in DM Serif italic.

### Auth guard

This page is a server component. If no authenticated user session exists, redirect to `/welcome`. It does not need to verify *how* the user registered — it is only reachable via the `returnTo` redirect after auth.

---

## CSS changes in `globals.css`

- `welcome-btn--create`: label text changes only (no CSS change needed — button style is reused for Register)
- `welcome-btn--join`: repurposed for Login. Update background to `rgba(255,255,255,0.62)` glass + gradient border. Remove chevron-specific rules, update to center-justified inner layout.
- `welcome-btn--account`: this class is removed. The tertiary "Join with a code" link is rendered with inline styles only.

---

## What does NOT change

- `WelcomeLanguageBar` — unchanged
- `MascotSpot` component — unchanged
- `welcome-reveal` animation system — unchanged
- `welcome-mascot-float` animation — unchanged
- The `/auth/login` page tab-switching behaviour — unchanged (already supports `?tab=register`)
- QR / join flow `returnTo` logic — unchanged
