# Plan Cards Hover Reveal Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Show only Photos, Videos, and Guest limit rows on plan cards by default; reveal ZIP export, Upload window, and Event deletion on hover (desktop) or tap (mobile).

**Architecture:** Extract a `splitPlanRows` pure function for testability, add `expandedPlans` state to `PlanCards` for mobile tap, wrap secondary rows in a CSS-animated div toggled by hover or `data-expanded` attribute.

**Tech Stack:** React, TypeScript, CSS-in-JSX (existing pattern), Vitest

---

### Task 1: Extract and test `splitPlanRows`

**Files:**
- Modify: `components/PlanCards.tsx` — export `splitPlanRows`
- Create: `components/PlanCards.test.ts`

- [ ] **Step 1: Write the failing test**

Create `components/PlanCards.test.ts`:

```typescript
import { describe, it, expect } from "vitest";
import { splitPlanRows } from "./PlanCards";

const rows = [
  { label: "Photos", value: "150" },
  { label: "Videos", value: "10" },
  { label: "Guest limit", value: "30" },
  { label: "ZIP export", value: "Gallery — primary organizer, 24h link" },
  { label: "Upload window", value: "7 days" },
  { label: "Event deletion", value: "30 days" },
];

describe("splitPlanRows", () => {
  it("puts Photos, Videos, Guest limit into primaryRows", () => {
    const { primaryRows } = splitPlanRows(rows);
    expect(primaryRows.map((r) => r.label)).toEqual(["Photos", "Videos", "Guest limit"]);
  });

  it("puts ZIP export, Upload window, Event deletion into secondaryRows", () => {
    const { secondaryRows } = splitPlanRows(rows);
    expect(secondaryRows.map((r) => r.label)).toEqual([
      "ZIP export",
      "Upload window",
      "Event deletion",
    ]);
  });

  it("handles empty input", () => {
    const result = splitPlanRows([]);
    expect(result.primaryRows).toEqual([]);
    expect(result.secondaryRows).toEqual([]);
  });

  it("preserves row values", () => {
    const { primaryRows } = splitPlanRows(rows);
    expect(primaryRows[0]!.value).toBe("150");
  });
});
```

- [ ] **Step 3: Run test to confirm it fails**

```bash
npx vitest run components/PlanCards.test.ts
```

Expected: error — `splitPlanRows` is not exported from `PlanCards.tsx` yet.

- [ ] **Step 4: Add `splitPlanRows` export to `PlanCards.tsx`**

In `components/PlanCards.tsx`, after the `PLAN_CONFIG` constant (around line 104), add:

```typescript
const PRIMARY_LABELS = new Set(["Photos", "Videos", "Guest limit"]);

export function splitPlanRows(rows: { label: string; value: string }[]): {
  primaryRows: { label: string; value: string }[];
  secondaryRows: { label: string; value: string }[];
} {
  return {
    primaryRows: rows.filter((r) => PRIMARY_LABELS.has(r.label)),
    secondaryRows: rows.filter((r) => !PRIMARY_LABELS.has(r.label)),
  };
}
```

- [ ] **Step 5: Run test to confirm it passes**

```bash
npx vitest run components/PlanCards.test.ts
```

Expected: all 4 tests PASS.

- [ ] **Step 6: Commit**

```bash
git add components/PlanCards.tsx components/PlanCards.test.ts
git commit -m "feat(plans): extract splitPlanRows, add tests"
```

---

### Task 2: Wire `splitPlanRows` into the render and add `expandedPlans` state

**Files:**
- Modify: `components/PlanCards.tsx` — update `PlanCards` component

- [ ] **Step 1: Add `expandedPlans` state**

In the `PlanCards` function body (around line 107), add alongside the existing `useState`:

```typescript
const [expandedPlans, setExpandedPlans] = useState<Record<string, boolean>>({});
```

- [ ] **Step 2: Replace the `restRows` render with split rows**

Find this block inside the `copy.plans.map(...)` loop (around line 228):

```typescript
const [priceRow, ...restRows] = plan.rows;
```

Replace with:

```typescript
const [priceRow, ...restRows] = plan.rows;
const { primaryRows, secondaryRows } = splitPlanRows(restRows);
const isExpanded = expandedPlans[plan.id] ?? false;
```

- [ ] **Step 3: Replace the `<dl>` block in `plan-card-details`**

Find the existing `<dl>` block (the one that maps over `restRows`, starting around line 339) and replace the entire `<dl>...</dl>` with:

