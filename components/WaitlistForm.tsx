"use client";

import { useCallback, useState } from "react";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function isValidEmail(value: string): boolean {
  const t = value.trim();
  return t.length > 0 && EMAIL_RE.test(t);
}

export function WaitlistForm() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [busy, setBusy] = useState(false);

  const onSubmit = useCallback(
    (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      setError(null);
      const trimmed = email.trim();
      if (!isValidEmail(trimmed)) {
        setError("Enter a valid email address.");
        return;
      }
      setBusy(true);
      // TODO: POST to API / Supabase waitlist endpoint
      window.setTimeout(() => {
        console.log("[waitlist] placeholder submit:", trimmed);
        setBusy(false);
        setSubmitted(true);
      }, 400);
    },
    [email],
  );

  return (
    <section
      id="waitlist"
      className="scroll-mt-20 border-t border-zinc-200 bg-gradient-to-b from-primary-tint/40 to-white px-4 py-16 sm:px-6 sm:py-20"
    >
      <div className="mx-auto max-w-5xl">
        <div className="rounded-3xl border border-primary/25 bg-white p-8 shadow-lg sm:p-10">
          <h2 className="text-3xl font-extrabold tracking-tight text-zinc-900 sm:text-4xl">Join the waitlist</h2>
          <p className="mt-3 max-w-2xl text-lg text-zinc-600">
            Be first to know when Calisto opens up more broadly. Leave your email—we&apos;ll only use it for
            launch updates.
          </p>
          <p className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-950">
            The first 10 people on the waiting list get <strong>20% off</strong> any paid plan (Standard,
            Premium, or Max).
          </p>

          {submitted ? (
            <p
              className="mt-8 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-4 text-emerald-900"
              role="status"
            >
              You&apos;re on the list—we&apos;ll be in touch.
            </p>
          ) : (
            <form onSubmit={onSubmit} className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-start" noValidate>
              <div className="min-w-0 flex-1">
                <label htmlFor="waitlist-email" className="sr-only">
                  Email
                </label>
                <input
                  id="waitlist-email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  inputMode="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(ev) => {
                    setEmail(ev.target.value);
                    if (error) setError(null);
                  }}
                  className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-zinc-900 shadow-sm placeholder:text-zinc-400 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
                  aria-invalid={error ? true : undefined}
                  aria-describedby={error ? "waitlist-email-error" : undefined}
                />
                {error ? (
                  <p id="waitlist-email-error" className="mt-2 text-sm text-red-600" role="alert">
                    {error}
                  </p>
                ) : null}
              </div>
              <button
                type="submit"
                disabled={busy}
                className="shrink-0 rounded-xl bg-primary px-8 py-3 text-base font-bold text-white shadow-md transition hover:bg-primary/90 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {busy ? "Joining…" : "Join the waitlist"}
              </button>
            </form>
          )}

          <p className="mt-6 text-xs text-zinc-500">
            Discount details and eligibility may be updated before launch. No spam—unsubscribe anytime once we
            send real emails.
          </p>
        </div>
      </div>
    </section>
  );
}
