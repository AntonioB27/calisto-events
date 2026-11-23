"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { useAppUi } from "@/components/AppUiProvider";
import { Aurora } from "@/components/app-ui/Aurora";
import { interpolate } from "@/lib/app-ui";
import { plural } from "@/lib/app-ui/plural";
import { bcp47FromUiLocale } from "@/lib/locale-bcp47";
import { maybeCreateSupabaseBrowserClient } from "@/lib/supabase-browser";
import {
  filledPrints,
  formatZipSize,
  isZipWorking,
  timeLeft,
  ZIP_STATUS_COLUMNS,
  zipMinutesLeft,
  zipPercent,
  zipPhase,
  type ZipJob,
} from "@/lib/zip-export-view";
import "../../_components/zip-dock.css";
import "./zip-status.css";

export type ZipHistoryItem = { id: string; status: string; include_videos: boolean; created_at: string; file_size_bytes: number | null };

const PRINTS = 12;
const POLL_MS = 2500;

type TimelineRow = { kind: "done" | "mail" | "active" | "failed" | "todo"; label: string; time: string; sub: string };

export function ZipStatusView({
  eventId,
  eventName,
  initialJob,
  photoCount,
  videoCount,
  estimatedBytes,
  thumbs,
  maskedEmail,
  history,
}: Readonly<{
  eventId: string;
  eventName: string;
  initialJob: ZipJob;
  photoCount: number;
  videoCount: number;
  estimatedBytes: number;
  thumbs: string[];
  maskedEmail: string | null;
  history: ZipHistoryItem[];
}>) {
  const ui = useAppUi();
  const t = ui.zipStatus;
  const g = ui.gallery;
  const locale = bcp47FromUiLocale(ui.locale);
  const router = useRouter();
  const supabase = useMemo(() => maybeCreateSupabaseBrowserClient(), []);

  const [job, setJob] = useState(initialJob);
  const [now, setNow] = useState(() => Date.now());
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const rateFrom = useRef<{ at: number; done: number } | null>(null);

  // On this page a failure stays visible however old it is, and an expired ZIP says so.
  const phase = zipPhase(job, now) ?? (job.status === "failed" ? "failed" : null);
  const expired = !phase && (job.status === "ready" || job.status === "expired");
  const working = isZipWorking(phase);
  const done = job.progress_done ?? 0;
  const total = job.progress_total ?? 0;
  const pct = zipPercent(phase, done, total);

  const refresh = useCallback(async () => {
    if (!supabase) return;
    const { data } = await supabase.from("media_zip_exports").select(ZIP_STATUS_COLUMNS).eq("id", job.id).maybeSingle();
    if (data) setJob(data as ZipJob);
    setNow(Date.now());
  }, [supabase, job.id]);

  useEffect(() => {
    const id = window.setInterval(
      () => {
        if (document.visibilityState !== "visible") return;
        if (working) void refresh();
        else setNow(Date.now()); // keeps the expiry countdown honest
      },
      working ? POLL_MS : 30_000,
    );
    return () => window.clearInterval(id);
  }, [working, refresh]);

  useEffect(() => {
    if (phase === "packing" && !rateFrom.current) rateFrom.current = { at: Date.now(), done };
  }, [phase, done]);

  const time = (iso: string | null | undefined, opts: Intl.DateTimeFormatOptions = { hour: "2-digit", minute: "2-digit" }) =>
    iso ? new Intl.DateTimeFormat(locale, opts).format(new Date(iso)) : "";
  const sameDay = (iso: string) => new Date(iso).toDateString() === new Date(now).toDateString();
  const when = (iso: string) =>
    sameDay(iso)
      ? interpolate(g.zipDockStepRequestedAt, { time: time(iso) }).toLowerCase()
      : time(iso, { day: "numeric", month: "long", hour: "2-digit", minute: "2-digit" });
  const duration = (ms: number) => {
    const { h, m } = timeLeft(ms + now, now);
    return h > 0 ? interpolate(t.hoursMinutes, { h, m }) : interpolate(t.minutesOnly, { m });
  };

  const what = job.include_videos ? t.withVideos : t.photosOnly;
  const size = job.file_size_bytes ? formatZipSize(job.file_size_bytes, locale) : null;
  const sizeEstimate = interpolate(t.insideAbout, { size: formatZipSize(estimatedBytes, locale) });
  const minutes = rateFrom.current ? zipMinutesLeft(rateFrom.current, now, done, total) : null;
  const eta =
    phase === "queued"
      ? g.zipDockStartingSoon
      : phase === "saving"
        ? g.zipDockFewSeconds
        : minutes === null
          ? ""
          : minutes <= 1
            ? g.zipDockUnderMinute
            : interpolate(g.zipDockMinutesLeft, { count: minutes });
  const filled = expired ? PRINTS : filledPrints(phase, pct, PRINTS);
  const failedAt = Math.min(done + 1, Math.max(total, 1));
  const sentTo = (iso: string | null | undefined): Pick<TimelineRow, "sub"> => ({
    sub: maskedEmail ? interpolate(iso ? t.tlSentTo : t.tlTo, { email: maskedEmail }) : "",
  });

  const timeline: TimelineRow[] = [
    { kind: "done", label: g.zipDockStepRequested, time: time(job.created_at), sub: what.charAt(0).toUpperCase() + what.slice(1) },
  ];
  if (job.emailed_started_at) timeline.push({ kind: "mail", label: t.tlEmailStarted, time: time(job.emailed_started_at), ...sentTo(job.emailed_started_at) });
  if (phase === "failed") {
    timeline.push({ kind: "failed", label: t.tlStuck, time: time(job.finished_at), sub: interpolate(t.tlStuckSub, { n: failedAt, total }) });
    timeline.push({ kind: "todo", label: g.zipDockStepSaving, time: "", sub: t.tlNotStarted });
    if (job.emailed_result_at) timeline.push({ kind: "mail", label: t.tlEmailFailed, time: time(job.emailed_result_at), ...sentTo(job.emailed_result_at) });
    timeline.push({ kind: "todo", label: g.zipDockStepReady, time: "", sub: t.tlAfterRetry });
  } else if (phase === "ready" || expired) {
    timeline.push({ kind: "done", label: t.tlPacked, time: time(job.finished_at), sub: total ? interpolate(g.zipDockStepPackingSub, { done: total, total }) : "" });
    timeline.push({ kind: "done", label: t.tlSaved, time: time(job.finished_at), sub: size ?? "" });
    if (job.emailed_result_at) timeline.push({ kind: "mail", label: t.tlEmailReady, time: time(job.emailed_result_at), ...sentTo(job.emailed_result_at) });
    const expiry = job.expires_at;
    timeline.push({
      kind: expired ? "done" : "todo",
      label: expired ? t.tlExpired : t.tlExpires,
      // Today: just the time; otherwise the day too (an expired link can be months old).
      time: !expiry
        ? ""
        : sameDay(expiry)
          ? time(expiry)
          : time(expiry, expired ? { day: "numeric", month: "long" } : { weekday: "short", hour: "2-digit", minute: "2-digit" }),
      sub: t.tlExpiresSub,
    });
  } else {
    timeline.push({
      kind: phase === "saving" ? "done" : "active",
      label: phase === "saving" ? t.tlPacked : g.zipDockStepPacking,
      time: time(job.started_at),
      sub: phase === "queued" ? g.zipDockStartingSoon : interpolate(g.zipDockStepPackingSub, { done, total }),
    });
    timeline.push({ kind: phase === "saving" ? "active" : "todo", label: g.zipDockStepSaving, time: "", sub: phase === "saving" ? g.zipDockStepSavingSub : g.zipDockStepUpNext });
    timeline.push({ kind: "todo", label: t.tlEmailPending, time: "", ...sentTo(null) });
    timeline.push({ kind: "todo", label: g.zipDockStepReady, time: "", sub: eta || g.zipDockStepNotify });
  }

  const download = async () => {
    setError(null);
    try {
      const res = await fetch(`/api/events/${eventId}/zip-export/${job.id}/sign`, { method: "POST" });
      const body = (await res.json()) as { url?: string; error?: string };
      if (!res.ok || !body.url) throw new Error(body.error ?? g.zipExportErrorGeneric);
      window.location.href = body.url;
    } catch (e) {
      setError(e instanceof Error ? e.message : g.zipExportErrorGeneric);
    }
  };

  const retry = async (includeVideos: boolean) => {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/events/${eventId}/zip-export`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ includeVideos }),
      });
      const body = (await res.json().catch(() => ({}))) as { id?: string; error?: string };
      if (res.ok && body.id) {
        router.push(`/events/${eventId}/zip/${body.id}`);
        return;
      }
      setError(
        res.status === 409
          ? g.zipExportErrorPending
          : body.error === "ZIP_TOO_MANY_ITEMS"
            ? g.zipExportErrorTooMany
            : g.zipExportErrorGeneric,
      );
    } catch {
      setError(g.zipExportErrorGeneric);
    }
    setBusy(false);
  };

  const backHref = `/events/${eventId}?tab=gallery`;

  return (
    <div className="zipstatus">
      <header className="zipstatus-bar">
        <Link href={backHref} aria-label={t.back} className="zipstatus-bar__back">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
            <path d="M15 6l-6 6 6 6" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </Link>
        <div className="zipstatus-bar__text">
          <span className="zipstatus-bar__title">{eventName}</span>
          <span className="zipstatus-bar__sub">{t.subtitle}</span>
        </div>
      </header>

      <main className="zipstatus-main">
        <section className="zipstatus-hero">
          <Aurora pose="planning" size={110} className="zipstatus-hero__aurora" />
          {working ? (
            <span className="zipstatus-tag zipstatus-tag--live">
              <span className="zipstatus-tag__dot" aria-hidden />
              {t.live}
            </span>
          ) : phase === "ready" ? (
            <span className="zipstatus-tag zipstatus-tag--done">{interpolate(t.doneAt, { time: time(job.finished_at) })}</span>
          ) : phase === "failed" ? (
            <span className="zipstatus-tag zipstatus-tag--failed">{interpolate(t.stuckAt, { time: time(job.finished_at) })}</span>
          ) : null}
          <h1 className="zipstatus-hero__title">
            {phase === "failed" ? g.zipDockFailedTitle : expired ? t.expiredTitle : phase === "ready" ? g.zipDockReadyTitle : g.zipDockPackingTitle}
          </h1>
          <p className="zipstatus-hero__lead">
            {phase === "failed"
              ? t.failedLead
              : expired
                ? t.expired
                : phase === "ready"
                  ? t.readyLead
                  : interpolate(t.packingLead, { when: when(job.created_at), what })}
          </p>
        </section>

        <div className="zipstatus-prints" aria-hidden>
          {Array.from({ length: PRINTS }, (_, i) => {
            const state = i < filled ? "done" : i === filled && phase === "failed" ? "failed" : i === filled && working ? "current" : "empty";
            const src = thumbs.length > 0 ? thumbs[i % thumbs.length] : null;
            return (
              <span key={i} className={`zipdock-print zipdock-print--${state}`}>
                {(state === "done" || state === "current") && src ? (
                  // eslint-disable-next-line @next/next/no-img-element -- short-lived signed URL
                  <img src={src} alt="" />
                ) : null}
                {state === "failed" ? "!" : null}
              </span>
            );
          })}
        </div>

        <div className="zipstatus-count" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100} aria-label={g.zipDockPackingTitle}>
          <span className={phase === "failed" ? "zipstatus-count__pct zipstatus-count__pct--failed" : "zipstatus-count__pct"}>
            {expired ? "100%" : `${pct}%`}
          </span>
          <span className="zipstatus-count__text">
            {total ? (
              <span>
                <b>{(phase === "ready" || expired ? total : done).toLocaleString(locale)}</b> {plural(locale, total, g.zipDockOfTotal)}
              </span>
            ) : null}
            <span>{phase === "ready" ? size : phase === "failed" ? g.zipDockNothingLost : eta}</span>
          </span>
        </div>

        {error ? (
          <p role="alert" className="zipdock-error">
            {error}
          </p>
        ) : null}

        {phase === "ready" ? (
          <>
            <button type="button" className="zipdock-btn zipdock-btn--gold zipdock-btn--block zipstatus-download" onClick={() => void download()}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
                <path d="M12 4v11M7 10l5 5 5-5M5 20h14" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              {interpolate(g.zipDockDownload, { size: size ?? "" })}
            </button>
            {job.expires_at ? (
              <p className="zipstatus-expiry">
                {interpolate(t.validFor, {
                  left: duration(Date.parse(job.expires_at) - now),
                  time: time(job.expires_at, { weekday: "short", hour: "2-digit", minute: "2-digit" }),
                })}
              </p>
            ) : null}
          </>
        ) : phase === "failed" ? (
          <div className="zipstatus-actions">
            <button type="button" className="zipdock-btn zipdock-btn--gold zipdock-btn--tall" disabled={busy} onClick={() => void retry(job.include_videos)}>
              {busy ? <span className="zipdock-spinner" aria-hidden /> : null}
              {g.zipDockRetry}
            </button>
            {job.include_videos ? (
              <button type="button" className="zipdock-btn zipdock-btn--ghost" disabled={busy} onClick={() => void retry(false)}>
                {t.retryPhotosOnly}
              </button>
            ) : null}
          </div>
        ) : null}

        <h2 className="zipstatus-h2">{t.timelineTitle}</h2>
        <ol className="zipstatus-timeline">
          {timeline.map((row, i) => (
            <li key={i} className={`zipdock-step zipdock-step--${row.kind === "mail" ? "done" : row.kind} zipstatus-row--${row.kind}`}>
              <span className="zipdock-step__rail" aria-hidden>
                <span className="zipdock-step__dot">
                  {row.kind === "done" ? <Check /> : row.kind === "mail" ? <Mail /> : row.kind === "failed" ? "!" : row.kind === "active" ? <span className="zipdock-spinner" /> : null}
                </span>
                {i < timeline.length - 1 ? <span className="zipdock-step__line" /> : null}
              </span>
              <span className="zipdock-step__text">
                <span className="zipstatus-row__head">
                  <span className="zipdock-step__label">{row.label}</span>
                  {row.time ? <span className="zipstatus-row__time">{row.time}</span> : null}
                </span>
                {row.sub ? <span className="zipdock-step__sub">{row.sub}</span> : null}
              </span>
            </li>
          ))}
        </ol>

        <h2 className="zipstatus-h2">{t.insideTitle}</h2>
        <dl className="zipstatus-facts">
          <div>
            <dt>{t.insidePhotos}</dt>
            <dd>{photoCount.toLocaleString(locale)}</dd>
          </div>
          <div>
            <dt>{t.insideVideos}</dt>
            <dd>{job.include_videos ? videoCount.toLocaleString(locale) : t.insideNotIncluded}</dd>
          </div>
          <div>
            <dt>{t.insideQuality}</dt>
            <dd>{t.insideOriginals}</dd>
          </div>
          <div>
            <dt>{t.insideSize}</dt>
            <dd>{size ?? sizeEstimate}</dd>
          </div>
          <div>
            <dt>{t.insideValid}</dt>
            <dd>{t.insideValidValue}</dd>
          </div>
        </dl>

        {working ? <p className="zipdock-note zipstatus-note">{t.packingNote}</p> : null}

        {phase === "ready" ? (
          <>
            <h2 className="zipstatus-h2">{t.howTitle}</h2>
            <div className="zipstatus-how">
              {(
                [
                  ["iPhone", t.howIphone],
                  ["Android", t.howAndroid],
                  [t.howComputerLabel, t.howComputer],
                ] as const
              ).map(([device, text]) => (
                <div key={device} className="zipstatus-how__item">
                  <strong>{device}</strong>
                  <span>{text}</span>
                </div>
              ))}
            </div>
          </>
        ) : null}

        {phase === "failed" ? (
          <p className="zipstatus-what">
            <b>{t.failedWhat}</b> {job.failed_item ? interpolate(t.failedItem, { item: job.failed_item }) : t.failedGeneric}
          </p>
        ) : null}

        {history.length > 0 ? (
          <>
            <h2 className="zipstatus-h2">{t.historyTitle}</h2>
            <ul className="zipstatus-history">
              {history.map((h) => {
                const status =
                  h.status === "failed"
                    ? t.historyFailed
                    : h.status === "ready"
                      ? t.historyReady
                      : h.status === "expired"
                        ? t.historyExpired
                        : t.historyOpen;
                return (
                  <li key={h.id}>
                    <Link href={`/events/${eventId}/zip/${h.id}`}>
                      <span className="zipstatus-history__title">
                        {h.include_videos ? t.historyWith : t.historyPhotos}
                        {h.file_size_bytes ? `, ${formatZipSize(h.file_size_bytes, locale)}` : ""}
                      </span>
                      <span className="zipstatus-history__sub">
                        {time(h.created_at, { day: "numeric", month: "long" })}, {status}
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </>
        ) : null}

        <Link href={backHref} className="zipdock-btn zipdock-btn--ghost zipdock-btn--block zipstatus-back">
          {t.back}
        </Link>
      </main>
    </div>
  );
}

function Check() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M5 12.5l4.5 4.5L19 7.5" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function Mail() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
      <rect x="3.5" y="5.5" width="17" height="13" rx="2.5" stroke="currentColor" strokeWidth="2" />
      <path d="M4.5 7l7.5 6 7.5-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
