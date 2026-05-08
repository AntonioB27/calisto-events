"use client";

import Link from "next/link";
import { startTransition, useEffect, useMemo, useState } from "react";

import { AppBadge } from "@/components/app-ui/AppBadge";
import { AppBtn } from "@/components/app-ui/AppBtn";
import { AppCard } from "@/components/app-ui/AppCard";
import { AppPageHeader } from "@/components/app-ui/AppPageHeader";
import { loadSavedOrder, mergeWithSavedOrder } from "@/lib/my-events-order";
import { loadHiddenEventIds } from "@/lib/my-events-visibility";

type EventRow = {
  id: string;
  title: string;
  event_date: string;
  plan: string;
  access_code: string;
};

type Props = Readonly<{
  organizerId: string;
  userName: string;
  events: EventRow[];
}>;

function formatDate(iso: string) {
  try {
    return new Date(iso).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
  } catch {
    return iso;
  }
}

function EventCard({ event, onOpen }: { event: EventRow; onOpen: (e: EventRow) => void }) {
  const emoji = event.plan === "premium" || event.plan === "max" ? "💍" : "📅";

  return (
    <AppCard hover pad="md" onClick={() => onOpen(event)}>
      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        <div
          style={{
            width: 48,
            height: 48,
            borderRadius: "var(--app-radius-md)",
            flexShrink: 0,
            background:
              "linear-gradient(135deg, color-mix(in srgb, var(--app-purple) 16%, transparent), color-mix(in srgb, var(--app-gold) 16%, transparent))",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 24,
          }}
        >
          {emoji}
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
            {event.title}
          </div>
          <div style={{ fontSize: 12, color: "var(--app-muted)", marginTop: 3 }}>
            {formatDate(event.event_date)} · Organizer
          </div>
        </div>
        <div style={{ flexShrink: 0, display: "flex", alignItems: "center", gap: 8 }}>
          <AppBadge tone="accent">{event.plan}</AppBadge>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M9 18L15 12L9 6" stroke="var(--app-muted)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      </div>
    </AppCard>
  );
}

export function DashboardClient({ organizerId, userName, events }: Props) {
  const [hiddenIds, setHiddenIds] = useState<Set<string>>(new Set());
  const [orderIds, setOrderIds] = useState<string[]>([]);

  useEffect(() => {
    startTransition(() => setHiddenIds(new Set(loadHiddenEventIds(organizerId))));
    startTransition(() => setOrderIds(loadSavedOrder(organizerId)));
  }, [organizerId]);

  const orderedEvents = useMemo(() => mergeWithSavedOrder(events, orderIds), [events, orderIds]);
  const visibleEvents = useMemo(() => orderedEvents.filter((e) => !hiddenIds.has(e.id)), [orderedEvents, hiddenIds]);

  function handleOpen(event: EventRow) {
    window.location.href = `/events/${event.id}`;
  }

  return (
    <div style={{ padding: "40px 0 60px" }}>
      <AppPageHeader
        eyebrow="Dashboard"
        title={`Hello, ${userName}`}
        description="Your shared albums, all in one place."
        actions={
          <>
            <AppBtn as={Link} href="/join" variant="outline" size="sm">
              Join with code
            </AppBtn>
            <AppBtn as={Link} href="/events/new" variant="primary" size="sm">
              + Create event
            </AppBtn>
          </>
        }
      />

      {visibleEvents.length > 0 && (
        <div style={{ marginBottom: 24 }}>
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
              My Events
            </span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {visibleEvents.map((e) => (
              <EventCard key={e.id} event={e} onOpen={handleOpen} />
            ))}
          </div>
        </div>
      )}

      <AppCard pad="lg">
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12, textAlign: "center" }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="https://www.calisto-events.com/_next/image?url=%2Fbrand%2Fmascot%2Faurora_key.png&w=384&q=75"
            alt="Aurora"
            style={{ width: 72, height: 72, objectFit: "contain", filter: "drop-shadow(0 3px 8px rgba(0,0,0,0.08))" }}
          />
          <p
            style={{
              fontFamily: "var(--font-display)",
              fontStyle: "italic",
              fontSize: 15,
              color: "var(--app-muted)",
              maxWidth: 340,
              lineHeight: 1.6,
              margin: 0,
            }}
          >
            {visibleEvents.length === 0
              ? "Create a new event or join an existing one with a code from your organizer."
              : "Create another event or join one with a code from your organizer."}
          </p>
        </div>
      </AppCard>
    </div>
  );
}
