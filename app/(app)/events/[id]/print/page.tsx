import Link from "next/link";

import { EventPrintSheet } from "./EventPrintSheet";
import { EventPrintToolbar } from "./EventPrintToolbar";
import { WeddingInviteSimplePrintSheet } from "./WeddingInviteSimplePrintSheet";
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
import { getPrintTemplateDef, isInvitationPrintTemplateId, isTableQrTemplateId } from "@/lib/event-print/template-catalog";
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

  const tablePosterTemplate = isTableQrTemplateId(routeTemplate) ? routeTemplate : DEFAULT_POSTER_TEMPLATE;

  const publicOrigin = await getPublicOrigin();
  const joinUrl = getWebJoinUrl(publicOrigin, event.access_code);
  const publicHostDisplay = publicOrigin.replace(/^https?:\/\//, "");

  const halfStrings = {
    heroEyebrow: posterPrint.heroEyebrow,
    footerGoToLead: posterPrint.footerGoToLead,
    footerGoToTrail: posterPrint.footerGoToTrail,
  };

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

  return (
    <main
      className="join-shell min-h-screen px-4 py-10 print:bg-white print:px-0 print:py-0"
      style={{ color: "var(--app-text)" }}
    >
      <div
        style={{
          maxWidth: isInvitationPrint ? "100%" : 960,
          margin: "0 auto",
          width: "100%",
        }}
        className="print:max-w-none"
      >
        <EventPrintToolbar
          eventId={id}
          activeTemplate={routeTemplate}
          eventKind={storedEventKind}
          paper={paper}
          posterLang={posterLocale}
          chromePrint={uiDict.print}
          localeOptionLabels={uiDict.languagePicker.locales}
          backHref={isInvitationPrint ? `/events/${id}?tab=prints` : `/events/${id}?tab=share`}
          backLabel={isInvitationPrint ? uiDict.print.backPrints : uiDict.print.backShare}
          sheetHelperLine={isInvitationPrint ? uiDict.print.sheetHelperInvitation : uiDict.print.sheetHelper}
        />

        <div lang={posterLocale} className={isInvitationPrint ? "print-invite-page-root" : undefined}>
          {isInvitationPrint && mergedInvitation ? (
            <WeddingInviteSimplePrintSheet
              paper={paper}
              partnerA={mergedInvitation.partner_a ?? ""}
              partnerB={mergedInvitation.partner_b ?? ""}
              venue={mergedInvitation.venue ?? ""}
              extraLine={mergedInvitation.extra_line ?? ""}
              eventDateIso={typeof event.event_date === "string" ? event.event_date : ""}
              locale={posterLocale}
              strings={{
                togetherWithFamilies: posterPrint.inviteTogetherWithFamilies,
                inviteCelebrationOn: posterPrint.inviteCelebrationOn,
                receptionToFollow: posterPrint.inviteReceptionFollow,
              }}
            />
          ) : (
            <EventPrintSheet
              paper={paper}
              template={tablePosterTemplate}
              eventTitle={event.title}
              accessCode={event.access_code}
              joinUrl={joinUrl}
              publicHostDisplay={publicHostDisplay}
              halfStrings={halfStrings}
              cutHere={posterPrint.cutHere}
            />
          )}
        </div>
      </div>
    </main>
  );
}
