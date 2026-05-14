"use client";

import Link from "next/link";
import type { CSSProperties } from "react";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { useAppUi } from "@/components/AppUiProvider";
import type { AppUiDict } from "@/lib/app-ui";
import { AppBtn } from "@/components/app-ui/AppBtn";
import { AppCard } from "@/components/app-ui/AppCard";
import { GoldBar } from "@/components/app-ui/GoldBar";
import { EVENT_KINDS, type EventKind } from "@/lib/event-kind";
import { defaultFieldValuesForTemplate } from "@/lib/event-print/print-field-defaults";
import {
  isTableQrTemplateId,
  listPrintTemplatesForEventKind,
  type PrintTemplateDef,
} from "@/lib/event-print/template-catalog";
import type { Locale } from "@/lib/i18n";

type PrintsTabProps = Readonly<{
  eventId: string;
  /** Current `events.event_kind` (may be default until gate completes). */
  eventKind: EventKind;
  /** When non-null, organizer completed the Prints event-type step. */
  printsEventKindSetAt: string | null;
  eventDisplayName: string;
  eventDateIso: string;
  uiLocale: Locale;
  printDraftByTemplateId: Readonly<Record<string, Readonly<Record<string, string>>>>;
}>;

function buildInvitationFieldState(
  templatesWithFields: readonly PrintTemplateDef[],
  drafts: Readonly<Record<string, Readonly<Record<string, string>>>>,
  eventDisplayName: string,
  eventDateIso: string,
  locale: Locale,
): Record<string, Record<string, string>> {
  const out: Record<string, Record<string, string>> = {};
  for (const t of templatesWithFields) {
    const defaults = defaultFieldValuesForTemplate(t.id, eventDisplayName, eventDateIso, locale);
    out[t.id] = { ...defaults, ...(drafts[t.id] ?? {}) };
  }
  return out;
}

function templateCardTitle(t: PrintTemplateDef, tab: AppUiDict["printsTab"]): string {
  switch (t.id) {
    case "table-minimal":
      return tab.templateTableMinimal;
    case "table-bold":
      return tab.templateTableBold;
    case "wedding-invite-simple":
      return tab.templateWeddingInviteSimple;
    default:
      return t.id;
  }
}

function inviteFieldLabel(key: string, tab: AppUiDict["printsTab"]): string {
  switch (key) {
    case "partner_a":
      return tab.inviteFieldPartnerA;
    case "partner_b":
      return tab.inviteFieldPartnerB;
    case "venue":
      return tab.inviteFieldVenue;
    case "extra_line":
      return tab.inviteFieldExtraLine;
    default:
      return key;
  }
}

