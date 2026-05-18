import type { CSSProperties } from "react";

import type { Locale } from "@/lib/i18n";
import type { PrintPaperId } from "@/lib/event-print/print-options";
import {
  weddingInviteGlitterYearSubtitle,
  weddingInviteOliveCeremonyDateCapsLine,
  weddingInviteOliveYearWordsEnLower,
} from "@/lib/event-print/wedding-invite-date-parts";
import {
  type InvitationFieldVisibility,
  showInvitationField,
} from "@/lib/event-print/invitation-field-visibility";
import { connectorChar, type WeddingInviteDetails, type WeddingInviteDetailsStrings } from "@/lib/event-print/wedding-invite-details";
import { WeddingInviteDetailsBlock } from "./WeddingInviteDetailsBlock";

export type WeddingInviteOliveGoldPrintStrings = Readonly<{
  withLove: string;
  cordiallyLine1: string;
  cordiallyLine2: string;
}>;

type Props = Readonly<{
    paper: PrintPaperId;
    partnerA: string;
    partnerB: string;
    extraLine: string;
    eventDateIso: string;
    locale: Locale;
    strings: WeddingInviteOliveGoldPrintStrings;
    details: WeddingInviteDetails;
    detailStrings: WeddingInviteDetailsStrings;
    visibility: InvitationFieldVisibility;
  }>;

function PrintPageRules({ paper }: Readonly<{ paper: PrintPaperId }>) {
  const pageDecl =
    paper === "letter"
      ? "@page { size: letter portrait; margin: 0; }"
      : "@page { size: 210mm 297mm portrait; margin: 0; }";
  return (
    <style
      dangerouslySetInnerHTML={{
        __html: `@media print { ${pageDecl} }`,
      }}
    />
  );
}

const nameClamp: CSSProperties = {
  display: "-webkit-box",
  WebkitBoxOrient: "vertical",
  WebkitLineClamp: 2,
  overflow: "hidden",
};

/** First token → line 1, remainder → line 2 (stationery-style stacked surnames). */
function splitPartnerIntoTwoLines(raw: string): readonly [string, string] {
  const t = raw.trim().replace(/\s+/g, " ");
  if (!t) return [" ", ""] as const;
  const parts = t.split(" ");
  if (parts.length === 1) return [parts[0]!.toUpperCase(), ""] as const;
  const line1 = parts[0]!.toUpperCase();
  const line2 = parts.slice(1).join(" ").toUpperCase();
  return [line1, line2] as const;
}

export function WeddingInviteOliveGoldPrintSheet({
  paper,
  partnerA,
  partnerB,
  extraLine,
  eventDateIso,
  locale,
  strings,
  details,
  detailStrings,
  visibility,
}: Props) {
  const show = (key: Parameters<typeof showInvitationField>[1]) => showInvitationField(visibility, key);
  const [a1, a2] = splitPartnerIntoTwoLines(partnerA);
  const [b1, b2] = splitPartnerIntoTwoLines(partnerB);
  const dateCaps = show("event_date") ? weddingInviteOliveCeremonyDateCapsLine(eventDateIso, locale) : null;
  const yearLower = show("event_date")
    ? locale === "en"
      ? weddingInviteOliveYearWordsEnLower(eventDateIso)
      : weddingInviteGlitterYearSubtitle(eventDateIso, locale)
    : null;
  const timeLower = show("extra_line") ? extraLine.trim().toLowerCase() : "";
  const paperMod =
    paper === "letter" ? "print-invite-olive--letter" : "print-invite-olive--a4";
  const outerClass = `print-invite-outer print-invite-olive ${paperMod}`;

  return (
    <>
      <PrintPageRules paper={paper} />
      <div className={outerClass}>
        <article className="print-invite-olive__card" data-template="wedding-invite-olive-gold-frame">
          <div className="print-invite-olive__content">
{show("invite_preamble") ? (
              <p className="print-invite-olive__love">{strings.withLove}</p>
            ) : null}

            {show("cordially_invite") ? (
              <>
                <p className="print-invite-olive__leadCaps">{strings.cordiallyLine1}</p>
                <p className="print-invite-olive__leadCaps">{strings.cordiallyLine2}</p>
              </>
            ) : null}

            {show("partner_names") ? (
            <div className="print-invite-olive__namesWrap">
              <div className="print-invite-olive__nameBlock">
                <p className="print-invite-olive__nameLine" style={nameClamp}>
                  {a1 || " "}
                </p>
                {a2 ? (
                  <p className="print-invite-olive__nameLine" style={nameClamp}>
                    {a2}
                  </p>
                ) : null}
              </div>

              <p className="print-invite-olive__ampersand">
                {connectorChar(details.connectorSymbol, "&")}
              </p>

              <div className="print-invite-olive__nameBlock">
                <p className="print-invite-olive__nameLine" style={nameClamp}>
                  {b1 || " "}
                </p>
                {b2 ? (
                  <p className="print-invite-olive__nameLine" style={nameClamp}>
                    {b2}
                  </p>
                ) : null}
              </div>
            </div>
            ) : null}

            <div className="print-invite-olive__detailStack">
              {dateCaps ? <p className="print-invite-olive__dateCaps">{dateCaps}</p> : null}
              {yearLower ? (
                <p className="print-invite-olive__detailLower">{yearLower}</p>
              ) : null}
              {timeLower ? (
                <p className="print-invite-olive__detailLower">{timeLower}</p>
              ) : null}
            </div>

            <WeddingInviteDetailsBlock
              details={details}
              strings={detailStrings}
              partnerAName={partnerA}
              partnerBName={partnerB}
              visibility={visibility}
            />
          </div>
        </article>
      </div>
    </>
  );
}
