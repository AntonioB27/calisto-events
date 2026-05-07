"use client";

import { buildEventInviteShareText, getWebJoinUrl, type InviteTemplate } from "@/lib/join-link";
import { startTransition, useEffect, useMemo, useState } from "react";
import QRCode from "react-qr-code";
import Link from "next/link";

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
              <button
                key={id}
                type="button"
                onClick={() => setTemplate(id)}
                className="rounded-full border px-3 py-1.5 text-sm font-semibold transition"
                style={{
                  border: selected ? '1.5px solid var(--app-gold)' : '1.5px solid var(--app-border)',
                  background: selected ? 'var(--app-card)' : 'var(--app-bg)',
                  color: selected ? 'var(--app-gold)' : 'var(--app-muted)',
                }}
              >
                {label}
              </button>
            );
          })}
        </div>

        <button
          type="button"
          onClick={() => void shareInvite()}
          className="w-full rounded-xl px-4 py-3 text-center text-sm font-bold shadow-lg"
          style={{ background: 'linear-gradient(135deg, var(--app-purple) 0%, #7B3FBE 100%)', color: '#fff' }}
        >
          Share invite
        </button>
        <p className="text-center text-xs italic" style={{ color: 'var(--app-muted)' }}>
          Uses your device share sheet when available; otherwise copies the full message.
        </p>
      </div>

      {shareError ? <p className="text-sm text-red-400">{shareError}</p> : null}

      <div className="grid gap-6 md:grid-cols-2">
        <div className="rounded-xl p-4" style={{ background: 'var(--app-card)', border: '1.5px solid var(--app-border)' }}>
          <p className="text-xs uppercase tracking-widest" style={{ color: 'var(--app-muted)' }}>Access code</p>
          <p className="mt-2 break-all font-mono text-lg font-semibold" style={{ color: 'var(--app-text)' }}>{accessCode}</p>
          <button
            type="button"
            onClick={() => void copyToClipboard("code", accessCode)}
            className="mt-3 w-full rounded-lg py-2 text-sm font-medium"
            style={{ border: '1.5px solid var(--app-border)', background: 'var(--app-bg)', color: 'var(--app-text)' }}
          >
            {copied === "code" ? "Copied!" : "Copy code"}
          </button>
        </div>

        <div className="rounded-xl p-4" style={{ background: 'var(--app-card)', border: '1.5px solid var(--app-border)' }}>
          <p className="text-xs uppercase tracking-widest" style={{ color: 'var(--app-muted)' }}>Join link</p>
          <a
            className="mt-2 block break-all font-mono text-sm underline underline-offset-2"
            style={{ color: 'var(--app-gold)' }}
            href={joinUrl}
            target="_blank"
            rel="noreferrer"
          >
            {joinUrl}
          </a>
          <button
            type="button"
            onClick={() => void copyToClipboard("link", joinUrl)}
            className="mt-3 w-full rounded-lg py-2 text-sm font-medium"
            style={{ border: '1.5px solid var(--app-border)', background: 'var(--app-bg)', color: 'var(--app-text)' }}
          >
            {copied === "link" ? "Copied!" : "Copy link"}
          </button>
        </div>
      </div>

      <div className="rounded-xl border border-white/10 bg-white p-6">
        <p className="text-center text-sm font-semibold text-zinc-600">Scan to join</p>
        <div className="mx-auto mt-4 flex max-w-[220px] justify-center rounded-lg border border-zinc-200 bg-white p-4">
          <QRCode value={joinUrl} size={180} />
        </div>
        <p className="mt-3 text-center text-xs text-zinc-500">Opens the same join page as the link above.</p>
        <div className="mt-4">
          <Link
            href={`/events/${eventId}/print`}
            className="block w-full rounded-lg border border-zinc-200 bg-white px-4 py-2 text-center text-sm font-semibold text-zinc-900 hover:bg-zinc-50"
          >
            Print QR poster
          </Link>
        </div>
      </div>

      <div className="rounded-xl p-4" style={{ background: 'var(--app-bg)', border: '1.5px solid var(--app-border)' }}>
        <p className="text-xs uppercase tracking-widest" style={{ color: 'var(--app-muted)' }}>Preview message</p>
        <pre className="mt-3 whitespace-pre-wrap break-words font-sans text-sm leading-relaxed" style={{ color: 'var(--app-text)' }}>
          {inviteText}
        </pre>
        <button
          type="button"
          onClick={() => void copyToClipboard("message", inviteText)}
          className="mt-4 w-full rounded-lg py-2 text-sm font-medium"
          style={{ border: '1.5px solid var(--app-border)', background: 'transparent', color: 'var(--app-muted)' }}
        >
          {copied === "message" ? "Copied!" : "Copy full message"}
        </button>
      </div>
    </section>
  );
}
