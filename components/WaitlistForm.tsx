"use client";

import { useCallback, useState } from "react";
import Image from "next/image";
import type { LandingCopy } from "@/lib/i18n";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function isValidEmail(value: string): boolean {
  const t = value.trim();
  return t.length > 0 && EMAIL_RE.test(t);
}

type WaitlistFormProps = {
  copy: LandingCopy["waitlist"];
};

export function WaitlistForm({ copy }: WaitlistFormProps) {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [busy, setBusy] = useState(false);

  const onSubmit = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      setError(null);
      const trimmed = email.trim();
      if (!isValidEmail(trimmed)) {
        setError(copy.invalidEmail);
        return;
      }
      setBusy(true);
      try {
        const response = await fetch("/api/waitlist", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: trimmed }),
        });
        if (!response.ok) {
          setError(copy.submitFailed);
          return;
        }
        setSubmitted(true);
      } catch {
        setError(copy.submitFailed);
      } finally {
        setBusy(false);
      }
    },
    [copy.invalidEmail, copy.submitFailed, email],
  );

  return (
    <section
      id="waitlist"
      className="relative scroll-mt-20 bg-ink px-4 py-20 sm:px-6 sm:py-24"
    >
      {/* Ambient glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 overflow-hidden"
        style={{
          background:
            "radial-gradient(ellipse 50% 40% at 50% 100%, rgba(180,83,201,0.10) 0%, transparent 70%)",
        }}
      />

      <div className="relative mx-auto max-w-5xl">
        <div className="overflow-hidden rounded-[32px] border border-white/10 bg-white/5 shadow-2xl backdrop-blur-sm">
          <div className="grid lg:grid-cols-[1fr_1.6fr]">
            {/* Aurora panel */}
            <div className="hidden items-end justify-center bg-gradient-to-b from-primary/20 to-primary/5 px-6 pt-10 lg:flex">
              <Image
                src="/brand/mascot.png"
                alt="Aurora"
                width={400}
                height={400}
                className="h-auto w-full max-w-[220px] object-contain"
              />
            </div>

            {/* Form panel */}
            <div className="px-8 py-10 sm:px-10 sm:py-12">
              <h2
                className="font-extrabold tracking-tight text-white"
                style={{ fontSize: "clamp(1.7rem, 3.5vw, 2.6rem)" }}
              >
                {copy.title}
              </h2>
              <p className="mt-3 text-lg text-zinc-300">{copy.description}</p>
              <p className="mt-4 rounded-xl border border-amber-400/30 bg-amber-400/10 px-4 py-3 text-sm font-semibold text-amber-200">
                {copy.discount}
              </p>

              {submitted ? (
                <p
                  className="mt-8 rounded-xl border border-emerald-400/30 bg-emerald-400/10 px-4 py-4 text-emerald-300"
                  role="status"
                >
                  {copy.submitted}
                </p>
              ) : (
                <form
                  onSubmit={onSubmit}
                  className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-start"
                  noValidate
                >
                  <div className="min-w-0 flex-1">
                    <label htmlFor="waitlist-email" className="sr-only">
                      {copy.inputLabel}
                    </label>
                    <input
                      id="waitlist-email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      inputMode="email"
                      placeholder={copy.inputPlaceholder}
                      value={email}
                      onChange={(ev) => {
                        setEmail(ev.target.value);
                        if (error) setError(null);
                      }}
                      className="w-full rounded-xl border border-white/20 bg-white/10 px-4 py-3 text-white shadow-sm placeholder:text-zinc-500 focus:border-amber-400/60 focus:outline-none focus:ring-2 focus:ring-amber-400/30"
                      aria-invalid={error !== null ? true : false}
                      aria-describedby={error ? "waitlist-email-error" : undefined}
                    />
                    {error ? (
                      <p
                        id="waitlist-email-error"
                        className="mt-2 text-sm text-red-400"
                        role="alert"
                      >
                        {error}
                      </p>
                    ) : null}
                  </div>
                  <button
                    type="submit"
                    disabled={busy}
                    className="shrink-0 rounded-xl bg-amber-400 px-8 py-3 text-base font-bold text-zinc-900 shadow-[0_4px_20px_rgba(245,158,11,0.35)] transition hover:bg-amber-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:ring-offset-2 focus-visible:ring-offset-ink disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    {busy ? copy.buttonBusy : copy.buttonIdle}
                  </button>
                </form>
              )}

              <p className="mt-6 text-xs text-zinc-500">{copy.note}</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
