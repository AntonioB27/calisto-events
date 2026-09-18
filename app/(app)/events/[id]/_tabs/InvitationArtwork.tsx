import { getAppStrings } from "@/lib/app-ui";
import type { Locale } from "@/lib/i18n";
import { getPrintTemplateDef, type PrintTemplateDef } from "@/lib/event-print/template-catalog";
import { parseInvitationFieldVisibility } from "@/lib/event-print/invitation-field-visibility";
import type { WeddingInviteDetails, WeddingInviteDetailsStrings } from "@/lib/event-print/wedding-invite-details";
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
export function InvitationArtwork({ templateId, fields: sharedFields, eventDateIso, locale: uiLocale, photoUrl: couplePhotoPreviewUrl }: {
  templateId: string; fields: Record<string, string>; eventDateIso: string; locale: Locale; photoUrl: string | null;
}) {
  const ui = getAppStrings(uiLocale);
  const fieldVisibility = parseInvitationFieldVisibility(sharedFields);
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

  const template = getPrintTemplateDef(templateId);
  return template ? renderInvitePreview(template) : null;
}
