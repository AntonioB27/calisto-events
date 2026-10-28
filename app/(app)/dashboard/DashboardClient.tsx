"use client";

import Link from "next/link";
import { startTransition, useEffect, useMemo, useState } from "react";
import { Download, Key, Plus } from "lucide-react";

import { normalizeAccessCode } from "@/lib/access-code";
import { useAppUi } from "@/components/AppUiProvider";
import { AppBtn } from "@/components/app-ui/AppBtn";
import { Aurora, AuroraSays } from "@/components/app-ui/Aurora";
import { displayNavEmoji, splitEventTitleStored } from "@/lib/event-title";
import type { DashboardEventRow } from "@/lib/dashboard-events";
import { daysUntilEvent, getEventPhase } from "@/lib/event-phase";
import { interpolate } from "@/lib/app-ui";
import { plural } from "@/lib/app-ui/plural";
import { bcp47FromUiLocale } from "@/lib/locale-bcp47";
import { loadHiddenEventIds } from "@/lib/my-events-visibility";

const SERIF = "var(--font-display)";
const GOLD_INK = "var(--app-gold-ink)";
const DAY_MS = 24 * 60 * 60 * 1000;
/** An upcoming event takes the top card only when it is this close; further out it is just "coming up". */
const SOON_DAYS = 60;
/** Show the "download by" chip only when the deletion date is this close. */
const URGENT_DAYS = 14;

// Print positions: three-print stack (top card, latest album) and two-print pair (album grid).
const STACK3: React.CSSProperties[] = [
  { left: 4, top: 30, width: "48%", height: 150, transform: "rotate(-6deg)" },
  { right: 2, top: 10, width: "48%", height: 156, transform: "rotate(5deg)" },
  { left: "23%", top: 34, width: "52%", height: 166, transform: "rotate(-1.5deg)" },
];
const STACK2: React.CSSProperties[] = [
  { left: 6, top: 16, width: "70%", height: 118, borderWidth: 4, transform: "rotate(-7deg)" },
  { right: 4, top: 6, width: "73%", height: 132, borderWidth: 4, transform: "rotate(4deg)" },
];

const byDate = (x: DashboardEventRow, y: DashboardEventRow) => Date.parse(x.event_date) - Date.parse(y.event_date);
const isUrgent = (deletionIso: string, now = Date.now()) => {
  const left = Date.parse(deletionIso) - now;
  return left > 0 && left < URGENT_DAYS * DAY_MS;
};

const titleStyle: React.CSSProperties = { margin: 0, fontFamily: SERIF, fontWeight: 400, color: "var(--app-text)" };

function Chevron() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true" style={{ color: "var(--app-subtle)", flexShrink: 0 }}>
      <path d="M9 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

type Props = Readonly<{
  organizerId: string;
  events: DashboardEventRow[];
  newUploadCounts?: Readonly<Record<string, number>>;
  photos?: Readonly<Record<string, string[]>>;
  memoryCounts?: Readonly<Record<string, number>>;
  deletionDates?: Readonly<Record<string, string>>;
  guestCounts?: Readonly<Record<string, number>>;
  myUploadCounts?: Readonly<Record<string, number>>;
}>;

