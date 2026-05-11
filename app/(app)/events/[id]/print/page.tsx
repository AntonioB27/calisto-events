import Link from "next/link";

import { EventPrintSheet } from "./EventPrintSheet";
import { EventPrintToolbar } from "./EventPrintToolbar";
import { getAppStrings } from "@/lib/app-ui";
import { getEventAdminAccess } from "@/lib/event-admin-access";
import { parsePosterTemplate, parsePrintPaper } from "@/lib/event-print/print-options";
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
  const locale = await getUiLocale();
  const dict = getAppStrings(locale);
  const { print: printStrings } = dict;

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
          <h1 style={{ fontSize: "1.5rem", fontWeight: 800, color: "var(--app-text)" }}>{printStrings.deniedTitle}</h1>
          <p style={{ marginTop: 8, fontSize: "0.875rem", color: "var(--app-muted)" }}>{printStrings.deniedDeny}</p>
          <p style={{ marginTop: 16 }}>
            <Link href="/dashboard" style={{ color: "var(--app-gold)", fontWeight: 600, fontSize: 14 }}>
              {printStrings.backDashboard}
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
    heroEyebrow: printStrings.heroEyebrow,
    footerGoToLead: printStrings.footerGoToLead,
    footerGoToTrail: printStrings.footerGoToTrail,
  };

  return (
    <main
      className="join-shell min-h-screen px-4 py-10 print:bg-white print:px-0 print:py-0"
      style={{ color: "var(--app-text)" }}
    >
      <div style={{ maxWidth: 960, margin: "0 auto" }} className="print:max-w-none">
        <EventPrintToolbar eventId={id} template={template} paper={paper} print={printStrings} />

        <EventPrintSheet
          paper={paper}
          template={template}
          eventTitle={event.title}
          accessCode={event.access_code}
          joinUrl={joinUrl}
          publicHostDisplay={publicHostDisplay}
          halfStrings={halfStrings}
          cutHere={printStrings.cutHere}
        />
      </div>
    </main>
  );
}
