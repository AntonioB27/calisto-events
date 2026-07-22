import { Resend } from "resend";
import { DEFAULT_LOCALE, isLocale, type Locale } from "@/lib/i18n";

type SendEventPurchaseEmailResult = {
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

type PurchaseEmailTemplate = {
  subject: string;
  title: string;
  intro: string;
  shareLabel: string;
  shareBody: string;
  ctaLabel: string;
  help: string;
  closing: string;
  supportLabel: string;
  signature: string;
};

function getPurchaseTemplate(locale: Locale, eventTitle: string): PurchaseEmailTemplate {
  if (locale === "hr") {
    return {
      subject: `Hvala na kupnji! ${eventTitle} je spreman`,
      title: "💛 Hvala vam na kupnji Calisto Events paketa!",
      intro:
        "Presretni smo što će Calisto biti dio vašeg posebnog dana. Želimo vam puno prekrasnih trenutaka i vjerujemo da će uz našu aplikaciju sve fotografije i videozapisi vaših uzvanika biti prikupljeni na jednom mjestu, bez čekanja i bez propuštenih uspomena.",
      shareLabel: "Podijelite s gostima",
      shareBody: "Dajte gostima ovaj pristupni kod da se pridruže i dodaju svoje fotografije:",
      ctaLabel: "Otvorite svoj događaj",
      help:
        "Ako vam zatreba bilo kakva pomoć oko postavljanja ili korištenja aplikacije, slobodno nam se javite. Tu smo za vas!",
      closing: "Želimo vam nezaboravan događaj i puno predivnih uspomena.",
      supportLabel: "Pitanja? Javite nam se:",
      signature: "Vaš Calisto Events tim 💙",
    };
  }
  if (locale === "de") {
    return {
      subject: `Danke für deinen Kauf! ${eventTitle} ist bereit`,
      title: "💛 Vielen Dank für deinen Kauf eines Calisto Events Pakets!",
      intro:
        "Wir freuen uns riesig, dass Calisto Teil deines besonderen Tages sein wird. Wir wünschen dir unzählige schöne Momente und sind überzeugt, dass mit unserer App alle Fotos und Videos deiner Gäste an einem Ort gesammelt werden, ohne Warten und ohne verpasste Erinnerungen.",
      shareLabel: "Mit deinen Gästen teilen",
      shareBody: "Gib deinen Gästen diesen Zugangscode, damit sie beitreten und ihre Fotos hinzufügen können:",
      ctaLabel: "Veranstaltung öffnen",
      help:
        "Wenn du Hilfe beim Einrichten oder Verwenden der App brauchst, melde dich einfach. Wir sind für dich da!",
      closing: "Wir wünschen dir eine unvergessliche Veranstaltung und viele wunderbare Erinnerungen.",
      supportLabel: "Fragen? Schreib uns:",
      signature: "Dein Calisto Events Team 💙",
    };
  }
  return {
    subject: `Thank you for your purchase! ${eventTitle} is ready`,
    title: "💛 Thank you for your Calisto Events purchase!",
    intro:
      "We're overjoyed that Calisto will be part of your special day. We wish you plenty of beautiful moments, and we're confident that with our app every photo and video from your guests will be gathered in one place, with no waiting and no missed memories.",
    shareLabel: "Share it with your guests",
    shareBody: "Give your guests this access code so they can join and add their own photos:",
    ctaLabel: "Open your event",
    help:
      "If you need any help setting up or using the app, just reach out. We're here for you!",
    closing: "We wish you an unforgettable event and many wonderful memories.",
    supportLabel: "Questions? Reach us at:",
    signature: "Your Calisto Events team 💙",
  };
}

function purchaseHtml(args: Readonly<{
  locale: Locale;
  eventTitle: string;
  accessCode: string;
  eventUrl: string;
}>): string {
  const template = getPurchaseTemplate(args.locale, args.eventTitle);
  const safeAccessCode = escapeHtml(args.accessCode);
  const safeEventUrl = escapeHtml(args.eventUrl);
  return `
  <div style="margin:0;padding:24px;background:#0c0a0f;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;color:#f4ead9;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:620px;margin:0 auto;background:linear-gradient(180deg,#141019 0%,#0c0a0f 100%);border:1px solid rgba(244,234,217,0.16);border-radius:20px;overflow:hidden;">
      <tr>
        <td style="padding:22px 26px;border-bottom:1px solid rgba(244,234,217,0.12);">
          <div style="font-size:13px;letter-spacing:.12em;text-transform:uppercase;color:#e8dcc6;opacity:.85;">Calisto</div>
        </td>
      </tr>
      <tr>
        <td style="padding:28px 26px 8px;">
          <h1 style="margin:0 0 14px;font-size:30px;line-height:1.15;font-weight:700;color:#f4ead9;">${escapeHtml(template.title)}</h1>
          <p style="margin:0 0 22px;font-size:16px;line-height:1.6;color:#e8dcc6;">
            ${escapeHtml(template.intro)}
          </p>
        </td>
      </tr>
      <tr>
        <td style="padding:0 26px 8px;">
          <div style="background:rgba(255,210,142,0.08);border:1px solid rgba(255,210,142,0.28);border-radius:16px;padding:18px 20px;">
            <div style="font-size:13px;letter-spacing:.08em;text-transform:uppercase;color:#ffd28e;font-weight:700;">${escapeHtml(template.shareLabel)}</div>
            <p style="margin:8px 0 12px;font-size:15px;line-height:1.55;color:#e8dcc6;">${escapeHtml(template.shareBody)}</p>
            <div style="font-size:26px;letter-spacing:.22em;font-weight:700;color:#ffd28e;font-family:'SFMono-Regular',Menlo,Consolas,monospace;">${safeAccessCode}</div>
          </div>
        </td>
      </tr>
      <tr>
        <td style="padding:22px 26px 8px;">
          <a href="${safeEventUrl}" style="display:inline-block;padding:12px 20px;border-radius:999px;text-decoration:none;font-weight:700;font-size:14px;color:#1b1208;background:linear-gradient(135deg,#f5c76b 0%,#f0b34b 48%,#c9912e 100%);">
            ${escapeHtml(template.ctaLabel)}
          </a>
        </td>
      </tr>
      <tr>
        <td style="padding:16px 26px 6px;">
          <p style="margin:0;font-size:16px;line-height:1.6;color:#e8dcc6;">${escapeHtml(template.help)}</p>
        </td>
      </tr>
      <tr>
        <td style="padding:8px 26px 24px;">
          <p style="margin:0;font-size:16px;line-height:1.6;color:#e8dcc6;">${escapeHtml(template.closing)}</p>
        </td>
      </tr>
      <tr>
        <td style="padding:18px 26px 24px;border-top:1px solid rgba(244,234,217,0.10);font-size:13px;line-height:1.7;color:#b5ab99;">
          <div>${escapeHtml(template.supportLabel)} <a href="mailto:info@calisto-events.com" style="color:#ffd28e;text-decoration:none;">info@calisto-events.com</a></div>
          <div style="margin-top:6px;">${escapeHtml(template.signature)}</div>
        </td>
      </tr>
    </table>
  </div>
  `;
}

function purchaseText(args: Readonly<{
  locale: Locale;
  eventTitle: string;
  accessCode: string;
  eventUrl: string;
}>): string {
  const template = getPurchaseTemplate(args.locale, args.eventTitle);
  return [
    template.title,
    "",
    template.intro,
    "",
    template.shareLabel,
    template.shareBody,
    args.accessCode,
    "",
    `${template.ctaLabel}: ${args.eventUrl}`,
    "",
    template.help,
    "",
    template.closing,
    "",
    `${template.supportLabel} info@calisto-events.com`,
    template.signature,
  ].join("\n");
}

export async function sendEventPurchaseEmail(args: Readonly<{
  to: string;
  locale: Locale;
  eventTitle: string;
  accessCode: string;
  eventUrl: string;
}>): Promise<SendEventPurchaseEmailResult> {
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
  const template = getPurchaseTemplate(args.locale, args.eventTitle);

  try {
    const { error } = await resend.emails.send({
      from: fromAddress,
      to: args.to,
      subject: template.subject,
      html: purchaseHtml(args),
      text: purchaseText(args),
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

/** The confirmation email links to the organizer's event dashboard on the canonical app origin. */
export function resolveEventAppOrigin(request?: Request): string {
  const canonical = process.env.NEXT_PUBLIC_APP_URL?.trim();
  if (canonical) return canonical.replace(/\/$/, "");

  const site = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (site) return site.replace(/\/$/, "");

  const vercel = process.env.VERCEL_URL?.trim();
  if (vercel) {
    const host = vercel.replace(/^https?:\/\//i, "").replace(/\/$/, "");
    return `https://${host}`;
  }

  if (request) {
    const host = request.headers.get("x-forwarded-host") ?? request.headers.get("host");
    const proto = request.headers.get("x-forwarded-proto") ?? "https";
    if (host) return `${proto}://${host}`;
  }

  return "https://calisto-events.com";
}

/**
 * Best-effort congratulations email shared by both fulfillment paths (Stripe webhook and the
 * success-page fulfill route). Callers gate on `!alreadyExisted` so it never re-sends; this
 * function swallows all failures (logging them) so it can never disrupt fulfillment.
 */
export async function sendPurchaseConfirmationFromSession(args: Readonly<{
  metadata: Record<string, string> | null | undefined;
  customerEmail?: string | null;
  eventId: string;
  request?: Request;
}>): Promise<void> {
  const meta = args.metadata ?? {};
  const recipient = meta.organizer_email ?? args.customerEmail ?? "";
  const eventTitle = meta.event_title ?? "";
  const accessCode = meta.access_code ?? "";
  const locale: Locale = isLocale(meta.locale ?? "") ? (meta.locale as Locale) : DEFAULT_LOCALE;

  if (!recipient || !eventTitle || !accessCode) return;

  const result = await sendEventPurchaseEmail({
    to: recipient,
    locale,
    eventTitle,
    accessCode,
    eventUrl: `${resolveEventAppOrigin(args.request)}/events/${args.eventId}`,
  });

  if (!result.ok && !result.skipped) {
    console.error("[event-purchase-email] confirmation email failed", {
      eventId: args.eventId,
      error: result.error,
    });
  }
}

export const __test = { getPurchaseTemplate, purchaseHtml, purchaseText };
