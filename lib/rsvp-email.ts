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
  return `<p style="margin:0 0 8px;font-size:14px;color:#e8dcc6;">${template.attendeesLabel}: ${attendees.length}</p><ul style="margin:0 0 20px;padding-left:18px;font-size:14px;color:#e8dcc6;">${items}</ul>`;
}

function rsvpHtml(input: RsvpNotificationInput, template: RsvpNotificationTemplate, dashboardUrl: string): string {
  const intro = input.status === "confirmed" ? template.confirmedIntro : template.declinedIntro;
  return `
  <div style="margin:0;padding:24px;background:#0c0a0f;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;color:#f4ead9;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:620px;margin:0 auto;background:linear-gradient(180deg,#141019 0%,#0c0a0f 100%);border:1px solid rgba(244,234,217,0.16);border-radius:20px;overflow:hidden;">
      <tr>
        <td style="padding:22px 26px;border-bottom:1px solid rgba(244,234,217,0.12);">
          <div style="font-size:13px;letter-spacing:.12em;text-transform:uppercase;color:#e8dcc6;opacity:.85;">${escapeHtml(input.eventTitle)}</div>
        </td>
      </tr>
      <tr>
        <td style="padding:28px 26px 16px;">
          <h1 style="margin:0 0 14px;font-size:26px;line-height:1.2;font-weight:700;color:#f4ead9;">
            <strong style="color:#ffd28e;">${escapeHtml(input.submitterName)}</strong> ${intro}
          </h1>
          ${attendeesHtml(input.attendees, template)}
          <a href="${escapeHtml(dashboardUrl)}" style="display:inline-block;padding:12px 20px;border-radius:999px;text-decoration:none;font-weight:700;font-size:14px;color:#1b1208;background:linear-gradient(135deg,#f5c76b 0%,#f0b34b 48%,#c9912e 100%);">
            ${template.ctaLabel}
          </a>
        </td>
      </tr>
      <tr>
        <td style="padding:18px 26px 24px;border-top:1px solid rgba(244,234,217,0.10);font-size:13px;line-height:1.7;color:#b5ab99;">
          <div>${template.signature}</div>
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
