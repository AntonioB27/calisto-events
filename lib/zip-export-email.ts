import { Resend } from "resend";

import { isLocale, type Locale } from "@/lib/i18n";

export type ZipExportEmailKind = "started" | "ready" | "failed";

type Copy = { subject: string; heading: string; body: string[]; button: string; note: string };

const COPY: Record<Locale, Record<ZipExportEmailKind, Copy> & { footer: string }> = {
  en: {
    started: {
      subject: "We're packing your album: {title}",
      heading: "Packing has started",
      body: [
        "We're packing every memory from {title} into one ZIP file right now, in full quality.",
        "It usually takes a few minutes. When it's ready, we'll send you another e-mail with the download button.",
      ],
      button: "Follow the progress",
      note: "You don't need to do anything or keep the app open.",
    },
    ready: {
      subject: "Your album is ready: {title}",
      heading: "Your album is ready",
      body: ["The ZIP with every memory from {title} is waiting for you. The link is valid for 24 hours."],
      button: "Download the album",
      note: "After that we delete the ZIP. Your album stays in Calisto.",
    },
    failed: {
      subject: "Packing your album got stuck: {title}",
      heading: "Packing got stuck",
      body: ["We couldn't finish the ZIP for {title}. Your photos and videos are safe, nothing is lost."],
      button: "See what happened",
      note: "You can try again from that page, with or without videos.",
    },
    footer: "You're getting this because you started an album download in Calisto.",
  },
  hr: {
    started: {
      subject: "Pakiramo vaš album: {title}",
      heading: "Pakiranje je krenulo",
      body: [
        "Upravo pakiramo sve uspomene iz albuma {title} u jednu ZIP datoteku, u punoj kvaliteti.",
        "Obično traje nekoliko minuta. Kad bude spremno, poslat ćemo vam još jednu poruku s gumbom za preuzimanje.",
      ],
      button: "Prati napredak",
      note: "Ne trebate ništa raditi niti držati aplikaciju otvorenom.",
    },
    ready: {
      subject: "Vaš album je spreman: {title}",
      heading: "Vaš album je spreman",
      body: ["ZIP sa svim uspomenama iz albuma {title} čeka vas. Poveznica vrijedi 24 sata."],
      button: "Preuzmi album",
      note: "Nakon toga ZIP brišemo, a album ostaje u Calistu.",
    },
    failed: {
      subject: "Pakiranje albuma je zapelo: {title}",
      heading: "Pakiranje je zapelo",
      body: ["Nismo uspjeli dovršiti ZIP za {title}. Vaše fotografije i videi su sigurni, ništa nije izgubljeno."],
      button: "Pogledaj što se dogodilo",
      note: "Na toj stranici možete pokušati ponovno, s videima ili bez njih.",
    },
    footer: "Ovu poruku primate jer ste pokrenuli preuzimanje albuma u Calistu.",
  },
  de: {
    started: {
      subject: "Wir packen dein Album: {title}",
      heading: "Das Packen hat begonnen",
      body: [
        "Wir packen gerade alle Erinnerungen aus {title} in eine ZIP-Datei, in voller Qualität.",
        "Das dauert meist ein paar Minuten. Sobald es fertig ist, schicken wir dir eine weitere E-Mail mit dem Download-Button.",
      ],
      button: "Fortschritt ansehen",
      note: "Du musst nichts tun und die App nicht offen lassen.",
    },
    ready: {
      subject: "Dein Album ist bereit: {title}",
      heading: "Dein Album ist bereit",
      body: ["Die ZIP-Datei mit allen Erinnerungen aus {title} wartet auf dich. Der Link ist 24 Stunden gültig."],
      button: "Album herunterladen",
      note: "Danach löschen wir die ZIP-Datei. Dein Album bleibt in Calisto.",
    },
    failed: {
      subject: "Das Packen deines Albums ist hängen geblieben: {title}",
      heading: "Das Packen ist hängen geblieben",
      body: ["Wir konnten die ZIP-Datei für {title} nicht fertigstellen. Deine Fotos und Videos sind sicher, nichts ist verloren."],
      button: "Ansehen, was passiert ist",
      note: "Dort kannst du es erneut versuchen, mit oder ohne Videos.",
    },
    footer: "Du bekommst diese E-Mail, weil du in Calisto einen Album-Download gestartet hast.",
  },
};

