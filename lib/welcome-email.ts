import { Resend } from "resend";
import type { Locale } from "@/lib/i18n";

type SendWelcomeEmailResult = {
  ok: boolean;
  skipped?: boolean;
  error?: string;
};

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

type WelcomeEmailTemplate = {
  subject: string;
  title: string;
  intro: string;
  followUp: string;
  ctaLabel: string;
  supportLabel: string;
  signature: string;
};

function getWelcomeTemplate(locale: Locale): WelcomeEmailTemplate {
  if (locale === "hr") {
    return {
      subject: "Na Calisto listi čekanja si",
      title: "Dobrodošli u Calisto!",
      intro: "Hvala što ste se prijavili na listu čekanja s adresom",
      followUp: "Javit ćemo vam čim Calisto bude spreman za širu dostupnost.",
      ctaLabel: "Pogledaj Calisto",
      supportLabel: "Pitanja? Javi nam se:",
      signature: "Calisto tim",
    };
  }
  if (locale === "de") {
    return {
      subject: "Du bist auf der Calisto-Warteliste",
      title: "Willkommen bei Calisto!",
      intro: "Danke, dass du dich mit folgender Adresse in die Warteliste eingetragen hast:",
      followUp: "Wir melden uns, sobald Calisto breiter verfügbar ist.",
      ctaLabel: "Calisto ansehen",
      supportLabel: "Fragen? Schreib uns:",
      signature: "Das Calisto-Team",
    };
  }
  return {
    subject: "You're on the Calisto waitlist",
    title: "Welcome to Calisto!",
    intro: "Thanks for joining our waitlist with",
    followUp: "We'll send you updates as soon as Calisto is ready for wider access.",
    ctaLabel: "See Calisto",
    supportLabel: "Questions? Reach us at:",
    signature: "The Calisto team",
  };
}

function welcomeHtml(email: string, locale: Locale): string {
  const safeEmail = escapeHtml(email);
  const template = getWelcomeTemplate(locale);
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://calisto-events.com";
  const safeSiteUrl = escapeHtml(siteUrl);
  return `
  <div style="margin:0;padding:24px;background:#0c0a0f;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;color:#f4ead9;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:620px;margin:0 auto;background:linear-gradient(180deg,#141019 0%,#0c0a0f 100%);border:1px solid rgba(244,234,217,0.16);border-radius:20px;overflow:hidden;">
      <tr>
        <td style="padding:22px 26px;border-bottom:1px solid rgba(244,234,217,0.12);">
          <div style="font-size:13px;letter-spacing:.12em;text-transform:uppercase;color:#e8dcc6;opacity:.85;">Calisto</div>
        </td>
      </tr>
      <tr>
        <td style="padding:28px 26px 16px;">
          <h1 style="margin:0 0 14px;font-size:30px;line-height:1.15;font-weight:700;color:#f4ead9;">${template.title}</h1>
          <p style="margin:0 0 10px;font-size:16px;line-height:1.6;color:#e8dcc6;">
            ${template.intro} <strong style="color:#ffd28e;">${safeEmail}</strong>.
          </p>
          <p style="margin:0 0 24px;font-size:16px;line-height:1.6;color:#e8dcc6;">
            ${template.followUp}
          </p>
          <a href="${safeSiteUrl}" style="display:inline-block;padding:12px 20px;border-radius:999px;text-decoration:none;font-weight:700;font-size:14px;color:#1b1208;background:linear-gradient(135deg,#f5c76b 0%,#f0b34b 48%,#c9912e 100%);">
            ${template.ctaLabel}
          </a>
        </td>
      </tr>
      <tr>
        <td style="padding:18px 26px 24px;border-top:1px solid rgba(244,234,217,0.10);font-size:13px;line-height:1.7;color:#b5ab99;">
          <div>${template.supportLabel} <a href="mailto:hello@calisto.co" style="color:#ffd28e;text-decoration:none;">hello@calisto.co</a></div>
          <div style="margin-top:6px;">- ${template.signature}</div>
        </td>
      </tr>
    </table>
  </div>
  `;
}

function welcomeText(email: string, locale: Locale): string {
  const template = getWelcomeTemplate(locale);
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://calisto-events.com";
  return [
    template.title,
    "",
    `${template.intro} ${email}.`,
    template.followUp,
    "",
    `${template.ctaLabel}: ${siteUrl}`,
    "",
    `${template.supportLabel} info@calisto.com`,
    `- ${template.signature}`,
  ].join("\n");
}

export async function sendWelcomeEmail(email: string, locale: Locale): Promise<SendWelcomeEmailResult> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    return {
      ok: false,
      skipped: true,
      error: "RESEND_API_KEY is not configured.",
    };
  }

  const fromAddress = process.env.WELCOME_EMAIL_FROM ?? "Calisto <onboarding@resend.dev>";
  const resend = new Resend(apiKey);

  const template = getWelcomeTemplate(locale);

  try {
    const { error } = await resend.emails.send({
      from: fromAddress,
      to: email,
      subject: template.subject,
      html: welcomeHtml(email, locale),
      text: welcomeText(email, locale),
    });

    if (error) {
      return { ok: false, error: error.message };
    }

    return { ok: true };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Unknown email error",
    };
  }
}
