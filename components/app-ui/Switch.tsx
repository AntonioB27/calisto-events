/** On/off switch with its label and an optional description; the whole row is the hit target. */
export function Switch({
  checked,
  onChange,
  label,
  description,
  disabled,
  busy,
}: Readonly<{
  checked: boolean;
  onChange: (next: boolean) => void;
  label: React.ReactNode;
  description?: React.ReactNode;
  disabled?: boolean;
  busy?: boolean;
}>) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-busy={busy || undefined}
      disabled={disabled || busy}
      className="app-switch"
      onClick={() => onChange(!checked)}
    >
      <span className="app-switch__text">
        <span className="app-switch__label">{label}</span>
        {description ? <span className="app-switch__desc">{description}</span> : null}
      </span>
      <span className="app-switch__track" aria-hidden>
        <span className="app-switch__knob" />
      </span>
    </button>
  );
}
