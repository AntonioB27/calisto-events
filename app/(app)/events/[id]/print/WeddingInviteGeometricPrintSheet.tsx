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

export type WeddingInviteGeometricPrintStrings = Readonly<{
  withJoyYouAre: string;
  invitedToWeddingOf: string;
  and: string;
  receptionToFollow: string;
}>;

type Props = Readonly<{
  paper: PrintPaperId;
  partnerA: string;
  partnerB: string;
  venue: string;
  venueLine2: string;
  extraLine: string;
  eventDateIso: string;
  locale: Locale;
  strings: WeddingInviteGeometricPrintStrings;
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

function venueLine2Blocks(raw: string): string[] {
  return raw
    .split(/\r?\n/)
    .map((s) => s.trim())
    .filter(Boolean);
}

function venueLines(
  visibility: InvitationFieldVisibility,
  venue: string,
  venueLine2: string,
): string[] {
  const lines: string[] = [];
  if (showInvitationField(visibility, "venue")) {
    const v1 = venue.trim();
    if (v1) lines.push(v1);
  }
  if (showInvitationField(visibility, "venue_line_2")) {
    lines.push(...venueLine2Blocks(venueLine2));
  }
  return lines;
}

export function WeddingInviteGeometricPrintSheet({
  paper,
  partnerA,
  partnerB,
  venue,
  venueLine2,
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
  const dateParts = weddingInviteDateParts(eventDateIso, locale);
  const timeToken = guessTimeTokenFromExtraLine(extraLine);
  const vl = venueLines(visibility, venue, venueLine2);

  const paperMod = paper === "letter" ? "print-invite-geometric--letter" : "print-invite-geometric--a4";
  const outerClass = `print-invite-outer print-invite-geometric ${paperMod}`;

  return (
    <>
      <PrintPageRules paper={paper} />
      <div className={outerClass}>
        <article className="print-invite-geometric__card" data-template="wedding-invite-geometric">
          <div className="print-invite-geometric__content">
            {show("invite_preamble") ? (
              <div className="print-invite-geometric__preamble">
                <p className="print-invite-geometric__preambleLine">{strings.withJoyYouAre}</p>
                <p className="print-invite-geometric__preambleLine">{strings.invitedToWeddingOf}</p>
              </div>
            ) : null}

            {show("partner_names") ? (
              <div className="print-invite-geometric__names">
                <h1 className="print-invite-geometric__nameGold" style={nameClamp}>
                  {a || " "}
                </h1>
                <p className="print-invite-geometric__and">{connectorChar(details.connectorSymbol, strings.and)}</p>
                <h1 className="print-invite-geometric__nameGold" style={nameClamp}>
                  {b || " "}
                </h1>
              </div>
            ) : null}

            {show("event_date") && dateParts ? (
              <div className="print-invite-geometric__dateArea">
                <p className="print-invite-geometric__weekday">{dateParts.weekday.toLowerCase()}</p>
                <div className="print-invite-geometric__dateRow">
                  <span className="print-invite-geometric__dateHairline" aria-hidden="true" />
                  <span className="print-invite-geometric__dateToken">{dateParts.month}</span>
                  <span className="print-invite-geometric__dateSep" aria-hidden="true">|</span>
                  <span className="print-invite-geometric__dateToken">{dateParts.day}</span>
                  {show("extra_line") && timeToken ? (
                    <>
                      <span className="print-invite-geometric__dateSep" aria-hidden="true">|</span>
                      <span className="print-invite-geometric__dateToken">{timeToken}</span>
                    </>
                  ) : null}
                  <span className="print-invite-geometric__dateHairline" aria-hidden="true" />
                </div>
              </div>
            ) : null}

            {vl.length > 0 ? (
              <div className="print-invite-geometric__venue">
                {vl.map((line, idx) => (
                  <p key={`${idx}-${line}`} className="print-invite-geometric__venueLine">
                    {line}
                  </p>
                ))}
              </div>
            ) : null}

            <WeddingInviteDetailsBlock
              details={details}
              strings={detailStrings}
              partnerAName={a}
              partnerBName={b}
              visibility={visibility}
            />

            {show("reception") ? (
              <p className="print-invite-geometric__reception">{strings.receptionToFollow}</p>
            ) : null}
          </div>
        </article>
      </div>
    </>
  );
}
