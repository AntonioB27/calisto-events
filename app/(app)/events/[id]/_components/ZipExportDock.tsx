"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { useAppUi } from "@/components/AppUiProvider";
import { Aurora } from "@/components/app-ui/Aurora";
import { Switch } from "@/components/app-ui/Switch";
import { interpolate } from "@/lib/app-ui";
import { plural } from "@/lib/app-ui/plural";
import { bcp47FromUiLocale } from "@/lib/locale-bcp47";
import { maybeCreateSupabaseBrowserClient } from "@/lib/supabase-browser";
import { registerZipDockOpener, setZipDockStatus } from "@/lib/zip-export-status";
import {
  filledPrints,
  formatZipSize,
  isZipWorking,
  ZIP_JOB_COLUMNS,
  zipMinutesLeft,
  zipPercent,
  zipPhase,
  type ZipJob,
} from "@/lib/zip-export-view";
import "./zip-dock.css";

const PRINTS = 8;
const POLL_MS = 2500;

type Counts = { all: number; videos: number; bytesAll: number; bytesPhotos: number };

/**
 * Gallery ZIP for the primary organizer: start sheet, live progress sheet and the floating pill
 * that follows them across event tabs. Mounted once on the event page.
 */
export function ZipExportDock({ eventId }: Readonly<{ eventId: string }>) {
  const ui = useAppUi();
  const g = ui.gallery;
  const locale = bcp47FromUiLocale(ui.locale);
  const supabase = useMemo(() => maybeCreateSupabaseBrowserClient(), []);

  // undefined until the first load, so links can wait for it
  const [job, setJob] = useState<ZipJob | null | undefined>(undefined);
  const [sheet, setSheet] = useState<"closed" | "start" | "progress">("closed");
  const [includeVideos, setIncludeVideos] = useState(true);
  const [counts, setCounts] = useState<Counts | null>(null);
  const [thumbs, setThumbs] = useState<string[]>([]);
  const [starting, setStarting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState(false);
  const [now, setNow] = useState(() => Date.now());
  const dismissKey = `calisto:zip-dismissed:${eventId}`;
  const [dismissedId, setDismissedId] = useState<string | null>(null);
  const rateFrom = useRef<{ jobId: string; at: number; done: number } | null>(null);
  const sheetRef = useRef<HTMLElement>(null);

  const phase = zipPhase(job ?? null, now);
  const working = isZipWorking(phase);
  const done = job?.progress_done ?? 0;
  const total = job?.progress_total ?? 0;
  const pct = zipPercent(phase, done, total);

  const refresh = useCallback(async () => {
    if (!supabase) return;
    const { data, error: e } = await supabase
      .from("media_zip_exports")
      .select(ZIP_JOB_COLUMNS)
      .eq("event_id", eventId)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    setJob((prev) => (e ? (prev ?? null) : ((data as ZipJob | null) ?? null)));
    setNow(Date.now());
  }, [supabase, eventId]);

  useEffect(() => {
    try {
      setDismissedId(window.localStorage.getItem(dismissKey));
    } catch {
      // storage blocked: the pill just shows until the ZIP expires
    }
    void refresh();
  }, [refresh, dismissKey]);

  // Poll only while packing; the row is the single source of truth for progress.
  useEffect(() => {
    if (!working) return;
    const id = window.setInterval(() => {
      if (document.visibilityState === "visible") void refresh();
    }, POLL_MS);
    return () => window.clearInterval(id);
  }, [working, refresh]);

  useEffect(() => {
    setZipDockStatus({ busy: working, pct });
  }, [working, pct]);

  useEffect(() => {
    if (!job || phase !== "packing") return;
    if (rateFrom.current?.jobId !== job.id) rateFrom.current = { jobId: job.id, at: Date.now(), done };
  }, [job, phase, done]);

  const open = useCallback(() => {
    setError(null);
    setSheet(phase ? "progress" : "start");
  }, [phase]);

  useEffect(() => registerZipDockOpener(open), [open]);

  // ?export=zip (More tab, event home, emails) opens the dock once the job is known.
  const openedFromUrl = useRef(false);
  useEffect(() => {
    if (openedFromUrl.current || job === undefined) return;
    const url = new URL(window.location.href);
    if (url.searchParams.get("export") !== "zip") return;
    openedFromUrl.current = true;
    url.searchParams.delete("export");
    window.history.replaceState(window.history.state, "", url);
    open();
  }, [job, open]);

  // Photos for the prints and the pill's stack: the newest few, signed once when first needed.
  const showPill = sheet === "closed" && (working || ((phase === "ready" || phase === "failed") && job?.id !== dismissedId));
  const needThumbs = sheet !== "closed" || showPill;
  useEffect(() => {
    if (!needThumbs || !supabase || thumbs.length > 0) return;
    let cancelled = false;
    void (async () => {
      const { data } = await supabase
        .from("media_items")
        .select("storage_path, thumbnail_path, mime_type")
        .eq("event_id", eventId)
        .order("created_at", { ascending: false })
        .limit(24);
      const paths = ((data ?? []) as { storage_path: string; thumbnail_path: string | null; mime_type: string | null }[])
        .filter((r) => !r.mime_type?.startsWith("video/") || r.thumbnail_path)
        .slice(0, PRINTS)
        .map((r) => r.thumbnail_path ?? r.storage_path);
      if (paths.length === 0) return;
      const { data: signed } = await supabase.storage.from("event-media").createSignedUrls(paths, 3600);
      if (!cancelled) setThumbs((signed ?? []).flatMap((s: { signedUrl: string | null }) => (s.signedUrl ? [s.signedUrl] : [])));
    })();
    return () => {
      cancelled = true;
    };
  }, [needThumbs, supabase, eventId, thumbs.length]);

  // Size estimate for the start sheet.
  useEffect(() => {
    if (sheet !== "start" || counts || !supabase) return;
    void (async () => {
      const [all, videos, sizes] = await Promise.all([
        supabase.from("media_items").select("*", { count: "exact", head: true }).eq("event_id", eventId),
        supabase.from("media_items").select("*", { count: "exact", head: true }).eq("event_id", eventId).ilike("mime_type", "video/%"),
        supabase.from("media_items").select("size_bytes, mime_type").eq("event_id", eventId).range(0, 1999),
      ]);
      const rows = (sizes.data ?? []) as { size_bytes: number | null; mime_type: string | null }[];
      const allCount = all.count ?? rows.length;
      // The API may cap rows; scale the sum up so a big album isn't under-estimated.
      const scale = rows.length > 0 && allCount > rows.length ? allCount / rows.length : 1;
      let bytesAll = 0;
      let bytesPhotos = 0;
      for (const r of rows) {
        const b = r.size_bytes ?? 0;
        bytesAll += b;
        if (!r.mime_type?.startsWith("video/")) bytesPhotos += b;
      }
      setCounts({ all: allCount, videos: videos.count ?? 0, bytesAll: bytesAll * scale, bytesPhotos: bytesPhotos * scale });
    })();
  }, [sheet, counts, supabase, eventId]);

  useEffect(() => {
    if (sheet === "closed") return;
    sheetRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSheet("closed");
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [sheet]);

  useEffect(() => {
    if (!toast) return;
    const id = window.setTimeout(() => setToast(false), 5000);
    return () => window.clearTimeout(id);
  }, [toast]);

  const dismiss = useCallback(
    (id: string) => {
      setDismissedId(id);
      try {
        window.localStorage.setItem(dismissKey, id);
      } catch {
        // ignore
      }
    },
    [dismissKey],
  );

  const start = useCallback(
    async (videos: boolean) => {
      setStarting(true);
      setError(null);
      try {
        const res = await fetch(`/api/events/${eventId}/zip-export`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ includeVideos: videos }),
        });
        const body = (await res.json().catch(() => ({}))) as { id?: string; error?: string };
        if (res.status === 400 && body.error === "ZIP_TOO_MANY_ITEMS") setError(g.zipExportErrorTooMany);
        else if (res.status === 409) setError(g.zipExportErrorPending);
        else if (body.error === "ZIP_QUEUE_CHECK_FAILED") setError(g.zipExportErrorQueue);
        else if (!res.ok || !body.id) setError(g.zipExportErrorGeneric);
        else {
          rateFrom.current = null;
          setJob({
            id: body.id,
            status: "queued",
            include_videos: videos,
            error_message: null,
            expires_at: null,
            created_at: new Date().toISOString(),
            file_size_bytes: null,
            progress_done: 0,
            progress_total: null,
          });
          setSheet("progress");
        }
      } catch {
        setError(g.zipExportErrorGeneric);
      } finally {
        setStarting(false);
      }
    },
    [eventId, g],
  );

  const download = useCallback(async () => {
    if (!job) return;
    setError(null);
    try {
      const res = await fetch(`/api/events/${eventId}/zip-export/${job.id}/sign`, { method: "POST" });
      const body = (await res.json()) as { url?: string; error?: string };
      if (!res.ok || !body.url) throw new Error(body.error ?? g.zipExportErrorGeneric);
      dismiss(job.id);
      setSheet("closed");
      setToast(true);
      window.location.href = body.url;
    } catch (e) {
      setError(e instanceof Error ? e.message : g.zipExportErrorGeneric);
    }
  }, [job, eventId, dismiss, g.zipExportErrorGeneric]);

  const time = (iso: string | null, withDay = false) =>
    iso
      ? new Intl.DateTimeFormat(locale, withDay ? { weekday: "short", hour: "2-digit", minute: "2-digit" } : { hour: "2-digit", minute: "2-digit" }).format(new Date(iso))
      : "";
  const size = formatZipSize(job?.file_size_bytes ?? 0, locale);
  const minutes = job && rateFrom.current?.jobId === job.id ? zipMinutesLeft(rateFrom.current, now, done, total) : null;
  const etaText =
    phase === "queued"
      ? g.zipDockStartingSoon
      : phase === "saving"
        ? g.zipDockFewSeconds
        : minutes === null
          ? ""
          : minutes <= 1
            ? g.zipDockUnderMinute
            : interpolate(g.zipDockMinutesLeft, { count: minutes });
  const filled = filledPrints(phase, pct, PRINTS);
  const failedAt = Math.min(done + 1, Math.max(total, 1));

  const steps = [
    {
      label: g.zipDockStepRequested,
      sub: !job
        ? ""
        : new Date(job.created_at).toDateString() === new Date(now).toDateString()
          ? interpolate(g.zipDockStepRequestedAt, { time: time(job.created_at) })
          : new Intl.DateTimeFormat(locale, { day: "numeric", month: "long", hour: "2-digit", minute: "2-digit" }).format(new Date(job.created_at)),
    },
    {
      label: g.zipDockStepPacking,
      sub:
        phase === "failed"
          ? interpolate(g.zipDockStepFailedSub, { count: failedAt })
          : phase === "queued"
            ? g.zipDockStartingSoon
            : interpolate(g.zipDockStepPackingSub, { done, total }),
    },
    { label: g.zipDockStepSaving, sub: g.zipDockStepSavingSub },
    { label: g.zipDockStepReady, sub: g.zipDockStepReadySub },
  ];
  const activeStep = phase === "ready" ? 4 : phase === "saving" ? 2 : 1;

  return (
    <>
      {showPill && job ? (
        <div className="zipdock-pill-wrap">
          <button
            type="button"
            className={`zipdock-pill zipdock-pill--${phase === "ready" ? "ready" : phase === "failed" ? "failed" : "working"}`}
            aria-label={g.zipDockPillAria}
            onClick={open}
          >
            <span className="zipdock-pill__handle" aria-hidden />
            <PhotoStack thumbs={thumbs} badge={phase === "ready"} />
            <span className="zipdock-pill__text">
              <span className="zipdock-pill__title">
                {phase === "ready"
                  ? g.zipDockPillReady
                  : phase === "failed"
                    ? g.zipDockFailedTitle
                    : phase === "saving"
                      ? g.zipDockPillSaving
                      : g.zipDockPillPacking}
              </span>
              <span className="zipdock-pill__sub">
                {phase === "ready"
                  ? interpolate(g.zipDockPillReadySub, { size, time: time(job.expires_at, true) })
                  : phase === "failed"
                    ? g.zipDockPillFailedSub
                    : [total ? interpolate(g.zipDockStepPackingSub, { done, total }) : "", etaText].filter(Boolean).join(", ")}
              </span>
            </span>
            {phase === "ready" ? (
              <span className="zipdock-pill__cta" aria-hidden>
                <DownloadIcon />
              </span>
            ) : phase === "failed" ? (
              <span className="zipdock-pill__bang" aria-hidden>
                !
              </span>
            ) : (
              <span className="zipdock-pill__pct">{pct}%</span>
            )}
            {working ? (
              <span className="zipdock-pill__track" aria-hidden>
                <span className="zipdock-pill__fill" style={{ transform: `scaleX(${pct / 100})` }} />
              </span>
            ) : null}
          </button>
        </div>
      ) : null}

      {toast ? (
        <div className="zipdock-toast" role="status">
          <CheckIcon />
          {g.zipDockDownloadStarted}
        </div>
      ) : null}

      {sheet !== "closed" ? (
        <div className="zipdock-layer">
          <button type="button" className="zipdock-scrim" aria-label={g.zipDockMinimize} onClick={() => setSheet("closed")} />
          <section
            ref={sheetRef}
            tabIndex={-1}
            role="dialog"
            aria-modal="true"
            aria-labelledby="zipdock-title"
            className="zipdock-sheet"
          >
            <button type="button" className="zipdock-sheet__grab" aria-label={g.zipDockMinimize} onClick={() => setSheet("closed")}>
              <span aria-hidden />
            </button>
            <Aurora pose="planning" size={104} className="zipdock-sheet__aurora" />

            {sheet === "start" ? (
              <>
                <h2 id="zipdock-title" className="zipdock-sheet__title">
                  {g.zipDockStartTitle}
                </h2>
                <p className="zipdock-sheet__body">{g.zipDockStartBody}</p>
                <div className="zipdock-option">
                  <Switch
                    checked={includeVideos}
                    onChange={setIncludeVideos}
                    label={g.zipExportIncludeVideos}
                    disabled={starting}
                    description={
                      counts
                        ? interpolate(
                            includeVideos
                              ? plural(locale, counts.all, g.zipDockSizeAll)
                              : plural(locale, counts.all - counts.videos, g.zipDockSizePhotos),
                            { size: formatZipSize(includeVideos ? counts.bytesAll : counts.bytesPhotos, locale) },
                          )
                        : undefined
                    }
                  />
                </div>
                {error ? (
                  <p role="alert" className="zipdock-error">
                    {error}
                  </p>
                ) : null}
                <div className="zipdock-actions">
                  <button type="button" className="zipdock-btn zipdock-btn--ghost" disabled={starting} onClick={() => setSheet("closed")}>
                    {ui.common.cancel}
                  </button>
                  <button
                    type="button"
                    className="zipdock-btn zipdock-btn--gold zipdock-btn--wide"
                    disabled={starting}
                    aria-busy={starting}
                    onClick={() => void start(includeVideos)}
                  >
                    {starting ? <span className="zipdock-spinner" aria-hidden /> : null}
                    {g.zipDockStart}
                  </button>
                </div>
              </>
            ) : (
              <>
                <h2 id="zipdock-title" className="zipdock-sheet__title">
                  {phase === "ready" ? g.zipDockReadyTitle : phase === "failed" ? g.zipDockFailedTitle : g.zipDockPackingTitle}
                </h2>

                <div className="zipdock-prints-row">
                  <div className="zipdock-prints" aria-hidden>
                    {Array.from({ length: PRINTS }, (_, i) => {
                      const state =
                        i < filled ? "done" : i === filled && phase === "failed" ? "failed" : i === filled && working ? "current" : "empty";
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
                  <div className="zipdock-pct" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100} aria-label={g.zipDockPackingTitle}>
                    {phase === "ready" ? (
                      <span className="zipdock-pct__check">
                        <CheckIcon />
                      </span>
                    ) : (
                      <span className={phase === "failed" ? "zipdock-pct__num zipdock-pct__num--failed" : "zipdock-pct__num"}>{pct}%</span>
                    )}
                  </div>
                </div>
                <div className="zipdock-caption">
                  <span>
                    {phase === "ready" ? (
                      total ? interpolate(plural(locale, total, g.zipDockReadyCaption), { size }) : size
                    ) : total ? (
                      <>
                        <b>{done.toLocaleString(locale)}</b> {plural(locale, total, g.zipDockOfTotal)}
                      </>
                    ) : null}
                  </span>
                  <span>
                    {phase === "ready"
                      ? interpolate(g.zipDockValidUntil, { time: time(job?.expires_at ?? null, true) })
                      : phase === "failed"
                        ? g.zipDockNothingLost
                        : etaText}
                  </span>
                </div>

                <ol className="zipdock-steps">
                  {steps.map((s, i) => {
                    const failed = phase === "failed" && i === 1;
                    const isDone = !failed && (i < activeStep || phase === "ready");
                    const active = !failed && !isDone && i === activeStep && working;
                    const state = failed ? "failed" : isDone ? "done" : active ? "active" : "todo";
                    return (
                      <li key={s.label} className={`zipdock-step zipdock-step--${state}`}>
                        <span className="zipdock-step__rail" aria-hidden>
                          <span className="zipdock-step__dot">
                            {state === "done" ? <CheckIcon /> : state === "failed" ? "!" : state === "active" ? <span className="zipdock-spinner" /> : null}
                          </span>
                          {i < steps.length - 1 ? <span className="zipdock-step__line" /> : null}
                        </span>
                        <span className="zipdock-step__text">
                          <span className="zipdock-step__label">{s.label}</span>
                          <span className="zipdock-step__sub">
                            {state === "todo" ? (i === steps.length - 1 ? g.zipDockStepNotify : g.zipDockStepUpNext) : s.sub}
                          </span>
                        </span>
                      </li>
                    );
                  })}
                </ol>

                {job ? (
                  <Link href={`/events/${eventId}/zip/${job.id}`} className="zipdock-details" onClick={() => setSheet("closed")}>
                    {g.zipDockDetails}
                  </Link>
                ) : null}

                {error ? (
                  <p role="alert" className="zipdock-error">
                    {error}
                  </p>
                ) : null}

                {working ? (
                  <>
                    <p className="zipdock-note">{g.zipDockCloseNote}</p>
                    <button type="button" className="zipdock-btn zipdock-btn--ghost zipdock-btn--block" onClick={() => setSheet("closed")}>
                      {g.zipDockMinimize}
                    </button>
                  </>
                ) : phase === "ready" ? (
                  <button type="button" className="zipdock-btn zipdock-btn--gold zipdock-btn--block zipdock-btn--tall" onClick={() => void download()}>
                    <DownloadIcon />
                    {interpolate(g.zipDockDownload, { size })}
                  </button>
                ) : phase === "failed" && job ? (
                  <div className="zipdock-actions">
                    <button
                      type="button"
                      className="zipdock-btn zipdock-btn--ghost"
                      onClick={() => {
                        dismiss(job.id);
                        setSheet("closed");
                      }}
                    >
                      {g.zipDockDismiss}
                    </button>
                    <button
                      type="button"
                      className="zipdock-btn zipdock-btn--gold zipdock-btn--wide"
                      disabled={starting}
                      aria-busy={starting}
                      onClick={() => void start(job.include_videos)}
                    >
                      {starting ? <span className="zipdock-spinner" aria-hidden /> : null}
                      {g.zipDockRetry}
                    </button>
                  </div>
                ) : null}
              </>
            )}
          </section>
        </div>
      ) : null}
    </>
  );
}

function PhotoStack({ thumbs, badge }: Readonly<{ thumbs: string[]; badge: boolean }>) {
  return (
    <span className="zipdock-stack" aria-hidden>
      {[0, 1, 2].map((i) => (
        <span key={i} className={`zipdock-stack__photo zipdock-stack__photo--${i}`}>
          {/* eslint-disable-next-line @next/next/no-img-element -- short-lived signed URL */}
          {thumbs[i] ? <img src={thumbs[i]} alt="" /> : null}
        </span>
      ))}
      {badge ? (
        <span className="zipdock-stack__badge">
          <CheckIcon />
        </span>
      ) : null}
    </span>
  );
}

function CheckIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M5 12.5l4.5 4.5L19 7.5" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function DownloadIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M12 4v11M7 10l5 5 5-5M5 20h14" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
