import { Resend } from "resend";

export type ZipExportEmailKind = "ready" | "failed";

export async function sendZipExportEmail(args: {
  kind: ZipExportEmailKind;
  to: string;
  eventTitle: string;
  galleryUrl: string;
  jobId: string;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  const key = process.env.RESEND_API_KEY;
  if (!key) return { ok: false, error: "RESEND_API_KEY missing" };

  const resend = new Resend(key);
  const subject =
    args.kind === "ready"
      ? `Your Calisto export is ready — ${args.eventTitle}`
      : `Calisto export failed — ${args.eventTitle}`;

  const html =
    args.kind === "ready"
      ? `<p>Your ZIP for <strong>${escapeHtml(args.eventTitle)}</strong> is ready.</p><p><a href="${escapeAttr(args.galleryUrl)}">Open gallery to download</a></p><p style="font-size:12px;color:#666">Job ID: ${escapeHtml(args.jobId)}</p>`
      : `<p>We could not finish the ZIP for <strong>${escapeHtml(args.eventTitle)}</strong>. Open the gallery for details.</p><p><a href="${escapeAttr(args.galleryUrl)}">Open gallery</a></p>`;

  const from = process.env.RESEND_FROM ?? "Calisto <onboarding@resend.dev>";
  const { error } = await resend.emails.send({ from, to: args.to, subject, html });
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

function escapeHtml(s: string): string {
  return s.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");
}

function escapeAttr(s: string): string {
  return escapeHtml(s).replaceAll('"', "&quot;");
}
