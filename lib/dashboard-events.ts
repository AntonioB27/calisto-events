export type DashboardEventRow = Readonly<{
  id: string;
  title: string;
  event_date: string;
  plan: string;
  access_code: string;
  membershipRole: "organizer" | "co_organizer" | "guest";
}>;

type EventSelect = Pick<DashboardEventRow, "id" | "title" | "event_date" | "plan" | "access_code">;

function eventDateCompareDesc(aIso: string, bIso: string) {
  return new Date(bIso).getTime() - new Date(aIso).getTime();
}

/**
 * Merge owned, co-organised, and guest-joined events for the dashboard.
 * Primary organiser wins on id, then co-organiser; guest rows are dropped if the user already appears as org/co-org.
 */
export function mergeDashboardEvents(
  owned: readonly EventSelect[],
  coOrganized: readonly EventSelect[],
  guestJoined: readonly EventSelect[] = [],
): DashboardEventRow[] {
  const primary = owned.map((row) => ({
    ...row,
    membershipRole: "organizer" as const,
  }));

  const primaryIds = new Set(primary.map((e) => e.id));

  const secondary = coOrganized
    .filter((row) => !primaryIds.has(row.id))
    .map((row) => ({
      ...row,
      membershipRole: "co_organizer" as const,
    }));

  const coveredIds = new Set<string>([...primaryIds, ...secondary.map((e) => e.id)]);

  const guestRows = guestJoined
    .filter((row) => !coveredIds.has(row.id))
    .map((row) => ({
      ...row,
      membershipRole: "guest" as const,
    }));

  return [...primary, ...secondary, ...guestRows].sort((a, b) => eventDateCompareDesc(a.event_date, b.event_date));
}
