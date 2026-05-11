export type CalistoTheme = "light" | "dark";

export const CALISTO_THEME_STORAGE_KEY = "calisto-theme";

/** Read persisted theme preference, then `data-theme`, then system `prefers-color-scheme`. */
export function readCalistoTheme(): CalistoTheme {
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
  document.documentElement.setAttribute("data-theme", t);
  try {
    localStorage.setItem(CALISTO_THEME_STORAGE_KEY, t);
  } catch {
    /* ignore */
  }
}
