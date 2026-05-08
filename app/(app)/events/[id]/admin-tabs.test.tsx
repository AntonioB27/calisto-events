import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

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
  it("renders all expected tabs with hrefs and a single selected marker", () => {
    const html = renderToStaticMarkup(
      <EventAdminTabs eventId="evt_123" selectedTab="guests" />,
    );

    for (const tab of EVENT_ADMIN_TABS) {
      expect(html).toContain(tab.label);
      expect(html).toContain(`/events/evt_123?tab=${tab.id}`);
    }

    const selectedMatchCount = html.match(/aria-current="page"/g)?.length ?? 0;
    expect(selectedMatchCount).toBe(1);
  });
});

describe("Event page tabs", () => {
  it("falls back to overview for unknown tab", () => {
    expect(resolveEventTab("not-a-real-tab")).toBe("overview");
  });

  it("accepts known tab ids", () => {
    expect(resolveEventTab("gallery")).toBe("gallery");
    expect(resolveEventTab("guests")).toBe("guests");
  });
});
