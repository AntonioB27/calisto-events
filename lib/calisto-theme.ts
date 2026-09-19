export type CalistoTheme = "light" | "dark";

export const CALISTO_THEME_STORAGE_KEY = "calisto-theme";

/**
 * Dark mode is temporarily disabled app-wide — the app is light-only for now.
 * All the dark-mode logic and CSS below is kept intact; flip this back to
 * `true` to restore theme switching without touching anything else.
 */
export const DARK_MODE_ENABLED = false;

/** Read persisted theme preference, then `data-theme`, then system `prefers-color-scheme`. */
export function readCalistoTheme(): CalistoTheme {
  if (!DARK_MODE_ENABLED) return "light";
  if (typeof document === "undefined") return "dark";
  try {
    const stored = localStorage.getItem(CALISTO_THEME_STORAGE_KEY);
    if (stored === "light" || stored === "dark") return stored;
  } catch {
    /* ignore */
  }
  const attr = document.documentElement.getAttribute("data-theme");
  if (attr === "light" || attr === "dark") return attr;
  if (typeof window !== "undefined" && window.matchMedia) {
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  }
  return "light";
}

export function applyCalistoTheme(t: CalistoTheme) {
  if (typeof document === "undefined") return;
  const theme: CalistoTheme = DARK_MODE_ENABLED ? t : "light";
  document.documentElement.setAttribute("data-theme", theme);
  try {
    localStorage.setItem(CALISTO_THEME_STORAGE_KEY, theme);
  } catch {
    /* ignore */
  }
  // Also write a cookie so the server can render the correct theme on the next request.
  try {
    document.cookie = `${CALISTO_THEME_STORAGE_KEY}=${theme}; path=/; max-age=31536000; SameSite=Lax`;
  } catch {
    /* ignore */
  }
}
