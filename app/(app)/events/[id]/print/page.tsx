import Link from "next/link";

import { EventPrintToolbar } from "./EventPrintToolbar";
import { QrThemedPrintSheet } from "./QrThemedPrintSheet";
import { PrintScreen } from "./PrintScreen";
import { WeddingInviteBlueFloraPrintSheet } from "./WeddingInviteBlueFloraPrintSheet";
import { WeddingInviteCherryBlossomPrintSheet } from "./WeddingInviteCherryBlossomPrintSheet";
import { WeddingInviteGeometricPrintSheet } from "./WeddingInviteGeometricPrintSheet";
import { WeddingInviteWatercolorCoastPrintSheet } from "./WeddingInviteWatercolorCoastPrintSheet";
import { WeddingInviteGoldArchFloralPrintSheet } from "./WeddingInviteGoldArchFloralPrintSheet";
import { WeddingInviteGrayscaleGlitterPrintSheet } from "./WeddingInviteGrayscaleGlitterPrintSheet";
import { WeddingInviteNavyBotanicalPrintSheet } from "./WeddingInviteNavyBotanicalPrintSheet";
import { WeddingInviteOliveGoldPrintSheet } from "./WeddingInviteOliveGoldPrintSheet";
import { WeddingInviteTerracottaPillPrintSheet } from "./WeddingInviteTerracottaPillPrintSheet";
import { WeddingInviteGoldCirclesPhotoPrintSheet } from "./WeddingInviteGoldCirclesPhotoPrintSheet";
import { parseInvitationFieldVisibility } from "@/lib/event-print/invitation-field-visibility";
import type { WeddingInviteDetails, WeddingInviteDetailsStrings } from "@/lib/event-print/wedding-invite-details";
import { getAppStrings } from "@/lib/app-ui";
import { getEventAdminAccess } from "@/lib/event-admin-access";
import { splitEventTitleStored } from "@/lib/event-title";
import { normalizeEventKind } from "@/lib/event-kind";
import { mergeInvitationDraftWithDefaults } from "@/lib/event-print/merge-invitation-print-fields";
import {
  DEFAULT_POSTER_TEMPLATE,
  parsePosterContentLocale,
  parsePrintPaper,
  parsePrintRouteTemplate,
  POSTER_LANG_QUERY,
} from "@/lib/event-print/print-options";
import { getPrintTemplateDef, isInvitationPrintTemplateId, isTableQrTemplateId, isQrThemedPrintTemplateId, type QrThemedTemplateId } from "@/lib/event-print/template-catalog";
import { getWebJoinUrl } from "@/lib/join-link";
import { getPublicOrigin } from "@/lib/public-origin";
import { createSupabaseAuthServerClient } from "@/lib/supabase-auth-server";
import { getUiLocale } from "@/lib/ui-locale";
import { LOCALES } from "@/lib/i18n";

import "./print-sheet.css";

type Props = Readonly<{
  params: Promise<{ id: string }>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}>;

function pickQueryValue(value: string | string[] | undefined): string | undefined {
  if (Array.isArray(value)) {
    return value[0];
  }
  return value;
}

