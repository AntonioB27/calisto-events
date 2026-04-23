"use client";

import Image from "next/image";
import { useCallback, useState } from "react";
import type { LandingCopy, Locale } from "@/lib/i18n";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
function isValidEmail(v: string) {
  return v.trim().length > 0 && EMAIL_RE.test(v.trim());
}

type WaitlistFormProps = {
  copy: LandingCopy["waitlist"];
  mascotAlt: string;
  locale: Locale;
};

export function WaitlistForm({ copy, mascotAlt, locale }: WaitlistFormProps) {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [busy, setBusy] = useState(false);

  const onSubmit = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      setError(null);
      const trimmed = email.trim();
      if (!isValidEmail(trimmed)) { setError(copy.invalidEmail); return; }
      setBusy(true);
      try {
        const res = await fetch("/api/waitlist", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: trimmed, locale }),
        });
        if (!res.ok) { setError(copy.submitFailed); return; }
        setSubmitted(true);
      } catch {
        setError(copy.submitFailed);
      } finally {
        setBusy(false);
      }
    },
    [copy.invalidEmail, copy.submitFailed, email, locale],
  );

  return (
    <section
      id="waitlist"
      className="relative scroll-mt-20 overflow-hidden"
      style={{
        borderTop: "1px solid var(--hair)",
        padding: "140px 0 120px",
        textAlign: "center",
        zIndex: 2,
      }}
    >
      {/* Plum radial glow */}
      <div
        aria-hidden
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(ellipse at center, rgba(139,106,140,0.30) 0%, transparent 60%), radial-gradient(ellipse at 85% 25%, rgba(240,179,75,0.22) 0%, transparent 55%)",
          opacity: 0.7,
          pointerEvents: "none",
        }}
      />

      <div className="mx-auto" style={{ maxWidth: 1280, padding: "0 32px", position: "relative", zIndex: 2 }}>
        {/* Big title */}
        <h2
          style={{
            fontFamily: "var(--font-display)",
            fontWeight: 400,
            fontSize: "clamp(52px, 8vw, 108px)",
            lineHeight: 0.97,
            letterSpacing: "-0.022em",
            color: "var(--cream)",
            margin: 0,
          }}
        >
          {copy.title}
        </h2>

        <p
          style={{
            margin: "28px auto 0",
            maxWidth: 480,
            fontFamily: "var(--font-sans)",
            fontSize: 16,
            lineHeight: 1.6,
            color: "var(--cream-3, #B5AB99)",
          }}
        >
          {copy.description}
        </p>

        <div style={{ margin: "32px auto 0", maxWidth: 240 }}>
          <Image
            src="/brand/mascot/aurora_planning.png"
            alt={mascotAlt}
            width={240}
            height={240}
            style={{ width: "100%", height: "auto", objectFit: "contain" }}
          />
        </div>

        {submitted ? (
          <p
            role="status"
            style={{
              margin: "40px auto 0",
              maxWidth: 440,
              padding: "16px 20px",
              borderRadius: 14,
              border: "1px solid rgba(165,132,166,0.35)",
              background: "rgba(139,106,140,0.12)",
              fontFamily: "var(--font-sans)",
              fontSize: 15,
              color: "var(--cream)",
            }}
          >
            {copy.submitted}
          </p>
        ) : (
          <form
            onSubmit={onSubmit}
            noValidate
            style={{
              margin: "40px auto 0",
              maxWidth: 440,
              display: "flex",
              gap: 8,
              padding: 6,
              borderRadius: 999,
              border: "1px solid var(--hair-strong)",
              background: "color-mix(in srgb, var(--glass-bg-2) 86%, rgba(240,179,75,0.08))",
              backdropFilter: "blur(12px)",
            }}
          >
            <div style={{ flex: 1, minWidth: 0 }}>
              <label htmlFor="waitlist-email" className="sr-only">{copy.inputLabel}</label>
              <input
                id="waitlist-email"
                name="email"
                type="email"
                autoComplete="email"
                inputMode="email"
                placeholder={copy.inputPlaceholder}
                value={email}
                onChange={(ev) => { setEmail(ev.target.value); if (error) setError(null); }}
                aria-invalid={error !== null ? true : false}
                aria-describedby={error ? "wl-err" : undefined}
                style={{
                  width: "100%",
                  background: "transparent",
                  border: "none",
                  outline: "none",
                  color: "var(--cream)",
                  fontFamily: "var(--font-sans)",
                  fontSize: 14,
                  padding: "10px 18px",
                  caretColor: "var(--plum-2, #A584A6)",
                }}
              />
            </div>
            <button
              type="submit"
              disabled={busy}
              style={{
                flexShrink: 0,
                padding: "11px 22px",
                borderRadius: 999,
                border: "none",
                background: "linear-gradient(135deg, var(--gold) 0%, var(--amber) 45%, var(--gold-deep) 100%)",
                color: "#1b1208",
                fontFamily: "var(--font-sans)",
                fontSize: 13,
                fontWeight: 500,
                cursor: busy ? "not-allowed" : "pointer",
                opacity: busy ? 0.7 : 1,
                transition: "all 250ms ease",
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              {busy ? copy.buttonBusy : copy.buttonIdle}
              {!busy && <span aria-hidden>→</span>}
            </button>
          </form>
        )}

        {error && (
          <p
            id="wl-err"
            role="alert"
            style={{
              marginTop: 10,
              fontFamily: "var(--font-sans)",
              fontSize: 13,
              color: "rgba(248,113,113,0.9)",
            }}
          >
            {error}
          </p>
        )}

      </div>
    </section>
  );
}
