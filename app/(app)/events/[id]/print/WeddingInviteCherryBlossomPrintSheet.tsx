import type { CSSProperties } from "react";

import type { Locale } from "@/lib/i18n";
import type { PrintPaperId } from "@/lib/event-print/print-options";
import { weddingInviteCherryLongDateCapsLine } from "@/lib/event-print/wedding-invite-date-parts";
import {
  type InvitationFieldVisibility,
  showInvitationField,
} from "@/lib/event-print/invitation-field-visibility";
import { connectorChar, type WeddingInviteDetails, type WeddingInviteDetailsStrings } from "@/lib/event-print/wedding-invite-details";
import { WeddingInviteDetailsBlock } from "./WeddingInviteDetailsBlock";

export type WeddingInviteCherryBlossomPrintStrings = Readonly<{
  preambleStart: string;
  preambleScript: string;
  preambleMid: string;
  preambleEnd: string;
  and: string;
}>;

type Props = Readonly<{
    paper: PrintPaperId;
    partnerA: string;
    partnerB: string;
    extraLine: string;
    eventDateIso: string;
    locale: Locale;
    strings: WeddingInviteCherryBlossomPrintStrings;
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

export function WeddingInviteCherryBlossomPrintSheet({
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
  const a = partnerA.trim().toUpperCase();
  const b = partnerB.trim().toUpperCase();
  const dateLine = show("event_date") ? weddingInviteCherryLongDateCapsLine(eventDateIso, locale) : null;
  const extra = extraLine.trim();
  const paperMod =
    paper === "letter" ? "print-invite-cherry--letter" : "print-invite-cherry--a4";
  const outerClass = `print-invite-outer print-invite-cherry ${paperMod}`;

  return (
    <>
      <PrintPageRules paper={paper} />
      <div className={outerClass}>
        <article className="print-invite-cherry__card" data-template="wedding-invite-cherry-blossom">
          {show("invite_preamble") ? (
            <div className="print-invite-cherry__preamble">
                <p className="print-invite-cherry__preambleLine">{strings.preambleStart}</p>
                <p className="print-invite-cherry__preambleScript">{strings.preambleScript}</p>
                <p className="print-invite-cherry__preambleLine">{strings.preambleMid}</p>
                <p className="print-invite-cherry__preambleLine">{strings.preambleEnd}</p>
              </div>
          ) : null}

          <div className="print-invite-cherry__content">
            {show("partner_names") ? (
              <>
                <h1 className="print-invite-cherry__name" style={nameClamp}>
                  {a || " "}
                </h1>
                <p className="print-invite-cherry__andScript">{connectorChar(details.connectorSymbol, strings.and)}</p>
                <h1 className="print-invite-cherry__name" style={nameClamp}>
                  {b || " "}
                </h1>
              </>
            ) : null}

            <div className="print-invite-cherry__details">
              {dateLine ? (
                <p className="print-invite-cherry__dateCaps">{dateLine}</p>
              ) : null}
              <WeddingInviteDetailsBlock
                details={details}
                strings={detailStrings}
                partnerAName={a}
                partnerBName={b}
                visibility={visibility}
              />
            </div>
          </div>
        </article>
      </div>
    </>
  );
}
