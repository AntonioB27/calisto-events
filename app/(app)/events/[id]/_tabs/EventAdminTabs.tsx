"use client";

import Link from "next/link";
import { Suspense } from "react";

import { EVENT_ADMIN_TABS, type EventAdminTabId } from "./event-admin-tabs";

type EventAdminTabsProps = Readonly<{
  eventId: string;
  selectedTab: EventAdminTabId;
  eventTitle: string;
  eventEmoji?: string;
  /** When false, hides tabs marked `visibleTo: "organizer"` (e.g. Settings). */
  showOrganizerOnlyTabs?: boolean;
}>;

function TabsInner({
  eventId,
  selectedTab,
  eventTitle,
  eventEmoji = "📅",
  showOrganizerOnlyTabs = false,
}: EventAdminTabsProps) {
  const tabs = EVENT_ADMIN_TABS.filter((t) => t.visibleTo === "all" || showOrganizerOnlyTabs);

  return (
    <div className="event-navbar">
      <div className="event-navbar__inner">
        <div className="event-navbar__rule" />
        <h1 className="event-navbar__title">
          <span className="calisto-emoji-upright">{eventEmoji}</span>{" "}
          {eventTitle}
        </h1>
        <p className="event-navbar__sub">Share with guests to let them join.</p>

        <div className="event-navbar__tabs" role="tablist" aria-label="Event sections">
          {tabs.map((tab) => {
            const on = tab.id === selectedTab;
            return (
              <Link
                key={tab.id}
                href={`/events/${eventId}?tab=${tab.id}`}
                aria-current={on ? "page" : undefined}
                className="event-navbar__tab"
              >
                {tab.label}
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export function EventAdminTabs(props: EventAdminTabsProps) {
  return (
    <Suspense fallback={<div style={{ height: 80 }} />}>
      <TabsInner {...props} />
    </Suspense>
  );
}
