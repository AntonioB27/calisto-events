"use client";

import Link from "next/link";
import { Suspense } from "react";

import { EVENT_ADMIN_TABS, type EventAdminTabId } from "./event-admin-tabs";

type EventAdminTabsProps = Readonly<{
  eventId: string;
  selectedTab: EventAdminTabId;
  eventTitle: string;
  eventEmoji?: string;
}>;

function TabsInner({ eventId, selectedTab, eventTitle, eventEmoji = '📅' }: EventAdminTabsProps) {
  return (
    <div style={{ marginBottom: 24 }}>
      {/* Event heading */}
      <div style={{ width: 32, height: 3, background: 'var(--app-gold)', borderRadius: 2, marginBottom: 10 }} />
      <h1 style={{
        fontFamily: 'var(--font-display)', fontStyle: 'italic', fontWeight: 700,
        fontSize: 42, color: 'var(--app-text)', lineHeight: 1.1, marginBottom: 4,
      }}>
        {eventEmoji} {eventTitle}
      </h1>
      <p style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: 15, color: 'var(--app-muted)', marginBottom: 20 }}>
        Share with guests to let them join.
      </p>

      {/* Tab pills */}
      <div style={{
        display: 'flex', background: 'var(--app-card)',
        border: '1.5px solid var(--app-border)',
        borderRadius: 12, overflow: 'hidden', width: 'fit-content',
      }}>
        {EVENT_ADMIN_TABS.map(tab => {
          const on = tab.id === selectedTab;
          return (
            <Link
              key={tab.id}
              href={`/events/${eventId}?tab=${tab.id}`}
              aria-current={on ? 'page' : undefined}
              style={{
                padding: '9px 20px', fontSize: 14, fontWeight: on ? 600 : 400,
                color: on ? '#fff' : 'var(--app-muted)',
                background: on ? 'linear-gradient(135deg, var(--app-purple) 0%, #7B3FBE 100%)' : 'transparent',
                textDecoration: 'none', transition: 'all 0.15s',
                display: 'block',
              }}
            >
              {tab.label}
            </Link>
          );
        })}
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
