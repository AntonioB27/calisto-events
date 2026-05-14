export const EVENT_ADMIN_TABS = [
  { id: "overview", visibleTo: "all" as const },
  { id: "guests", visibleTo: "all" as const },
  { id: "gallery", visibleTo: "all" as const },
  { id: "share", visibleTo: "all" as const },
  /** Primary organizer only — print templates & stationery */
  { id: "prints", visibleTo: "organizer" as const },
  /** Primary organizer only — hidden for other roles if they ever get event access */
  { id: "settings", visibleTo: "organizer" as const },
] as const;

export type EventAdminTabId = (typeof EVENT_ADMIN_TABS)[number]["id"];

const EVENT_ADMIN_TAB_IDS = new Set<string>(EVENT_ADMIN_TABS.map((t) => t.id));

export function isEventAdminTabId(value: string | undefined): value is EventAdminTabId {
  return typeof value === "string" && EVENT_ADMIN_TAB_IDS.has(value);
}
