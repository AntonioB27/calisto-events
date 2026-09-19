"use client";

import { useCalistoTheme } from "@/hooks/useCalistoTheme";
import { DARK_MODE_ENABLED } from "@/lib/calisto-theme";
import type { LandingCopy } from "@/lib/i18n";

type ThemeToggleButtonProps = { copy: Pick<LandingCopy, "themeLight" | "themeDark">; className?: string };

export function ThemeToggleButton({ copy, className }: ThemeToggleButtonProps) {
  const { theme, toggleTheme } = useCalistoTheme();
  const label = theme === "light" ? copy.themeDark : copy.themeLight;

  // Dark mode is disabled app-wide — hide the toggle rather than offer a switch to nowhere.
  if (!DARK_MODE_ENABLED) return null;

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={label}
      title={label}
      className={className}
      style={{
        width: 36,
        height: 36,
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        borderRadius: 999,
        cursor: "pointer",
        background: "transparent",
        border: "1px solid var(--hair-2)",
        color: "var(--cream-3)",
        fontSize: 15,
        lineHeight: 1,
        flexShrink: 0,
        transition: "color 200ms, border-color 200ms",
      }}
    >
      {theme === "light" ? "☾" : "☀"}
    </button>
  );
}
