import type { CSSProperties } from "react";

import type { Locale } from "@/lib/i18n";
import type { PrintPaperId } from "@/lib/event-print/print-options";
import { weddingInviteGlitterCapsDateRow } from "@/lib/event-print/wedding-invite-date-parts";
import {
  type InvitationFieldVisibility,
  showInvitationField,
} from "@/lib/event-print/invitation-field-visibility";
import { connectorChar, type WeddingInviteDetails, type WeddingInviteDetailsStrings } from "@/lib/event-print/wedding-invite-details";
import { WeddingInviteDetailsBlock } from "./WeddingInviteDetailsBlock";

export type WeddingInviteTerracottaPillPrintStrings = Readonly<{
  pleaseJoinUsFor: string;
  theWeddingOf: string;
  and: string;
}>;

type Props = Readonly<{
    paper: PrintPaperId;
    partnerA: string;
    partnerB: string;
    extraLine: string;
    eventDateIso: string;
    locale: Locale;
    strings: WeddingInviteTerracottaPillPrintStrings;
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

/** First token → line 1, remainder → line 2 (mirrors stationery-style stacked names). */
function splitPartnerIntoTwoLines(raw: string): readonly [string, string] {
  const t = raw.trim().replace(/\s+/g, " ");
  if (!t) return [" ", ""] as const;
  const parts = t.split(" ");
  if (parts.length === 1) return [parts[0]!.toUpperCase(), ""] as const;
  const line1 = parts[0]!.toUpperCase();
  const line2 = parts.slice(1).join(" ").toUpperCase();
  return [line1, line2] as const;
}

export function WeddingInviteTerracottaPillPrintSheet({
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
  const show = (key: Parameters<typeof showInvitationField>[1]) => showInvitationField(visibility, key);  const dateCaps = show("event_date") ? weddingInviteGlitterCapsDateRow(eventDateIso, locale, extraLine) : null;

  const [a1, a2] = splitPartnerIntoTwoLines(partnerA);
  const [b1, b2] = splitPartnerIntoTwoLines(partnerB);

  const paperMod = paper === "letter" ? "print-invite-terra--letter" : "print-invite-terra--a4";
  const outerClass = `print-invite-outer print-invite-terra ${paperMod}`;

  return (
    <>
      <PrintPageRules paper={paper} />
      <div className={outerClass}>
        <article className="print-invite-terra__card" data-template="wedding-invite-terra-pill">
          <div className="print-invite-terra__content">
<header className="print-invite-terra__masthead">
              {show("invite_preamble") ? (
                <p className="print-invite-terra__archTop">{strings.pleaseJoinUsFor}</p>
              ) : null}
              {show("wedding_title") ? (
                <p className="print-invite-terra__subLine">{strings.theWeddingOf}</p>
              ) : null}
            </header>

            {show("partner_names") ? (
              <>
                <div className="print-invite-terra__namesBlock">
                  <h1 className="print-invite-terra__nameSerif" style={nameClamp}>
                    {a1 || " "}
                  </h1>
                  {a2 ? (
                    <h1 className="print-invite-terra__nameSerif" style={nameClamp}>
                      {a2}
                    </h1>
                  ) : null}
                </div>

                <div className="print-invite-terra__andRow">
                  <span className="print-invite-terra__andHair" aria-hidden />
                  <span className="print-invite-terra__andScript">{connectorChar(details.connectorSymbol, strings.and)}</span>
                  <span className="print-invite-terra__andHair" aria-hidden />
                </div>

                <div className="print-invite-terra__namesBlock">
                  <h1 className="print-invite-terra__nameSerif" style={nameClamp}>
                    {b1 || " "}
                  </h1>
                  {b2 ? (
                    <h1 className="print-invite-terra__nameSerif" style={nameClamp}>
                      {b2}
                    </h1>
                  ) : null}
                </div>
              </>
            ) : null}

            {dateCaps ? <p className="print-invite-terra__dateCaps">{dateCaps}</p> : null}

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
