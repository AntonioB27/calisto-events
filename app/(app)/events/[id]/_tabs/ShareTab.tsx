"use client";

import { buildEventInviteShareText, getWebJoinUrl, type InviteTemplate } from "@/lib/join-link";
import { startTransition, useEffect, useMemo, useState } from "react";
import QRCode from "react-qr-code";
import Link from "next/link";

import { AppBtn } from "@/components/app-ui/AppBtn";
import { AppCard } from "@/components/app-ui/AppCard";

const SHARE_TEMPLATE_KEY = "share_invite_template_v1";

type ShareTabProps = Readonly<{
  eventId: string;
  accessCode: string;
  eventTitle: string;
  publicOrigin: string;
}>;

export function ShareTab({ eventId, accessCode, eventTitle, publicOrigin }: ShareTabProps) {
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
      }),
    [eventTitle, accessCode, joinUrl, template],
  );

  async function copyToClipboard(label: string, text: string) {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(label);
      setShareError(null);
    } catch {
      setShareError("Could not copy — try selecting the text manually.");
    }
  }

  async function shareInvite() {
    setShareError(null);
    try {
      if (typeof navigator !== "undefined" && navigator.share) {
        await navigator.share({
          title: "You're invited",
          text: inviteText,
          url: joinUrl,
        });
        return;
      }
      await copyToClipboard("message", inviteText);
    } catch (e) {
      if (e instanceof DOMException && e.name === "AbortError") return;
      setShareError("Sharing isn't available in this browser. Copy the message below instead.");
    }
  }

  const templateOptions: { id: InviteTemplate; label: string }[] = [
    { id: "short", label: "Short" },
    { id: "friendly", label: "Friendly" },
    { id: "formal", label: "Formal" },
  ];

  return (
    <section className="space-y-8">
      <div>
        <h2 className="text-lg font-semibold" style={{ color: 'var(--app-text)' }}>Share</h2>
        <p className="mt-2 text-sm" style={{ color: 'var(--app-muted)' }}>
          Send a guest link or access code. Pick a message style, then share or copy.
        </p>
      </div>

      <div className="space-y-4">
        <p className="text-xs uppercase tracking-widest" style={{ color: 'var(--app-muted)' }}>Message style</p>
        <div className="flex flex-wrap gap-2">
          {templateOptions.map(({ id, label }) => {
            const selected = template === id;
            return (
              <AppBtn
                key={id}
                type="button"
                variant={selected ? "secondary" : "ghost"}
                size="sm"
                onClick={() => setTemplate(id)}
                className="!rounded-full"
                style={{
                  borderColor: selected ? "var(--app-gold)" : undefined,
                  color: selected ? "var(--app-gold)" : undefined,
                }}
              >
                {label}
              </AppBtn>
            );
          })}
        </div>

        <AppBtn variant="primary" size="lg" type="button" className="w-full !rounded-xl" onClick={() => void shareInvite()}>
          Share invite
        </AppBtn>
        <p className="text-center text-xs italic" style={{ color: 'var(--app-muted)' }}>
          Uses your device share sheet when available; otherwise copies the full message.
        </p>
      </div>

      {shareError ? (
        <p className="text-sm" style={{ color: "var(--app-danger)" }}>
          {shareError}
        </p>
      ) : null}

      <div className="grid gap-6 md:grid-cols-2">
        <AppCard pad="md" className="!rounded-xl">
          <p className="text-xs uppercase tracking-widest" style={{ color: "var(--app-muted)" }}>
            Access code
          </p>
          <p className="mt-2 break-all font-mono text-lg font-semibold" style={{ color: "var(--app-text)" }}>
            {accessCode}
          </p>
          <AppBtn
            variant="secondary"
            size="sm"
            type="button"
            className="mt-3 w-full"
            onClick={() => void copyToClipboard("code", accessCode)}
          >
            {copied === "code" ? "Copied!" : "Copy code"}
          </AppBtn>
        </AppCard>

        <AppCard pad="md" className="!rounded-xl">
          <p className="text-xs uppercase tracking-widest" style={{ color: "var(--app-muted)" }}>
            Join link
          </p>
          <a
            className="mt-2 block break-all font-mono text-sm underline underline-offset-2"
            style={{ color: "var(--app-gold)" }}
            href={joinUrl}
            target="_blank"
            rel="noreferrer"
          >
            {joinUrl}
          </a>
          <AppBtn
            variant="secondary"
            size="sm"
            type="button"
            className="mt-3 w-full"
            onClick={() => void copyToClipboard("link", joinUrl)}
          >
            {copied === "link" ? "Copied!" : "Copy link"}
          </AppBtn>
        </AppCard>
      </div>

      <AppCard pad="lg" className="!rounded-xl" style={{ background: "var(--app-surface)" }}>
        <p className="text-center text-sm font-semibold" style={{ color: "var(--app-muted)" }}>
          Scan to join
        </p>
        <div
          className="mx-auto mt-4 flex max-w-[220px] justify-center rounded-lg p-4"
          style={{ border: "1.5px solid var(--app-border)", background: "var(--app-surface)" }}
        >
          <QRCode value={joinUrl} size={180} />
        </div>
        <p className="mt-3 text-center text-xs" style={{ color: "var(--app-subtle)" }}>
          Opens the same join page as the link above.
        </p>
        <div className="mt-4">
          <AppBtn variant="outline" size="sm" href={`/events/${eventId}/print`} as={Link} className="block w-full text-center">
            Print QR poster
          </AppBtn>
        </div>
      </AppCard>

      <AppCard pad="md" className="!rounded-xl" style={{ background: "var(--app-bg)" }}>
        <p className="text-xs uppercase tracking-widest" style={{ color: "var(--app-muted)" }}>
          Preview message
        </p>
        <pre
          className="mt-3 whitespace-pre-wrap break-words font-sans text-sm leading-relaxed"
          style={{ color: "var(--app-text)" }}
        >
          {inviteText}
        </pre>
        <AppBtn variant="ghost" size="sm" type="button" className="mt-4 w-full" onClick={() => void copyToClipboard("message", inviteText)}>
          {copied === "message" ? "Copied!" : "Copy full message"}
        </AppBtn>
      </AppCard>
    </section>
  );
}
