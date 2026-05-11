"use client";

import Link from "next/link";
import QRCode from "react-qr-code";
import { useCallback, useEffect, useMemo, useState } from "react";

import { AppBadge } from "@/components/app-ui/AppBadge";
import { AppBtn } from "@/components/app-ui/AppBtn";
import { AppCard } from "@/components/app-ui/AppCard";
import { useAppUi } from "@/components/AppUiProvider";
import { GoldBar } from "@/components/app-ui/GoldBar";
import { StatRing } from "@/components/app-ui/StatRing";
import { interpolate } from "@/lib/app-ui";
import { formatUiDateLong } from "@/lib/format-ui-datetime";
import { getWebJoinUrl } from "@/lib/join-link";
import {
  formatQuotaSublabelLocalized,
  getPlanLimits,
  isUnlimitedQuota,
  normalizePlanId,
} from "@/lib/plan-limits";
import { maybeCreateSupabaseBrowserClient } from "@/lib/supabase-browser";

export type OverviewTabProps = Readonly<{
  eventId: string;
  eventDate: string;
  plan: string;
  accessCode: string;
  publicOrigin: string;
  /** Shown in plan card: primary organizer vs co-organizer */
  adminRoleLabel: string;
}>;

function SectionHeader({ label }: { label: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 18 }}>
      <GoldBar vertical />
      <span style={{ fontFamily: "var(--font-display)", fontStyle: "italic", fontWeight: 700, fontSize: 17, color: "var(--app-text)" }}>
        {label}
      </span>
    </div>
  );
}

function isVideoMime(mime: string | null | undefined) {
  return Boolean(mime?.startsWith("video/"));
}

async function countPhotos(supabase: NonNullable<ReturnType<typeof maybeCreateSupabaseBrowserClient>>, eventId: string) {
  const [{ count: nullCount }, { count: imageCount }] = await Promise.all([
    supabase.from("media_items").select("*", { count: "exact", head: true }).eq("event_id", eventId).is("mime_type", null),
    supabase.from("media_items").select("*", { count: "exact", head: true }).eq("event_id", eventId).ilike("mime_type", "image/%"),
  ]);
  return (nullCount ?? 0) + (imageCount ?? 0);
}

async function countVideos(supabase: NonNullable<ReturnType<typeof maybeCreateSupabaseBrowserClient>>, eventId: string) {
  const { count } = await supabase.from("media_items").select("*", { count: "exact", head: true }).eq("event_id", eventId).ilike("mime_type", "video/%");
  return count ?? 0;
}

async function countGuests(supabase: NonNullable<ReturnType<typeof maybeCreateSupabaseBrowserClient>>, eventId: string) {
  const { count } = await supabase.from("event_memberships").select("*", { count: "exact", head: true }).eq("event_id", eventId);
  return count ?? 0;
}

type SignedUrlEntry = { path: string | null; signedUrl: string };