export function PrintsTab({
  eventId,
  eventKind,
  printsEventKindSetAt,
  eventDisplayName,
  eventDateIso,
  uiLocale,
  printDraftByTemplateId,
}: PrintsTabProps) {
  const ui = useAppUi();
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busyTemplateId, setBusyTemplateId] = useState<string | null>(null);
  const [templateError, setTemplateError] = useState<Readonly<Record<string, string | null>>>({});
  const [templateHint, setTemplateHint] = useState<Readonly<Record<string, string | null>>>({});

  const templates = useMemo(() => listPrintTemplatesForEventKind(eventKind), [eventKind]);
  const invitationTemplates = useMemo(
    () => templates.filter((t) => t.category === "invitation"),
    [templates],
  );
  const tableTemplates = useMemo(() => templates.filter((t) => t.category === "table_qr"), [templates]);

  const draftFingerprint = useMemo(() => JSON.stringify(printDraftByTemplateId), [printDraftByTemplateId]);

  const [invitationFields, setInvitationFields] = useState<Record<string, Record<string, string>>>(() =>
    buildInvitationFieldState(
      listPrintTemplatesForEventKind(eventKind).filter((t) => t.fields.length > 0),
      printDraftByTemplateId,
      eventDisplayName,
      eventDateIso,
      uiLocale,
    ),
  );

  useEffect(() => {
    const withFields = listPrintTemplatesForEventKind(eventKind).filter((t) => t.fields.length > 0);
    setInvitationFields(buildInvitationFieldState(withFields, printDraftByTemplateId, eventDisplayName, eventDateIso, uiLocale));
  }, [draftFingerprint, eventKind, eventDisplayName, eventDateIso, uiLocale]);

  async function confirmKind(kind: EventKind) {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/events/${eventId}/prints-confirm-event-kind`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ eventKind: kind }),
      });
      const payload = (await res.json().catch(() => null)) as { error?: string } | null;
      if (!res.ok) {
        throw new Error(typeof payload?.error === "string" ? payload.error : ui.printsTab.confirmKindFail);
      }
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : ui.printsTab.confirmKindFail);
    } finally {
      setBusy(false);
    }
  }

  async function saveDraft(templateId: string) {
    const values = invitationFields[templateId];
    if (!values) return;
    setBusyTemplateId(templateId);
    setTemplateError((prev) => ({ ...prev, [templateId]: null }));
    setTemplateHint((prev) => ({ ...prev, [templateId]: null }));
    try {
      const res = await fetch(`/api/events/${eventId}/print-template-instance`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ templateId, fieldValues: values }),
      });
      const payload = (await res.json().catch(() => null)) as { error?: string } | null;
      if (!res.ok) {
        throw new Error(typeof payload?.error === "string" ? payload.error : ui.printsTab.draftSaveFail);
      }
      setTemplateHint((prev) => ({ ...prev, [templateId]: ui.printsTab.draftSaved }));
      router.refresh();
    } catch (e) {
      const msg = e instanceof Error ? e.message : ui.printsTab.draftSaveFail;
      setTemplateError((prev) => ({ ...prev, [templateId]: msg }));
    } finally {
      setBusyTemplateId(null);
    }
  }

  if (!printsEventKindSetAt) {
    return (
      <section style={{ maxWidth: 560 }}>
        <div style={{ marginBottom: 20 }}>
          <GoldBar />
          <p
            style={{
              marginTop: 12,
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              color: "var(--app-muted)",
            }}
          >
            {ui.printsTab.kindEyebrow}
          </p>
          <h2
            style={{
              marginTop: 8,
              fontFamily: "var(--font-display)",
              fontStyle: "italic",
              fontWeight: 700,
              fontSize: 32,
              color: "var(--app-text)",
              lineHeight: 1.15,
            }}
          >
            {ui.printsTab.kindTitle}
          </h2>
          <p style={{ marginTop: 10, fontSize: 14, color: "var(--app-muted)", lineHeight: 1.55 }}>{ui.printsTab.kindHint}</p>
        </div>

        {error ? (
          <p
            style={{
              marginBottom: 14,
              fontSize: 13,
              color: "var(--app-danger)",
              background: "color-mix(in srgb, var(--app-danger) 10%, transparent)",
              padding: "10px 14px",
              borderRadius: 10,
              border: "1.5px solid color-mix(in srgb, var(--app-danger) 35%, transparent)",
            }}
          >
            {error}
          </p>
        ) : null}

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {EVENT_KINDS.map((k) => (
            <AppBtn
              key={k}
              type="button"
              variant="gold"
              className="w-full !justify-center"
              disabled={busy}
              loading={busy}
              onClick={() => void confirmKind(k)}
            >
              {k === "generic" ? ui.printsTab.kindOptionGeneric : ui.printsTab.kindOptionWedding}
            </AppBtn>
          ))}
        </div>
      </section>
    );
  }

  const inputStyle: CSSProperties = {
    width: "100%",
    marginTop: 6,
    padding: "10px 12px",
    borderRadius: 12,
    border: "1.5px solid color-mix(in srgb, var(--app-muted) 35%, transparent)",
    background: "var(--app-surface)",
    color: "var(--app-text)",
    fontSize: 14,
    boxSizing: "border-box",
  };

  const sectionTitleStyle: CSSProperties = {
    margin: "28px 0 12px",
    fontSize: 13,
    fontWeight: 700,
    letterSpacing: "0.12em",
    textTransform: "uppercase",
    color: "var(--app-muted)",
  };

  return (
    <section style={{ maxWidth: 720 }}>
      <div style={{ marginBottom: 22 }}>
        <GoldBar />
        <h2
          style={{
            marginTop: 12,
            fontFamily: "var(--font-display)",
            fontStyle: "italic",
            fontWeight: 700,
            fontSize: 32,
            color: "var(--app-text)",
            lineHeight: 1.15,
          }}
        >
          {ui.printsTab.title}
        </h2>
        <p style={{ marginTop: 8, fontSize: 14, color: "var(--app-muted)", lineHeight: 1.55 }}>{ui.printsTab.subtitle}</p>
      </div>

      {invitationTemplates.length > 0 ? (
        <>
          <h3 style={sectionTitleStyle}>{ui.printsTab.categoryInvitation}</h3>
          <div className="flex flex-col gap-4">
            {invitationTemplates.map((t) => (
              <AppCard key={t.id} pad="lg" style={{ borderRadius: 18 }}>
                <h4
                  style={{
                    margin: 0,
                    fontFamily: "var(--font-display)",
                    fontStyle: "italic",
                    fontWeight: 700,
                    fontSize: 22,
                    color: "var(--app-text)",
                  }}
                >
                  {templateCardTitle(t, ui.printsTab)}
                </h4>
                {t.fields.length > 0 ? (
                  <div style={{ marginTop: 16 }} className="flex flex-col gap-3">
                    {t.fields.map((f) => (
                      <label key={f.key} style={{ display: "block", fontSize: 12, fontWeight: 600, color: "var(--app-muted)" }}>
                        {inviteFieldLabel(f.key, ui.printsTab)}
                        {f.required ? <span style={{ color: "var(--app-danger)" }}> *</span> : null}
                        <input
                          style={inputStyle}
                          value={invitationFields[t.id]?.[f.key] ?? ""}
                          maxLength={f.maxLength}
                          autoComplete="off"
                          onChange={(e) => {
                            const v = e.target.value;
                            setTemplateHint((prev) => ({ ...prev, [t.id]: null }));
                            setInvitationFields((prev) => ({
                              ...prev,
                              [t.id]: { ...(prev[t.id] ?? {}), [f.key]: v },
                            }));
                          }}
                        />
                      </label>
                    ))}
                    {templateError[t.id] ? (
                      <p style={{ margin: 0, fontSize: 13, color: "var(--app-danger)" }}>{templateError[t.id]}</p>
                    ) : null}
                    {templateHint[t.id] ? (
                      <p style={{ margin: 0, fontSize: 13, color: "var(--app-muted)" }}>{templateHint[t.id]}</p>
                    ) : null}
                    <div style={{ marginTop: 8, display: "flex", flexWrap: "wrap", gap: 10, alignItems: "center" }}>
                      <AppBtn
                        type="button"
                        variant="gold"
                        disabled={busyTemplateId !== null}
                        loading={busyTemplateId === t.id}
                        onClick={() => void saveDraft(t.id)}
                      >
                        {ui.printsTab.saveDraft}
                      </AppBtn>
                      <AppBtn
                        href={`/events/${eventId}/print?template=${encodeURIComponent(t.id)}`}
                        as={Link}
                        variant="secondary"
                      >
                        {ui.printsTab.openPrintPreview}
                      </AppBtn>
                    </div>
                  </div>
                ) : null}
              </AppCard>
            ))}
          </div>
        </>
      ) : null}

      {tableTemplates.length > 0 ? (
        <>
          <h3 style={sectionTitleStyle}>{ui.printsTab.categoryTableQr}</h3>
          <div className="flex flex-col gap-4">
            {tableTemplates.map((t) => (
              <AppCard key={t.id} pad="lg" style={{ borderRadius: 18 }}>
                <h4
                  style={{
                    margin: 0,
                    fontFamily: "var(--font-display)",
                    fontStyle: "italic",
                    fontWeight: 700,
                    fontSize: 22,
                    color: "var(--app-text)",
                  }}
                >
                  {templateCardTitle(t, ui.printsTab)}
                </h4>
                <p style={{ margin: "12px 0 0", fontSize: 14, color: "var(--app-muted)", lineHeight: 1.55 }}>
                  {ui.printsTab.tableTemplateHint}
                </p>
                <div style={{ marginTop: 16 }}>
                  {isTableQrTemplateId(t.id) ? (
                    <AppBtn href={`/events/${eventId}/print?template=${encodeURIComponent(t.id)}`} as={Link} variant="secondary">
                      {ui.printsTab.openPrintLayout}
                    </AppBtn>
                  ) : null}
                </div>
              </AppCard>
            ))}
          </div>
        </>
      ) : null}
    </section>
  );
}