export function DashboardClient({
  organizerId,
  events,
  newUploadCounts = {},
  photos = {},
  memoryCounts = {},
  deletionDates = {},
  guestCounts = {},
  myUploadCounts = {},
}: Props) {
  const ui = useAppUi();
  const a = ui.aurora;
  const t = ui.eventsList;
  const [hiddenIds, setHiddenIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    startTransition(() => setHiddenIds(new Set(loadHiddenEventIds(organizerId))));
  }, [organizerId]);

  const locale = bcp47FromUiLocale(ui.locale);
  const fmt = (iso: string, opts: Intl.DateTimeFormatOptions) =>
    new Date(iso.length === 10 ? iso + "T00:00:00Z" : iso).toLocaleDateString(locale, { timeZone: "UTC", ...opts });

  // One timeline per section: upcoming soonest first, past newest first, own and joined events mixed by date.
  const { live, soon, planned, past } = useMemo(() => {
    const visible = events.filter((e) => !hiddenIds.has(e.id));
    const own = visible.filter((e) => e.membershipRole !== "guest");
    const live = own.filter((e) => getEventPhase(e.event_date) === "during").sort(byDate)[0];
    const soon = live
      ? undefined
      : own
          .filter((e) => getEventPhase(e.event_date) === "before" && daysUntilEvent(e.event_date) <= SOON_DAYS)
          .sort(byDate)[0];
    const hero = live ?? soon;
    return {
      live,
      soon,
      planned: visible.filter((e) => e !== hero && getEventPhase(e.event_date) !== "after").sort(byDate),
      past: visible.filter((e) => getEventPhase(e.event_date) === "after").sort((x, y) => byDate(y, x)),
    };
  }, [events, hiddenIds]);

  const nameOf = (e: DashboardEventRow) => splitEventTitleStored(String(e.title)).name;
  const emojiOf = (e: DashboardEventRow) => displayNavEmoji(splitEventTitleStored(String(e.title)).emoji);
  const eventHref = (e: DashboardEventRow, tab?: string) =>
    e.membershipRole === "guest"
      ? `/join/${encodeURIComponent(normalizeAccessCode(e.access_code))}`
      : `/events/${e.id}${tab ? `?tab=${tab}` : ""}`;

  const memoriesText = (e: DashboardEventRow) => {
    const n = memoryCounts[e.id] ?? 0;
    return n > 0 ? plural(locale, n, t.memories) : t.noMemories;
  };
  const whenText = (days: number) =>
    days <= 0 ? a.today : days === 1 ? t.tomorrow : interpolate(a.inDays, { days: String(days) });
  // Line under an album: guests see what they added, hosts see how many guests contributed.
  const albumLine = (e: DashboardEventRow) => {
    if (e.membershipRole === "guest") {
      const mine = myUploadCounts[e.id] ?? 0;
      return mine > 0 ? `${memoriesText(e)} · ${interpolate(t.youAdded, { count: String(mine) })}` : memoriesText(e);
    }
    const guests = guestCounts[e.id] ?? 0;
    return (memoryCounts[e.id] ?? 0) > 0 && guests > 0 ? `${memoriesText(e)} ${plural(locale, guests, t.fromGuests)}` : memoriesText(e);
  };
  const urgentDeadline = (e: DashboardEventRow) => {
    const del = e.membershipRole !== "guest" && deletionDates[e.id];
    return del && isUrgent(del) ? interpolate(t.downloadBy, { date: fmt(del, { day: "numeric", month: "long" }) }) : null;
  };

  // Photos as prints, or the event emoji on a warm tile when there are none yet.
  function prints(e: DashboardEventRow, layout: React.CSSProperties[], height: number) {
    const pics = (photos[e.id] ?? []).slice(0, layout.length);
    return (
      <span style={{ display: "block", position: "relative", height }}>
        {e.membershipRole === "guest" && (
          <span
            style={{ position: "absolute", left: 0, top: 0, zIndex: 1, padding: "4px 10px", borderRadius: 99, background: "var(--app-surface)", border: "1px solid var(--app-border-strong)", boxShadow: "0 4px 10px -6px rgba(60,35,10,0.4)", fontSize: 12, fontWeight: 700, color: "var(--app-text-sub)" }}
          >
            {ui.dashboard.roleGuest}
          </span>
        )}
        {pics.length > 0 ? (
          pics.map((src, i) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img key={src} src={src} alt="" className="print-photo" style={{ position: "absolute", ...layout[layout.length - pics.length + i] }} />
          ))
        ) : (
          <span
            aria-hidden
            style={{ position: "absolute", inset: "10px 8px 0", borderRadius: 18, background: "var(--app-gold-bg)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: Math.round(height * 0.45), lineHeight: 1 }}
          >
            <span style={{ transform: "rotate(-6deg)" }}>{emojiOf(e)}</span>
          </span>
        )}
      </span>
    );
  }

  function deadlineChip(e: DashboardEventRow) {
    const text = urgentDeadline(e);
    if (!text) return null;
    return (
      <span
        style={{ display: "inline-flex", alignItems: "center", gap: 6, marginTop: 10, padding: "6px 12px", borderRadius: 99, background: "rgba(240,179,75,0.22)", border: "1px solid rgba(201,145,46,0.45)", fontSize: 13, fontWeight: 700, color: GOLD_INK }}
      >
        <Download size={14} aria-hidden /> {text}
      </span>
    );
  }

  const rowStyle: React.CSSProperties = { minHeight: 76, display: "flex", alignItems: "center", gap: 14, padding: "6px 2px", textDecoration: "none", color: "var(--app-text)" };
  const subStyle: React.CSSProperties = { display: "block", marginTop: 2, fontSize: 14, color: "var(--app-muted)" };

  const [latest, ...older] = past;

  return (
    <div className="welcome-reveal" style={{ maxWidth: 640, margin: "0 auto", padding: "22px 2px 48px" }}>
      <h1 style={{ ...titleStyle, fontSize: 42, lineHeight: 1, letterSpacing: "-0.02em" }}>{ui.dashboard.yourEvents}</h1>

      {/* ── Top card: live event, an event coming up soon, or an invitation to plan one ── */}
      {live ? (
        <Link href={eventHref(live, "gallery")} className="warm-card" style={{ display: "block", marginTop: 20, padding: "16px 16px 18px", textDecoration: "none", color: "var(--app-text)" }}>
          <span style={{ display: "block", position: "relative" }}>
            {prints(live, STACK3, 196)}
            <span style={{ position: "absolute", left: 0, top: 0, padding: "5px 12px", borderRadius: 99, background: "linear-gradient(135deg,#f5c76b,#f0b34b)", fontSize: 13, fontWeight: 700, color: "#1b1208", boxShadow: "0 6px 12px -6px rgba(150,100,20,0.6)" }}>
              {a.liveNow}
            </span>
          </span>
          <span style={{ display: "block", marginTop: 14, fontFamily: SERIF, fontSize: 30, lineHeight: 1 }}>{nameOf(live)}</span>
          <span style={{ display: "block", marginTop: 6, fontSize: 15, color: "var(--app-text-sub)" }}>
            {interpolate(t.soFar, { memories: memoriesText(live) })}
            {(newUploadCounts[live.id] ?? 0) > 0 && (
              <>
                {", "}
                <span style={{ fontWeight: 700, color: GOLD_INK }}>{interpolate(a.waitingForYou, { count: String(newUploadCounts[live.id]) })}</span>
              </>
            )}
          </span>
          <span className="app-btn app-btn--gold app-btn--md" style={{ display: "flex", marginTop: 14, minHeight: 50, borderRadius: 15 }}>
            {(newUploadCounts[live.id] ?? 0) > 0 ? t.seeNew : a.nextDuringSecondary}
          </span>
        </Link>
      ) : soon ? (
        <section aria-labelledby="soon-title" className="warm-card" style={{ position: "relative", marginTop: 20, padding: 20 }}>
          <Aurora pose="qr" size={112} style={{ position: "absolute", right: 10, top: 10 }} />
          <h2 id="soon-title" style={{ ...titleStyle, paddingRight: 116, fontSize: 30, lineHeight: 1.02 }}>
            <Link href={eventHref(soon)} style={{ color: "inherit", textDecoration: "none" }}>{nameOf(soon)}</Link>
          </h2>
          <p style={{ margin: "6px 0 0", paddingRight: 116, fontSize: 14, fontWeight: 700, color: GOLD_INK }}>
            {fmt(soon.event_date, { weekday: "long", day: "numeric", month: "long" })} · {whenText(daysUntilEvent(soon.event_date))}
          </p>
          <AuroraSays size={21} style={{ marginTop: 18 }}>{a.nextBefore}</AuroraSays>
          <p style={{ margin: "6px 0 0", fontSize: 14, lineHeight: 1.45, color: "var(--app-text-sub)" }}>{a.nextBeforeDetail}</p>
          <div style={{ marginTop: 14, display: "flex", gap: 10 }}>
            <AppBtn as={Link} href={eventHref(soon, soon.membershipRole === "organizer" ? "prints" : "share")} variant="gold" style={{ flex: 1, minHeight: 50, borderRadius: 15 }}>
              {soon.membershipRole === "organizer" ? a.nextBeforePrimary : a.nextBeforeSecondary}
            </AppBtn>
            {soon.membershipRole === "organizer" && (
              <AppBtn as={Link} href={eventHref(soon, "share")} variant="outline" style={{ flex: 1, minHeight: 50, borderRadius: 15 }}>
                {a.nextBeforeSecondary}
              </AppBtn>
            )}
          </div>
        </section>
      ) : (
        <section aria-labelledby="plan-title" className="warm-card" style={{ position: "relative", marginTop: 92, padding: "22px 20px 16px" }}>
          <Aurora pose="planning" size={150} priority style={{ position: "absolute", right: 4, top: -104 }} />
          <AuroraSays size={24} style={{ paddingRight: 128, lineHeight: 1.15 }}>
            <span id="plan-title">{t.ctaSays}</span>
          </AuroraSays>
          <p style={{ margin: "12px 0 0", fontSize: 15, lineHeight: 1.5, color: "var(--app-text-sub)" }}>{t.ctaBody}</p>
          <AppBtn as={Link} href="/events/new" variant="gold" size="lg" style={{ width: "100%", marginTop: 18, minHeight: 56, borderRadius: 17, fontSize: 17, gap: 8 }}>
            <Plus size={20} aria-hidden /> {a.planNewEvent}
          </AppBtn>
          <Link
            href="/join"
            style={{ marginTop: 4, minHeight: 44, display: "flex", alignItems: "center", justifyContent: "center", gap: 7, fontSize: 15, fontWeight: 600, color: "var(--app-purple)", textUnderlineOffset: 3 }}
          >
            <Key size={15} aria-hidden /> {t.haveCode}
          </Link>
        </section>
      )}

      {/* ── Coming up ── */}
      {planned.length > 0 && (
        <section aria-labelledby="planned-title">
          <h2 id="planned-title" style={{ ...titleStyle, margin: "30px 0 4px", fontSize: 24 }}>{t.planned}</h2>
          <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
            {planned.map((e, i) => {
              const days = daysUntilEvent(e.event_date);
              const when = getEventPhase(e.event_date) === "during" ? a.happeningNow : whenText(days);
              const dateLine =
                e.membershipRole === "guest"
                  ? `${ui.dashboard.roleGuest} · ${fmt(e.event_date, { weekday: "long", day: "numeric", month: "long" })} · ${when}`
                  : days <= SOON_DAYS
                    ? `${fmt(e.event_date, { weekday: "long", day: "numeric", month: "long" })} · ${when}`
                    : `${fmt(e.event_date, { month: "long", year: "numeric" })} · ${t.qrReady}`;
              return (
                <li key={e.id} style={{ borderTop: i > 0 ? "1px solid var(--app-border)" : "none" }}>
                  <Link href={eventHref(e)} style={rowStyle}>
                    <span
                      aria-hidden
                      style={{ width: 56, height: 60, flexShrink: 0, borderRadius: 12, background: "var(--app-surface)", border: "1px solid var(--app-border-strong)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}
                    >
                      <span style={{ fontFamily: SERIF, fontSize: 26, lineHeight: 1, color: GOLD_INK }}>{fmt(e.event_date, { day: "numeric" }).replace(".", "")}</span>
                      <span style={{ marginTop: 2, fontSize: 12, fontWeight: 700, color: "var(--app-muted)" }}>{fmt(e.event_date, { month: "short" }).replace(".", "")}</span>
                    </span>
                    <span style={{ flex: 1, minWidth: 0 }}>
                      <span style={{ display: "block", fontFamily: SERIF, fontSize: 21, lineHeight: 1.15, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{nameOf(e)}</span>
                      <span style={subStyle}>{dateLine}</span>
                    </span>
                    <Chevron />
                  </Link>
                </li>
              );
            })}
          </ul>
        </section>
      )}

      {/* ── Memories: past events as albums ── */}
      {latest && (
        <section aria-labelledby="memories-title">
          <div style={{ margin: "30px 0 0", display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 12 }}>
            <h2 id="memories-title" style={{ ...titleStyle, fontSize: 30 }}>{t.memoriesTitle}</h2>
            <span style={{ fontSize: 14, color: "var(--app-muted)" }}>{plural(locale, past.length, t.albums)}</span>
          </div>

          <Link href={eventHref(latest)} style={{ display: "block", marginTop: 14, textDecoration: "none", color: "var(--app-text)" }}>
            {prints(latest, STACK3, 206)}
            <span style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 10, marginTop: 12 }}>
              <span style={{ fontFamily: SERIF, fontSize: 25, lineHeight: 1.05, minWidth: 0 }}>{nameOf(latest)}</span>
              <span style={{ fontSize: 14, color: "var(--app-muted)", whiteSpace: "nowrap" }}>{fmt(latest.event_date, { month: "long", year: "numeric" })}</span>
            </span>
            <span style={{ display: "block", marginTop: 4, fontSize: 14, color: "var(--app-text-sub)" }}>
              {albumLine(latest)}
            </span>
            {deadlineChip(latest)}
          </Link>

          {older.length > 0 && (
            <ul style={{ listStyle: "none", margin: "26px 0 0", padding: 0, display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))", gap: "22px 16px" }}>
              {older.map((e) => (
                <li key={e.id}>
                  <Link href={eventHref(e)} style={{ display: "block", textDecoration: "none", color: "var(--app-text)" }}>
                    {prints(e, STACK2, 150)}
                    <span style={{ display: "block", marginTop: 8, fontFamily: SERIF, fontSize: 20, lineHeight: 1.1 }}>{nameOf(e)}</span>
                    <span style={{ display: "block", marginTop: 2, fontSize: 13, color: "var(--app-muted)" }}>
                      {memoriesText(e)} · {fmt(e.event_date, { month: "long", year: "numeric" })}
                    </span>
                    {deadlineChip(e)}
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>
      )}

    </div>
  );
}
