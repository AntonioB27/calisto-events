"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

import { useAppUi } from "@/components/AppUiProvider";
import { AppBtn } from "@/components/app-ui/AppBtn";
import {
  INVITATION_VISIBILITY_KEYS,
  parseInvitationFieldVisibility,
  type InvitationVisibilityKey,
} from "@/lib/event-print/invitation-field-visibility";
import { invitationVisibilityToggleLabel } from "@/lib/event-print/invitation-visibility-ui-labels";
import { InviteFieldVisibilityToggle } from "./InviteFieldVisibilityToggle";

import "./prints-form.css";

export type InvitationEventDetailsModalProps = Readonly<{
  open: boolean;
  onClose: () => void;
  sharedFields: Record<string, string>;
  setField: (key: string, value: string) => void;
  setVisibility: (key: InvitationVisibilityKey, on: boolean) => void;
  collapsedSections: ReadonlySet<string>;
  toggleSection: (id: string) => void;
  saving: boolean;
  saveError: string | null;
  saveHint: string | null;
  onSave: () => void;
}>;

export function InvitationEventDetailsModal({
  open,
  onClose,
  sharedFields,
  setField,
  setVisibility,
  collapsedSections,
  toggleSection,
  saving,
  saveError,
  saveHint,
  onSave,
}: InvitationEventDetailsModalProps) {
  const ui = useAppUi();
  const fieldVisibility = parseInvitationFieldVisibility(sharedFields);
  const [portalReady, setPortalReady] = useState(false);

  useEffect(() => {
    setPortalReady(true);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !saving) onClose();
    };
    window.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [open, onClose, saving]);

  if (!open || !portalReady) return null;

  return createPortal(
    <div
      className="pf-details-modal"
      role="dialog"
      aria-modal="true"
      aria-labelledby="pf-details-modal-title"
      onClick={saving ? undefined : onClose}
    >
      <div className="pf-details-modal__panel" onClick={(e) => e.stopPropagation()}>
        <header className="pf-details-modal__header">
          <h2 id="pf-details-modal-title" className="pf-details-modal__title">
            {ui.printsTab.eventDetailsModalTitle}
          </h2>
          <button
            type="button"
            className="pf-details-modal__close"
            onClick={onClose}
            disabled={saving}
            aria-label={ui.printsTab.eventDetailsClose}
          >
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
              <path d="M4 4 L14 14 M14 4 L4 14" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
            </svg>
          </button>
        </header>
        <div className="pf-details-modal__body">
          <div className="pf-card pf-card--in-modal">
      {/* 01 — Show on invitation */}
      <div className="pf-section">
        <div
          className={`pf-section-header pf-section-header--clickable${collapsedSections.has("01") ? " pf-section-header--collapsed" : ""}`}
          onClick={() => toggleSection("01")}
        >
          <span className="pf-section-num">01</span>
          <span className="pf-section-title">{ui.printsTab.inviteFieldVisibilityTitle}</span>
          <span className="pf-section-rule" />
          <svg className={`pf-section-chevron${collapsedSections.has("01") ? " pf-section-chevron--collapsed" : ""}`} width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
            <path d="M3 5 L7 9 L11 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        {!collapsedSections.has("01") && (
          <>
            <p className="pf-section-hint">{ui.printsTab.inviteFieldVisibilityHint}</p>
            <div className="pf-visibility-grid">
              {INVITATION_VISIBILITY_KEYS.map((key) => (
                <InviteFieldVisibilityToggle
                  key={key}
                  label={invitationVisibilityToggleLabel(ui.printsTab, key)}
                  showLabel={ui.printsTab.inviteFieldVisibilityShow}
                  hideLabel={ui.printsTab.inviteFieldVisibilityHide}
                  checked={fieldVisibility[key]}
                  onChange={(on) => setVisibility(key, on)}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {/* 02 — Names & symbol */}
      <div className="pf-section">
        <div
          className={`pf-section-header pf-section-header--clickable${collapsedSections.has("02") ? " pf-section-header--collapsed" : ""}`}
          onClick={() => toggleSection("02")}
        >
          <span className="pf-section-num">02</span>
          <span className="pf-section-title">{ui.printsTab.inviteFieldPartnerA} · {ui.printsTab.inviteFieldPartnerB}</span>
          <span className="pf-section-rule" />
          <svg className={`pf-section-chevron${collapsedSections.has("02") ? " pf-section-chevron--collapsed" : ""}`} width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
            <path d="M3 5 L7 9 L11 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        {!collapsedSections.has("02") && (
          <>
            <div className="pf-grid-2">
              <div className="pf-field">
                <label className="pf-label" htmlFor="field-partner-a">{ui.printsTab.inviteFieldPartnerA}</label>
                <input
                  id="field-partner-a"
                  className="pf-input"
                  value={sharedFields.partner_a ?? ""}
                  maxLength={80}
                  autoComplete="off"
                  onChange={(e) => setField("partner_a", e.target.value)}
                />
              </div>
              <div className="pf-field">
                <label className="pf-label" htmlFor="field-partner-b">{ui.printsTab.inviteFieldPartnerB}</label>
                <input
                  id="field-partner-b"
                  className="pf-input"
                  value={sharedFields.partner_b ?? ""}
                  maxLength={80}
                  autoComplete="off"
                  onChange={(e) => setField("partner_b", e.target.value)}
                />
              </div>
            </div>
            <div className="pf-field" style={{ marginTop: 18 }}>
              <span className="pf-label">{ui.printsTab.inviteFieldConnectorLabel}</span>
              <div className="pf-connector-row">
                {(["heart", "ampersand", "infinity"] as const).map((sym) => {
                  const active = (sharedFields.connector_symbol || "ampersand") === sym;
                  return (
                    <button
                      key={sym}
                      type="button"
                      className={`pf-connector-btn${active ? " pf-connector-btn--active" : ""}`}
                      onClick={() => setField("connector_symbol", sym)}
                    >
                      <span className="pf-connector-glyph">
                        {sym === "heart"
                          ? ui.printsTab.inviteFieldConnectorHeart
                          : sym === "ampersand"
                          ? ui.printsTab.inviteFieldConnectorAmpersand
                          : ui.printsTab.inviteFieldConnectorInfinity}
                      </span>
                      <span className="pf-connector-name">
                        {sym === "heart" ? "Heart" : sym === "ampersand" ? "And" : "Infinity"}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </>
        )}
      </div>

      {/* 03 — Venue */}
      <div className="pf-section">
        <div
          className={`pf-section-header pf-section-header--clickable${collapsedSections.has("03") ? " pf-section-header--collapsed" : ""}`}
          onClick={() => toggleSection("03")}
        >
          <span className="pf-section-num">03</span>
          <span className="pf-section-title">{ui.printsTab.inviteFieldVenue}</span>
          <span className="pf-section-rule" />
          <svg className={`pf-section-chevron${collapsedSections.has("03") ? " pf-section-chevron--collapsed" : ""}`} width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
            <path d="M3 5 L7 9 L11 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        {!collapsedSections.has("03") && <div className="pf-stack">
          <div className="pf-grid-2">
            <div className="pf-field">
              <label className="pf-label" htmlFor="field-venue">{ui.printsTab.inviteFieldVenue}</label>
              <input
                id="field-venue"
                className="pf-input"
                value={sharedFields.venue ?? ""}
                maxLength={200}
                autoComplete="off"
                onChange={(e) => setField("venue", e.target.value)}
              />
            </div>
            <div className="pf-field">
              <label className="pf-label" htmlFor="field-venue-2">{ui.printsTab.inviteFieldVenueLineTwo}</label>
              <input
                id="field-venue-2"
                className="pf-input"
                value={sharedFields.venue_line_2 ?? ""}
                maxLength={200}
                autoComplete="off"
                onChange={(e) => setField("venue_line_2", e.target.value)}
              />
            </div>
          </div>
          <div className="pf-field">
            <label className="pf-label" htmlFor="field-extra-line">{ui.printsTab.inviteFieldExtraLine}</label>
            <input
              id="field-extra-line"
              className="pf-input"
              value={sharedFields.extra_line ?? ""}
              maxLength={120}
              autoComplete="off"
              onChange={(e) => setField("extra_line", e.target.value)}
            />
          </div>
        </div>}
      </div>

      {/* 04 — Pre-ceremony gathering */}
      <div className="pf-section">
        <div
          className={`pf-section-header pf-section-header--clickable${collapsedSections.has("04") ? " pf-section-header--collapsed" : ""}`}
          onClick={() => toggleSection("04")}
        >
          <span className="pf-section-num">04</span>
          <span className="pf-section-title">{ui.printsTab.inviteFieldGatheringLabel}</span>
          <span className="pf-section-rule" />
          <svg className={`pf-section-chevron${collapsedSections.has("04") ? " pf-section-chevron--collapsed" : ""}`} width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
            <path d="M3 5 L7 9 L11 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        {!collapsedSections.has("04") && (
          <>
            <div className="pf-segment">
              {(["", "same", "separate"] as const).map((type) => {
                const active = (sharedFields.gathering_type ?? "") === type;
                return (
                  <button
                    key={type || "none"}
                    type="button"
                    className={`pf-segment-btn${active ? " pf-segment-btn--active" : ""}`}
                    onClick={() => setField("gathering_type", type)}
                  >
                    {type === ""
                      ? ui.printsTab.inviteFieldGatheringNone
                      : type === "same"
                      ? ui.printsTab.inviteFieldGatheringSame
                      : ui.printsTab.inviteFieldGatheringSeparate}
                  </button>
                );
              })}
            </div>
            {sharedFields.gathering_type === "same" ? (
              <div className="pf-grid-2" style={{ marginTop: 14 }}>
                <div className="pf-field">
                  <label className="pf-label" htmlFor="field-gathering-address">{ui.printsTab.inviteFieldGatheringAddress}</label>
                  <input
                    id="field-gathering-address"
                    className="pf-input"
                    value={sharedFields.gathering_address ?? ""}
                    maxLength={200}
                    autoComplete="off"
                    onChange={(e) => setField("gathering_address", e.target.value)}
                  />
                </div>
                <div className="pf-field">
                  <label className="pf-label" htmlFor="field-gathering-time">{ui.printsTab.inviteFieldGatheringTime}</label>
                  <input
                    id="field-gathering-time"
                    className="pf-input"
                    value={sharedFields.gathering_time ?? ""}
                    maxLength={80}
                    autoComplete="off"
                    onChange={(e) => setField("gathering_time", e.target.value)}
                  />
                </div>
              </div>
            ) : sharedFields.gathering_type === "separate" ? (
              <div className="pf-grid-2" style={{ marginTop: 14 }}>
                <div className="pf-split-col">
                  <p className="pf-partner-header">{sharedFields.partner_a || ui.printsTab.inviteFieldPartnerA}</p>
                  <div className="pf-stack">
                    <div className="pf-field">
                      <label className="pf-label" htmlFor="field-pa-gathering-address">{ui.printsTab.inviteFieldGatheringAddress}</label>
                      <input
                        id="field-pa-gathering-address"
                        className="pf-input"
                        value={sharedFields.partner_a_gathering_address ?? ""}
                        maxLength={200}
                        autoComplete="off"
                        onChange={(e) => setField("partner_a_gathering_address", e.target.value)}
                      />
                    </div>
                    <div className="pf-field">
                      <label className="pf-label" htmlFor="field-pa-gathering-time">{ui.printsTab.inviteFieldGatheringTime}</label>
                      <input
                        id="field-pa-gathering-time"
                        className="pf-input"
                        value={sharedFields.partner_a_gathering_time ?? ""}
                        maxLength={80}
                        autoComplete="off"
                        onChange={(e) => setField("partner_a_gathering_time", e.target.value)}
                      />
                    </div>
                  </div>
                </div>
                <div className="pf-split-col">
                  <p className="pf-partner-header">{sharedFields.partner_b || ui.printsTab.inviteFieldPartnerB}</p>
                  <div className="pf-stack">
                    <div className="pf-field">
                      <label className="pf-label" htmlFor="field-pb-gathering-address">{ui.printsTab.inviteFieldGatheringAddress}</label>
                      <input
                        id="field-pb-gathering-address"
                        className="pf-input"
                        value={sharedFields.partner_b_gathering_address ?? ""}
                        maxLength={200}
                        autoComplete="off"
                        onChange={(e) => setField("partner_b_gathering_address", e.target.value)}
                      />
                    </div>
                    <div className="pf-field">
                      <label className="pf-label" htmlFor="field-pb-gathering-time">{ui.printsTab.inviteFieldGatheringTime}</label>
                      <input
                        id="field-pb-gathering-time"
                        className="pf-input"
                        value={sharedFields.partner_b_gathering_time ?? ""}
                        maxLength={80}
                        autoComplete="off"
                        onChange={(e) => setField("partner_b_gathering_time", e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              </div>
            ) : null}
          </>
        )}
      </div>

      {/* 05 — Church */}
      <div className="pf-section">
        <div
          className={`pf-section-header pf-section-header--clickable${collapsedSections.has("05") ? " pf-section-header--collapsed" : ""}`}
          onClick={() => toggleSection("05")}
        >
          <span className="pf-section-num">05</span>
          <span className="pf-section-title">{ui.printsTab.inviteFieldChurchLabel}</span>
          <span className="pf-section-rule" />
          <svg className={`pf-section-chevron${collapsedSections.has("05") ? " pf-section-chevron--collapsed" : ""}`} width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
            <path d="M3 5 L7 9 L11 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        {!collapsedSections.has("05") && (
          <div className="pf-grid-2">
            <div className="pf-field">
              <label className="pf-label" htmlFor="field-church-address">{ui.printsTab.inviteFieldChurchAddress}</label>
              <input
                id="field-church-address"
                className="pf-input"
                value={sharedFields.church_address ?? ""}
                maxLength={200}
                autoComplete="off"
                onChange={(e) => setField("church_address", e.target.value)}
              />
            </div>
            <div className="pf-field">
              <label className="pf-label" htmlFor="field-church-time">{ui.printsTab.inviteFieldChurchTime}</label>
              <input
                id="field-church-time"
                className="pf-input"
                value={sharedFields.church_time ?? ""}
                maxLength={80}
                autoComplete="off"
                onChange={(e) => setField("church_time", e.target.value)}
              />
            </div>
          </div>
        )}
      </div>

      {/* 06 — Dinner reception */}
      <div className="pf-section">
        <div
          className={`pf-section-header pf-section-header--clickable${collapsedSections.has("06") ? " pf-section-header--collapsed" : ""}`}
          onClick={() => toggleSection("06")}
        >
          <span className="pf-section-num">06</span>
          <span className="pf-section-title">{ui.printsTab.inviteFieldDinnerLabel}</span>
          <span className="pf-section-rule" />
          <svg className={`pf-section-chevron${collapsedSections.has("06") ? " pf-section-chevron--collapsed" : ""}`} width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
            <path d="M3 5 L7 9 L11 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        {!collapsedSections.has("06") && (
          <div className="pf-grid-2">
            <div className="pf-field">
              <label className="pf-label" htmlFor="field-dinner-address">{ui.printsTab.inviteFieldDinnerAddress}</label>
              <input
                id="field-dinner-address"
                className="pf-input"
                value={sharedFields.dinner_address ?? ""}
                maxLength={200}
                autoComplete="off"
                onChange={(e) => setField("dinner_address", e.target.value)}
              />
            </div>
            <div className="pf-field">
              <label className="pf-label" htmlFor="field-dinner-time">{ui.printsTab.inviteFieldDinnerTime}</label>
              <input
                id="field-dinner-time"
                className="pf-input"
                value={sharedFields.dinner_time ?? ""}
                maxLength={80}
                autoComplete="off"
                onChange={(e) => setField("dinner_time", e.target.value)}
              />
            </div>
          </div>
        )}
      </div>

      {/* 07 — Quote */}
      <div className="pf-section">
        <div
          className={`pf-section-header pf-section-header--clickable${collapsedSections.has("07") ? " pf-section-header--collapsed" : ""}`}
          onClick={() => toggleSection("07")}
        >
          <span className="pf-section-num">07</span>
          <span className="pf-section-title">{ui.printsTab.inviteFieldQuoteLabel}</span>
          <span className="pf-section-rule" />
          <svg className={`pf-section-chevron${collapsedSections.has("07") ? " pf-section-chevron--collapsed" : ""}`} width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
            <path d="M3 5 L7 9 L11 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        {!collapsedSections.has("07") && (
          <div className="pf-quote-wrap pf-stack">
            <span className="pf-quote-deco" aria-hidden="true">&ldquo;</span>
            <div className="pf-field">
              <label className="pf-label" htmlFor="field-quote-text">{ui.printsTab.inviteFieldQuoteText}</label>
              <textarea
                id="field-quote-text"
                className="pf-input pf-textarea"
                value={sharedFields.quote_text ?? ""}
                maxLength={400}
                rows={3}
                autoComplete="off"
                onChange={(e) => setField("quote_text", e.target.value)}
              />
            </div>
            <div className="pf-field">
              <label className="pf-label" htmlFor="field-quote-author">{ui.printsTab.inviteFieldQuoteAuthor}</label>
              <input
                id="field-quote-author"
                className="pf-input"
                value={sharedFields.quote_author ?? ""}
                maxLength={120}
                autoComplete="off"
                onChange={(e) => setField("quote_author", e.target.value)}
              />
            </div>
          </div>
        )}
      </div>

          </div>
        </div>
        <footer className="pf-details-modal__footer">
          <div className="pf-details-modal__footerMessages">
            {saveError ? <p className="pf-save-error">{saveError}</p> : null}
            {saveHint ? (
              <span className="pf-save-hint">
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                  <circle cx="7" cy="7" r="6" stroke="currentColor" strokeWidth="1.4" />
                  <path d="M4.5 7 L6.2 8.8 L9.5 5.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                {saveHint}
              </span>
            ) : null}
          </div>
          <div className="pf-details-modal__footerActions">
            <AppBtn type="button" variant="ghost" size="sm" disabled={saving} onClick={onClose}>
              {ui.common.cancel}
            </AppBtn>
            <AppBtn type="button" variant="gold" size="sm" disabled={saving} loading={saving} onClick={onSave}>
              {ui.printsTab.saveDraft}
            </AppBtn>
          </div>
        </footer>
      </div>
    </div>,
    document.body,
  );
}
