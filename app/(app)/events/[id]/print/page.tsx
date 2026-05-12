import Link from "next/link";

import { EventPrintSheet } from "./EventPrintSheet";
import { EventPrintToolbar } from "./EventPrintToolbar";
import { getAppStrings } from "@/lib/app-ui";
import { getEventAdminAccess } from "@/lib/event-admin-access";
import {
  parsePosterContentLocale,
  parsePosterTemplate,
  parsePrintPaper,
  POSTER_LANG_QUERY,
} from "@/lib/event-print/print-options";
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
    .select("id, title, access_code, organizer_id")
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

  const template = parsePosterTemplate(pickQueryValue(resolvedSearchParams.template));
  const paper = parsePrintPaper(pickQueryValue(resolvedSearchParams.paper));

  const publicOrigin = await getPublicOrigin();
  const joinUrl = getWebJoinUrl(publicOrigin, event.access_code);
  const publicHostDisplay = publicOrigin.replace(/^https?:\/\//, "");

  const halfStrings = {
    heroEyebrow: posterPrint.heroEyebrow,
    footerGoToLead: posterPrint.footerGoToLead,
    footerGoToTrail: posterPrint.footerGoToTrail,
  };

  return (
    <main
      className="join-shell min-h-screen px-4 py-10 print:bg-white print:px-0 print:py-0"
      style={{ color: "var(--app-text)" }}
    >
      <div style={{ maxWidth: 960, margin: "0 auto" }} className="print:max-w-none">
        <EventPrintToolbar
          eventId={id}
          template={template}
          paper={paper}
          posterLang={posterLocale}
          chromePrint={uiDict.print}
          localeOptionLabels={uiDict.languagePicker.locales}
        />

        <div lang={posterLocale}>
          <EventPrintSheet
            paper={paper}
            template={template}
            eventTitle={event.title}
            accessCode={event.access_code}
            joinUrl={joinUrl}
            publicHostDisplay={publicHostDisplay}
            halfStrings={halfStrings}
            cutHere={posterPrint.cutHere}
          />
        </div>
      </div>
    </main>
  );
}
