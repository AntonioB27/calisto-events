import type { CSSProperties } from "react";

import type { Locale } from "@/lib/i18n";
import type { PrintPaperId } from "@/lib/event-print/print-options";
import {
  weddingInviteGoldArchExtraCapsLine,
  weddingInviteGoldArchPrimaryDateLine,
} from "@/lib/event-print/wedding-invite-date-parts";
import {
  type InvitationFieldVisibility,
  showInvitationField,
} from "@/lib/event-print/invitation-field-visibility";
import { connectorChar, type WeddingInviteDetails, type WeddingInviteDetailsStrings } from "@/lib/event-print/wedding-invite-details";
import { WeddingInviteDetailsBlock } from "./WeddingInviteDetailsBlock";

export type WeddingInviteGoldArchFloralPrintStrings = Readonly<{
  headline: string;
  and: string;
}>;

type Props = Readonly<{
    paper: PrintPaperId;
    partnerA: string;
    partnerB: string;
    extraLine: string;
    eventDateIso: string;
    locale: Locale;
    strings: WeddingInviteGoldArchFloralPrintStrings;
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

/** First token → line 1, remainder → line 2 (stationery-style stacked names). */
function splitPartnerIntoTwoLines(raw: string): readonly [string, string] {
  const t = raw.trim().replace(/\s+/g, " ");
  if (!t) return [" ", ""] as const;
  const parts = t.split(" ");
  if (parts.length === 1) return [parts[0]!.toUpperCase(), ""] as const;
  const line1 = parts[0]!.toUpperCase();
  const line2 = parts.slice(1).join(" ").toUpperCase();
  return [line1, line2] as const;
}

function partnerInitial(raw: string): string {
  const t = raw.trim();
  if (!t) return "";
  const chars = [...t];
  const ch = chars.find((c) => /\p{L}/u.test(c));
  return ch ? ch.toUpperCase() : "";
}

export function WeddingInviteGoldArchFloralPrintSheet({
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
  const dateLine = show("event_date") ? weddingInviteGoldArchPrimaryDateLine(eventDateIso, locale) : null;
  const timeCaps = show("extra_line") ? weddingInviteGoldArchExtraCapsLine(extraLine) : null;

  const [a1, a2] = splitPartnerIntoTwoLines(partnerA);
  const [b1, b2] = splitPartnerIntoTwoLines(partnerB);

  const ia = partnerInitial(partnerA);
  const ib = partnerInitial(partnerB);

  const paperMod = paper === "letter" ? "print-invite-goldarch--letter" : "print-invite-goldarch--a4";
  const outerClass = `print-invite-outer print-invite-goldarch ${paperMod}`;

  return (
    <>
      <PrintPageRules paper={paper} />
      <div className={outerClass}>
        <article className="print-invite-goldarch__card" data-template="wedding-invite-gold-arch-floral">
          {show("partner_names") && ia ? (
            <span className="print-invite-goldarch__initial print-invite-goldarch__initial--tl">{ia}</span>
          ) : null}
          {show("partner_names") && ib ? (
            <span className="print-invite-goldarch__initial print-invite-goldarch__initial--tr">{ib}</span>
          ) : null}
          <div className="print-invite-goldarch__content">
            <header className="print-invite-goldarch__masthead">
              {show("cordially_invite") ? (
                <p className="print-invite-goldarch__headline">{strings.headline}</p>
              ) : null}
            </header>

            {show("partner_names") ? (
              <>
            <div className="print-invite-goldarch__namesBlock">
              <h1 className="print-invite-goldarch__nameSans" style={nameClamp}>
                {a1 || " "}
              </h1>
              {a2 ? (
                <h1 className="print-invite-goldarch__nameSans" style={nameClamp}>
                  {a2}
                </h1>
              ) : null}
            </div>

            <p className="print-invite-goldarch__andScript">{connectorChar(details.connectorSymbol, strings.and)}</p>

            <div className="print-invite-goldarch__namesBlock">
              <h1 className="print-invite-goldarch__nameSans" style={nameClamp}>
                {b1 || " "}
              </h1>
              {b2 ? (
                <h1 className="print-invite-goldarch__nameSans" style={nameClamp}>
                  {b2}
                </h1>
              ) : null}
            </div>
              </>
            ) : null}

            <div className="print-invite-goldarch__details">
              {dateLine ? <p className="print-invite-goldarch__detail">{dateLine}</p> : null}
              {timeCaps ? <p className="print-invite-goldarch__detail">{timeCaps}</p> : null}
              <WeddingInviteDetailsBlock
                details={details}
                strings={detailStrings}
                partnerAName={partnerA}
                partnerBName={partnerB}
                visibility={visibility}
              />
            </div>
          </div>
        </article>
      </div>
    </>
  );
}