function InfoCard({
  eventDate,
  planId,
  adminRoleLabel,
}: {
  eventDate: string;
  planId: ReturnType<typeof normalizePlanId>;
  adminRoleLabel: string;
}) {
  const ui = useAppUi();
  const limits = useMemo(() => getPlanLimits(planId), [planId]);

  const formatted = formatUiDateLong(eventDate, ui.locale);

  const uploadDays = limits.uploadDaysAfterEvent;
  const boldDays =
    uploadDays === 1
      ? interpolate(ui.overview.uploadWindowBoldOne, { n: uploadDays })
      : interpolate(ui.overview.uploadWindowBoldMany, { n: uploadDays });

  const planName = ui.plans[planId];
  const calendarIcon = (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M8 3V6M16 3V6M4.5 9.5H19.5M6.5 5.5H17.5C18.6046 5.5 19.5 6.39543 19.5 7.5V18.5C19.5 19.6046 18.6046 20.5 17.5 20.5H6.5C5.39543 20.5 4.5 19.6046 4.5 18.5V7.5C4.5 6.39543 5.39543 5.5 6.5 5.5Z"
        stroke="var(--app-muted)"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );

  const hourglassIcon = (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M6 2H18M6 22H18M8 2V7.2C8 8.12 8.38 9 9.05 9.63L12 12L14.95 9.63C15.62 9 16 8.12 16 7.2V2M8 22V16.8C8 15.88 8.38 15 9.05 14.37L12 12L14.95 14.37C15.62 15 16 15.88 16 16.8V22"
        stroke="var(--app-warn)"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );

  const quotaIcon = (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" stroke="var(--app-muted)" strokeWidth="2" strokeLinecap="round" />
      <path
        d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"
        stroke="var(--app-muted)"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );

  return (
    <AppCard pad="lg" style={{ borderRadius: 18 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 18 }}>
        <AppBadge tone="accent">{planName}</AppBadge>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontSize: 10, color: "var(--app-muted)", letterSpacing: "0.1em", textTransform: "uppercase" }}>
            {ui.overview.yourRole}
          </div>
          <div style={{ fontFamily: "var(--font-display)", fontStyle: "italic", fontWeight: 700, fontSize: 16, color: "var(--app-purple)" }}>
            {adminRoleLabel}
          </div>
        </div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 14, color: "var(--app-text)" }}>
          <span style={{ display: "inline-flex" }}>{calendarIcon}</span>
          <span>{formatted}</span>
        </div>
        <div style={{ height: 1, background: "var(--app-border)" }} />
        <div style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 14, color: "var(--app-warn)", fontWeight: 600 }}>
          <span style={{ display: "inline-flex" }}>{hourglassIcon}</span>
          <span>
            {ui.overview.uploadWindowLead}{" "}
            <strong>{boldDays}</strong> {ui.overview.uploadWindowTail}
          </span>
        </div>
        <div style={{ display: "flex", alignItems: "flex-start", gap: 10, fontSize: 14, color: "var(--app-muted)" }}>
          <span style={{ display: "inline-flex", flexShrink: 0, marginTop: 2 }}>{quotaIcon}</span>
          <span>{ui.overview.planCapsNote}</span>
        </div>
      </div>
    </AppCard>
  );
}

function StatsCard({ eventId, planId }: { eventId: string; planId: ReturnType<typeof normalizePlanId> }) {
  const ui = useAppUi();
  const limits = useMemo(() => getPlanLimits(planId), [planId]);
  const supabase = useMemo(() => maybeCreateSupabaseBrowserClient(), []);

  const [photos, setPhotos] = useState<number | null>(null);
  const [videos, setVideos] = useState<number | null>(null);
  const [guests, setGuests] = useState<number | null>(null);

  const cameraIcon = (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M23 19C23 20.105 22.105 21 21 21H3C1.895 21 1 20.105 1 19V8C1 6.895 1.895 6 3 6H7L9 3H15L17 6H21C22.105 6 23 6.895 23 8V19Z"
        stroke="var(--app-muted)"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="13" r="4" stroke="var(--app-muted)" strokeWidth="2" />
    </svg>
  );
  const galleryIcon = (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="3" y="3" width="8" height="8" rx="1.5" stroke="var(--app-muted)" strokeWidth="2" />
      <rect x="13" y="3" width="8" height="8" rx="1.5" stroke="var(--app-muted)" strokeWidth="2" />
      <rect x="3" y="13" width="8" height="8" rx="1.5" stroke="var(--app-muted)" strokeWidth="2" />
      <rect x="13" y="13" width="8" height="8" rx="1.5" stroke="var(--app-muted)" strokeWidth="2" />
    </svg>
  );
  const guestsIcon = (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="9" cy="7" r="3" stroke="var(--app-muted)" strokeWidth="2" />
      <path d="M2 20C2 16.686 5.134 14 9 14C12.866 14 16 16.686 16 20" stroke="var(--app-muted)" strokeWidth="2" strokeLinecap="round" />
      <path d="M16 11C18.209 11 20 9.209 20 7" stroke="var(--app-muted)" strokeWidth="2" strokeLinecap="round" />
      <path d="M19 15C20.657 15.5 22 17.119 22 20" stroke="var(--app-muted)" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );

  const load = useCallback(async () => {
    if (!supabase) return;
    try {
      const [p, v, g] = await Promise.all([countPhotos(supabase, eventId), countVideos(supabase, eventId), countGuests(supabase, eventId)]);
      setPhotos(p);
      setVideos(v);
      setGuests(g);
    } catch {
      setPhotos(0);
      setVideos(0);
      setGuests(0);
    }
  }, [eventId, supabase]);

  useEffect(() => {
    queueMicrotask(() => {
      void load();
    });
  }, [load]);

  const photoMax = limits.photos;
  const videoMax = limits.videos;
  const guestMax = limits.guests;

  function ringMax(cap: number, value: number) {
    if (isUnlimitedQuota(cap)) return Math.max(value, 1);
    return Math.max(cap, value, 1);
  }

  function subFor(cap: number) {
    return formatQuotaSublabelLocalized(cap, ui.quotas.unlimitedPlan, ui.quotas.ofCount, ui.locale);
  }

  return (
    <AppCard pad="lg" style={{ borderRadius: 18 }}>
      <SectionHeader label={ui.overview.statsTitle} />
      {!supabase ? (
        <p style={{ fontSize: 13, color: "var(--app-muted)" }}>{ui.common.loadCountsHint}</p>
      ) : (
        <div style={{ display: "flex", justifyContent: "space-around", flexWrap: "wrap", gap: 16 }}>
          <StatRing
            value={photos ?? 0}
            max={ringMax(photoMax, photos ?? 0)}
            color="var(--app-purple)"
            label={ui.overview.statsPhotos}
            sublabel={subFor(photoMax)}
            icon={galleryIcon}
          />
          <StatRing
            value={videos ?? 0}
            max={ringMax(videoMax, videos ?? 0)}
            color="var(--app-muted)"
            label={ui.overview.statsVideos}
            sublabel={
              isUnlimitedQuota(videoMax)
                ? subFor(videoMax)
                : videoMax <= 0
                  ? ui.quotas.notOnPlan
                  : subFor(videoMax)
            }
            icon={cameraIcon}
          />
          <StatRing
            value={guests ?? 0}
            max={ringMax(guestMax, guests ?? 0)}
            color="var(--app-gold)"
            label={ui.overview.statsGuests}
            sublabel={subFor(guestMax)}
            icon={guestsIcon}
          />
        </div>
      )}
    </AppCard>
  );
}

