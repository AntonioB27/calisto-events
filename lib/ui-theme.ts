import { cookies } from "next/headers";
import type { CalistoTheme } from "./calisto-theme";
import { CALISTO_THEME_STORAGE_KEY } from "./calisto-theme";

/**
 * Reads the theme cookie set by `applyCalistoTheme` on the client.
 * Returns null for first-time visitors (no cookie yet) — the inline
 * script in CalistoThemeInit will handle that case client-side.
 */
export async function getUiTheme(): Promise<CalistoTheme | null> {
  const jar = await cookies();
  const val = jar.get(CALISTO_THEME_STORAGE_KEY)?.value;
  if (val === "light" || val === "dark") return val;
  return null;
}
