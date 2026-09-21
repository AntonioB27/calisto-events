import { Resend } from "resend";
import type { Locale } from "@/lib/i18n";
import { getSupabaseServerClient } from "@/lib/supabase-server";
import type { RsvpAttendee } from "@/lib/rsvp-duplicate";

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

type RsvpNotificationTemplate = {
  subjectConfirmed: string;
  subjectDeclined: string;
  confirmedIntro: string;
  declinedIntro: string;
  attendeesLabel: string;
  adultLabel: string;
  childLabel: string;
  ctaLabel: string;
  signature: string;
};

function getRsvpTemplate(locale: Locale): RsvpNotificationTemplate {
  if (locale === "hr") {
    return {
      subjectConfirmed: "Nova potvrda dolaska",
      subjectDeclined: "Novi otkaz dolaska",
      confirmedIntro: "dolazi na vaš događaj.",
      declinedIntro: "neće moći doći na vaš događaj.",
      attendeesLabel: "Broj osoba",
      adultLabel: "odrasla osoba",
      childLabel: "dijete",
      ctaLabel: "Otvori nadzornu ploču",
      signature: "Calisto tim",
    };
  }
  if (locale === "de") {
    return {
      subjectConfirmed: "Neue Zusage",
      subjectDeclined: "Neue Absage",
      confirmedIntro: "kommt zu deiner Veranstaltung.",
      declinedIntro: "kann leider nicht zu deiner Veranstaltung kommen.",
      attendeesLabel: "Anzahl Personen",
      adultLabel: "Erwachsene(r)",
      childLabel: "Kind",
      ctaLabel: "Dashboard öffnen",
      signature: "Das Calisto-Team",
    };
  }
  return {
    subjectConfirmed: "New RSVP confirmation",
    subjectDeclined: "New RSVP decline",
    confirmedIntro: "is coming to your event.",
    declinedIntro: "cannot make it to your event.",
    attendeesLabel: "Party size",
    adultLabel: "adult",
    childLabel: "child",
    ctaLabel: "Open dashboard",
    signature: "The Calisto team",
  };
}

export type RsvpNotificationInput = Readonly<{
  organizerId: string;
  eventId: string;
  eventTitle: string;
  locale: Locale;
  status: "confirmed" | "declined";
  submitterName: string;
  attendees: readonly RsvpAttendee[];
}>;

function attendeesHtml(attendees: readonly RsvpAttendee[], template: RsvpNotificationTemplate): string {
  if (attendees.length === 0) return "";
  const items = attendees
    .map((a) => `<li>${escapeHtml(a.name)} (${a.type === "adult" ? template.adultLabel : template.childLabel})</li>`)
    .join("");
  return `<div style="background:#f7e9c9;border:1px solid rgba(197,146,42,0.35);border-radius:16px;padding:16px 20px;margin:0 0 22px;"><p style="margin:0 0 8px;font-size:12px;letter-spacing:.08em;text-transform:uppercase;font-weight:700;color:#946c18;">${template.attendeesLabel}: ${attendees.length}</p><ul style="margin:0;padding-left:18px;font-size:14px;line-height:1.6;color:#5a4a36;">${items}</ul></div>`;
}

function rsvpHtml(input: RsvpNotificationInput, template: RsvpNotificationTemplate, dashboardUrl: string): string {
  const intro = input.status === "confirmed" ? template.confirmedIntro : template.declinedIntro;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://calisto-events.com";
  const mascotUrl = `${siteUrl.replace(/\/$/, "")}/brand/mascot/aurora_planning.png`;
  const goldFoil = "linear-gradient(90deg, transparent, #946C18 20%, #E6BF66 45%, #C5922A 65%, #946C18 82%, transparent)";

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
              <td style="font-family:Georgia,'Times New Roman',serif;font-style:italic;font-size:13px;letter-spacing:.08em;text-transform:uppercase;color:#9a8570;">
                ${escapeHtml(input.eventTitle)}
              </td>
            </tr>
          </table>
        </td>
      </tr>
      <tr>
        <td style="padding:20px 32px 8px;">
          <h1 style="margin:0 0 20px;font-family:Georgia,'Times New Roman',serif;font-style:italic;font-size:26px;line-height:1.3;font-weight:700;color:#221509;">
            <strong style="color:#c5922a;">${escapeHtml(input.submitterName)}</strong> ${intro}
          </h1>
          ${attendeesHtml(input.attendees, template)}
          <a href="${escapeHtml(dashboardUrl)}" style="display:inline-block;padding:13px 24px;border-radius:999px;text-decoration:none;font-weight:700;font-size:14px;color:#1b1208;background:linear-gradient(135deg,#f5c76b 0%,#f0b34b 48%,#c9912e 100%);box-shadow:0 6px 18px rgba(197,146,42,0.35);">
            ${template.ctaLabel}
          </a>
        </td>
      </tr>
      <tr>
        <td style="padding:0 32px;">
          <div style="height:1px;background:#e8e0d2;margin:20px 0 20px;"></div>
        </td>
      </tr>
      <tr>
        <td style="padding:0 32px 28px;font-size:13px;line-height:1.7;color:#9a8570;font-style:italic;">
          ${template.signature}
        </td>
      </tr>
    </table>
  </div>
  `;
}

export async function sendRsvpNotificationEmail(
  input: RsvpNotificationInput,
): Promise<{ ok: boolean; skipped?: boolean; error?: string }> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    return { ok: false, skipped: true, error: "RESEND_API_KEY is not configured." };
  }

  const db = getSupabaseServerClient();
  const { data, error: userError } = await db.auth.admin.getUserById(input.organizerId);
  const organizerEmail = data?.user?.email;
  if (userError || !organizerEmail) {
    return { ok: false, error: "No organizer email found." };
  }

  const template = getRsvpTemplate(input.locale);
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://calisto-events.com";
  const dashboardUrl = `${siteUrl.replace(/\/$/, "")}/events/${input.eventId}?tab=rsvp`;
  const fromAddress = process.env.RESEND_FROM ?? "Calisto <onboarding@resend.dev>";
  const resend = new Resend(apiKey);

  try {
    const { error } = await resend.emails.send({
      from: fromAddress,
      to: organizerEmail,
      subject: input.status === "confirmed" ? template.subjectConfirmed : template.subjectDeclined,
      html: rsvpHtml(input, template, dashboardUrl),
    });
    if (error) return { ok: false, error: error.message };
    return { ok: true };
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : "Unknown email error" };
  }
}
