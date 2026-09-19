"use client";

import { useServerInsertedHTML } from "next/navigation";
import { DARK_MODE_ENABLED } from "@/lib/calisto-theme";

// Runs before first paint for visitors without a theme cookie (first-time visitors).
// Returning visitors already have data-theme set server-side from the cookie — this
// script skips them (the early-return check) so there is no double-assignment.
// It also writes the cookie so subsequent page loads are server-rendered correctly.
const THEME_INIT_SNIPPET = `try{var k="calisto-theme",ck=31536000;if(!document.documentElement.getAttribute("data-theme")){var t=localStorage.getItem(k);if(t==="light"||t==="dark"){document.documentElement.setAttribute("data-theme",t);}else{var d=typeof matchMedia!=="undefined"&&matchMedia("(prefers-color-scheme: dark)").matches;t=d?"dark":"light";document.documentElement.setAttribute("data-theme",t);}document.cookie=k+"="+t+"; path=/; max-age="+ck+"; SameSite=Lax";}}catch(e){}`;

// Dark mode is disabled app-wide right now — always bootstrap to light,
// ignoring any stored preference or system setting. The original
// preference-aware snippet above is kept as-is so re-enabling dark mode
// is just flipping DARK_MODE_ENABLED back to true.
const THEME_INIT_SNIPPET_LIGHT_ONLY = `try{var k="calisto-theme",ck=31536000;if(!document.documentElement.getAttribute("data-theme")){document.documentElement.setAttribute("data-theme","light");document.cookie=k+"=light; path=/; max-age="+ck+"; SameSite=Lax";}}catch(e){}`;

/**
 * Injects the theme bootstrap during SSR only (useServerInsertedHTML is a no-op on the client).
 * Avoids placing a script element in the root layout tree, which triggers a React 19 dev warning.
 */
export function CalistoThemeInit() {
  useServerInsertedHTML(() => (
    <script
      id="calisto-theme-init"
      dangerouslySetInnerHTML={{
        __html: DARK_MODE_ENABLED ? THEME_INIT_SNIPPET : THEME_INIT_SNIPPET_LIGHT_ONLY,
      }}
    />
  ));
  return null;
}
