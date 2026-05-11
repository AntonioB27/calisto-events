"use client";

import type { Locale } from "@/lib/i18n";

import { CALISTO_UI_LOCALE_COOKIE } from "@/lib/ui-locale-constants";

/** One year — matches typical language preference UX. */
const MAX_AGE_SEC = 60 * 60 * 24 * 365;

/** Sets `calisto-ui-locale` client-side after `router.refresh()` to pick up new copy on the server. */
export function setUiLocaleCookieClient(locale: Locale): void {
  if (typeof document === "undefined") return;
  document.cookie = `${CALISTO_UI_LOCALE_COOKIE}=${locale}; Path=/; Max-Age=${MAX_AGE_SEC}; SameSite=Lax`;
}