export default async function EventPrintPage({ params, searchParams }: Props) {
  const { id } = await params;
  const resolvedSearchParams = (await searchParams) ?? {};
  const uiLocale = await getUiLocale();
  const uiDict = getAppStrings(uiLocale);
  const posterLocale = parsePosterContentLocale(pickQueryValue(resolvedSearchParams[POSTER_LANG_QUERY]), uiLocale);
  const posterDict = getAppStrings(posterLocale);
  const deniedPrint = uiDict.print;
  const posterPrint = posterDict.print;

  const supabase = await createSupabaseAuthServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: event } = await supabase
    .from("events")
    .select("id, title, access_code, organizer_id, event_kind, event_date")
    .eq("id", id)
    .maybeSingle();

  const access = event
    ? await getEventAdminAccess(supabase, {
        eventId: id,
        userId: user?.id,
        organizerId: String(event.organizer_id),
      })
    : { canAccess: false, isPrimaryOrganizer: false };

  if (!event || !access.canAccess) {
    return (
      <main className="join-shell min-h-screen px-4 py-10">
        <div style={{ maxWidth: 768, margin: "0 auto" }}>
          <h1 style={{ fontSize: "1.5rem", fontWeight: 800, color: "var(--app-text)" }}>{deniedPrint.deniedTitle}</h1>
          <p style={{ marginTop: 8, fontSize: "0.875rem", color: "var(--app-muted)" }}>{deniedPrint.deniedDeny}</p>
          <p style={{ marginTop: 16 }}>
            <Link href="/dashboard" style={{ color: "var(--app-gold)", fontWeight: 600, fontSize: 14 }}>
              {deniedPrint.backDashboard}
            </Link>
          </p>
        </div>
      </main>
    );
  }

  const routeTemplate = parsePrintRouteTemplate(pickQueryValue(resolvedSearchParams.template));
  const paper = parsePrintPaper(pickQueryValue(resolvedSearchParams.paper));

  const storedEventKind = normalizeEventKind(
    typeof (event as { event_kind?: unknown }).event_kind === "string"
      ? (event as { event_kind: string }).event_kind
      : undefined,
  );

  const templateDef = getPrintTemplateDef(routeTemplate);
  const isInvitationPrint = isInvitationPrintTemplateId(routeTemplate);
  const isQrThemed = isQrThemedPrintTemplateId(routeTemplate);
  const invitationAllowed = Boolean(isInvitationPrint && templateDef?.eventKinds.includes(storedEventKind));

  if (isInvitationPrint && !invitationAllowed) {
    return (
      <main className="join-shell min-h-screen px-4 py-10" style={{ color: "var(--app-text)" }}>
        <div style={{ maxWidth: 560, margin: "0 auto" }}>
          <h1 style={{ fontSize: "1.35rem", fontWeight: 800 }}>{deniedPrint.invitationUnavailableTitle}</h1>
          <p style={{ marginTop: 10, fontSize: "0.95rem", color: "var(--app-muted)", lineHeight: 1.55 }}>
            {deniedPrint.invitationUnavailable}
          </p>
          <p style={{ marginTop: 20 }}>
            <Link href={`/events/${id}?tab=prints`} style={{ color: "var(--app-gold)", fontWeight: 600, fontSize: 14 }}>
              {deniedPrint.backPrints}
            </Link>
          </p>
        </div>
      </main>
    );
  }

  // ── QR-themed templates: render full PrintScreen UI (early return) ──
  if (isQrThemed) {
    const publicOrigin = await getPublicOrigin();
    const joinUrl = getWebJoinUrl(publicOrigin, event.access_code);
    const { name: eventDisplayName } = splitEventTitleStored(String(event.title ?? ""));
    return (
      <div className="join-shell">
        <PrintScreen
          eventId={id}
          eventTitle={eventDisplayName}
          accessCode={event.access_code}
          joinUrl={joinUrl}
          initialTemplate={routeTemplate as QrThemedTemplateId}
          initialPaper={paper}
          posterLang={posterLocale}
          backHref={`/events/${id}?tab=prints`}
          chromePrint={uiDict.print}
          posterPrint={posterDict.print}
        />
      </div>
    );
  }

  let qrThemedJoinUrl: string | null = null;

  let mergedInvitation: Record<string, string> | null = null;
  if (isInvitationPrint && invitationAllowed) {
    const { data: draftRow } = await supabase
      .from("event_print_template_instances")
      .select("field_values")
      .eq("event_id", id)
      .eq("template_id", routeTemplate)
      .maybeSingle();

    const rawFv = (draftRow as { field_values?: unknown } | null)?.field_values;
    const stored =
      rawFv && typeof rawFv === "object" && !Array.isArray(rawFv)
        ? Object.fromEntries(
            Object.entries(rawFv as Record<string, unknown>)
              .filter(([, v]) => typeof v === "string")
              .map(([k, v]) => [k, v as string]),
          )
        : undefined;

    const { name: eventDisplayName } = splitEventTitleStored(String(event.title ?? ""));
    const eventDateIso = typeof event.event_date === "string" ? event.event_date : "";
    mergedInvitation = mergeInvitationDraftWithDefaults(routeTemplate, eventDisplayName, eventDateIso, posterLocale, stored);
  }

  const inviteVisibility = mergedInvitation
    ? parseInvitationFieldVisibility(mergedInvitation)
    : null;

  const inviteDetails: WeddingInviteDetails | null =
    isInvitationPrint && mergedInvitation
      ? {
          connectorSymbol: mergedInvitation.connector_symbol ?? "ampersand",
          gatheringType: mergedInvitation.gathering_type ?? "",
          gatheringAddress: mergedInvitation.gathering_address ?? "",
          gatheringTime: mergedInvitation.gathering_time ?? "",
          partnerAGatheringAddress: mergedInvitation.partner_a_gathering_address ?? "",
          partnerAGatheringTime: mergedInvitation.partner_a_gathering_time ?? "",
          partnerBGatheringAddress: mergedInvitation.partner_b_gathering_address ?? "",
          partnerBGatheringTime: mergedInvitation.partner_b_gathering_time ?? "",
          churchAddress: mergedInvitation.church_address ?? "",
          churchTime: mergedInvitation.church_time ?? "",
          dinnerAddress: mergedInvitation.dinner_address ?? "",
          dinnerTime: mergedInvitation.dinner_time ?? "",
          quoteText: mergedInvitation.quote_text ?? "",
          quoteAuthor: mergedInvitation.quote_author ?? "",
        }
      : null;

  const detailStrings: WeddingInviteDetailsStrings = {
    gatheringTitle: posterPrint.inviteDetailsGathering,
    churchTitle: posterPrint.inviteDetailsChurch,
    dinnerTitle: posterPrint.inviteDetailsDinner,
  };

  const eventDateIso = typeof event.event_date === "string" ? event.event_date : "";

  let goldCirclesPhotoUrl: string | null = null;
  if (isInvitationPrint && mergedInvitation && routeTemplate === "wedding-invite-gold-circles-photo") {
    const photoPath = mergedInvitation.couple_photo_path ?? "";
    if (photoPath) {
      const { data: urlData } = await supabase.storage
        .from("event-media")
        .createSignedUrl(photoPath, 3600);
      goldCirclesPhotoUrl = urlData?.signedUrl ?? null;
    }
  }

  return (
    <main
      className="join-shell min-h-screen print:bg-white"
      style={{ paddingBottom: 48, color: "var(--app-text)" }}
    >
      <div style={{ width: "100%" }} className="print:max-w-none">
        <EventPrintToolbar
          eventId={id}
          activeTemplate={routeTemplate}
          eventKind={storedEventKind}
          paper={paper}
          posterLang={posterLocale}
          chromePrint={uiDict.print}
          localeOptionLabels={uiDict.languagePicker.locales}
          backHref={(isInvitationPrint || isQrThemed) ? `/events/${id}?tab=prints` : `/events/${id}?tab=share`}
          backLabel={(isInvitationPrint || isQrThemed) ? uiDict.print.backPrints : uiDict.print.backShare}
          sheetHelperLine={isInvitationPrint ? uiDict.print.sheetHelperInvitation : uiDict.print.sheetHelper}
        />

        {/* Paper size controls (classic QR + invitation templates only; QR-themed uses PrintScreen) */}
        {!isInvitationPrint && (
          <div className="print-secondary-controls print:hidden">
            <div className="print-secondary-controls__group">
              <span className="print-secondary-controls__label">Paper</span>
              {(["a4", "letter"] as const).map((sz) => (
                <Link
                  key={sz}
                  href={`/events/${id}/print?template=${routeTemplate}&paper=${sz}&${POSTER_LANG_QUERY}=${posterLocale}`}
                  scroll={false}
                  prefetch={false}
                  className={`print-secondary-controls__pill${paper === sz ? " print-secondary-controls__pill--active" : ""}`}
                >
                  {sz === "a4" ? "A4" : "Letter"}
                </Link>
              ))}
            </div>
            <div className="print-secondary-controls__group">
              <span className="print-secondary-controls__label">{uiDict.print.posterLanguageLabel}</span>
              {LOCALES.map((loc) => (
                <Link
                  key={loc}
                  href={`/events/${id}/print?template=${routeTemplate}&paper=${paper}&${POSTER_LANG_QUERY}=${loc}`}
                  scroll={false}
                  prefetch={false}
                  className={`print-secondary-controls__pill${posterLocale === loc ? " print-secondary-controls__pill--active" : ""}`}
                >
                  {loc === "en" ? uiDict.languagePicker.locales.en : loc === "hr" ? uiDict.languagePicker.locales.hr : uiDict.languagePicker.locales.de}
                </Link>
              ))}
            </div>
          </div>
        )}

        <div lang={posterLocale} className={isInvitationPrint ? "print-invite-page-root" : undefined}>
          {isInvitationPrint && mergedInvitation && inviteDetails && routeTemplate === "wedding-invite-olive-gold-frame" ? (
            <WeddingInviteOliveGoldPrintSheet
              paper={paper}
              partnerA={mergedInvitation.partner_a ?? ""}
              partnerB={mergedInvitation.partner_b ?? ""}
              extraLine={mergedInvitation.extra_line ?? ""}
              eventDateIso={eventDateIso}
              locale={posterLocale}
              strings={{
                withLove: posterPrint.inviteOliveWithLove,
                cordiallyLine1: posterPrint.inviteOliveCordiallyLine1,
                cordiallyLine2: posterPrint.inviteOliveCordiallyLine2,
              }}
              details={inviteDetails}
              detailStrings={detailStrings}
              visibility={inviteVisibility!}
            />
          ) : isInvitationPrint && mergedInvitation && inviteDetails && routeTemplate === "wedding-invite-cherry-blossom" ? (
            <WeddingInviteCherryBlossomPrintSheet
              paper={paper}
              partnerA={mergedInvitation.partner_a ?? ""}
              partnerB={mergedInvitation.partner_b ?? ""}
              extraLine={mergedInvitation.extra_line ?? ""}
              eventDateIso={eventDateIso}
              locale={posterLocale}
              strings={{
                preambleStart: posterPrint.inviteCherryPreambleStart,
                preambleScript: posterPrint.inviteCherryPreambleScript,
                preambleMid: posterPrint.inviteCherryPreambleMid,
                preambleEnd: posterPrint.inviteCherryPreambleEnd,
                and: posterPrint.inviteAnd,
              }}
              details={inviteDetails}
              detailStrings={detailStrings}
              visibility={inviteVisibility!}
            />
          ) : isInvitationPrint && mergedInvitation && inviteDetails && routeTemplate === "wedding-invite-gold-arch-floral" ? (
            <WeddingInviteGoldArchFloralPrintSheet
              paper={paper}
              partnerA={mergedInvitation.partner_a ?? ""}
              partnerB={mergedInvitation.partner_b ?? ""}
              extraLine={mergedInvitation.extra_line ?? ""}
              eventDateIso={eventDateIso}
              locale={posterLocale}
              strings={{
                headline: posterPrint.inviteGoldArchHeadline,
                and: posterPrint.inviteAnd,
              }}
              details={inviteDetails}
              detailStrings={detailStrings}
              visibility={inviteVisibility!}
            />
          ) : isInvitationPrint && mergedInvitation && inviteDetails && routeTemplate === "wedding-invite-terra-pill" ? (
            <WeddingInviteTerracottaPillPrintSheet
              paper={paper}
              partnerA={mergedInvitation.partner_a ?? ""}
              partnerB={mergedInvitation.partner_b ?? ""}
              extraLine={mergedInvitation.extra_line ?? ""}
              eventDateIso={eventDateIso}
              locale={posterLocale}
              strings={{
                pleaseJoinUsFor: posterPrint.inviteTerraPleaseJoinUsFor,
                theWeddingOf: posterPrint.inviteTerraTheWeddingOf,
                and: posterPrint.inviteAnd,
              }}
              details={inviteDetails}
              detailStrings={detailStrings}
              visibility={inviteVisibility!}
            />
          ) : isInvitationPrint && mergedInvitation && routeTemplate === "wedding-invite-grayscale-glitter" ? (
            <WeddingInviteGrayscaleGlitterPrintSheet
              paper={paper}
              partnerA={mergedInvitation.partner_a ?? ""}
              partnerB={mergedInvitation.partner_b ?? ""}
              connectorSymbol={mergedInvitation.connector_symbol ?? "ampersand"}
              extraLine={mergedInvitation.extra_line ?? ""}
              eventDateIso={eventDateIso}
              locale={posterLocale}
              strings={{
                togetherWithFamilies: posterPrint.inviteGlitterTogetherFamilies,
                cordiallyInviteCaps: posterPrint.inviteGlitterCordiallyInviteCaps,
                weddingWord: posterPrint.inviteGlitterWeddingWord,
                on: posterPrint.inviteGlitterOn,
                and: posterPrint.inviteAnd,
              }}
              visibility={inviteVisibility!}
            />
          ) : isInvitationPrint && mergedInvitation && inviteDetails && routeTemplate === "wedding-invite-navy-botanical" ? (
            <WeddingInviteNavyBotanicalPrintSheet
              paper={paper}
              partnerA={mergedInvitation.partner_a ?? ""}
              partnerB={mergedInvitation.partner_b ?? ""}
              extraLine={mergedInvitation.extra_line ?? ""}
              eventDateIso={eventDateIso}
              locale={posterLocale}
              strings={{
                togetherWithOurFamilies: posterPrint.inviteTogetherWithOurFamilies,
                honorUniteMarriage: posterPrint.inviteHonorUniteMarriage,
                and: posterPrint.inviteAnd,
              }}
              details={inviteDetails}
              detailStrings={detailStrings}
              visibility={inviteVisibility!}
            />
          ) : isInvitationPrint && mergedInvitation && inviteDetails && routeTemplate === "wedding-invite-watercolor-coast" ? (
            <WeddingInviteWatercolorCoastPrintSheet
              paper={paper}
              partnerA={mergedInvitation.partner_a ?? ""}
              partnerB={mergedInvitation.partner_b ?? ""}
              venue={mergedInvitation.venue ?? ""}
              venueLine2={mergedInvitation.venue_line_2 ?? ""}
              extraLine={mergedInvitation.extra_line ?? ""}
              eventDateIso={eventDateIso}
              locale={posterLocale}
              strings={{
                pleaseJoinUs: posterPrint.inviteWatercolorPleaseJoinUs,
                forOurCeremony: posterPrint.inviteWatercolorForCeremony,
                and: posterPrint.inviteAnd,
                receptionToFollow: posterPrint.inviteReceptionFollow,
              }}
              details={inviteDetails}
              detailStrings={detailStrings}
              visibility={inviteVisibility!}
            />
          ) : isInvitationPrint && mergedInvitation && inviteDetails && routeTemplate === "wedding-invite-geometric" ? (
            <WeddingInviteGeometricPrintSheet
              paper={paper}
              partnerA={mergedInvitation.partner_a ?? ""}
              partnerB={mergedInvitation.partner_b ?? ""}
              venue={mergedInvitation.venue ?? ""}
              venueLine2={mergedInvitation.venue_line_2 ?? ""}
              extraLine={mergedInvitation.extra_line ?? ""}
              eventDateIso={eventDateIso}
              locale={posterLocale}
              strings={{
                withJoyYouAre: posterPrint.inviteWithJoyYouAre,
                invitedToWeddingOf: posterPrint.inviteInvitedToWeddingOf,
                and: posterPrint.inviteAnd,
                receptionToFollow: posterPrint.inviteReceptionFollow,
              }}
              details={inviteDetails}
              detailStrings={detailStrings}
              visibility={inviteVisibility!}
            />
          ) : isInvitationPrint && mergedInvitation && inviteDetails && routeTemplate === "wedding-invite-blue-floral" ? (
            <WeddingInviteBlueFloraPrintSheet
              paper={paper}
              partnerA={mergedInvitation.partner_a ?? ""}
              partnerB={mergedInvitation.partner_b ?? ""}
              extraLine={mergedInvitation.extra_line ?? ""}
              eventDateIso={eventDateIso}
              locale={posterLocale}
              strings={{
                withJoyYouAre: posterPrint.inviteWithJoyYouAre,
                invitedToWeddingOf: posterPrint.inviteInvitedToWeddingOf,
                and: posterPrint.inviteAnd,
              }}
              details={inviteDetails}
              detailStrings={detailStrings}
              visibility={inviteVisibility!}
            />
          ) : isInvitationPrint && mergedInvitation && routeTemplate === "wedding-invite-gold-circles-photo" ? (
            <WeddingInviteGoldCirclesPhotoPrintSheet
              paper={paper}
              partnerA={mergedInvitation.partner_a ?? ""}
              partnerB={mergedInvitation.partner_b ?? ""}
              venue={mergedInvitation.venue ?? ""}
              extraLine={mergedInvitation.extra_line ?? ""}
              eventDateIso={eventDateIso}
              locale={posterLocale}
              photoUrl={goldCirclesPhotoUrl}
              cropX={parseFloat(mergedInvitation.couple_photo_crop_x ?? "") || 0}
              cropY={parseFloat(mergedInvitation.couple_photo_crop_y ?? "") || 0}
              cropScale={parseFloat(mergedInvitation.couple_photo_crop_scale ?? "") || 1}
              strings={{
                youreInvited: posterPrint.inviteGoldCirclesYoureInvited,
                and: posterPrint.inviteAnd,
                receptionToFollow: posterPrint.inviteReceptionFollow,
              }}
              visibility={inviteVisibility!}
            />
          ) : null}
        </div>
      </div>
    </main>
  );
}
