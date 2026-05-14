"use client";

import Link from "next/link";
import { Suspense } from "react";

import { useAppUi } from "@/components/AppUiProvider";

import { EVENT_ADMIN_TABS, type EventAdminTabId } from "./event-admin-tabs";

function labelForAdminTab(tab: EventAdminTabId, t: ReturnType<typeof useAppUi>): string {
  switch (tab) {
    case "overview":
      return t.eventNav.tabOverview;
    case "guests":
      return t.eventNav.tabGuests;
    case "gallery":
      return t.eventNav.tabGallery;
    case "share":
      return t.eventNav.tabShare;
    case "prints":
      return t.eventNav.tabPrints;
    case "settings":
      return t.eventNav.tabSettings;
  }
}

function TabIcon({ tab }: { tab: EventAdminTabId }) {
  switch (tab) {
    case "overview":
      return (
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <rect x="3" y="3" width="8" height="8" rx="1.5" stroke="currentColor" strokeWidth="2" />
          <rect x="13" y="3" width="8" height="8" rx="1.5" stroke="currentColor" strokeWidth="2" />
          <rect x="3" y="13" width="8" height="8" rx="1.5" stroke="currentColor" strokeWidth="2" />
          <rect x="13" y="13" width="8" height="8" rx="1.5" stroke="currentColor" strokeWidth="2" />
        </svg>
      );
    case "guests":
      return (
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <circle cx="9" cy="7" r="3" stroke="currentColor" strokeWidth="2" />
          <path d="M2 20C2 16.686 5.134 14 9 14C12.866 14 16 16.686 16 20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          <path d="M16 11C18.209 11 20 9.209 20 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          <path d="M19 15C20.657 15.5 22 17.119 22 20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
      );
    case "gallery":
      return (
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M23 19C23 20.105 22.105 21 21 21H3C1.895 21 1 20.105 1 19V8C1 6.895 1.895 6 3 6H7L9 3H15L17 6H21C22.105 6 23 6.895 23 8V19Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
          <circle cx="12" cy="13" r="4" stroke="currentColor" strokeWidth="2" />
        </svg>
      );
    case "share":
      return (
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M16 6L12 2L8 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          <line x1="12" y1="2" x2="12" y2="15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
      );
    case "prints":
      return (
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M6 9V4h12v5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          <path
            d="M6 14H4a2 2 0 0 1-2-2v-1a2 2 0 0 1 2-2h2M18 14h2a2 2 0 0 0 2-2v-1a2 2 0 0 0-2-2h-2M6 14v7h12v-7"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      );
    case "settings":
      return (
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2" />
          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" stroke="currentColor" strokeWidth="2" />
        </svg>
      );
  }
}

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
  const ui = useAppUi();
  const tabs = EVENT_ADMIN_TABS.filter((t) => t.visibleTo === "all" || showOrganizerOnlyTabs);

  return (
    <div className="event-navbar welcome-reveal">
      <div className="event-navbar__inner">
        <div className="event-navbar__rule" />
        <h1 className="event-navbar__title">
          <span className="calisto-emoji-upright">{eventEmoji}</span>{" "}
          {eventTitle}
        </h1>
        <p className="event-navbar__sub">{ui.eventNav.subtitle}</p>

        <div className="event-navbar__tabs" role="tablist" aria-label={ui.eventNav.tabsAria}>
          {tabs.map((tab) => {
            const on = tab.id === selectedTab;
            return (
              <Link
                key={tab.id}
                href={`/events/${eventId}?tab=${tab.id}`}
                aria-current={on ? "page" : undefined}
                className="event-navbar__tab"
              >
                <TabIcon tab={tab.id} />
                {labelForAdminTab(tab.id, ui)}
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
