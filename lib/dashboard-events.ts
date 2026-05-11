export type DashboardEventRow = Readonly<{
  id: string;
  title: string;
  event_date: string;
  plan: string;
  access_code: string;
  membershipRole: "organizer" | "co_organizer";
}>;

type EventSelect = Pick<DashboardEventRow, "id" | "title" | "event_date" | "plan" | "access_code">;

function eventDateCompareDesc(aIso: string, bIso: string) {
  return new Date(bIso).getTime() - new Date(aIso).getTime();
}

/** Merge owned events and co-organised events for the dashboard (primary rows win on id). */
export function mergeDashboardEvents(
  owned: readonly EventSelect[],
  coOrganized: readonly EventSelect[],
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

  return [...primary, ...secondary].sort((a, b) => eventDateCompareDesc(a.event_date, b.event_date));
}
