import { NextResponse } from "next/server";
import { renderToBuffer } from "@react-pdf/renderer";
import QRCode from "qrcode";
import React from "react";

import { getEventAdminAccess } from "@/lib/event-admin-access";
import { getWebJoinUrl } from "@/lib/join-link";
import { getPublicOrigin } from "@/lib/public-origin";
import { createSupabaseAuthServerClient } from "@/lib/supabase-auth-server";
import { QrPdfDocument } from "./QrPdfDocument";

type RouteParams = { params: Promise<{ id: string }> };

export async function GET(request: Request, { params }: RouteParams) {
  const { id } = await params;
  const preview = new URL(request.url).searchParams.get("preview") === "1";

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

  const pdfBuffer = await renderToBuffer(
    React.createElement(QrPdfDocument, {
      eventTitle: event.title,
      accessCode: event.access_code,
      joinUrl,
      qrDataUrl,
      cutHereLabel: "Cut here",
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    }) as any,
  );

  const disposition = preview
    ? `inline; filename="qr-${event.access_code}.pdf"`
    : `attachment; filename="qr-${event.access_code}.pdf"`;

  return new NextResponse(new Uint8Array(pdfBuffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": disposition,
    },
  });
}
