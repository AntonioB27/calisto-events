"use client";

import { useServerInsertedHTML } from "next/navigation";

// Runs before first paint for visitors without a theme cookie (first-time visitors).
// Returning visitors already have data-theme set server-side from the cookie — this
// script skips them (the early-return check) so there is no double-assignment.
// It also writes the cookie so subsequent page loads are server-rendered correctly.
const THEME_INIT_SNIPPET = `try{var k="calisto-theme",ck=31536000;if(!document.documentElement.getAttribute("data-theme")){var t=localStorage.getItem(k);if(t==="light"||t==="dark"){document.documentElement.setAttribute("data-theme",t);}else{var d=typeof matchMedia!=="undefined"&&matchMedia("(prefers-color-scheme: dark)").matches;t=d?"dark":"light";document.documentElement.setAttribute("data-theme",t);}document.cookie=k+"="+t+"; path=/; max-age="+ck+"; SameSite=Lax";}}catch(e){}`;

/**
 * Injects the theme bootstrap during SSR only (useServerInsertedHTML is a no-op on the client).
 * Avoids placing a script element in the root layout tree, which triggers a React 19 dev warning.
 */
export function CalistoThemeInit() {
  useServerInsertedHTML(() => (
    <script
      id="calisto-theme-init"
      dangerouslySetInnerHTML={{
        __html: THEME_INIT_SNIPPET,
      }}
    />
  ));
  return null;
}
