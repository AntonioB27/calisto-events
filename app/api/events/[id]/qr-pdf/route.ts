import { NextResponse } from "next/server";
import { renderToBuffer } from "@react-pdf/renderer";
import QRCode from "qrcode";
import React from "react";

import { getEventAdminAccess } from "@/lib/event-admin-access";
import { getWebJoinUrl } from "@/lib/join-link";
import { getPublicOrigin } from "@/lib/public-origin";
import { createSupabaseAuthServerClient } from "@/lib/supabase-auth-server";
import { splitEventTitleStored } from "@/lib/event-title";
import { QrPdfDocument } from "./QrPdfDocument";

type RouteParams = { params: Promise<{ id: string }> };

function buildFilename(eventTitle: string, templateParam: string | null): string {
  const slug = eventTitle
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40) || "event";
  // Strip "qr-" prefix from template id for readability (e.g. "qr-romantic" → "romantic")
  const theme = (templateParam ?? "")
    .replace(/^qr-/, "")
    .replace(/[^a-z0-9-]/g, "")
    .slice(0, 30);
  return theme ? `calisto-${slug}-${theme}.pdf` : `calisto-${slug}-qr.pdf`;
}

export async function GET(request: Request, { params }: RouteParams) {
  const { id } = await params;
  const searchParams = new URL(request.url).searchParams;
  const preview = searchParams.get("preview") === "1";
  const templateParam = searchParams.get("template");

  const supabase = await createSupabaseAuthServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: event } = await supabase
    .from("events")
    .select("id, title, access_code, organizer_id")
    .eq("id", id)
    .maybeSingle();

  if (!event) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const access = await getEventAdminAccess(supabase, {
    eventId: id,
    userId: user?.id,
    organizerId: String(event.organizer_id),
  });

  if (!access.canAccess) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const publicOrigin = await getPublicOrigin();
  const joinUrl = getWebJoinUrl(publicOrigin, event.access_code);

  const qrDataUrl = await QRCode.toDataURL(joinUrl, {
    width: 400,
    margin: 1,
    color: { dark: "#000000", light: "#ffffff" },
  });

  const { name: eventTitle } = splitEventTitleStored(event.title);

  const pdfBuffer = await renderToBuffer(
    React.createElement(QrPdfDocument, {
      eventTitle,
      accessCode: event.access_code,
      joinUrl,
      qrDataUrl,
      cutHereLabel: "Cut here",
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    }) as any,
  );

  const filename = buildFilename(eventTitle, templateParam);
  const disposition = preview
    ? `inline; filename="${filename}"`
    : `attachment; filename="${filename}"`;

  return new NextResponse(new Uint8Array(pdfBuffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": disposition,
    },
  });
}
