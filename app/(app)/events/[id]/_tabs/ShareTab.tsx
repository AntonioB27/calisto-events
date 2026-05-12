"use client";

import { useAppUi } from "@/components/AppUiProvider";
import { buildEventInviteShareText, getWebJoinUrl, type InviteTemplate } from "@/lib/join-link";
import { startTransition, useEffect, useMemo, useState } from "react";
import QRCode from "react-qr-code";
import Link from "next/link";

import { AppBtn } from "@/components/app-ui/AppBtn";
import { AppCard } from "@/components/app-ui/AppCard";
import { GoldBar } from "@/components/app-ui/GoldBar";

const SHARE_TEMPLATE_KEY = "share_invite_template_v1";

type ShareTabProps = Readonly<{
  eventId: string;
  accessCode: string;
  eventTitle: string;
  publicOrigin: string;
}>;

export function ShareTab({ eventId, accessCode, eventTitle, publicOrigin }: ShareTabProps) {
  const ui = useAppUi();
  const [template, setTemplate] = useState<InviteTemplate>("friendly");
  const [copied, setCopied] = useState<string | null>(null);
  const [shareError, setShareError] = useState<string | null>(null);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(SHARE_TEMPLATE_KEY);
      if (raw === "short" || raw === "friendly" || raw === "formal") {
        startTransition(() => setTemplate(raw));
      }
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    try {
      window.localStorage.setItem(SHARE_TEMPLATE_KEY, template);
    } catch {
      /* ignore */
    }
  }, [template]);

  useEffect(() => {
    if (!copied) return;
    const t = window.setTimeout(() => setCopied(null), 2000);
    return () => window.clearTimeout(t);
  }, [copied]);

  const joinUrl = useMemo(
    () => getWebJoinUrl(publicOrigin, accessCode),
    [publicOrigin, accessCode],
  );

  const inviteText = useMemo(
    () =>
      buildEventInviteShareText({
        eventTitle,
        accessCode,
        joinLink: joinUrl,
        template,
        defaultEventTitle: ui.defaults.eventTitle,
        labels: {
          code: ui.invites.code,
          link: ui.invites.link,
          introShort: ui.invites.introShort,
          introFriendly: ui.invites.introFriendly,
          introFormal: ui.invites.introFormal,
          ctaShort: ui.invites.ctaShort,
          ctaFriendly: ui.invites.ctaFriendly,
          ctaFormal: ui.invites.ctaFormal,
        },
      }),
    [eventTitle, accessCode, joinUrl, template, ui],
  );

  async function copyToClipboard(label: string, text: string) {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(label);
      setShareError(null);
    } catch {
      setShareError(ui.share.copyFailManual);
    }
  }

  async function shareInvite() {
    setShareError(null);
    try {
      if (typeof navigator !== "undefined" && navigator.share) {
        await navigator.share({
          title: ui.share.shareInviteDialogTitle,
          text: inviteText,
          url: joinUrl,
        });
        return;
      }
      await copyToClipboard("message", inviteText);
    } catch (e) {
      if (e instanceof DOMException && e.name === "AbortError") return;
      setShareError(ui.share.shareUnavailable);
    }
  }

  const templateOptions: { id: InviteTemplate; label: string }[] = [
    { id: "short", label: ui.invites.templateShort },
    { id: "friendly", label: ui.invites.templateFriendly },
    { id: "formal", label: ui.invites.templateFormal },
  ];

  return (
    <section style={{ display: "flex", flexDirection: "column", gap: 28 }}>

      {/* ── Section header ── */}
      <div className="welcome-reveal">
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
          <GoldBar vertical />
          <span style={{ fontFamily: "var(--font-display)", fontStyle: "italic", fontWeight: 700, fontSize: 20, color: "var(--app-text)" }}>
            {ui.share.heading}
          </span>
        </div>
        <p style={{ fontSize: 13, color: "var(--app-muted)", lineHeight: 1.55 }}>
          {ui.share.subtitle}
        </p>
      </div>

      {/* ── Message style + share button ── */}
      <div className="welcome-reveal welcome-reveal--d1" style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--app-muted)" }}>
          {ui.share.messageStyleEyebrow}
        </p>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {templateOptions.map(({ id, label }) => {
            const selected = template === id;
            return (
              <AppBtn
                key={id}
                type="button"
                variant={selected ? "secondary" : "ghost"}
                size="sm"
                onClick={() => setTemplate(id)}
                style={{
                  borderRadius: 99,
                  borderColor: selected ? "var(--app-gold)" : undefined,
                  color: selected ? "var(--app-gold)" : undefined,
                }}
              >
                {label}
              </AppBtn>
            );
          })}
        </div>

        <AppBtn variant="primary" size="lg" type="button" style={{ width: "100%", borderRadius: 14 }} onClick={() => void shareInvite()}>
          {ui.share.shareInvite}
        </AppBtn>
        <p style={{ textAlign: "center", fontSize: 12, fontStyle: "italic", color: "var(--app-muted)" }}>
          {ui.share.shareFootnote}
        </p>
      </div>

      {shareError ? (
        <p
          style={{
            fontSize: 13,
            color: "var(--app-danger)",
            background: "color-mix(in srgb, var(--app-danger) 10%, transparent)",
            border: "1.5px solid color-mix(in srgb, var(--app-danger) 35%, transparent)",
            padding: "10px 14px",
            borderRadius: 10,
          }}
        >
          {shareError}
        </p>
      ) : null}

      {/* ── Code + link cards ── */}
      <div className="welcome-reveal welcome-reveal--d2" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 14 }}>
        <AppCard pad="md" style={{ borderRadius: 16 }}>
          <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--app-muted)" }}>
            {ui.invites.code}
          </p>
          <p style={{ marginTop: 8, fontFamily: "var(--font-mono)", fontSize: 18, fontWeight: 700, wordBreak: "break-all", color: "var(--app-text)" }}>
            {accessCode}
          </p>
          <AppBtn
            variant="outline"
            size="sm"
            type="button"
            style={{
              marginTop: 12,
              width: "100%",
              ...(copied === "code" ? { color: "var(--app-success)", borderColor: "color-mix(in srgb, var(--app-success) 40%, var(--app-border))" } : {}),
            }}
            onClick={() => void copyToClipboard("code", accessCode)}
          >
            {copied === "code" ? ui.common.copied : ui.overview.copyCode}
          </AppBtn>
        </AppCard>

        <AppCard pad="md" style={{ borderRadius: 16 }}>
          <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--app-muted)" }}>
            {ui.invites.link}
          </p>
          <a
            style={{ marginTop: 8, display: "block", wordBreak: "break-all", fontFamily: "var(--font-mono)", fontSize: 13, color: "var(--app-gold)", textDecoration: "underline", textUnderlineOffset: 2 }}
            href={joinUrl}
            target="_blank"
            rel="noreferrer"
          >
            {joinUrl}
          </a>
          <AppBtn
            variant="outline"
            size="sm"
            type="button"
            style={{
              marginTop: 12,
              width: "100%",
              ...(copied === "link" ? { color: "var(--app-success)", borderColor: "color-mix(in srgb, var(--app-success) 40%, var(--app-border))" } : {}),
            }}
            onClick={() => void copyToClipboard("link", joinUrl)}
          >
            {copied === "link" ? ui.common.copied : ui.share.copyJoinLinkBtn}
          </AppBtn>
        </AppCard>
      </div>

      {/* ── QR code card ── */}
      <AppCard pad="lg" className="welcome-reveal welcome-reveal--d3" style={{ borderRadius: 18, background: "var(--app-surface)" }}>
        <p style={{ textAlign: "center", fontSize: 13, fontWeight: 600, color: "var(--app-muted)", marginBottom: 18 }}>
          {ui.share.scanQr}
        </p>
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 14 }}>
          <div className="qr-frame qr-reveal">
            <QRCode value={joinUrl} size={180} />
          </div>
        </div>
        <p style={{ textAlign: "center", fontSize: 12, color: "var(--app-subtle)", marginBottom: 16 }}>
          {ui.share.joinsSameHint}
        </p>
        <AppBtn variant="outline" size="sm" href={`/events/${eventId}/print`} as={Link} style={{ display: "block", width: "100%", textAlign: "center" }}>
          {ui.share.printPoster}
        </AppBtn>
      </AppCard>

      {/* ── Message preview ── */}
      <AppCard pad="md" className="welcome-reveal welcome-reveal--d4" style={{ borderRadius: 16, background: "var(--app-bg)" }}>
        <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--app-muted)", marginBottom: 12 }}>
          {ui.share.previewMessage}
        </p>
        <pre
          style={{
            whiteSpace: "pre-wrap",
            wordBreak: "break-word",
            fontFamily: "var(--font-sans)",
            fontSize: 13,
            lineHeight: 1.65,
            color: "var(--app-text)",
            margin: 0,
          }}
        >
          {inviteText}
        </pre>
        <AppBtn
          variant="ghost"
          size="sm"
          type="button"
          style={{
            marginTop: 16,
            width: "100%",
            ...(copied === "message" ? { color: "var(--app-success)" } : {}),
          }}
          onClick={() => void copyToClipboard("message", inviteText)}
        >
          {copied === "message" ? ui.common.copied : ui.share.copyFullMessage}
        </AppBtn>
      </AppCard>
    </section>
  );
}
