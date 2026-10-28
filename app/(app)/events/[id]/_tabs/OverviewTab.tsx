"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { CalendarDays, ChevronRight, Hourglass, QrCode } from "lucide-react";

import { useAppUi } from "@/components/AppUiProvider";
import { AppBtn } from "@/components/app-ui/AppBtn";
import { Aurora, AuroraSays, type AuroraPose } from "@/components/app-ui/Aurora";
import { getEventPhase } from "@/lib/event-phase";
import { bcp47FromUiLocale } from "@/lib/locale-bcp47";
import {
  PLAN_ORDER,
  getRetentionDeletionEndMs,
  getUploadWindowEndMs,
  normalizePlanId,
  planRank,
} from "@/lib/plan-limits";
import { UpgradeBanner, UpgradeReturnHandler } from "../_components/UpgradePlan";
import "./event-shell.css";

const BTN: React.CSSProperties = { flex: 1, minWidth: 0, height: 50, padding: '0 10px', borderRadius: 15, fontSize: 16 };

/** A signed photo URL for Home (cover, "Latest", new uploads). */
export type HomePhoto = Readonly<{ id: string; src: string }>;

export type OverviewTabProps = Readonly<{
  eventId: string;
  eventDate: string;
  plan: string;
  scheduledDeletionAt?: string | null;
  accessCode: string;
  isPrimaryOrganizer: boolean;
  /** Pending (moderation) or unseen uploads, for the "during" nudge. */
  newUploadsCount?: number;
  /** Newest photos, newest first. */
  latestPhotos?: readonly HomePhoto[];
  /** Up to three of the new uploads, shown as small prints in the next-step card. */
  newPhotos?: readonly HomePhoto[];
}>;

/** Small prints fanned out beside the detail line. */
const NEW_PRINT_SLOTS: readonly React.CSSProperties[] = [
  { left: 0, top: 6, width: 62, height: 52, transform: 'rotate(-6deg)' },
  { left: 36, top: 0, width: 44, height: 60, transform: 'rotate(4deg)' },
  { left: 66, top: 8, width: 62, height: 46, transform: 'rotate(-2deg)' },
];

/** `template` with `token` replaced by `value` in bold. */
function withBold(template: string, token: string, value: string) {
  const [before, after = ""] = template.split(token);
  return <>{before}<b style={{ fontVariantNumeric: 'tabular-nums' }}>{value}</b>{after}</>;
}

function useDeletionEndMs(planId: ReturnType<typeof normalizePlanId>, eventDate: string, scheduledDeletionAt: string | null | undefined) {
  return useMemo(() => {
    const scheduled = scheduledDeletionAt ? Date.parse(scheduledDeletionAt) : NaN;
    return Number.isNaN(scheduled) ? getRetentionDeletionEndMs({ planId, eventDate }) : scheduled;
  }, [scheduledDeletionAt, planId, eventDate]);
}

