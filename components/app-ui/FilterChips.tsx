export type FilterChip<T extends string> = Readonly<{ id: T; label: string; dot?: boolean }>;

/** A row of toggle chips (one selected). Scrolls sideways on narrow screens instead of wrapping. */
export function FilterChips<T extends string>({
  chips,
  value,
  onChange,
  ariaLabel,
}: Readonly<{ chips: readonly FilterChip<T>[]; value: T; onChange: (id: T) => void; ariaLabel: string }>) {
  return (
    <div role="group" aria-label={ariaLabel} className="app-chips">
      {chips.map((c) => (
        <button key={c.id} type="button" className="app-chip" aria-pressed={c.id === value} onClick={() => onChange(c.id)}>
          {c.dot ? <span className="app-chip__dot" aria-hidden /> : null}
          {c.label}
        </button>
      ))}
    </div>
  );
}
