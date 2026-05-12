"use client";

import Link from "next/link";
import { startTransition, useEffect, useMemo, useState } from "react";

import { normalizeAccessCode } from "@/lib/access-code";
import { useAppUi } from "@/components/AppUiProvider";
import { AppBadge } from "@/components/app-ui/AppBadge";
import { AppBtn } from "@/components/app-ui/AppBtn";
import { AppCard } from "@/components/app-ui/AppCard";
import { AppPageHeader } from "@/components/app-ui/AppPageHeader";
import { displayNavEmoji, splitEventTitleStored } from "@/lib/event-title";
import type { DashboardEventRow } from "@/lib/dashboard-events";
import { formatUiDateShort } from "@/lib/format-ui-datetime";
import { interpolate } from "@/lib/app-ui";
import { loadSavedOrder, mergeWithSavedOrder } from "@/lib/my-events-order";
import { loadHiddenEventIds } from "@/lib/my-events-visibility";

type Props = Readonly<{
  organizerId: string;
  userName: string;
  events: DashboardEventRow[];
}>;

function EventCard({
  event,
  onOpen,
  locale,
  defaultEventTitle,
  roleOrganizer,
  roleCo,
  roleGuest,
  index,
}: Readonly<{
  event: DashboardEventRow;
  onOpen: (e: DashboardEventRow) => void;
  locale: ReturnType<typeof useAppUi>["locale"];
  defaultEventTitle: string;
  roleOrganizer: string;
  roleCo: string;
  roleGuest: string;
  index: number;
}>) {
  const { emoji: storedEmoji, name: displayTitle } = splitEventTitleStored(String(event.title ?? defaultEventTitle));
  const navEmoji = displayNavEmoji(storedEmoji);
  const isCoOrg = event.membershipRole === "co_organizer";
  const isGuest = event.membershipRole === "guest";
  const isUpcoming = event.event_date ? new Date(event.event_date) >= new Date() : false;

  return (
    <div className="welcome-reveal" style={{ animationDelay: `${0.06 + index * 0.055}s` }}>
      <AppCard
        hover
        pad="md"
        onClick={() => onOpen(event)}
        className={isGuest ? "event-card--guest" : isCoOrg ? "event-card--coorg" : "event-card--org"}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div
            style={{
              width: 48,
              height: 48,
              borderRadius: "var(--app-radius-md)",
              flexShrink: 0,
              background: isGuest
                ? "linear-gradient(135deg, color-mix(in srgb, var(--app-muted) 28%, transparent), color-mix(in srgb, var(--app-muted) 10%, transparent))"
                : isCoOrg
                ? "linear-gradient(135deg, color-mix(in srgb, var(--app-purple) 24%, transparent), color-mix(in srgb, var(--app-purple) 10%, transparent))"
                : "linear-gradient(135deg, color-mix(in srgb, var(--app-purple) 16%, transparent), color-mix(in srgb, var(--app-gold) 16%, transparent))",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 24,
            }}
          >
            {navEmoji}
          </div>

          <div style={{ flex: 1, minWidth: 0 }}>
            <div
              style={{
                fontFamily: "var(--font-display)",
                fontStyle: "italic",
                fontWeight: 700,
                fontSize: 18,
                color: "var(--app-text)",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {displayTitle}
            </div>
            <div
              style={{
                fontSize: 12,
                color: "var(--app-muted)",
                marginTop: 4,
                display: "flex",
                alignItems: "center",
                gap: 5,
                overflow: "hidden",
              }}
            >
              <span
                aria-hidden="true"
                className={`event-date-dot ${isUpcoming ? "event-date-dot--upcoming" : "event-date-dot--past"}`}
                style={{ flexShrink: 0 }}
              />
              <span
                style={{
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  minWidth: 0,
                }}
              >
                {formatUiDateShort(event.event_date, locale)}
                {" · "}
                <span style={{ color: isGuest ? "var(--app-muted)" : isCoOrg ? "var(--app-purple)" : "inherit" }}>
                  {isGuest ? roleGuest : isCoOrg ? roleCo : roleOrganizer}
                </span>
              </span>
            </div>
          </div>

          <div style={{ flexShrink: 0, display: "flex", alignItems: "center", gap: 8 }}>
            <AppBadge tone={isGuest ? "default" : isCoOrg ? "purple" : "accent"}>{event.plan}</AppBadge>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M9 18L15 12L9 6" stroke="var(--app-muted)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        </div>
      </AppCard>
    </div>
  );
}

export function DashboardClient({ organizerId, userName, events }: Props) {
  const ui = useAppUi();
  const [hiddenIds, setHiddenIds] = useState<Set<string>>(new Set());
  const [orderIds, setOrderIds] = useState<string[]>([]);

  useEffect(() => {
    startTransition(() => setHiddenIds(new Set(loadHiddenEventIds(organizerId))));
    startTransition(() => setOrderIds(loadSavedOrder(organizerId)));
  }, [organizerId]);

  const orderedEvents = useMemo(() => mergeWithSavedOrder(events, orderIds), [events, orderIds]);
  const visibleEvents = useMemo(() => orderedEvents.filter((e) => !hiddenIds.has(e.id)), [orderedEvents, hiddenIds]);

  function handleOpen(event: DashboardEventRow) {
    if (event.membershipRole === "guest") {
      window.location.href = `/join/${encodeURIComponent(normalizeAccessCode(event.access_code))}`;
      return;
    }
    window.location.href = `/events/${event.id}`;
  }

  const isEmpty = visibleEvents.length === 0;

  // Hint card delay: appears after all event cards finish staggering in
  const hintDelay = isEmpty ? 0 : 0.06 + visibleEvents.length * 0.055 + 0.08;

  return (
    <div style={{ padding: "40px 0 60px" }}>
      <div className="welcome-reveal">
        <AppPageHeader
          eyebrow={ui.dashboard.eyebrow}
          title={interpolate(ui.dashboard.helloTemplate, { name: userName })}
          description={isEmpty ? undefined : ui.dashboard.subtitle}
          actions={
            isEmpty ? undefined : (
              <>
                <AppBtn as={Link} href="/join" variant="outline" size="sm">
                  {ui.dashboard.joinWithCode}
                </AppBtn>
                <AppBtn as={Link} href="/events/new" variant="primary" size="sm">
                  {ui.dashboard.createEvent}
                </AppBtn>
              </>
            )
          }
        />
      </div>

      {visibleEvents.length > 0 && (
        <div style={{ marginBottom: 24 }} className="welcome-reveal welcome-reveal--d1">
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 18 }}>
            <div style={{ width: 3, height: 18, background: "var(--app-gold)", borderRadius: 2 }} />
            <span
              style={{
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                color: "var(--app-muted)",
              }}
            >
              {ui.dashboard.yourEvents}
            </span>
            <span
              style={{
                fontSize: 11,
                fontWeight: 600,
                letterSpacing: "0.08em",
                color: "var(--app-subtle)",
              }}
            >
              · {visibleEvents.length}
            </span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {visibleEvents.map((e, i) => (
              <EventCard
                key={e.id}
                event={e}
                onOpen={handleOpen}
                locale={ui.locale}
                defaultEventTitle={ui.defaults.eventTitle}
                roleOrganizer={ui.dashboard.roleOrganizer}
                roleCo={ui.dashboard.roleCoOrganizer}
                roleGuest={ui.dashboard.roleGuest}
                index={i}
              />
            ))}
          </div>
        </div>
      )}

      {isEmpty ? (
        /* ── Empty state: atmospheric hero card with CTA ── */
        <div className="dash-empty-card welcome-reveal welcome-reveal--d1">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/brand/mascot/aurora_key.png"
            alt=""
            style={{ width: 88, height: 132, objectFit: "contain" }}
          />
          <p
            style={{
              fontFamily: "var(--font-display)",
              fontStyle: "italic",
              fontSize: 15,
              color: "var(--app-muted)",
              maxWidth: 320,
              lineHeight: 1.6,
              margin: 0,
            }}
          >
            {ui.dashboard.emptyHint}
          </p>
          <AppBtn as={Link} href="/events/new" variant="gold" size="md">
            {ui.dashboard.createEvent}
          </AppBtn>
        </div>
      ) : (
        /* ── Non-empty: compact hint row ── */
        <div className="welcome-reveal" style={{ animationDelay: `${hintDelay}s` }}>
          <AppCard pad="md">
            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/brand/mascot/aurora_key.png"
                alt=""
                style={{ width: 36, height: 54, objectFit: "contain", flexShrink: 0, opacity: 0.8 }}
              />
              <p
                style={{
                  fontFamily: "var(--font-display)",
                  fontStyle: "italic",
                  fontSize: 14,
                  color: "var(--app-muted)",
                  margin: 0,
                  lineHeight: 1.55,
                }}
              >
                {ui.dashboard.moreHint}
              </p>
            </div>
          </AppCard>
        </div>
      )}
    </div>
  );
}
