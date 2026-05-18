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
  defaultVisibilityFieldValues,
  parseInvitationFieldVisibility,
  visibilityStorageKey,
  type InvitationVisibilityKey,
} from "@/lib/event-print/invitation-field-visibility";
import { InvitationEventDetailsModal } from "./InvitationEventDetailsModal";
import {
  isTableQrTemplateId,
  listPrintTemplatesForEventKind,
  type PrintTemplateDef,
} from "@/lib/event-print/template-catalog";
import type { WeddingInviteDetails, WeddingInviteDetailsStrings } from "@/lib/event-print/wedding-invite-details";
import type { Locale } from "@/lib/i18n";
import { WeddingInviteBlueFloraPrintSheet } from "../print/WeddingInviteBlueFloraPrintSheet";
import { WeddingInviteGeometricPrintSheet } from "../print/WeddingInviteGeometricPrintSheet";
import { WeddingInviteWatercolorCoastPrintSheet } from "../print/WeddingInviteWatercolorCoastPrintSheet";
import { WeddingInviteNavyBotanicalPrintSheet } from "../print/WeddingInviteNavyBotanicalPrintSheet";
import { WeddingInviteGrayscaleGlitterPrintSheet } from "../print/WeddingInviteGrayscaleGlitterPrintSheet";
import { WeddingInviteTerracottaPillPrintSheet } from "../print/WeddingInviteTerracottaPillPrintSheet";
import { WeddingInviteGoldArchFloralPrintSheet } from "../print/WeddingInviteGoldArchFloralPrintSheet";
import { WeddingInviteCherryBlossomPrintSheet } from "../print/WeddingInviteCherryBlossomPrintSheet";
import { WeddingInviteOliveGoldPrintSheet } from "../print/WeddingInviteOliveGoldPrintSheet";
import { InvitationDesignCarousel } from "./InvitationDesignCarousel";

import "../print/print-sheet.css";
import "./prints-form.css";
import "../prints/setup/prints-setup.css";

type PrintsTabProps = Readonly<{
  eventId: string;
  eventKind: EventKind;
  printsEventKindSetAt: string | null;
  eventDisplayName: string;
  eventDateIso: string;
  uiLocale: Locale;
  printDraftByTemplateId: Readonly<Record<string, Readonly<Record<string, string>>>>;
}>;

function initSharedFields(
  eventDisplayName: string,
  eventDateIso: string,
  locale: Locale,
  drafts: Readonly<Record<string, Readonly<Record<string, string>>>>,
): Record<string, string> {
  const defaults = defaultFieldValuesForTemplate(
    "wedding-invite-blue-floral",
    eventDisplayName,
    eventDateIso,
    locale,
  );
  const draft =
    drafts["wedding-invite-olive-gold-frame"] ??
    drafts["wedding-invite-cherry-blossom"] ??
    drafts["wedding-invite-gold-arch-floral"] ??
    drafts["wedding-invite-terra-pill"] ??
    drafts["wedding-invite-grayscale-glitter"] ??
    drafts["wedding-invite-navy-botanical"] ??
    drafts["wedding-invite-blue-floral"] ??
    drafts["wedding-invite-geometric"] ??
    {};
  return { ...defaults, ...defaultVisibilityFieldValues(), venue_line_2: "", ...draft };
}


