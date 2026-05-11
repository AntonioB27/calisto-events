import type { Locale } from "@/lib/i18n";

import type { AppUiDict } from "./en";
import { APP_UI_EN } from "./en";
import { APP_UI_DE } from "./de";
import { APP_UI_HR } from "./hr";

export type { AppUiDict } from "./en";
export { APP_UI_EN } from "./en";
export { APP_UI_HR } from "./hr";
export { APP_UI_DE } from "./de";
export { interpolate } from "./interpolate";

export function getAppStrings(locale: Locale): AppUiDict {
  if (locale === "hr") return APP_UI_HR;
  if (locale === "de") return APP_UI_DE;
  return APP_UI_EN;
}

/** Passed to AppUiProvider: dictionary plus active locale for date/number Intl. */
export type AppUiSession = AppUiDict & { locale: Locale };
