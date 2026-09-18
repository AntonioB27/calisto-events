"use client";

import type { CSSProperties } from "react";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { useAppUi } from "@/components/AppUiProvider";
import type { AppUiDict } from "@/lib/app-ui";
import { AppBtn } from "@/components/app-ui/AppBtn";
import { type EventKind } from "@/lib/event-kind";
import { defaultFieldValuesForTemplate } from "@/lib/event-print/print-field-defaults";
import {
  defaultVisibilityFieldValues,
  parseInvitationFieldVisibility,
  visibilityStorageKey,
  type InvitationVisibilityKey,
} from "@/lib/event-print/invitation-field-visibility";
import { InvitationEventDetailsModal } from "./InvitationEventDetailsModal";
import {
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
import { WeddingInviteGoldCirclesPhotoPrintSheet } from "../print/WeddingInviteGoldCirclesPhotoPrintSheet";
import { maybeCreateSupabaseBrowserClient } from "@/lib/supabase-browser";
import { InvitationDesignCarousel } from "./InvitationDesignCarousel";

import "../print/print-sheet.css";
import "./prints-form.css";
import "../prints/setup/prints-setup.css";

type InvitationsEditorProps = Readonly<{
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
  // Each template stores only its supported fields; combine them to retain
  // photo settings and details that aren't supported by the first design.
  const draft: Record<string, string> = {};
  for (const template of listPrintTemplatesForEventKind("wedding")) {
    if (template.category !== "invitation") continue;
    for (const [key, value] of Object.entries(drafts[template.id] ?? {})) {
      if (!(key in draft)) draft[key] = value;
    }
  }
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
    case "wedding-invite-gold-circles-photo": return tab.templateWeddingInviteGoldCirclesPhoto;
    default: return id;
  }
}


