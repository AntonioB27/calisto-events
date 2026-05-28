/** Content blocks the organizer can show or hide on wedding invitations. */
export const INVITATION_VISIBILITY_KEYS = [
  "together_families",
  "partner_names",
  "invite_preamble",
  "cordially_invite",
  "wedding_title",
  "event_date",
  "extra_line",
  "venue",
  "venue_line_2",
  "reception",
  "gathering",
  "church",
  "dinner",
  "quote",
] as const;

export type InvitationVisibilityKey = (typeof INVITATION_VISIBILITY_KEYS)[number];

export type InvitationFieldVisibility = Readonly<Record<InvitationVisibilityKey, boolean>>;

const SHOW_PREFIX = "show_";

export function visibilityStorageKey(key: InvitationVisibilityKey): string {
  return `${SHOW_PREFIX}${key}`;
}

export function isVisibilityStorageKey(fieldKey: string): boolean {
  return fieldKey.startsWith(SHOW_PREFIX);
}

export function defaultInvitationFieldVisibility(): InvitationFieldVisibility {
  return {
    together_families: true,
    partner_names: true,
    invite_preamble: true,
    cordially_invite: true,
    wedding_title: true,
    event_date: true,
    extra_line: true,
    venue: true,
    venue_line_2: true,
    reception: true,
    gathering: true,
    church: true,
    dinner: true,
    quote: true,
  };
}

/** Default `show_*` entries merged into invitation drafts (all visible). */
export function defaultVisibilityFieldValues(): Record<string, string> {
  const out: Record<string, string> = {};
  for (const key of INVITATION_VISIBILITY_KEYS) {
    out[visibilityStorageKey(key)] = "1";
  }
  return out;
}

export function parseInvitationFieldVisibility(
  fields: Readonly<Record<string, string>>,
): InvitationFieldVisibility {
  const base = defaultInvitationFieldVisibility();
  const next = { ...base };
  for (const key of INVITATION_VISIBILITY_KEYS) {
    const raw = fields[visibilityStorageKey(key)];
    if (raw === "0") next[key] = false;
    else if (raw === "1") next[key] = true;
  }
  return next;
}

export function showInvitationField(
  visibility: InvitationFieldVisibility,
  key: InvitationVisibilityKey,
): boolean {
  return visibility[key];
}

/** Strip `show_*` keys so only text field values remain. */
export function invitationFieldValuesOnly(
  fields: Readonly<Record<string, string>>,
): Record<string, string> {
  return Object.fromEntries(Object.entries(fields).filter(([k]) => !isVisibilityStorageKey(k)));
}
