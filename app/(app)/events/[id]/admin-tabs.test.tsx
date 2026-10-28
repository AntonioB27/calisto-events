import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

import { AppUiProvider } from "@/components/AppUiProvider";
import { getAppStrings } from "@/lib/app-ui";

import { resolveEventTab } from "./page";
import { EventAdminTabs } from "./_tabs/EventAdminTabs";
import { EVENT_ADMIN_TABS } from "./_tabs/event-admin-tabs";
import { MoreTab } from "./_tabs/MoreTab";

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

vi.mock("next/navigation", async (importOriginal) => ({
  ...((await importOriginal()) as Record<string, unknown>),
  useRouter: () => ({ push: vi.fn(), refresh: vi.fn() }),
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

  it("renders the four bottom-nav links with hrefs and a single current marker", () => {
    const html = renderToStaticMarkup(
      <AppUiProvider value={{ locale: "en", ...provider }}>
        <EventAdminTabs eventId="evt_123" eventTitle="My Event" accessCode="PARTY2026" selectedTab="guests" />
      </AppUiProvider>,
    );

    const navTabs = [
      ["overview", en.aurora.navHome],
      ["gallery", en.aurora.navAlbum],
      ["guests", en.aurora.navGuests],
      ["more", en.aurora.navMore],
    ] as const;
    for (const [id, label] of navTabs) {
      expect(html).toContain(label);
      expect(html).toContain(`/events/evt_123?tab=${id}`);
    }
    expect(html).not.toContain('role="tab"');
    expect(html.match(/aria-current="page"/g)?.length ?? 0).toBe(1);
  });

  it("shows the pending-review badge on Album only when moderation is on", () => {
    const render = (moderationEnabled: boolean) =>
      renderToStaticMarkup(
        <AppUiProvider value={{ locale: "en", ...provider }}>
          <EventAdminTabs
            eventId="evt_123"
            eventTitle="My Event"
            selectedTab="overview"
            accessCode="PARTY2026"
            moderationEnabled={moderationEnabled}
            pendingReviewCount={7}
          />
        </AppUiProvider>,
      );
    const waiting = en.aurora.waitingForYou.replace("{count}", "7");
    expect(render(true)).toContain(waiting);
    expect(render(false)).not.toContain(waiting);
  });

  const renderTab = (selectedTab: "overview" | "gallery" | "share", extra: { coverPhoto?: string; eventDate?: string } = {}) =>
    renderToStaticMarkup(
      <AppUiProvider value={{ locale: "en", ...provider }}>
        <EventAdminTabs eventId="evt_123" eventTitle="My Event" accessCode="PARTY2026" selectedTab={selectedTab} {...extra} />
      </AppUiProvider>,
    );

  it("puts the cover on Home: newest photo, back to events, view as guest in a new tab", () => {
    const html = renderTab("overview", { coverPhoto: "https://cdn.test/newest.jpg" });
    expect(html).toContain('class="guest-cover event-cover"');
    expect(html).toContain('src="https://cdn.test/newest.jpg"');
    expect(html).toContain('href="/dashboard"');
    expect(html).toContain(en.eventShell.yourEvents);
    expect(html).toMatch(/href="\/join\/PARTY2026" target="_blank"/);
    expect(html).toContain(`aria-label="${en.eventShell.viewAsGuest}"`);
  });

  it("falls back to the emoji cover and shows the live pill during the event", () => {
    const today = new Date().toISOString().slice(0, 10);
    const html = renderTab("overview", { eventDate: today });
    expect(html).toContain("guest-cover--empty");
    expect(html).toContain(en.aurora.liveNow);
  });

  it("gives other tabs one slim bar whose back button follows where the tab lives", () => {
    const gallery = renderTab("gallery");
    expect(gallery).toContain("guest-album-bar event-bar");
    expect(gallery).not.toContain('class="guest-cover ');
    expect(gallery).toMatch(new RegExp(`<a aria-label="${en.eventShell.yourEvents}"[^>]*href="/dashboard"`));

    const share = renderTab("share");
    expect(share).toMatch(new RegExp(`<a aria-label="${en.aurora.navMore}"[^>]*href="/events/evt_123\\?tab=more"`));
  });
});

describe("MoreTab", () => {
  const en = getAppStrings("en");
  const render = (isPrimaryOrganizer: boolean) =>
    renderToStaticMarkup(
      <AppUiProvider value={{ locale: "en", ...en }}>
        <MoreTab
          eventId="evt_123"
          accessCode="PARTY2026"
          isPrimaryOrganizer={isPrimaryOrganizer}
          plan="free"
          eventDate="2026-05-06"
          scheduledDeletionAt={null}
          photoCount={3}
        />
      </AppUiProvider>,
    );

  it("links every secondary tab for the primary organizer", () => {
    const html = render(true);
    for (const tab of EVENT_ADMIN_TABS) {
      if (tab.id === "overview" || tab.id === "guests" || tab.id === "more") continue;
      expect(html).toContain(`/events/evt_123?tab=${tab.id}`);
    }
    expect(html).toContain("/events/evt_123?tab=gallery&amp;export=zip");
    expect(html).toMatch(/href="\/join\/PARTY2026" target="_blank"/);
    expect(html).toContain(en.eventShell.deleteEvent);
    expect(html).not.toContain(en.leave.ctaOrganizerTab);
  });

  it("hides organizer-only rows from co-organizers", () => {
    const html = render(false);
    expect(html).toContain("/events/evt_123?tab=share");
    expect(html).toContain("/events/evt_123?tab=rsvp");
    expect(html).not.toContain("tab=settings");
    expect(html).not.toContain("tab=prints");
    expect(html).not.toContain(en.eventShell.deleteEvent);
    expect(html).toContain("/join/PARTY2026");
    expect(html).toContain(en.leave.ctaOrganizerTab);
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
    expect(resolveEventTab("more")).toBe("more");
  });
});
