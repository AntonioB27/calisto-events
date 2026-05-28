import type { CSSProperties } from "react";

import type { Locale } from "@/lib/i18n";
import type { PrintPaperId } from "@/lib/event-print/print-options";
import {
  guessTimeTokenFromExtraLine,
  weddingInviteDateParts,
} from "@/lib/event-print/wedding-invite-date-parts";
import {
  type InvitationFieldVisibility,
  showInvitationField,
} from "@/lib/event-print/invitation-field-visibility";
import { connectorChar, type WeddingInviteDetails, type WeddingInviteDetailsStrings } from "@/lib/event-print/wedding-invite-details";
import { WeddingInviteDetailsBlock } from "./WeddingInviteDetailsBlock";

export type WeddingInviteBlueFloraPrintStrings = Readonly<{
  withJoyYouAre: string;
  invitedToWeddingOf: string;
  and: string;
}>;

type Props = Readonly<{
  paper: PrintPaperId;
  partnerA: string;
  partnerB: string;
  extraLine: string;
  eventDateIso: string;
  locale: Locale;
  strings: WeddingInviteBlueFloraPrintStrings;
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

export function WeddingInviteBlueFloraPrintSheet({
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
  const b = partnerB.trim();  const dateParts = weddingInviteDateParts(eventDateIso, locale);
  const timeToken = guessTimeTokenFromExtraLine(extraLine);

  const paperMod = paper === "letter" ? "print-invite-bluefloral--letter" : "print-invite-bluefloral--a4";
  const outerClass = `print-invite-outer print-invite-bluefloral ${paperMod}`;

  return (
    <>
      <PrintPageRules paper={paper} />
      <div className={outerClass}>
        <article className="print-invite-bluefloral__card" data-template="wedding-invite-blue-floral">
          <div className="print-invite-bluefloral__content">
            {show("invite_preamble") ? (
              <div className="print-invite-bluefloral__preamble">
                <p className="print-invite-bluefloral__preambleLine">{strings.withJoyYouAre}</p>
                <p className="print-invite-bluefloral__preambleLine">{strings.invitedToWeddingOf}</p>
              </div>
            ) : null}

            {show("partner_names") ? (
              <div className="print-invite-bluefloral__names">
                <h1 className="print-invite-bluefloral__nameGold" style={nameClamp}>
                  {a || " "}
                </h1>
                <p className="print-invite-bluefloral__and">{connectorChar(details.connectorSymbol, strings.and)}</p>
                <h1 className="print-invite-bluefloral__nameGold" style={nameClamp}>
                  {b || " "}
                </h1>
              </div>
            ) : null}

            {show("event_date") && dateParts ? (
              <div className="print-invite-bluefloral__dateArea">
                <p className="print-invite-bluefloral__weekday">{dateParts.weekday.toLowerCase()}</p>
                <div className="print-invite-bluefloral__dateRow">
                  <span className="print-invite-bluefloral__dateHairline" aria-hidden="true" />
                  <span className="print-invite-bluefloral__dateToken">{dateParts.month}</span>
                  <span className="print-invite-bluefloral__dateSep" aria-hidden="true">|</span>
                  <span className="print-invite-bluefloral__dateToken">{dateParts.day}</span>
                  {show("extra_line") && timeToken ? (
                    <>
                      <span className="print-invite-bluefloral__dateSep" aria-hidden="true">|</span>
                      <span className="print-invite-bluefloral__dateToken">{timeToken}</span>
                    </>
                  ) : null}
                  <span className="print-invite-bluefloral__dateHairline" aria-hidden="true" />
                </div>
              </div>
            ) : null}

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