// ── Upload window + how long photos are kept (two calm rows) ──────────────────
function RetentionRows({
  eventDate,
  planId,
  deletionEndMs,
}: {
  eventDate: string;
  planId: ReturnType<typeof normalizePlanId>;
  deletionEndMs: number | null;
}) {
  const ui = useAppUi();
  const t = ui.eventShell;
  const [nowMs, setNowMs] = useState(() => Date.now());

  useEffect(() => {
    const id = window.setInterval(() => setNowMs(Date.now()), 60_000);
    return () => window.clearInterval(id);
  }, []);

  const uploadEndMs = useMemo(() => getUploadWindowEndMs({ planId, eventDate }), [planId, eventDate]);

  function remaining(endMs: number): string {
    const ms = endMs - nowMs;
    const days = Math.floor(ms / 86_400_000);
    const hours = Math.floor((ms % 86_400_000) / 3_600_000);
    const d = (days === 1 ? ui.overview.countdownDayOne : ui.overview.countdownDayMany).replace("{n}", String(days));
    const h = (hours === 1 ? ui.overview.countdownHourOne : ui.overview.countdownHourMany).replace("{n}", String(hours));
    return days > 0 ? `${d} ${h}` : h;
  }

  const rows = [
    {
      key: "upload",
      Icon: Hourglass,
      text: uploadEndMs && uploadEndMs > nowMs ? withBold(t.uploadsOpenFor, "{time}", remaining(uploadEndMs)) : t.uploadsClosed,
    },
    ...(deletionEndMs
      ? [{
          key: "kept",
          Icon: CalendarDays,
          text: withBold(
            t.keptUntil,
            "{date}",
            new Date(deletionEndMs).toLocaleDateString(bcp47FromUiLocale(ui.locale), { day: "numeric", month: "long", year: "numeric" }),
          ),
        }]
      : []),
  ];

  return (
    <ul className="warm-list" style={{ marginTop: 26 }}>
      {rows.map(({ key, Icon, text }) => (
        <li key={key} style={{ minHeight: 60, padding: '10px 16px', display: 'flex', alignItems: 'center', gap: 14 }}>
          <Icon size={22} strokeWidth={1.8} aria-hidden style={{ flexShrink: 0, color: 'var(--app-gold-ink)' }} />
          <span style={{ flex: 1, fontSize: 15, lineHeight: 1.35, color: 'var(--app-text)' }}>{text}</span>
        </li>
      ))}
    </ul>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────
export function OverviewTab({
  eventId,
  eventDate,
  plan,
  scheduledDeletionAt,
  accessCode,
  isPrimaryOrganizer,
  newUploadsCount = 0,
  latestPhotos = [],
  newPhotos = [],
}: OverviewTabProps) {
  const ui = useAppUi();
  const a = ui.aurora;
  const t = ui.eventShell;
  const planId = normalizePlanId(plan);
  const phase = getEventPhase(eventDate);
  const deletionEndMs = useDeletionEndMs(planId, eventDate, scheduledDeletionAt);
  const canUpgrade = planRank(planId) < PLAN_ORDER.length - 1;
  const tab = (id: string) => `/events/${eventId}?tab=${id}`;

  const next: {
    pose: AuroraPose;
    say: string;
    detail: string;
    primary: { label: string; href: string };
    secondary: { label: string; href: string; external?: boolean } | null;
  } =
    phase === "before"
      ? {
          pose: "qr",
          say: a.nextBefore,
          detail: a.nextBeforeDetail,
          // Prints are organizer-only; co-organizers get the share tab, where the QR lives.
          primary: { label: a.nextBeforePrimary, href: tab(isPrimaryOrganizer ? "prints" : "share") },
          secondary: { label: a.nextBeforeSecondary, href: tab("share") },
        }
      : phase === "during"
        ? {
            pose: "gallery",
            say: newUploadsCount > 0 ? a.nextDuringPending.replace("{count}", String(newUploadsCount)) : a.nextDuringQuiet,
            detail: a.nextDuringDetail,
            primary: { label: a.nextDuringPrimary, href: tab("gallery") },
            secondary: { label: t.guestPage, href: `/join/${encodeURIComponent(accessCode)}`, external: true },
          }
        : {
            pose: "happy",
            say: deletionEndMs
              ? a.nextAfter.replace(
                  "{date}",
                  new Date(deletionEndMs).toLocaleDateString(bcp47FromUiLocale(ui.locale), { day: "numeric", month: "long" }),
                )
              : a.nextAfterNoExpiry,
            detail: a.nextAfterDetail,
            primary: { label: a.nextAfterPrimary, href: `${tab("gallery")}&export=zip` },
            secondary: canUpgrade ? { label: a.nextAfterSecondary, href: "#upgrade" } : null,
          };

  // Masonry like the guest album: round-robin into three columns so the newest stay in the top row.
  const columns = [0, 1, 2].map((c) => latestPhotos.filter((_, i) => i % 3 === c));
  const detail = <p style={{ margin: 0, fontSize: 14, lineHeight: 1.4, color: 'var(--app-text-sub)' }}>{next.detail}</p>;

  return (
    <div className="welcome-reveal">
      <UpgradeReturnHandler />

      <section aria-label={t.nextStep} className="event-next">
        <Aurora pose={next.pose} size={96} style={{ position: 'absolute', left: 10, top: -54 }} />
        <AuroraSays size={20} style={{ paddingLeft: 108, minHeight: 44, display: 'flex', alignItems: 'center', lineHeight: 1.18 }}>
          {next.say}
        </AuroraSays>
        {newPhotos.length > 0 ? (
          <div style={{ marginTop: 14, display: 'flex', alignItems: 'center', gap: 12 }}>
            <div aria-hidden style={{ position: 'relative', width: 132, height: 62, flexShrink: 0 }}>
              {newPhotos.slice(0, 3).map((p, i) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img key={p.id} src={p.src} alt="" className="event-next__print" style={NEW_PRINT_SLOTS[i]} />
              ))}
            </div>
            {detail}
          </div>
        ) : (
          <div style={{ marginTop: 10 }}>{detail}</div>
        )}
        <div style={{ marginTop: 14, display: 'flex', gap: 10 }}>
          <AppBtn as={Link} href={next.primary.href} variant="gold" style={{ ...BTN, fontWeight: 700 }}>
            {next.primary.label}
          </AppBtn>
          {next.secondary &&
            (next.secondary.external ? (
              <AppBtn href={next.secondary.href} target="_blank" rel="noopener noreferrer" variant="secondary" style={BTN}>
                {next.secondary.label}
              </AppBtn>
            ) : (
              <AppBtn as={Link} href={next.secondary.href} variant="secondary" style={BTN}>
                {next.secondary.label}
              </AppBtn>
            ))}
        </div>
      </section>

      <div className="event-ticket" style={{ marginTop: 16 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--app-muted)' }}>{a.guestCode}</div>
          <div style={{ fontSize: 26, fontWeight: 700, letterSpacing: '0.07em', fontVariantNumeric: 'tabular-nums', color: 'var(--app-text)', overflowWrap: 'anywhere' }}>
            {accessCode}
          </div>
        </div>
        <Link href={tab("share")} aria-label={t.showQr} className="event-ticket__qr">
          <QrCode size={22} strokeWidth={1.9} aria-hidden />
        </Link>
        <AppBtn as={Link} href={tab("share")} variant="primary" style={{ height: 48, padding: '0 16px', borderRadius: 14, fontSize: 15, fontWeight: 700, flexShrink: 0 }}>
          {a.share}
        </AppBtn>
      </div>

      {latestPhotos.length > 0 && (
        <section aria-labelledby="home-latest-title">
          <div style={{ margin: '30px 2px 12px', display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 12 }}>
            <h2 id="home-latest-title" style={{ margin: 0, fontFamily: 'var(--font-display)', fontWeight: 400, fontSize: 26, color: 'var(--app-text)' }}>
              {t.latest}
            </h2>
            <Link href={tab("gallery")} className="event-link">
              {t.wholeAlbum}
              <ChevronRight size={18} strokeWidth={2.2} aria-hidden />
            </Link>
          </div>
          <div style={{ display: 'flex', gap: 6, alignItems: 'flex-start' }}>
            {columns.map((col, c) => (
              <div key={c} style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 6 }}>
                {col.map((p) => (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img key={p.id} src={p.src} alt="" loading="lazy" decoding="async" style={{ display: 'block', width: '100%', height: 'auto', borderRadius: 10, background: 'var(--app-surface-2)' }} />
                ))}
              </div>
            ))}
          </div>
        </section>
      )}

      {phase !== "before" && (
        <RetentionRows eventDate={eventDate} planId={planId} deletionEndMs={deletionEndMs} />
      )}

      <div id="upgrade" style={{ marginTop: 16, scrollMarginTop: 80 }}>
        <UpgradeBanner eventId={eventId} plan={plan} />
      </div>
    </div>
  );
}
