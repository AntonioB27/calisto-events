import { LOCALES } from "@/lib/i18n";
import { InvitationArtwork } from "../_tabs/InvitationArtwork";
import { InvitationPreflight } from "../_tabs/InvitationPreflight";
import { InvitationCanvas } from "../_tabs/InvitationCanvas";
import { mergeInvitationDocuments } from "@/lib/event-print/invitation-document";
import { invitationWorkspaceCopy } from "@/lib/event-print/invitation-workspace-copy";
import Link from "next/link";

import { EventPrintToolbar } from "./EventPrintToolbar";
import { PrintScreen } from "./PrintScreen";
import { getAppStrings } from "@/lib/app-ui";
import { getEventAdminAccess } from "@/lib/event-admin-access";
import { splitEventTitleStored } from "@/lib/event-title";
import { normalizeEventKind } from "@/lib/event-kind";
import { mergeInvitationDraftWithDefaults } from "@/lib/event-print/merge-invitation-print-fields";
import {
  parsePosterContentLocale,
  parsePrintPaper,
  parsePrintRouteTemplate,
  POSTER_LANG_QUERY,
} from "@/lib/event-print/print-options";
import { getPrintTemplateDef, isInvitationPrintTemplateId, isQrThemedPrintTemplateId, type QrThemedTemplateId } from "@/lib/event-print/template-catalog";
import { getWebJoinUrl } from "@/lib/join-link";
import { getPublicOrigin } from "@/lib/public-origin";
import { createSupabaseAuthServerClient } from "@/lib/supabase-auth-server";
import { getUiLocale } from "@/lib/ui-locale";

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



  if (isInvitationPrint && invitationAllowed) {
    if (!access.isPrimaryOrganizer) return <main>{deniedPrint.deniedDeny}</main>;
    const { data: rows, error } = await supabase.from("event_print_template_instances")
      .select("template_id, field_values").eq("event_id", id);
    if (error) throw new Error("Could not load invitation. Please retry.");
    const drafts: Record<string, Record<string, string>> = {};
    for (const row of rows ?? []) {
      if (typeof row.template_id === "string" && row.field_values && typeof row.field_values === "object" && !Array.isArray(row.field_values)) {
        drafts[row.template_id] = Object.fromEntries(Object.entries(row.field_values).filter((entry): entry is [string, string] => typeof entry[1] === "string"));
      }
    }
    const { name } = splitEventTitleStored(String(event.title ?? ""));
    const date = typeof event.event_date === "string" ? event.event_date : "";
    const fields = mergeInvitationDraftWithDefaults(routeTemplate, name, date, posterLocale, mergeInvitationDocuments(drafts));
    const language = parsePosterContentLocale(fields.content_locale, posterLocale);
    let photoUrl: string | null = null;
    if (routeTemplate === "wedding-invite-gold-circles-photo" && fields.couple_photo_path) {
      if (!fields.couple_photo_path.startsWith(`${id}/invite-photo/`) || fields.couple_photo_path.includes("..")) throw new Error("Invalid invitation photo.");
      const { data, error: photoError } = await supabase.storage.from("event-media").createSignedUrl(fields.couple_photo_path, 3600);
      if (photoError || !data?.signedUrl) throw new Error("Could not load invitation photo. Please retry.");
      photoUrl = data.signedUrl;
    }
    const copy = invitationWorkspaceCopy(uiLocale);
    return <main>
      {/* eslint-disable-next-line @next/next/no-page-custom-font */}
      <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,500;0,600;0,700;1,500;1,600&family=Dancing+Script:wght@500;600;700&family=Montserrat:wght@200;300;400;500&display=swap" rel="stylesheet" />
      <EventPrintToolbar eventId={id} activeTemplate={routeTemplate} eventKind={storedEventKind} paper="a4" posterLang={language}
        chromePrint={uiDict.print} localeOptionLabels={uiDict.languagePicker.locales} backHref={`/events/${id}/invitations`}
        backLabel={uiDict.printsTab.categoryInvitation} sheetHelperLine={copy.productionHint} uiLocale={uiLocale} />
      <div className="invitation-print-help"><InvitationPreflight fields={fields} locale={uiLocale} templateId={routeTemplate} targetId="invitation-print-proof" /></div>
      <div className="invitation-print-proof" id="invitation-print-proof" lang={language}><InvitationCanvas fields={fields}><InvitationArtwork templateId={routeTemplate} fields={fields} eventDateIso={date} locale={language} photoUrl={photoUrl} /></InvitationCanvas></div>
    </main>;
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
          backHref={isInvitationPrint ? `/events/${id}/invitations` : isQrThemed ? `/events/${id}?tab=prints` : `/events/${id}?tab=share`}
          backLabel={isInvitationPrint ? uiDict.printsTab.categoryInvitation : isQrThemed ? uiDict.print.backPrints : uiDict.print.backShare}
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


      </div>
    </main>
  );
}
