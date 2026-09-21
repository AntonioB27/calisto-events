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
  const mascotUrl = `${siteUrl.replace(/\/$/, "")}/brand/mascot/aurora_waving.png`;
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
              <td style="font-family:Georgia,'Times New Roman',serif;font-style:italic;font-weight:700;font-size:20px;color:#221509;">
                Calisto
              </td>
            </tr>
          </table>
        </td>
      </tr>
      <tr>
        <td style="padding:20px 32px 8px;">
          <h1 style="margin:0 0 16px;font-family:Georgia,'Times New Roman',serif;font-style:italic;font-size:30px;line-height:1.2;font-weight:700;color:#221509;">
            ${template.title}
          </h1>
          <p style="margin:0 0 10px;font-size:15px;line-height:1.65;color:#5a4a36;">
            ${template.intro} <strong style="color:#221509;">${safeEmail}</strong>.
          </p>
          <p style="margin:0 0 26px;font-size:15px;line-height:1.65;color:#5a4a36;">
            ${template.followUp}
          </p>
          <a href="${safeSiteUrl}" style="display:inline-block;padding:13px 24px;border-radius:999px;text-decoration:none;font-weight:700;font-size:14px;color:#1b1208;background:linear-gradient(135deg,#f5c76b 0%,#f0b34b 48%,#c9912e 100%);box-shadow:0 6px 18px rgba(197,146,42,0.35);">
            ${template.ctaLabel}
          </a>
        </td>
      </tr>
      <tr>
        <td style="padding:0 32px;">
          <div style="height:1px;background:#e8e0d2;margin:12px 0 20px;"></div>
        </td>
      </tr>
      <tr>
        <td style="padding:0 32px 28px;font-size:13px;line-height:1.7;color:#9a8570;">
          <div>${template.supportLabel} <a href="mailto:info@calisto-events.com" style="color:#c5922a;text-decoration:none;font-weight:600;">info@calisto-events.com</a></div>
          <div style="margin-top:6px;font-style:italic;">${template.signature}</div>
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
    `${template.supportLabel} info@calisto-events.com`,
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
    const { data, error } = await resend.emails.send({
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