function AccessCodeCard({ accessCode, publicOrigin }: { accessCode: string; publicOrigin: string }) {
  const ui = useAppUi();
  const [showQR, setShowQR] = useState(false);
  const [copied, setCopied] = useState(false);

  const joinUrl = useMemo(() => getWebJoinUrl(publicOrigin, accessCode), [publicOrigin, accessCode]);

  async function copy() {
    await navigator.clipboard.writeText(accessCode);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  }

  return (
    <AppCard pad="lg" style={{ borderRadius: 18 }}>
      <SectionHeader label={ui.overview.accessCodeTitle} />
      <div
        style={{
          background: "var(--app-bg)",
          border: "1.5px solid var(--app-border)",
          borderRadius: 12,
          padding: "14px 20px",
          textAlign: "center",
          fontSize: 22,
          fontWeight: 700,
          color: "var(--app-text)",
          letterSpacing: "0.12em",
          marginBottom: 14,
          fontFamily: "monospace",
        }}
      >
        {accessCode}
      </div>
      <div style={{ display: "flex", gap: 10 }}>
        <AppBtn variant="outline" size="sm" type="button" onClick={() => void copy()} className="flex-1">
          {copied ? ui.common.copied : ui.overview.copyCode}
        </AppBtn>
        <AppBtn variant="primary" size="sm" type="button" onClick={() => setShowQR((v) => !v)} className="flex-1">
          {showQR ? ui.overview.hideQr : ui.overview.showQr}
        </AppBtn>
      </div>
      {showQR && (
        <div
          style={{
            background: "var(--app-surface)",
            borderRadius: 12,
            padding: 20,
            marginTop: 14,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 10,
            border: "1.5px solid var(--app-border)",
          }}
        >
          <div style={{ borderRadius: 12, padding: 12, border: "1.5px solid var(--app-border)", background: "#fff" }}>
            <QRCode value={joinUrl} size={168} />
          </div>
          <p style={{ fontFamily: "var(--font-display)", fontStyle: "italic", fontSize: 12, color: "var(--app-muted)", margin: 0, textAlign: "center" }}>
            {ui.overview.scanHint}
          </p>
          <AppBtn variant="ghost" size="sm" href="?tab=share" as={Link}>
            {ui.overview.openShareLink}
          </AppBtn>
        </div>
      )}
    </AppCard>
  );
}

