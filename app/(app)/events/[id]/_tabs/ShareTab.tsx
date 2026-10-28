"use client";

import { useAppUi } from "@/components/AppUiProvider";
import { getWebJoinUrl } from "@/lib/join-link";
import { maybeCreateSupabaseBrowserClient } from "@/lib/supabase-browser";
import { useEffect, useMemo, useState } from "react";
import QRCode from "react-qr-code";
import Link from "next/link";
import { Check, Printer, Share } from "lucide-react";
import { AppBtn } from "@/components/app-ui/AppBtn";
import { Aurora } from "@/components/app-ui/Aurora";
import { usePostHog } from "posthog-js/react";
import { ANALYTICS_EVENTS } from "@/lib/analytics-events";
import "./guests-share.css";

type ShareTabProps = Readonly<{
  eventId: string;
  accessCode: string;
  eventTitle: string;
  publicOrigin: string;
}>;

type CoverRow = { storage_path: string; thumbnail_path: string | null; mime_type: string | null };

export function ShareTab({ eventId, accessCode, eventTitle, publicOrigin }: ShareTabProps) {
  const ui = useAppUi();
  const posthog = usePostHog();
  const [copied, setCopied] = useState<string | null>(null);
  const [shareError, setShareError] = useState<string | null>(null);
  const [coverUrl, setCoverUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!copied) return;
    const t = window.setTimeout(() => setCopied(null), 2000);
    return () => window.clearTimeout(t);
  }, [copied]);

  // Newest event photo for the cover. Decorative: any failure keeps the warm gradient.
  useEffect(() => {
    const supabase = maybeCreateSupabaseBrowserClient();
    if (!supabase) return;
    let cancelled = false;
    void (async () => {
      const { data } = await supabase
        .from("media_items")
        .select("storage_path, thumbnail_path, mime_type")
        .eq("event_id", eventId)
        .order("created_at", { ascending: false })
        .limit(20);
      const photo = ((data ?? []) as CoverRow[]).find((r) => !r.mime_type?.startsWith("video/"));
      if (!photo) return;
      const { data: signed } = await supabase.storage
        .from("event-media")
        .createSignedUrl(photo.thumbnail_path ?? photo.storage_path, 3600);
      if (!cancelled && signed?.signedUrl) setCoverUrl(signed.signedUrl);
    })().catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [eventId]);

  const joinUrl = useMemo(() => getWebJoinUrl(publicOrigin, accessCode), [publicOrigin, accessCode]);

  async function copyToClipboard(label: string, text: string) {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(label);
      setShareError(null);
      posthog.capture(ANALYTICS_EVENTS.ORGANIZER_CODE_COPIED, { type: label, event_id: eventId });
    } catch {
      setShareError(ui.share.copyFailManual);
    }
  }

  async function shareInvite() {
    setShareError(null);
    try {
      if (typeof navigator !== 'undefined' && navigator.share) {
        await navigator.share({ title: eventTitle, url: joinUrl });
        posthog.capture(ANALYTICS_EVENTS.ORGANIZER_INVITE_SHARED, { method: "native_share", event_id: eventId });
        return;
      }
      await copyToClipboard('link', joinUrl);
      posthog.capture(ANALYTICS_EVENTS.ORGANIZER_INVITE_SHARED, { method: "clipboard", event_id: eventId });
    } catch (e) {
      if (e instanceof DOMException && e.name === 'AbortError') return;
      setShareError(ui.share.shareUnavailable);
    }
  }

  const copyButton = (label: "code" | "link", text: string, idle: string) => (
    <button
      type="button"
      className="share-copy-btn"
      data-copied={copied === label ? "" : undefined}
      aria-live="polite"
      onClick={() => void copyToClipboard(label, text)}
    >
      {copied === label ? (
        <>
          <Check size={16} strokeWidth={2.4} aria-hidden />
          {ui.common.copied}
        </>
      ) : (
        idle
      )}
    </button>
  );

  return (
    <section className="welcome-reveal" style={{ paddingBottom: 32 }}>
      <header className="guest-cover share-cover">
        {coverUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={coverUrl} alt="" className="guest-cover__photo" onError={() => setCoverUrl(null)} />
        ) : null}
        <div aria-hidden className="guest-cover__shade" />
        <div className="guest-cover__text">
          <h1 className="guest-cover__title">{ui.shareTab.title}</h1>
          <p className="guest-cover__line">{ui.shareTab.line}</p>
        </div>
      </header>

      {/* The code itself is given as text below, so the QR is decorative for screen readers */}
      <div className="share-qr">
        <div className="share-qr__card">
          <QRCode value={joinUrl} size={200} aria-hidden />
          <p className="share-qr__caption">{ui.share.scanQr}</p>
        </div>
        <Aurora pose="qr" size={96} className="share-qr__aurora" />
      </div>

      <div className="share-ticket">
        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="share-ticket__label">{ui.aurora.guestCode}</div>
          <div className="share-ticket__code">{accessCode}</div>
        </div>
        {copyButton("code", accessCode, ui.shareTab.copy)}
      </div>

      <div className="share-link-row">
        <span className="share-link-row__url">{joinUrl.replace(/^https?:\/\//, "")}</span>
        {copyButton("link", joinUrl, ui.share.copyJoinLinkBtn)}
      </div>

      {shareError ? (
        <p
          role="alert"
          style={{
            margin: "14px 0 0",
            fontSize: 14,
            color: "var(--app-danger)",
            background: "color-mix(in srgb, var(--app-danger) 10%, transparent)",
            border: "1.5px solid color-mix(in srgb, var(--app-danger) 30%, transparent)",
            padding: "10px 14px",
            borderRadius: 12,
          }}
        >
          {shareError}
        </p>
      ) : null}

      <AppBtn
        variant="gold"
        size="lg"
        onClick={() => void shareInvite()}
        style={{ marginTop: 18, width: "100%", minHeight: 56, borderRadius: 17, fontSize: 17, fontWeight: 700 }}
      >
        <Share size={20} strokeWidth={2} aria-hidden />
        {ui.share.shareInvite}
      </AppBtn>

      <Link href={`/events/${eventId}/print`} className="gs-link" style={{ display: "flex", justifyContent: "center", minHeight: 48, marginTop: 8 }}>
        <Printer size={18} strokeWidth={1.8} aria-hidden />
        {ui.share.printPoster}
      </Link>
    </section>
  );
}