function templateCardTitle(id: string, tab: AppUiDict["printsTab"]): string {
  switch (id) {
    case "table-minimal": return tab.templateTableMinimal;
    case "table-bold": return tab.templateTableBold;
    case "wedding-invite-blue-floral": return tab.templateWeddingInviteBlueFloral;
    case "wedding-invite-geometric": return tab.templateWeddingInviteGeometric;
    case "wedding-invite-watercolor-coast": return tab.templateWeddingInviteWatercolorCoast;
    case "wedding-invite-navy-botanical": return tab.templateWeddingInviteNavyBotanical;
    case "wedding-invite-grayscale-glitter": return tab.templateWeddingInviteGrayscaleGlitter;
    case "wedding-invite-terra-pill": return tab.templateWeddingInviteTerraPill;
    case "wedding-invite-gold-arch-floral": return tab.templateWeddingInviteGoldArchFloral;
    case "wedding-invite-cherry-blossom": return tab.templateWeddingInviteCherryBlossom;
    case "wedding-invite-olive-gold-frame": return tab.templateWeddingInviteOliveGoldFrame;
    default: return id;
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
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveHint, setSaveHint] = useState<string | null>(null);
  const [contentRevision, setContentRevision] = useState(0);
  const templates = useMemo(() => listPrintTemplatesForEventKind(eventKind), [eventKind]);
  const invitationTemplates = useMemo(() => templates.filter((t) => t.category === "invitation"), [templates]);
  const tableTemplates = useMemo(() => templates.filter((t) => t.category === "table_qr"), [templates]);

  const draftFingerprint = useMemo(() => JSON.stringify(printDraftByTemplateId), [printDraftByTemplateId]);

  const [sharedFields, setSharedFields] = useState<Record<string, string>>(() =>
    initSharedFields(eventDisplayName, eventDateIso, uiLocale, printDraftByTemplateId),
  );

  useEffect(() => {
    setSharedFields(initSharedFields(eventDisplayName, eventDateIso, uiLocale, printDraftByTemplateId));
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

  async function saveAllDrafts() {
    if (invitationTemplates.length === 0) return;
    setSaving(true);
    setSaveError(null);
    setSaveHint(null);
    try {
      await Promise.all(
        invitationTemplates.map((t) =>
          fetch(`/api/events/${eventId}/print-template-instance`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ templateId: t.id, fieldValues: sharedFields }),
          }).then(async (res) => {
            if (!res.ok) {
              const p = (await res.json().catch(() => null)) as { error?: string } | null;
              throw new Error(typeof p?.error === "string" ? p.error : ui.printsTab.draftSaveFail);
            }
          }),
        ),
      );
      setSaveHint(ui.printsTab.draftSaved);
      router.refresh();
    } catch (e) {
      setSaveError(e instanceof Error ? e.message : ui.printsTab.draftSaveFail);
    } finally {
      setSaving(false);
    }
  }

  function setField(key: string, value: string) {
    setSaveHint(null);
    setSharedFields((prev) => ({ ...prev, [key]: value }));
    setContentRevision((prev) => prev + 1);
  }

  const fieldVisibility = useMemo(
    () => parseInvitationFieldVisibility(sharedFields),
    [sharedFields],
  );

  function setVisibility(key: InvitationVisibilityKey, on: boolean) {
    setField(visibilityStorageKey(key), on ? "1" : "0");
  }

  const [collapsedSections, setCollapsedSections] = useState<ReadonlySet<string>>(new Set<string>());
  const [detailsOpen, setDetailsOpen] = useState(false);

  function toggleSection(id: string) {
    setCollapsedSections((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  if (!printsEventKindSetAt) {
    return (
      <section className="prints-tab prints-tab--narrow">
        <div style={{ marginBottom: 20 }}>
          <GoldBar />
          <p style={{ marginTop: 12, fontSize: 11, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--app-muted)" }}>
            {ui.printsTab.kindEyebrow}
          </p>
          <h2 style={{ marginTop: 8, fontFamily: "var(--font-display)", fontStyle: "italic", fontWeight: 700, fontSize: 32, color: "var(--app-text)", lineHeight: 1.15 }}>
            {ui.printsTab.kindTitle}
          </h2>
          <p style={{ marginTop: 10, fontSize: 14, color: "var(--app-muted)", lineHeight: 1.55 }}>{ui.printsTab.kindHint}</p>
        </div>

        {error ? (
          <p style={{ marginBottom: 14, fontSize: 13, color: "var(--app-danger)", background: "color-mix(in srgb, var(--app-danger) 10%, transparent)", padding: "10px 14px", borderRadius: 10, border: "1.5px solid color-mix(in srgb, var(--app-danger) 35%, transparent)" }}>
            {error}
          </p>
        ) : null}

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {EVENT_KINDS.map((k) => (
            <AppBtn key={k} type="button" variant="gold" className="w-full !justify-center" disabled={busy} loading={busy} onClick={() => void confirmKind(k)}>
              {k === "generic" ? ui.printsTab.kindOptionGeneric : ui.printsTab.kindOptionWedding}
            </AppBtn>
          ))}
        </div>
      </section>
    );
  }

  const sectionTitleStyle: CSSProperties = {
    margin: "28px 0 12px",
    fontSize: 11,
    fontWeight: 700,
    letterSpacing: "0.14em",
    textTransform: "uppercase",
    color: "var(--app-muted)",
  };

  const blueFlorealStrings = {
    withJoyYouAre: ui.print.inviteWithJoyYouAre,
    invitedToWeddingOf: ui.print.inviteInvitedToWeddingOf,
    and: ui.print.inviteAnd,
  };

  const navyBotanicalStrings = {
    togetherWithOurFamilies: ui.print.inviteTogetherWithOurFamilies,
    honorUniteMarriage: ui.print.inviteHonorUniteMarriage,
    and: ui.print.inviteAnd,
  };

  const terraPillStrings = {
    pleaseJoinUsFor: ui.print.inviteTerraPleaseJoinUsFor,
    theWeddingOf: ui.print.inviteTerraTheWeddingOf,
    and: ui.print.inviteAnd,
  };

  const goldArchStrings = {
    headline: ui.print.inviteGoldArchHeadline,
    and: ui.print.inviteAnd,
  };

  const cherryBlossomStrings = {
    preambleStart: ui.print.inviteCherryPreambleStart,
    preambleScript: ui.print.inviteCherryPreambleScript,
    preambleMid: ui.print.inviteCherryPreambleMid,
    preambleEnd: ui.print.inviteCherryPreambleEnd,
    and: ui.print.inviteAnd,
  };

  const oliveGoldStrings = {
    withLove: ui.print.inviteOliveWithLove,
    cordiallyLine1: ui.print.inviteOliveCordiallyLine1,
    cordiallyLine2: ui.print.inviteOliveCordiallyLine2,
  };

  const watercolorCoastStrings = {
    pleaseJoinUs: ui.print.inviteWatercolorPleaseJoinUs,
    forOurCeremony: ui.print.inviteWatercolorForCeremony,
    and: ui.print.inviteAnd,
    receptionToFollow: ui.print.inviteReceptionFollow,
  };

  const glitterStrings = {
    togetherWithFamilies: ui.print.inviteGlitterTogetherFamilies,
    cordiallyInviteCaps: ui.print.inviteGlitterCordiallyInviteCaps,
    weddingWord: ui.print.inviteGlitterWeddingWord,
    on: ui.print.inviteGlitterOn,
    and: ui.print.inviteAnd,
  };

  const previewDetails: WeddingInviteDetails = {
    connectorSymbol: sharedFields.connector_symbol ?? "ampersand",
    gatheringType: sharedFields.gathering_type ?? "",
    gatheringAddress: sharedFields.gathering_address ?? "",
    gatheringTime: sharedFields.gathering_time ?? "",
    partnerAGatheringAddress: sharedFields.partner_a_gathering_address ?? "",
    partnerAGatheringTime: sharedFields.partner_a_gathering_time ?? "",
    partnerBGatheringAddress: sharedFields.partner_b_gathering_address ?? "",
    partnerBGatheringTime: sharedFields.partner_b_gathering_time ?? "",
    churchAddress: sharedFields.church_address ?? "",
    churchTime: sharedFields.church_time ?? "",
    dinnerAddress: sharedFields.dinner_address ?? "",
    dinnerTime: sharedFields.dinner_time ?? "",
    quoteText: sharedFields.quote_text ?? "",
    quoteAuthor: sharedFields.quote_author ?? "",
  };

  const previewDetailStrings: WeddingInviteDetailsStrings = {
    gatheringTitle: ui.print.inviteDetailsGathering,
    churchTitle: ui.print.inviteDetailsChurch,
    dinnerTitle: ui.print.inviteDetailsDinner,
  };

  function renderInvitePreview(t: PrintTemplateDef) {
    const commonProps = {
      paper: "a4" as const,
      partnerA: sharedFields.partner_a ?? "",
      partnerB: sharedFields.partner_b ?? "",
      venue: sharedFields.venue ?? "",
      venueLine2: sharedFields.venue_line_2 ?? "",
      extraLine: sharedFields.extra_line ?? "",
      eventDateIso,
      locale: uiLocale,
      details: previewDetails,
      detailStrings: previewDetailStrings,
      visibility: fieldVisibility,
    };
    if (t.id === "wedding-invite-olive-gold-frame") {
      return (
        <WeddingInviteOliveGoldPrintSheet {...commonProps} strings={oliveGoldStrings} />
      );
    }
    if (t.id === "wedding-invite-cherry-blossom") {
      return (
        <WeddingInviteCherryBlossomPrintSheet {...commonProps} strings={cherryBlossomStrings} />
      );
    }
    if (t.id === "wedding-invite-gold-arch-floral") {
      return (
        <WeddingInviteGoldArchFloralPrintSheet {...commonProps} strings={goldArchStrings} />
      );
    }
    if (t.id === "wedding-invite-terra-pill") {
      return (
        <WeddingInviteTerracottaPillPrintSheet {...commonProps} strings={terraPillStrings} />
      );
    }
    if (t.id === "wedding-invite-grayscale-glitter") {
      return (
        <WeddingInviteGrayscaleGlitterPrintSheet
          paper={commonProps.paper}
          partnerA={commonProps.partnerA}
          partnerB={commonProps.partnerB}
          connectorSymbol={sharedFields.connector_symbol ?? "ampersand"}
          extraLine={commonProps.extraLine}
          eventDateIso={commonProps.eventDateIso}
          locale={commonProps.locale}
          strings={glitterStrings}
          visibility={fieldVisibility}
        />
      );
    }
    if (t.id === "wedding-invite-navy-botanical") {
      return (
        <WeddingInviteNavyBotanicalPrintSheet {...commonProps} strings={navyBotanicalStrings} />
      );
    }
    if (t.id === "wedding-invite-watercolor-coast") {
      return (
        <WeddingInviteWatercolorCoastPrintSheet {...commonProps} strings={watercolorCoastStrings} />
      );
    }
    if (t.id === "wedding-invite-geometric") {
      return (
        <WeddingInviteGeometricPrintSheet
          {...commonProps}
          strings={{
            ...blueFlorealStrings,
            receptionToFollow: ui.print.inviteReceptionFollow,
          }}
        />
      );
    }
    if (t.id === "wedding-invite-blue-floral") {
      return (
        <WeddingInviteBlueFloraPrintSheet {...commonProps} strings={blueFlorealStrings} />
      );
    }
    return null;
  }

  return (
    <section className="prints-tab">
      {process.env.NODE_ENV === "development" ? (
        <Link
          href={`/events/${eventId}/prints/setup`}
          style={{
            position: "fixed",
            bottom: 20,
            right: 20,
            zIndex: 999,
            background: "#1a1025",
            border: "1px solid #5b2d8e",
            color: "#c5922a",
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            padding: "7px 14px",
            borderRadius: 8,
            textDecoration: "none",
            boxShadow: "0 4px 16px rgba(91,45,142,0.4)",
          }}
        >
          DEV · Wizard
        </Link>
      ) : null}
      {invitationTemplates.length > 0 ? (
        <>
          {/* eslint-disable-next-line @next/next/no-page-custom-font */}
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          {/* eslint-disable-next-line @next/next/no-page-custom-font */}
          <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
          {/* eslint-disable-next-line @next/next/no-page-custom-font */}
          <link
            href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,500;0,600;0,700;1,500;1,600&family=Dancing+Script:wght@500;600;700&family=Montserrat:wght@200;300;400;500&display=swap"
            rel="stylesheet"
          />
        </>
      ) : null}

      <div style={{ marginBottom: 22 }}>
        <GoldBar />
        <h2 style={{ marginTop: 12, fontFamily: "var(--font-display)", fontStyle: "italic", fontWeight: 700, fontSize: 32, color: "var(--app-text)", lineHeight: 1.15 }}>
          {ui.printsTab.title}
        </h2>
        <p style={{ marginTop: 8, fontSize: 14, color: "var(--app-muted)", lineHeight: 1.55 }}>{ui.printsTab.subtitle}</p>
      </div>

      {invitationTemplates.length > 0 ? (
        <>
          {(() => {
            const hasInvitationDraft = invitationTemplates.some((t) => t.id in printDraftByTemplateId);

            if (!hasInvitationDraft) {
              return (
                <div className="psw-empty">
                  <div className="psw-empty-mascot-wrap">
                    <div className="psw-empty-halo" />
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src="/brand/mascot.png" alt="" className="psw-empty-mascot" />
                  </div>
                  <div className="psw-empty-bar" />
                  <p className="psw-empty-eyebrow">{ui.printsSetup.emptyEyebrow}</p>
                  <h3 className="psw-empty-heading">{ui.printsSetup.emptyHeading}</h3>
                  <p className="psw-empty-subhead">{ui.printsSetup.emptySubhead}</p>
                  <div className="psw-empty-cta">
                    <Link href={`/events/${eventId}/prints/setup`} className="psw-btn psw-btn--gold">
                      {ui.printsSetup.emptyCta}
                    </Link>
                  </div>
                  <p className="psw-empty-meta">{ui.printsSetup.emptyMeta}</p>
                </div>
              );
            }

            return (
              <>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", margin: "28px 0 12px", gap: 12 }}>
                  <h3 style={{ ...sectionTitleStyle, margin: 0 }}>{ui.printsTab.categoryInvitation}</h3>
                  <AppBtn type="button" variant="outline" size="sm" onClick={() => setDetailsOpen(true)}>
                    {ui.printsTab.eventDetails}
                  </AppBtn>
                </div>

                <InvitationDesignCarousel
                  eventId={eventId}
                  templates={invitationTemplates}
                  renderPreview={renderInvitePreview}
                  getTitle={(id) => templateCardTitle(id, ui.printsTab)}
                  openPrintPreviewLabel={ui.printsTab.openPrintPreview}
                  prevLabel={ui.printsTab.inviteCarouselPrev}
                  nextLabel={ui.printsTab.inviteCarouselNext}
                  swipeHint={ui.printsTab.inviteCarouselSwipeHint}
                  counterTemplate={ui.printsTab.inviteCarouselCounter}
                  inviteFontScaleLabel={ui.printsTab.inviteFontScaleLabel}
                  inviteFontScaleHint={ui.printsTab.inviteFontScaleHint}
                  inviteAutoFitToggle={ui.printsTab.inviteAutoFitToggle}
                  inviteAutoFitNotice={ui.printsTab.inviteAutoFitNotice}
                  inviteAutoFitUndo={ui.printsTab.inviteAutoFitUndo}
                  contentRevision={contentRevision}
                  onAutoHide={(key) => setVisibility(key, false)}
                  onAutoRestore={(keys) => keys.forEach((k) => setVisibility(k, true))}
                />


                <InvitationEventDetailsModal
                  open={detailsOpen}
                  onClose={() => setDetailsOpen(false)}
                  sharedFields={sharedFields}
                  setField={setField}
                  setVisibility={setVisibility}
                  collapsedSections={collapsedSections}
                  toggleSection={toggleSection}
                  saving={saving}
                  saveError={saveError}
                  saveHint={saveHint}
                  onSave={() => void saveAllDrafts()}
                />
              </>
            );
          })()}
        </>
      ) : null}

      {tableTemplates.length > 0 ? (
        <>
          <h3 style={{ ...sectionTitleStyle, marginTop: invitationTemplates.length > 0 ? 40 : 28 }}>{ui.printsTab.categoryTableQr}</h3>
          <div className="flex flex-col gap-4">
            {tableTemplates.map((t) => (
              <AppCard key={t.id} pad="lg" style={{ borderRadius: 18 }}>
                <h4 style={{ margin: 0, fontFamily: "var(--font-display)", fontStyle: "italic", fontWeight: 700, fontSize: 22, color: "var(--app-text)" }}>
                  {templateCardTitle(t.id, ui.printsTab)}
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