export function zipEmailLocale(raw: string | null | undefined): Locale {
  return raw && isLocale(raw) ? raw : "en";
}

/** Subject and HTML for one ZIP e-mail. Pure, so it can be tested without sending anything. */
export function buildZipExportEmail(args: {
  kind: ZipExportEmailKind;
  locale: Locale;
  eventTitle: string;
  statusUrl: string;
  photoUrls: string[];
}): { subject: string; html: string } {
  const dict = COPY[args.locale];
  const c = dict[args.kind];
  const fill = (s: string) => s.split("{title}").join(args.eventTitle);
  const fillHtml = (s: string) => escapeHtml(s).split(escapeHtml("{title}")).join(`<strong>${escapeHtml(args.eventTitle)}</strong>`);

  const photos = args.photoUrls.slice(0, 3);
  const photoRow = photos.length
    ? `<tr><td style="padding:18px 28px 0"><table role="presentation" cellpadding="0" cellspacing="0"><tr>${photos
        .map(
          (src) =>
            `<td style="padding-right:8px"><img src="${escapeAttr(src)}" width="96" height="96" alt="" style="display:block;width:96px;height:96px;object-fit:cover;border:4px solid #fffaf2;border-radius:8px"></td>`,
        )
        .join("")}</tr></table></td></tr>`
    : "";

  const html = `<!doctype html><html lang="${args.locale}"><body style="margin:0;padding:24px 12px;background:#f4f1ec;font-family:Helvetica,Arial,sans-serif;color:#221509">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td align="center">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:480px;background:#fbf6ec;border:1px solid #eadfc9;border-radius:22px">
<tr><td style="padding:22px 28px 0;font-family:Georgia,serif;font-style:italic;font-size:24px">Calisto<span style="color:#c5922a">.</span></td></tr>
${photoRow}
<tr><td style="padding:18px 28px 0;font-family:Georgia,serif;font-size:28px;line-height:1.1">${escapeHtml(c.heading)}</td></tr>
${c.body.map((p) => `<tr><td style="padding:12px 28px 0;font-size:16px;line-height:1.55;color:#4a3d2e">${fillHtml(p)}</td></tr>`).join("")}
<tr><td style="padding:22px 28px 0"><a href="${escapeAttr(args.statusUrl)}" style="display:block;padding:16px 20px;border-radius:16px;background:#f0b34b;color:#1b1208;font-size:17px;font-weight:700;text-align:center;text-decoration:none">${escapeHtml(c.button)}</a></td></tr>
<tr><td style="padding:14px 28px 26px;font-size:13px;line-height:1.5;color:#7a6d5c;text-align:center">${escapeHtml(c.note)}</td></tr>
</table>
<p style="max-width:480px;margin:16px auto 0;font-size:12px;line-height:1.5;color:#8a8378;text-align:center">${escapeHtml(dict.footer)}</p>
</td></tr></table></body></html>`;

  return { subject: fill(c.subject), html };
}

export async function sendZipExportEmail(args: {
  kind: ZipExportEmailKind;
  to: string;
  locale: Locale;
  eventTitle: string;
  statusUrl: string;
  photoUrls: string[];
}): Promise<{ ok: true } | { ok: false; error: string }> {
  const key = process.env.RESEND_API_KEY;
  if (!key) return { ok: false, error: "RESEND_API_KEY missing" };

  const { subject, html } = buildZipExportEmail(args);
  const from = process.env.RESEND_FROM ?? "Calisto <onboarding@resend.dev>";
  const { error } = await new Resend(key).emails.send({ from, to: args.to, subject, html });
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

function escapeHtml(s: string): string {
  return s.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");
}

function escapeAttr(s: string): string {
  return escapeHtml(s).replaceAll('"', "&quot;");
}
