export const EVENT_ADMIN_TABS = [
  { id: "overview", label: "Overview" },
  { id: "guests", label: "Guests" },
  { id: "gallery", label: "Gallery" },
  { id: "share", label: "Share" },
] as const;

export type EventAdminTabId = (typeof EVENT_ADMIN_TABS)[number]["id"];

const EVENT_ADMIN_TAB_IDS = new Set<string>(EVENT_ADMIN_TABS.map((t) => t.id));

export function isEventAdminTabId(value: string | undefined): value is EventAdminTabId {
  return typeof value === "string" && EVENT_ADMIN_TAB_IDS.has(value);
}

