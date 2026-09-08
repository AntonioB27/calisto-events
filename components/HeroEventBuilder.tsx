"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Gem, Cake, PartyPopper, Users, Briefcase, Loader2, type LucideIcon } from "lucide-react";
import type { LandingCopy, Locale } from "@/lib/i18n";
import { useAppUi } from "@/components/AppUiProvider";
import { createSupabaseBrowserClient } from "@/lib/supabase-browser";
import { isPaidPlanForCheckout } from "@/lib/event-stripe-checkout";
import { writeCreateEventDraftToStorage } from "@/lib/create-event-draft";

type HeroEventBuilderProps = {
  copy: LandingCopy;
  locale: Locale;
};

const KIND_ICONS: LucideIcon[] = [Gem, Cake, PartyPopper, Users, Briefcase];
const KIND_EMOJI = ["💍", "🎂", "🎉", "👨‍👩‍👧‍👦", "💼"] as const;

type SessionState = "checking" | "anonymous" | "authenticated";

function pickPlanIndex(guests: number): number {
  if (guests <= 5) return 0;
  if (guests <= 30) return 1;
  if (guests <= 100) return 2;
  if (guests <= 250) return 3;
  return 4;
}

function defaultDateIso(): string {
  const d = new Date();
  d.setMonth(d.getMonth() + 3);
  return d.toISOString().slice(0, 10);
}

