"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import type { AppUiDict } from "@/lib/app-ui";
import { interpolate } from "@/lib/app-ui";

import "./prints-setup.css";

type WizardFields = {
  partner_a: string;
  partner_b: string;
  connector_symbol: string;
  extra_line: string;
  gathering_type: string;
  gathering_time: string;
  partner_a_gathering_time: string;
  partner_b_gathering_time: string;
  church_time: string;
  dinner_time: string;
  quote_text: string;
  quote_author: string;
};

type Props = Readonly<{
  eventId: string;
  eventDisplayName: string;
  formattedDate: string;
  partnerADefault: string;
  partnerBDefault: string;
  existingDraft: Readonly<Record<string, string>>;
  invitationTemplateIds: readonly string[];
  userInitial: string;
  ui: AppUiDict;
}>;

const STEPS = ["couple", "when", "gathering", "ceremony", "reception", "quote", "review"] as const;
type StepId = (typeof STEPS)[number];

function stepLabel(id: StepId, s: AppUiDict["printsSetup"]): string {
  switch (id) {
    case "couple": return s.stepCouple;
    case "when": return s.stepWhen;
    case "gathering": return s.stepGathering;
    case "ceremony": return s.stepCeremony;
    case "reception": return s.stepReception;
    case "quote": return s.stepQuote;
    case "review": return s.stepReview;
  }
}

// Arrow icons
function ArrowRight() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function ArrowLeft() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M19 12H5M11 18l-6-6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function CheckIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <polyline points="20 6 9 17 4 12" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function SymbolGlyph({ symbol }: { symbol: string }) {
  return <>{symbol === "heart" ? "♥" : symbol === "infinity" ? "∞" : "&"}</>;
}

