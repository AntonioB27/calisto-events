"use client";

import { useCallback, useSyncExternalStore } from "react";
import { applyCalistoTheme, readCalistoTheme, DARK_MODE_ENABLED, type CalistoTheme } from "@/lib/calisto-theme";

function subscribe(callback: () => void) {
  const observer = new MutationObserver(callback);
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
  return () => observer.disconnect();
}

// The server has no access to localStorage/cookies/matchMedia, so it always renders "dark";
// useSyncExternalStore hydrates with this same value, then swaps to the real one from
// readCalistoTheme() right after mount without a hydration mismatch.
// (Moot while DARK_MODE_ENABLED is false — readCalistoTheme() always returns "light" too.)
function getServerSnapshot(): CalistoTheme {
  return DARK_MODE_ENABLED ? "dark" : "light";
}

/** Live theme state + toggle, backed by the shared cookie/localStorage/data-theme source of truth. */
export function useCalistoTheme(): { theme: CalistoTheme; toggleTheme: () => void } {
  const theme = useSyncExternalStore(subscribe, readCalistoTheme, getServerSnapshot);

  const toggleTheme = useCallback(() => {
    applyCalistoTheme(theme === "dark" ? "light" : "dark");
  }, [theme]);

  return { theme, toggleTheme };
}
