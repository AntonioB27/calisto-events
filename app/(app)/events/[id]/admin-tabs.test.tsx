import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

import { AppUiProvider } from "@/components/AppUiProvider";
import { getAppStrings } from "@/lib/app-ui";

import { resolveEventTab } from "./page";
import { EventAdminTabs } from "./_tabs/EventAdminTabs";
import { EVENT_ADMIN_TABS } from "./_tabs/event-admin-tabs";

const { maybeSingleMock, getUserMock } = vi.hoisted(() => ({
  getUserMock: vi.fn(async () => ({ data: { user: { id: "org_1" } }, error: null })),
  maybeSingleMock: vi.fn(async () => ({
    data: {
      id: "evt_123",
      title: "My Event",
      event_date: "2026-05-06T00:00:00.000Z",
      plan: "free",
      access_code: "PARTY2026",
      organizer_id: "org_1",
    },
    error: null,
  })),
}));

vi.mock("@/lib/supabase-auth-server", async (importOriginal) => {
  const original = (await importOriginal()) as Record<string, unknown>;
  return {
    ...original,
    createSupabaseAuthServerClient: async () => ({
      auth: {
        getUser: getUserMock,
      },
      from: () => ({
        select: () => ({
          eq: () => ({
            maybeSingle: maybeSingleMock,
          }),
        }),
      }),
      storage: {
        from: () => ({
          createSignedUrls: async () => ({ data: [] }),
        }),
      },
    }),
  };
});

describe("EventAdminTabs", () => {
  const en = getAppStrings("en");
  const provider = en;

  it("renders all expected tabs with hrefs and a single selected marker when organizer tabs are visible", () => {
    const html = renderToStaticMarkup(
      <AppUiProvider value={{ locale: "en", ...provider }}>
        <EventAdminTabs eventId="evt_123" eventTitle="My Event" selectedTab="guests" showOrganizerOnlyTabs />
      </AppUiProvider>,
    );

    const labelByTab: Record<(typeof EVENT_ADMIN_TABS)[number]["id"], string> = {
      overview: en.eventNav.tabOverview,
      guests: en.eventNav.tabGuests,
      gallery: en.eventNav.tabGallery,
      share: en.eventNav.tabShare,
      prints: en.eventNav.tabPrints,
      settings: en.eventNav.tabSettings,
    };
    for (const tab of EVENT_ADMIN_TABS) {
      expect(html).toContain(labelByTab[tab.id]);
      expect(html).toContain(`/events/evt_123?tab=${tab.id}`);
    }

    const selectedMatchCount = html.match(/aria-current="page"/g)?.length ?? 0;
    expect(selectedMatchCount).toBe(1);
  });

  it("hides organizer-only tabs when showOrganizerOnlyTabs is false", () => {
    const html = renderToStaticMarkup(
      <AppUiProvider value={{ locale: "en", ...provider }}>
        <EventAdminTabs eventId="evt_123" eventTitle="My Event" selectedTab="overview" showOrganizerOnlyTabs={false} />
      </AppUiProvider>,
    );

    expect(html).not.toContain(`>${en.eventNav.tabSettings}<`);
    expect(html).not.toContain(`>${en.eventNav.tabPrints}<`);
    expect(html).not.toContain("tab=settings");
    expect(html).not.toContain("tab=prints");
    expect(html).toContain(">Overview<");
    expect(html).toContain("/events/evt_123?tab=gallery");
  });
});

describe("Event page tabs", () => {
  it("falls back to overview for unknown tab", () => {
    expect(resolveEventTab("not-a-real-tab")).toBe("overview");
  });

  it("accepts known tab ids", () => {
    expect(resolveEventTab("gallery")).toBe("gallery");
    expect(resolveEventTab("guests")).toBe("guests");
    expect(resolveEventTab("settings")).toBe("settings");
    expect(resolveEventTab("prints")).toBe("prints");
  });
});
