"use client";

import Link from "next/link";
import { Check, ChevronRight, Download, Eye, LogOut, PenLine, Printer, Share } from "lucide-react";
import { useMemo } from "react";

import { useAppUi } from "@/components/AppUiProvider";
import { Aurora, AuroraSays } from "@/components/app-ui/Aurora";
import { bcp47FromUiLocale } from "@/lib/locale-bcp47";
import { getPlanLimits, getRetentionDeletionEndMs, isUnlimitedQuota, normalizePlanId } from "@/lib/plan-limits";

import { EventLeaveButton } from "../_components/EventLeaveButton";
import { UpgradeSettingsButton } from "../_components/UpgradePlan";
import "./event-shell.css";

export type MoreTabProps = Readonly<{
  eventId: string;
  accessCode: string;
  isPrimaryOrganizer: boolean;
  plan: string;
  eventDate: string;
  scheduledDeletionAt: string | null;
  photoCount: number;
}>;

type Row = Readonly<{ key: string; label: string; sub: string; Icon: typeof Share; href: string; external?: boolean }>;

function RowInner({ Icon, label, sub }: Readonly<{ Icon: typeof Share; label: string; sub: string }>) {
  return (
    <>
      <span className="event-row__icon">
        <Icon size={22} strokeWidth={1.8} aria-hidden />
      </span>
      <span style={{ flex: 1, minWidth: 0 }}>
        <span className="event-row__label">{label}</span>
        <span className="event-row__sub">{sub}</span>
      </span>
      <ChevronRight size={18} strokeWidth={2} aria-hidden style={{ flexShrink: 0, color: 'var(--app-subtle)' }} />
    </>
  );
}

export function MoreTab({
  eventId,
  accessCode,
  isPrimaryOrganizer,
  plan,
  eventDate,
  scheduledDeletionAt,
  photoCount,
}: MoreTabProps) {
  const ui = useAppUi();
  const t = ui.eventShell;
  const planId = normalizePlanId(plan);
  const photoLimit = getPlanLimits(planId).photos;

  const deletionMs = useMemo(() => {
    const scheduled = scheduledDeletionAt ? Date.parse(scheduledDeletionAt) : NaN;
    return Number.isNaN(scheduled) ? getRetentionDeletionEndMs({ planId, eventDate }) : scheduled;
  }, [scheduledDeletionAt, planId, eventDate]);

  const locale = bcp47FromUiLocale(ui.locale);
  const usedLine = isUnlimitedQuota(photoLimit)
    ? t.planPhotosUnlimited.replace("{used}", photoCount.toLocaleString(locale))
    : t.planPhotos.replace("{used}", photoCount.toLocaleString(locale)).replace("{limit}", photoLimit.toLocaleString(locale));
  const keptLine = deletionMs
    ? t.planKeptUntil.replace("{date}", new Date(deletionMs).toLocaleDateString(locale, { day: "numeric", month: "long", year: "numeric" }))
    : null;
  const usedPct = isUnlimitedQuota(photoLimit) || photoLimit <= 0 ? null : Math.min(100, (photoCount / photoLimit) * 100);

  const base = `/events/${eventId}?tab=`;
  const rows: Row[] = [
    { key: "share", label: t.rowShare, sub: t.rowShareSub, Icon: Share, href: `${base}share` },
    { key: "rsvp", label: t.rowRsvp, sub: t.rowRsvpSub, Icon: Check, href: `${base}rsvp` },
    ...(isPrimaryOrganizer
      ? [
          { key: "prints", label: t.rowPrints, sub: t.rowPrintsSub, Icon: Printer, href: `${base}prints` },
          { key: "download", label: t.rowDownload, sub: t.rowDownloadSub, Icon: Download, href: `${base}gallery&export=zip` },
          { key: "details", label: t.rowDetails, sub: t.rowDetailsSub, Icon: PenLine, href: `${base}settings` },
        ]
      : []),
    { key: "guest", label: t.viewAsGuest, sub: t.viewAsGuestSub, Icon: Eye, href: `/join/${encodeURIComponent(accessCode)}`, external: true },
  ];

  return (
    <div className="welcome-reveal">
      <div className="tab-header" style={{ paddingRight: 116 }}>
        <h1 className="tab-header__title">{ui.aurora.moreTitle}</h1>
        <AuroraSays size={18} style={{ marginTop: 8 }}>{ui.aurora.moreSays}</AuroraSays>
        <Aurora pose="key" size={108} className="tab-header__aurora" />
      </div>

      <section aria-label={ui.plans[planId]} className="tab-card tab-card--raised" style={{ marginTop: 14 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
          <span style={{ minHeight: 44, display: 'flex', alignItems: 'center', fontFamily: 'var(--font-display)', fontSize: 22, color: 'var(--app-text)' }}>
            {ui.plans[planId]}
          </span>
          <UpgradeSettingsButton eventId={eventId} plan={plan} link />
        </div>
        <p style={{ margin: 0, fontSize: 14, lineHeight: 1.4, color: 'var(--app-text-sub)' }}>
          {usedLine}{keptLine ? ` ${keptLine}` : null}
        </p>
        {usedPct !== null && (
          <div aria-hidden style={{ marginTop: 10, height: 8, borderRadius: 99, background: 'rgba(214,176,112,0.3)', overflow: 'hidden' }}>
            <div style={{ width: `${usedPct}%`, height: '100%', borderRadius: 99, background: 'linear-gradient(90deg,#f0b34b,#c9912e)' }} />
          </div>
        )}
      </section>

      <ul className="warm-list" style={{ marginTop: 14 }}>
        {rows.map(({ key, href, external, ...inner }) => (
          <li key={key}>
            {external ? (
              <a href={href} target="_blank" rel="noopener noreferrer" className="event-row">
                <RowInner {...inner} />
              </a>
            ) : (
              <Link href={href} className="event-row">
                <RowInner {...inner} />
              </Link>
            )}
          </li>
        ))}
        {!isPrimaryOrganizer && (
          <li>
            <EventLeaveButton eventId={eventId} className="event-row">
              <RowInner Icon={LogOut} label={ui.leave.ctaOrganizerTab} sub={t.leaveSub} />
            </EventLeaveButton>
          </li>
        )}
      </ul>

      {isPrimaryOrganizer && (
        <Link
          href={`${base}settings#settings-delete-phrase`}
          style={{ marginTop: 10, width: '100%', minHeight: 48, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15, fontWeight: 600, color: 'var(--app-danger)', textDecoration: 'none' }}
        >
          {t.deleteEvent}
        </Link>
      )}
    </div>
  );
}