```tsx
<dl style={{ display: "flex", flexDirection: "column", gap: 0 }}>
  {primaryRows.map((row) => (
    <div
      key={row.label}
      className="plan-detail-row"
      style={{
        display: "grid",
        gridTemplateColumns: "minmax(130px, auto) 1fr",
        alignItems: "center",
        gap: 14,
        padding: "13px 0",
        borderBottom: "1px dashed rgba(181,171,153,0.2)",
        background: `linear-gradient(90deg, ${config.accentColor}10 0%, rgba(0,0,0,0) 30%)`,
      }}
    >
      <dt
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: 10,
          color: "var(--cream-4, #6E6758)",
          letterSpacing: "0.09em",
          textTransform: "uppercase",
        }}
      >
        {row.label}
      </dt>
      <dd
        style={{
          fontFamily: "var(--font-sans)",
          color: "var(--cream)",
          fontWeight: 600,
          margin: 0,
          textAlign: "right",
          lineHeight: 1.35,
        }}
      >
        {row.value}
      </dd>
    </div>
  ))}
</dl>

<div className="plan-rows-hint" aria-hidden>···</div>

<div
  className="plan-secondary-rows"
  data-expanded={isExpanded ? "true" : "false"}
>
  <dl style={{ display: "flex", flexDirection: "column", gap: 0 }}>
    {secondaryRows.map((row) => (
      <div
        key={row.label}
        className="plan-detail-row"
        style={{
          display: "grid",
          gridTemplateColumns: "minmax(130px, auto) 1fr",
          alignItems: "center",
          gap: 14,
          padding: "13px 0",
          borderBottom: "1px dashed rgba(181,171,153,0.2)",
          background: `linear-gradient(90deg, ${config.accentColor}10 0%, rgba(0,0,0,0) 30%)`,
        }}
      >
        <dt
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: 10,
            color: "var(--cream-4, #6E6758)",
            letterSpacing: "0.09em",
            textTransform: "uppercase",
          }}
        >
          {row.label}
        </dt>
        <dd
          style={{
            fontFamily: "var(--font-sans)",
            color: "var(--cream)",
            fontWeight: 600,
            margin: 0,
            textAlign: "right",
            lineHeight: 1.35,
          }}
        >
          {row.value}
        </dd>
      </div>
    ))}
  </dl>
</div>

<button
  type="button"
  className="plan-expand-btn"
  aria-expanded={isExpanded}
  onClick={() =>
    setExpandedPlans((prev) => ({ ...prev, [plan.id]: !(prev[plan.id] ?? false) }))
  }
>
  {isExpanded ? "Show less ↑" : "Show more ↓"}
</button>
```

- [ ] **Step 4: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 5: Commit**

```bash
git add components/PlanCards.tsx
git commit -m "feat(plans): split rows into primary/secondary, add mobile expand state"
```

---

### Task 3: Add CSS for hover reveal, mobile tap, and accessibility

**Files:**
- Modify: `components/PlanCards.tsx` — extend the `<style>` block

- [ ] **Step 1: Add new CSS rules to the `<style>` block**

Inside the existing `<style>{`...`}</style>` block at the bottom of `PlanCards.tsx`, append the following **before** the closing backtick:

```css
/* Secondary rows — hidden by default, revealed by hover, focus, or data-expanded */
.plan-secondary-rows {
  max-height: 0;
  overflow: hidden;
  opacity: 0;
  transition: max-height 280ms ease, opacity 220ms ease;
}
.plan-card:hover .plan-secondary-rows,
.plan-card:focus-within .plan-secondary-rows,
.plan-secondary-rows[data-expanded="true"] {
  max-height: 200px;
  opacity: 1;
}

/* Hint dots — visible on desktop, fade on hover */
.plan-rows-hint {
  text-align: center;
  color: var(--cream-4, #6E6758);
  font-size: 13px;
  letter-spacing: 0.15em;
  padding: 6px 0 2px;
  opacity: 0.55;
  transition: opacity 220ms ease;
  pointer-events: none;
}
.plan-card:hover .plan-rows-hint,
.plan-card:focus-within .plan-rows-hint {
  opacity: 0;
}

/* Mobile expand button — hidden on desktop, shown on mobile */
.plan-expand-btn {
  display: none;
}

@media (max-width: 780px) {
  .plan-rows-hint {
    display: none;
  }
  .plan-expand-btn {
    display: block;
    width: 100%;
    margin-top: 8px;
    padding: 8px 0;
    background: none;
    border: none;
    border-top: 1px dashed rgba(181,171,153,0.2);
    color: var(--cream-4, #6E6758);
    font-family: var(--font-mono);
    font-size: 10px;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    cursor: pointer;
    text-align: center;
    transition: color 180ms ease;
  }
  .plan-expand-btn:hover {
    color: var(--cream-3, #B5AB99);
  }
}

/* Reduced motion — always show secondary rows, hide hint and button */
@media (prefers-reduced-motion: reduce) {
  .plan-secondary-rows {
    max-height: none !important;
    opacity: 1 !important;
    transition: none !important;
  }
  .plan-rows-hint {
    display: none !important;
  }
}
```

- [ ] **Step 2: Run the full test suite to confirm nothing regressed**

```bash
npx vitest run
```

Expected: all tests pass (including the `PlanCards.test.ts` from Task 1).

- [ ] **Step 3: Verify TypeScript still compiles**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add components/PlanCards.tsx
git commit -m "feat(plans): hover reveal and mobile tap-to-expand CSS"
```

---

### Task 4: Manual verification checklist

No code changes — this task is a verification pass before declaring done.

- [ ] **Step 1: Start the dev server**

```bash
npm run dev
```

Open `http://localhost:3000` and navigate to the Plans section.

- [ ] **Step 2: Desktop hover**

Hover over each plan card one by one. Confirm:
- Only Photos, Videos, Guest limit rows are visible by default
- The `···` hint is visible below those rows
- On hover: ZIP export, Upload window, Event deletion slide in smoothly
- The `···` hint fades out on hover
- Moving the mouse away hides the secondary rows again

- [ ] **Step 3: Keyboard (focus-within)**

Tab into a plan card. Confirm secondary rows expand exactly as with mouse hover.

- [ ] **Step 4: Mobile (resize to ≤780px)**

Use browser DevTools to simulate mobile. Confirm:
- `···` hint is not visible
- "Show more ↓" button appears below the three primary rows
- Tapping it expands the secondary rows and changes label to "Show less ↑"
- Tapping again collapses them
- Each card tracks its own expand state independently

- [ ] **Step 5: Reduced motion**

In DevTools, enable "Emulate CSS prefers-reduced-motion: reduce". Confirm:
- All rows are visible immediately with no animation
- No `···` hint or expand button visible

- [ ] **Step 6: All locales**

Check at least one non-default locale (e.g. `http://localhost:3000/es` or `/pt`) to confirm row labels match and splitting still works correctly.