export function PrintsSetupWizard({
  eventId,
  eventDisplayName,
  formattedDate,
  partnerADefault,
  partnerBDefault,
  existingDraft,
  invitationTemplateIds,
  userInitial,
  ui,
}: Props) {
  const s = ui.printsSetup;
  const router = useRouter();

  const [step, setStep] = useState<number>(0);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const [fields, setFields] = useState<WizardFields>({
    partner_a: existingDraft.partner_a ?? partnerADefault,
    partner_b: existingDraft.partner_b ?? partnerBDefault,
    connector_symbol: existingDraft.connector_symbol ?? "ampersand",
    extra_line: existingDraft.extra_line ?? "",
    gathering_type: existingDraft.gathering_type ?? "",
    gathering_time: existingDraft.gathering_time ?? "",
    partner_a_gathering_time: existingDraft.partner_a_gathering_time ?? "",
    partner_b_gathering_time: existingDraft.partner_b_gathering_time ?? "",
    church_time: existingDraft.church_time ?? "",
    dinner_time: existingDraft.dinner_time ?? "",
    quote_text: existingDraft.quote_text ?? "",
    quote_author: existingDraft.quote_author ?? "",
  });

  function setField(key: keyof WizardFields, value: string) {
    setFields((prev) => ({ ...prev, [key]: value }));
  }

  // Auto-focus first input on step change
  const firstInputRef = useRef<HTMLInputElement | null>(null);
  useEffect(() => {
    firstInputRef.current?.focus();
  }, [step]);

  async function saveFields(): Promise<boolean> {
    if (invitationTemplateIds.length === 0) return true;
    setSaving(true);
    setSaveError(null);
    try {
      await Promise.all(
        invitationTemplateIds.map((templateId) =>
          fetch(`/api/events/${eventId}/print-template-instance`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ templateId, fieldValues: fields }),
          }).then(async (res) => {
            if (!res.ok) {
              const p = (await res.json().catch(() => null)) as { error?: string } | null;
              throw new Error(typeof p?.error === "string" ? p.error : s.saveFail);
            }
          }),
        ),
      );
      return true;
    } catch {
      setSaveError(s.saveFail);
      return false;
    } finally {
      setSaving(false);
    }
  }

  async function handleContinue() {
    const ok = await saveFields();
    if (!ok) return;
    if (step < STEPS.length - 1) {
      setStep((p) => p + 1);
    } else {
      router.push(`/events/${eventId}?tab=prints`);
    }
  }

  const isLastStep = step === STEPS.length - 1;
  const currentStepId = STEPS[step];

  function renderStepContent() {
    switch (currentStepId) {
      case "couple":
        return (
          <div className="psw-group">
            <div className="psw-grid-2">
              <div className="psw-field">
                <span className="psw-label">{s.coupleFirstName}</span>
                <input
                  ref={firstInputRef}
                  className="psw-input"
                  value={fields.partner_a}
                  placeholder="Kyle"
                  maxLength={80}
                  autoComplete="off"
                  onChange={(e) => setField("partner_a", e.target.value)}
                />
              </div>
              <div className="psw-field">
                <span className="psw-label">{s.coupleSecondName}</span>
                <input
                  className="psw-input"
                  value={fields.partner_b}
                  placeholder="Laura"
                  maxLength={80}
                  autoComplete="off"
                  onChange={(e) => setField("partner_b", e.target.value)}
                />
              </div>
            </div>
            <div className="psw-field">
              <span className="psw-label">{s.coupleSymbol}</span>
              <div className="psw-symbol-grid">
                {(["heart", "ampersand", "infinity"] as const).map((sym) => {
                  const active = fields.connector_symbol === sym;
                  return (
                    <button
                      key={sym}
                      type="button"
                      className={`psw-symbol-btn${active ? " psw-symbol-btn--active" : ""}`}
                      onClick={() => setField("connector_symbol", sym)}
                    >
                      <span className="psw-symbol-glyph"><SymbolGlyph symbol={sym} /></span>
                      <span className="psw-symbol-name">
                        {sym === "heart" ? s.symbolHeart : sym === "ampersand" ? s.symbolAnd : s.symbolInfinity}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        );

      case "when":
        return (
          <div className="psw-group">
            <div className="psw-grid-date">
              <div className="psw-field">
                <span className="psw-label">{s.whenDate}</span>
                <input
                  ref={firstInputRef}
                  className="psw-input psw-input--date"
                  value={formattedDate}
                  readOnly
                  tabIndex={-1}
                />
              </div>
              <div className="psw-field">
                <span className="psw-label">{s.whenTime}</span>
                <input
                  ref={firstInputRef}
                  className="psw-input"
                  value={fields.extra_line}
                  placeholder="17:00"
                  maxLength={80}
                  autoComplete="off"
                  onChange={(e) => setField("extra_line", e.target.value)}
                />
              </div>
            </div>
          </div>
        );

      case "gathering": {
        const gType = fields.gathering_type;
        return (
          <div className="psw-group">
            <div className="psw-field">
              <div className="psw-choice-grid">
                {(["", "same", "separate"] as const).map((type) => {
                  const active = gType === type;
                  const label = type === "" ? s.gatheringNone : type === "same" ? s.gatheringTogether : s.gatheringSeparate;
                  const icon = type === "" ? "✕" : type === "same" ? "⌂" : "⇄";
                  return (
                    <button
                      key={type || "none"}
                      type="button"
                      className={`psw-choice-btn${active ? " psw-choice-btn--active" : ""}`}
                      onClick={() => {
                        setField("gathering_type", type);
                        if (type !== "same") {
                          setField("gathering_time", "");
                        }
                        if (type !== "separate") {
                          setField("partner_a_gathering_time", "");
                          setField("partner_b_gathering_time", "");
                        }
                      }}
                    >
                      <span className="psw-choice-icon">{icon}</span>
                      <span className="psw-choice-name">{label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {gType === "same" ? (
              <>
<div className="psw-field">
                  <span className="psw-label">{s.gatheringTime}</span>
                  <input
                    className="psw-input"
                    value={fields.gathering_time}
                    placeholder="15:00"
                    maxLength={80}
                    autoComplete="off"
                    onChange={(e) => setField("gathering_time", e.target.value)}
                  />
                </div>
              </>
            ) : gType === "separate" ? (
              <div className="psw-grid-2">
                <div className="psw-group">
                  <p className="psw-partner-label">{fields.partner_a || "Partner A"}</p>
  <div className="psw-field">
                    <span className="psw-label">{s.gatheringTime}</span>
                    <input
                      className="psw-input"
                      value={fields.partner_a_gathering_time}
                      placeholder="15:00"
                      maxLength={80}
                      autoComplete="off"
                      onChange={(e) => setField("partner_a_gathering_time", e.target.value)}
                    />
                  </div>
                </div>
                <div className="psw-group">
                  <p className="psw-partner-label">{fields.partner_b || "Partner B"}</p>
  <div className="psw-field">
                    <span className="psw-label">{s.gatheringTime}</span>
                    <input
                      className="psw-input"
                      value={fields.partner_b_gathering_time}
                      placeholder="15:00"
                      maxLength={80}
                      autoComplete="off"
                      onChange={(e) => setField("partner_b_gathering_time", e.target.value)}
                    />
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        );
      }

      case "ceremony":
        return (
          <div className="psw-group">
            <div className="psw-field">
              <span className="psw-label">{s.ceremonyTime}</span>
              <input
                className="psw-input"
                value={fields.church_time}
                placeholder="17:00"
                maxLength={80}
                autoComplete="off"
                onChange={(e) => setField("church_time", e.target.value)}
              />
            </div>
          </div>
        );

      case "reception":
        return (
          <div className="psw-group">
            <div className="psw-field">
              <span className="psw-label">{s.receptionTime}</span>
              <input
                className="psw-input"
                value={fields.dinner_time}
                placeholder="19:00"
                maxLength={80}
                autoComplete="off"
                onChange={(e) => setField("dinner_time", e.target.value)}
              />
            </div>
          </div>
        );

      case "quote":
        return (
          <div className="psw-group">
            <div className="psw-field">
              <span className="psw-label">{s.quoteLabel}</span>
              <input
                ref={firstInputRef}
                className="psw-input"
                value={fields.quote_text}
                placeholder="Two souls, one heart"
                maxLength={400}
                autoComplete="off"
                onChange={(e) => setField("quote_text", e.target.value)}
              />
            </div>
            <div className="psw-field">
              <span className="psw-label">{s.quoteAuthor}</span>
              <input
                className="psw-input"
                value={fields.quote_author}
                placeholder="— Anonymous"
                maxLength={120}
                autoComplete="off"
                onChange={(e) => setField("quote_author", e.target.value)}
              />
            </div>
          </div>
        );

      case "review":
        return (
          <div>
            <p className="psw-review-subhead">{s.reviewSubhead}</p>
            <div className="psw-review-card">
              {((): [string, string][] => {
                const rows: [string, string][] = [
                  [s.reviewCouple, `${fields.partner_a || "—"} ${fields.connector_symbol === "heart" ? "♥" : fields.connector_symbol === "infinity" ? "∞" : "&"} ${fields.partner_b || "—"}`],
                  [s.reviewDate, formattedDate || "—"],
                ];
                if (fields.gathering_type === "same") rows.push([s.reviewGathering, fields.gathering_time || "—"]);
                else if (fields.gathering_type === "separate") rows.push([s.reviewGathering, `${fields.partner_a || "A"} / ${fields.partner_b || "B"}`]);
                rows.push([s.reviewCeremony, fields.church_time || "—"]);
                rows.push([s.reviewReception, fields.dinner_time || "—"]);
                return rows;
              })().map(([key, val]) => (
                <div key={key} className="psw-review-row">
                  <span className="psw-review-key">{key}</span>
                  <span className="psw-review-val">{val}</span>
                </div>
              ))}
            </div>
          </div>
        );
    }
  }

  const symGlyph = fields.connector_symbol === "heart" ? "♥" : fields.connector_symbol === "infinity" ? "∞" : "&";

  return (
    <div className="psw">
      {/* Header */}
      <header className="psw-header">
        <div className="psw-header-wordmark">
          <span>Calisto</span>
          <div className="psw-header-dot" />
        </div>
        <span className="psw-header-sep">/</span>
        <span className="psw-header-crumb">
          {eventDisplayName || "Event"}
        </span>
        <span className="psw-header-sep">/</span>
        <span className="psw-header-crumb psw-header-crumb-active">
          {ui.printsTab.categoryInvitation} · {ui.printsSetup.stepCouple !== stepLabel(currentStepId, s) ? stepLabel(currentStepId, s) : s.stepCouple}
        </span>
        <div className="psw-header-spacer" />
        <div className="psw-header-avatar">{userInitial}</div>
      </header>

      {/* Split body */}
      <div className="psw-body">
        {/* Left: form */}
        <div className="psw-left">
          {/* Stepper */}
          <nav className="psw-stepper" aria-label="Setup steps">
            {STEPS.map((id, i) => {
              const done = i < step;
              const active = i === step;
              return (
                <button
                  key={id}
                  type="button"
                  className={`psw-step-btn${active ? " psw-step-btn--active" : ""}`}
                  onClick={() => setStep(i)}
                >
                  <div className={`psw-step-dot${done ? " psw-step-dot--done" : active ? " psw-step-dot--active" : ""}`}>
                    {done ? "✓" : i + 1}
                  </div>
                  <span className={`psw-step-label${done ? " psw-step-label--done" : active ? " psw-step-label--active" : ""}`}>
                    {stepLabel(id, s)}
                  </span>
                </button>
              );
            })}
          </nav>

          {/* Step content */}
          <div>
            <p className="psw-step-eyebrow">
              {interpolate(s.stepEyebrow, { current: String(step + 1), total: String(STEPS.length) })}
            </p>
            <h2 className="psw-step-title">{stepLabel(currentStepId, s)}</h2>
            {renderStepContent()}

            {saveError ? (
              <p style={{ marginTop: 16, fontSize: 13, color: "#e05252" }}>{saveError}</p>
            ) : null}
          </div>
        </div>

        {/* Right: live preview */}
        <div className="psw-right">
          <div className="psw-preview-label">
            <p className="psw-preview-eyebrow">{s.livePreviewEyebrow}</p>
            <p className="psw-preview-sub">{s.livePreviewSub}</p>
          </div>

          <div className="psw-preview-tilt">
            <div className="psw-invite-card">
              <div className="psw-invite-border-top" />
              <div className="psw-invite-border-bottom" />
              <div className="psw-invite-border-left" />
              <div className="psw-invite-border-right" />

              <p className="psw-invite-eyebrow">Together with their families</p>
              <p className="psw-invite-preamble">
                request the pleasure of your company at the wedding of
              </p>

              <div className="psw-invite-name">{fields.partner_a || "Name"}</div>
              <div className="psw-invite-symbol">{symGlyph}</div>
              <div className="psw-invite-name">{fields.partner_b || "Name"}</div>

              <div className="psw-invite-rule" />

              <div className="psw-invite-date">{formattedDate || "date"}</div>
              {fields.extra_line ? (
                <div className="psw-invite-time">{fields.extra_line}</div>
              ) : null}

              {fields.gathering_type === "same" && fields.gathering_time ? (
                <>
                  <div className="psw-invite-rule" />
                  <p className="psw-invite-section-label">Gathering</p>
                  <p className="psw-invite-venue-time">{fields.gathering_time}</p>
                </>
              ) : null}

              {fields.church_time ? (
                <>
                  <div className="psw-invite-rule" />
                  <p className="psw-invite-section-label">Ceremony</p>
                  <p className="psw-invite-venue-time">{fields.church_time}</p>
                </>
              ) : null}

              {fields.dinner_time ? (
                <>
                  <p className="psw-invite-section-label" style={{ marginTop: 12 }}>Reception</p>
                  <p className="psw-invite-venue-time">{fields.dinner_time}</p>
                </>
              ) : null}

              {fields.quote_text ? (
                <p className="psw-invite-quote">"{fields.quote_text}"</p>
              ) : null}
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="psw-footer">
        <Link href={`/events/${eventId}?tab=prints`} className="psw-btn psw-btn--link">
          <ArrowLeft /> {s.backToPrints}
        </Link>
        <div className="psw-footer-right">
          {step > 0 ? (
            <button
              type="button"
              className="psw-btn psw-btn--ghost"
              onClick={() => setStep((p) => p - 1)}
              disabled={saving}
            >
              <ArrowLeft /> {s.back}
            </button>
          ) : null}
          <button
            type="button"
            className={`psw-btn ${isLastStep ? "psw-btn--gold" : "psw-btn--primary"}`}
            onClick={() => void handleContinue()}
            disabled={saving}
          >
            {saving ? "…" : isLastStep ? s.finishSetup : s.continue}
            {!saving && <ArrowRight />}
          </button>
        </div>
      </footer>
    </div>
  );
}
