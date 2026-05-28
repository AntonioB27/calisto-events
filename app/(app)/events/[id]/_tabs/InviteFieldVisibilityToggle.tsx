"use client";

import type { CSSProperties } from "react";

type Props = Readonly<{
  label: string;
  showLabel: string;
  hideLabel: string;
  checked: boolean;
  onChange: (next: boolean) => void;
}>;

function toggleBtnStyle(active: boolean): CSSProperties {
  return {
    flexShrink: 0,
    padding: "6px 14px",
    borderRadius: 10,
    fontSize: 12,
    fontWeight: 600,
    border: active
      ? "1.5px solid var(--app-gold)"
      : "1.5px solid color-mix(in srgb, var(--app-muted) 35%, transparent)",
    background: active ? "color-mix(in srgb, var(--app-gold) 12%, transparent)" : "var(--app-surface)",
    color: "var(--app-text)",
    cursor: "pointer",
  };
}

/** Show/hide toggle for a block that appears on the printed invitation. */
export function InviteFieldVisibilityToggle({ label, showLabel, hideLabel, checked, onChange }: Props) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 12,
        marginBottom: 8,
      }}
    >
      <span style={{ fontSize: 12, fontWeight: 600, color: "var(--app-muted)", letterSpacing: "0.02em" }}>
        {label}
      </span>
      <button
        type="button"
        style={toggleBtnStyle(checked)}
        aria-pressed={checked}
        onClick={() => onChange(!checked)}
      >
        {checked ? showLabel : hideLabel}
      </button>
    </div>
  );
}
