type MembershipLabellingRow = { user_id: string; display_name_at_event: string | null };
type ProfileLabellingRow = { id: string; display_name: string | null };

/** Event display name → profile → Organizer / Guest (same priority as GuestsManager). */
export function buildMemberLabelMap(
  userIds: string[],
  organizerId: string | null,
  memberships: MembershipLabellingRow[] | null | undefined,
  profiles: ProfileLabellingRow[] | null | undefined,
  defaults: Readonly<{ organizer: string; guest: string }>,
): Map<string, string> {
  const atEvent = new Map<string, string | null>();
  for (const m of memberships ?? []) {
    atEvent.set(m.user_id, m.display_name_at_event);
  }
  const profById = new Map<string, string | null>();
  for (const p of profiles ?? []) {
    profById.set(p.id, p.display_name);
  }

  const out = new Map<string, string>();
  for (const id of userIds) {
    const label =
      atEvent.get(id)?.trim() ||
      profById.get(id)?.trim() ||
      (organizerId !== null && id === organizerId ? defaults.organizer : defaults.guest);
    out.set(id, label);
  }
  return out;
}
