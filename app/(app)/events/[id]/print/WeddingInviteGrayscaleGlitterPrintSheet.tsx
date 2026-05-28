import type { CSSProperties } from "react";

import type { Locale } from "@/lib/i18n";
import type { PrintPaperId } from "@/lib/event-print/print-options";
import {
  type InvitationFieldVisibility,
  showInvitationField,
} from "@/lib/event-print/invitation-field-visibility";
import {
  weddingInviteGlitterTimeYearLine,
  weddingInviteOliveCeremonyDateCapsLine,
} from "@/lib/event-print/wedding-invite-date-parts";
import { connectorChar } from "@/lib/event-print/wedding-invite-details";

export type WeddingInviteGrayscaleGlitterPrintStrings = Readonly<{
  togetherWithFamilies: string;
  cordiallyInviteCaps: string;
  weddingWord: string;
  on: string;
  and: string;
}>;

type Props = Readonly<{
    paper: PrintPaperId;
    partnerA: string;
    partnerB: string;
    connectorSymbol: string;
    extraLine: string;
    eventDateIso: string;
    locale: Locale;
    strings: WeddingInviteGrayscaleGlitterPrintStrings;
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

function displayLower(raw: string): string {
  return raw.trim().toLowerCase();
}

export function WeddingInviteGrayscaleGlitterPrintSheet({
  paper,
  partnerA,
  partnerB,
  connectorSymbol,
  extraLine,
  eventDateIso,
  locale,
  strings,
  visibility,
}: Props) {
  const show = (key: Parameters<typeof showInvitationField>[1]) => showInvitationField(visibility, key);

  const a = partnerA.trim();
  const b = partnerB.trim();  const dateCaps = show("event_date") ? weddingInviteOliveCeremonyDateCapsLine(eventDateIso, locale) : null;
  const timeYearLine = show("extra_line")
    ? weddingInviteGlitterTimeYearLine(eventDateIso, locale, extraLine)
    : null;

  const paperMod =
    paper === "letter" ? "print-invite-glitter--letter" : "print-invite-glitter--a4";
  const outerClass = `print-invite-outer print-invite-glitter ${paperMod}`;

  return (
    <>
      <PrintPageRules paper={paper} />
      <div className={outerClass}>
        <article className="print-invite-glitter__card" data-template="wedding-invite-grayscale-glitter">
          <div className="print-invite-glitter__content">
{show("together_families") ? (
              <p className="print-invite-glitter__familiesScript">{strings.togetherWithFamilies}</p>
            ) : null}

            {show("partner_names") ? (
              <div className="print-invite-glitter__names">
                <h1 className="print-invite-glitter__nameCaps" style={nameClamp}>
                  {a.toUpperCase() || " "}
                </h1>
                <p className="print-invite-glitter__andCaps">
                  {connectorChar(connectorSymbol, strings.and)}
                </p>
                <h1 className="print-invite-glitter__nameCaps" style={nameClamp}>
                  {b.toUpperCase() || " "}
                </h1>
              </div>
            ) : null}

            {show("cordially_invite") ? (
              <p className="print-invite-glitter__cordiallyCaps">{strings.cordiallyInviteCaps}</p>
            ) : null}

            {show("wedding_title") ? (
              <p className="print-invite-glitter__weddingScript">{strings.weddingWord}</p>
            ) : null}

            {dateCaps ? <p className="print-invite-glitter__onCaps">{strings.on}</p> : null}

            {dateCaps ? <p className="print-invite-glitter__dateCaps">{dateCaps}</p> : null}

            {timeYearLine ? <p className="print-invite-glitter__timeYear">{timeYearLine}</p> : null}
          </div>
        </article>
      </div>
    </>
  );
}
