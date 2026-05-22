export type DemoRole = "organizer" | "guest";
export type DemoTabId = "overview" | "gallery" | "guests" | "share";

const DEMO_ROLES = new Set<string>(["organizer", "guest"]);
const DEMO_TABS = new Set<string>(["overview", "gallery", "guests", "share"]);

export function resolveDemoRole(value: string | undefined): DemoRole {
  if (typeof value === "string" && DEMO_ROLES.has(value)) {
    return value as DemoRole;
  }
  return "organizer";
}

export function resolveDemoTab(value: string | undefined): DemoTabId {
  if (typeof value === "string" && DEMO_TABS.has(value)) {
    return value as DemoTabId;
  }
  return "overview";
}
