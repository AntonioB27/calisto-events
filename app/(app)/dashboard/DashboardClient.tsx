"use client";

import Link from "next/link";
import { startTransition, useEffect, useMemo, useState } from "react";

import { loadSavedOrder, mergeWithSavedOrder } from "@/lib/my-events-order";
import { loadHiddenEventIds } from "@/lib/my-events-visibility";
import { GoldBar } from "@/components/app-ui/GoldBar";

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
    return new Date(iso).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  } catch {
    return iso;
  }
}

function EventCard({ event, onOpen }: { event: EventRow; onOpen: (e: EventRow) => void }) {
  const [hov, setHov] = useState(false);
  const emoji = event.plan === 'premium' || event.plan === 'max' ? '💍' : '📅';

  return (
    <div
      onClick={() => onOpen(event)}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      role="button"
      tabIndex={0}
      onKeyDown={e => e.key === 'Enter' && onOpen(event)}
      style={{
        background: 'var(--app-card)', borderRadius: 18,
        border: '1.5px solid var(--app-border)',
        padding: '18px 20px',
        display: 'flex', alignItems: 'center', gap: 16,
        cursor: 'pointer',
        boxShadow: hov ? '0 8px 32px rgba(0,0,0,0.08)' : '0 2px 8px rgba(0,0,0,0.04)',
        transform: hov ? 'translateY(-2px)' : 'none',
        transition: 'all 0.18s',
      }}
    >
      <div style={{
        width: 48, height: 48, borderRadius: 12, flexShrink: 0,
        background: 'linear-gradient(135deg, color-mix(in srgb, var(--app-purple) 13%, transparent), color-mix(in srgb, var(--app-gold) 13%, transparent))',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 24,
      }}>
        {emoji}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontFamily: 'var(--font-display)', fontStyle: 'italic', fontWeight: 700,
          fontSize: 18, color: 'var(--app-text)',
          whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
        }}>
          {event.title}
        </div>
        <div style={{ fontSize: 12, color: 'var(--app-muted)', marginTop: 3 }}>
          {formatDate(event.event_date)} · Organizer
        </div>
      </div>
      <div style={{ flexShrink: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{
          fontSize: 11, fontWeight: 700, color: 'var(--app-gold)',
          background: 'color-mix(in srgb, var(--app-gold) 12%, transparent)',
          padding: '3px 10px', borderRadius: 20,
          border: '1px solid color-mix(in srgb, var(--app-gold) 27%, transparent)',
          textTransform: 'uppercase',
        }}>
          {event.plan}
        </span>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M9 18L15 12L9 6" stroke="var(--app-muted)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>
    </div>
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
  const visibleEvents = useMemo(() => orderedEvents.filter(e => !hiddenIds.has(e.id)), [orderedEvents, hiddenIds]);

  function handleOpen(event: EventRow) {
    window.location.href = `/events/${event.id}`;
  }

  return (
    <div style={{ padding: '40px 0 60px' }}>
      {/* Hero */}
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 36, flexWrap: 'wrap', gap: 20 }}>
        <div>
          <GoldBar />
          <h1 style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontWeight: 700, fontSize: 44, color: 'var(--app-text)', lineHeight: 1.1, marginTop: 10 }}>
            Hello, {userName} 👋
          </h1>
          <p style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: 16, color: 'var(--app-muted)', marginTop: 6 }}>
            Your shared albums, all in one place.
          </p>
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <Link href="/join" style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            padding: '9px 18px', borderRadius: 10, fontSize: 13, fontWeight: 600,
            background: 'transparent', color: 'var(--app-gold)',
            border: '1.5px solid var(--app-gold)', textDecoration: 'none',
          }}>
            Join with code
          </Link>
          <Link href="/events/new" style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            padding: '9px 18px', borderRadius: 10, fontSize: 13, fontWeight: 600,
            background: 'linear-gradient(135deg, var(--app-purple) 0%, #7B3FBE 100%)',
            color: '#fff', textDecoration: 'none',
          }}>
            + Create event
          </Link>
        </div>
      </div>

      {/* Events list */}
      {visibleEvents.length > 0 && (
        <div style={{ marginBottom: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18 }}>
            <div style={{ width: 3, height: 18, background: 'var(--app-gold)', borderRadius: 2 }} />
            <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--app-muted)' }}>
              My Events
            </span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {visibleEvents.map(e => <EventCard key={e.id} event={e} onOpen={handleOpen} />)}
          </div>
        </div>
      )}

      {/* Empty / hint card */}
      <div style={{
        background: 'var(--app-card)', borderRadius: 18,
        border: '1.5px solid var(--app-border)',
        padding: '36px 32px',
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        gap: 12, textAlign: 'center',
      }}>
        <span style={{ fontSize: 40 }}>🔑</span>
        <p style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: 15, color: 'var(--app-muted)', maxWidth: 340, lineHeight: 1.6 }}>
          {visibleEvents.length === 0
            ? 'Create a new event or join an existing one with a code from your organizer.'
            : 'Create another event or join one with a code from your organizer.'}
        </p>
      </div>
    </div>
  );
}
