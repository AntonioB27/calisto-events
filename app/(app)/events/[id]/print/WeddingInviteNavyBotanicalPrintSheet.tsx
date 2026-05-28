import type { CSSProperties } from "react";

import type { Locale } from "@/lib/i18n";
import type { PrintPaperId } from "@/lib/event-print/print-options";
import {
  isExtraLineSameAsFormattedDate,
  weddingInviteDateParts,
} from "@/lib/event-print/wedding-invite-date-parts";
import {
  type InvitationFieldVisibility,
  showInvitationField,
} from "@/lib/event-print/invitation-field-visibility";
import { connectorChar, type WeddingInviteDetails, type WeddingInviteDetailsStrings } from "@/lib/event-print/wedding-invite-details";
import { WeddingInviteDetailsBlock } from "./WeddingInviteDetailsBlock";

export type WeddingInviteNavyBotanicalPrintStrings = Readonly<{
  togetherWithOurFamilies: string;
  honorUniteMarriage: string;
  and: string;
}>;

type Props = Readonly<{
    paper: PrintPaperId;
    partnerA: string;
    partnerB: string;
    extraLine: string;
    eventDateIso: string;
    locale: Locale;
    strings: WeddingInviteNavyBotanicalPrintStrings;
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

export function WeddingInviteNavyBotanicalPrintSheet({
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
  const a = partnerA.trim();
  const b = partnerB.trim();
  const extra = extraLine.trim();
  const dateParts = weddingInviteDateParts(eventDateIso, locale);
  const skipExtraAsTime =
    extra && isExtraLineSameAsFormattedDate(extraLine, eventDateIso, locale);

  const paperMod =
    paper === "letter" ? "print-invite-navybotanical--letter" : "print-invite-navybotanical--a4";
  const outerClass = `print-invite-outer print-invite-navybotanical ${paperMod}`;

  const datePrimary =
    dateParts ?
      `${dateParts.weekday}, ${dateParts.month} ${dateParts.day}, ${dateParts.year}`
    : null;

  return (
    <>
      <PrintPageRules paper={paper} />
      <div className={outerClass}>
        <article className="print-invite-navybotanical__card" data-template="wedding-invite-navy-botanical">
          <div className="print-invite-navybotanical__content">
<header className="print-invite-navybotanical__masthead">
              {show("together_families") ? (
                <p className="print-invite-navybotanical__archLine">{strings.togetherWithOurFamilies}</p>
              ) : null}
              {show("invite_preamble") ? (
                <p className="print-invite-navybotanical__requestLine">{strings.honorUniteMarriage}</p>
              ) : null}
            </header>

            {show("partner_names") ? (
              <div className="print-invite-navybotanical__names">
                <h1 className="print-invite-navybotanical__nameScript" style={nameClamp}>
                  {a || " "}
                </h1>
                <p className="print-invite-navybotanical__andScript">{connectorChar(details.connectorSymbol, strings.and)}</p>
                <h1 className="print-invite-navybotanical__nameScript" style={nameClamp}>
                  {b || " "}
                </h1>
              </div>
            ) : null}

            {show("event_date") && dateParts ? (
              <div className="print-invite-navybotanical__dateBlock">
                <p className="print-invite-navybotanical__dateCaps">{datePrimary}</p>
                {show("extra_line") && extra && !skipExtraAsTime ? (
                  <p className="print-invite-navybotanical__timeProse">{extra}</p>
                ) : null}
              </div>
            ) : null}

            <WeddingInviteDetailsBlock
              details={details}
              strings={detailStrings}
              partnerAName={a}
              partnerBName={b}
              visibility={visibility}
            />
          </div>
        </article>
      </div>
    </>
  );
}
