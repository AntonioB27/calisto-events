"use client";

import { useServerInsertedHTML } from "next/navigation";

const THEME_INIT_SNIPPET = `try{var t=localStorage.getItem("calisto-theme");if(t==="light"||t==="dark")document.documentElement.setAttribute("data-theme",t);else document.documentElement.setAttribute("data-theme","light");}catch(e){}`;

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