function FeaturedPhotosCard({ eventId }: { eventId: string }) {
  const ui = useAppUi();
  const supabase = useMemo(() => maybeCreateSupabaseBrowserClient(), []);
  const [urls, setUrls] = useState<{ id: string; signedUrl: string | undefined }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!supabase) {
      queueMicrotask(() => setLoading(false));
      return;
    }
    let cancelled = false;
    queueMicrotask(() => setLoading(true));
    void (async () => {
      try {
        const { data: rows, error } = await supabase
          .from("media_items")
          .select("id, storage_path, mime_type")
          .eq("event_id", eventId)
          .order("created_at", { ascending: false })
          .limit(48);
        if (error || cancelled || !rows?.length) {
          if (!cancelled) {
            setUrls([]);
            setLoading(false);
          }
          return;
        }

        const photoRows = (rows as { id: string; storage_path: string; mime_type: string | null }[])
          .filter((r) => !isVideoMime(r.mime_type))
          .slice(0, 6);

        const paths = photoRows.map((r) => r.storage_path);
        const { data: signed } = paths.length
          ? await supabase.storage.from("event-media").createSignedUrls(paths, 900)
          : { data: [] as SignedUrlEntry[] };

        const map = Object.fromEntries((signed ?? []).map((s: SignedUrlEntry) => [s.path, s.signedUrl]));

        if (!cancelled) {
          setUrls(
            photoRows.map((r) => ({
              id: r.id,
              signedUrl: map[r.storage_path],
            })),
          );
          setLoading(false);
        }
      } catch {
        if (!cancelled) {
          setUrls([]);
          setLoading(false);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [eventId, supabase]);

  return (
    <AppCard pad="lg" style={{ borderRadius: 18 }}>
      <SectionHeader label={ui.overview.recentPhotos} />
      {loading ? (
        <p style={{ fontSize: 13, color: "var(--app-muted)" }}>{ui.common.loading}</p>
      ) : !supabase ? (
        <p style={{ fontSize: 13, color: "var(--app-muted)" }}>{ui.common.configuringSupabase}</p>
      ) : urls.length === 0 ? (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "16px 0", gap: 12 }}>
          <p
            style={{
              fontFamily: "var(--font-display)",
              fontStyle: "italic",
              fontSize: 13,
              color: "var(--app-muted)",
              textAlign: "center",
              lineHeight: 1.6,
              margin: 0,
            }}
          >
            {ui.overview.noPhotosHint}
          </p>
          <AppBtn variant="outline" size="sm" href="?tab=gallery" as={Link}>
            {ui.overview.openGalleryBtn}
          </AppBtn>
        </div>
      ) : (
        <>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: 8 }}>
            {urls.map((item) => (
              <Link key={item.id} href={`?tab=gallery`} style={{ display: "block", aspectRatio: "1", borderRadius: 12, overflow: "hidden", border: "1px solid var(--app-border)" }}>
                {item.signedUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element -- signed Supabase URLs
                  <img src={item.signedUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                ) : (
                  <div style={{ width: "100%", height: "100%", background: "var(--app-border)" }} />
                )}
              </Link>
            ))}
          </div>
          <AppBtn variant="ghost" size="sm" href="?tab=gallery" as={Link} style={{ marginTop: 14, width: "100%" }}>
            {ui.overview.viewGalleryFull}
          </AppBtn>
        </>
      )}
    </AppCard>
  );
}

export function OverviewTab({ eventId, eventDate, plan, accessCode, publicOrigin, adminRoleLabel }: OverviewTabProps) {
  const planId = normalizePlanId(plan);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 16 }}>
        <InfoCard eventDate={eventDate} planId={planId} adminRoleLabel={adminRoleLabel} />
        <StatsCard eventId={eventId} planId={planId} />
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 16 }}>
        <AccessCodeCard accessCode={accessCode} publicOrigin={publicOrigin} />
        <FeaturedPhotosCard eventId={eventId} />
      </div>
    </div>
  );
}
