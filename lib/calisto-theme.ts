export type CalistoTheme = "light" | "dark";

export const CALISTO_THEME_STORAGE_KEY = "calisto-theme";

/** Read persisted theme preference, falling back to `document` state or dark. */
export function readCalistoTheme(): CalistoTheme {
  if (typeof document === "undefined") return "dark";
  try {
    const stored = localStorage.getItem(CALISTO_THEME_STORAGE_KEY);
    if (stored === "light" || stored === "dark") return stored;
  } catch {
    /* ignore */
  }
  const attr = document.documentElement.getAttribute("data-theme");
  return attr === "light" ? "light" : "dark";
}

export function applyCalistoTheme(t: CalistoTheme) {
  if (typeof document === "undefined") return;
  document.documentElement.setAttribute("data-theme", t);
  try {
    localStorage.setItem(CALISTO_THEME_STORAGE_KEY, t);
  } catch {
    /* ignore */
  }
}
