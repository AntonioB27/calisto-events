import type { CSSProperties } from "react";

import type { Locale } from "@/lib/i18n";
import type { PrintPaperId } from "@/lib/event-print/print-options";
import {
  type InvitationFieldVisibility,
  showInvitationField,
} from "@/lib/event-print/invitation-field-visibility";
import { weddingInviteWatercolorPipeDateLine } from "@/lib/event-print/wedding-invite-date-parts";
import { connectorChar, type WeddingInviteDetails, type WeddingInviteDetailsStrings } from "@/lib/event-print/wedding-invite-details";
import { WeddingInviteDetailsBlock } from "./WeddingInviteDetailsBlock";

export type WeddingInviteWatercolorCoastPrintStrings = Readonly<{
  pleaseJoinUs: string;
  forOurCeremony: string;
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
  strings: WeddingInviteWatercolorCoastPrintStrings;
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

function ceremonyCapsLines(
  visibility: InvitationFieldVisibility,
  venue: string,
  venueLine2: string,
  details: WeddingInviteDetails,
): string[] {
  const show = (key: Parameters<typeof showInvitationField>[1]) => showInvitationField(visibility, key);
  if (show("church") && details.churchAddress.trim()) {
    return venueLine2Blocks(details.churchAddress).map((line) => line.toUpperCase());
  }
  const lines: string[] = [];
  if (show("venue")) {
    const v1 = venue.trim();
    if (v1) lines.push(v1.toUpperCase());
  }
  if (show("venue_line_2")) {
    for (const line of venueLine2Blocks(venueLine2)) {
      lines.push(line.toUpperCase());
    }
  }
  return lines;
}

function ceremonyTimeLine(
  visibility: InvitationFieldVisibility,
  extraLine: string,
  details: WeddingInviteDetails,
): string | null {
  const show = (key: Parameters<typeof showInvitationField>[1]) => showInvitationField(visibility, key);
  const extra = extraLine.trim();
  if (show("extra_line") && extra) return extra;
  if (show("church") && details.churchTime.trim()) return details.churchTime.trim();
  return null;
}

export function WeddingInviteWatercolorCoastPrintSheet({
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
  const datePipe = show("event_date") ? weddingInviteWatercolorPipeDateLine(eventDateIso, locale) : null;
  const ceremonyLines = ceremonyCapsLines(visibility, venue, venueLine2, details);
  const ceremonyTime = ceremonyTimeLine(visibility, extraLine, details);

  const paperMod =
    paper === "letter" ? "print-invite-watercolor--letter" : "print-invite-watercolor--a4";
  const outerClass = `print-invite-outer print-invite-watercolor ${paperMod}`;

  return (
    <>
      <PrintPageRules paper={paper} />
      <div className={outerClass}>
        <article className="print-invite-watercolor__card" data-template="wedding-invite-watercolor-coast">
          <div className="print-invite-watercolor__content">
            {show("invite_preamble") ? (
              <div className="print-invite-watercolor__preamble">
                <p className="print-invite-watercolor__preambleLine">{strings.pleaseJoinUs}</p>
                <p className="print-invite-watercolor__preambleLine">{strings.forOurCeremony}</p>
              </div>
            ) : null}

            {show("partner_names") ? (
              <div className="print-invite-watercolor__names">
                <h1 className="print-invite-watercolor__nameCaps" style={nameClamp}>
                  {a.toUpperCase() || " "}
                </h1>
                <p className="print-invite-watercolor__and">{connectorChar(details.connectorSymbol, strings.and)}</p>
                <h1 className="print-invite-watercolor__nameCaps" style={nameClamp}>
                  {b.toUpperCase() || " "}
                </h1>
              </div>
            ) : null}

            {datePipe ? <p className="print-invite-watercolor__datePipe">{datePipe}</p> : null}

            {ceremonyLines.length > 0 || ceremonyTime ? (
              <div className="print-invite-watercolor__ceremony">
                {ceremonyLines.map((line, idx) => (
                  <p key={`${idx}-${line}`} className="print-invite-watercolor__ceremonyLine">
                    {line}
                  </p>
                ))}
                {ceremonyTime ? (
                  <p className="print-invite-watercolor__ceremonyLine">{ceremonyTime}</p>
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

            {show("reception") ? (
              <p className="print-invite-watercolor__reception">{strings.receptionToFollow}</p>
            ) : null}
          </div>
        </article>
      </div>
    </>
  );
}
