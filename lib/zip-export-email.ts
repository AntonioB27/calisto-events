import { Resend } from "resend";

export type ZipExportEmailKind = "ready" | "failed";

function escapeHtml(s: string): string {
  return s.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");
}

function escapeAttr(s: string): string {
  return escapeHtml(s).replaceAll('"', "&quot;");
}

function zipExportHtml(args: { kind: ZipExportEmailKind; eventTitle: string; galleryUrl: string; jobId: string }): string {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://calisto-events.com";
  const mascotUrl = `${siteUrl.replace(/\/$/, "")}/brand/mascot/aurora_gallery.png`;
  const goldFoil = "linear-gradient(90deg, transparent, #946C18 20%, #E6BF66 45%, #C5922A 65%, #946C18 82%, transparent)";
  const safeEventTitle = escapeHtml(args.eventTitle);
  const safeGalleryUrl = escapeAttr(args.galleryUrl);

  const title = args.kind === "ready" ? "Your export is ready!" : "Your export could not finish";
  const body =
    args.kind === "ready"
      ? `Your ZIP for <strong style="color:#221509;">${safeEventTitle}</strong> is ready to download.`
      : `We could not finish the ZIP for <strong style="color:#221509;">${safeEventTitle}</strong>. Open the gallery for details, or try again.`;
  const ctaLabel = args.kind === "ready" ? "Download ZIP" : "Open gallery";

  return `
  <div style="margin:0;padding:32px 16px;background:#ece4d9;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:560px;margin:0 auto;background:#faf7f3;border:1px solid #ddd4c5;border-radius:22px;overflow:hidden;box-shadow:0 16px 40px -12px rgba(40,25,15,0.18);">
      <tr>
        <td style="height:3px;background:${goldFoil};font-size:0;line-height:0;">&nbsp;</td>
      </tr>
      <tr>
        <td style="padding:30px 32px 0;">
          <table role="presentation" cellspacing="0" cellpadding="0">
            <tr>
              <td style="padding-right:12px;">
                <img src="${mascotUrl}" width="44" height="44" alt="" style="display:block;border-radius:50%;border:1px solid #ddd4c5;" />
              </td>
              <td style="font-family:Georgia,'Times New Roman',serif;font-style:italic;font-weight:700;font-size:20px;color:#221509;">
                Calisto
              </td>
            </tr>
          </table>
        </td>
      </tr>
      <tr>
        <td style="padding:20px 32px 8px;">
          <h1 style="margin:0 0 16px;font-family:Georgia,'Times New Roman',serif;font-style:italic;font-size:26px;line-height:1.25;font-weight:700;color:#221509;">
            ${title}
          </h1>
          <p style="margin:0 0 26px;font-size:15px;line-height:1.65;color:#5a4a36;">
            ${body}
          </p>
          <a href="${safeGalleryUrl}" style="display:inline-block;padding:13px 24px;border-radius:999px;text-decoration:none;font-weight:700;font-size:14px;color:#1b1208;background:linear-gradient(135deg,#f5c76b 0%,#f0b34b 48%,#c9912e 100%);box-shadow:0 6px 18px rgba(197,146,42,0.35);">
            ${ctaLabel}
          </a>
        </td>
      </tr>
      <tr>
        <td style="padding:0 32px;">
          <div style="height:1px;background:#e8e0d2;margin:20px 0 20px;"></div>
        </td>
      </tr>
      <tr>
        <td style="padding:0 32px 28px;font-size:13px;line-height:1.7;color:#9a8570;">
          <div>Questions? Reach us at: <a href="mailto:info@calisto-events.com" style="color:#c5922a;text-decoration:none;font-weight:600;">info@calisto-events.com</a></div>
          <div style="margin-top:6px;font-style:italic;">The Calisto team</div>
          <div style="margin-top:10px;font-size:11px;color:#b5a48e;">Job ID: ${escapeHtml(args.jobId)}</div>
        </td>
      </tr>
    </table>
  </div>
  `;
}

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
      ? `Your Calisto export is ready: ${args.eventTitle}`
      : `Calisto export failed: ${args.eventTitle}`;

  const from = process.env.RESEND_FROM ?? "Calisto <onboarding@resend.dev>";
  const { error } = await resend.emails.send({ from, to: args.to, subject, html: zipExportHtml(args) });
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}
