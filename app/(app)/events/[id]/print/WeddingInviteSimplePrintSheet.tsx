import type { CSSProperties } from "react";

import type { Locale } from "@/lib/i18n";
import type { PrintPaperId } from "@/lib/event-print/print-options";
import {
  guessTimeTokenFromExtraLine,
  isExtraLineSameAsFormattedDate,
  weddingInviteDateParts,
} from "@/lib/event-print/wedding-invite-date-parts";

export type WeddingInviteSimplePrintStrings = Readonly<{
  togetherWithFamilies: string;
  inviteCelebrationOn: string;
  receptionToFollow: string;
}>;

type WeddingInviteSimplePrintSheetProps = Readonly<{
  paper: PrintPaperId;
  partnerA: string;
  partnerB: string;
  venue: string;
  extraLine: string;
  eventDateIso: string;
  locale: Locale;
  strings: WeddingInviteSimplePrintStrings;
}>;

function PrintPageRules({ paper }: Readonly<{ paper: PrintPaperId }>) {
  const pageSize = paper === "letter" ? "letter" : "A4";
  return (
    <style
      dangerouslySetInnerHTML={{
        __html: `@media print { @page { size: ${pageSize} portrait; margin: 10mm; } }`,
      }}
    />
  );
}

function InviteWreath() {
  return (
    <svg className="print-invite-botanical__wreathSvg" viewBox="0 0 220 220" aria-hidden>
      <circle cx="110" cy="110" r="92" fill="none" stroke="#9eb89a" strokeWidth={1} opacity={0.9} />
      <circle cx="110" cy="110" r="86" fill="none" stroke="#c5d9bf" strokeWidth={0.55} opacity={0.55} />
      <path
        d="M 172 82 C 196 98 194 132 168 154"
        fill="none"
        stroke="#6d8a66"
        strokeWidth={1.35}
        strokeLinecap="round"
      />
      <path d="M 176 96 L 184 104 M 180 112 L 190 102" stroke="#6d8a66" strokeWidth={1} strokeLinecap="round" />
    </svg>
  );
}

const nameClamp: CSSProperties = {
  display: "-webkit-box",
  WebkitBoxOrient: "vertical",
  WebkitLineClamp: 3,
  overflow: "hidden",
};

export function WeddingInviteSimplePrintSheet({
  paper,
  partnerA,
  partnerB,
  venue,
  extraLine,
  eventDateIso,
  locale,
  strings,
}: WeddingInviteSimplePrintSheetProps) {
  const a = partnerA.trim();
  const b = partnerB.trim();
  const singleName = !b || b === a;
  const venueLine = venue.trim();
  const timeToken = guessTimeTokenFromExtraLine(extraLine);
  const dateParts = weddingInviteDateParts(eventDateIso, locale);
  const hideExtraAsDuplicate = isExtraLineSameAsFormattedDate(extraLine, eventDateIso, locale);
  const supplementalLine =
    extraLine.trim() && !hideExtraAsDuplicate && !timeToken ? extraLine.trim() : null;

  const outerClass =
    paper === "letter"
      ? "print-invite-outer print-invite-outer--letter print-invite-botanical"
      : "print-invite-outer print-invite-botanical";

  return (
    <>
      <PrintPageRules paper={paper} />
      <div className={outerClass}>
        <article
          className="print-invite-botanical__card"
          data-template="wedding-invite-simple"
          aria-label={strings.togetherWithFamilies}
        >
          <div className="print-invite-botanical__corners" aria-hidden>
            <span className="print-invite-botanical__corner print-invite-botanical__corner--tl" />
            <span className="print-invite-botanical__corner print-invite-botanical__corner--tr" />
            <span className="print-invite-botanical__corner print-invite-botanical__corner--bl" />
            <span className="print-invite-botanical__corner print-invite-botanical__corner--br" />
          </div>

          <p className="print-invite-botanical__eyebrow">{strings.togetherWithFamilies}</p>

          <div className="print-invite-botanical__wreathBlock">
            <InviteWreath />
            <div className="print-invite-botanical__names">
              {singleName ? (
                <h1 className="print-invite-botanical__script print-invite-botanical__namesLine" style={nameClamp}>
                  {a || "\u00a0"}
                </h1>
              ) : (
                <>
                  <h1 className="print-invite-botanical__script print-invite-botanical__namesLine" style={nameClamp}>
                    {a || "\u00a0"}
                  </h1>
                  <p className="print-invite-botanical__ampersand" aria-hidden>
                    &
                  </p>
                  <h1 className="print-invite-botanical__script print-invite-botanical__namesLine" style={nameClamp}>
                    {b}
                  </h1>
                </>
              )}
            </div>
          </div>

          <p className="print-invite-botanical__eyebrow print-invite-botanical__eyebrow--tight">{strings.inviteCelebrationOn}</p>

          {dateParts ? (
            <div className="print-invite-botanical__dateBlock">
              <p className="print-invite-botanical__dateMonth">{dateParts.month}</p>
              <div className="print-invite-botanical__dateRow">
                <div className="print-invite-botanical__dateSide">
                  <span className="print-invite-botanical__hairline" aria-hidden />
                  <span>{dateParts.weekday}</span>
                  <span className="print-invite-botanical__hairline" aria-hidden />
                </div>
                <p className="print-invite-botanical__dateNum">{dateParts.day}</p>
                <div className="print-invite-botanical__dateSide">
                  <span className="print-invite-botanical__hairline" aria-hidden />
                  <span>{timeToken ?? "\u00a0"}</span>
                  <span className="print-invite-botanical__hairline" aria-hidden />
                </div>
              </div>
              <p className="print-invite-botanical__dateYear">{dateParts.year}</p>
            </div>
          ) : null}

          {supplementalLine ? <p className="print-invite-botanical__supplement">{supplementalLine}</p> : null}

          {venueLine ? <p className="print-invite-botanical__venue">{venueLine}</p> : null}

          <p className="print-invite-botanical__script print-invite-botanical__reception">{strings.receptionToFollow}</p>
        </article>
      </div>
    </>
  );
}