export function InvitationsEditor({
  eventId,
  eventKind,
  eventDisplayName,
  eventDateIso,
  uiLocale,
  printDraftByTemplateId,
}: InvitationsEditorProps) {
  const ui = useAppUi();
  const router = useRouter();

  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveHint, setSaveHint] = useState<string | null>(null);
  const [contentRevision, setContentRevision] = useState(0);
  const templates = useMemo(() => listPrintTemplatesForEventKind(eventKind), [eventKind]);
  const invitationTemplates = useMemo(() => templates.filter((t) => t.category === "invitation"), [templates]);

  const draftFingerprint = useMemo(() => JSON.stringify(printDraftByTemplateId), [printDraftByTemplateId]);

  const [sharedFields, setSharedFields] = useState<Record<string, string>>(() =>
    initSharedFields(eventDisplayName, eventDateIso, uiLocale, printDraftByTemplateId),
  );

  useEffect(() => {
    setSharedFields(initSharedFields(eventDisplayName, eventDateIso, uiLocale, printDraftByTemplateId));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [draftFingerprint, eventKind, eventDisplayName, eventDateIso, uiLocale]);

  async function saveAllDrafts() {
    if (invitationTemplates.length === 0) return false;
    setSaving(true);
    setSaveError(null);
    setSaveHint(null);
    try {
      const res = await fetch(`/api/events/${eventId}/invitation-drafts`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fieldValues: sharedFields }),
      });
      if (!res.ok) {
        throw new Error(ui.printsTab.draftSaveFail);
      }
      setSaveHint(ui.printsTab.draftSaved);
      return true;
    } catch (e) {
      setSaveError(e instanceof Error ? e.message : ui.printsTab.draftSaveFail);
      return false;
    } finally {
      setSaving(false);
    }
  }

  function setField(key: string, value: string) {
    setSaveHint(null);
    setSharedFields((prev) => ({ ...prev, [key]: value }));
    setContentRevision((prev) => prev + 1);
  }

  function setCropFields(x: string, y: string, scale: string) {
    setSaveHint(null);
    setSharedFields((prev) => ({
      ...prev,
      couple_photo_crop_x: x,
      couple_photo_crop_y: y,
      couple_photo_crop_scale: scale,
    }));
  }

  const fieldVisibility = useMemo(
    () => parseInvitationFieldVisibility(sharedFields),
    [sharedFields],
  );

  function setVisibility(key: InvitationVisibilityKey, on: boolean) {
    setField(visibilityStorageKey(key), on ? "1" : "0");
  }

  const supabase = useMemo(() => maybeCreateSupabaseBrowserClient(), []);
  const [couplePhotoPreviewUrl, setCouplePhotoPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    const path = sharedFields.couple_photo_path;
    if (!path || !supabase) {
      setCouplePhotoPreviewUrl(null);
      return;
    }
    void supabase.storage
      .from("event-media")
      .createSignedUrl(path, 3600)
      .then(({ data }: { data: { signedUrl: string } | null; error: unknown }) => {
        if (data?.signedUrl) setCouplePhotoPreviewUrl(data.signedUrl);
      });
  }, [sharedFields.couple_photo_path, supabase]);

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
    if (t.id === "wedding-invite-gold-circles-photo") {
      return (
        <WeddingInviteGoldCirclesPhotoPrintSheet
          paper="a4"
          partnerA={sharedFields.partner_a ?? ""}
          partnerB={sharedFields.partner_b ?? ""}
          venue={sharedFields.venue ?? ""}
          extraLine={sharedFields.extra_line ?? ""}
          eventDateIso={eventDateIso}
          locale={uiLocale}
          photoUrl={couplePhotoPreviewUrl}
          cropX={parseFloat(sharedFields.couple_photo_crop_x ?? "") || 0}
          cropY={parseFloat(sharedFields.couple_photo_crop_y ?? "") || 0}
          cropScale={parseFloat(sharedFields.couple_photo_crop_scale ?? "") || 1}
          strings={{
            youreInvited: ui.print.inviteGoldCirclesYoureInvited,
            and: ui.print.inviteAnd,
            receptionToFollow: ui.print.inviteReceptionFollow,
          }}
          visibility={fieldVisibility}
        />
      );
    }
    return null;
  }

  return (
    <section className="prints-tab">
      {invitationTemplates.length > 0 ? (
        <>
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
          {/* eslint-disable-next-line @next/next/no-page-custom-font */}
          <link
            href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,500;0,600;0,700;1,500;1,600&family=Dancing+Script:wght@500;600;700&family=Montserrat:wght@200;300;400;500&display=swap"
            rel="stylesheet"
          />
        </>
      ) : null}

      {invitationTemplates.length > 0 ? (
        <>

                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", margin: "28px 0 12px", gap: 12 }}>
                  <h3 style={{ ...sectionTitleStyle, margin: 0 }}>{ui.printsTab.categoryInvitation}</h3>
                  <AppBtn type="button" variant="outline" size="sm" onClick={() => setDetailsOpen(true)}>
                    {ui.printsTab.eventDetails}
                  </AppBtn>
                </div>

                {saveError ? <p role="alert">{saveError}</p> : null}
                <InvitationDesignCarousel
                  saving={saving}
                  onOpenPrint={async (templateId) => {
                    if (await saveAllDrafts()) router.push(`/events/${eventId}/print?template=${encodeURIComponent(templateId)}`);
                  }}
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
                  showPhotoUpload={invitationTemplates.some((t) => t.id === "wedding-invite-gold-circles-photo")}
                  eventId={eventId}
                  couplePhotoPath={sharedFields.couple_photo_path ?? ""}
                  couplePhotoCropX={sharedFields.couple_photo_crop_x ?? ""}
                  couplePhotoCropY={sharedFields.couple_photo_crop_y ?? ""}
                  couplePhotoCropScale={sharedFields.couple_photo_crop_scale ?? ""}
                  onPathChange={(path) => setField("couple_photo_path", path)}
                  onCropChange={setCropFields}
                  onPreviewUrlChange={setCouplePhotoPreviewUrl}
                />

        </>
      ) : null}

    </section>
  );
}