export function HeroEventBuilder({ copy, locale }: HeroEventBuilderProps) {
  const b = copy.heroBuilder;
  const ui = useAppUi();
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [name, setName] = useState("");
  const [date, setDate] = useState(defaultDateIso);
  const [kindIndex, setKindIndex] = useState(0);
  const [guests, setGuests] = useState(60);
  const [sessionState, setSessionState] = useState<SessionState>("checking");
  const [payBusy, setPayBusy] = useState(false);
  const [payError, setPayError] = useState<string | null>(null);

  const kindLabel = b.kinds[kindIndex];
  const emoji = KIND_EMOJI[kindIndex];
  const KindIcon = KIND_ICONS[kindIndex] ?? Gem;
  const planIndex = pickPlanIndex(guests);
  const plan = copy.plans[planIndex] ?? copy.plans[0]!;
  const [priceRow, ...featureRows] = plan.rows;

  const prettyDate = useMemo(() => {
    const d = new Date(`${date}T12:00:00`);
    if (Number.isNaN(d.getTime())) return "—";
    const localeTag = locale === "hr" ? "hr-HR" : locale === "de" ? "de-DE" : "en-GB";
    return d.toLocaleDateString(localeTag, { weekday: "short", day: "numeric", month: "short", year: "numeric" });
  }, [date, locale]);

  const eventTitle = name.trim() || `${kindLabel}`;
  const isPaid = isPaidPlanForCheckout(plan.id);

  useEffect(() => {
    let mounted = true;
    const checkSession = async () => {
      const supabase = createSupabaseBrowserClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!mounted) return;
      setSessionState(user ? "authenticated" : "anonymous");
    };
    void checkSession().catch(() => {
      if (mounted) setSessionState("anonymous");
    });
    return () => {
      mounted = false;
    };
  }, []);

  const returnTo = "/events/new?resume=1";
  const loginHref = `/auth/login?returnTo=${encodeURIComponent(returnTo)}`;
  const registerHref = `/auth/login?mode=register&returnTo=${encodeURIComponent(returnTo)}`;

  const goToAuth = (href: string) => {
    writeCreateEventDraftToStorage({ step: "3", name: eventTitle, emoji, date, planId: plan.id, moderationEnabled: false });
    router.push(href);
  };

  async function onPay() {
    setPayBusy(true);
    setPayError(null);
    try {
      const supabase = createSupabaseBrowserClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setSessionState("anonymous");
        setPayBusy(false);
        return;
      }

      if (isPaid) {
        const response = await fetch("/api/stripe/checkout-create-event", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: eventTitle, emoji, date, planId: plan.id }),
          credentials: "same-origin",
        });
        const payload = (await response.json().catch(() => null)) as { url?: unknown; error?: unknown } | null;
        const url = typeof payload?.url === "string" ? payload.url : null;
        if (!response.ok || !url) {
          const msg = typeof payload?.error === "string" ? payload.error : ui.createStep3.checkoutFailGeneric;
          throw new Error(msg);
        }
        window.location.href = url;
        return;
      }

      const accessCode = crypto.randomUUID().slice(0, 8).toUpperCase();
      const title = emoji.trim() ? `${emoji.trim()} ${eventTitle}` : eventTitle;
      const { data, error: insertError } = await supabase
        .from("events")
        .insert({
          title,
          event_date: new Date(date).toISOString(),
          organizer_id: user.id,
          plan: plan.id,
          access_code: accessCode,
          moderation_enabled: false,
        })
        .select("id")
        .single();

      if (insertError || !data?.id) throw new Error(insertError?.message ?? ui.createStep3.createFail);
      router.push(`/events/${data.id}?tab=share`);
    } catch (e) {
      setPayError(e instanceof Error ? e.message : ui.createStep3.createFail);
      setPayBusy(false);
    }
  }

  return (
    <div style={{ position: "relative" }}>
      <div
        aria-hidden
        style={{
          position: "absolute",
          inset: -40,
          background: "radial-gradient(circle at center, rgba(165,132,166,0.30), transparent 60%)",
          filter: "blur(48px)",
        }}
      />
      <div
        style={{
          position: "relative",
          overflow: "hidden",
          border: "1px solid var(--hair-2)",
          borderRadius: 26,
          background: "linear-gradient(180deg, var(--panel-a), var(--panel-b))",
          boxShadow: "0 40px 90px -40px rgba(0,0,0,0.9)",
          padding: "clamp(18px, 3vw, 28px)",
        }}
      >
        <div
          aria-hidden
          style={{
            position: "absolute", top: 0, left: 0, right: 0, height: 3,
            background: "linear-gradient(135deg, var(--gold) 0%, var(--amber) 45%, var(--gold-deep) 100%)",
          }}
        />
        <div
          aria-hidden
          style={{
            position: "absolute", top: -70, right: -70, width: 200, height: 200, borderRadius: "50%",
            background: "radial-gradient(circle, rgba(245,199,107,0.08), transparent 70%)",
          }}
        />

        <div style={{ position: "relative", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, marginBottom: 16 }}>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, letterSpacing: "0.26em", textTransform: "uppercase", color: "var(--gold)" }}>
            {b.eyebrow}
          </div>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, letterSpacing: "0.16em", color: "var(--cream-4)" }}>
            0{step + 1} / 03
          </div>
        </div>

        <div style={{ position: "relative", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, flexWrap: "wrap", marginBottom: 20 }}>
          {b.stepLabels.map((label, i) => (
            <div key={label} style={{ display: "flex", alignItems: "center", gap: 7, flex: "0 1 auto", minWidth: 0 }}>
              <span
                style={{
                  flexShrink: 0, width: 22, height: 22, borderRadius: "50%", display: "inline-flex",
                  alignItems: "center", justifyContent: "center", fontFamily: "var(--font-mono)", fontSize: 10,
                  background: i < step
                    ? "linear-gradient(135deg, var(--gold) 0%, var(--amber) 45%, var(--gold-deep) 100%)"
                    : i === step ? "rgba(245,199,107,0.16)" : "transparent",
                  border: `1px solid ${i <= step ? "rgba(245,199,107,0.35)" : "var(--hair-2)"}`,
                  color: i < step ? "#1b1208" : i === step ? "var(--gold)" : "var(--cream-4)",
                }}
              >
                {i < step ? "✓" : i + 1}
              </span>
              <span
                style={{
                  fontFamily: "var(--font-mono)", fontSize: 9.5, letterSpacing: "0.14em", textTransform: "uppercase",
                  color: i <= step ? "var(--gold)" : "var(--cream-4)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", minWidth: 0,
                }}
              >
                {label}
              </span>
            </div>
          ))}
        </div>

        <div
          style={{
            position: "relative", border: "1px dashed var(--hair-strong)", borderRadius: 18, padding: "16px 18px",
            marginBottom: 22, background: "radial-gradient(130% 110% at 0% 0%, rgba(245,199,107,0.08), transparent 62%)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 6, fontFamily: "var(--font-mono)", fontSize: 9.5, letterSpacing: "0.26em", textTransform: "uppercase", color: "var(--gold)" }}>
            <KindIcon size={13} strokeWidth={2} aria-hidden style={{ flexShrink: 0 }} />
            {kindLabel}
          </div>
          <div
            style={{
              fontFamily: "var(--font-display)", fontSize: "clamp(22px, 3.4vw, 30px)", lineHeight: 1.15, margin: "6px 0 10px",
              color: name.trim() ? "var(--cream)" : "var(--cream-4)",
            }}
          >
            {eventTitle}
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "6px 14px", fontFamily: "var(--font-mono)", fontSize: 10.5, letterSpacing: "0.08em", color: "var(--cream-4)" }}>
            <span>{prettyDate}</span>
            <span>{guests >= 300 ? "300+" : guests} · {b.peopleInvited.split(" ")[0]}</span>
            <span>{plan.name}</span>
          </div>
        </div>

        {step === 0 && (
          <div style={{ position: "relative" }}>
            <label style={{ display: "block", fontFamily: "var(--font-mono)", fontSize: 9.5, letterSpacing: "0.22em", textTransform: "uppercase", color: "var(--cream-4)", marginBottom: 9 }}>
              {b.whatCelebrating}
            </label>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 20 }}>
              {b.kinds.map((k, i) => {
                const Icon = KIND_ICONS[i] ?? Gem;
                return (
                  <button
                    key={k}
                    type="button"
                    onClick={() => setKindIndex(i)}
                    style={{
                      display: "inline-flex", alignItems: "center", gap: 7,
                      fontSize: 14, padding: "9px 15px", borderRadius: 999, cursor: "pointer",
                      background: kindIndex === i ? "rgba(245,199,107,0.16)" : "var(--glass-bg)",
                      border: `1px solid ${kindIndex === i ? "var(--gold)" : "var(--hair-2)"}`,
                      color: kindIndex === i ? "var(--gold)" : "var(--cream-3)",
                      fontFamily: "var(--font-sans)",
                    }}
                  >
                    <Icon size={15} strokeWidth={2} aria-hidden />
                    {k}
                  </button>
                );
              })}
            </div>

            <label style={{ display: "block", fontFamily: "var(--font-mono)", fontSize: 9.5, letterSpacing: "0.22em", textTransform: "uppercase", color: "var(--cream-4)", marginBottom: 9 }}>
              {copy.plansFormNamePlaceholder}
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={copy.plansFormNamePlaceholder}
              style={{
                width: "100%", fontFamily: "var(--font-display)", fontSize: 20, padding: "14px 16px", borderRadius: 14,
                background: "var(--glass-bg)", border: "1px solid var(--hair-2)", color: "var(--cream)", outline: "none",
                boxSizing: "border-box",
              }}
            />

            <label style={{ display: "block", fontFamily: "var(--font-mono)", fontSize: 9.5, letterSpacing: "0.22em", textTransform: "uppercase", color: "var(--cream-4)", margin: "18px 0 9px" }}>
              {copy.plansFormDateLabel}
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              style={{
                width: "100%", fontSize: 16, padding: "14px 16px", borderRadius: 14, background: "var(--glass-bg)",
                border: "1px solid var(--hair-2)", color: "var(--cream)", outline: "none", boxSizing: "border-box",
                colorScheme: "dark",
              }}
            />

            <button
              type="button"
              onClick={() => setStep(1)}
              style={{
                width: "100%", marginTop: 22, fontSize: 16, fontWeight: 600, padding: "15px 22px", borderRadius: 999,
                border: "none", cursor: "pointer",
                background: "linear-gradient(135deg, var(--gold) 0%, var(--amber) 45%, var(--gold-deep) 100%)",
                color: "#1b1208", boxShadow: "0 16px 40px -14px rgba(240,179,75,0.6)", fontFamily: "var(--font-sans)",
              }}
            >
              {b.continueCta}
            </button>
            <p style={{ margin: "12px 0 0", textAlign: "center", fontFamily: "var(--font-mono)", fontSize: 10, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--cream-4)" }}>
              {b.noAccountYet}
            </p>
          </div>
        )}

        {step === 1 && (
          <div style={{ position: "relative" }}>
            <label style={{ display: "block", fontFamily: "var(--font-mono)", fontSize: 9.5, letterSpacing: "0.22em", textTransform: "uppercase", color: "var(--cream-4)", marginBottom: 10 }}>
              {b.guestsHeading}
            </label>
            <div style={{ display: "flex", alignItems: "baseline", gap: 10, marginBottom: 2 }}>
              <span style={{ fontFamily: "var(--font-display)", fontSize: 56, lineHeight: 1, color: "var(--gold)" }}>
                {guests >= 300 ? "300+" : guests}
              </span>
              <span style={{ fontSize: 14, color: "var(--cream-3)", fontFamily: "var(--font-sans)" }}>{b.peopleInvited}</span>
            </div>
            <input
              type="range"
              min={5}
              max={300}
              step={5}
              value={guests}
              onChange={(e) => setGuests(Number(e.target.value))}
              style={{ width: "100%", accentColor: "var(--amber)", margin: "12px 0 4px" }}
            />
            <div style={{ display: "flex", justifyContent: "space-between", fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--cream-4)", marginBottom: 22 }}>
              <span>5</span>
              <span>300+</span>
            </div>

            <div style={{ border: "1px solid rgba(245,199,107,0.35)", borderRadius: 18, padding: 18, background: "linear-gradient(180deg, rgba(245,199,107,0.08), rgba(245,199,107,0.02))" }}>
              <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
                <div>
                  <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, letterSpacing: "0.22em", textTransform: "uppercase", color: "var(--gold)" }}>
                    {b.recommended}
                  </div>
                  <div style={{ fontFamily: "var(--font-display)", fontSize: 26, color: "var(--cream)", marginTop: 3 }}>{plan.name}</div>
                </div>
                <div style={{ fontFamily: "var(--font-display)", fontSize: 32, color: "var(--cream)" }}>{priceRow?.value}</div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))", gap: "10px 16px", marginTop: 16, paddingTop: 16, borderTop: "1px solid var(--hair-2)" }}>
                {featureRows.slice(0, 5).map((row) => (
                  <div key={row.label}>
                    <div style={{ fontSize: 12, color: "var(--cream-4)", fontFamily: "var(--font-sans)" }}>{row.label}</div>
                    <div style={{ fontSize: 15, color: "var(--cream-2)", fontWeight: 500, fontFamily: "var(--font-sans)" }}>{row.value}</div>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ display: "flex", gap: 10, marginTop: 22, flexWrap: "wrap" }}>
              <button
                type="button"
                onClick={() => setStep(0)}
                style={{
                  fontSize: 15, padding: "14px 20px", borderRadius: 999, cursor: "pointer", background: "transparent",
                  border: "1px solid var(--hair-strong)", color: "var(--cream)", fontFamily: "var(--font-sans)",
                }}
              >
                {b.back}
              </button>
              <button
                type="button"
                onClick={() => setStep(2)}
                style={{
                  flex: 1, minWidth: 180, fontSize: 16, fontWeight: 600, padding: "15px 22px", borderRadius: 999,
                  border: "none", cursor: "pointer",
                  background: "linear-gradient(135deg, var(--gold) 0%, var(--amber) 45%, var(--gold-deep) 100%)",
                  color: "#1b1208", boxShadow: "0 16px 40px -14px rgba(240,179,75,0.6)", fontFamily: "var(--font-sans)",
                }}
              >
                {b.continueCta}
              </button>
            </div>
            <p style={{ margin: "12px 0 0", textAlign: "center", fontSize: 12, color: "var(--cream-4)", fontFamily: "var(--font-sans)" }}>
              <a href="#plans" style={{ color: "var(--gold)" }}>{b.comparePlans}</a>
            </p>
          </div>
        )}

        {step === 2 && (
          <div style={{ position: "relative" }}>
            {/* Preview: how the event will look */}
            <div style={{ position: "relative", borderRadius: 20, overflow: "hidden", background: "linear-gradient(155deg, #F4EAD9 0%, #E8DCC6 100%)", color: "#1A1108", padding: 20 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
                <div style={{ fontFamily: "var(--font-mono)", fontSize: 9.5, letterSpacing: "0.26em", textTransform: "uppercase", color: "#8A7E6B" }}>
                  {ui.createStep3.selectedPlanEyebrow}
                </div>
                <div style={{ fontFamily: "var(--font-mono)", fontSize: 9.5, letterSpacing: "0.26em", textTransform: "uppercase", color: "#8A7E6B" }}>
                  {prettyDate}
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 10, fontFamily: "var(--font-display)", fontSize: "clamp(24px, 3.6vw, 32px)", lineHeight: 1.1, margin: "8px 0 14px", color: "#1A1108" }}>
                <KindIcon size={26} strokeWidth={1.75} aria-hidden style={{ flexShrink: 0 }} />
                {eventTitle}
              </div>

              <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "6px 14px", fontFamily: "var(--font-mono)", fontSize: 10.5, letterSpacing: "0.08em", color: "#5A4F3C" }}>
                  <span>{guests >= 300 ? "300+" : guests} · {b.peopleInvited}</span>
                  <span>{plan.name}</span>
                </div>
                <div style={{ fontFamily: "var(--font-display)", fontSize: 22, color: "#1A1108" }}>{priceRow?.value}</div>
              </div>
            </div>

            {/* Payment / auth-gated action */}
            <div style={{ marginTop: 16 }}>
              {sessionState === "checking" && (
                <p style={{ margin: 0, textAlign: "center", fontFamily: "var(--font-display)", fontStyle: "italic", fontSize: 14, color: "var(--cream-4)" }}>
                  {ui.createStep3.checkingSession}
                </p>
              )}

              {sessionState === "anonymous" && (
                <div style={{ border: "1px dashed var(--hair-strong)", borderRadius: 16, padding: 18 }}>
                  <h4 style={{ margin: "0 0 6px", fontFamily: "var(--font-display)", fontSize: 18, color: "var(--cream)" }}>
                    {ui.createStep3.needAuthHeading}
                  </h4>
                  <p style={{ margin: "0 0 16px", fontSize: 13, color: "var(--cream-3)", lineHeight: 1.55, fontFamily: "var(--font-sans)" }}>
                    {ui.createStep3.needAuthBody}
                  </p>
                  <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                    <button
                      type="button"
                      onClick={() => goToAuth(loginHref)}
                      style={{
                        flex: 1, minWidth: 140, fontSize: 15, fontWeight: 600, padding: "13px 18px", borderRadius: 999,
                        border: "none", cursor: "pointer",
                        background: "linear-gradient(135deg, var(--gold) 0%, var(--amber) 45%, var(--gold-deep) 100%)",
                        color: "#1b1208", fontFamily: "var(--font-sans)",
                      }}
                    >
                      {ui.createStep3.logInBtn}
                    </button>
                    <button
                      type="button"
                      onClick={() => goToAuth(registerHref)}
                      style={{
                        flex: 1, minWidth: 140, fontSize: 15, padding: "13px 18px", borderRadius: 999, cursor: "pointer",
                        background: "transparent", border: "1px solid var(--hair-strong)", color: "var(--cream)", fontFamily: "var(--font-sans)",
                      }}
                    >
                      {ui.createStep3.createAcctBtn}
                    </button>
                  </div>
                </div>
              )}

              {sessionState === "authenticated" && (
                <>
                  {payError && (
                    <div role="alert" style={{ marginBottom: 12, fontSize: 13, color: "#E08A6C", background: "rgba(224,138,108,0.12)", padding: "10px 12px", borderRadius: 9, border: "1px solid rgba(224,138,108,0.4)", fontFamily: "var(--font-sans)" }}>
                      {payError}
                    </div>
                  )}
                  <button
                    type="button"
                    disabled={payBusy}
                    onClick={() => void onPay()}
                    style={{
                      width: "100%", fontSize: 16, fontWeight: 600, padding: "15px 22px", borderRadius: 999,
                      border: "none", cursor: payBusy ? "not-allowed" : "pointer",
                      background: payBusy ? "rgba(245,199,107,0.4)" : "linear-gradient(135deg, var(--gold) 0%, var(--amber) 45%, var(--gold-deep) 100%)",
                      color: "#1b1208", boxShadow: payBusy ? "none" : "0 16px 40px -14px rgba(240,179,75,0.6)", fontFamily: "var(--font-sans)",
                      display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                    }}
                  >
                    {payBusy && <Loader2 size={16} className="animate-spin" />}
                    {payBusy
                      ? (isPaid ? ui.createStep3.btnOpeningCheckout : ui.createStep3.btnCreating)
                      : (isPaid ? ui.createStep3.btnStripe : ui.createStep3.btnConfirmFree)}
                  </button>
                </>
              )}
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 16 }}>
              <button
                type="button"
                onClick={() => setStep(1)}
                style={{ background: "none", border: "none", color: "var(--cream-3)", fontSize: 13, cursor: "pointer", fontFamily: "var(--font-sans)" }}
              >
                {b.back}
              </button>
              <button
                type="button"
                onClick={() => setStep(0)}
                style={{ background: "none", border: "none", color: "var(--cream-3)", fontSize: 12, cursor: "pointer", textDecoration: "underline", fontFamily: "var(--font-sans)" }}
              >
                {b.startOver}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
