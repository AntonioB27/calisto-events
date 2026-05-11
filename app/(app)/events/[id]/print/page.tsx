import Link from "next/link";
import QRCode from "react-qr-code";

import { EventPrintToolbar } from "./EventPrintToolbar";
import { getEventAdminAccess } from "@/lib/event-admin-access";
import { getWebJoinUrl } from "@/lib/join-link";
import { getPublicOrigin } from "@/lib/public-origin";
import { createSupabaseAuthServerClient } from "@/lib/supabase-auth-server";

type Props = Readonly<{
  params: Promise<{ id: string }>;
}>;

export default async function EventPrintPage({ params }: Props) {
  const { id } = await params;
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
          <h1 style={{ fontSize: "1.5rem", fontWeight: 800, color: "var(--app-text)" }}>Event not found</h1>
          <p style={{ marginTop: 8, fontSize: "0.875rem", color: "var(--app-muted)" }}>
            You don&apos;t have access to this event.
          </p>
          <p style={{ marginTop: 16 }}>
            <Link href="/dashboard" style={{ color: "var(--app-gold)", fontWeight: 600, fontSize: 14 }}>
              ← Dashboard
            </Link>
          </p>
        </div>
      </main>
    );
  }

  const publicOrigin = await getPublicOrigin();
  const joinUrl = getWebJoinUrl(publicOrigin, event.access_code);

  return (
    <main
      className="join-shell min-h-screen px-4 py-10 print:bg-white print:px-0 print:py-0"
      style={{ color: "var(--app-text)" }}
    >
      <div style={{ maxWidth: 896, margin: "0 auto" }} className="print:max-w-none">
        <EventPrintToolbar eventId={id} />

        <article
          style={{
            margin: "0 auto",
            width: "100%",
            maxWidth: 800,
            borderRadius: 24,
            border: "1.5px solid var(--app-border)",
            background: "var(--app-surface-2)",
            padding: 40,
            textAlign: "center",
          }}
          className="print:max-w-none print:rounded-none print:border-none print:bg-white print:p-16"
        >
          <p
            style={{
              fontSize: 11,
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.2em",
              color: "var(--app-gold)",
            }}
          >
            Scan to upload photos & videos
          </p>
          <h1 style={{ marginTop: 16, fontSize: "2.25rem", fontWeight: 800, letterSpacing: "-0.02em", color: "var(--app-text)" }}>
            {event.title}
          </h1>

          <div
            style={{
              margin: "40px auto 0",
              display: "inline-flex",
              borderRadius: 16,
              background: "var(--app-surface)",
              padding: 24,
              border: "1.5px solid var(--app-border)",
            }}
          >
            <QRCode value={joinUrl} size={260} />
          </div>

          <p style={{ marginTop: 32, fontSize: 14, color: "var(--app-muted)" }}>
            Or go to{" "}
            <span style={{ fontFamily: "ui-monospace, monospace" }}>{publicOrigin.replace(/^https?:\/\//, "")}</span> and
            enter code:
          </p>
          <p
            style={{
              marginTop: 12,
              display: "inline-flex",
              borderRadius: 9999,
              border: "1.5px solid var(--app-border-strong)",
              background: "var(--app-surface)",
              padding: "12px 24px",
              fontFamily: "ui-monospace, monospace",
              fontSize: "1.5rem",
              fontWeight: 800,
              letterSpacing: "0.2em",
              color: "var(--app-text)",
            }}
          >
            {event.access_code}
          </p>

          <p
            style={{
              marginTop: 40,
              wordBreak: "break-all",
              fontFamily: "ui-monospace, monospace",
              fontSize: 11,
              color: "var(--app-subtle)",
            }}
          >
            {joinUrl}
          </p>
        </article>
      </div>
    </main>
  );
}
