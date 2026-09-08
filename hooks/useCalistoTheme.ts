"use client";

import { useCallback, useEffect, useState } from "react";
import { applyCalistoTheme, readCalistoTheme, type CalistoTheme } from "@/lib/calisto-theme";

/** Live theme state + toggle, backed by the shared cookie/localStorage/data-theme source of truth. */
export function useCalistoTheme(): { theme: CalistoTheme; toggleTheme: () => void } {
  const [theme, setTheme] = useState<CalistoTheme>(() => readCalistoTheme());

  useEffect(() => {
    const observer = new MutationObserver(() => setTheme(readCalistoTheme()));
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
    return () => observer.disconnect();
  }, []);

  const toggleTheme = useCallback(() => {
    applyCalistoTheme(theme === "dark" ? "light" : "dark");
  }, [theme]);

  return { theme, toggleTheme };
}
