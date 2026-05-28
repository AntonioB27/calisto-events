import type { Locale } from "@/lib/i18n";

import { defaultVisibilityFieldValues } from "@/lib/event-print/invitation-field-visibility";
import { defaultFieldValuesForTemplate } from "@/lib/event-print/print-field-defaults";

/** Merges saved draft over catalog defaults for invitation print preview (display-only; not validated). */
export function mergeInvitationDraftWithDefaults(
  templateId: string,
  eventDisplayName: string,
  eventDateIso: string,
  locale: Locale,
  stored: Readonly<Record<string, string>> | null | undefined,
): Record<string, string> {
  const defaults = defaultFieldValuesForTemplate(templateId, eventDisplayName, eventDateIso, locale);
  return { ...defaults, ...defaultVisibilityFieldValues(), ...(stored ?? {}) };
}
